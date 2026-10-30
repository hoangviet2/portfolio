"use client";
import { motion } from "framer-motion";

const experience = [
  {
    role: "Student in Residence",
    org: "MascotGO",
    where: "Remote / San Francisco, CA",
    dates: "Jan 2026 – Sep 2026",
    points: [
      "Built an AI-powered system that gave students climate insights for their destination locations.",
      "Analyzed large user datasets to identify behavior trends and inform product strategy.",
      "Tested features and contributed to UX, user-journey, and student-engagement discussions, plus outreach to students and educators.",
    ],
  },
  {
    role: "Quantitative Research Intern",
    org: "ThinkNeuro, LLC",
    where: "Remote / Seattle, WA",
    dates: "Jun 2025 – Aug 2025",
    points: [
      "Researched Brain-Computer Interface (BCI) systems with Python (Pandas, NumPy, SciPy), R, and MATLAB, synthesizing 100+ scientific papers on neural signal processing.",
      "Produced reports shaping neural decoding, EEG/MEG preprocessing (MNE-Python), and signal-processing methods for 2 active BCI projects.",
    ],
  },
];

const honors = [
  {
    title: "ICPC North America Pacific Northwest Regional (C++)",
    detail: "8th place, Washington Division 2 · Honorable Mention",
    date: "Nov 2025",
  },
  {
    title: "Seattle Data AI Hackathon",
    detail: "Third Place",
    date: "Dec 2025",
  },
];

const item = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } };

export default function AchievementsSection() {
  return (
    <motion.section
      id="achievements"
      className="w-full max-w-4xl px-4 py-16 mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-ink">
        Experience
      </h2>
      <motion.ol
        className="space-y-8 text-left mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
      >
        {experience.map((job) => (
          <motion.li key={job.role} variants={item} className="border-l-2 border-accent pl-5">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
              <span className="font-semibold text-ink">{job.role} · {job.org}</span>
              <span className="text-sm text-muted">{job.dates}</span>
            </div>
            <p className="text-sm text-muted italic">{job.where}</p>
            <ul className="mt-2 space-y-1 text-muted list-disc list-inside">
              {job.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </motion.li>
        ))}
      </motion.ol>

      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-ink">
        Honors &amp; Awards
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {honors.map((h) => (
          <div key={h.title} className="rounded-2xl border border-line bg-surface/80 shadow-glass p-5">
            <p className="text-xs text-muted">{h.date}</p>
            <p className="mt-1 font-semibold text-ink">{h.title}</p>
            <p className="text-sm text-muted">{h.detail}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
