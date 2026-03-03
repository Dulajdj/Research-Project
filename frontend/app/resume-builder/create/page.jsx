'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Download, Eye, Plus, X, Sparkles, Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Award, Github, ExternalLink, FileText, Users, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''; // backend base URL


export default function ResumeBuilderCreate() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('form');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isInlineEdit, setIsInlineEdit] = useState(false);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [uploadedResumeName, setUploadedResumeName] = useState('');
  const [isImportingResume, setIsImportingResume] = useState(false);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState('');
  
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      website: '',
      photo: '' // base64 or URL
    },
    summary: '',
    technicalSkills: [],
    skills: '',
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    references: []
  });

  const [currentEntry, setCurrentEntry] = useState({
    type: 'experience',
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubProjects, setGithubProjects] = useState([]);

const downloadPDF = async () => {
  setIsGenerating(true);

  try {
    const element = document.getElementById('resume-pdf-content');
    if (!element) return toast.error('Preview not ready!');

    // import jsPDF dynamically (already installed)
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 15; // mm

    // helper: convert mm to px at 96dpi (approx)
    const mmToPx = (mm) => mm * 3.779527559;

    const pdfWidthMm = pdf.internal.pageSize.getWidth();
    const availableWidthMm = pdfWidthMm - 2 * margin;
    const targetWidthPx = Math.round(mmToPx(availableWidthMm));

    // Try text-based rendering using jsPDF.html for selectable text
    try {
      await pdf.html(element, {
        x: margin,
        y: margin,
        windowWidth: targetWidthPx,
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true,
          width: targetWidthPx,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById('resume-pdf-content');
            if (clonedElement) {
              clonedElement.style.width = `${targetWidthPx}px`;
              clonedElement.style.boxSizing = 'border-box';
              clonedElement.classList.add('html2canvas-container');
            }
          }
        },
        callback: (doc) => {
          const filename = `${formData.personalInfo.fullName || 'My_Resume'}_A4_Text.pdf`;
          doc.save(filename);
          toast.success('Text-based PDF downloaded — selectable & print-ready!');
        },
        autoPaging: 'text'
      });

      setIsGenerating(false);
      return;

    } catch (err) {
      console.warn('Text-based PDF failed, falling back to image render:', err);

      // Fallback to image-based rendering (reliable visual fidelity)
      try {
        const html2canvas = (await import('html2canvas-pro')).default;

        // create a temporary clone with fixed width so canvas has correct dimensions
        const cloned = element.cloneNode(true);
        cloned.style.width = `${targetWidthPx}px`;
        cloned.style.boxSizing = 'border-box';
        cloned.classList.add('html2canvas-container');

        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '-9999px';
        wrapper.style.left = '-9999px';
        wrapper.appendChild(cloned);
        document.body.appendChild(wrapper);

        const canvas = await html2canvas(cloned, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true,
          width: targetWidthPx
        });

        document.body.removeChild(wrapper);

        const imgData = canvas.toDataURL('image/png');

        const pdfWidth = pdf.internal.pageSize.getWidth(); // mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // mm

        // convert canvas px to mm
        const pxToMm = (px) => px / 3.779527559;
        const imgWidthMm = pxToMm(canvas.width);
        const imgHeightMm = pxToMm(canvas.height);

        const availableWidthMm2 = pdfWidth - 2 * margin;
        const availableHeightMm = pdfHeight - 2 * margin;

        // scale to fit width
        const scale = Math.min(availableWidthMm2 / imgWidthMm, 1);
        const finalWidthMm = imgWidthMm * scale;
        const finalHeightMm = imgHeightMm * scale;

        // If height fits in one page just add and finish
        if (finalHeightMm <= availableHeightMm) {
          pdf.addImage(imgData, 'PNG', margin, margin, finalWidthMm, finalHeightMm);
        } else {
          // For multi-page, draw the full image and let previous approach shift using y offset
          // (this provides a reasonably reliable multi-page fallback)
          let positionYmm = 0;
          let pageCount = 0;
          while (positionYmm < finalHeightMm) {
            if (pageCount > 0) pdf.addPage();

            // Use negative y offset using image height (works across many browsers)
            pdf.addImage(
              imgData,
              'PNG',
              margin,
              margin - (positionYmm),
              finalWidthMm,
              finalHeightMm
            );

            positionYmm += availableHeightMm;
            pageCount++;
          }
        }

        pdf.save(`${formData.personalInfo.fullName || 'My_Resume'}_A4.pdf`);
        toast.success('PDF downloaded — image fallback used.');

      } catch (err2) {
        console.error('Fallback PDF failed', err2);
        toast.error('PDF generation failed');
      }
    }

  } catch (err) {
    console.error('PDF generation error:', err);
    toast.error('Failed to generate PDF');
  } finally {
    setIsGenerating(false);
  }
};

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Helper to handle simple text updates
  const handleTextChange = (field, value) => {
     setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Topic descriptions mapping
  const getTopicDescription = (topic) => {
    const topicDescriptions = {
      // Web Development
      'web': 'Web application development',
      'website': 'Website development project',
      'frontend': 'Frontend development application',
      'backend': 'Backend service or API',
      'fullstack': 'Full-stack web application',
      'spa': 'Single Page Application',
      'pwa': 'Progressive Web Application',
      
      // Mobile Development
      'mobile': 'Mobile application development',
      'android': 'Android mobile application',
      'ios': 'iOS mobile application',
      'react-native': 'React Native mobile app',
      'flutter': 'Flutter mobile application',
      
      // Frameworks & Libraries
      'react': 'React.js application',
      'vue': 'Vue.js application',
      'angular': 'Angular application',
      'nodejs': 'Node.js application',
      'express': 'Express.js web server',
      'django': 'Django web application',
      'flask': 'Flask web application',
      'spring': 'Spring Boot application',
      'laravel': 'Laravel PHP application',
      
      // Databases
      'database': 'Database management system',
      'mysql': 'MySQL database application',
      'postgresql': 'PostgreSQL database application',
      'mongodb': 'MongoDB database application',
      'redis': 'Redis cache application',
      
      // DevOps & Cloud
      'docker': 'Docker containerized application',
      'kubernetes': 'Kubernetes orchestration',
      'aws': 'Amazon Web Services application',
      'azure': 'Microsoft Azure application',
      'gcp': 'Google Cloud Platform application',
      'devops': 'DevOps automation tool',
      'ci-cd': 'Continuous Integration/Deployment',
      
      // AI & Machine Learning
      'ai': 'Artificial Intelligence application',
      'machine-learning': 'Machine Learning project',
      'deep-learning': 'Deep Learning model',
      'nlp': 'Natural Language Processing',
      'computer-vision': 'Computer Vision application',
      'tensorflow': 'TensorFlow ML model',
      'pytorch': 'PyTorch ML model',
      
      // Data Science
      'data-science': 'Data Science project',
      'analytics': 'Data analytics application',
      'visualization': 'Data visualization tool',
      'jupyter': 'Jupyter notebook project',
      'pandas': 'Pandas data processing',
      'numpy': 'NumPy numerical computing',
      
      // Security
      'security': 'Security application',
      'authentication': 'Authentication system',
      'authorization': 'Authorization system',
      'encryption': 'Encryption tool',
      'blockchain': 'Blockchain application',
      'cryptocurrency': 'Cryptocurrency project',
      
      // Tools & Utilities
      'cli': 'Command Line Interface tool',
      'api': 'REST API service',
      'graphql': 'GraphQL API',
      'microservice': 'Microservice architecture',
      'library': 'Software library',
      'framework': 'Software framework',
      'tool': 'Development tool',
      'utility': 'Utility application',
      
      // Game Development
      'game': 'Game development project',
      'unity': 'Unity game engine project',
      'unreal': 'Unreal Engine project',
      '2d': '2D game development',
      '3d': '3D game development',
      
      // Other Categories
      'education': 'Educational application',
      'e-learning': 'E-learning platform',
      'social': 'Social media application',
      'ecommerce': 'E-commerce application',
      'fintech': 'Financial technology application',
      'healthcare': 'Healthcare application',
      'iot': 'Internet of Things project',
      'arduino': 'Arduino project',
      'raspberry-pi': 'Raspberry Pi project'
    };
    
    return topicDescriptions[topic.toLowerCase()] || `${topic} application`;
  };

useEffect(() => {
  // Create new resume → force clean state
  setFormData({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      github: "",
      website: ""
    },
    summary: "",
    skills: "",
    technicalSkills: "",
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    references: []
  });

  setSelectedTemplate("modern");

}, []);


  const fetchGithubProjects = async () => {
    if (!githubUsername.trim()) {
      alert('Please enter a GitHub username');
      return;
    }

    setIsFetchingGithub(true);
    try {
      const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`);
      
      if (!response.ok) {
        throw new Error('GitHub user not found or API error');
      }

      const repos = await response.json();
      
      // Fetch detailed information for each repository
      const projects = await Promise.all(repos.map(async (repo) => {
        let detailedDescription = repo.description || 'No description available';
        let technologies = [];
        let features = [];
        let topicDescriptions = [];

        try {
          // Fetch README content
          const readmeResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`);
          if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json();
            const readmeContent = atob(readmeData.content);
            
            // Extract key information from README
            const lines = readmeContent.split('\n');
            let descriptionFound = false;
            
            for (let i = 0; i < Math.min(lines.length, 50); i++) {
              const line = lines[i].trim();
              
              // Look for description patterns
              if (!descriptionFound && (line.startsWith('#') || line.startsWith('##')) && line.length > 10) {
                const nextLine = lines[i + 1]?.trim();
                if (nextLine && !nextLine.startsWith('#') && !nextLine.startsWith('[') && nextLine.length > 20) {
                  detailedDescription = nextLine;
                  descriptionFound = true;
                }
              }
              
              // Look for technologies/tech stack
              if (line.toLowerCase().includes('tech') || line.toLowerCase().includes('stack') || line.toLowerCase().includes('built with')) {
                const techLine = lines[i + 1]?.trim();
                if (techLine) {
                  technologies.push(techLine.replace(/[-\*]/g, '').trim());
                }
              }
              
              // Look for features
              if (line.toLowerCase().includes('feature') || line.toLowerCase().includes('functionality')) {
                for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                  const featureLine = lines[j]?.trim();
                  if (featureLine && (featureLine.startsWith('-') || featureLine.startsWith('*')) && featureLine.length > 10) {
                    features.push(featureLine.replace(/[-\*]/g, '').trim());
                  }
                }
              }
            }
          }
        } catch (readmeError) {
          console.log('Could not fetch README for', repo.name);
        }

        // Generate topic-based descriptions
        if (repo.topics && repo.topics.length > 0) {
          topicDescriptions = repo.topics.slice(0, 3).map(topic => getTopicDescription(topic));
        }

        // Create enhanced description
        let enhancedDescription = detailedDescription;
        
        if (topicDescriptions.length > 0) {
          enhancedDescription += `\n\nProject Type: ${topicDescriptions.join(', ')}`;
        }
        
        if (technologies.length > 0) {
          enhancedDescription += `\n\nTechnologies: ${technologies.slice(0, 3).join(', ')}`;
        }
        
        if (features.length > 0) {
          enhancedDescription += `\n\nKey Features: ${features.slice(0, 2).join(', ')}`;
        }

        return {
          title: repo.name,
          company: repo.full_name,
          location: repo.language || 'Various',
          startDate: new Date(repo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          endDate: repo.updated_at ? new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present',
          current: !repo.archived,
          description: enhancedDescription,
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          topics: repo.topics || [],
          topicDescriptions: topicDescriptions,
          size: repo.size,
          watchers: repo.watchers_count
        };
      }));

      setGithubProjects(projects);
      
      // Auto-add GitHub projects to the projects section
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, ...projects]
      }));

      alert(`Successfully fetched ${projects.length} GitHub projects with detailed descriptions!`);
    } catch (error) {
      console.error('GitHub API Error:', error);
      alert('Failed to fetch GitHub projects. Please check the username and try again.');
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleArrayChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: value
    }));
  };

  // Photo upload handler (stores base64 data URL in personalInfo.photo)
  const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 MB
  const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateImageFile = (file) => {
    if (!file) return { ok: false, reason: 'No file' };
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) return { ok: false, reason: 'TYPE' };
    if (file.size > MAX_PHOTO_SIZE) return { ok: false, reason: 'SIZE' };
    return { ok: true };
  };

  // Handlers for preview edit toolbar
  const handlePreviewPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.ok) {
      if (validation.reason === 'TYPE') {
        toast.error('Unsupported image type. Allowed: JPG, PNG, WebP');
      } else if (validation.reason === 'SIZE') {
        toast.error('Image too large. Max 2 MB');
      } else {
        toast.error('Invalid image');
      }
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setFormData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, photo: dataUrl } }));
      toast.success('Profile photo updated');
    };
    reader.onerror = (err) => {
      console.error('Photo read error', err);
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePersonalInfoChange = (field, value) => {
    handleInputChange('personalInfo', field, value);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.ok) {
      if (validation.reason === 'TYPE') {
        toast.error('Invalid image type. Please upload JPG, PNG, or WebP.');
      } else if (validation.reason === 'SIZE') {
        toast.error('Image is too large. Max size is 2 MB.');
      }
      // reset input
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, photo: dataUrl }
      }));
      toast.success('Profile photo uploaded');
    };
    reader.onerror = (err) => {
      console.error('Photo read error', err);
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
    // reset input
    e.target.value = '';
  };

  // Import resume file (PDF or plain text) and parse via server-side AI parser
  const handleUploadResumeFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedResumeName(file.name || '');
    setIsImportingResume(true);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(`${API_BASE}/api/parse-resume`, {
        method: 'POST',
        body: fd
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to parse resume');
      }

      // Merge parsed fields into formData
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...(data.personalInfo || {}) },
        summary: data.summary || prev.summary,
        skills: data.skills || prev.skills,
        technicalSkills: Array.isArray(data.technicalSkills) ? data.technicalSkills : prev.technicalSkills,
        experience: Array.isArray(data.experience) ? data.experience : prev.experience,
        education: Array.isArray(data.education) ? data.education : prev.education,
        projects: Array.isArray(data.projects) ? data.projects : prev.projects,
        certifications: Array.isArray(data.certifications) ? data.certifications : prev.certifications,
        references: Array.isArray(data.references) ? data.references : prev.references,
        selectedTemplate: data.selectedTemplate || prev.selectedTemplate || 'modern'
      }));

      if (data._parsedBy === 'fallback') {
        toast('Resume imported using fallback parser (AI unavailable). Please review fields carefully.', { duration: 6000 });
      } else {
        toast.success('Resume imported — you can now edit it with the templates!');
      }
      setActiveTab('form');

    } catch (err) {
      console.error('Import error:', err);
      toast.error(err.message || 'Failed to import resume');
    } finally {
      setIsImportingResume(false);
      e.target.value = '';
    }
  };

  // Import resume from pasted text
  const importPastedResume = async () => {
    if (!pasteText || pasteText.trim().length === 0) return toast.error('Please paste your resume text');
    setIsImportingResume(true);
    try {
      const fd = new FormData();
      fd.append('resumeText', pasteText);
      const res = await fetch(`${API_BASE}/api/parse-resume`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to parse resume text');

      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...(data.personalInfo || {}) },
        summary: data.summary || prev.summary,
        skills: data.skills || prev.skills,
        technicalSkills: Array.isArray(data.technicalSkills) ? data.technicalSkills : prev.technicalSkills,
        experience: Array.isArray(data.experience) ? data.experience : prev.experience,
        education: Array.isArray(data.education) ? data.education : prev.education,
        projects: Array.isArray(data.projects) ? data.projects : prev.projects,
        certifications: Array.isArray(data.certifications) ? data.certifications : prev.certifications,
        references: Array.isArray(data.references) ? data.references : prev.references,
        selectedTemplate: data.selectedTemplate || prev.selectedTemplate || 'modern'
      }));

      if (data._parsedBy === 'fallback') {
        toast('Resume text imported using fallback parser (AI unavailable). Please review fields carefully.', { duration: 6000 });
      } else {
        toast.success('Resume text imported — you can now edit it!');
      }

      setShowPasteBox(false);
      setPasteText('');
      setActiveTab('form');
    } catch (err) {
      console.error('Import text error:', err);
      toast.error(err.message || 'Failed to import text');
    } finally {
      setIsImportingResume(false);
    }
  };

 const addEntry = () => {
  // Edit mode: currentEntry.index is set
  if (currentEntry.index !== undefined) {
    setFormData(prev => {
      const updated = [...prev[currentEntry.type]];
      updated[currentEntry.index] = {
        ...currentEntry
      };
      return { ...prev, [currentEntry.type]: updated };
    });

    setCurrentEntry({
      type: currentEntry.type,
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });

    setShowEntryForm(false);
    toast.success('Updated!');
    return;
  } else {
    // Add new entry
    setFormData(prev => ({
      ...prev,
      [currentEntry.type]: [...prev[currentEntry.type], currentEntry]
    }));
  }

  setCurrentEntry({
    type: currentEntry.type,
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  setShowEntryForm(false);
};


  const removeEntry = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const generateResume = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      setActiveTab('preview');
    }, 2000);
  };

// app/resume-builder/create/page.jsx
const generateAiSummary = async () => {
  if (!formData.summary?.trim()) {
    toast.error('Please enter keywords first!');
    return;
  }

  setIsAiLoading(true);
  try {
    const res = await fetch(`${API_BASE}/api/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: formData.summary,
        skills: formData.skills,
        jobTitle: formData.experience[0]?.title || 'Professional',
        experience: formData.experience.map(e => e.title).join(', ')
      }),
    });

    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      const text = await res.text().catch(() => null);
      console.error('AI Error: non-JSON response', text || jsonErr);
      toast.error(text ? `AI Error: ${text.slice(0,200)}` : 'AI Error: received invalid response from server.');
      return;
    }

    if (res.ok) {
      setFormData(prev => ({ ...prev, summary: data.summary }));
      toast.success('Summary generated!');
    } else {
      // Router error එකක් ආවොත් පරිශීලකයාට පණිවිඩයක් පෙන්වන්න
      if (data.error && data.error.includes('router')) {
        toast.error('AI is warming up. Please click again in 10 seconds.');
      } else {
        toast.error(data.error || 'Failed to generate');
      }
    }
  } catch (error) {
    console.error("AI Error:", error);
  } finally {
    setIsAiLoading(false);
  }
};

const saveResume = async () => {
  if (!formData.personalInfo?.fullName?.trim()) {
    toast.error('Please enter your full name!');
    return;
  }

  // Debug: check whether photo is present before sending
  console.log('Saving resume — photo present?', Boolean(formData.personalInfo?.photo), 'len:', formData.personalInfo?.photo?.length || 0);
  if (selectedTemplate === 'modern' && !formData.personalInfo?.photo) {
    // Warn user and allow them to continue if they really want to
    const proceed = confirm('You are using the Modern template but no profile photo is attached. Continue without a photo?');
    if (!proceed) return;
  }

  setIsSaving(true);

  try {
    // Build body as string to inspect size
    const bodyObj = {
      personalInfo: formData.personalInfo,
      summary: formData.summary,
      skills: formData.skills,
      experience: formData.experience,
      education: formData.education,
      projects: formData.projects,
      certifications: formData.certifications,
      selectedTemplate
    };
    const bodyString = JSON.stringify(bodyObj);
    console.log('POST /api/resume body size (chars):', bodyString.length);

    const res = await fetch(`${API_BASE}/api/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyString,
    });

    if (res.ok) {
      const saved = await res.json();
      console.log('Saved resume (POST response):', saved);
      toast.success('Resume saved successfully!', { duration: 4000 });

      // Small debug toast about photo presence
      if (saved.personalInfo?.photo) {
        toast.success(`Saved resume contains a photo (size: ${saved.personalInfo.photo.length} chars)`, { duration: 5000 });
      } else {
        toast.error('Saved resume did NOT contain a photo', { duration: 5000 });
      }

      // Store the saved resume in sessionStorage as a short-lived cache so the Edit page can display it immediately
      try {
        sessionStorage.setItem('recentlySavedResume', JSON.stringify(saved));
      } catch (e) {
        console.warn('Failed to write recentlySavedResume to sessionStorage', e);
      }

      // Navigate to edit page to ensure it performs a fresh fetch and displays the saved photo
      router.push(`/resume-builder/edit/${saved._id}`);

    } else {
      throw new Error();
    }
  } catch (err) {
    console.error('Save error:', err);
    toast.error('Save failed — please try again');
  } finally {
    setIsSaving(false);
  }
};


  const generateMarkdown = () => {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = formData;
    
    let markdown = `# ${personalInfo.fullName}\n\n`;
    
    // Contact Info
    markdown += `📧 ${personalInfo.email} | 📱 ${personalInfo.phone}\n`;
    if (personalInfo.address) markdown += `📍 ${personalInfo.address}\n`;
    if (personalInfo.linkedin) markdown += `💼 [LinkedIn](${personalInfo.linkedin})\n`;
    if (personalInfo.github) markdown += `🔗 [GitHub](${personalInfo.github})\n`;
    if (personalInfo.website) markdown += `🌐 [Website](${personalInfo.website})\n`;
    markdown += '\n---\n\n';

    // Summary
    if (summary) {
      markdown += `## Professional Summary\n\n${summary}\n\n`;
    }

    // Skills
    if (skills) {
      markdown += `## Skills\n\n${skills}\n\n`;
    }

    // Experience
    if (experience.length > 0) {
      markdown += `## Work Experience\n\n`;
      experience.forEach(exp => {
        markdown += `### ${exp.title} - ${exp.company}\n`;
        markdown += `*${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}*\n`;
        if (exp.location) markdown += `📍 ${exp.location}\n`;
        markdown += `\n${exp.description}\n\n`;
      });
    }

    // Education
    if (education.length > 0) {
      markdown += `## Education\n\n`;
      education.forEach(edu => {
        markdown += `### ${edu.title} - ${edu.company}\n`;
        markdown += `*${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}*\n`;
        if (edu.location) markdown += `📍 ${edu.location}\n`;
        markdown += `\n${edu.description}\n\n`;
      });
    }

    // Projects
    if (projects.length > 0) {
      markdown += `## Projects\n\n`;
      projects.forEach(proj => {
        markdown += `### ${proj.title}\n`;
        markdown += `*${proj.startDate} - ${proj.current ? 'Present' : proj.endDate}*\n`;
        if (proj.location) markdown += `📍 ${proj.location}\n`;
        if (proj.url) markdown += `🔗 [View Project](${proj.url})\n`;
        if (proj.stars && proj.stars > 0) markdown += `⭐ ${proj.stars} stars | 🍴 ${proj.forks} forks\n`;
        markdown += `\n${proj.description}\n\n`;
      });
    }

    // Certifications
    if (certifications.length > 0) {
      markdown += `## Certifications\n\n`;
      certifications.forEach(cert => {
        markdown += `### ${cert.title} - ${cert.company}\n`;
        markdown += `*${cert.startDate} - ${cert.current ? 'Present' : cert.endDate}*\n`;
        if (cert.location) markdown += `📍 ${cert.location}\n`;
        markdown += `\n${cert.description}\n\n`;
      });
    }

    return markdown;
  };

  const generateProfessionalCV = () => {
    const { personalInfo, summary, skills, technicalSkills, experience, education, projects, certifications, references } = formData;
    
    const ReferenceItem = ({ refData }) => (
        <div className="cv-item">
            <div className="cv-item-header">
                <h3 className="cv-item-title">{refData.title}</h3> {/* Name */}
                <span className="cv-item-company">{refData.company}</span> {/* Position/Company */}
            </div>
            <div className="cv-item-description">{refData.description}</div> {/* Contact Info */}
        </div>
    );
    switch(selectedTemplate) {
      case 'modern':
        return (
          <div className="cv-template cv-modern">
            {/* Header */}
            <div className="cv-header">
              {personalInfo.photo && selectedTemplate === 'modern' && (
                <div className="mx-auto mb-2 w-40 h-40 overflow-hidden border-4 profile-photo">
                  <img src={personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}
              <h1 className="cv-name text-4xl font-bold mb-2">{personalInfo.fullName || 'Your Name'}</h1>
              <div className="cv-contact">
                {personalInfo.email && <span>📧 {personalInfo.email}</span>}
                {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
                {personalInfo.address && <span>📍 {personalInfo.address}</span>}
                {personalInfo.linkedin && <span>💼 LinkedIn</span>}
                {personalInfo.github && <span>🔗 GitHub</span>}
                {personalInfo.website && <span>🌐 Website</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="cv-section">
                <h2 className="cv-section-title">Professional Summary</h2>
                <p className="cv-summary">{summary}</p>
              </div>
            )}

            {/* Skills and Technical Skills Side-by-Side */}
{(skills || technicalSkills) && (
  <div className="cv-section grid grid-cols-2 gap-8">
    
    {/* Left Side: Soft Skills */}
    <div>
      <h2 className="cv-section-title border-b-2 border-blue-500 mb-2">Soft Skills</h2>
      <p className="cv-skills whitespace-pre-line text-sm">
        {skills || "No skills added yet."}
      </p>
    </div>

    {/* Right Side: Technical Skills */}
    <div>
      <h2 className="cv-section-title border-b-2 border-blue-500 mb-2">Technical Skills</h2>
      <p className="cv-skills whitespace-pre-line text-sm">
        {technicalSkills || "No skills added yet."}
      </p>
    </div>

  </div>
)}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">Work Experience</h2>
                {experience.map((exp, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{exp.title}</h3>
                      <span className="cv-item-company">{exp.company}</span>
                      <span className="cv-item-date">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.location && <div className="cv-item-location">📍 {exp.location}</div>}
                    <div className="cv-item-description">{exp.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">Education</h2>
                {education.map((edu, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{edu.title}</h3>
                      <span className="cv-item-company">{edu.company}</span>
                      <span className="cv-item-date">
                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>
                    {edu.location && <div className="cv-item-location">📍 {edu.location}</div>}
                    <div className="cv-item-description">{edu.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">Projects</h2>
                {projects.map((proj, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{proj.title}</h3>
                      <span className="cv-item-company">{proj.company}</span>
                      <span className="cv-item-date">
                        {proj.startDate} - {proj.current ? 'Present' : proj.endDate}
                      </span>
                    </div>
                    {proj.location && <div className="cv-item-location">📍 {proj.location}</div>}
                    {proj.url && <div className="cv-item-link">🔗 <a href={proj.url} target="_blank" rel="noopener noreferrer">View Project</a></div>}
                    {proj.stars && proj.stars > 0 && (
                      <div className="cv-item-stats">⭐ {proj.stars} stars | 🍴 {proj.forks} forks</div>
                    )}
                    <div className="cv-item-description">{proj.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">Certifications</h2>
                {certifications.map((cert, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{cert.title}</h3>
                      <span className="cv-item-company">{cert.company}</span>
                      <span className="cv-item-date">
                        {cert.startDate} - {cert.current ? 'Present' : cert.endDate}
                      </span>
                    </div>
                    {cert.location && <div className="cv-item-location">📍 {cert.location}</div>}
                    <div className="cv-item-description">{cert.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* References - Added at the end */}
            {references.length > 0 && (
                <div className="cv-section">
                    <h2 className="cv-section-title">References</h2>
                    {references.map((ref, index) => (
                        <ReferenceItem key={index} refData={ref} />
                    ))}
                </div>
            )}

          </div>
        );
        

      case 'classic':
        return (
          <div className="cv-template cv-classic">
            {/* Header */}
            <div className="cv-header">
              <h1 className="cv-name">{personalInfo.fullName || 'Your Name'}</h1>
              <div className="cv-contact">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.address && <span>{personalInfo.address}</span>}
                {personalInfo.linkedin && <span>LinkedIn: {personalInfo.linkedin}</span>}
                {personalInfo.github && <span>GitHub: {personalInfo.github}</span>}
                {personalInfo.website && <span>Website: {personalInfo.website}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="cv-section">
                <h2 className="cv-section-title">PROFESSIONAL SUMMARY</h2>
                <p className="cv-summary">{summary}</p>
              </div>
            )}

            {/* Skills and Technical Skills Side-by-Side */}
{(skills || technicalSkills) && (
  <div className="cv-section grid grid-cols-2 gap-8">
    
    {/* Left Side: Soft Skills */}
    <div>
      <h2 className="cv-section-title border-b-2 border-blue-500 mb-2">Soft Skills</h2>
      <p className="cv-skills whitespace-pre-line text-sm">
        {skills || "No skills added yet."}
      </p>
    </div>

    {/* Right Side: Technical Skills */}
    <div>
      <h2 className="cv-section-title border-b-2 border-blue-500 mb-2">Technical Skills</h2>
      <p className="cv-skills whitespace-pre-line text-sm">
        {technicalSkills || "No skills added yet."}
      </p>
    </div>

  </div>
)}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">PROFESSIONAL EXPERIENCE</h2>
                {experience.map((exp, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{exp.title}</h3>
                      <span className="cv-item-company">{exp.company}</span>
                      <span className="cv-item-date">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.location && <div className="cv-item-location">{exp.location}</div>}
                    <div className="cv-item-description">{exp.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">EDUCATION</h2>
                {education.map((edu, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{edu.title}</h3>
                      <span className="cv-item-company">{edu.company}</span>
                      <span className="cv-item-date">
                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>
                    {edu.location && <div className="cv-item-location">{edu.location}</div>}
                    <div className="cv-item-description">{edu.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">PROJECTS</h2>
                {projects.map((proj, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{proj.title}</h3>
                      <span className="cv-item-company">{proj.company}</span>
                      <span className="cv-item-date">
                        {proj.startDate} - {proj.current ? 'Present' : proj.endDate}
                      </span>
                    </div>
                    {proj.location && <div className="cv-item-location">{proj.location}</div>}
                    {proj.url && <div className="cv-item-link">Project Link: {proj.url}</div>}
                    {proj.stars && proj.stars > 0 && (
                      <div className="cv-item-stats">GitHub Stars: {proj.stars} | Forks: {proj.forks}</div>
                    )}
                    <div className="cv-item-description">{proj.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">CERTIFICATIONS</h2>
                {certifications.map((cert, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{cert.title}</h3>
                      <span className="cv-item-company">{cert.company}</span>
                      <span className="cv-item-date">
                        {cert.startDate} - {cert.current ? 'Present' : cert.endDate}
                      </span>
                    </div>
                    {cert.location && <div className="cv-item-location">{cert.location}</div>}
                    <div className="cv-item-description">{cert.description}</div>
                  </div>
                ))}
              </div>

              
            )}

            {/* References - Added at the end */}
            {references.length > 0 && (
                <div className="cv-section">
                    <h2 className="cv-section-title">References</h2>
                    {references.map((ref, index) => (
                        <ReferenceItem key={index} refData={ref} />
                    ))}
                </div>
            )}
          </div>
        );

      case 'creative':
        return (
          <div className="cv-template cv-creative">
            {/* Header */}
            <div className="cv-header">
              <h1 className="cv-name">{personalInfo.fullName || 'Your Name'}</h1>
              <div className="cv-contact">
                {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
                {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                {personalInfo.address && <span>🏠 {personalInfo.address}</span>}
                {personalInfo.linkedin && <span>💼 {personalInfo.linkedin}</span>}
                {personalInfo.github && <span>⚡ {personalInfo.github}</span>}
                {personalInfo.website && <span>🌐 {personalInfo.website}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="cv-section">
                <h2 className="cv-section-title">✨ About Me</h2>
                <p className="cv-summary">{summary}</p>
              </div>
            )}

            {/* Skills and Technical Skills Side-by-Side */}
{(skills || technicalSkills) && (
  <div className="cv-section grid grid-cols-2 gap-8">
    
    {/* Left Side: Soft Skills */}
    <div>
      <h2 className="cv-section-title border-b-2 border-blue-500 mb-2">Soft Skills</h2>
      <p className="cv-skills whitespace-pre-line text-sm">
        {skills || "No skills added yet."}
      </p>
    </div>

    {/* Right Side: Technical Skills */}
    <div>
      <h2 className="cv-section-title border-b-2 border-blue-500 mb-2">Technical Skills</h2>
      <p className="cv-skills whitespace-pre-line text-sm">
        {technicalSkills || "No skills added yet."}
      </p>
    </div>

  </div>
)}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">💼 Work Experience</h2>
                {experience.map((exp, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{exp.title}</h3>
                      <span className="cv-item-company">{exp.company}</span>
                      <span className="cv-item-date">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.location && <div className="cv-item-location">📍 {exp.location}</div>}
                    <div className="cv-item-description">{exp.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">🎓 Education</h2>
                {education.map((edu, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{edu.title}</h3>
                      <span className="cv-item-company">{edu.company}</span>
                      <span className="cv-item-date">
                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>
                    {edu.location && <div className="cv-item-location">📍 {edu.location}</div>}
                    <div className="cv-item-description">{edu.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">🚀 Projects</h2>
                {projects.map((proj, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{proj.title}</h3>
                      <span className="cv-item-company">{proj.company}</span>
                      <span className="cv-item-date">
                        {proj.startDate} - {proj.current ? 'Present' : proj.endDate}
                      </span>
                    </div>
                    {proj.location && <div className="cv-item-location">📍 {proj.location}</div>}
                    {proj.url && <div className="cv-item-link">🔗 <a href={proj.url} target="_blank" rel="noopener noreferrer">View Project</a></div>}
                    {proj.stars && proj.stars > 0 && (
                      <div className="cv-item-stats">⭐ {proj.stars} stars | 🍴 {proj.forks} forks</div>
                    )}
                    <div className="cv-item-description">{proj.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">🏆 Certifications</h2>
                {certifications.map((cert, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{cert.title}</h3>
                      <span className="cv-item-company">{cert.company}</span>
                      <span className="cv-item-date">
                        {cert.startDate} - {cert.current ? 'Present' : cert.endDate}
                      </span>
                    </div>
                    {cert.location && <div className="cv-item-location">📍 {cert.location}</div>}
                    <div className="cv-item-description">{cert.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* References - Added at the end */}
            {references.length > 0 && (
                <div className="cv-section">
                    <h2 className="cv-section-title">References</h2>
                    {references.map((ref, index) => (
                        <ReferenceItem key={index} refData={ref} />
                    ))}
                </div>
            )}
          </div>
        );


      default:
        return null;
    }
  };

  const generateProfessionalCVHTML = () => {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = formData;
    
    let html = '';
    
    // Header
    html += '<div class="cv-header">';
    html += `<h1 class="cv-name">${personalInfo.fullName || 'Your Name'}</h1>`;
    html += '<div class="cv-contact">';
    if (personalInfo.email) html += `<span>📧 ${personalInfo.email}</span>`;
    if (personalInfo.phone) html += `<span>📱 ${personalInfo.phone}</span>`;
    if (personalInfo.address) html += `<span>📍 ${personalInfo.address}</span>`;
    if (personalInfo.linkedin) html += '<span>💼 LinkedIn</span>';
    if (personalInfo.github) html += '<span>🔗 GitHub</span>';
    if (personalInfo.website) html += '<span>🌐 Website</span>';
    html += '</div></div>';

    // Professional Summary
    if (summary) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Professional Summary</h2>';
      html += `<p class="cv-summary">${summary}</p>`;
      html += '</div>';
    }

    // Skills
    if (skills) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Skills</h2>';
      html += `<p class="cv-skills">${skills}</p>`;
      html += '</div>';
    }

    // Work Experience
    if (experience.length > 0) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Work Experience</h2>';
      experience.forEach(exp => {
        html += '<div class="cv-item">';
        html += '<div class="cv-item-header">';
        html += `<h3 class="cv-item-title">${exp.title}</h3>`;
        html += `<span class="cv-item-company">${exp.company}</span>`;
        html += `<span class="cv-item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>`;
        html += '</div>';
        if (exp.location) html += `<div class="cv-item-location">📍 ${exp.location}</div>`;
        html += `<div class="cv-item-description">${exp.description}</div>`;
        html += '</div>';
      });
      html += '</div>';
    }

    // Education
    if (education.length > 0) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Education</h2>';
      education.forEach(edu => {
        html += '<div class="cv-item">';
        html += '<div class="cv-item-header">';
        html += `<h3 class="cv-item-title">${edu.title}</h3>`;
        html += `<span class="cv-item-company">${edu.company}</span>`;
        html += `<span class="cv-item-date">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</span>`;
        html += '</div>';
        if (edu.location) html += `<div class="cv-item-location">📍 ${edu.location}</div>`;
        html += `<div class="cv-item-description">${edu.description}</div>`;
        html += '</div>';
      });
      html += '</div>';
    }

    // Projects
    if (projects.length > 0) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Projects</h2>';
      projects.forEach(proj => {
        html += '<div class="cv-item">';
        html += '<div class="cv-item-header">';
        html += `<h3 class="cv-item-title">${proj.title}</h3>`;
        html += `<span class="cv-item-company">${proj.company}</span>`;
        html += `<span class="cv-item-date">${proj.startDate} - ${proj.current ? 'Present' : proj.endDate}</span>`;
        html += '</div>';
        if (proj.location) html += `<div class="cv-item-location">📍 ${proj.location}</div>`;
        if (proj.url) html += `<div class="cv-item-link">🔗 <a href="${proj.url}">View Project</a></div>`;
        if (proj.stars && proj.stars > 0) html += `<div class="cv-item-stats">⭐ ${proj.stars} stars | 🍴 ${proj.forks} forks</div>`;
        html += `<div class="cv-item-description">${proj.description}</div>`;
        html += '</div>';
      });
      html += '</div>';
    }

    // Certifications
    if (certifications.length > 0) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Certifications</h2>';
      certifications.forEach(cert => {
        html += '<div class="cv-item">';
        html += '<div class="cv-item-header">';
        html += `<h3 class="cv-item-title">${cert.title}</h3>`;
        html += `<span class="cv-item-company">${cert.company}</span>`;
        html += `<span class="cv-item-date">${cert.startDate} - ${cert.current ? 'Present' : cert.endDate}</span>`;
        html += '</div>';
        if (cert.location) html += `<div class="cv-item-location">📍 ${cert.location}</div>`;
        html += `<div class="cv-item-description">${cert.description}</div>`;
        html += '</div>';
      });
      html += '</div>';
    }

    return html;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/60 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          <Link href="/resume-builder" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to Resume Builder</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/resume-builder/saved" className="flex items-center gap-2 text-purple-300 hover:text-white">
  <FileText className="w-5 h-5" />
  My Saved Resumes
</Link>
            <button
  onClick={saveResume}
  disabled={isSaving}
  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition disabled:opacity-70"
>
  {isSaving ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Save className="w-5 h-5" />
      Save Resume
    </>
  )}
</button>
<button
  onClick={downloadPDF}
  disabled={isGenerating}
  className={`flex items-center gap-2 text-white px-6 py-3 rounded-full hover:shadow-xl transition disabled:opacity-50 font-medium
    ${selectedTemplate === 'modern' 
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30' 
      : selectedTemplate === 'classic' 
      ? 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black shadow-gray-700/40' 
      : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-pink-500/40'
    }`}
>
  {isGenerating ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Generating PDF...
    </>
  ) : (
    <>
      <Download className="w-5 h-5" />
      Download PDF
    </>
  )}
</button>
          </div>
        </div>
      </div>

      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e1b4b',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
          success: {
            icon: 'Saved',
            style: { background: '#10b981' },
          },
        }}
      />

      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Resume <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Builder</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Create your professional resume with AI assistance
            </p>
          </div>

  {/* Template Selector - Professional Look */}
<div className="mb-10">
  <h3 className="text-2xl font-bold text-white mb-6 text-center">Choose Your CV Template</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

    {/* MODERN - Clean & Professional */}
    <div 
      className={`group p-8 border-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        selectedTemplate === 'modern' 
          ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/20' 
          : 'border-white/30 bg-white/5 hover:border-blue-400 hover:bg-blue-500/5'
      }`}
      onClick={() => setSelectedTemplate('modern')}
    >
      <div className="text-center">
        <div className="w-20 h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl mx-auto mb-4 shadow-lg"></div>
        <h4 className="text-xl font-bold text-white mb-2">Modern</h4>
        <p className="text-sm text-gray-300">Clean, Professional & ATS Friendly</p>
        {selectedTemplate === 'modern' && (
          <span className="inline-block mt-3 px-4 py-1 bg-blue-500 text-white text-xs rounded-full animate-pulse">
            Selected
          </span>
        )}
      </div>
    </div>

    {/* CLASSIC - Traditional */}
    <div 
      className={`group p-8 border-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        selectedTemplate === 'classic' 
          ? 'border-gray-400 bg-gray-400/10 shadow-2xl shadow-gray-400/20' 
          : 'border-white/30 bg-white/5 hover:border-gray-300 hover:bg-gray-400/5'
      }`}
      onClick={() => setSelectedTemplate('classic')}
    >
      <div className="text-center">
        <div className="w-20 h-28 bg-gradient-to-br from-gray-800 to-black rounded-xl mx-auto mb-4 shadow-lg"></div>
        <h4 className="text-xl font-bold text-white mb-2">Classic</h4>
        <p className="text-sm text-gray-300">Formal & Traditional Style</p>
        {selectedTemplate === 'classic' && (
          <span className="inline-block mt-3 px-4 py-1 bg-gray-600 text-white text-xs rounded-full animate-pulse">
            Selected
          </span>
        )}
      </div>
    </div>

    {/* CREATIVE - Modern Creative (but white PDF) */}
    <div 
      className={`group p-8 border-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        selectedTemplate === 'creative' 
          ? 'border-pink-500 bg-pink-500/10 shadow-2xl shadow-pink-500/20' 
          : 'border-white/30 bg-white/5 hover:border-pink-400 hover:bg-pink-500/5'
      }`}
      onClick={() => setSelectedTemplate('creative')}
    >
      <div className="text-center">
        <div className="w-20 h-28 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-xl mx-auto mb-4 shadow-lg"></div>
        <h4 className="text-xl font-bold text-white mb-2">Creative</h4>
        <p className="text-sm text-gray-300">Colorful UI • White PDF</p>
        {selectedTemplate === 'creative' && (
          <span className="inline-block mt-3 px-4 py-1 bg-pink-500 text-white text-xs rounded-full animate-pulse">
            Selected
          </span>
        )}
      </div>
    </div>

  </div>
</div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-6 py-3 rounded-xl transition ${
                  activeTab === 'form' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Form Builder
              </button>
              <button
                 onClick={() => {
    setIsGenerating(false);
    setActiveTab('preview');
  }}
                className={`px-6 py-3 rounded-xl transition ${
                  activeTab === 'preview' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'form' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.personalInfo.fullName}
                        onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.personalInfo.email}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.personalInfo.phone}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="+94 77 123 4567"
                      />
                    </div>

                    {/* Profile Photo Upload */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm text-gray-300 mb-2">Profile Photo (Modern template only)</label>
                      <div className="flex items-center gap-4">
<div className="w-20 h-20 bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center">
                          {formData.personalInfo.photo ? (
                            <img src={formData.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-gray-400 text-sm px-2">No photo</div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input id="photo-upload" type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e)} className="hidden" />
                          <label htmlFor="photo-upload" className="px-4 py-2 bg-white/10 rounded-2xl cursor-pointer hover:bg-white/20">Upload Photo</label>
                          <button onClick={() => setFormData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, photo: '' } }))} className="px-4 py-2 bg-white/10 rounded-2xl hover:bg-white/20">Remove</button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Recommended: square image, at least 400×400 for good print quality.</p>
<p className="text-xs text-gray-400 mt-1">Allowed types: JPG, PNG, WebP. Max size: 2 MB.</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.personalInfo.address}
                        onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="Colombo, Sri Lanka"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">LinkedIn</label>
                      <input
                        type="url"
                        value={formData.personalInfo.linkedin}
                        onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">GitHub</label>
                      <input
                        type="url"
                        value={formData.personalInfo.github}
                        onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Summary - Updated with AI Button */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Professional Summary</h3>
                    
                    {/* AI Generate Button */}
                    <button
  onClick={generateAiSummary}
  disabled={isAiLoading}
  className="flex items-center gap-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50"
>
  {isAiLoading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" /> Writing...
    </>
  ) : (
    <>
      <Wand2 className="w-4 h-4" /> Auto-Write with AI
    </>
  )}
</button>
                  </div>
                  
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Write a compelling summary or use the AI button to generate one based on your skills and experience..."
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition h-48 resize-none backdrop-blur-sm"
                  />
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {formData.summary.split(/\s+/).filter(word => word.length > 0).length} words
                  </p>
                </div>

                {/* Soft Skills - CORRECTED */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5" /> Soft Skills
                  </h3>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white h-32"
                    placeholder="List your key skills..."
                  />
                </div>

                {/* Technical Skills - NEW SECTION */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5" /> Technical Skills
                  </h3>
                  <textarea value={formData.technicalSkills} onChange={(e) => handleTextChange('technicalSkills', e.target.value)} className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white h-32" placeholder="List your technical skills (Languages, Frameworks, Tools)..." />
                </div>

                {/* GitHub Integration */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    GitHub Projects Integration
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                      <p className="text-gray-300 text-sm mb-4">
                        Enter your GitHub username to automatically fetch and add your repositories as projects to your resume.
                      </p>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          className="flex-1 rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                          placeholder="Enter GitHub username (e.g., octocat)"
                        />
                        <button
                          onClick={fetchGithubProjects}
                          disabled={isFetchingGithub || !githubUsername.trim()}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-xl transition"
                        >
                          {isFetchingGithub ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Fetching...
                            </>
                          ) : (
                            <>
                              <Github className="w-4 h-4" />
                              Fetch Projects
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {githubProjects.length > 0 && (
                      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Fetched Projects ({githubProjects.length})
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {githubProjects.map((project, index) => (
                            <div key={index} className="bg-slate-800/50 rounded-xl p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-medium text-sm">{project.title}</span>
                                    {project.language && (
                                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                        {project.language}
                                      </span>
                                    )}
                                    {project.topics && project.topics.length > 0 && (
                                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                        {project.topics[0]}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-gray-300 text-xs mb-2">
                                    {project.description.split('\n')[0]}
                                  </div>
                                  {project.description.includes('Project Type:') && (
                                    <div className="text-blue-300 text-xs mb-1 font-medium">
                                      📋 {project.description.split('Project Type:')[1]?.split('\n')[0]}
                                    </div>
                                  )}
                                  {project.description.includes('Technologies:') && (
                                    <div className="text-gray-400 text-xs mb-1">
                                      🔧 {project.description.split('Technologies:')[1]?.split('\n')[0]}
                                    </div>
                                  )}
                                  {project.description.includes('Key Features:') && (
                                    <div className="text-gray-400 text-xs mb-2">
                                      ⭐ {project.description.split('Key Features:')[1]?.split('\n')[0]}
                                    </div>
                                  )}
                                </div>
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 transition ml-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  ⭐ {project.stars}
                                </span>
                                <span className="flex items-center gap-1">
                                  🍴 {project.forks}
                                </span>
                                <span className="flex items-center gap-1">
                                  👀 {project.watchers}
                                </span>
                                <span className="flex items-center gap-1">
                                  📅 {project.startDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  📦 {Math.round(project.size / 1024)}KB
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Work Experience
                    </h3>
                    <button
                      onClick={() => {
                        setCurrentEntry({ ...currentEntry, type: 'experience' });
                        setShowEntryForm(true);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Experience
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{exp.title}</h4>
                            <p className="text-gray-300 text-sm">{exp.company}</p>
                            <p className="text-gray-400 text-xs">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => { setCurrentEntry({ ...exp, index, type: 'experience' }); setShowEntryForm(true); }}
                              className="text-blue-400 hover:text-blue-300 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeEntry('experience', index)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </h3>
                    <button
                      onClick={() => {
                        setCurrentEntry({ ...currentEntry, type: 'education' });
                        setShowEntryForm(true);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{edu.title}</h4>
                            <p className="text-gray-300 text-sm">{edu.company}</p>
                            <p className="text-gray-400 text-xs">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => { setCurrentEntry({ ...edu, index, type: 'education' }); setShowEntryForm(true); }}
                              className="text-blue-400 hover:text-blue-300 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeEntry('education', index)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Projects
                    </h3>
                    <button
                     onClick={() => {
  setCurrentEntry({
    type: "projects",
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    index: undefined
  });
  setShowEntryForm(true);
}}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition"
                    >
                      <Plus className="w-10 h-4" />
                      Add Project
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.projects.map((proj, index) => (
                      <div key={index} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{proj.title}</h4>
                            <p className="text-gray-300 text-sm">{proj.company}</p>
                            <p className="text-gray-400 text-xs">{proj.startDate} - {proj.current ? 'Present' : proj.endDate}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
  <button
    onClick={() => {
      setCurrentEntry({ ...proj, index, type: "projects" });
      setShowEntryForm(true);
    }}
    className="text-blue-400 hover:text-blue-300 transition"
  >
    Edit
  </button>

  <button
    onClick={() => removeEntry('projects', index)}
    className="text-red-400 hover:text-red-300 transition"
  >
    <X className="w-4 h-4" />
  </button>
</div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* References - NEW SECTION */}
                {/* --- UPDATED REFERENCES SECTION WITH EDIT BUTTON --- */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5" /> References
                    </h3>
                    <button
                      onClick={() => {
                        setCurrentEntry({
                          type: 'references',
                          title: '',
                          company: '',
                          location: '',
                          description: '',
                          current: false
                        });
                        setShowEntryForm(true);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition"
                    >
                      <Plus className="w-4 h-4" /> Add Reference
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.references.map((ref, index) => (
                      <div key={index} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{ref.title}</h4>
                            <p className="text-gray-300 text-sm">{ref.company}</p>
                            <p className="text-gray-400 text-xs">{ref.description}</p>
                          </div>
                          <div className="flex gap-2"> {/* Added Wrapper for Edit/Delete Buttons */}
                            <button
                                onClick={() => {
                                  setCurrentEntry({ ...ref, index, type: 'references' }); // Load Data for Editing
                                  setShowEntryForm(true);
                                }}
                                className="text-blue-400 hover:text-blue-300 transition"
                            >
                                Edit
                            </button>
                            <button onClick={() => removeEntry('references', index)} className="text-red-400 hover:text-red-300 transition">
                                <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Assistant
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={generateResume}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Generate with AI
                      </>
                    )}
                  </button>
                  <div className="text-sm text-gray-400">
                    AI can help you:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Optimize your summary</li>
                      <li>Suggest better skills</li>
                      <li>Improve descriptions</li>
                      <li>ATS optimization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

{activeTab === 'preview' && (
  <div className="max-w-4xl mx-auto my-10">
    {/* Clean & Single Download Button */}
    <div className="flex justify-end gap-3 mb-4">
      <input ref={fileInputRef} type="file" accept="application/pdf,text/plain" className="hidden" onChange={handleUploadResumeFile} />
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePreviewPhotoUpload} />

      <button onClick={() => fileInputRef.current?.click()} className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20">
        {isImportingResume ? <Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> : null}
        Upload Resume (PDF/TXT)
      </button>

      <button onClick={() => setShowPasteBox(prev => !prev)} className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20">{showPasteBox ? 'Close Paste' : 'Paste Text'}</button>

      <button onClick={() => photoInputRef.current?.click()} className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20">Change Photo</button>

      <button onClick={() => handlePersonalInfoChange('photo', '')} className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20">Remove Photo</button>

      <button onClick={() => setIsInlineEdit(prev => !prev)} className={`px-4 py-2 rounded-2xl font-semibold ${isInlineEdit ? 'bg-yellow-500 text-white' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}>{isInlineEdit ? 'Exit Edit' : 'Edit Preview'}</button>
      {isInlineEdit && (
        <button onClick={saveResume} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-2xl">Save Changes</button>
      )}

      <button
        onClick={downloadPDF}
        disabled={isGenerating}
        className={`flex items-center gap-3 px-6 py-2 rounded-2xl text-white font-semibold hover:shadow-2xl transition disabled:opacity-50 shadow-lg
          ${selectedTemplate === 'modern'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            : selectedTemplate === 'classic'
            ? 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950'
            : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600'
          }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-6 h-6" />
            Download PDF
          </>
        )}
      </button>
    </div>

    {showPasteBox && (
      <div className="mb-4">
        <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Paste your resume text here" className="w-full p-3 bg-slate-900 text-gray-200 rounded-lg" rows={6} />
        <div className="flex gap-3 mt-2 justify-end">
          <button onClick={() => { setPasteText(''); setShowPasteBox(false); }} className="px-4 py-2 rounded-2xl bg-white/10">Cancel</button>
          <button onClick={importPastedResume} disabled={isImportingResume} className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            {isImportingResume ? <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> : null}
            Import Text
          </button>
        </div>
      </div>
    )}

    {/* Only ONE Resume Preview – Clean & Perfect */}

    <div className="bg-white p-8 rounded-2xl shadow-2xl overflow-hidden">

        <div 
  id="resume-pdf-content"
  className="mx-auto shadow-2xl rounded-2xl overflow-hidden"
  style={{
    width: '210mm',           // A4 width
    minHeight: '297mm',        // A4 height
    padding: '18mm 15mm',      // Restored top padding for original layout
    boxSizing: 'border-box',
    background: 'white',
    margin: '20px auto',
    fontSize: '11pt',          // Print-friendly font size
    lineHeight: '1.5',
  }}
>
  {generateProfessionalCV()}
</div>
    </div>
  </div>
)}

          {/* Entry Form Modal */}
          {/* Entry Form Modal - Cleaned & Single Form */}
{showEntryForm && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
      <h3 className="text-xl font-semibold text-white mb-6 capitalize">
        {currentEntry.index !== undefined ? 'Edit' : 'Add'} {currentEntry.type === 'references' ? 'Reference' : currentEntry.type}
      </h3>
      
      <div className="space-y-4">
        {/* Title & Company Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              {currentEntry.type === 'references' ? 'Full Name' : currentEntry.type === 'education' ? 'Degree/Field' : 'Title'}
            </label>
            <input 
              type="text" 
              value={currentEntry.title} 
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))} 
              className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none" 
              placeholder="e.g. Software Engineer / BSc in IT" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              {currentEntry.type === 'references' ? 'Position & Company' : 'Institution / Company'}
            </label>
            <input 
              type="text" 
              value={currentEntry.company} 
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, company: e.target.value }))} 
              className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none" 
              placeholder="Company or School Name" 
            />
          </div>
        </div>

        {/* Location (Hide for references if you want, or keep it) */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">Location</label>
          <input
            type="text"
            value={currentEntry.location}
            onChange={(e) => setCurrentEntry(prev => ({ ...prev, location: e.target.value }))}
            className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
            placeholder="City, Country"
          />
        </div>

        {/* Dates - Hide only for References */}
        {currentEntry.type !== 'references' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Start Date</label>
                <input
                  type="month"
                  value={currentEntry.startDate}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">End Date</label>
                <input
                  type="month"
                  value={currentEntry.endDate}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={currentEntry.current}
                  className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white disabled:opacity-50 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="current_checkbox"
                checked={currentEntry.current}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, current: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="current_checkbox" className="text-sm text-gray-300">Present / Currently ongoing</label>
            </div>
          </>
        )}

        {/* Description / Contact Info */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            {currentEntry.type === 'references' ? 'Contact Information' : 'Description / Achievements'}
          </label>
          <textarea
            value={currentEntry.description}
            onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white h-32 resize-none focus:ring-2 focus:ring-purple-500/50 outline-none"
            placeholder={currentEntry.type === 'references' ? "Phone: +94... | Email: john@doe.com" : "Describe your key responsibilities and wins..."}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={() => setShowEntryForm(false)}
          className="px-6 py-3 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition border border-white/10"
        >
          Cancel
        </button>
        <button
          onClick={addEntry}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition font-medium"
        >
          {currentEntry.index !== undefined ? 'Update Entry' : 'Add to Resume'}
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      </section>
    
    </div>
    
  );
}
