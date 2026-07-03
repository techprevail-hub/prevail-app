"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileEdit } from "lucide-react";
import ResumeAnalyzer from "@/components/resume/resume-analyzer";
import ResumeBuilder from "@/components/resume/resume-builder";

export default function ResumeTabs() {
  const [activeTab, setActiveTab] = useState("analyzer");

  return (
    <div className="min-h-screen">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        {/* ---------------- Tabs Navigation ---------------- */}
        <div className="flex justify-center py-4">
          <TabsList
            className="
              inline-flex
              items-center
              gap-4
              p-0
              bg-transparent
              border-0
              shadow-none
              rounded-none
            "
          >
            {/* Analyze Resume */}
            <TabsTrigger
              value="analyzer"
              className="
                flex items-center gap-3
                px-12 py-5
                rounded-2xl
                text-lg
                font-semibold
                text-gray-600
                bg-white
                border-0
                shadow-none
                ring-0
                transition-all
                duration-300

                hover:bg-gray-100
                hover:text-gray-900
                hover:scale-105

                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-indigo-600
                data-[state=active]:to-purple-600
                data-[state=active]:text-white
                data-[state=active]:shadow-xl
                data-[state=active]:scale-105
              "
            >
              <BarChart3 className="w-6 h-6" />
              <span>Analyze Resume</span>
            </TabsTrigger>

            {/* Resume Builder */}
            <TabsTrigger
              value="builder"
              className="
                flex items-center gap-3
                px-12 py-5
                rounded-2xl
                text-lg
                font-semibold
                text-gray-600
                bg-white
                border-0
                shadow-none
                ring-0
                transition-all
                duration-300

                hover:bg-gray-100
                hover:text-gray-900
                hover:scale-105

                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-indigo-600
                data-[state=active]:to-purple-600
                data-[state=active]:text-white
                data-[state=active]:shadow-xl
                data-[state=active]:scale-105
              "
            >
              <FileEdit className="w-6 h-6" />
              <span>Build Resume</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ---------------- Tab Content ---------------- */}

        <TabsContent value="analyzer" className="mt-0">
          <ResumeAnalyzer />
        </TabsContent>

        <TabsContent value="builder" className="mt-0">
          <ResumeBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}