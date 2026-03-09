from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import PyPDF2
import re
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from config import SKILL_ALIASES

app = Flask(__name__)
CORS(app)

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