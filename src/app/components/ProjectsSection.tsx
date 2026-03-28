"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const projects = [
  {
    title: "Tiny Tales",
    tech: ["Python", "Machine Learning", "NLP", "React"],
    description: `An AI-driven storytelling platform for generating personalized short stories.\n\n• Uses language models to create adaptive narratives based on user prompts.\n• Focuses on personalization, creativity, and a smooth reading experience.\n• Built with a scalable architecture for future feature expansion.`,
    image: "/images/brokerex.png",
  },
  {
    title: "Gator Guide",
    tech: ["Next.js", "TypeScript", "Node.js", "Data Engineering"],
    description: `A student-focused guide platform that helps users navigate campus resources and opportunities.\n\n• Aggregates useful academic and campus information in one place.\n• Prioritizes usability, searchability, and clear information architecture.\n• Built to support collaborative updates and evolving student needs.`,
    image: "/images/lodgein.png",
  },
  {
    title: "Digital Fridge",
    tech: ["AI", "Computer Vision", "Python", "Cloud APIs"],
    description: `An intelligent kitchen assistant for inventory tracking and smart food management.\n\n• Helps monitor stored items and reduce food waste with data-driven suggestions.\n• Designed around practical everyday workflows and accessibility.\n• Combines machine learning with software engineering for real-world impact.`,
    image: "/images/confera.png",
  },
];

export default function ProjectsSection() {
  return (
    <motion.section
      id="projects"
      className="w-full max-w-6xl px-4 py-20"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-black dark:text-white">
        Featured Projects
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {projects.map((project) => (
          <motion.div
            key={project.title}
            whileHover={{ y: -8, boxShadow: "0 8px 32px 0 rgba(31,38,135,0.15)" }}
            className="group bg-white/70 dark:bg-white/10 backdrop-blur-xs rounded-2xl shadow-glass p-6 flex flex-col items-start transition-all duration-200 border border-white/40 dark:border-white/20 hover:border-appleBlue"
          >
            <Image
              src={project.image}
              alt={project.title + ' icon'}
              width={80}
              height={80}
              className="w-20 h-20 object-contain mb-3 rounded-xl shadow"
            />
            <h3 className="text-lg font-semibold mb-2 group-hover:text-appleBlue transition-colors">
              {project.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-appleGray text-appleBlack/80 rounded-full text-xs font-medium shadow-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{project.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}