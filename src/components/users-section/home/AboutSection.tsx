import Link from 'next/link';
import React from 'react';

const AboutSection = () => {
  return (
    <div className="text-center mb-16">
      <div className="inline-block px-4 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-4">
        About Us
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
        Our <span className="text-indigo-600 dark:text-indigo-400">Mission</span>
      </h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-4xl mx-auto text-lg mb-6 p-6">
        Akode Islamic Centre shines as a radiant hub of knowledge, culture, and hope, deeply devoted to enriching lives within our community and beyond.
        With a steadfast commitment to education, cultural preservation, and personal growth, our institution has blossomed into a holistic center that resonates with countless hearts and minds.
        We aspire to cultivate a society where the flames of knowledge and cultural heritage burn brightly, where individuals are empowered through education, and where our cherished values are lovingly preserved.
      </p>
      <Link href="/causes" className="inline-block px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-300">
        Support Our Causes
      </Link>
    </div>
  );
};

export default AboutSection;