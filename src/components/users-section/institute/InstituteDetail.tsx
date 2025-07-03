"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

interface InstituteDetailProps {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  mainImage: string;
  facts: { label: string; value: string }[];
  videos: { id: number; title: string; url: string; thumbnail: string }[];
  galleryImages: { id: number; title: string; src: string }[];
}

const InstituteDetail = ({
  // id,
  name,
  description,
  longDescription,
  mainImage,
  facts,
  videos,
  galleryImages,
}: InstituteDetailProps) => {
  const [activeTab] = useState("about");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* About Tab Content */}
      {activeTab === "about" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <div className="relative h-64 w-full rounded-xl overflow-hidden mb-6">
            <Image src={mainImage} alt={name} className="object-cover" fill />
          </div>

          <h3 className="text-2xl font-bold text-indigo-900 dark:text-gray-100 mb-4">{name}</h3>

          <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>

          {longDescription && <p className="text-gray-600 dark:text-gray-400 mb-6">{longDescription}</p>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {facts.map((fact, index) => (
              <div key={index} className="bg-indigo-50 dark:bg-gray-700 p-4 rounded-xl text-center">
                <h4 className="text-2xl font-bold text-indigo-800 dark:text-gray-200">{fact.value}</h4>
                <p className="text-indigo-600 dark:text-gray-400">{fact.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Videos Tab Content */}
      {activeTab === "videos" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          variants={containerVariants}
          className="space-y-6"
        >
          {videos.length > 0 ? (
            videos.map((video) => (
              <motion.div
                key={video.id}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="relative aspect-video">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    className="object-cover"
                    fill
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-indigo-900 dark:text-gray-100">{video.title}</h3>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
              <svg
                className="w-12 h-12 text-indigo-200 dark:text-indigo-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h18M3 16h18"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No Videos Available</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We&apos;re currently working on adding videos for this institute.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Gallery Tab Content */}
      {activeTab === "gallery" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          variants={containerVariants}
        >
          {galleryImages.length > 0 ? (
            galleryImages.map((image) => (
              <motion.div
                key={image.id}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={image.src}
                    alt={image.title}
                    className="object-cover"
                    fill
                  />
                </div>
                <div className="p-3">
                  <p className="font-medium text-indigo-800 dark:text-gray-200">{image.title}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
              <svg
                className="w-12 h-12 text-indigo-200 dark:text-indigo-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No Gallery Images</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We&apos;re currently working on adding gallery images for this institute.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default InstituteDetail;