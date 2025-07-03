// components/CTASection.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export const CTASection = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-10 md:mb-0">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-extrabold mb-4"
            >
              Ready to Make a Difference?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-indigo-100 max-w-xl"
            >
              Your contribution, no matter the size, helps us create lasting positive change in our communities.
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/donation" 
              className="bg-white text-indigo-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-indigo-50 transition-all duration-300 inline-block"
            >
              Donate Today
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};