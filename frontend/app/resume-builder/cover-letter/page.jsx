// app/resume-builder/cover-letter/page.jsx
// (root of cover-letter section)
import CoverLetterList from "../../../components/ui/CoverLetterList";
import { getCoverLetters } from "../../../actions/cover-letter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SavedCoverLetters() {
  const { coverLetters } = await getCoverLetters();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-12">
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
        <CoverLetterList coverLetters={coverLetters} />
      </div>
      
    </div>
  );
}