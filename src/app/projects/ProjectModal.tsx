"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { Project } from "./data";

export default function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface border border-line shadow-2xl"
          >
            {/* macOS-style title bar */}
            <div className="sticky top-0 flex items-center justify-between px-4 py-2.5 bg-uw-cream dark:bg-white/10 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="font-mono text-xs text-muted">~/{project.slug}.txt</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-7 h-7 grid place-items-center rounded-md bg-chip text-ink hover:bg-uw-gold/40"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-ink">{project.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {project.role}
                {project.year && ` · ${project.year}`} · {project.category}
              </p>
              <p className="mt-4 text-ink/85 leading-relaxed">{project.description}</p>
              <p className="mt-5 text-sm text-muted">
                <strong className="text-ink">Technologies:</strong> {project.tech.join(", ")}
              </p>
              {project.links && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-ink mb-2">Links:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        className="px-4 py-1.5 rounded-lg border border-line text-sm font-medium text-accent hover:border-accent"
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
