'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, X, Plus, Calendar, MapPin, Tag, FileText } from 'lucide-react';

export default function ProfessionalInstitutionForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    established: '',
    location: '',
    category: '',
    facts: [{ label: '', value: '' }],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleFactChange = (index, field, value) => {
    const newFacts = [...formData.facts];
    newFacts[index][field] = value;
    setFormData((prev) => ({ ...prev, facts: newFacts }));
  };

  const addFact = () => {
    setFormData((prev) => ({
      ...prev,
      facts: [...prev.facts, { label: '', value: '' }],
    }));
  };

  const removeFact = (index) => {
    setFormData((prev) => ({
      ...prev,
      facts: prev.facts.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validation
    if (!formData.name || !formData.description) {
      setError('Please fill out all required fields');
      return;
    }

    try {
      // Create a FormData object for the multipart/form-data submission
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('established', formData.established);
      formDataToSubmit.append('location', formData.location);
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('facts', JSON.stringify(formData.facts));
      
      if (imageFile) {
        formDataToSubmit.append('featuredImage', imageFile);
      }

      const response = await fetch('/api/institutions/add', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
        body: formDataToSubmit,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create institution');
      }

      setSuccess('Institution added successfully!');
      setFormData({
        name: '',
        description: '',
        established: '',
        location: '',
        category: '',
        facts: [{ label: '', value: '' }],
      });
      setImagePreview(null);
      setImageFile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Add New Institution</h1>
        <p className="text-gray-500 dark:text-gray-400">Complete the form below to add a new institution to the database</p>
      </div>

      {error && (
        <div className="bg-white/10- border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex mb-6 border-b">
        <button
          type="button"
          onClick={() => setActiveSection('basic')}
          className={`py-3 px-6 font-medium text-sm ${
            activeSection === 'basic'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-700'
          }`}
        >
          Basic Information
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('details')}
          className={`py-3 px-6 font-medium text-sm ${
            activeSection === 'details'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-700'
          }`}
        >
          Additional Details
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('media')}
          className={`py-3 px-6 font-medium text-sm ${
            activeSection === 'media'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-700'
          }`}
        >
          Media
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeSection === 'basic' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                placeholder="Enter institution name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                placeholder="Provide a detailed description of the institution"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar size={16} className="mr-1" />
                  Established Year
                </label>
                <input
                  type="text"
                  name="established"
                  value={formData.established}
                  onChange={handleChange}
                  className="w-full p-3 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                  placeholder="e.g. 1995"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin size={16} className="mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-3 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Tag size={16} className="mr-1" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
              >
                <option className='text-gray-800' value="">Select category</option>
                <option className='text-gray-800' value="Educational">Educational</option>
                <option className='text-gray-800' value="Cultural">Cultural</option>
                <option className='text-gray-800' value="Financial">Financial</option>
                <option className='text-gray-800' value="Government">Government</option>
                <option className='text-gray-800' value="Healthcare">Healthcare</option>
                <option className='text-gray-800' value="Religious">Religious</option>
                <option className='text-gray-800' value="Non-Profit">Non-Profit</option>
                <option className='text-gray-800' value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {activeSection === 'details' && (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText size={16} className="mr-1" />
                  Key Facts & Information
                </label>
                <button
                  type="button"
                  onClick={addFact}
                  className="p-2 rounded-lg flex items-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Plus size={16} className="mr-1" />
                  Add Fact
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">Add important facts about the institution (e.g., Student population, Ranking, etc.)</p>
            </div>
            
            {formData.facts.map((fact, index) => (
              <div key={index} className="flex gap-2 mb-4 items-start">
                <div className="flex-grow">
                  <input
                    type="text"
                    placeholder="Fact Label (e.g. Student Population)"
                    value={fact.label}
                    onChange={(e) => handleFactChange(index, 'label', e.target.value)}
                    className="w-full p-3 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300 mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Fact Value (e.g. 25,000)"
                    value={fact.value}
                    onChange={(e) => handleFactChange(index, 'value', e.target.value)}
                    className="w-full p-3 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                  />
                </div>
                {formData.facts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFact(index)}
                    className="mt-2 p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeSection === 'media' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Featured Image</label>
            
            {!imagePreview ? (
              <div className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span className='text-emerald-600 dark:text-emerald-400'>Upload a file</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1 text-gray-500 dark:text-gray-400">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            ) : (
              <div className="mt-1 relative">
                {isMounted && (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={600}
                      height={300}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '300px' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
                    >
                      <X size={20} className="text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200">
          {activeSection !== 'basic' ? (
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === 'media' ? 'details' : 'basic')}
              className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-gray-400/20 dark:border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center text-gray-800 dark:text-white"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}
          
          {activeSection !== 'media' ? (
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === 'basic' ? 'details' : 'media')}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg"
            >
              Submit Institution
            </button>
          )}
        </div>
      </form>
    </div>
  );
}