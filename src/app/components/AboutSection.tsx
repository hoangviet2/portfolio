"use client";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <motion.section
      id="about"
      className="w-full max-w-3xl px-4 py-16 mx-auto flex flex-col md:flex-row items-center gap-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.img
        src="/images/memoji.jpg"
        alt="Hoang, Viet Memoji"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-40 h-auto mb-4 md:mb-0"
        whileHover={{ rotateY: 18 }}
        whileTap={{ rotateY: -10 }}
        style={{ perspective: 600 }}
      />
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
          About Me
        </h2>
        <p className="text-lg text-appleBlack/80 mb-2">
          I&apos;m Hoang, Viet, a Computer Science student focused on AI, machine learning, and software engineering. I build AI-driven applications, including personalized systems and data science solutions.
        </p>
        <p className="text-md text-gray-600">
          Experienced in hackathons, research projects, and competitive programming, I lead and contribute to tech communities while aiming to build scalable, intelligent systems with real-world impact.
        </p>
      </motion.div>
    </motion.section>
  );
}