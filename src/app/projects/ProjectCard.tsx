"use client";
import { motion } from "framer-motion";
import type { Project } from "./data";

const MAX_TECH = 5;

export default function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const shown = project.tech.slice(0, MAX_TECH);
  const extra = project.tech.length - shown.length;

  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className={`relative flex flex-col items-start text-left rounded-2xl bg-surface/80 backdrop-blur-xs shadow-glass p-6 cursor-pointer ${
        project.featured ? "border-2 border-uw-purple dark:border-uw-gold" : "border border-line hover:border-accent"
      }`}
    >
      {project.featured && (
        <span aria-hidden className="absolute top-4 right-4 text-uw-spirit-gold text-lg">★</span>
      )}
      <span className="px-2.5 py-0.5 rounded-full bg-chip text-[10px] font-semibold uppercase tracking-wide text-muted">
        {project.featured ? "Featured" : project.category}
      </span>

      <h3 className="mt-3 text-lg font-bold text-ink leading-snug">
        {project.title}
        {project.year && <span className="ml-2 text-xs font-semibold text-muted">{project.year}</span>}
      </h3>

      <p className="mt-2 text-sm text-muted line-clamp-4">{project.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {shown.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-md bg-chip text-[11px] font-medium text-ink/80">
            {t}
          </span>
        ))}
        {extra > 0 && <span className="px-1 py-0.5 text-[11px] font-medium text-muted">+{extra}</span>}
      </div>

      {project.links && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1 rounded-lg border border-line text-xs font-medium text-accent hover:border-accent"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
