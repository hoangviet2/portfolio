"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const skillCategories = [
  {
    name: "Languages",
    skills: ["Python", "Java", "C/C++", "JavaScript", "TypeScript", "Swift", "R", "MATLAB", "HTML/CSS"]
  },
  {
    name: "Frameworks",
    skills: ["React Native", "Expo", "React", "Flutter", "Flask", "FastAPI", "TensorFlow"]
  },
  {
    name: "AI & Data",
    skills: ["OpenAI API", "Gemini", "Amazon Bedrock", "RAG", "OCR", "Pandas", "NumPy", "SciPy", "MNE-Python"]
  },
  {
    name: "Cloud & Tools",
    skills: ["AWS (S3, Bedrock)", "Supabase", "Firebase", "MongoDB", "Chroma", "Vercel", "Git", "Claude Code", "Cursor", "Figma"]
  }
];

export default function InteractiveSkillsSection() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <motion.section
      id="skills"
      className="w-full max-w-6xl px-4 py-16 mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-ink">
        Skills & Expertise
      </h2>
      
      {/* Category Tabs */}
      <div className="flex justify-center mb-12">
        <div className="flex flex-wrap justify-center bg-black/10 dark:bg-white/10 backdrop-blur-xl rounded-full p-1 border border-black/20 dark:border-white/20">
          {skillCategories.map((category, idx) => (
            <motion.button
              key={category.name}
              onClick={() => setActiveCategory(idx)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeCategory === idx
                  ? 'bg-uw-purple text-white shadow-lg dark:bg-uw-gold dark:text-uw-spirit-purple'
                  : 'text-muted hover:text-ink'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Skills Display */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
      >
        {skillCategories[activeCategory].skills.map((skill, idx) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="bg-surface/80 backdrop-blur-xl rounded-xl px-5 py-3 border border-line shadow-glass font-semibold text-ink"
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>
    </motion.section>
  );
}