"use client";

import { Suspense } from "react";
import SurveyContent from "@/components/seeker/nps-survey/SurveyContent";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading survey...</p>
        </div>
      </div>
    }>
      <SurveyContent />
    </Suspense>
  );
}