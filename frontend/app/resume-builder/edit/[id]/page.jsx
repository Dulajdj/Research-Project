'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Download, Sparkles, Plus, Github, X, Loader2, User, Code } from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas-pro';  
import { jsPDF } from 'jspdf';

// backend base URL; override with NEXT_PUBLIC_API_URL in production
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // backend base URL

export default function ResumeBuilderEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [activeTab, setActiveTab] = useState('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGithubImport, setShowGithubImport] = useState(false);
const [githubUsername, setGithubUsername] = useState('');
const [isFetchingGithub, setIsFetchingGithub] = useState(false);

// Inline preview editing & upload
const [isInlineEdit, setIsInlineEdit] = useState(false);
const fileInputRef = useRef(null);
const photoInputRef = useRef(null);
const [uploadedFileName, setUploadedFileName] = useState('');

// Handle photo upload from Preview toolbar
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const validateImageFile = (file) => {
  if (!file) return { ok: false, reason: 'No file' };
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) return { ok: false, reason: 'TYPE' };
  if (file.size > MAX_PHOTO_SIZE) return { ok: false, reason: 'SIZE' };
  return { ok: true };
};

const handlePreviewPhotoUpload = (e) => {
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
    toast.success('Profile photo updated');
  };
  reader.onerror = (err) => {
    console.error('Preview photo read error', err);
    toast.error('Failed to read image file');
  };
  reader.readAsDataURL(file);
  // reset input
  e.target.value = '';
};

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      website: ''
    },
    summary: '',
    skills: '',
    technicalSkills: '',
    experience: [],
    education: [],
    projects: [],
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

  // Allow clicking any project title in the preview to open an edit dialog
  useEffect(() => {
    const el = document.getElementById('resume-pdf-content');
    if (!el) return;

    const handler = (e) => {
      const h3 = e.target.closest && e.target.closest('h3');
      if (!h3) return;
      const title = h3.textContent?.trim();
      if (!title) return;

      const index = formData.projects.findIndex(p => (p.title || '').trim() === title);
      if (index !== -1) {
        setCurrentEntry({ ...formData.projects[index], type: 'projects', index });
        setShowEntryForm(true);
      }
    };

    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [formData.projects]);

useEffect(() => {
  if (!id) return;

  // If we just saved a resume on the Create page, there may be a short-lived cached object in sessionStorage
  try {
    const cached = sessionStorage.getItem('recentlySavedResume');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed._id === id) {
        // Use the recently-saved object immediately so the photo (and other data) appear while we fetch the authoritative record
        setFormData({
          personalInfo: {
            fullName: parsed.personalInfo?.fullName || '',
            email: parsed.personalInfo?.email || '',
            phone: parsed.personalInfo?.phone || '',
            address: parsed.personalInfo?.address || '',
            linkedin: parsed.personalInfo?.linkedin || '',
            github: parsed.personalInfo?.github || '',
            website: parsed.personalInfo?.website || '',
            photo: parsed.personalInfo?.photo || ''
          },
          summary: parsed.summary || '',
          skills: parsed.skills || '',
          technicalSkills: parsed.technicalSkills || '',
          experience: Array.isArray(parsed.experience) ? parsed.experience : [],
          education: Array.isArray(parsed.education) ? parsed.education : [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : [],
          references: Array.isArray(parsed.references) ? parsed.references : [],
          selectedTemplate: parsed.selectedTemplate || 'modern'
        });

        // Debug/UX: inform the user whether the cached resume includes a photo
        try {
          if (parsed.personalInfo?.photo) {
            toast.success('Loaded recently-saved resume (photo present)');
          } else {
            toast('Loaded recently-saved resume (no photo)');
          }
        } catch (tErr) { /* ignore toast errors */ }

        // remove short-lived cache
        try { sessionStorage.removeItem('recentlySavedResume'); } catch (e) { /* ignore */ }
      }
    }
  } catch (err) {
    /* ignore parse errors */
  }

  const loadResume = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE}/api/resume?id=${id}&t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error('Resume not found');
      }

      const data = await res.json();
      console.log('Loaded data:', data); // ← මේක දාලා බලන්න console එකේ

      try {
        if (data.personalInfo?.photo) {
          toast.success('Server returned resume with photo');
        } else {
          toast('Server returned resume without photo');
        }
      } catch (tErr) { /* ignore toast errors */ }

      setFormData({
        personalInfo: {
          fullName: data.personalInfo?.fullName || '',
          email: data.personalInfo?.email || '',
          phone: data.personalInfo?.phone || '',
          address: data.personalInfo?.address || '',
          linkedin: data.personalInfo?.linkedin || '',
          github: data.personalInfo?.github || '',
          website: data.personalInfo?.website || '',
          photo: data.personalInfo?.photo || ''
        },
        summary: data.summary || '',
        skills: data.skills || '',
        technicalSkills: data.technicalSkills || '',
        experience: Array.isArray(data.experience) ? data.experience : [],
        education: Array.isArray(data.education) ? data.education : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        references: Array.isArray(data.references) ? data.references : []
      });

      setSelectedTemplate(data.selectedTemplate || 'modern');

      toast.success('Resume loaded successfully!');
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load resume');
      router.push('/resume-builder/saved');
    } finally {
      setIsLoading(false);
    }
  };

  loadResume();
}, [id, router]);

const fetchGithubProjects = async () => {
  if (!githubUsername.trim()) {
    toast.error('GitHub username එක දාන්න!');
    return;
  }

  setIsFetchingGithub(true);

  fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=15`)
    .then(res => {
      if (!res.ok) throw new Error('cannot find user');
      return res.json();
    })
    .then(repos => {
      const newProjects = repos.map(repo => ({
        title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
        company: repo.full_name,
        description: repo.description || 'No description available',
        url: repo.html_url,
        language: repo.language || '',
        startDate: new Date(repo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        endDate: 'Present',
        current: true
      }));

      // Add to existing projects
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, ...newProjects]
      }));

      toast.success(`${newProjects.length} projects GitHub එකෙන් ගත්තා!`);
      setShowGithubImport(false);
      setGithubUsername('');
    })
    .catch(err => {
      toast.error(err.message || 'GitHub fetch කරන්න බැරිවුණා');
    })
    .finally(() => {
      setIsFetchingGithub(false);
    });
};

// Upload resume JSON and autofill form
const handleUploadResume = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploadedFileName(file.name);

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const json = JSON.parse(ev.target.result);
      // Merge and sanitize fields
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...(json.personalInfo || {}) },
        summary: json.summary || prev.summary,
        skills: json.skills || prev.skills,
        technicalSkills: json.technicalSkills || prev.technicalSkills,
        experience: Array.isArray(json.experience) ? json.experience : prev.experience,
        education: Array.isArray(json.education) ? json.education : prev.education,
        projects: Array.isArray(json.projects) ? json.projects : prev.projects,
        references: Array.isArray(json.references) ? json.references : prev.references
      }));

      toast.success('Resume data imported and autofilled!');
    } catch (err) {
      console.error('Upload parse error:', err);
      toast.error('Failed to parse JSON file. Please upload a valid resume JSON.');
    } finally {
      // reset file input
      e.target.value = '';
    }
  };
  reader.readAsText(file);
};

  const saveResume = async () => {
    if (!formData.personalInfo.fullName?.trim()) {
      toast.error('Full Name is required!');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/resume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          personalInfo: formData.personalInfo,
          summary: formData.summary,
          skills: formData.skills,
          technicalSkills: formData.technicalSkills, // Save Technical Skills
          experience: formData.experience,
          education: formData.education,
          projects: formData.projects,
          references: formData.references,           // Save References
          selectedTemplate
        })
      });

      if (res.ok) {
        toast.success('Resume updated successfully!');
        document.title = `${formData.personalInfo.fullName.trim()} - Resume Builder`;
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonalInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addEntry = () => {
  if (!currentEntry.title?.trim() || !currentEntry.company?.trim()) {
    toast.error('Title and Company/University required');
    return;
  }

  setFormData(prev => {
    const updated = { ...prev };

    // EDIT MODE
    if (currentEntry.index !== undefined) {
      const list = [...updated[currentEntry.type]];
      list[currentEntry.index] = { ...currentEntry };
      updated[currentEntry.type] = list;
    }
    // ADD MODE
    else {
      updated[currentEntry.type] = [...updated[currentEntry.type], { ...currentEntry }];
    }

    return updated;
  });

  // Reset form
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
  toast.success(currentEntry.index !== undefined ? "Updated!" : "Added!");
};


  const removeEntry = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-6" />
          <p className="text-2xl text-white font-medium">Loading your resume...</p>
        </div>
      </div>
    );
  }

  const generateResume = () => {
  setIsGenerating(true);
  
  setTimeout(() => {
    setIsGenerating(false);
    toast.custom((t) => (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          <div>
            <p className="font-bold text-lg">AI Feature Coming Soon!</p>
            <p className="text-sm opacity-90">We're training the AI to write perfect resumes</p>
          </div>
        </div>
      </div>
    ), { duration: 6000 });
  }, 2000);
};

  const downloadPDF = async () => {
  setIsGenerating(true);

  try {
    const element = document.getElementById('resume-pdf-content');
    if (!element) {
      toast.error('Preview not ready!');
      return;
    }

    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 15; // mm

    const mmToPx = (mm) => mm * 3.779527559;
    const pdfWidthMm = pdf.internal.pageSize.getWidth();
    const availableWidthMm = pdfWidthMm - 2 * margin;
    const targetWidthPx = Math.round(mmToPx(availableWidthMm));

    // Try text-based rendering using jsPDF.html (selectable text)
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
          const filename = `${formData.personalInfo.fullName || 'Resume'}_A4_Text.pdf`;
          doc.save(filename);
          toast.success('Text-based PDF downloaded — selectable & print-ready!');
        },
        autoPaging: 'text'
      });

      setIsGenerating(false);
      return;

    } catch (err) {
      console.warn('Text-based PDF failed, falling back to image render:', err);

      try {
        const html2canvas = (await import('html2canvas-pro')).default;

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
        const pdfWidth = pdf.internal.pageSize.getWidth();    // mm
        const pdfHeight = pdf.internal.pageSize.getHeight();   // mm

        const pxToMm = (px) => px / 3.779527559;
        const imgWidthMm = pxToMm(canvas.width);
        const imgHeightMm = pxToMm(canvas.height);

        const availableWidthMm2 = pdfWidth - 2 * margin;
        const availableHeightMm = pdfHeight - 2 * margin;

        const scale = Math.min(availableWidthMm2 / imgWidthMm, 1);
        const finalWidthMm = imgWidthMm * scale;
        const finalHeightMm = imgHeightMm * scale;

        if (finalHeightMm <= availableHeightMm) {
          pdf.addImage(imgData, 'PNG', margin, margin, finalWidthMm, finalHeightMm);
        } else {
          let positionYmm = 0;
          let pageCount = 0;
          while (positionYmm < finalHeightMm) {
            if (pageCount > 0) pdf.addPage();

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

        pdf.save(`${formData.personalInfo.fullName || 'Resume'}_A4_Print_Ready.pdf`);
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

const generateProfessionalCV = () => {
  const { personalInfo, summary, skills, technicalSkills, experience, education, projects, references } = formData;

  // Helper to render projects list with inline Edit button
  const renderProjectsList = (itemClass = 'mb-8 pl-8 border-l-4 border-black') => {
    return projects.map((proj, i) => (
      <div key={i} className={`${itemClass} relative`}>
        <div className="absolute right-0 top-0">
          <button onClick={() => { setCurrentEntry({ ...proj, type: 'projects', index: i }); setShowEntryForm(true); }} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Edit</button>
        </div>

        <h3 onClick={() => { setCurrentEntry({ ...proj, type: 'projects', index: i }); setShowEntryForm(true); }} className="text-xl font-bold text-gray-900 cursor-pointer" title="Edit project">{proj.title}</h3>
        {proj.url && (
          <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block mt-2">View Project</a>
        )}
        <p className="text-sm italic text-gray-600 mt-1">{proj.startDate} – {proj.current ? 'Present' : proj.endDate || 'Present'}</p>
        <p className="mt-3 text-gray-700">{proj.description || 'No description available'}</p>
      </div>
    ));
  };

  // ============= MODERN TEMPLATE - Create page එකේ 100% SAME =============
  if (selectedTemplate === 'modern') {
    return (
      <div className="cv-template cv-modern bg-white" style={{ padding: '20mm', fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="cv-header text-center mb-12 pb-8 border-b-4">
          {isInlineEdit ? (
  <div className="text-center mb-8">
    {personalInfo.photo && (
      <div className="mx-auto mb-4 w-40 h-40 overflow-hidden border-4 ">
        <img src={personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
      </div>
    )}
    <input value={personalInfo.fullName} onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)} className="w-full text-center text-4xl font-bold text-gray-900 mb-4 px-2 py-2 border rounded" />
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-lg">
      <input value={personalInfo.email} onChange={(e) => handlePersonalInfoChange('email', e.target.value)} className="px-3 py-1 border rounded text-sm" placeholder="email@example.com" />
      <input value={personalInfo.phone} onChange={(e) => handlePersonalInfoChange('phone', e.target.value)} className="px-3 py-1 border rounded text-sm" placeholder="Phone" />
      <input value={personalInfo.address} onChange={(e) => handlePersonalInfoChange('address', e.target.value)} className="px-3 py-1 border rounded text-sm" placeholder="Location" />
      <input value={personalInfo.linkedin} onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)} className="px-3 py-1 border rounded text-sm" placeholder="LinkedIn URL" />
      <input value={personalInfo.github} onChange={(e) => handlePersonalInfoChange('github', e.target.value)} className="px-3 py-1 border rounded text-sm" placeholder="GitHub URL" />
    </div>
  </div>
) : (
  <>
    {personalInfo.photo && (
      <div className="mx-auto mb-4 w-40 h-40 overflow-hidden border-4 ">
        <img src={personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
      </div>
    )}
    <h1 className="cv-name text-5xl font-bold text-gray-900 mb-8">
      {personalInfo.fullName || 'Your Name'}
    </h1>
    <div className="cv-contact flex flex-wrap justify-center gap-x-10 gap-y-3 text-lg text-gray-700">
      {personalInfo.email && <span>Email: {personalInfo.email}</span>}
      {personalInfo.phone && <span>Phone: {personalInfo.phone}</span>}
      {personalInfo.address && <span>Location: {personalInfo.address}</span>}
      {personalInfo.linkedin && (
        <a 
          href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium"
        >
          LinkedIn: {personalInfo.linkedin.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
        </a>
      )}

      {personalInfo.github && (
        <a 
          href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-800 hover:underline font-medium"
        >
          GitHub: {personalInfo.github.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
        </a>
      )}
    </div>
  </>
)}
        </div>

        {/* Blue Line */}
        <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-12"></div>

        {/* Professional Summary */}
        {(summary || isInlineEdit) && (
          <div className="cv-section mb-12">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">
              PROFESSIONAL SUMMARY
            </h2>
            {isInlineEdit ? (
              <textarea value={summary} onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))} className="w-full p-4 border rounded text-lg text-gray-800" />
            ) : (
              <p className="cv-summary text-gray-700 text-lg leading-relaxed">{summary}</p>
            )}
          </div>
        )}

        {/* Skills */}
        {(skills || isInlineEdit) && (
          <div className="cv-section mb-12">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">
              SKILLS
            </h2>
            {isInlineEdit ? (
              <textarea value={skills} onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))} className="w-full p-4 border rounded text-lg text-gray-800" />
            ) : (
              <p className="cv-skills text-gray-700 text-lg">{skills}</p>
            )}
          </div>
        )}

        {/* PREVIEW: Technical Skills */}
          {technicalSkills && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">TECHNICAL SKILLS</h2>
              {isInlineEdit ? (
                <textarea value={technicalSkills} onChange={(e) => setFormData(prev => ({ ...prev, technicalSkills: e.target.value }))} className="w-full p-4 border rounded text-lg text-gray-800" />
              ) : (
                <p className="text-gray-700 text-lg">{technicalSkills}</p>
              )}
            </div>
          )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <div className="cv-section mb-12">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">
              WORK EXPERIENCE
            </h2>
            {experience.map((exp, i) => (
              <div key={i} className="cv-item mb-10 pl-10 border-l-4 border-blue-500 relative">
                {isInlineEdit && (
                  <div className="absolute right-0 top-0">
                    <button onClick={() => { setCurrentEntry({ ...exp, type: 'experience', index: i }); setShowEntryForm(true); }} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Edit</button>
                  </div>
                )}
                <h3 className="cv-item-title text-2xl font-bold text-gray-900">{exp.title}</h3>
                <p className="cv-item-company text-xl text-blue-600 font-semibold mt-2">{exp.company}</p>
                <p className="text-gray-600 italic mt-1">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate} • {exp.location || 'Remote'}
                </p>
                <p className="cv-item-description mt-4 text-gray-700 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="cv-section mb-12">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">
              EDUCATION
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="cv-item mb-10 pl-10 border-l-4 border-blue-500 relative">
                {isInlineEdit && (
                  <div className="absolute right-0 top-0">
                    <button onClick={() => { setCurrentEntry({ ...edu, type: 'education', index: i }); setShowEntryForm(true); }} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Edit</button>
                  </div>
                )}
                <h3 className="cv-item-title text-2xl font-bold text-gray-900">{edu.title}</h3>
                <p className="cv-item-company text-xl text-blue-600 font-semibold mt-2">{edu.company}</p>
                <p className="text-gray-600 italic mt-1">
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </p>
                <p className="cv-item-description mt-4 text-gray-700">{edu.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="cv-section">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">
              PROJECTS
            </h2>
            {renderProjectsList('cv-item mb-10 pl-10 border-l-4 border-purple-500')}
          </div>
        )}

        {/* PREVIEW: References */}
          {references.length > 0 && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">REFERENCES</h2>
              <div className="grid grid-cols-2 gap-6">
                {references.map((ref, i) => (
                   <ReferenceItem key={i} refData={ref} />
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  // ============= CLASSIC TEMPLATE =============
  if (selectedTemplate === 'classic') {
    return (
      <div className="cv-template cv-classic bg-white" style={{ padding: '20mm', fontFamily: 'Arial, sans-serif' }}>
        <div className="cv-header text-center border-b-4 border-black pb-8 mb-12">
          <h1 className="cv-name text-5xl font-bold text-black mb-6">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="cv-contact text-lg space-y-2">
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.address && <div>{personalInfo.address}</div>}
            {personalInfo.linkedin && <div>LinkedIn: {personalInfo.linkedin.replace(/^https?:\/\//, '')}</div>}
            {personalInfo.github && <div>GitHub: {personalInfo.github.replace(/^https?:\/\//, '')}</div>}
          </div>
        </div>

        {summary && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-4">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {skills && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-4">
              TECHNICAL SKILLS
            </h2>
            <p className="text-gray-700">{skills}</p>
          </div>
        )}

        {/* PREVIEW: Technical Skills */}
          {technicalSkills && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">TECHNICAL SKILLS</h2>
              <p className="text-gray-700 text-lg">{technicalSkills}</p>
            </div>
          )}

        {experience.length > 0 && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              WORK EXPERIENCE
            </h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black relative">
                {isInlineEdit && (
                  <div className="absolute right-0 top-0">
                    <button onClick={() => { setCurrentEntry({ ...exp, type: 'experience', index: i }); setShowEntryForm(true); }} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Edit</button>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                <p className="font-semibold text-gray-800 mt-1">{exp.company}</p>
                <p className="text-sm italic text-gray-600 mt-1">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </p>
                <p className="mt-3 text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              EDUCATION
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{edu.title}</h3>
                <p className="font-semibold text-gray-800 mt-1">{edu.company}</p>
                <p className="text-sm italic text-gray-600 mt-1">
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </p>
                <p className="mt-3 text-gray-700">{edu.description}</p>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="cv-section">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              PROJECTS
            </h2>
            {projects.map((proj, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{proj.title}</h3>
                {proj.url && (
                  <a href={proj.url} target="_blank" className="text-blue-600 hover:underline block mt-2">
                    View Project
                  </a>
                )}
                <p className="text-sm italic text-gray-600 mt-1">
                  {proj.startDate} – {proj.current ? 'Present' : proj.endDate || 'Present'}
                </p>
                <p className="mt-3 text-gray-700">{proj.description || 'No description available'}</p>
              </div>
            ))}
          </div>
        )}

        {/* PREVIEW: References */}
          {references.length > 0 && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">REFERENCES</h2>
              <div className="grid grid-cols-2 gap-6">
                {references.map((ref, i) => (
                   <ReferenceItem key={i} refData={ref} />
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  // ============= CREATIVE TEMPLATE =============
  if (selectedTemplate === 'creative') {
   return (
      <div className="cv-template cv-classic bg-white" style={{ padding: '20mm', fontFamily: 'Arial, sans-serif' }}>
        <div className="cv-header text-center border-b-4 border-black pb-8 mb-12">
          <h1 className="cv-name text-5xl font-bold text-black mb-6">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="cv-contact text-lg space-y-2">
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.address && <div>{personalInfo.address}</div>}
            {personalInfo.linkedin && <div>LinkedIn: {personalInfo.linkedin.replace(/^https?:\/\//, '')}</div>}
            {personalInfo.github && <div>GitHub: {personalInfo.github.replace(/^https?:\/\//, '')}</div>}
          </div>
        </div>

        {summary && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-4">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {skills && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-4">
              TECHNICAL SKILLS
            </h2>
            <p className="text-gray-700">{skills}</p>
          </div>
        )}

        {/* PREVIEW: Technical Skills */}
          {technicalSkills && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">TECHNICAL SKILLS</h2>
              <p className="text-gray-700 text-lg">{technicalSkills}</p>
            </div>
          )}

        {experience.length > 0 && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              WORK EXPERIENCE
            </h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                <p className="font-semibold text-gray-800 mt-1">{exp.company}</p>
                <p className="text-sm italic text-gray-600 mt-1">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </p>
                <p className="mt-3 text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              EDUCATION
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{edu.title}</h3>
                <p className="font-semibold text-gray-800 mt-1">{edu.company}</p>
                <p className="text-sm italic text-gray-600 mt-1">
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </p>
                <p className="mt-3 text-gray-700">{edu.description}</p>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="cv-section">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              PROJECTS
            </h2>
            {projects.map((proj, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{proj.title}</h3>
                {proj.url && (
                  <a href={proj.url} target="_blank" className="text-blue-600 hover:underline block mt-2">
                    View Project
                  </a>
                )}
                <p className="text-sm italic text-gray-600 mt-1">
                  {proj.startDate} – {proj.current ? 'Present' : proj.endDate || 'Present'}
                </p>
                <p className="mt-3 text-gray-700">{proj.description || 'No description available'}</p>
              </div>
            ))}
          </div>
        )}

        {/* PREVIEW: References */}
          {references.length > 0 && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">REFERENCES</h2>
              <div className="grid grid-cols-2 gap-6">
                {references.map((ref, i) => (
                   <ReferenceItem key={i} refData={ref} />
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  return null;
};

 return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/90 border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/resume-builder/saved" className="flex items-center gap-2 text-purple-300 hover:text-white">
              <ArrowLeft /> Back to Saved
            </Link>
            <div className="flex gap-4">
              <button onClick={saveResume} disabled={isSaving} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:shadow-xl disabled:opacity-70">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Update Resume
              </button>
              <button onClick={downloadPDF} disabled={isGenerating} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:shadow-xl disabled:opacity-70">
                {isGenerating ? <Loader2 className="animate-spin" /> : <Download />} Download PDF
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold text-center text-white mb-10">
            Editing: <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {formData.personalInfo.fullName || 'Untitled'}
            </span>
          </h1>

          {/* Template Selector */}
          <div className="flex justify-center gap-6 mb-10">
            {['modern', 'classic', 'creative'].map(t => (
              <button key={t} onClick={() => setSelectedTemplate(t)} className={`px-8 py-3 rounded-2xl font-bold capitalize transition ${selectedTemplate === t ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-6 mb-10">
            <button onClick={() => setActiveTab('form')} className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'form' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
              Form Builder
            </button>
            <button onClick={() => setActiveTab('preview')} className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'preview' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
              Preview
            </button>
          </div>

          {/* FORM TAB - FULLY FIXED */}
          {activeTab === 'form' && (
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="space-y-10">

                {/* Personal Information */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(formData.personalInfo).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-purple-200 mb-2 capitalize">
                          {key === 'fullName' ? 'Full Name' : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </label>

                        {key === 'photo' ? (
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center">
                              {value ? (
                                <img src={value} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-gray-400 text-sm px-2">No photo</div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <input id={`photo-upload-${key}`} type="file" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const validation = validateImageFile(file);
                                if (!validation.ok) {
                                  if (validation.reason === 'TYPE') toast.error('Invalid image type. Please upload JPG, PNG, or WebP.');
                                  else if (validation.reason === 'SIZE') toast.error('Image is too large. Max size is 2 MB.');
                                  e.target.value = '';
                                  return;
                                }

                                const reader = new FileReader();
                                reader.onload = (ev) => handlePersonalInfoChange('photo', ev.target.result);
                                reader.readAsDataURL(file);
                                e.target.value = '';
                              }} className="hidden" />

                              <label htmlFor={`photo-upload-${key}`} className="px-4 py-2 bg-white/10 rounded-2xl cursor-pointer hover:bg-white/20">Upload Photo</label>
                              <button onClick={() => handlePersonalInfoChange('photo', '')} className="px-4 py-2 bg-white/10 rounded-2xl hover:bg-white/20">Remove</button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Allowed types: JPG, PNG, WebP. Max size: 2 MB. Recommended: square image 400×400+</p>
                          </div>
                        ) : (
                          <input
                            type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                            value={value}
                            onChange={(e) => handlePersonalInfoChange(key, e.target.value)}
                            className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition backdrop-blur-sm"
                            placeholder={key === 'fullName' ? 'Dulaj Jayasundara' : key === 'email' ? 'dulaj@example.com' : key === 'phone' ? '+94 77 123 4567' : key === 'address' ? 'Colombo, Sri Lanka' : key === 'linkedin' ? 'https://linkedin.com/in/...' : key === 'github' ? 'https://github.com/...' : 'Website URL'}
                          />
                        )}

                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Professional Summary</h3>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Write a compelling summary..."
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition h-48 resize-none backdrop-blur-sm"
                  />
                </div>

                {/* Skills */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Soft Skills</h3>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="e.g : Empathy, Design Skills..."
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition h-40 resize-none backdrop-blur-sm"
                  />
                </div>

                {/* 4. UI: TECHNICAL SKILLS (Added) */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"> Technical Skills</h3>
                  <textarea 
                    value={formData.technicalSkills} 
                    onChange={(e) => setFormData(prev => ({ ...prev, technicalSkills: e.target.value }))} 
                    placeholder="List specific technologies (e.g : AWS, Docker, Python)..."
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white h-40 resize-none" 
                  />
                </div>

                {/* Experience, Education, Projects, References */}
{['experience', 'education', 'projects', 'references'].map((section) => (
                  <div key={section} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-white capitalize">
                        {section === 'experience' ? 'Work Experience'
                          : section === 'education' ? 'Education'
                          : section === 'projects' ? 'Projects'
                          : 'References'}
                      </h3>
                      <div className="flex gap-4">
                        <button
                          onClick={() => { setCurrentEntry({ ...currentEntry, type: section }); setShowEntryForm(true); }}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-xl transition"
                        >
                          Add {section === 'projects' ? 'Project'
                            : section === 'education' ? 'Degree'
                            : section === 'experience' ? 'Job'
                            : 'Reference'}
                        </button>
                        {section === 'projects' && (
                          <button
                            onClick={() => setShowGithubImport(true)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-xl transition"
                          >
                            <Github className="w-5 h-5" /> Import from GitHub
                          </button>
                        )}
                      </div>
                    </div>

                    {formData[section].length === 0 ? (
                      <p className="text-gray-400 text-center py-16 italic">No entries yet</p>
                    ) : (
                      <div className="space-y-6">
                        {formData[section].map((item, i) => (
                          <div key={i} className="bg-white/10 rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition">

                        <div className="flex justify-between items-start">
                      <div>
      <h4 className="text-xl font-bold text-white">{item.title}</h4>
      <p className="text-purple-300 mt-1">{item.company}</p>
      {section !== 'references' && (
        <p className="text-sm text-gray-400 mt-1">
          {item.startDate} – {item.current ? 'Present' : item.endDate}
        </p>
      )}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          className="text-cyan-400 hover:underline text-sm mt-2 inline-block"
        >
          View Project
        </a>
      )}
      <p className="mt-4 text-gray-300">{item.description}</p>
    </div>

    {/* ALWAYS VISIBLE BUTTONS */}
    <div className="flex flex-col gap-2">

      <button
        onClick={() => {
          setCurrentEntry({ ...item, type: section, index: i });
          setShowEntryForm(true);
        }}
        className="text-blue-400 hover:text-blue-300 p-2 rounded-xl hover:bg-blue-500/20"
      >
        Edit
      </button>

      <button
        onClick={() => removeEntry(section, i)}
        className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/20"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  </div>
</div>
                        ))}


                      </div>
                    )}
                  </div>

                


                ))}

                
              </div>
            </div>
          )}
{activeTab === 'preview' && (
  <div className="max-w-4xl mx-auto my-10">
    {/* Preview Toolbar: Upload / Edit / Save / Download */}
    <div className="flex justify-end gap-3 mb-4">
      <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleUploadResume} />
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePreviewPhotoUpload} />

     {/* <button onClick={() => fileInputRef.current?.click()} className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20">Upload JSON</button> */}

      <button onClick={() => photoInputRef.current?.click()} className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20">Change Photo</button>

      <button onClick={() => handlePersonalInfoChange('photo', '')} className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20">Remove Photo</button>

      <button onClick={() => setIsInlineEdit(prev => !prev)} className={`px-4 py-2 rounded-2xl font-semibold ${isInlineEdit ? 'bg-yellow-500 text-white' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}>{isInlineEdit ? 'Exit Edit' : 'Edit Preview'}</button>
      {isInlineEdit && (
        <button onClick={saveResume} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-2xl">Save Changes</button>
      )}
      <button onClick={downloadPDF} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-2xl">Download PDF</button>
    </div>

    <div 
  id="resume-pdf-content"
  className="bg-white mx-auto shadow-2xl rounded-3xl overflow-hidden"
  style={{
    width: '210mm',
    minHeight: '297mm',
    padding: '15mm',
    boxSizing: 'border-box',
    margin: '30px auto',
    background: 'white',
  }}
>
  {generateProfessionalCV()}
</div>
  </div>
)}
        </div>
      {/* GitHub Import Modal */}
          {showGithubImport && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Github className="w-8 h-8" /> Import GitHub Projects
                  </h3>
                  <button onClick={() => { setShowGithubImport(false); setGithubUsername(''); }} className="text-gray-400 hover:text-white">
                    <X className="w-8 h-8" />
                  </button>
                </div>
                <input type="text" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="GitHub username" className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white mb-6" />
                <button onClick={fetchGithubProjects} disabled={isFetchingGithub} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 disabled:opacity-60">
                  {isFetchingGithub ? <Loader2 className="animate-spin" /> : <Github className="w-6 h-6" />} Import Projects
                </button>
              </div>
            </div>
          )}

        {/* Add Entry Modal */}
        {showEntryForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-3xl p-8 max-w-2xl w-full border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {currentEntry.index !== undefined ? "Edit " : "Add "}
                  {currentEntry.type === 'projects' ? 'Project' : currentEntry.type === 'education' ? 'Degree' : currentEntry.type === 'experience' ? 'Job' : 'Reference'}
                </h3>
                <button onClick={() => setShowEntryForm(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <input type="text" placeholder="Full Name" value={currentEntry.title}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                <input type="text" placeholder="Position & Company" value={currentEntry.company}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, company: e.target.value })}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                <input type="text" placeholder="Location" value={currentEntry.location}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, location: e.target.value })}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                <textarea placeholder="Contact Information (Phone, Email, etc.)" value={currentEntry.description}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, description: e.target.value })}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white h-32 resize-none" />
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={addEntry}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl transition">
                  Add Entry
                </button>
                <button onClick={() => setShowEntryForm(false)}
                  className="flex-1 bg-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}