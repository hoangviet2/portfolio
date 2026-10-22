"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import components to avoid SSR issues with no SSR
const LoadingScreen = dynamic(() => import("./components/LoadingScreen"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  )
});

const HeroSection = dynamic(() => import("./components/HeroSection"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black"></div>
});

const ProjectsSection = dynamic(() => import("./components/ProjectsSection"), {
  ssr: false
});

const AchievementsSection = dynamic(() => import("./components/AchievementsSection"), {
  ssr: false
});

const ToolsSection = dynamic(() => import("./components/ToolsSection"), {
  ssr: false
});

const InteractiveSkillsSection = dynamic(() => import("./components/InteractiveSkillsSection"), {
  ssr: false
});

const ChessBoardSection = dynamic(() => import("./components/ChessBoardSection"), {
  ssr: false
});

const StatsSection = dynamic(() => import("./components/StatsSection"), {
  ssr: false
});

const AboutSection = dynamic(() => import("./components/AboutSection"), {
  ssr: false
});

const EducationSection = dynamic(() => import("./components/EducationSection"), {
  ssr: false
});


export default function Home() {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // The boot screen plays on every fresh visit, but not when jumping to a section from
    // another page (e.g. /chess/ → /#projects)
    if (window.location.hash) {
      setShowLoading(false);
      setShowContent(true);
      setTimeout(() => {
        document.querySelector(window.location.hash)?.scrollIntoView();
      }, 400);
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setTimeout(() => {
      setShowContent(true);
    }, 300);
  };

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      
      {showContent && (
        <main className="flex flex-col items-center w-full min-h-screen">
          <HeroSection />
          <StatsSection />
          <ProjectsSection />
          <AchievementsSection />
          <ToolsSection />
          <InteractiveSkillsSection />
          <ChessBoardSection />
          <AboutSection />
          <EducationSection />
        </main>
      )}
    </>
  );
}