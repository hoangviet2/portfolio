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
        alt="Viet Hoang Memoji"
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
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-ink">
          About Me
        </h2>
        <p className="text-lg text-ink/80 mb-2">
          I&apos;m Viet Hoang, a Computing &amp; Software Systems student at the University of Washington. I build AI-powered products — from a multi-agent RAG advising platform to a published App Store app with an AI tutor.
        </p>
        <p className="text-md text-muted">
          I&apos;ve done BCI research at ThinkNeuro, built AI features as a Student in Residence at MascotGO, competed at ICPC, and shipped at DubHacks. Off the keyboard you&apos;ll find me playing chess — try the neural net I trained on my own games.
        </p>
      </motion.div>
    </motion.section>
  );
}