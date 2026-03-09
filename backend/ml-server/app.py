from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import PyPDF2
import re
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# --- 1. DATA & ALIAS CONFIGURATION ---

# Updated with your specific description keywords
SKILL_ALIASES = {
    # Existing stacks
    "mern": ["mongodb", "express", "react", "node", "javascript", "rest api", "jwt"],
    "mern stack": ["mongodb", "express", "react", "node", "javascript", "rest api", "jwt"],
    "mean": ["mongodb", "express", "angular", "node", "typescript", "rest api"],
    "lamp": ["linux", "apache", "mysql", "php", "html", "css", "javascript"],
    "lemp": ["linux", "nginx", "mysql", "php", "rest api"],
    "jamstack": ["javascript", "apis", "markup", "static site generation", "cdn"],
    "flutter": ["flutter", "dart", "firebase", "rest api", "mobile ui"],
    "react native": ["react native", "javascript", "redux", "mobile development", "rest api"],
    "django": ["python", "django", "postgresql", "rest api", "html", "css"],
    "spring boot": ["java", "spring boot", "hibernate", "rest api", "mysql"],
    "devops": ["docker", "kubernetes", "jenkins", "git", "ci/cd", "linux", "terraform"],
    "data science": ["python", "pandas", "numpy", "scikit-learn", "matplotlib", "seaborn", "machine learning"],
    "ai/ml": ["python", "tensorflow", "pytorch", "keras", "scikit-learn", "deep learning", "nlp"],
    "big data": ["hadoop", "spark", "kafka", "hdfs", "hive", "pig"],
    "aws cloud": ["aws ec2", "s3", "lambda", "rds", "cloudformation", "iam"],
    "gcp cloud": ["compute engine", "app engine", "bigquery", "cloud functions", "iam"],
    "azure cloud": ["azure vms", "azure functions", "azure sql", "devops", "active directory"],
    "cybersecurity": ["network security", "penetration testing", "encryption", "firewalls", "siem"],
    "ios dev": ["swift", "objective-c", "xcode", "cocoa touch", "core data"],
    "android dev": ["kotlin", "java", "android studio", "jetpack compose", "room db"],
    "ui/ux": ["figma", "sketch", "adobe xd", "prototyping", "wireframing", "user research"],
    "blockchain": ["solidity", "ethereum", "smart contracts", "web3.js", "truffle", "hardhat"],
    "iot": ["arduino", "raspberry pi", "mqtt", "sensors", "embedded c"],
    "salesforce": ["apex", "lightning", "visualforce", "soql", "salesforce admin"],
    "sap": ["sap hana", "abap", "fiori", "sap modules", "sap bi"],
    "wordpress": ["php", "mysql", "html", "css", "javascript", "plugins development"],
    "magento": ["php", "mysql", "html", "css", "magento modules", "e-commerce"],
    "shopify": ["liquid", "html", "css", "javascript", "shopify apis"],
    
    # React/JS frameworks aliases
    "react.js": ["react"],
    "reactjs": ["react"],
    "react": ["react"],
    "react native": ["react native"],
    "angularjs": ["angular"],
    "angular": ["angular"],
    "vuejs": ["vue.js", "vue"],
    "vue": ["vue.js", "vue"],
    "nextjs": ["next.js", "react"],
    "nuxtjs": ["nuxt.js", "vue.js"],
    "svelte": ["svelte"],
    
    # Backend / API aliases
    "node.js": ["node"],
    "node": ["node"],
    "express.js": ["express"],
    "express": ["express"],
    "django": ["django", "python"],
    "spring boot": ["spring boot", "java"],
    
    # Database aliases
    "mongodb": ["mongodb", "mongoose"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql"],
    "firebase": ["firebase", "firestore", "realtime db"],
    
    # Cloud aliases
    "aws": ["aws ec2", "s3", "lambda", "rds", "cloudformation", "iam"],
    "gcp": ["compute engine", "app engine", "bigquery", "cloud functions", "iam"],
    "azure": ["azure vms", "azure functions", "azure sql"],
    
    # DevOps & CI/CD
    "ci/cd": ["jenkins", "github actions", "gitlab ci", "docker", "kubernetes"],
    "terraform": ["terraform"],
    "ansible": ["ansible", "playbooks", "inventory", "roles", "yaml"],
    
    # Analytics & BI
    "power bi": ["power bi", "dax", "power query"],
    "tableau": ["tableau desktop", "tableau prep", "viz", "dashboards", "calculations"],
    
    # Messaging / Streaming
    "kafka": ["apache kafka", "zookeeper", "producer", "consumer", "stream processing"],
    "rabbitmq": ["rabbitmq", "queues", "exchanges", "producers", "consumers"],
    "redis": ["redis", "caching", "pub/sub", "data structures", "persistence"],
    
    # Others
    "graphql": ["apollo", "relay", "graphql queries", "resolvers", "schemas"],
    "rest api": ["http", "json", "endpoints", "express", "node", "authentication"],
    "elasticsearch": ["elasticsearch", "kibana", "logstash", "beats", "query dsl"],
    "hadoop": ["hadoop", "hdfs", "mapreduce", "yarn", "hive", "pig"],
    "spark": ["apache spark", "rdd", "dataframes", "pyspark", "mllib"]
}

print("⏳ Loading Dataset and Training Model...")
df = None
vectorizer = None
job_title_matrix = None
all_known_skills = set()

try:
    df = pd.read_csv('resume_data.csv')
    df.columns = df.columns.str.replace('\ufeff', '').str.strip()
    df = df.dropna(subset=['job_position_name', 'skills_required']).reset_index(drop=True)
    
    def clean_required_skills(skill_str):
        if pd.isna(skill_str): return []
        return [s.strip() for s in skill_str.split('\n') if s.strip()]

    df['clean_required_skills'] = df['skills_required'].apply(clean_required_skills)

    vectorizer = TfidfVectorizer(stop_words='english')
    job_title_matrix = vectorizer.fit_transform(df['job_position_name'].astype(str))

    for skills in df['clean_required_skills']:
        for skill in skills:
            if len(skill) > 1:
                all_known_skills.add(skill.lower())
    
    print(f"✅ Model Trained! Loaded {len(df)} jobs.")

except Exception as e:
    print(f"⚠️ Warning: Could not load CSV model ({e}). System will rely on manual skill inputs.")

# --- 2. HELPER FUNCTIONS ---

def calculate_experience(text):
    """Detects years of experience using Regex and Date Math."""
    text_lower = text.lower()
    
    direct_pattern = r'(\d+)\s*(?:year|yr|yrs|experience|exp)'
    direct_matches = re.findall(direct_pattern, text_lower)
    direct_years = max([int(m) for m in direct_matches]) if direct_matches else 0

    year_pattern = r'\b(19\d{2}|20\d{2})\b'
    years_found = sorted(list(set(re.findall(year_pattern, text_lower))))
    
    date_math_years = 0
    if len(years_found) >= 2:
        start_year = int(years_found[0])
        end_year = int(years_found[-1])
        if "present" in text_lower or "current" in text_lower or "now" in text_lower:
            end_year = datetime.now().year
        date_math_years = end_year - start_year

    return max(direct_years, date_math_years)

def extract_text_from_pdf(pdf_file):
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + " "
        return text
    except:
        return ""

def extract_skills_from_text(text, target_skills_pool):
    """Improved extraction with fuzzy/substring matching for versioning."""
    text_lower = text.lower()
    found_skills = set()
    
    # 1. Expand Aliases First (e.g., MERN -> MongoDB, React, etc.)
    for alias, sub_skills in SKILL_ALIASES.items():
        if alias in text_lower:
            for s in sub_skills:
                found_skills.add(s.lower())
    
    # 2. Match Target Pool
    for skill in target_skills_pool:
        skill_lower = skill.lower()
        
        # Remove common extensions for more flexible matching
        normalized_skill = skill_lower.replace('.js', '').replace('js', '').strip()
        
        # Check if skill exists as a whole word or a clear substring
        pattern = r'\b' + re.escape(normalized_skill) + r'.*?\b'
        
        if re.search(pattern, text_lower) or normalized_skill in text_lower:
            found_skills.add(skill_lower)
            
    return list(found_skills)

def get_ai_recommended_skills(target_job_title):
    if df is None or not target_job_title: return set()
    query_vec = vectorizer.transform([target_job_title])
    similarity_scores = cosine_similarity(query_vec, job_title_matrix).flatten()
    matched_indices = [i for i, score in enumerate(similarity_scores) if score > 0.3]
    
    if not matched_indices:
        matches = df['job_position_name'].str.contains(re.escape(target_job_title), case=False, na=False)
        matched_indices = df.index[matches].tolist()
        
    recommended = set()
    for idx in matched_indices[:5]:
        recommended.update(df.iloc[idx]['clean_required_skills'])
    return recommended

# --- 3. API ENDPOINT ---

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'cv' not in request.files:
            return jsonify({'success': False, 'error': 'No CV uploaded'}), 400
            
        file = request.files['cv']
        job_title = request.form.get('jobTitle', '').strip()
        required_skills_str = request.form.get('required_skills', '')
        
        target_skills = set()
        if required_skills_str:
            raw_list = re.split(r'[,\n]', required_skills_str)
            target_skills = {s.strip() for s in raw_list if s.strip()}
        else:
            target_skills = get_ai_recommended_skills(job_title)

        cv_text = extract_text_from_pdf(file)
        experience_years = calculate_experience(cv_text)
        
        # Get identified skills (Normalized for comparison)
        candidates_found_skills = extract_skills_from_text(cv_text, target_skills.union(all_known_skills))
        found_skills_norm = {s.lower() for s in candidates_found_skills}

        # Perform Gap Analysis with normalization
        missing_skills = []
        for skill in target_skills:
            # Check if the required skill (or its base name) is in found skills
            skill_base = skill.lower().replace('.js', '').replace('js', '').strip()
            
            # Match if exact or if the base name matches any found skill
            match_found = any(skill_base in f or f in skill.lower() for f in found_skills_norm)
            
            if not match_found:
                missing_skills.append(skill)

        print(f"✅ Analysis for {job_title}: {experience_years} yrs exp, {len(missing_skills)} missing.")

        return jsonify({
            'success': True,
            'job_title': job_title,
            'years_of_experience': experience_years,
            'identified_skills': list(found_skills_norm),
            'missing_skills': missing_skills
        })

    except Exception as e:
        print(f"❌ Server Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)