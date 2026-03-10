import Link from "next/link";
import { ArrowLeft, FileText, Sparkles, Plus } from "lucide-react";
import CoverLetterList from "../../../components/ui/CoverLetterList";
import { getCoverLetters } from "../../../../actions/cover-letter";

export default async function SavedCoverLetters() {
  const { coverLetters } = await getCoverLetters();
  const count = coverLetters?.length ?? 0;

  return (
    <>
      {/* ── inline styles + keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .cl-page * { box-sizing: border-box; }

        @keyframes cl-fadeup {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cl-orb {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(28px,-18px) scale(1.07); }
          66%      { transform: translate(-18px,14px) scale(0.96); }
        }

        .cl-fadeup-1 { animation: cl-fadeup 0.55s cubic-bezier(.22,1,.36,1) 0.05s both; }
        .cl-fadeup-2 { animation: cl-fadeup 0.55s cubic-bezier(.22,1,.36,1) 0.15s both; }
        .cl-fadeup-3 { animation: cl-fadeup 0.55s cubic-bezier(.22,1,.36,1) 0.25s both; }
        .cl-fadeup-4 { animation: cl-fadeup 0.55s cubic-bezier(.22,1,.36,1) 0.35s both; }

        .cl-orb-a { animation: cl-orb 14s ease-in-out infinite; }
        .cl-orb-b { animation: cl-orb 19s ease-in-out 5s infinite reverse; }

        .cl-back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 18px; border-radius: 12px;
          font-size: 13.5px; font-weight: 500;
          color: rgba(255,255,255,0.62);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          text-decoration: none;
          transition: color .2s, background .2s, border-color .2s, transform .18s;
          font-family: 'DM Sans', sans-serif;
        }
        .cl-back-btn:hover {
          color: #fff;
          background: rgba(139,92,246,0.18);
          border-color: rgba(139,92,246,0.45);
          transform: translateX(-2px);
        }

        .cl-new-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 12px;
          font-size: 13.5px; font-weight: 600; color: #fff;
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          border: 1px solid rgba(139,92,246,0.45);
          text-decoration: none;
          transition: opacity .2s, transform .18s, box-shadow .2s;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 20px rgba(109,40,217,0.38);
        }
        .cl-new-btn:hover {
          opacity: 0.88; transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(109,40,217,0.5);
        }

        .cl-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 13px; border-radius: 99px; font-size: 11.5px; font-weight: 500;
          background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.28);
          color: #c4b5fd; font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.04em; text-transform: uppercase;
        }

        .cl-count-chip {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 28px; height: 22px; padding: 0 9px; border-radius: 99px;
          font-size: 11.5px; font-weight: 700;
          background: rgba(139,92,246,0.22); color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.22);
          font-family: 'DM Sans', sans-serif;
          margin: 0 4px;
        }

        .cl-divider {
          height: 1px; margin-bottom: 36px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(30,27,75,0.6), transparent);
        }
      `}</style>

      <div
        className="cl-page"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #020617 0%, #1a0533 55%, #0f172a 100%)",
          padding: "clamp(20px,5vw,48px)",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >

        {/* ── ambient background orbs ── */}
        <div
          className="cl-orb-a"
          style={{
            position: "fixed", top: "-8%", right: "-4%",
            width: 520, height: 520, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(88,28,135,0.2) 0%, transparent 68%)",
            pointerEvents: "none", zIndex: 0,
          }}
        />
        <div
          className="cl-orb-b"
          style={{
            position: "fixed", bottom: "-12%", left: "-6%",
            width: 580, height: 580, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(30,27,75,0.32) 0%, transparent 68%)",
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* subtle dot grid */}
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(rgba(139,92,246,0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* ── main content ── */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>

          {/* nav row */}
          <div
            className="cl-fadeup-1"
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 52,
            }}
          >
            <Link href="/resume-builder" className="cl-back-btn">
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>

            <Link 
                    href="/resume-builder/cover-letter/create"
                    className="bg-gradient-to-r from-purple-800 to-purple-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition transform hover:scale-105"
                  >
                    <Sparkles className="w-2 h-2 inline mr-2" />
                    Create New Cover Letter
                  </Link>
          </div>

          {/* hero title */}
          <div className="cl-fadeup-2" style={{ textAlign: "center", marginBottom: 44 }}>

            <h1
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(1.9rem, 4.5vw, 3.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.1,
                margin: "0 0 18px",
                background: "linear-gradient(140deg, #ffffff 25%, #ddd6fe 60%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Saved Cover Letters
            </h1>

            <p
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, fontSize: 13.5, color: "rgba(255,255,255,0.42)",
                fontFamily: "'DM Sans', sans-serif", margin: 0,
              }}
            >
              <FileText size={13} style={{ color: "#a78bfa" }} />
              You have
              <span className="cl-count-chip">{count}</span>
              {count === 1 ? "letter" : "letters"} saved
            </p>
          </div>

          {/* divider */}
          <div className="cl-fadeup-3 cl-divider" />

          {/* cover letter list — your original component, untouched */}
          <div className="cl-fadeup-4">
            <CoverLetterList coverLetters={coverLetters || []} />
          </div>

        </div>
      </div>
    </>
  );
}