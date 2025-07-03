"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const testimonialData = [
  {
    id: 1,
    quote: "Donating through this platform has been incredibly easy and rewarding. I receive updates about the impact my contributions make, and it's heartwarming.",
    name: "Ahmad Safvan",
    role: "Monthly Donor",
    avatar: "PS",
    color: "from-purple-400 to-indigo-400",
  },
  {
    id: 2,
    quote: "The photo framing feature is a beautiful way to keep memories while doing good. It's a thoughtful touch that makes giving so much more personal.",
    name: "Muhammed Shabeer",
    role: "Regular Supporter",
    avatar: "AP",
    color: "from-indigo-400 to-blue-400",
  },
  {
    id: 3,
    quote: "I appreciate how transparent the platform is with donation receipts. Makes tax time much easier while supporting causes I believe in.",
    name: "Thashfeeq Jaseel",
    role: "Yearly Donor",
    avatar: "MJ",
    color: "from-blue-400 to-indigo-400",
  },
  {
    id: 4,
    quote: "Being able to see exactly where my donations are going gives me confidence. This platform has made charitable giving a regular part of my life.",
    name: "Munavar mp",
    role: "Campaign Supporter",
    avatar: "RV",
    color: "from-indigo-400 to-purple-400",
  },
];

const TestimonialCard = ({ testimonial, isActive }: { testimonial: typeof testimonialData[0]; isActive: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.9 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl ${isActive ? "ring-2 ring-indigo-400 dark:ring-indigo-500" : ""}`}
    >
      {/* Quote icon */}
      <div className="mb-6 text-indigo-400 dark:text-indigo-300">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Quote text - Fixed unescaped entities */}
      <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">{testimonial.quote}</p>

      {/* Author info */}
      <div className="flex items-center">
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-white font-bold`}
        >
          {testimonial.avatar}
        </div>

        <div className="ml-4">
          <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
          <p className="text-gray-500 dark:text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (window.innerWidth < 1024) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonialData.length);
      }, 5000);
    }

    return () => clearInterval(interval);
  }, []);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonialData.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonialData.length);
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-4">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            What Our <span className="text-indigo-600 dark:text-indigo-400">Supporters</span> Say
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Hear from the community about their experiences with our platform.
          </p>
        </motion.div>

        <div className="relative">
          {/* Desktop view: Grid layout */}
          <div className="hidden lg:grid grid-cols-2 gap-8">
            {testimonialData.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} isActive={true} />
            ))}
          </div>

          {/* Mobile/Tablet view: Carousel */}
          <div className="lg:hidden relative">
            <AnimatePresence mode="wait">
              <TestimonialCard
                key={testimonialData[activeIndex].id}
                testimonial={testimonialData[activeIndex]}
                isActive={true}
              />
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonialData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === activeIndex ? "bg-indigo-600 dark:bg-indigo-400" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrow navigation - Controlled by showControls */}
            {showControls && (
              <div className="absolute top-1/2 left-0 right-0 -mt-6 flex justify-between items-center px-4 z-10">
                <button
                  onClick={goToPrev}
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label="Previous testimonial"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={goToNext}
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label="Next testimonial"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;