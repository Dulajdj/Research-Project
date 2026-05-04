'use client';

import React, { use, Suspense } from 'react';
// Using the '@' shortcut to jump straight to the components folder
import SkillTracker from '../../../components/SkillTracker';
import { Loader2 } from 'lucide-react';

export default function CourseRoadmapPage({ params }) {
  // Unwrap the params Promise using React.use()
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;

  return (
    <div className="min-h-screen bg-slate-950 py-10">
      <Suspense fallback={<LoadingFallback />}>
        <SkillTracker skill={courseId} />
      </Suspense>
    </div>
  );
}

// A simple loading component
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-purple-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p className="text-gray-400 animate-pulse">Loading roadmap...</p>
    </div>
  );
}