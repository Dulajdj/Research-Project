'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Trash2, Edit, FileText, Loader2,
  BarChart3, Target, Search, X, Calendar,
  Mail, Phone, Layers, Plus, ChevronRight
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

/* ─── Animated counter ─────────────────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = parseFloat(value) || 0;
    if (target === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.max(1, target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

/* ─── SVG ring ─────────────────────────────────────────────────────────────── */
function Ring({ value = 0, color = "#a78bfa", size = 64, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SavedResumes() {
  const [resumes,    setResumes]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [query,      setQuery]      = useState("");

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/resume?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const safe = (Array.isArray(data) ? data : []).map(item => ({
        _id:              item._id              || '',
        createdAt:        item.createdAt        || new Date().toISOString(),
        selectedTemplate: item.selectedTemplate || 'modern',
        formData: {
          personalInfo: {
            fullName: item.personalInfo?.fullName || '',
            email:    item.personalInfo?.email    || '',
            phone:    item.personalInfo?.phone    || '',
          },
          summary:    item.summary    || '',
          skills:     item.skills     || '',
          experience: Array.isArray(item.experience) ? item.experience : [],
          education:  Array.isArray(item.education)  ? item.education  : [],
          projects:   Array.isArray(item.projects)   ? item.projects   : [],
        }
      }));
      setResumes(safe);
    } catch { toast.error('Failed to load resumes'); setResumes([]); }
    finally   { setLoading(false); }
  };

  const deleteResume = async (id) => {
    if (!confirm('Delete this resume permanently?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/resume?id=${id}`, { method: 'DELETE' });
      if (res.ok) { setResumes(p => p.filter(r => r._id !== id)); toast.success('Deleted!'); }
      else toast.error('Failed to delete');
    } catch { toast.error('Delete failed'); }
    finally { setDeletingId(null); }
  };

  const computeCompletion = (r) => {
    const fields = [
      r.formData?.personalInfo?.fullName,
      r.formData?.personalInfo?.email,
      r.formData?.personalInfo?.phone,
      r.formData?.summary,
      r.formData?.skills,
      r.formData?.experience?.length > 0,
      r.formData?.education?.length  > 0,
      r.formData?.projects?.length   > 0,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const filtered = resumes.filter(r => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return [
      r.formData?.personalInfo?.fullName,
      r.formData?.personalInfo?.email,
      r.selectedTemplate,
      r.formData?.skills,
      r.formData?.summary,
    ].some(v => v?.toLowerCase().includes(q));
  });

  const total   = resumes.length;
  const avgComp = total === 0 ? 0
    : Math.round(resumes.reduce((a, r) => a + computeCompletion(r), 0) / total);
  const lastUp  = [...resumes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  /* ── Loading screen ── */
  if (loading) return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", gap:16,
        background:"linear-gradient(135deg,#020617 0%,#1a0533 55%,#0f172a 100%)" }}>
        <Loader2 style={{ width:32,height:32,color:"#a78bfa",animation:"spin 1s linear infinite" }} />
        <span style={{ color:"rgba(255,255,255,0.55)", fontSize:15, fontFamily:"'DM Sans',sans-serif" }}>Loading resumes…</span>
      </div>
    </>
  );

  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes sr-up  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sr-orb { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(24px,-16px) scale(1.06)} 70%{transform:translate(-16px,12px) scale(0.96)} }
        @keyframes spin   { to{transform:rotate(360deg)} }

        .sr-f1{animation:sr-up .5s cubic-bezier(.22,1,.36,1) .04s both}
        .sr-f2{animation:sr-up .5s cubic-bezier(.22,1,.36,1) .12s both}
        .sr-f3{animation:sr-up .5s cubic-bezier(.22,1,.36,1) .20s both}
        .sr-f4{animation:sr-up .5s cubic-bezier(.22,1,.36,1) .28s both}
        .sr-f5{animation:sr-up .5s cubic-bezier(.22,1,.36,1) .35s both}

        .sr-orb-a{animation:sr-orb 13s ease-in-out infinite}
        .sr-orb-b{animation:sr-orb 18s ease-in-out 4s infinite reverse}

        /* ── stat card ── */
        .sr-stat{
          position:relative;overflow:hidden;
          background:rgba(255,255,255,.038);
          border:1px solid rgba(255,255,255,.08);
          border-radius:22px;padding:26px 28px;
          backdrop-filter:blur(18px);
          transition:border-color .25s,transform .2s;
        }
        .sr-stat:hover{border-color:rgba(139,92,246,.45);transform:translateY(-2px)}

        /* ── search ── */
        .sr-search-wrap{position:relative}
        .sr-search-input{
          width:100%;padding:14px 48px 14px 50px;
          border-radius:16px;font-size:14px;
          font-family:'DM Sans',sans-serif;color:#fff;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(139,92,246,.22);outline:none;
          transition:border-color .25s,background .25s,box-shadow .25s;
          caret-color:#a78bfa;
        }
        .sr-search-input::placeholder{color:rgba(255,255,255,.26)}
        .sr-search-input:focus{
          border-color:rgba(139,92,246,.6);background:rgba(139,92,246,.08);
          box-shadow:0 0 0 3px rgba(139,92,246,.12),0 6px 28px rgba(0,0,0,.3);
        }
        .sr-search-icon-l{position:absolute;left:17px;top:50%;transform:translateY(-50%);color:rgba(139,92,246,.65);pointer-events:none}
        .sr-clear-btn{
          position:absolute;right:13px;top:50%;transform:translateY(-50%);
          background:rgba(255,255,255,.07);border:none;border-radius:9px;
          padding:5px;cursor:pointer;color:rgba(255,255,255,.38);
          display:flex;align-items:center;transition:background .15s,color .15s;
        }
        .sr-clear-btn:hover{background:rgba(139,92,246,.28);color:#fff}

        /* ── resume card ── */
        .sr-card{
          position:relative;overflow:hidden;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.08);
          border-radius:24px;padding:26px;
          backdrop-filter:blur(20px);
          transition:border-color .3s,transform .25s,box-shadow .3s;
          display:flex;flex-direction:column;gap:18px;
        }
        .sr-card:hover{
          border-color:rgba(139,92,246,.5);
          transform:translateY(-4px);
          box-shadow:0 20px 60px rgba(88,28,135,.28);
        }
        .sr-card-actions{opacity:0;transition:opacity .25s;display:flex;gap:8px;flex-shrink:0}
        .sr-card:hover .sr-card-actions{opacity:1}

        .sr-template-tag{
          display:inline-flex;align-items:center;gap:5px;
          padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;
          letter-spacing:.04em;text-transform:capitalize;
          background:rgba(139,92,246,.18);color:#c4b5fd;
          border:1px solid rgba(139,92,246,.22);
          font-family:'DM Sans',sans-serif;
        }

        .sr-open-btn{
          display:flex;align-items:center;justify-content:center;gap:6px;
          width:100%;padding:13px;border-radius:14px;
          font-size:13.5px;font-weight:600;color:#fff;text-decoration:none;
          background:linear-gradient(135deg,#7c3aed,#5b21b6);
          border:1px solid rgba(139,92,246,.4);
          transition:opacity .2s,transform .18s,box-shadow .2s;
          box-shadow:0 4px 16px rgba(109,40,217,.35);
          font-family:'DM Sans',sans-serif;
        }
        .sr-open-btn:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 8px 24px rgba(109,40,217,.5)}

        .sr-create-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:10px 22px;border-radius:14px;
          font-size:13.5px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#7c3aed,#5b21b6);
          border:1px solid rgba(139,92,246,.4);text-decoration:none;
          transition:opacity .2s,transform .18s,box-shadow .2s;
          box-shadow:0 4px 20px rgba(109,40,217,.38);
          font-family:'DM Sans',sans-serif;
        }
        .sr-create-btn:hover{opacity:.88;transform:translateY(-2px);box-shadow:0 8px 28px rgba(109,40,217,.5)}

        .sr-back-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:9px 18px;border-radius:12px;font-size:13.5px;font-weight:500;
          color:rgba(255,255,255,.62);
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          text-decoration:none;
          transition:color .2s,background .2s,border-color .2s,transform .18s;
          font-family:'DM Sans',sans-serif;
        }
        .sr-back-btn:hover{color:#fff;background:rgba(139,92,246,.18);border-color:rgba(139,92,246,.45);transform:translateX(-2px)}

        .sr-divider{height:1px;margin:20px 0 36px;background:linear-gradient(90deg,transparent,rgba(139,92,246,.28),transparent)}

        .sr-bar-bg{height:4px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden}
        .sr-bar-fill{height:100%;border-radius:99px;transition:width 1s cubic-bezier(.4,0,.2,1)}

        .sr-icon-btn{
          width:34px;height:34px;border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:background .15s;border:none;
        }

        .sr-avatar{
          width:48px;height:48px;border-radius:14px;flex-shrink:0;
          background:linear-gradient(135deg,rgba(124,58,237,.5),rgba(91,33,182,.5));
          border:1px solid rgba(139,92,246,.3);
          display:flex;align-items:center;justify-content:center;
          font-family:'Sora',sans-serif;font-weight:700;font-size:16px;color:#e9d5ff;
        }
      `}</style>

      <div style={{
        minHeight:"100vh",
        background:"linear-gradient(135deg,#020617 0%,#1a0533 55%,#0f172a 100%)",
        padding:"clamp(20px,5vw,52px)",
        fontFamily:"'DM Sans',sans-serif",
        position:"relative",overflow:"hidden",
      }}>
        <Toaster position="top-center" toastOptions={{ style:{ background:"#1e1b4b",color:"#fff",border:"1px solid rgba(139,92,246,.3)" } }} />

        {/* orbs */}
        <div className="sr-orb-a" style={{ position:"fixed",top:"-10%",right:"-5%",width:550,height:550,borderRadius:"50%",background:"radial-gradient(circle,rgba(88,28,135,.22) 0%,transparent 68%)",pointerEvents:"none",zIndex:0 }} />
        <div className="sr-orb-b" style={{ position:"fixed",bottom:"-14%",left:"-7%",width:620,height:620,borderRadius:"50%",background:"radial-gradient(circle,rgba(30,27,75,.3) 0%,transparent 68%)",pointerEvents:"none",zIndex:0 }} />
        <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"radial-gradient(rgba(139,92,246,0.06) 1px,transparent 1px)",backgroundSize:"36px 36px" }} />

        <div style={{ position:"relative",zIndex:1,maxWidth:1200,margin:"0 auto" }}>

          {/* ── Nav ── */}
          <div className="sr-f1" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:52 }}>
            <Link href="/resume-builder" className="sr-back-btn">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <Link href="/resume-builder/create" className="sr-create-btn">
              <Plus size={15} /> Create Resume
            </Link>
          </div>

          {/* ── Hero ── */}
          <div className="sr-f2" style={{ textAlign:"center",marginBottom:44 }}>
            <h1 style={{
              fontFamily:"'Sora',sans-serif",
              fontSize:"clamp(2rem,5vw,3.6rem)",
              fontWeight:800,letterSpacing:"-0.035em",lineHeight:1.08,
              margin:"0 0 14px",
              background:"linear-gradient(140deg,#ffffff 20%,#ddd6fe 55%,#a78bfa 100%)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
            }}>
              Saved Resumes
            </h1>
            {lastUp && (
              <p style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:13,color:"rgba(255,255,255,.38)",fontFamily:"'DM Sans',sans-serif",margin:0 }}>
                <Calendar size={12} style={{ color:"#a78bfa" }} />
                Last updated {new Date(lastUp.createdAt).toLocaleString('en-US',{ month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit' })}
              </p>
            )}
          </div>

          {/* ── Stat cards ── */}
          <div className="sr-f3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:32 }}>

            {/* Total */}
            <div className="sr-stat">
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12 }}>
                <div>
                  <p style={{ fontSize:11,textTransform:"uppercase",letterSpacing:".08em",color:"rgba(255,255,255,.38)",marginBottom:8,fontWeight:600 }}>Total Resumes</p>
                  <p style={{ fontSize:42,fontWeight:800,color:"#fff",lineHeight:1,fontFamily:"'Sora',sans-serif",margin:0 }}>
                    <AnimatedNumber value={total} />
                  </p>
                  <p style={{ fontSize:11.5,color:"rgba(255,255,255,.28)",marginTop:8 }}>{Math.min(100,Math.round((total/20)*100))}% of goal</p>
                </div>
                <div style={{ position:"relative",width:64,height:64,flexShrink:0 }}>
                  <Ring value={Math.min(100,Math.round((total/20)*100))} color="#8b5cf6" size={64} stroke={5} />
                  <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <BarChart3 size={18} style={{ color:"#a78bfa" }} />
                  </div>
                </div>
              </div>
              <div className="sr-bar-bg" style={{ marginTop:18 }}>
                <div className="sr-bar-fill" style={{ width:`${Math.min(100,Math.round((total/20)*100))}%`,background:"linear-gradient(90deg,#6d28d9,#8b5cf6)" }} />
              </div>
            </div>

            {/* Avg completion */}
            <div className="sr-stat">
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12 }}>
                <div>
                  <p style={{ fontSize:11,textTransform:"uppercase",letterSpacing:".08em",color:"rgba(255,255,255,.38)",marginBottom:8,fontWeight:600 }}>Avg. Completion</p>
                  <p style={{ fontSize:42,fontWeight:800,color:"#fff",lineHeight:1,fontFamily:"'Sora',sans-serif",margin:0 }}>
                    <AnimatedNumber value={avgComp} suffix="%" />
                  </p>
                  <p style={{ fontSize:11.5,color:"rgba(255,255,255,.28)",marginTop:8 }}>across all resumes</p>
                </div>
                <div style={{ position:"relative",width:64,height:64,flexShrink:0 }}>
                  <Ring value={avgComp} color="#34d399" size={64} stroke={5} />
                  <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <Target size={18} style={{ color:"#34d399" }} />
                  </div>
                </div>
              </div>
              <div className="sr-bar-bg" style={{ marginTop:18 }}>
                <div className="sr-bar-fill" style={{ width:`${avgComp}%`,background:"linear-gradient(90deg,#059669,#34d399)" }} />
              </div>
            </div>

          </div>

          {/* ── Search ── */}
          <div className="sr-f4" style={{ marginBottom:8 }}>
            <div className="sr-search-wrap">
              <Search size={16} className="sr-search-icon-l" />
              <input
                className="sr-search-input"
                type="text"
                placeholder="Search by name, template, skills, summary…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button className="sr-clear-btn" onClick={() => setQuery("")} aria-label="Clear">
                  <X size={13} />
                </button>
              )}
            </div>
            {query.trim() && (
              <p style={{ textAlign:"center",marginTop:10,fontSize:12.5,color:"rgba(255,255,255,.3)",fontFamily:"'DM Sans',sans-serif" }}>
                <span style={{ color:"#a78bfa",fontWeight:600 }}>{filtered.length}</span>
                {" "}of{" "}
                <span style={{ color:"#a78bfa",fontWeight:600 }}>{total}</span>
                {" "}resumes match
              </p>
            )}
          </div>

          <div className="sr-f4 sr-divider" />

          {/* ── Empty (no resumes at all) ── */}
          {total === 0 ? (
            <div className="sr-f5" style={{ textAlign:"center",padding:"80px 20px" }}>
              <div style={{ width:100,height:100,borderRadius:28,background:"rgba(139,92,246,.1)",border:"1px solid rgba(139,92,246,.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }}>
                <FileText size={42} style={{ color:"rgba(139,92,246,.4)" }} />
              </div>
              <p style={{ fontSize:22,fontWeight:700,color:"rgba(255,255,255,.55)",fontFamily:"'Sora',sans-serif",marginBottom:8 }}>No resumes yet</p>
              <p style={{ fontSize:14,color:"rgba(255,255,255,.28)",marginBottom:32 }}>Create your first resume to get started</p>
              <Link href="/resume-builder/create" className="sr-create-btn">
                <Plus size={16} /> Create Your First Resume
              </Link>
            </div>

          /* ── No search results ── */
          ) : filtered.length === 0 ? (
            <div className="sr-f5" style={{ textAlign:"center",padding:"64px 20px" }}>
              <Search size={40} style={{ margin:"0 auto 16px",display:"block",color:"rgba(255,255,255,.2)" }} />
              <p style={{ fontSize:17,fontWeight:600,color:"rgba(255,255,255,.45)",fontFamily:"'Sora',sans-serif",marginBottom:6 }}>No results for "{query}"</p>
              <p style={{ fontSize:13,color:"rgba(255,255,255,.25)",marginBottom:24 }}>Try a different name, template, or keyword</p>
              <button onClick={() => setQuery("")}
                style={{ padding:"9px 20px",borderRadius:12,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.6)",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
                Clear Search
              </button>
            </div>

          /* ── Resume grid ── */
          ) : (
            <div className="sr-f5" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20 }}>
              {filtered.map((resume) => {
                const name     = resume.formData?.personalInfo?.fullName?.trim();
                const email    = resume.formData?.personalInfo?.email;
                const phone    = resume.formData?.personalInfo?.phone;
                const comp     = computeCompletion(resume);
                const initials = name
                  ? name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
                  : '??';

                return (
                  <div key={resume._id} className="sr-card">

                    {/* header row */}
                    <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:14,minWidth:0 }}>
                        <div className="sr-avatar">{initials}</div>
                        <div style={{ minWidth:0 }}>
                          <h3 style={{ fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:"#fff",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                            {name || 'Untitled Resume'}
                          </h3>
                          <p style={{ fontSize:11.5,color:"rgba(255,255,255,.32)",margin:"4px 0 0",fontFamily:"'DM Sans',sans-serif" }}>
                            {new Date(resume.createdAt).toLocaleDateString('en-US',{ month:'short',day:'numeric',year:'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* actions */}
                      <div className="sr-card-actions">
                        <Link href={`/resume-builder/edit/${resume._id}`}
                          className="sr-icon-btn"
                          style={{ background:"rgba(139,92,246,.18)",border:"1px solid rgba(139,92,246,.25)",textDecoration:"none" }}>
                          <Edit size={14} style={{ color:"#c4b5fd" }} />
                        </Link>
                        <button
                          className="sr-icon-btn"
                          onClick={() => deleteResume(resume._id)}
                          disabled={deletingId === resume._id}
                          style={{ background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.25)",opacity:deletingId===resume._id?.5:1 }}>
                          {deletingId === resume._id
                            ? <Loader2 size={14} style={{ color:"#f87171",animation:"spin 1s linear infinite" }} />
                            : <Trash2  size={14} style={{ color:"#f87171" }} />}
                        </button>
                      </div>
                    </div>

                    {/* meta */}
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {email && (
                        <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:12.5,color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif" }}>
                          <Mail  size={12} style={{ color:"rgba(139,92,246,.6)",flexShrink:0 }} /> {email}
                        </div>
                      )}
                      {phone && (
                        <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:12.5,color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif" }}>
                          <Phone size={12} style={{ color:"rgba(139,92,246,.6)",flexShrink:0 }} /> {phone}
                        </div>
                      )}
                      <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:12.5,color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif" }}>
                        <Layers size={12} style={{ color:"rgba(139,92,246,.6)",flexShrink:0 }} />
                        <span className="sr-template-tag">{resume.selectedTemplate}</span>
                      </div>
                    </div>

                    {/* completion */}
                    <div>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7 }}>
                        <span style={{ fontSize:11,color:"rgba(255,255,255,.32)",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:".06em",fontWeight:600 }}>Completion</span>
                        <span style={{ fontSize:12,color:"#a78bfa",fontWeight:700,fontFamily:"'Sora',sans-serif" }}>{comp}%</span>
                      </div>
                      <div className="sr-bar-bg">
                        <div className="sr-bar-fill" style={{ width:`${comp}%`,background:"linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
                      </div>
                    </div>

                    {/* open button */}
                    <Link href={`/resume-builder/edit/${resume._id}`} className="sr-open-btn">
                      Open Resume <ChevronRight size={15} />
                    </Link>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}