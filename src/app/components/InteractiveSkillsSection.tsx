"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const skillCategories = [
  {
    name: "Frontend",
    skills: [
      { name: "React Native", level: 80, color: "bg-uw-gold" },
      { name: "Swift", level: 90, color: "bg-uw-purple" },
      { name: "TypeScript", level: 90, color: "bg-uw-gold" },
      { name: "React/Next.js", level: 85, color: "bg-uw-heritage-gold" }
    ]
  },
  {
    name: "Backend",
    skills: [
      { name: "Node.js", level: 85, color: "bg-uw-lavender" },
      { name: "Python", level: 95, color: "bg-uw-purple" },
      { name: "REST APIs", level: 88, color: "bg-uw-gold" },
      { name: "PostgreSQL", level: 85, color: "bg-uw-heritage-gold" }
    ]
  },
  {
    name: "AI/ML",
    skills: [
      { name: "PyTorch", level: 70, color: "bg-uw-lavender" },
      { name: "TensorFlow", level: 85, color: "bg-uw-purple" },
      { name: "Design AI system", level: 90, color: "bg-uw-gold" },
      { name: "Agentic AI", level: 90, color: "bg-uw-heritage-gold" }
    ]
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
        <div className="flex bg-black/10 dark:bg-white/10 backdrop-blur-xl rounded-full p-1 border border-black/20 dark:border-white/20">
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
        className="grid gap-6 md:grid-cols-2"
      >
        {skillCategories[activeCategory].skills.map((skill, idx) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-line shadow-glass"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-ink">
                {skill.name}
              </h3>
              <span className="text-sm text-muted">
                {skill.level}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-chip rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${skill.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}