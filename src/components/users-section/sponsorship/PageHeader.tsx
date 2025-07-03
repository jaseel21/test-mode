"use client";

import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description: string;
}

export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <section className="pt-32 pb-12 px-6 bg-gradient-to-r from-indigo-900 to-purple-900 dark:from-gray-800 dark:to-gray-900 text-white">
      <div className="container mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center text-indigo-200 dark:text-gray-300 hover:text-white dark:hover:text-white mb-6 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">{title}</h1>
        <p className="text-xl text-indigo-200 dark:text-gray-300 max-w-3xl">{description}</p>
      </div>
    </section>
  );
};