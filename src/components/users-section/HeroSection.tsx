// src\components\users-section\HeroSection.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const HeroSection: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut" 
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.2,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };
  
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        delay: 0.6,
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
      transition: {
        duration: 0.3
      }
    }
  };
  
  // const statsVariants = {
  //   hidden: { opacity: 0, y: 50 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: {
  //       delay: 0.8,
  //       duration: 0.6,
  //       ease: "easeOut"
  //     }
  //   }
  // };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/img/hero.jpg" 
          alt="Hero Background" 
          fill 
          className="object-cover opacity-40" 
          priority 
          style={{ 
            transform: isScrolled ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 1.5s ease-out'
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-indigo-900/70"
          style={{ 
            opacity: isScrolled ? 0.9 : 0.7,
            transition: 'opacity 1s ease-out'
          }}
        ></div>
      </div>
      
      {/* Floating particles/shapes for visual interest */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
      
      {/* Navigation */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-indigo-900/90 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
        }`}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto max-w-6xl px-6 flex justify-between items-center">
          <Link href="/" className="text-white font-bold text-2xl">
            AIC-Amal
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="#" className="text-white hover:text-indigo-300 transition-colors">
              Home
            </Link>
            <Link href="#" className="text-white hover:text-indigo-300 transition-colors">
              About
            </Link>
            <Link href="#" className="text-white hover:text-indigo-300 transition-colors">
              Causes
            </Link>
            <Link href="#" className="text-white hover:text-indigo-300 transition-colors">
              Contact
            </Link>
          </nav>
          
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </motion.header>
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto max-w-6xl px-6 py-24 flex flex-col items-center">
        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold text-white mb-6 text-center leading-tight"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Together, We Build a 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-200"> Better Future</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-gray-200 mb-10 text-center max-w-3xl font-light"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          Support our mission to uplift lives and communities through your generous contributions. Every donation makes a meaningful impact.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-20 w-full max-w-xl"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <motion.div 
            className="flex-1"
            variants={buttonVariants}
            whileHover="hover"
          >
            <Link 
              href="/donate" 
              className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg text-center shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              Donate Now
            </Link>
          </motion.div>
          
          <motion.div 
            className="flex-1"
            variants={buttonVariants}
            whileHover="hover"
          >
            <Link 
              href="/about" 
              className="block w-full bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg text-center hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Stats Section */}
        {/* <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full"
          variants={statsVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { number: "12K+", label: "Lives Impacted" },
            { number: "₹2.5M", label: "Funds Raised" },
            { number: "142+", label: "Volunteers" },
            { number: "35+", label: "Projects Completed" }
          ].map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</h3>
              <p className="text-indigo-200">{stat.label}</p>
            </div>
          ))}
        </motion.div> */}
      </div>
      
      {/* Scroll Down Indicator */}
      {/* <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white flex flex-col items-center cursor-pointer z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
      >
        <span className="text-sm mb-2">Scroll Down</span>
        <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div> */}
    </section>
  );
};

export default HeroSection;