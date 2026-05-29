"use client";
import { motion } from "framer-motion";

const educationItems = [
  {
    school: "University of Washington Tacoma",
    dates: "September 2026 - Present",
    program: "B.S. Computer Science and Systems",
    highlights: [
      "Currently enrolled and continuing coursework."
    ]
  },
  {
    school: "Green River College",
    dates: "September 2024 - August 2026",
    program: "Associate in Computer Science",
    highlights: [
      "Relevant coursework: Calculus I, II, III; Topics in Linear Algebra; Discrete Structures."
    ]
  }
];

export default function EducationSection() {
  return (
    <motion.section
      id="education"
      className="w-full max-w-5xl px-4 py-20 mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
          Education
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Currently pursuing my degree while building real-world projects.
        </p>
      </div>

      <div className="grid gap-6">
        {educationItems.map((item) => (
          <motion.div
            key={item.school}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative rounded-3xl border border-white/40 dark:border-white/20 bg-white/70 dark:bg-white/10 shadow-glass p-8 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  {item.school}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {item.program}
                </p>
              </div>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-appleGray text-appleBlack/80">
                {item.dates}
              </span>
            </div>

            <ul className="mt-6 space-y-3 text-gray-600 dark:text-gray-300">
              {item.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-appleBlue" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
