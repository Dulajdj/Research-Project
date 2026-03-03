// components/ui/CoverLetterList.jsx
"use client"; // ← මේක එකතු කරන්න!

import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { deleteCoverLetter } from "../../../actions/cover-letter";
import { toast } from "react-hot-toast"; // fallback since sonner not installed
import { format } from "date-fns";


export default function CoverLetterList({ coverLetters }) {
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this cover letter?")) return;

    try {
      await deleteCoverLetter(id);
      toast.success("Deleted successfully!");
      window.location.reload(); // simple reload (or use router.refresh() if using next/navigation)
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (!coverLetters || coverLetters.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-3xl text-gray-400 mb-8">No cover letters yet</p>
        <Link href="/resume-builder/cover-letter/create">
          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
            Create Your First Cover Letter
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {coverLetters.map((letter) => (
        <Card key={letter.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all hover:scale-105">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-white">{letter.jobTitle}</CardTitle>
                <p className="text-lg text-gray-300">{letter.companyName}</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/resume-builder/cover-letter/edit/${letter.id}`}>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Eye className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/20"
                  onClick={() => handleDelete(letter.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 line-clamp-3 mb-4">{letter.jobDescription}</p>
            <p className="text-sm text-gray-400">
              Created on {format(new Date(letter.createdAt), "PPP")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}