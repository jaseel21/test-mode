// components/InstitutionList.js
'use client';

import { useState, useEffect, Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  PlusCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  Building2, 
  MapPin, 
  Calendar, 
  ChevronDown,
  AlertCircle
} from 'lucide-react';

export default function InstitutionList() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/institutions/fetch',{
        method: 'GET',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch institutions');
      const data = await response.json();
      console.log('Fetched institutions:', data);
      setInstitutions(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const openDeleteModal = (institution, e) => {
    e.stopPropagation(); // Prevent any parent onClick events
    setInstitutionToDelete(institution);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!institutionToDelete) return;
    
    setIsDeleting(true);
    try {
      const institutionId = institutionToDelete._doc?._id || institutionToDelete._id;
      const response = await fetch(`/api/institutions/${institutionId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete institution');
      
      // Update the local state to remove the deleted institution
      setInstitutions(institutions.filter((inst) => {
        const id = inst._doc?._id || inst._id;
        return id !== institutionId;
      }));
      
      // Close the modal and reset the state
      setDeleteModalOpen(false);
      setInstitutionToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(institutions.map(inst => inst.category).filter(Boolean))];

  // Filter and sort institutions based on searchTerm, filter and sortBy
  const filteredInstitutions = institutions
    .filter(institution => {
      const matchesSearch = institution.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            institution.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
                            (filter === institution.category?.toLowerCase());
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name || '');
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        case 'established':
          return (a.established || 0) - (b.established || 0);
        case 'facts':
          return (b.facts?.length || 0) - (a.facts?.length || 0);
        default:
          return a.name?.localeCompare(b.name || '');
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            Institutions
            <span className="text-sm font-normal bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 py-0.5 px-2 rounded-full">
              {filteredInstitutions.length} Total
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage educational institutions and their details
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/institutions/add" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center shadow-lg">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Institution
          </Link>
          <button 
            onClick={fetchInstitutions} 
            className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category.toLowerCase()}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="name">Institution Name</option>
                <option value="location">Location</option>
                <option value="established">Year Established</option>
                <option value="facts">Number of Facts</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <button
              className="md:hidden px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="h-4 w-4 mr-2" /> Filters
            </button>
          </div>
        </div>
        
        {showMobileFilters && (
          <div className="mt-4 md:hidden space-y-3 border-t border-white/10 pt-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category.toLowerCase()}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="name">Institution Name</option>
                <option value="location">Location</option>
                <option value="established">Year Established</option>
                <option value="facts">Number of Facts</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
          <p className="flex items-center">
            <span className="flex-shrink-0 h-5 w-5 text-red-500 mr-2">!</span>
            {error}
          </p>
        </div>
      )}

      {/* Institutions Grid */}
      {filteredInstitutions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.map((institution) => {
            const institutionId = institution._doc?._id || institution._id;
            return (
              <div
                key={institutionId}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:translate-y-[-5px] transition-all duration-300 flex flex-col"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 relative">
                  {institution.featuredImage ? (
                    <Image
                      src={institution.featuredImage}
                      alt={institution.name || 'Unnamed Institution'}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image for ${institution.name}`);
                        e.target.src = '/api/placeholder/800/400';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-indigo-600/30 flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {institution.category && (
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full text-xs font-medium text-blue-800 dark:text-blue-400 shadow-lg">
                        {institution.category}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-lg font-bold text-white line-clamp-2">
                      {institution.name || 'Unnamed Institution'}
                    </h2>
                  </div>
                </div>
                
                <div className="p-4 flex-grow">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Institution ID: {institutionId}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {institution.description || 'No description'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {institution.location && (
                      <div className="bg-white/20 dark:bg-gray-800/20 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <MapPin className="h-3 w-3 mr-1" /> Location
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-white truncate">
                          {institution.location}
                        </p>
                      </div>
                    )}
                    
                    {institution.established && (
                      <div className="bg-white/20 dark:bg-gray-800/20 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <Calendar className="h-3 w-3 mr-1" /> Established
                        </div>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          {institution.established}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 pt-0 flex justify-between items-center">
                  <Link
                    href={`/admin/institutions/${institutionId}/donations`}
                    className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Donations
                  </Link>
                  
                  <div className="flex space-x-2">
                    <Link 
                      href={`/admin/institutions/edit/${institutionId}`} 
                      className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
                      title="Edit Institution"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={(e) => openDeleteModal(institution, e)}
                      className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                      title="Delete Institution"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No institutions found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            {searchTerm || filter !== 'all' 
              ? "No institutions match your search criteria. Try adjusting your filters." 
              : "You haven't added any institutions yet. Get started by creating a new one."}
          </p>
          <Link href="/admin/institutions/add" className="mt-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Institution
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Transition appear show={deleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-white/20">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-center text-gray-900 dark:text-white"
                  >
                    Delete Institution
                  </Dialog.Title>
                  
                  <div className="mt-2">
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {institutionToDelete?.name || 'this institution'}
                      </span>? 
                      This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                      onClick={() => setDeleteModalOpen (false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`inline-flex justify-center rounded-lg border border-transparent ${
                          isDeleting 
                            ? 'bg-red-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                        } px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 shadow-lg`}
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    );
  }