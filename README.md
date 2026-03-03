🚀 AI-Powered Resume Generation & Career Guidance System

An intelligent, end-to-end career support platform that helps Sri Lankan job seekers **build ATS-optimized resumes**, **prepare for interviews**, **get filtered through AI-driven assessments**, and **follow personalized learning paths aligned with local job market needs**.

📌 Project Overview

The **AI-Powered Resume Generation and Career Guidance System** is designed to address a critical gap in the Sri Lankan employment ecosystem:
➡️ *Candidates often have qualifications but lack optimized resumes, interview readiness, skill alignment, and confidence.*

Our system integrates **Large Language Models (LLMs)**, **voice-based AI**, **skill gap analysis**, and **ATS scoring** to provide a **complete career development solution**.

---

⚙️ Github Repo (https://github.com/IT22269652/Research)

📊 System Overview Diagram

![image alt](https://github.com/IT22269652/Research/blob/1bb1dc7475ab637f5fe71d2e3dc10be41fae2414/System%20Diagram.png)

🎯 Key Objectives

* 🧠 Generate **job-role-specific resumes & cover letters**
* 📊 Improve **ATS compatibility** with real-time scoring
* 🎤 Enable **AI-powered interview preparation with voice feedback**
* 📝 Filter applicants using **AI quizzes & confidence analysis**
* 📚 Provide **personalized learning paths** based on skill gaps
*  Align recommendations with the **Sri Lankan job market**

---

🧩 System Architecture (High-Level)


Next.js (Frontend)
   |
   |  REST APIs (JSON)
   v
Node.js + Express (Backend)
   |
   |  Secure AI Requests
   v
Python Flask AI Service (LLM)
   |
   |  Processed Intelligence
   v
MongoDB (Data Persistence)


---

🧑‍💻 Team Components & Scenarios

🔹 1. AI-Based Resume & Cover Letter Generator

**Functionality**

* Manual data input **OR** GitHub profile auto-fetch (projects, tech stack)
* AI-generated:

  * Professional summary
  * Resume
  * Cover letter (job-specific)
* **Real-time ATS Scoring Engine**

  * Semantic keyword matching
  * Optimization feedback

**Technologies**

* Groq / Gemini API (LLM)
* Node.js backend
* MongoDB
* Next.js + Tailwind CSS frontend
* PDF export support

---

🔹 2. Interview Preparation Assistant

**Workflow**

1. User selects:

   * Job title
   * Job description
   * Question count
   * Question types:

     * Technical
     * Behavioral
     * Experience
     * Problem Solving
     * Leadership
2. AI generates **custom interview questions**
3. AI voice-based interview session
4. User answers via voice
5. AI provides: Answer feedback

**Highlights**

* 🎤 Voice-based AI interview simulation
* 🧠 Context-aware question generation

---

🔹 3. AI Applicant Filter

📝 Scenario 1: Quiz Generation & Evaluation

* User selects skill (e.g., **Java**)
* LLM generates quiz questions
* Frontend validates answers instantly (Green/Red)
* Also provides explanation about question and answer(if user wants)

🎙️ Scenario 2: Confidence Check (Voice Analysis)

* User speaks an answer to a behavioral scenario
* Speech-to-text via Web Speech API
* LLM evaluates:

  * Confidence
  * Clarity
  * Keyword relevance
* Generates **Confidence Score (0–100)**

**Stored Data**

* Quiz Score
* Confidence Score

---

🔹 4. Career & Learning Guidance System

**Core Features**

* Skill Gap Analysis
* Comparison with industry/job-role standards
* Personalized Learning Path generation
* Course & skill recommendations

**Goal**

> Not just helping users *get interviews*, but ensuring they have the **right skills to get hired**.

---

🛠️ Technology Stack

🌐 Frontend

* Next.js 15
* React 19
* Tailwind CSS
* Radix UI Components
* TipTap Editor
* Lucide Icons
* PDF Export Tools

⚙️ Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* REST APIs

🤖 AI / ML Services

* Python Flask
* LLM (Groq / Gemini / LLaMA-based)
* Speech-to-Text (Web Speech API)
* AI-based semantic analysis

---

📦 UI Components Used

* Text / Textarea
* Badge
* Alert Dialog
* Dialog / Modal
* Toast & Toaster
* Progress Bar
* Select / Switch
* Tooltip
* PDF Renderer

---

⚙️ Installation & Setup Guide

🔹 1. Clone Repository


git clone - https://github.com/Dulajdj/Research-Project.git

---

🔹 2. Frontend Setup

cd ai-career-guidance-system
npm install
npm run dev

Runs on: `http://localhost:3000`

---

🔹 3. Backend Setup

cd backend
npm install
npm run dev

Runs on: `http://localhost:5000`

---

🔹 4. AI Service Setup (Python)

cd ai-service
pip install flask pandas
python app.py

Runs Flask AI server for LLM processing.

---

📊 Research Significance

* Improves employability in Sri Lanka 🇱🇰
* Reduces resume rejection due to ATS mismatch
* Enhances interview readiness using AI
* Bridges industry skill gaps effectively
* Combines **Resume + Interview + Assessment + Learning** in one platform

---

⭐ Acknowledgments

* Open-source AI & LLM communities
* Sri Lankan tech ecosystem
* Academic supervisors & mentors
