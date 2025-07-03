import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Sponsorship } from "@/app/admin/(admin)/sponsorships/list/page";
import LocationSelector, { LocationType } from "../../LocationSelector"; // Import the new component
import keralaLocalData from '../../../../public/kerala_local.json';

interface SponsorshipFormProps {
  mode: "add" | "edit";
  sponsorship: Sponsorship | null;
  onClose: () => void;
  onSubmit: (data: Partial<Sponsorship>) => void;
}

// Enhanced Sponsorship interface with new location fields
interface EnhancedSponsorship extends Sponsorship {
  locationType?: LocationType;
}

const SponsorshipForm: React.FC<SponsorshipFormProps> = ({
  mode,
  sponsorship,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<EnhancedSponsorship>>({
    name: "",
    phone: "",
    amount: 0,
    type: "Sponsor-Yatheem",
    program: "",
    period: "Monthly",
    district: "",
    panchayat: "",
    locationType: "panchayat",
    status: "completed",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && sponsorship) {
      setFormData({
        name: sponsorship.name,
        phone: sponsorship.phone,
        amount: sponsorship.amount,
        type: sponsorship.type,
        program: sponsorship.program,
        period: sponsorship.period,
        district: sponsorship.district,
        panchayat: sponsorship.panchayat,
        status: sponsorship.status,
      });
    }
  }, [mode, sponsorship]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) : value,
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleLocationChange = (locationData: {
    district: string;
    locationType: LocationType;
    location: string;
  }) => {
    setFormData({
      ...formData,
      district: locationData.district,
      locationType: locationData.locationType,
      // Store the location in the panchayat field for backward compatibility
      panchayat: locationData.location,
    });
    
    // Clear errors
    const updatedErrors = { ...errors };
    if (updatedErrors.district) delete updatedErrors.district;
    if (updatedErrors.panchayat) delete updatedErrors.panchayat;
    setErrors(updatedErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Valid amount is required";
    }
    
    if (!formData.district?.trim()) {
      newErrors.district = "District is required";
    }
    
    if (!formData.panchayat?.trim()) {
      newErrors.panchayat = "Location is required";
    }
    
    if (!formData.program?.trim()) {
      newErrors.program = "Program is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Remove locationType from submission as it's not part of the original data model
      const { ...submissionData } = formData;
      await onSubmit(submissionData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {mode === "add" ? "Add New Sponsorship" : "Edit Sponsorship"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name Field */}
            <div>
              <label htmlFor="donor-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Donor Name*
              </label>
              <input
                id="donor-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-gray-300 border-white/20${
                  errors.name
                    ? "border-red-300 focus:ring-red-500"
                    : "dark:border-gray-300 dark:border-white/20 focus:ring-emerald-500"
                } focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 dark:text-gray-200 dak:border-gray-600/20`}
                placeholder="Enter donor name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number*
              </label>
              <input
                id="phone-number"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-gray-300 border-white/20${
                  errors.phone
                    ? "border-red-300 focus:ring-red-500"
                    : "dark:border-gray-300 dark:border-white/20 focus:ring-emerald-500"
                } focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 dark:text-gray-200`}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Type Field */}
            <div>
              <label htmlFor="sponsorship-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sponsorship Type*
              </label>
              <select
                id="sponsorship-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="Sponsor-Yatheem">Yatheem</option>
                <option value="Sponsor-Hafiz">Hafiz</option>
              </select>
            </div>

            {/* Period Field */}
            <div>
              <label htmlFor="sponsorship-period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sponsorship Period*
              </label>
              <select
                id="sponsorship-period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="1 Month">One Month</option>
                <option value="6 Months">Six Months</option>
                <option value="One Year">One Year</option>
              </select>
            </div>

            {/* Amount Field */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (₹)*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">₹</span>
                </div>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleChange}
                  className={`pl-8 px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border ${
                    errors.amount
                      ? "border-red-300 focus:ring-red-500"
                      : "dark:border-white/20 border-gray-600/20 focus:ring-emerald-500"
                  } focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 dark:text-gray-200`}
                  placeholder="Enter amount"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Program Field */}
            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program*
              </label>
              <input
                id="program"
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
                className={`px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border ${
                  errors.program
                    ? "border-red-300 focus:ring-red-500"
                    : "dark:border-white/20 border-gray-600/20  focus:ring-emerald-500"
                } focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 dark:text-gray-200`}
                placeholder="Enter program name"
              />
              {errors.program && (
                <p className="mt-1 text-sm text-red-500">{errors.program}</p>
              )}
            </div>

            {/* Status Field */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          {/* Location Selector Component */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-5">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Location Information</h4>
            
            <LocationSelector 
              keralaData={keralaLocalData}
              initialDistrict={formData.district || ''}
              initialLocation={formData.panchayat || ''}
              onChange={handleLocationChange}
              errors={{
                district: errors.district,
                location: errors.panchayat,
              }}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === "add" ? "Adding..." : "Updating..."}
                </>
              ) : (
                <>{mode === "add" ? "Add Sponsorship" : "Update Sponsorship"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SponsorshipForm;