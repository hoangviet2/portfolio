"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import ProjectCard from "../projects/ProjectCard";
import ProjectModal from "../projects/ProjectModal";
import { projects, type Project } from "../projects/data";

// Home-page teaser; the full, filterable list lives at /projects/.
export default function ProjectsSection() {
  const [open, setOpen] = useState<Project | null>(null);
  const featured = projects.filter((p) => p.featured);

  return (
    <motion.section
      id="projects"
      className="w-full max-w-6xl px-4 py-20"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-ink">
        Featured Projects
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p) => (
          <ProjectCard key={p.slug} project={p} onOpen={() => setOpen(p)} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <motion.a
          href="/projects/"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-semibold bg-uw-purple text-white dark:bg-uw-gold dark:text-uw-spirit-purple shadow-lg"
        >
          See all projects <span aria-hidden>→</span>
        </motion.a>
      </div>
      <ProjectModal project={open} onClose={() => setOpen(null)} />
    </motion.section>
  );
}
