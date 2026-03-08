from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import PyPDF2
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# --- 1. LOAD MODEL (FALLBACK SYSTEM) ---

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

    # Build Similarity Model
    vectorizer = TfidfVectorizer(stop_words='english')
    job_title_matrix = vectorizer.fit_transform(df['job_position_name'].astype(str))

    # Master list of known skills for extraction
    for skills in df['clean_required_skills']:
        for skill in skills:
            if len(skill) > 1:
                all_known_skills.add(skill.lower())
    
    print(f"✅ Model Trained! Loaded {len(df)} jobs.")

except Exception as e:
    print(f"⚠️ Warning: Could not load CSV model ({e}). System will rely on manual skill inputs.")

# --- 2. HELPER FUNCTIONS ---

def extract_text_from_pdf(pdf_file):
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + " "
        return text
    except:
        return ""

def extract_skills_from_text(text, custom_skills_to_check=None):
    """
    Extracts skills from CV text.
    If 'custom_skills_to_check' is provided, we specifically look for those.
    Otherwise, we look for ALL known skills in our database.
    """
    text_lower = text.lower()
    found_skills = []
    
    # Decide which pool of skills to look for
    skills_pool = custom_skills_to_check if custom_skills_to_check else all_known_skills
    
    for skill in skills_pool:
        # Regex for whole word matching
        # Escape special chars (like C++, C#, .js)
        safe_skill = re.escape(skill)
        pattern = r'\b' + safe_skill + r'\b'
        
        if re.search(pattern, text_lower):
            found_skills.append(skill)
            
    return found_skills

def get_ai_recommended_skills(target_job_title):
    """Fallback: Uses the CSV database to find skills if none are provided"""
    if df is None or not target_job_title: return set()
    
    query_vec = vectorizer.transform([target_job_title])
    similarity_scores = cosine_similarity(query_vec, job_title_matrix).flatten()
    matched_indices = [i for i, score in enumerate(similarity_scores) if score > 0.3]
    
    if not matched_indices:
        # Keyword fallback
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
        
        # 1. Get Specific Skills from Frontend (The "Golden Source")
        # Frontend sends: "Python, Power Bi, SQL"
        required_skills_str = request.form.get('required_skills', '')
        
        target_skills = set()
        
        if required_skills_str:
            print(f"📝 Using Job Post Skills: {required_skills_str}")
            # Split by comma or newline and clean up
            raw_list = re.split(r'[,\n]', required_skills_str)
            target_skills = {s.strip() for s in raw_list if s.strip()}
        else:
            print(f"🤖 No job skills provided. Using AI Model for: '{job_title}'")
            target_skills = get_ai_recommended_skills(job_title)

        if not target_skills:
            return jsonify({
                'success': True, 
                'missing_skills': ["⚠️ Could not identify required skills for this job."]
            })

        # 2. Extract Skills from CV
        # We pass 'target_skills' so we explicitly check for what is needed
        cv_text = extract_text_from_pdf(file)
        
        # We add the target skills to our "known pool" temporarily to ensure we can find them
        # (e.g., if "Power BI" isn't in CSV but is in the job post, we must still be able to find it in CV)
        candidates_found_skills = extract_skills_from_text(cv_text, target_skills.union(all_known_skills))

        # 3. Compare
        found_skills_norm = {s.lower() for s in candidates_found_skills}
        missing_skills = []
        
        for skill in target_skills:
            if skill.lower() not in found_skills_norm:
                missing_skills.append(skill)

        print(f"✅ Analysis Complete. Missing: {len(missing_skills)} skills.")

        return jsonify({
            'success': True,
            'job_title': job_title,
            'identified_skills': candidates_found_skills,
            'missing_skills': missing_skills
        })

    except Exception as e:
        print(f"❌ Server Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)