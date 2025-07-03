"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import InstituteDetail from "@/components/users-section/institute/InstituteDetail";
import DonationForm from "@/components/users-section/institute/DonationForm";

interface InstituteFact {
  label: string;
  value: string;
}

interface InstituteVideo {
  id: number;
  title: string;
  url: string;
  thumbnail: string;
}

interface InstituteImage {
  id: number;
  title: string;
  src: string;
}

// Define the shape of the institute object
interface Institute {
  _id: string;
  name: string;
  description: string;
  longDescription: string;
  featuredImage: string;
  facts: InstituteFact[];
  videos: InstituteVideo[];
  galleryImages: InstituteImage[];
  location: string;
  established: string;
  category: string;
}

export default function InstituteDetailPage() {
  const params = useParams();
  const instituteId = params.id as string;
  
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch institute data
    const fetchInstitute = async () => {
      setIsLoading(true);
    
      try {
        const response = await fetch(`/api/institutions/fetch/${instituteId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
        });
      
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch institute');
        }

        const data = await response.json();
        setInstitute(data);
      } catch (error) {
        console.error("Error fetching institute details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (instituteId) {
      fetchInstitute();
    }
  }, [instituteId]);

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-r from-indigo-900 to-purple-900 dark:from-gray-900 dark:to-gray-800 text-white dark:text-gray-100">
        <div className="container mx-auto max-w-6xl">
          <Link href="/institute" className="inline-flex items-center text-indigo-200 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 mb-6 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Institutes
          </Link>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">
            {isLoading ? 'Loading...' : institute?.name}
          </h1>
          <p className="text-xl text-indigo-200 dark:text-gray-300 max-w-3xl">
            {isLoading ? '' : institute?.description}
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-200 dark:border-gray-600 border-t-indigo-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Institute Details */}
              <div className="lg:col-span-2">
                <InstituteDetail 
                  id={institute!._id}
                  name={institute!.name}
                  description={institute!.description}
                  longDescription={institute!.longDescription}
                  mainImage={institute!.featuredImage}
                  facts={institute!.facts}
                  videos={institute!.videos}
                  galleryImages={institute!.galleryImages}
                />
              </div>
              
              {/* Donation Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <DonationForm 
                  instituteId={institute!._id} 
                  instituteName={institute!.name} 
                />
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}