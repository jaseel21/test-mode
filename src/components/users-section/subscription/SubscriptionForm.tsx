// src/app/sponsorship/components/SubscriptionForm.tsx
import { DonationType } from "@/components/users-section/types";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Select from "react-select";

interface FormState {
  fullName: string;
  location: string;
  email:string;
  amount: number;
  period: string;
}

interface SubscriptionFormProps {
  subscriptionType: "auto" | "manual";
  setSubscriptionType: (type: "auto" | "manual" | null) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  handleSubscriptionSubmit: (e: React.FormEvent, formData: FormState) => Promise<void>;
  handleSubscriptionAutoSubmit: (e: React.FormEvent, formData: FormState) => Promise<void>; // Updated to include formData
  isLoading: boolean;
  donationTypes: DonationType[];
}

interface LocationOption {
  value: string;
  label: string;
  type: "district" | "panchayat" | "municipality";
  district: string;
}

interface DistrictData {
  name: string;
  block_panchayats: {
    grama_panchayats: { name: string }[];
  }[];
  urban_local_bodies: { name: string }[];
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscriptionType,
  setSubscriptionType,
  phoneNumber,
  setPhoneNumber,
  handleSubscriptionSubmit,
  handleSubscriptionAutoSubmit,
  isLoading,
}) => {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email:"",
    location: "",
    amount: 0,
    period: "",
  });
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<LocationOption[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const amounts = [100, 500, 1000, 2500];
  const periods = ["Daily", "Weekly", "Monthly", "Yearly"];
  const filteredPeriods = subscriptionType === "auto" 
    ? periods.filter(period => period.toLowerCase() !== "daily") 
    : periods;

  // Fetch and process location data (unchanged)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/kerala_local.json");
        const data: { districts: DistrictData[] } = await response.json();

        const options: LocationOption[] = [];
        data.districts.forEach((district: DistrictData) => {
          options.push({
            value: district.name,
            label: district.name,
            type: "district",
            district: district.name,
          });
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
          district.urban_local_bodies.forEach((urban) => {
            options.push({
              value: `${district.name}, ${urban.name}`,
              label: urban.name,
              type: "municipality",
              district: district.name,
            });
          });
        });

        setLocationOptions(options);
        setFilteredOptions(options);
        setIsLoadingLocations(false);
      } catch (error) {
        console.error("Error loading location data:", error);
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // Filter options when district is selected (unchanged)
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

  const handleDistrictChange = (district: string | null) => {
    setSelectedDistrict(district);
    if (!district) {
      setForm({ ...form, location: "" });
    }
  };

  const districtOptions = locationOptions
    .filter((option) => option.type === "district")
    .map((district) => ({
      value: district.district,
      label: district.district,
    }));

  const formatOptionLabel = ({ label, type }: LocationOption) => (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      {type !== "district" && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {type === "panchayat" ? "Grama Panchayat" : type === "municipality" ? "Municipality" : ""}
        </span>
      )}
    </div>
  );

  const customStyles = {
    control: (base: Record<string, unknown>) => ({
      ...base,
      padding: "0.75rem",
      borderRadius: "0.5rem",
      borderColor: "#d1d5db",
      "&:hover": { borderColor: "#6366f1" },
    }),
    option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#e0e7ff" : "white",
      color: state.isSelected ? "white" : "#374151",
      padding: "10px 12px",
    }),
    group: (base: Record<string, unknown>) => ({ ...base, paddingTop: 8, paddingBottom: 8 }),
    menuList: (base: Record<string, unknown>) => ({ ...base, maxHeight: "300px" }),
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(subscriptionType==="auto"){
      handleSubscriptionAutoSubmit(e,form);
    }else{

      handleSubscriptionSubmit(e, form); // Pass form data to parent
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <button
          onClick={() => setSubscriptionType(null)}
          className="mr-4 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          Setup {subscriptionType === "auto" ? "Automatic" : "Manual"} Recurring Donation
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="Enter your 10-digit mobile number"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  pattern="[0-9]{10}"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your full name"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Location</label>
              <div className="space-y-3">
                <Select
                  options={districtOptions}
                  onChange={(selected) => handleDistrictChange(selected?.value || null)}
                  placeholder="Select your district first..."
                  isClearable
                  isSearchable
                  styles={customStyles}
                  className="w-full"
                />
                {selectedDistrict && (
                  <Select
                    options={filteredOptions}
                    formatOptionLabel={formatOptionLabel}
                    value={filteredOptions.find((option) => option.value === form.location)}
                    onChange={(selected) => setForm({ ...form, location: selected?.value || "" })}
                    placeholder={`Search in ${selectedDistrict}...`}
                    isLoading={isLoadingLocations}
                    styles={customStyles}
                    isClearable
                    className="w-full"
                    required
                  />
                )}
                {!selectedDistrict && form.location && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700">
                    Please select a district first to choose your specific location.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Amount Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Amount</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {amounts.map((amount) => (
              <motion.button
                key={amount}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`py-3 rounded-lg font-medium transition-all ${
                  form.amount === amount
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setForm({ ...form, amount })}
              >
                ₹{amount.toLocaleString()}
              </motion.button>
            ))}
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="Enter a custom amount"
              className="w-full p-4 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              min="1"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
          </div>
        </div>

        {/* Frequency Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Frequency</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredPeriods.map((period) => (
              <motion.button
                key={period}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`py-3 rounded-lg font-medium transition-all ${
                  form.period === period.toLowerCase()
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setForm({ ...form, period: period.toLowerCase() })}
              >
                {period}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {form.amount > 0 && form.period && (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Summary</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">₹{form.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Frequency:</span>
              <span className="font-medium">{form.period.charAt(0).toUpperCase() + form.period.slice(1)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">{subscriptionType === "auto" ? "Automatic" : "Manual"}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
              <span className="text-gray-800 font-medium">Total per {form.period}:</span>
              <span className="text-lg font-bold text-indigo-700">₹{form.amount.toLocaleString()}</span>
            </div>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isLoading || !form.amount || !form.period || !form.fullName || !form.location || phoneNumber.length < 10}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 mt-6 disabled:opacity-60 disabled:cursor-not-allowed ${
            subscriptionType === "auto"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            `Confirm ${subscriptionType === "auto" ? "Automatic" : "Manual"} Subscription`
          )}
        </motion.button>

        <p className="text-center text-gray-500 text-sm">
          Your information is secure and will only be used for processing your donation.{" "}
          {subscriptionType === "auto"
            ? "You can cancel your automatic payments at any time."
            : "You'll receive reminders before each scheduled donation."}
        </p>
      </form>
    </motion.div>
  );
};