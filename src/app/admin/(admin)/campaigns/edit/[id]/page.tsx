"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Upload,
  Save,
  X,
  Info,
  Banknote,
  Ruler,
  Infinity,
} from "lucide-react";

interface Params {
  id: string; // Define the shape of params
}

interface FormData {
  name: string;
  type: string;
  goal: string | null;
  area: string;
  rate: string;
  description: string;
  startDate: string;
  endDate: string;
  featuredImage: File | null;
  featuredImageUrl: string | null;
  notes: string;
  status: "draft" | "active";
  currentAmount: number;
  isInfinite: boolean;
}

export default function EditCampaignPage({ params }: { params: Params }) {
  const { id } = params; // Destructure id directly, no Promise to await

  const initialFormData: FormData = {
    name: "",
    type: "",
    goal: "",
    area: "",
    rate: "",
    description: "",
    startDate: "",
    endDate: "",
    featuredImage: null,
    featuredImageUrl: null,
    notes: "",
    status: "draft",
    currentAmount: 0,
    isInfinite: false,
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"basic" | "details">("basic");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const campaignTypes = [
    { value: "", label: "Select campaign type" },
    { value: "fundraising", label: "Fundraising" },
    { value: "physical", label: "Physical" },
    { value: "fixedamount", label: "Fixed Amount" },
  ];

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) {
        setFetchError("No campaign ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/campaigns/${id}`, {
          method: "GET",
          headers: {
            "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch campaign");

        const data = await response.json();

        const imageUrl = data.featuredImageUrl || null;

        let legacyImageUrl: string | null = null;
        if (!imageUrl && data.featuredImage && data.featuredImageType) {
          try {
            const blob = new Blob([new Uint8Array(data.featuredImage.data)], { type: data.featuredImageType });
            legacyImageUrl = URL.createObjectURL(blob);
          } catch (error) {
            console.warn("Could not process legacy image data:", error);
          }
        }

        setFormData({
          name: data.name || "",
          type: data.type || "",
          goal: data.isInfinite ? null : data.goal?.toString() || "",
          area: data.area || "",
          rate: data.rate?.toString() || "",
          description: data.description || "",
          startDate: data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : "",
          featuredImage: null,
          featuredImageUrl: imageUrl,
          notes: data.notes || "",
          status: data.status || "draft",
          currentAmount: data.currentAmount || 0,
          isInfinite: data.isInfinite || false,
        });

        setPreviewImage(imageUrl || legacyImageUrl);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching campaign:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();

    return () => {
      if (previewImage && !previewImage.includes("supabase.co")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [id, previewImage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      ...(name === "isInfinite" && checked ? { goal: null } : {}),
    }));
    clearError("goal");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setFormData((prev) => ({
        ...prev,
        featuredImage: file,
        featuredImageUrl: null,
      }));
      clearError("featuredImage");
    }
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof FormData];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Campaign name is required";
    if (!formData.type) newErrors.type = "Campaign type is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) newErrors.endDate = "End date must be after start date";
    }

    if (!formData.isInfinite) {
      if (!formData.goal?.trim()) newErrors.goal = "Goal is required unless infinite is enabled";
      else if (!/^\d+$/.test(formData.goal.replace(/[₹,]/g, ""))) {
        newErrors.goal = "Goal must be a valid number";
      }
    }

    if (formData.type === "fixedamount") {
      if (!formData.area.trim()) newErrors.area = "Fixed area is required";
      if (!formData.rate.trim()) newErrors.rate = "Rate is required";
      else if (!/^\d+$/.test(formData.rate.replace(/[₹,]/g, ""))) {
        newErrors.rate = "Rate must be a valid number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "featuredImage" && value) {
          formDataToSend.append(key, value);
        } else if (key === "featuredImageUrl" && value) {
          formDataToSend.append("currentImageUrl", value);
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
        },
        body: formDataToSend,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.details || result.error || "Failed to update campaign");

      alert("Campaign updated successfully!");
      window.location.href = "/admin/campaigns/ongoing";
    } catch (error) {
      console.error("Error updating campaign:", error);
      alert(`Failed to update campaign: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (fetchError) return <div className="p-6 text-center text-red-500">{fetchError}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">Edit Campaign</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update your campaign details, goals, and timeline
          </p>
        </div>
        <Link
          href="/admin/campaigns/ongoing"
          className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Campaigns
        </Link>
      </header>

      <section className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        <nav className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-4 border-b border-white/10">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button
              onClick={() => setActiveSection("basic")}
              className={`flex-1 text-center relative ${
                activeSection === "basic"
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  activeSection === "basic"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500 dark:ring-emerald-400"
                    : "bg-white/20 dark:bg-gray-800/50"
                }`}
              >
                1
              </div>
              <span className="text-xs hidden sm:inline">Basic Info</span>
              {activeSection === "basic" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400" />
              )}
            </button>
            <div className="w-12 h-px bg-gray-300 dark:bg-gray-700" />
            <button
              onClick={() => setActiveSection("details")}
              className={`flex-1 text-center relative ${
                activeSection === "details"
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  activeSection === "details"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500 dark:ring-emerald-400"
                    : "bg-white/20 dark:bg-gray-800/50"
                }`}
              >
                2
              </div>
              <span className="text-xs hidden sm:inline">Campaign Details</span>
              {activeSection === "details" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400" />
              )}
            </button>
          </div>
        </nav>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {activeSection === "basic" && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300 flex items-start">
                <Info className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p>Update the basic information about your campaign.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campaign Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                      errors.name ? "border-red-300 dark:border-red-500" : "border-white/20"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campaign Type*
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                      errors.type ? "border-red-300 dark:border-red-500" : "border-white/20"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  >
                    {campaignTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>}
                </div>

                <div className="col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      name="isInfinite"
                      checked={formData.isInfinite}
                      onChange={handleCheckboxChange}
                      className="mr-2 h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    Infinite Goal <Infinity className="h-4 w-4 ml-1 text-gray-400" />
                  </label>
                </div>

                {!formData.isInfinite && (
                  <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {formData.type === "physical" ? "Goal (e.g., units)*" : "Goal (₹)*"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {formData.type === "physical" ? (
                          <Ruler className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Banknote className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="text"
                        id="goal"
                        name="goal"
                        value={formData.goal || ""}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                          errors.goal ? "border-red-300 dark:border-red-500" : "border-white/20"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                    {errors.goal && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.goal}</p>}
                  </div>
                )}

                {formData.type === "fixedamount" && (
                  <>
                    <div>
                      <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fixed Area (e.g., 3 square feet)*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Ruler className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="area"
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                            errors.area ? "border-red-300 dark:border-red-500" : "border-white/20"
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        />
                      </div>
                      {errors.area && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.area}</p>}
                    </div>
                    <div>
                      <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rate (₹ per unit)*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Banknote className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="rate"
                          name="rate"
                          value={formData.rate}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                            errors.rate ? "border-red-300 dark:border-red-500" : "border-white/20"
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        />
                      </div>
                      {errors.rate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rate}</p>}
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                        errors.startDate ? "border-red-300 dark:border-red-500" : "border-white/20"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                        errors.endDate ? "border-red-300 dark:border-red-500" : "border-white/20"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  {errors.endDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>}
                </div>

                <div className="col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Campaign Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border ${
                      errors.description ? "border-red-300 dark:border-red-500" : "border-white/20"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection("details")}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg"
                >
                  Next: Campaign Details
                </button>
              </div>
            </div>
          )}

          {activeSection === "details" && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 text-sm text-purple-800 dark:text-purple-300 flex items-start">
                <Info className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p>Update visual content and additional details for your campaign.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Image
                </label>
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-2xl">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center">
                      {previewImage ? (
                        <div className="relative w-full">
                          <Image
                            src={previewImage}
                            alt="Campaign preview"
                            width={480}
                            height={160}
                            className="mx-auto max-h-40 object-contain rounded-lg"
                            unoptimized={!previewImage.includes("supabase.co")}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (previewImage && !previewImage.includes("supabase.co")) {
                                URL.revokeObjectURL(previewImage);
                              }
                              setPreviewImage(null);
                              setFormData((prev) => ({
                                ...prev,
                                featuredImage: null,
                                featuredImageUrl: null,
                              }));
                            }}
                            className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
                            Drag and drop an image, or{" "}
                            <span className="text-emerald-600 dark:text-emerald-400">browse</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                            Recommended size: 1200x630px, JPG or PNG
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        id="featuredImage"
                        name="featuredImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${
                          previewImage ? "pointer-events-none" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Notes <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveSection("basic")}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium shadow-lg flex items-center ${
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-emerald-600 hover:to-green-600"
                  } transition-all duration-300`}
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}