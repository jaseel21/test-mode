"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Loader2
} from "lucide-react";

interface Volunteer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  place: string;
}

export default function EditVolunteerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        const response = await fetch(`/api/volunteers/${id}`,{
          headers: {
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVolunteer(data);
      } catch (error) {
        console.error("Error fetching volunteer:", error);
        toast.error("Failed to load volunteer");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVolunteer();
  }, [id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!volunteer?.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!volunteer?.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(volunteer.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    
    if (!volunteer?.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(volunteer.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    
    if (!volunteer?.place.trim()) {
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
      const response = await fetch(`/api/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json",
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
         },
        body: JSON.stringify(volunteer),
      });

      if (response.ok) {
        toast.success("Volunteer updated successfully");
        router.push("/admin/volunteers/list");
      } else {
        throw new Error("Failed to update volunteer");
      }
    } catch (error) {
      console.error("Error updating volunteer:", error);
      toast.error("Failed to update volunteer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !volunteer) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Loading volunteer data...</h3>
          <p className="mt-1 text-sm text-gray-500">Please wait while we fetch the volunteer&lsquo;s information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
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
              <h2 className="text-xl font-bold text-gray-900">Edit Volunteer</h2>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Update volunteer information and details
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
                  value={volunteer.name}
                  onChange={(e) => setVolunteer({ ...volunteer, name: e.target.value })}
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
                  value={volunteer.phone}
                  onChange={(e) => setVolunteer({ ...volunteer, phone: e.target.value })}
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
                  value={volunteer.email}
                  onChange={(e) => setVolunteer({ ...volunteer, email: e.target.value })}
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
                  value={volunteer.place}
                  onChange={(e) => setVolunteer({ ...volunteer, place: e.target.value })}
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
              
              <div>
                <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                  Status
                </label>
                <select
                  id="status"
                  value={volunteer.status}
                  onChange={(e) => setVolunteer({ ...volunteer, status: e.target.value as "pending" | "approved" | "rejected" })}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push('/admin/volunteers/list')}
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
                    Save Changes
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