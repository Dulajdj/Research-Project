// app/resume-builder/cover-letter/saved/page.jsx
import CoverLetterList from "../../../components/ui/CoverLetterList";
import { getCoverLetters } from "../../../../actions/cover-letter";

export default async function SavedCoverLetters() {
  const { coverLetters } = await getCoverLetters();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-12">
          My Saved Cover Letters
        </h1>
        <CoverLetterList coverLetters={coverLetters} />
      </div>
    </div>
  );
}