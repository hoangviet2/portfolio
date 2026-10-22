"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  // Random particle layout is generated once so it doesn't re-roll on every progress tick
  const [particles] = useState(() =>
    Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 8 + Math.random() * 4,
      delay: Math.random() * 6,
    }))
  );

  const phases = [
    "Starting up...",
    "Loading system components...",
    "Initializing portfolio...",
    "Go Huskies!"
  ];
  const currentPhase = loadingProgress > 90 ? 3 : loadingProgress > 60 ? 2 : loadingProgress > 25 ? 1 : 0;

  useEffect(() => {
    // Show logo immediately
    setShowLogo(true);

    // Show button after loading completes
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 4000);

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 6 + 3; // 3-9% increments
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => {
      clearTimeout(buttonTimer);
      clearInterval(progressInterval);
    };
  }, []);

  const handleAccessPortfolio = () => {
    setIsComplete(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#0d0619]"
        style={{ background: "radial-gradient(ellipse at 50% 40%, #2a1650 0%, #0d0619 65%)" }}
      >
        {/* Subtle animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-uw-gold/40 rounded-full"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
              }}
              animate={{
                y: [-30, -120, -30],
                opacity: [0, 0.4, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* UW Logo with Bootup Animation */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 1.5, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="mb-8"
            >
              {/* Logo glow */}
              <motion.div
                className="relative flex items-center justify-center"
                animate={{
                  filter: [
                    "drop-shadow(0 0 20px rgba(183,165,122,0.35))",
                    "drop-shadow(0 0 44px rgba(183,165,122,0.7))",
                    "drop-shadow(0 0 20px rgba(183,165,122,0.35))"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* UW "W" mark — gold block W with a purple shadow layer behind it */}
                <motion.div
                  className="relative w-[132px] h-[89px]"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src="/UWlogo.png"
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-contain translate-x-[5px] translate-y-[5px] opacity-90"
                    style={{ filter: "brightness(1.6) saturate(1.2)" }}
                    draggable={false}
                  />
                  <img
                    src="/UWgolden.png"
                    alt="University of Washington W"
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable={false}
                  />
                </motion.div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bootup Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-center max-w-md w-full px-8"
        >
          {/* Progress Bar */}
          <div className="w-full h-1 bg-uw-lavender/15 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-uw-heritage-gold via-uw-gold to-uw-spirit-gold rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                boxShadow: "0 0 12px rgba(255,199,0,0.45)"
              }}
            />
          </div>
          
          {/* Loading Text */}
          <motion.p
            key={currentPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-uw-lavender/80 text-sm mb-2"
            style={{
              fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            }}
          >
            {phases[currentPhase]}
          </motion.p>

          {/* Progress Percentage */}
          <motion.p
            className="text-uw-gold/70 text-xs"
            style={{
              fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            }}
          >
            {Math.round(loadingProgress)}%
          </motion.p>
        </motion.div>

        {/* Access Button */}
        <AnimatePresence>
          {showButton && loadingProgress >= 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="mt-12"
            >
              <motion.button
                onClick={handleAccessPortfolio}
                className="group relative px-8 py-4 rounded-2xl font-medium text-white overflow-hidden transition-all duration-300 border border-uw-gold/40"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.1) 0%, 
                      rgba(255, 255, 255, 0.05) 100%
                    )
                  `,
                  backdropFilter: "blur(20px)",
                  boxShadow: `
                    0 8px 25px rgba(255, 255, 255, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `,
                  fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 12px 35px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Button shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
                
                <span className="relative z-10 flex items-center justify-center">
                  Enter Portfolio
                  <motion.span
                    className="ml-2"
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sarcastic Design Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showButton ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute bottom-8 text-center"
        >
          <p
            className="text-white/30 text-xs italic"
            style={{
              fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            }}
          >
            Bow down to Washington 💜💛
          </p>
        </motion.div>

        {/* Completion overlay */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#0d0619] z-10"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}