
import Link from "next/link";
import { ArrowLeft, FileText, Target } from "lucide-react";
import CoverLetterList from "../../../components/ui/CoverLetterList";
import { getCoverLetters } from "../../../../actions/cover-letter";

function DualRing({ outer = 0, inner = 0, outerColor = "#7c3aed", innerColor = "#14b8a6", size = 96, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamp = (n) => Math.min(100, Math.max(0, n));
  const outerOffset = circ - (clamp(outer) / 100) * circ;
  const innerOffset = circ - (clamp(inner) / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={outerColor}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={outerOffset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r - stroke * 1.65}
        fill="none"
        stroke={innerColor}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={innerOffset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

export default async function SavedCoverLetters() {
  const { coverLetters } = await getCoverLetters();

  const total = coverLetters?.length || 0;
  const avgWords = total
    ? Math.round(
        (coverLetters
          .map((c) => (c.jobDescription || "").split(/\s+/).filter(Boolean).length)
          .reduce((a, b) => a + b, 0) || 0) / total
      )
    : 0;

  const totalPercent = Math.min(100, Math.round((total / 20) * 100));
  const wordPercent = Math.min(100, Math.round((avgWords / 220) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Title --- */}
        <h1 className="text-5xl font-bold text-white text-center mb-6">
          My Saved Cover Letters
        </h1>

        {/* --- Back Button Area  --- */}
        <div className="flex justify-start mb-8">
            <Link 
                href="/resume-builder" 
                className="flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all"
            >
                <ArrowLeft size={20} /> 
                Back to Dashboard
            </Link>
        </div>

        {/* --- Content List --- */}
        <CoverLetterList coverLetters={coverLetters || []} />
        
      </div>
    </div>
  );
}