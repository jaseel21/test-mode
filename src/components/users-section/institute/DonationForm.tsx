"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";

interface DonationFormProps {
  instituteId: string;
  instituteName: string;
  onDonationComplete?: () => void;
}

interface LocationOption {
  value: string;
  label: string;
  type: "district" | "panchayat" | "municipality" | "corporation";
  district: string;
}

// Define structure of kerala_local.json data
interface DistrictData {
  name: string;
  block_panchayats: {
    grama_panchayats: { name: string }[];
  }[];
  urban_local_bodies: { name: string; type: string }[];
}

interface RazorpayError {
  description: string;
}
// Razorpay types
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme: { color: string };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      on(event: string, callback: (response: { error: RazorpayError }) => void): void;
      open: () => void;
    };
  }
}

const DonationForm = ({ instituteId, instituteName, onDonationComplete }: DonationFormProps) => {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
    email: "",
    amount: 0,
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Location state
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<LocationOption[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const router = useRouter();
  const {startLoading,stopLoading}=useLoading();

  

  // Fetch and process location data
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/kerala_local.json");
        const data: { districts: DistrictData[] } = await response.json();

        const options: LocationOption[] = [];

        data.districts.forEach((district: DistrictData) => {
          // Add district
          options.push({
            value: district.name,
            label: district.name,
            type: "district",
            district: district.name,
          });

          // Add grama panchayats
          district.block_panchayats.forEach((block) => {
            block.grama_panchayats.forEach((panchayat) => {
              options.push({
                value: `${district.name}, ${panchayat.name}`,
                label: panchayat.name,
                type: "panchayat",
                district: district.name,
              });
            });
          });

          // Add urban local bodies
          district.urban_local_bodies.forEach((urban) => {
            options.push({
              value: `${district.name}, ${urban.name}`,
              label: urban.name,
              type: urban.type === "Municipal Corporation" ? "corporation" : "municipality",
              district: district.name,
            });
          });
        });

        setLocationOptions(options);
        setFilteredOptions(options.filter((option) => option.type === "district"));
        setIsLoadingLocations(false);
      } catch (error) {
        console.error("Error loading location data:", error);
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // Filter options when district is selected
  useEffect(() => {
    if (selectedDistrict) {
      const filtered = locationOptions.filter(
        (option) => option.district === selectedDistrict && option.type !== "district"
      );
      setFilteredOptions(filtered);
    } else {
      const districts = locationOptions.filter((option) => option.type === "district");
      setFilteredOptions(districts);
    }
  }, [selectedDistrict, locationOptions]);

  // Handle district selection
  const handleDistrictChange = (district: string | null) => {
    setSelectedDistrict(district);
    if (!district) {
      setForm({ ...form, location: "" });
    }
  };

  // Get available districts for the dropdown
  const districtOptions = locationOptions
    .filter((option) => option.type === "district")
    .map((district) => ({
      value: district.district,
      label: district.district,
    }));

  // Format options for display based on their type
  const formatOptionLabel = ({ label, type }: LocationOption) => (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      {type !== "district" && (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            type === "corporation"
              ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
              : type === "municipality"
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          }`}
        >
          {type === "panchayat" ? "Grama Panchayat" : type === "municipality" ? "Municipality" : "Corporation"}
        </span>
      )}
    </div>
  );

  // Custom styles for react-select
  const customStyles = {
    control: (base: Record<string, unknown>) => ({
      ...base,
      borderRadius: "0.5rem",
      borderColor: "#e5e7eb",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#6366f1",
      },
      backgroundColor: "white",
      // Dark mode background for control
      "@media (prefers-color-scheme: dark)": {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
      },
    }),
    option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
        ? "#e0e7ff"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      padding: "8px 12px",
      // Dark mode styles for options
      "@media (prefers-color-scheme: dark)": {
        backgroundColor: state.isSelected
          ? "#4f46e5"
          : state.isFocused
          ? "#374151"
          : "#1f2937",
        color: state.isSelected ? "white" : "#d1d5db",
      },
    }),
    menuList: (base: Record<string, unknown>) => ({
      ...base,
      maxHeight: "200px",
      backgroundColor: "white",
      // Dark mode background for menu
      "@media (prefers-color-scheme: dark)": {
        backgroundColor: "#1f2937",
      },
    }),
    singleValue: (base: Record<string, unknown>) => ({
      ...base,
      color: "#374151",
      // Dark mode text color
      "@media (prefers-color-scheme: dark)": {
        color: "#d1d5db",
      },
    }),
    placeholder: (base: Record<string, unknown>) => ({
      ...base,
      color: "#9ca3af",
      // Dark mode placeholder color
      "@media (prefers-color-scheme: dark)": {
        color: "#9ca3af",
      },
    }),
    input: (base: Record<string, unknown>) => ({
      ...base,
      color: "#374151",
      // Dark mode input text color
      "@media (prefers-color-scheme: dark)": {
        color: "#d1d5db",
      },
    }),
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();
    setIsLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment gateway");
            const [district, panchayat] = form.location.split(", ").map((part) => part.trim());

      const orderResponse = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
           amount: form.amount * 100,
          type: "Institution",
          name: form.fullName,
          phone: form.phoneNumber,
          email: form.email,
          district: district,
          panchayat: panchayat,
          instituteId: instituteId || null,
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || "Order creation failed");



      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyIDHere",
        amount: Math.round(form.amount * 100),
        currency: "INR",
        name: "AIC Amal App",
        description: `Donation for ${instituteName}`,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          // const paymentData = {
          //   amount: form.amount,
          //   name: form.fullName,
          //   phone: form.phoneNumber,
          //   type: "Institution",
          //   district: district || "Other",
          //   panchayat: panchayat || "",
          //   email: form.email,
          //   instituteId: instituteId,
          //   razorpayPaymentId: response.razorpay_payment_id,
          //   razorpayOrderId: response.razorpay_order_id,
          //   razorpaySignature: response.razorpay_signature,
          // };

          // startLoading()
          // const saveResponse = await fetch("/api/donations/create", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json",
          //     'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          //    },
          //   body: JSON.stringify(paymentData),
          // });
          // const saveData = await saveResponse.json();
          // if (!saveResponse.ok) throw new Error(saveData.error || "Failed to save donation");
         
          stopLoading();
          router.push(
            `/institute/success?donationId=${"noId"}&amount=${form.amount}&name=${encodeURIComponent(
              form.fullName
            )}&phone=${form.phoneNumber}&type=${"Institution"}&district=${district || "Other"}&panchayat=${
              panchayat || ""
            }&paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}`
          );
        },
        theme: { color: "#10B981" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Donation error:", err);
      alert(`Failed to process donation: ${(err as Error).message}`);
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log({ instituteId, ...form });
      // setShowThankYou(true);

      setTimeout(() => {
        setShowThankYou(false);
        setForm({ fullName: "", phoneNumber: "", location: "", email: "", amount: 0, message: "" });
        setSelectedDistrict(null);
        if (onDonationComplete) {
          onDonationComplete();
        }
      }, 3000);
    } catch (error) {
      console.error("Error processing donation:", error);
    } finally {
      stopLoading();
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Thank You Modal */}
      {showThankYou && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 dark:bg-black/60"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Thank You for Your Support!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your donation to {instituteName} will help us continue providing quality education.
            </p>
            <button
              onClick={() => setShowThankYou(false)}
              className="bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 px-6 py-2 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold text-indigo-900 dark:text-gray-100 mb-2">Support {instituteName}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          Your donation helps us provide better education and facilities for our students.
        </p>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <input
              type="number"
              placeholder="Donation Amount"
              className="w-full p-3 pl-8 border border-indigo-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={form.amount || ""}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              required
              min="1"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 dark:text-indigo-300">₹</span>
          </div>

          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border border-indigo-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-3 border border-indigo-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            required
            pattern="[0-9]{10}"
          />

          <input
            type="email"
            placeholder="Email (Optional)"
            className="w-full p-3 border border-indigo-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* Location selection using react-select */}
          <div className="space-y-2">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Your Location</label>
            <Select
              options={districtOptions}
              onChange={(selected) => handleDistrictChange(selected?.value || null)}
              placeholder="Select your district..."
              isClearable
              isSearchable
              styles={customStyles}
              className="w-full mb-2"
              isLoading={isLoadingLocations}
            />

            {selectedDistrict && (
              <Select
                options={filteredOptions}
                formatOptionLabel={formatOptionLabel}
                value={filteredOptions.find((option) => option.value === form.location)}
                onChange={(selected) => setForm({ ...form, location: selected?.value || "" })}
                placeholder={`Select location in ${selectedDistrict}...`}
                isLoading={isLoadingLocations}
                styles={customStyles}
                isClearable
                className="w-full"
                required
              />
            )}

            {!selectedDistrict && form.location && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-300 text-sm">
                Please select a district first to choose your specific location.
              </div>
            )}
          </div>

          <textarea
            placeholder="Your Message (Optional)"
            rows={3}
            className="w-full p-3 border border-indigo-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          ></textarea>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading || !form.amount || !form.fullName || !form.phoneNumber || !form.location}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white dark:text-gray-100 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-100"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Donate Now"
          )}
        </motion.button>

        <div className="mt-4">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Your contribution may qualify for tax benefits under applicable laws.
          </p>
        </div>
      </form>
    </>
  );
};

export default DonationForm;