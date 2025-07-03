"use client";

import { useState, useEffect } from "react";
import Select from "react-select";

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

interface LocationOption {
  value: string;
  label: string;
  type: "district" | "panchayat" | "municipality" | "corporation";
  district: string;
}

interface DistrictData {
  name: string;
  block_panchayats: {
    grama_panchayats: { name: string }[];
  }[];
  urban_local_bodies: { name: string; type: string }[];
}

const LocationSelector = ({ selectedLocation, onLocationChange }: LocationSelectorProps) => {
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<LocationOption[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch and process location data
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
              type: urban.type === "Municipal Corporation" ? "corporation" : "municipality",
              district: district.name,
            });
          });
        });

        setLocationOptions(options);
        setFilteredOptions(options.filter((option) => option.type === "district"));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading location data:", error);
        setIsLoading(false);
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
      onLocationChange("");
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
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
              : type === "municipality"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          {type === "panchayat" ? "Grama Panchayat" : type === "municipality" ? "Municipality" : "Corporation"}
        </span>
      )}
    </div>
  );

  // Custom styles for react-select with theme support
  const customStyles = {
    control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
      ...base,
      borderRadius: "0.5rem",
      borderColor: state.isFocused ? "#6366f1" : "#e5e7eb",
      backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
      color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#374151",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(99, 102, 241, 0.2)" : "none",
      padding: "0.25rem",
      "&:hover": {
        borderColor: "#6366f1",
      },
    }),
    input: (base: Record<string, unknown>) => ({
      ...base,
      color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#374151",
    }),
    singleValue: (base: Record<string, unknown>) => ({
      ...base,
      color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#374151",
    }),
    option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
        ? document.documentElement.classList.contains("dark")
          ? "#374151"
          : "#e0e7ff"
        : document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#ffffff",
      color: state.isSelected
        ? "#ffffff"
        : document.documentElement.classList.contains("dark")
        ? "#e5e7eb"
        : "#374151",
      padding: "8px 12px",
    }),
    menu: (base: Record<string, unknown>) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
    }),
    menuList: (base: Record<string, unknown>) => ({
      ...base,
      maxHeight: "200px",
      backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
    }),
    placeholder: (base: Record<string, unknown>) => ({
      ...base,
      color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
    }),
  };

  return (
    <div className="space-y-2">
      <label className="block text-indigo-800 dark:text-indigo-200 font-medium mb-2">Your Location</label>
      <Select
        options={districtOptions}
        onChange={(selected) => handleDistrictChange(selected?.value || null)}
        placeholder="Select your district..."
        isClearable
        isSearchable
        styles={customStyles}
        className="w-full mb-2"
        isLoading={isLoading}
      />

      {selectedDistrict && (
        <Select
          options={filteredOptions}
          formatOptionLabel={formatOptionLabel}
          value={filteredOptions.find((option) => option.value === selectedLocation)}
          onChange={(selected) => onLocationChange(selected?.value || "")}
          placeholder={`Select location in ${selectedDistrict}...`}
          isLoading={isLoading}
          styles={customStyles}
          isClearable
          className="w-full"
        />
      )}

      {!selectedDistrict && selectedLocation && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-200 text-sm">
          Please select a district first to choose your specific location.
        </div>
      )}
    </div>
  );
};

export default LocationSelector;