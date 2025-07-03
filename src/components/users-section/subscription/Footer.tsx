// src/components/subscription/Footer.tsx
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 px-6 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">© {currentYear} All rights reserved</p>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};