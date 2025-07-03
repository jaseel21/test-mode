"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Box,
  AlertCircle,
  MessageCircle,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function EditBoxPage() {
  const { id } = useParams();
  const router = useRouter();
  const [box, setBox] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch box data on mount
  useEffect(() => {
    const fetchBox = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/boxes/admin/${id}`,
          {
            method: 'GET',
            headers: {
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch box");
        }
        const data = await response.json();
        setBox(data);
        setFormData({
          serialNumber: data.serialNumber || "",
          name: data.name || "",
          houseName: data.houseName || "",
          address: data.address || "",
          place: data.place || "",
          area: data.area || "",
          location: data.location || "",
          district: data.district || "",
          panchayath: data.panchayath || "",
          ward: data.ward || "",
          mahallu: data.mahallu || "",
          pincode: data.pincode || "",
          phone: data.phone || "",
          secondaryMobileNumber: data.secondaryMobileNumber || "",
          careOf: data.careOf || "",
          lastPayment: data.lastPayment ? new Date(data.lastPayment).toISOString().split("T")[0] : "",
          isActive: data.isActive || false,
          sessionUser: {
            id: data.sessionUser?.id || "",
            role: data.sessionUser?.role || "",
            name: data.sessionUser?.name || "",
            phone: data.sessionUser?.phone || "",
          },
        });
      } catch (error) {
        console.error("Error fetching box:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBox();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("sessionUser.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        sessionUser: { ...prev.sessionUser, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/boxes/admin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
         },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update box");
      }

      const updatedBox = await response.json();
      setBox(updatedBox);
      setSuccess("Box updated successfully!");
      setTimeout(() => router.push("/admin/boxes"), 2000); // Redirect after 2 seconds
    } catch (error) {
      console.error("Error updating box:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-white">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error && !box) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Box</h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6  text-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center">
            <Box className="mr-2 h-6 w-6 text-emerald-500" />
            Edit Box: {box.serialNumber}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Update boxholder and volunteer details</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/boxes"
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Boxes
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-100 rounded-2xl p-6 space-y-6 shadow-md">
        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" /> {success}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" /> {error}
          </div>
        )}

        {/* Boxholder Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Secondary Mobile</label>
            <input
              type="text"
              name="secondaryMobileNumber"
              value={formData.secondaryMobileNumber}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">House Name</label>
            <input
              type="text"
              name="houseName"
              value={formData.houseName}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Place</label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Area</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Panchayat</label>
            <input
              type="text"
              name="panchayath"
              value={formData.panchayath}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ward</label>
            <input
              type="text"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mahallu</label>
            <input
              type="text"
              name="mahallu"
              value={formData.mahallu}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Care Of</label>
            <input
              type="text"
              name="careOf"
              value={formData.careOf}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Payment</label>
            <input
              type="date"
              name="lastPayment"
              value={formData.lastPayment}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label className="text-sm font-medium text-gray-700">Active</label>
          </div>
        </div>

        {/* Volunteer Details */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Volunteer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Volunteer ID</label>
              <input
                type="text"
                name="sessionUser.id"
                value={formData.sessionUser.id}
                onChange={handleChange}
                className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                name="sessionUser.role"
                value={formData.sessionUser.role}
                onChange={handleChange}
                className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="sessionUser.name"
                value={formData.sessionUser.name}
                onChange={handleChange}
                className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                name="sessionUser.phone"
                value={formData.sessionUser.phone}
                onChange={handleChange}
                className="mt-1 w-full p-2 bg-white rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-600 transition-colors disabled:bg-emerald-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> Save Changes
              </>
            )}
          </button>
          {formData.phone && (
            <a
              href={`https://wa.me/${formData.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" /> Contact via WhatsApp
            </a>
          )}
        </div>
      </form>
    </div>
  );
}