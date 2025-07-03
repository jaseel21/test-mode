import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Database} from 'lucide-react';

interface ExportDropdownProps {
  onExport: (type: 'csv' | 'pdf') => void;
  disabled?: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onExport, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Download className="h-4 w-4 mr-2 hidden sm:inline" />
        <span className="hidden sm:inline">Export</span>
        <span className="sm:hidden">Exp</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 z-10 animate-fadeIn">
          <div className="py-1">
            <button
              onClick={() => {
                onExport('csv');
                setIsOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <Database className="h-4 w-4 mr-2 text-blue-600" />
              Export as CSV
            </button>
            <button
              onClick={() => {
                onExport('pdf');
                setIsOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <FileText className="h-4 w-4 mr-2 text-red-600" />
              Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;