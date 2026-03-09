// components/ui/CoverLetterGenerator.jsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { generateCoverLetter } from "@/actions/cover-letter";
import { coverLetterSchema } from "@/lib/schema";
import { useRouter } from "next/navigation";

export default function CoverLetterGenerator() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const onSubmit = async (data) => {
    setGenerating(true);
    try {
      const result = await generateCoverLetter(data);
      toast.success("Cover letter generated!");
      router.push(`/resume-builder/cover-letter/edit/${result.id}`);
    } catch (err) {
      toast.error("Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Generate Cover Letter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="text-white">Company Name</Label>
              <Input
                {...register("companyName")}
                placeholder="e.g. Google, Microsoft"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
              {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <Label className="text-white">Job Title</Label>
              <Input
                {...register("jobTitle")}
                placeholder="e.g. Software Engineer"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
              {errors.jobTitle && <p className="text-red-400 text-sm mt-1">{errors.jobTitle.message}</p>}
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-white">Job Description</Label>
            <Textarea
              {...register("jobDescription")}
              rows={12}
              placeholder="Paste the full job description here..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 resize-none"
            />
            {errors.jobDescription && <p className="text-red-400 text-sm mt-1">{errors.jobDescription.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl text-lg py-6 font-bold"
          >
            {generating ? (
              <>
                Generating... <Loader2 className="animate-spin ml-2 h-5 w-5" />
              </>
            ) : (
              "Generate Cover Letter"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}