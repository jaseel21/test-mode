// components/InstitutionEdit.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  MapPin, 
  Tag, 
  FileText, 
  ImagePlus, 
  PlusCircle, 
  Trash2, 
  Save, 
  AlertCircle, 
  CheckCircle
} from "lucide-react";
import Link from "next/link";

export default function InstitutionEdit() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    established: "",
    location: "",
    category: "",
    facts: [{ label: "", value: "" }],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const institutionId = params.id;

  // Memoize fetchInstitution with useCallback
  const fetchInstitution = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/institutions/${institutionId}`,{
        method: 'GET',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch institution");
      const data = await response.json();
      console.log("Fetched institution:", data);

      // Set form data with fetched values
      setFormData({
        name: data.name || "",
        description: data.description || "",
        established: data.established || "",
        location: data.location || "",
        category: data.category || "",
        facts: data.facts && data.facts.length > 0 ? data.facts : [{ label: "", value: "" }],
      });

      // Set image preview if featuredImage exists
      if (data.featuredImage) {
        setImagePreview(data.featuredImage);
        setCurrentImageUrl(data.featuredImage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [institutionId]);

  // Fetch institution data on mount
  useEffect(() => {
    setIsMounted(true);
    if (institutionId) {
      fetchInstitution();
    }
  }, [institutionId, fetchInstitution]); // Include fetchInstitution in dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Store the file for submission
      setImageFile(file);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImageFile(null);
      // If no new file is selected, revert to the current image URL or set to null
      setImagePreview(currentImageUrl);
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
      facts: [...prev.facts, { label: "", value: "" }],
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
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Create FormData object for multipart/form-data submission
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("established", formData.established);
      formDataToSubmit.append("location", formData.location);
      formDataToSubmit.append("category", formData.category);
      formDataToSubmit.append("facts", JSON.stringify(formData.facts));

      // Add the current image URL so the backend knows what image to keep/replace
      formDataToSubmit.append("currentImageUrl", currentImageUrl);

      // Only append a new image file if one was selected
      if (imageFile) {
        formDataToSubmit.append("featuredImage", imageFile);
      }

      const response = await fetch(`/api/institutions/${institutionId}`, {
        method: "PUT",
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
        body: formDataToSubmit,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update institution");
      }

      setSuccess("Institution updated successfully!");
      setTimeout(() => router.push("/admin/institutions/list"), 2000); // Redirect after 2s
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/admin/institutions/list"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Institutions
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Edit Institution
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Update information about this educational institution
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl mb-6 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Institution Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full py-2 px-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="pl-10 w-full py-2 px-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                  required
                />
              </div>
            </div>

            {/* Established */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Established Year
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="established"
                  value={formData.established}
                  onChange={handleChange}
                  className="pl-10 w-full py-2 px-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="pl-10 w-full py-2 px-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="pl-10 w-full py-2 px-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                  required
                />
              </div>
            </div>

            {/* Facts */}
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Institution Facts
                </label>
                <button
                  type="button"
                  onClick={addFact}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Fact
                </button>
              </div>
              
              <div className="space-y-3 bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl">
                {formData.facts.map((fact, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Label (e.g., Students)"
                      value={fact.label}
                      onChange={(e) => handleFactChange(index, 'label', e.target.value)}
                      className="flex-1 py-2 px-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g., 500)"
                      value={fact.value}
                      onChange={(e) => handleFactChange(index, 'value', e.target.value)}
                      className="flex-1 py-2 px-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                      required
                    />
                    {formData.facts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFact(index)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                        title="Remove fact"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Image */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Featured Image
              </label>
              <div className="bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-white/10 dark:bg-gray-700/20 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImagePlus className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SVG, PNG, JPG or GIF (MAX. 2MB)
                      </p>
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                </div>
                
                {isMounted && imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <div className="relative h-48 w-full max-w-md overflow-hidden rounded-lg shadow-md">
                      <Image
                        src={imagePreview}
                        alt="Institution Preview"
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg flex items-center justify-center w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Institution
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}