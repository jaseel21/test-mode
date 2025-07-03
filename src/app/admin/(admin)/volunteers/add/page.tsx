"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";

export default function NewVolunteerForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    place: "",
    status: "pending", // Default status
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.place.trim()) {
      newErrors.place = "Place is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
  
    setSubmitting(true);
    try {
      const response = await fetch("/api/volunteers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        toast.success("Volunteer registered successfully");
        router.push("/admin/volunteers/list");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register volunteer");
      }
    } catch (error) {
      console.error("Error registering volunteer:", error);
      // Narrow the error type to ensure .message is safe to access
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage); // Displays "This number is already registered as a volunteer" if duplicate
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin/volunteers/list"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Volunteers List
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <UserCheck className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Register New Volunteer</h2>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Add a new volunteer to the system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border focus:ring-2 focus:ring-offset-0 focus:outline-none transition-colors ${
                    errors.name
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50"
                      : "border-gray-300 focus:border-blue-400 focus:ring-blue-200"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border focus:ring-2 focus:ring-offset-0 focus:outline-none transition-colors ${
                    errors.phone
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50"
                      : "border-gray-300 focus:border-blue-400 focus:ring-blue-200"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border focus:ring-2 focus:ring-offset-0 focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50"
                      : "border-gray-300 focus:border-blue-400 focus:ring-blue-200"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="place" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  Location/Place
                </label>
                <input
                  id="place"
                  type="text"
                  placeholder="Enter location"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border focus:ring-2 focus:ring-offset-0 focus:outline-none transition-colors ${
                    errors.place
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50"
                      : "border-gray-300 focus:border-blue-400 focus:ring-blue-200"
                  }`}
                />
                {errors.place && (
                  <p className="mt-1 text-sm text-red-600">{errors.place}</p>
                )}
              </div>

              {/* <div>
                <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "pending" | "approved" | "rejected" })
                  }
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div> */}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/admin/volunteers/list")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Register Volunteer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}