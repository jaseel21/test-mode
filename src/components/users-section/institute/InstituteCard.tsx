"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

interface InstituteProps {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  facts: { label: string; value: string }[];
  established: string;
}

const InstituteCard = ({ id, name, description, imageSrc, facts, established }: InstituteProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col"
    >
      <div className="relative h-48 w-full">
        <Image 
          src={imageSrc} 
          alt={name}
          className="object-cover"
          fill
        />
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-indigo-900 dark:text-gray-100 mb-2">{name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Established: {established}</p>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3">
          {description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {facts.slice(0, 2).map((fact, index) => (
            <div key={index} className="bg-indigo-50 dark:bg-gray-700 p-2 rounded-lg text-center">
              <p className="text-lg font-bold text-indigo-800 dark:text-gray-200">{fact.value}</p>
              <p className="text-xs text-indigo-600 dark:text-gray-400">{fact.label}</p>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Link 
            href={`/institute/${id}`}
            className="flex-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 py-2 rounded-lg text-center font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          >
            View Details
          </Link>
          <Link 
            href={`/institute/${id}/donate`}
            className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 py-2 rounded-lg text-center font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Donate
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default InstituteCard;