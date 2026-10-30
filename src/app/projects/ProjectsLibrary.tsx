"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import { categories, projects, type Project } from "./data";

export default function ProjectsLibrary() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [open, setOpen] = useState<Project | null>(null);

  // "All" shows featured projects first, like a library's front display
  const visible =
    filter === "All"
      ? [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
      : projects.filter((p) => p.category === filter);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-20">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold text-center text-ink"
      >
        Projects
      </motion.h1>

      <div role="tablist" aria-label="Filter projects by type" className="mt-6 mb-10 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={filter === c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === c
                ? "bg-uw-purple text-white border-uw-purple dark:bg-uw-gold dark:text-uw-spirit-purple dark:border-uw-gold"
                : "border-line text-muted hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p) => (
            <ProjectCard key={p.slug} project={p} onOpen={() => setOpen(p)} />
          ))}
        </AnimatePresence>
      </motion.div>

      <ProjectModal project={open} onClose={() => setOpen(null)} />
    </main>
  );
}
