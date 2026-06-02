"use client";
import { motion } from "framer-motion";

const socials = [
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/vietbenhoang/",
    username: "vietbenhoang",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 50 50" className="dark:invert">
        <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
      </svg>
    ),
  },
  {
    name: "GitHub",
    link: "https://github.com/hoangviet2",
    username: "hoangviet2",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 64 64" className="dark:invert">
        <path d="M32 6C17.641 6 6 17.641 6 32c0 12.277 8.512 22.56 19.955 25.286-.592-.141-1.179-.299-1.755-.479V50.85c0 0-.975.325-2.275.325-3.637 0-5.148-3.245-5.525-4.875-.229-.993-.827-1.934-1.469-2.509-.767-.684-1.126-.686-1.131-.92-.01-.491.658-.471.975-.471 1.625 0 2.857 1.729 3.429 2.623 1.417 2.207 2.938 2.577 3.721 2.577.975 0 1.817-.146 2.397-.426.268-1.888 1.108-3.57 2.478-4.774-6.097-1.219-10.4-4.716-10.4-10.4 0-2.928 1.175-5.619 3.133-7.792C19.333 23.641 19 22.494 19 20.625c0-1.235.086-2.751.65-4.225 0 0 3.708.026 7.205 3.338C28.469 19.268 30.196 19 32 19s3.531.268 5.145.738c3.497-3.312 7.205-3.338 7.205-3.338.567 1.474.65 2.99.65 4.225 0 2.015-.268 3.19-.432 3.697C46.466 26.475 47.6 29.124 47.6 32c0 5.684-4.303 9.181-10.4 10.4 1.628 1.43 2.6 3.513 2.6 5.85v8.557c-.576.181-1.162.338-1.755.479C49.488 54.56 58 44.277 58 32 58 17.641 46.359 6 32 6zM33.813 57.93C33.214 57.972 32.61 58 32 58 32.61 58 33.213 57.971 33.813 57.93zM37.786 57.346c-1.164.265-2.357.451-3.575.554C35.429 57.797 36.622 57.61 37.786 57.346zM32 58c-.61 0-1.214-.028-1.813-.07C30.787 57.971 31.39 58 32 58zM29.788 57.9c-1.217-.103-2.411-.289-3.574-.554C27.378 57.61 28.571 57.797 29.788 57.9z"></path>
      </svg>
    ),
  },
];

export default function ContactSection() {
  return (
    <motion.section
      id="contact"
      className="w-full max-w-xl px-4 py-16 mx-auto text-center"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-black dark:text-white">
        Contact
      </h2>
      
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-black/20 dark:bg-white/10 backdrop-blur-xl border border-black/30 dark:border-white/20 rounded-2xl shadow-glass p-8 flex flex-col gap-4 mb-8"
        onSubmit={e => e.preventDefault()}
      >
        <input
          type="text"
          placeholder="Your Name"
          className="px-4 py-3 rounded-lg bg-black/20 dark:bg-white/10 backdrop-blur-md border border-black/20 dark:border-white/20 shadow-glass focus:border-appleBlue outline-none transition-all"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          className="px-4 py-3 rounded-lg bg-black/20 dark:bg-white/10 backdrop-blur-md border border-black/20 dark:border-white/20 shadow-glass focus:border-appleBlue outline-none transition-all"
          required
        />
        <textarea
          placeholder="Your Message"
          className="px-4 py-3 rounded-lg bg-black/20 dark:bg-white/10 backdrop-blur-md border border-black/20 dark:border-white/20 shadow-glass focus:border-appleBlue outline-none min-h-[100px] transition-all"
          required
        />
        <button
          type="submit"
          className="mt-2 px-6 py-3 rounded-full bg-white/30 dark:bg-white/10 backdrop-blur-xl border border-black/40 dark:border-white/20 shadow-glass text-appleBlack dark:text-white font-semibold text-lg transition-all duration-200 hover:bg-white/50 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-appleBlue/60"
        >
          Send Message
        </button>
      </motion.form>

      {/* Social Media Icons - Clean Layout Without Background */}
      <motion.div 
        className="flex justify-center items-center gap-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        {socials.map((social, index) => (
          <motion.a
            key={social.name}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 transition-all duration-200 hover:scale-110"
            aria-label={social.name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
          >
            {social.svg}
          </motion.a>
        ))}
      </motion.div>

      {/* Download Resume Button */}
      <motion.a
        href="/Resume0602.pdf"
        className="inline-block px-6 py-3 rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-xl border border-black/40 dark:border-white/20 shadow-glass text-appleBlack dark:text-white font-medium transition-all duration-200 hover:bg-black/30 dark:hover:bg-white/20 mb-8"
        download
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      >
        Download Resume
      </motion.a>

      {/* Copyright Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="text-sm text-gray-600 dark:text-gray-400 border-t border-black/10 dark:border-white/10 pt-6"
      >
        <p>© {new Date().getFullYear()} Hoang, Viet. All rights reserved.</p>
      </motion.div>
    </motion.section>
  );
}