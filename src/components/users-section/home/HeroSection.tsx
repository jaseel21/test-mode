"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Precompute particle styles to ensure consistency
const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  width: `${Math.random() * 40 + 5}px`, // Computed once at module level
  height: `${Math.random() * 40 + 5}px`,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
}));

const HeroSection = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle mouse movement
  useEffect(() => {
    setIsMounted(true); // Set mounted flag after component mounts
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = clientX / innerWidth - 0.5;
      const y = clientY / innerHeight - 0.5;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Donation amount options
  const donationAmounts = [
    { amount: "₹100", value: 100 },
    { amount: "₹500", value: 500 },
    { amount: "₹1000", value: 1000 },
    { amount: "₹10,000", value: 10000 },
  ];

  const handleDonationSelect = (value: number) => {
    router.push(`/donation?amount=${value}`);
  };

  return (
    <section className="relative min-h-screen pt-20 pb-16 overflow-hidden flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 dark:from-gray-900 dark:via-indigo-900 dark:to-gray-900 z-0" />

      {/* Particle effect - only render on client */}
      {isMounted && (
        <div className="absolute inset-0 z-10 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white/10 dark:bg-white/5"
              style={{
                width: particle.width,
                height: particle.height,
                left: particle.left,
                top: particle.top,
                filter: "blur(1px)",
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                opacity: [0.1, 0.5, 0.1],
                scale: [1, Math.random() * 1.5 + 0.5, 1],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      )}

      {/* Decorative circles */}
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-purple-600/20 dark:bg-purple-900/20 blur-3xl z-10"
        animate={{
          x: mousePosition.x * -20,
          y: mousePosition.y * -20,
        }}
        transition={{ type: "spring", damping: 20 }}
      />
      <motion.div
        className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-indigo-600/20 dark:bg-indigo-900/20 blur-3xl z-10"
        animate={{
          x: mousePosition.x * 20,
          y: mousePosition.y * 20,
        }}
        transition={{ type: "spring", damping: 20 }}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-20 flex flex-col lg:flex-row items-center">
        {/* Left column - text content */}
        <div className="w-full lg:w-7/12 lg:pr-12 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4 px-4 py-1 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10"
          >
            <span className="text-white/90 dark:text-white/80 font-medium text-sm">
              Transforming Lives Together
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white"
          >
            <span className="block">Empower Lives,</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-indigo-300 dark:from-purple-300 dark:to-indigo-400">
              Frame Memories
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white ailwind CSS classes/80 dark:text-white/70 mb-8 max-w-2xl mx-auto lg:mx-0"
          >
            Join our mission to create lasting impact through your generous contributions.
            Every donation helps transform lives and preserve precious moments.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-10"
          >
            <Link href="/donation">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-xl group"
              >
                <span className="relative z-10">Donate Now</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 z-0"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.button>
            </Link>

            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white font-medium border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-colors duration-300"
              >
                Our Impact
              </motion.button>
            </Link>
          </motion.div>

          {/* Quick donation options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex flex-wrap justify-center lg:justify-start gap-3"
          >
            {donationAmounts.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleDonationSelect(option.value)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-3 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white font-medium border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                {option.amount}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Right column - abstract visualization */}
        <div className="w-full lg:w-5/12 mt-12 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative aspect-square max-w-lg mx-auto"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-full blur-2xl"
              animate={{
                x: mousePosition.x * 20,
                y: mousePosition.y * 20,
              }}
              transition={{ type: "spring", damping: 25 }}
            />

            <motion.div
              className="absolute inset-10 bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 dark:from-indigo-600/40 dark:to-purple-600/40 rounded-full blur-xl"
              animate={{
                x: mousePosition.x * 15,
                y: mousePosition.y * 15,
              }}
              transition={{ type: "spring", damping: 20 }}
            />

            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden border border-white/20 dark:border-white/10 backdrop-blur-sm"
              animate={{
                x: mousePosition.x * 10,
                y: mousePosition.y * 10,
              }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 to-purple-600/40 dark:from-indigo-600/20 dark:to-purple-600/20 mix-blend-overlay" />
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                x: mousePosition.x * 5,
                y: mousePosition.y * 5,
              }}
              transition={{ type: "spring", damping: 10 }}
            >
              <div className="relative w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full backdrop-blur-md flex items-center justify-center border border-white/20 dark:border-white/10">
                <svg
                  className="w-20 h-20 text-white/90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20"
      >
        <span className="text-white/60 text-sm mb-2">Discover More</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;