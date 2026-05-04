'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Download, Eye, Plus, X, Sparkles, Loader2,
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code,
  Github, FileText, Users, Wand2
} from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ─── Resume CSS (identical to Create page) ─────────────────────────────── */
const RESUME_STYLES = `
  .cv-template {
    font-family: 'Georgia', serif;
    color: #1a1a1a;
    background: #ffffff;
    line-height: 1.5;
    font-size: 10pt;
  }
  .cv-section { margin-bottom: 18px; }
  .cv-section-title {
    font-size: 11pt; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    border-bottom: 1.5px solid currentColor;
    padding-bottom: 3px; margin-bottom: 10px;
  }
  .cv-item { margin-bottom: 12px; }
  .cv-item-header {
    display: flex; flex-wrap: wrap;
    align-items: baseline; gap: 6px; margin-bottom: 3px;
  }
  .cv-item-title   { font-weight: 700; font-size: 10.5pt; }
  .cv-item-company { color: #444; font-size: 9.5pt; flex: 1; }
  .cv-item-date    { font-size: 8.5pt; color: #666; white-space: nowrap; }
  .cv-item-location{ font-size: 8.5pt; color: #777; margin-bottom: 3px; }
  .cv-item-description { font-size: 9.5pt; color: #333; white-space: pre-line; margin-top: 3px; }
  .cv-item-link    { font-size: 9pt; color: #2563eb; margin-bottom: 2px; }
  .cv-item-stats   { font-size: 8.5pt; color: #888; margin-bottom: 2px; }
  .cv-summary      { font-size: 9.5pt; color: #333; white-space: pre-line; }
  .cv-skills       { font-size: 9.5pt; color: #333; white-space: pre-line; }

  /* MODERN */
  .cv-modern .cv-header {
    text-align: center; padding-bottom: 14px;
    margin-bottom: 16px; border-bottom: 2px solid #2563eb;
  }
  .cv-modern .cv-name {
    font-size: 22pt; font-weight: 800; color: #1e3a8a;
    letter-spacing: -0.01em; margin-bottom: 6px;
  }
  .cv-modern .cv-contact {
    display: flex; flex-wrap: wrap; justify-content: center;
    gap: 10px; font-size: 9pt; color: #555;
  }
  .cv-modern .cv-section-title { color: #2563eb; }

  /* CLASSIC */
  .cv-classic .cv-header {
    text-align: center; padding-bottom: 12px;
    margin-bottom: 16px; border-bottom: 2px solid #1a1a1a;
  }
  .cv-classic .cv-name {
    font-size: 20pt; font-weight: 700; color: #1a1a1a;
    letter-spacing: 0.04em; margin-bottom: 6px;
  }
  .cv-classic .cv-contact {
    display: flex; flex-wrap: wrap; justify-content: center;
    gap: 10px; font-size: 9pt; color: #444;
  }
  .cv-classic .cv-section-title { color: #1a1a1a; }

  /* CREATIVE */
  .cv-creative .cv-header {
    background: linear-gradient(135deg, #6d28d9, #db2777);
    color: white; text-align: center;
    padding: 18px; border-radius: 10px; margin-bottom: 18px;
  }
  .cv-creative .cv-name {
    font-size: 20pt; font-weight: 800; color: #fff; margin-bottom: 6px;
  }
  .cv-creative .cv-contact {
    display: flex; flex-wrap: wrap; justify-content: center;
    gap: 10px; font-size: 9pt; color: rgba(255,255,255,0.9);
  }
  .cv-creative .cv-section-title { color: #6d28d9; }
`;

/* ─── Default empty form state ───────────────────────────────────────────── */
const EMPTY_FORM = {
  personalInfo: {
    fullName: '', email: '', phone: '',
    address: '', linkedin: '', github: '', website: '', photo: ''
  },
  summary: '',
  skills: '',
  technicalSkills: '',
  experience: [],
  education: [],
  projects: [],
  references: [],
};

const EMPTY_ENTRY = {
  type: 'experience', title: '', company: '',
  location: '', startDate: '', endDate: '',
  current: false, description: '', index: undefined,
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateImageFile(file) {
  if (!file) return { ok: false, reason: 'No file' };
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) return { ok: false, reason: 'TYPE' };
  if (file.size > MAX_PHOTO_SIZE) return { ok: false, reason: 'SIZE' };
  return { ok: true };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ─── Sub-components (same as Create page) ───────────────────────────────── */
function ReferenceItem({ refData }) {
  return (
    <div className="cv-item">
      <div className="cv-item-header">
        <h3 className="cv-item-title">{refData.title}</h3>
        <span className="cv-item-company">{refData.company}</span>
      </div>
      <div className="cv-item-description">{refData.description}</div>
    </div>
  );
}

function SkillsGrid({ skills, technicalSkills }) {
  if (!skills && !technicalSkills) return null;
  return (
    <div className="cv-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div>
        <h2 className="cv-section-title">Soft Skills</h2>
        <p className="cv-skills">{skills || '—'}</p>
      </div>
      <div>
        <h2 className="cv-section-title">Technical Skills</h2>
        <p className="cv-skills">{technicalSkills || '—'}</p>
      </div>
    </div>
  );
}

function ExperienceSection({ items, title }) {
  if (!items.length) return null;
  return (
    <div className="cv-section">
      <h2 className="cv-section-title">{title}</h2>
      {items.map((item, i) => (
        <div key={i} className="cv-item">
          <div className="cv-item-header">
            <h3 className="cv-item-title">{item.title}</h3>
            <span className="cv-item-company">{item.company}</span>
            <span className="cv-item-date">{item.startDate} – {item.current ? 'Present' : item.endDate}</span>
          </div>
          {item.location && <div className="cv-item-location">📍 {item.location}</div>}
          <div className="cv-item-description">{item.description}</div>
        </div>
      ))}
    </div>
  );
}

function ProjectsSection({ items }) {
  if (!items.length) return null;
  return (
    <div className="cv-section">
      <h2 className="cv-section-title">Projects</h2>
      {items.map((proj, i) => (
        <div key={i} className="cv-item">
          <div className="cv-item-header">
            <h3 className="cv-item-title">{proj.title}</h3>
            <span className="cv-item-company">{proj.company}</span>
            <span className="cv-item-date">{proj.startDate} – {proj.current ? 'Present' : proj.endDate}</span>
          </div>
          {proj.location && <div className="cv-item-location">📍 {proj.location}</div>}
          {proj.url && (
            <div className="cv-item-link">
              🔗 <a href={proj.url} target="_blank" rel="noopener noreferrer">View Project</a>
            </div>
          )}
          {proj.stars > 0 && (
            <div className="cv-item-stats">⭐ {proj.stars} stars | 🍴 {proj.forks} forks</div>
          )}
          <div className="cv-item-description">{proj.description}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function ResumeBuilderEdit() {
  const params   = useParams();
  const router   = useRouter();
  const id       = params?.id;

  /* ── state ── */
  const [isLoading,      setIsLoading]      = useState(true);
  const [isSaving,       setIsSaving]       = useState(false);
  const [isGenerating,   setIsGenerating]   = useState(false);
  const [isAiLoading,    setIsAiLoading]    = useState(false);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [activeTab,        setActiveTab]         = useState('form');
  const [showEntryForm,    setShowEntryForm]     = useState(false);
  const [showPasteBox,     setShowPasteBox]      = useState(false);
  const [pasteText,        setPasteText]         = useState('');
  const [githubUsername,   setGithubUsername]    = useState('');
  const [isImportingResume, setIsImportingResume] = useState(false);

  const [formData,      setFormData]      = useState(EMPTY_FORM);
  const [currentEntry,  setCurrentEntry]  = useState(EMPTY_ENTRY);

  const fileInputRef  = useRef(null);
  const photoInputRef = useRef(null);

  /* ── Inject resume CSS once ── */
  useEffect(() => {
    if (document.getElementById('resume-styles-edit')) return;
    const style = document.createElement('style');
    style.id    = 'resume-styles-edit';
    style.textContent = RESUME_STYLES;
    document.head.appendChild(style);
  }, []);

  /* ── Load resume on mount ── */
  useEffect(() => {
    if (!id) return;

    const loadResume = async () => {
      setIsLoading(true);
      try {
        // Try sessionStorage cache first (set by Create page after save)
        try {
          const cached = sessionStorage.getItem('recentlySavedResume');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?._id === id) {
              populateForm(parsed);
              sessionStorage.removeItem('recentlySavedResume');
            }
          }
        } catch (_) { /* ignore */ }

        const res = await fetch(`${API_BASE}/api/resume?id=${id}&t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Resume not found');

        const data = await res.json();
        populateForm(data);
        setSelectedTemplate(data.selectedTemplate || 'modern');
        toast.success('Resume loaded!');
      } catch (err) {
        toast.error('Failed to load resume');
        router.push('/resume-builder/saved');
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [id, router]);

  function populateForm(data) {
    setFormData({
      personalInfo: {
        fullName:  data.personalInfo?.fullName  || '',
        email:     data.personalInfo?.email     || '',
        phone:     data.personalInfo?.phone     || '',
        address:   data.personalInfo?.address   || '',
        linkedin:  data.personalInfo?.linkedin  || '',
        github:    data.personalInfo?.github    || '',
        website:   data.personalInfo?.website   || '',
        photo:     data.personalInfo?.photo     || '',
      },
      summary:         data.summary         || '',
      skills:          data.skills          || '',
      technicalSkills: data.technicalSkills || '',
      experience:  Array.isArray(data.experience)  ? data.experience  : [],
      education:   Array.isArray(data.education)   ? data.education   : [],
      projects:    Array.isArray(data.projects)    ? data.projects    : [],
      references:  Array.isArray(data.references)  ? data.references  : [],
    });
  }

  /* ── Handlers ── */
  const handlePersonalInfoChange = (field, value) =>
    setFormData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));

  const handleTextChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  /* photo upload (shared between form tab and preview toolbar) */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.ok) {
      toast.error(v.reason === 'TYPE' ? 'Invalid type. Use JPG, PNG or WebP.' : 'Too large. Max 2 MB.');
      e.target.value = '';
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      handlePersonalInfoChange('photo', dataUrl);
      toast.success('Photo updated');
    } catch {
      toast.error('Failed to read image');
    }
    e.target.value = '';
  };

  /* Resume file upload (PDF/TXT → backend parse) */
  const handleUploadResumeFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingResume(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch(`${API_BASE}/api/parse-resume`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to parse');
      setFormData(prev => ({
        ...prev,
        personalInfo:    { ...prev.personalInfo,  ...(data.personalInfo || {}) },
        summary:         data.summary         || prev.summary,
        skills:          data.skills          || prev.skills,
        technicalSkills: data.technicalSkills ? (Array.isArray(data.technicalSkills) ? data.technicalSkills.join(', ') : data.technicalSkills) : prev.technicalSkills,
        experience:  Array.isArray(data.experience)  ? data.experience  : prev.experience,
        education:   Array.isArray(data.education)   ? data.education   : prev.education,
        projects:    Array.isArray(data.projects)    ? data.projects    : prev.projects,
        references:  Array.isArray(data.references)  ? data.references  : prev.references,
      }));
      toast.success('Resume imported!');
      setActiveTab('form');
    } catch (err) {
      toast.error(err.message || 'Failed to import resume');
    } finally {
      setIsImportingResume(false);
      e.target.value = '';
    }
  };

  /* Paste-text import */
  const importPastedResume = async () => {
    if (!pasteText.trim()) return toast.error('Please paste your resume text');
    setIsImportingResume(true);
    try {
      const fd = new FormData();
      fd.append('resumeText', pasteText);
      const res  = await fetch(`${API_BASE}/api/parse-resume`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to parse text');
      setFormData(prev => ({
        ...prev,
        personalInfo:    { ...prev.personalInfo, ...(data.personalInfo || {}) },
        summary:         data.summary         || prev.summary,
        skills:          data.skills          || prev.skills,
        technicalSkills: data.technicalSkills || prev.technicalSkills,
        experience:  Array.isArray(data.experience)  ? data.experience  : prev.experience,
        education:   Array.isArray(data.education)   ? data.education   : prev.education,
        projects:    Array.isArray(data.projects)    ? data.projects    : prev.projects,
        references:  Array.isArray(data.references)  ? data.references  : prev.references,
      }));
      toast.success('Imported!');
      setShowPasteBox(false);
      setPasteText('');
      setActiveTab('form');
    } catch (err) {
      toast.error(err.message || 'Failed to import text');
    } finally {
      setIsImportingResume(false);
    }
  };

  /* GitHub import */
  const fetchGithubProjects = async () => {
    if (!githubUsername.trim()) return toast.error('Enter a GitHub username');
    setIsFetchingGithub(true);
    try {
      const res   = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`);
      if (!res.ok) throw new Error('GitHub user not found');
      const repos = await res.json();

      const projects = repos.map(repo => ({
        title:       repo.name,
        company:     repo.full_name,
        location:    repo.language || 'Various',
        startDate:   new Date(repo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        endDate:     new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        current:     !repo.archived,
        description: repo.description || 'No description available',
        url:         repo.html_url,
        stars:       repo.stargazers_count,
        forks:       repo.forks_count,
        language:    repo.language,
      }));

      setFormData(prev => ({ ...prev, projects: [...prev.projects, ...projects] }));
      toast.success(`Fetched ${projects.length} GitHub projects!`);
      setGithubUsername('');
    } catch (err) {
      toast.error(err.message || 'Failed to fetch GitHub projects');
    } finally {
      setIsFetchingGithub(false);
    }
  };

  /* AI summary */
  const generateAiSummary = async () => {
    if (!formData.summary?.trim()) return toast.error('Please enter keywords first!');
    setIsAiLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/generate-summary`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userInput: formData.summary,
          skills:    formData.skills,
          jobTitle:  formData.experience[0]?.title || 'Professional',
          experience: formData.experience.map(e => e.title).join(', '),
        }),
      });
      const data = await res.json();
      if (res.ok) { setFormData(prev => ({ ...prev, summary: data.summary })); toast.success('Summary generated!'); }
      else          toast.error(data.error || 'Failed to generate');
    } catch { toast.error('AI generation failed'); }
    finally   { setIsAiLoading(false); }
  };

  /* Add / edit entry */
  const addEntry = () => {
    if (!currentEntry.title?.trim()) return toast.error('Title is required');

    setFormData(prev => {
      const list = [...prev[currentEntry.type]];
      if (currentEntry.index !== undefined) {
        list[currentEntry.index] = { ...currentEntry };
      } else {
        list.push({ ...currentEntry });
      }
      return { ...prev, [currentEntry.type]: list };
    });

    setCurrentEntry({ ...EMPTY_ENTRY, type: currentEntry.type });
    setShowEntryForm(false);
    toast.success(currentEntry.index !== undefined ? 'Updated!' : 'Added!');
  };

  const removeEntry = (section, index) =>
    setFormData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));

  /* Save (PUT) */
  const saveResume = async () => {
    if (!formData.personalInfo?.fullName?.trim()) return toast.error('Please enter your full name!');
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/resume`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, ...formData, selectedTemplate }),
      });
      if (res.ok) toast.success('Resume updated successfully!');
      else        throw new Error();
    } catch { toast.error('Save failed — please try again'); }
    finally  { setIsSaving(false); }
  };

  /* PDF download */
  const downloadPDF = async () => {
    const element = document.getElementById('resume-pdf-content');
    if (!element) return toast.error('Preview not ready!');
    setIsGenerating(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(element, {
        scale: 150 / 96,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (_doc, el) => {
          el.style.boxShadow  = 'none';
          el.style.borderRadius = '0';
          el.querySelectorAll('*').forEach(node => {
            ['color', 'background-color', 'border-color'].forEach(prop => {
              const v = window.getComputedStyle(node).getPropertyValue(prop);
              if (v && /\b(lab|oklch|lch|color)\s*\(/.test(v))
                node.style.setProperty(prop, 'transparent');
            });
          });
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const pdfW    = pdf.internal.pageSize.getWidth();
      const pdfH    = pdf.internal.pageSize.getHeight();
      const imgH    = (canvas.height / canvas.width) * pdfW;

      if (imgH <= pdfH) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, imgH);
      } else {
        let yOffset = 0;
        const pageCanvas  = document.createElement('canvas');
        const pageCtx     = pageCanvas.getContext('2d');
        const pageHeightPx = Math.round((pdfH / pdfW) * canvas.width);
        pageCanvas.width  = canvas.width;
        pageCanvas.height = pageHeightPx;
        while (yOffset < canvas.height) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(canvas, 0, -yOffset);
          const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95);
          if (yOffset > 0) pdf.addPage();
          pdf.addImage(pageImg, 'JPEG', 0, 0, pdfW, pdfH);
          yOffset += pageHeightPx;
        }
      }

      const filename = `${(formData.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_A4.pdf`;
      pdf.save(filename);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ─── CV Renderer (identical to Create page logic) ───────────────────── */
  const generateProfessionalCV = () => {
    const { personalInfo, summary, skills, technicalSkills, experience, education, projects, references } = formData;

    const sectionTitle = (label) => {
      if (selectedTemplate === 'creative') return `✨ ${label}`;
      if (selectedTemplate === 'classic')  return label.toUpperCase();
      return label;
    };

    const commonBody = (
      <>
        {summary && (
          <div className="cv-section">
            <h2 className="cv-section-title">{sectionTitle('Professional Summary')}</h2>
            <p className="cv-summary">{summary}</p>
          </div>
        )}
        <SkillsGrid skills={skills} technicalSkills={technicalSkills} />
        <ExperienceSection items={experience} title={sectionTitle('Work Experience')} />
        <ExperienceSection items={education}  title={sectionTitle('Education')} />
        <ProjectsSection   items={projects} />
        {references.length > 0 && (
          <div className="cv-section">
            <h2 className="cv-section-title">{sectionTitle('References')}</h2>
            {references.map((ref, i) => <ReferenceItem key={i} refData={ref} />)}
          </div>
        )}
      </>
    );

    if (selectedTemplate === 'modern') {
      return (
        <div className="cv-template cv-modern">
          <div className="cv-header">
            {personalInfo.photo && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <img src={personalInfo.photo} alt="Profile"
                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%', border: '3px solid #2563eb' }} />
              </div>
            )}
            <h1 className="cv-name">{personalInfo.fullName || 'Your Name'}</h1>
            <div className="cv-contact">
              {personalInfo.email   && <span>📧 {personalInfo.email}</span>}
              {personalInfo.phone   && <span>📱 {personalInfo.phone}</span>}
              {personalInfo.address && <span>📍 {personalInfo.address}</span>}
              {personalInfo.linkedin && <span>💼 LinkedIn</span>}
              {personalInfo.github  && <span>🔗 GitHub</span>}
              {personalInfo.website && <span>🌐 Website</span>}
            </div>
          </div>
          {commonBody}
        </div>
      );
    }

    if (selectedTemplate === 'classic') {
      return (
        <div className="cv-template cv-classic">
          <div className="cv-header">
            <h1 className="cv-name">{personalInfo.fullName || 'Your Name'}</h1>
            <div className="cv-contact">
              {personalInfo.email    && <span>{personalInfo.email}</span>}
              {personalInfo.phone    && <span>{personalInfo.phone}</span>}
              {personalInfo.address  && <span>{personalInfo.address}</span>}
              {personalInfo.linkedin && <span>LinkedIn: {personalInfo.linkedin}</span>}
              {personalInfo.github   && <span>GitHub: {personalInfo.github}</span>}
            </div>
          </div>
          {commonBody}
        </div>
      );
    }

    if (selectedTemplate === 'creative') {
      return (
        <div className="cv-template cv-creative">
          <div className="cv-header">
            <h1 className="cv-name">{personalInfo.fullName || 'Your Name'}</h1>
            <div className="cv-contact">
              {personalInfo.email    && <span>✉️ {personalInfo.email}</span>}
              {personalInfo.phone    && <span>📞 {personalInfo.phone}</span>}
              {personalInfo.address  && <span>🏠 {personalInfo.address}</span>}
              {personalInfo.linkedin && <span>💼 {personalInfo.linkedin}</span>}
              {personalInfo.github   && <span>⚡ {personalInfo.github}</span>}
            </div>
          </div>
          {commonBody}
        </div>
      );
    }

    return null;
  };

  /* ─── Loading screen ────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-14 h-14 animate-spin text-purple-400 mx-auto mb-5" />
          <p className="text-xl text-white font-medium">Loading your resume…</p>
        </div>
      </div>
    );
  }

  /* ─── Section configs ───────────────────────────────────────────────── */
  const sectionConfigs = [
    { section: 'experience', icon: Briefcase,     label: 'Work Experience', btnLabel: 'Add Experience' },
    { section: 'education',  icon: GraduationCap, label: 'Education',       btnLabel: 'Add Education'  },
    { section: 'projects',   icon: Code,          label: 'Projects',        btnLabel: 'Add Project'    },
    { section: 'references', icon: Users,         label: 'References',      btnLabel: 'Add Reference'  },
  ];

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Toaster position="top-center" toastOptions={{
        duration: 4000,
        style: { background: '#1e1b4b', color: '#fff', borderRadius: '12px', padding: '16px 24px', fontSize: '15px' },
        success: { style: { background: '#10b981' } },
      }} />

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/60 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/resume-builder/saved" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to Saved Resumes</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/resume-builder/saved" className="flex items-center gap-2 text-purple-300 hover:text-white text-sm">
              <FileText className="w-4 h-4" /> My Saved Resumes
            </Link>
            <button onClick={saveResume} disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition disabled:opacity-70 text-sm font-medium">
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Update Resume</>}
            </button>
            <button onClick={downloadPDF} disabled={isGenerating}
              className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-2xl hover:shadow-xl transition disabled:opacity-50 text-sm font-medium
                ${selectedTemplate === 'modern'   ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                : selectedTemplate === 'classic'  ? 'bg-gradient-to-r from-gray-700 to-gray-900'
                :                                   'bg-gradient-to-r from-pink-500 to-orange-500'}`}>
              {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <><Download className="w-4 h-4" />Download PDF</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Edit{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                {formData.personalInfo.fullName || 'Resume'}
              </span>
            </h1>
            <p className="mt-3 text-lg text-gray-300">Update your professional resume with AI assistance</p>
          </div>

          {/* ── Template selector ── */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Choose Your CV Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { id: 'modern',   label: 'Modern',   desc: 'Clean, Professional & ATS Friendly', color: 'from-blue-500 to-blue-700',          border: 'border-blue-500',  bg: 'bg-blue-500/10'  },
                { id: 'classic',  label: 'Classic',  desc: 'Formal & Traditional Style',         color: 'from-gray-800 to-black',             border: 'border-gray-400',  bg: 'bg-gray-400/10'  },
                { id: 'creative', label: 'Creative', desc: 'Colorful UI • White PDF',            color: 'from-pink-500 via-purple-500 to-indigo-600', border: 'border-pink-500', bg: 'bg-pink-500/10' },
              ].map(t => (
                <div key={t.id}
                  className={`group p-8 border-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105
                    ${selectedTemplate === t.id ? `${t.border} ${t.bg} shadow-2xl` : 'border-white/30 bg-white/5 hover:border-white/50'}`}
                  onClick={() => setSelectedTemplate(t.id)}>
                  <div className="text-center">
                    <div className={`w-20 h-28 bg-gradient-to-br ${t.color} rounded-xl mx-auto mb-4 shadow-lg`} />
                    <h4 className="text-xl font-bold text-white mb-2">{t.label}</h4>
                    <p className="text-sm text-gray-300">{t.desc}</p>
                    {selectedTemplate === t.id && (
                      <span className="inline-block mt-3 px-4 py-1 bg-white/20 text-white text-xs rounded-full animate-pulse">Selected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1">
              {['form', 'preview'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl transition capitalize
                    ${activeTab === tab ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-gray-300 hover:text-white'}`}>
                  {tab === 'form' ? 'Form Builder' : 'Preview'}
                </button>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* FORM TAB                                                       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'form' && (
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Personal Information */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', field: 'fullName', type: 'text',  placeholder: 'John Doe' },
                    { label: 'Email',     field: 'email',    type: 'email', placeholder: 'john@example.com' },
                    { label: 'Phone',     field: 'phone',    type: 'tel',   placeholder: '+94 77 123 4567' },
                    { label: 'Address',   field: 'address',  type: 'text',  placeholder: 'Colombo, Sri Lanka' },
                    { label: 'LinkedIn',  field: 'linkedin', type: 'url',   placeholder: 'https://linkedin.com/in/...' },
                    { label: 'GitHub',    field: 'github',   type: 'url',   placeholder: 'https://github.com/...' },
                  ].map(({ label, field, type, placeholder }) => (
                    <div key={field}>
                      <label className="block text-sm text-gray-300 mb-2">{label}</label>
                      <input type={type}
                        value={formData.personalInfo[field]}
                        onChange={e => handlePersonalInfoChange(field, e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder={placeholder} />
                    </div>
                  ))}

                  {/* Photo upload */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">Profile Photo (Modern template)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white/5 overflow-hidden border border-white/10 rounded-lg flex items-center justify-center">
                        {formData.personalInfo.photo
                          ? <img src={formData.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                          : <div className="text-gray-400 text-xs px-2 text-center">No photo</div>}
                      </div>
                      <div className="flex gap-2">
                        <input id="photo-upload-edit" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        <label htmlFor="photo-upload-edit"
                          className="px-4 py-2 bg-white/10 rounded-2xl cursor-pointer hover:bg-white/20 text-white text-sm">
                          Upload Photo
                        </label>
                        <button onClick={() => handlePersonalInfoChange('photo', '')}
                          className="px-4 py-2 bg-white/10 rounded-2xl hover:bg-white/20 text-white text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Square image, min 400×400px. JPG, PNG, WebP. Max 2 MB.</p>
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-white">Professional Summary</h3>
                  <button onClick={generateAiSummary} disabled={isAiLoading}
                    className="flex items-center gap-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition disabled:opacity-50">
                    {isAiLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Writing…</>
                      : <><Wand2 className="w-4 h-4" />Auto-Write with AI</>}
                  </button>
                </div>
                <textarea
                  value={formData.summary}
                  onChange={e => handleTextChange('summary', e.target.value)}
                  placeholder="Write a compelling summary or use AI…"
                  className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-48 resize-none" />
              </div>

              {/* Soft Skills */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5" /> Soft Skills
                </h3>
                <textarea
                  value={formData.skills}
                  onChange={e => handleTextChange('skills', e.target.value)}
                  className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                  placeholder="Communication, Teamwork, Leadership…" />
              </div>

              {/* Technical Skills */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5" /> Technical Skills
                </h3>
                <textarea
                  value={formData.technicalSkills}
                  onChange={e => handleTextChange('technicalSkills', e.target.value)}
                  className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                  placeholder="React, Node.js, Python, AWS…" />
              </div>

              {/* GitHub integration */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Github className="w-5 h-5" /> GitHub Projects Integration
                </h3>
                <div className="flex gap-3">
                  <input type="text" value={githubUsername}
                    onChange={e => setGithubUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchGithubProjects()}
                    className="flex-1 rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                    placeholder="Enter GitHub username" />
                  <button onClick={fetchGithubProjects}
                    disabled={isFetchingGithub || !githubUsername.trim()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-xl transition disabled:opacity-50">
                    {isFetchingGithub
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching…</>
                      : <><Github className="w-4 h-4" />Fetch Projects</>}
                  </button>
                </div>
              </div>

              {/* Dynamic sections: Experience / Education / Projects / References */}
              {sectionConfigs.map(({ section, icon: Icon, label, btnLabel }) => (
                <div key={section} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Icon className="w-5 h-5" /> {label}
                    </h3>
                    <button
                      onClick={() => {
                        setCurrentEntry({ ...EMPTY_ENTRY, type: section });
                        setShowEntryForm(true);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition text-sm">
                      <Plus className="w-4 h-4" /> {btnLabel}
                    </button>
                  </div>

                  {formData[section].length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-8 italic">No entries yet — click "{btnLabel}" to add one.</p>
                  ) : (
                    <div className="space-y-3">
                      {formData[section].map((item, index) => (
                        <div key={index}
                          className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-purple-500/40 transition">
                          <div className="min-w-0">
                            <h4 className="text-white font-semibold truncate">{item.title || '(Untitled)'}</h4>
                            <p className="text-gray-300 text-sm truncate">{item.company}</p>
                            {item.startDate && (
                              <p className="text-gray-400 text-xs mt-0.5">
                                {item.startDate} – {item.current ? 'Present' : item.endDate}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            <button
                              onClick={() => { setCurrentEntry({ ...item, index, type: section }); setShowEntryForm(true); }}
                              className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition">
                              Edit
                            </button>
                            <button onClick={() => removeEntry(section, index)}
                              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/20 transition">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* PREVIEW TAB                                                    */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'preview' && (
            <div className="max-w-4xl mx-auto my-10">
              {/* Toolbar */}
              <div className="flex flex-wrap justify-end gap-3 mb-6">
                <input ref={fileInputRef}  type="file" accept="application/pdf,text/plain" className="hidden" onChange={handleUploadResumeFile} />
                <input ref={photoInputRef} type="file" accept="image/*"                    className="hidden" onChange={handlePhotoUpload} />

                <button onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20 text-sm">
                  {isImportingResume
                    ? <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />Importing…</>
                    : 'Upload Resume (PDF/TXT)'}
                </button>
                <button onClick={() => setShowPasteBox(p => !p)}
                  className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20 text-sm">
                  {showPasteBox ? 'Close Paste' : 'Paste Text'}
                </button>
                <button onClick={() => photoInputRef.current?.click()}
                  className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20 text-sm">
                  Change Photo
                </button>
                <button onClick={() => handlePersonalInfoChange('photo', '')}
                  className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl hover:bg-white/20 text-sm">
                  Remove Photo
                </button>
                <button onClick={downloadPDF} disabled={isGenerating}
                  className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-white font-semibold transition disabled:opacity-50
                    ${selectedTemplate === 'modern'  ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : selectedTemplate === 'classic' ? 'bg-gradient-to-r from-gray-700 to-gray-900'
                    :                                  'bg-gradient-to-r from-pink-500 to-orange-500'}`}>
                  {isGenerating
                    ? <><Loader2 className="w-5 h-5 animate-spin" />Generating…</>
                    : <><Download className="w-5 h-5" />Download PDF</>}
                </button>
              </div>

              {/* Paste box */}
              {showPasteBox && (
                <div className="mb-6">
                  <textarea value={pasteText} onChange={e => setPasteText(e.target.value)}
                    placeholder="Paste your resume text here…"
                    className="w-full p-3 bg-slate-900 text-gray-200 rounded-lg border border-white/10"
                    rows={6} />
                  <div className="flex gap-3 mt-2 justify-end">
                    <button onClick={() => { setPasteText(''); setShowPasteBox(false); }}
                      className="px-4 py-2 rounded-2xl bg-white/10 text-white text-sm">Cancel</button>
                    <button onClick={importPastedResume} disabled={isImportingResume}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm">
                      {isImportingResume ? <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> : null}Import Text
                    </button>
                  </div>
                </div>
              )}

              {/* A4 preview */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: '#f1f5f9', padding: 24, borderRadius: 12 }}>
                  <div id="resume-pdf-content" style={{
                    width: 794, minHeight: 1123,
                    padding: '56px 64px', boxSizing: 'border-box',
                    background: '#ffffff',
                    boxShadow: '0 4px 40px rgba(0,0,0,0.18)',
                    fontFamily: 'Georgia, serif', fontSize: '10pt',
                    lineHeight: '1.5', color: '#1a1a1a',
                  }}>
                    {generateProfessionalCV()}
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-400 text-sm mt-4">
                Preview matches the downloaded PDF exactly. Width: A4 (794px @ 96 dpi).
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ENTRY FORM MODAL (identical to Create page)                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showEntryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-semibold text-white mb-6 capitalize">
              {currentEntry.index !== undefined ? 'Edit' : 'Add'}{' '}
              {currentEntry.type === 'references' ? 'Reference'
               : currentEntry.type === 'education' ? 'Education'
               : currentEntry.type === 'projects'  ? 'Project'
               : 'Experience'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    {currentEntry.type === 'references' ? 'Full Name'
                     : currentEntry.type === 'education' ? 'Degree / Field'
                     : 'Title'}
                  </label>
                  <input type="text" value={currentEntry.title}
                    onChange={e => setCurrentEntry(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                    placeholder={currentEntry.type === 'education' ? 'BSc Computer Science' : 'e.g. Software Engineer'} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    {currentEntry.type === 'references' ? 'Position & Company' : 'Institution / Company'}
                  </label>
                  <input type="text" value={currentEntry.company}
                    onChange={e => setCurrentEntry(p => ({ ...p, company: e.target.value }))}
                    className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                    placeholder="Company or School" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Location</label>
                <input type="text" value={currentEntry.location}
                  onChange={e => setCurrentEntry(p => ({ ...p, location: e.target.value }))}
                  className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                  placeholder="City, Country" />
              </div>

              {currentEntry.type !== 'references' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Start Date</label>
                      <input type="month" value={currentEntry.startDate}
                        onChange={e => setCurrentEntry(p => ({ ...p, startDate: e.target.value }))}
                        className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">End Date</label>
                      <input type="month" value={currentEntry.endDate}
                        onChange={e => setCurrentEntry(p => ({ ...p, endDate: e.target.value }))}
                        disabled={currentEntry.current}
                        className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white disabled:opacity-50 outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="current_check" checked={currentEntry.current}
                      onChange={e => setCurrentEntry(p => ({ ...p, current: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <label htmlFor="current_check" className="text-sm text-gray-300">Present / Currently ongoing</label>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  {currentEntry.type === 'references' ? 'Contact Information' : 'Description / Achievements'}
                </label>
                <textarea value={currentEntry.description}
                  onChange={e => setCurrentEntry(p => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white h-32 resize-none focus:ring-2 focus:ring-purple-500/50 outline-none"
                  placeholder={currentEntry.type === 'references'
                    ? 'Phone: +94... | Email: ...'
                    : 'Describe key responsibilities and achievements…'} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowEntryForm(false)}
                className="px-6 py-3 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition border border-white/10">
                Cancel
              </button>
              <button onClick={addEntry}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition font-medium">
                {currentEntry.index !== undefined ? 'Update Entry' : 'Add to Resume'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}