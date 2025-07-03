import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface InstituteFact {
  label: string;
  value: string;
}

export interface Institute {
  _id: string;
  name: string;
  description: string;
  featuredImage: string;
  location: string;
  established: string;
  category: string;
  facts: InstituteFact[];
}

interface InstituteListProps {
  institutes: Institute[];
}

const InstituteList: React.FC<InstituteListProps> = ({ institutes }) => {
  // Function to get a default icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'school':
        return "🏫";
      case 'college':
        return "🎓";
      case 'university':
        return "🏛️";
      case 'library':
        return "📚";
      default:
        return "🏢";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-300 mb-3">
          Support Educational Institutions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Make a difference by contributing to these institutions working towards providing quality education.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {institutes.map((institute) => (
          <div
            key={institute._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
          >
            <div className="relative h-48 w-full">
              {institute.featuredImage ? (
                <Image
                  src={institute.featuredImage}
                  alt={institute.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center">
                  <span className="text-5xl">{getCategoryIcon(institute.category)}</span>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 text-xs py-1 px-2 rounded-full">
                {institute.category}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-xl font-bold text-indigo-900 dark:text-gray-100 mb-2 line-clamp-1">
                {institute.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {institute.description}
              </p>
              
              <div className="flex flex-wrap mb-4 gap-2">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs py-1 px-2 rounded-full flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {institute.location}
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs py-1 px-2 rounded-full flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Est. {institute.established}
                </div>
              </div>
              
              <Link
                href={`/institute/${institute._id}`}
                className="block text-center py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white dark:text-gray-100 rounded-lg transition-colors duration-300"
              >
                Donate Now
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {institutes.length === 0 && (
        <div className="text-center py-10">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-400 dark:text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-2">No Institutions Found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              There are currently no educational institutions available for donation. Please check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteList;