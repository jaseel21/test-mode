import React, { useState, useEffect, useMemo } from 'react';

interface LocationData {
  districts: District[];
}

interface District {
  name: string;
  code: string;
  block_panchayats: BlockPanchayat[];
  urban_local_bodies?: UrbanLocalBody[];
}

interface BlockPanchayat {
  name: string;
  grama_panchayats: GramaPanchayat[];
}

interface GramaPanchayat {
  name: string;
}

interface UrbanLocalBody {
  type: string;
  name: string;
}

export type LocationType = 'district' | 'municipality' | 'corporation' | 'panchayat';

interface LocationSelectorProps {
  keralaData: LocationData;
  initialDistrict?: string;
  initialLocation?: string;
  onChange: (data: {
    district: string;
    locationType: LocationType;
    location: string;
  }) => void;
  errors?: {
    district?: string;
    location?: string;
  };
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  keralaData,
  initialDistrict = '',
  initialLocation = '',
  onChange,
  errors = {},
}) => {
  const [districtInput, setDistrictInput] = useState(initialDistrict);
  const [locationInput, setLocationInput] = useState(initialLocation);
  const [showDistrictSuggestions, setShowDistrictSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);

  // Get all districts
  const districts = useMemo(() => 
    keralaData.districts.map(district => district.name).sort(),
  [keralaData]);

  // Filter districts based on input
  const filteredDistricts = useMemo(() => 
    districts.filter(district => 
      district.toLowerCase().includes(districtInput.toLowerCase())
    ),
  [districts, districtInput]);

  // Get all possible locations for a district (panchayats, municipalities, corporations)
  const allDistrictLocations = useMemo(() => {
    if (!selectedDistrict) return [];
    
    const districtData = keralaData.districts.find(
      district => district.name === selectedDistrict
    );
    
    if (!districtData) return [];
    
    // Get all panchayats
    const panchayats = districtData.block_panchayats
      .flatMap(block => block.grama_panchayats.map(gp => ({
        name: gp.name,
        type: 'panchayat' as LocationType
      })));
    
    // Get all urban bodies
    const urbanBodies = (districtData.urban_local_bodies || [])
      .map(body => ({
        name: body.name,
        type: body.type === 'Municipal Corporation' ? 'corporation' as LocationType : 'municipality' as LocationType
      }));
    
    // Combine all locations
    return [...panchayats, ...urbanBodies].sort((a, b) => a.name.localeCompare(b.name));
  }, [keralaData, selectedDistrict]);

  // Filter locations based on input
  const filteredLocations = useMemo(() => 
    allDistrictLocations.filter(location => 
      location.name.toLowerCase().includes(locationInput.toLowerCase())
    ),
  [allDistrictLocations, locationInput]);

  useEffect(() => {
    if (selectedDistrict && allDistrictLocations.length > 0) {
      // Reset location input when district changes
      setLocationInput('');
      onChange({
        district: selectedDistrict,
        locationType: 'panchayat', // Default, will be overridden when location is selected
        location: ''
      });
    }
  }, [selectedDistrict,onChange,allDistrictLocations.length]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDistrictInput(value);
    setShowDistrictSuggestions(true);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    setShowLocationSuggestions(true);
  };

  const selectDistrict = (district: string) => {
    setSelectedDistrict(district);
    setDistrictInput(district);
    setShowDistrictSuggestions(false);
  };

  const selectLocation = (location: {name: string, type: LocationType}) => {
    setLocationInput(location.name);
    setShowLocationSuggestions(false);
    onChange({
      district: selectedDistrict,
      locationType: location.type,
      location: location.name
    });
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.district-suggestions') && showDistrictSuggestions) {
        setShowDistrictSuggestions(false);
      }
      if (!target.closest('.location-suggestions') && showLocationSuggestions) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDistrictSuggestions, showLocationSuggestions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* District Selection */}
      <div className="relative district-suggestions">
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          District*
        </label>
        <input
          id="district"
          type="text"
          value={districtInput}
          onChange={handleDistrictChange}
          onFocus={() => districtInput && setShowDistrictSuggestions(true)}
          placeholder="Type to search district"
          className={`px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 ${
            errors.district
              ? "border-red-300 focus:ring-red-500"
              : "dark:border-white/20 border-gray-600/20 focus:ring-emerald-500"
          } focus:outline-none focus:ring-2 focus:border-transparent 
          placeholder:text-gray-400 dark:placeholder:text-gray-300 text-gray-800 dark:text-gray-200`}
        />
        {errors.district && (
          <p className="mt-1 text-sm text-red-500">{errors.district}</p>
        )}
        
        {showDistrictSuggestions && districtInput && filteredDistricts.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 max-h-60 overflow-y-auto">
            {filteredDistricts.map(district => (
              <li
                key={district}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200"
                onClick={() => selectDistrict(district)}
              >
                {district}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Location Selection */}
      <div className="relative location-suggestions">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location*
        </label>
        <input
          id="location"
          type="text"
          value={locationInput}
          onChange={handleLocationChange}
          onFocus={() => locationInput && setShowLocationSuggestions(true)}
          placeholder={selectedDistrict ? "Type to search location" : "Select a district first"}
          disabled={!selectedDistrict}
          className={`px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg  border ${
            errors.location
              ? "border-red-300 focus:ring-red-500"
              : "dark:border-white/20 border-gray-600/20 focus:ring-emerald-500"
          } focus:outline-none focus:ring-2 focus:border-transparent 
          placeholder:text-gray-400 dark:placeholder:text-gray-300 text-gray-800 dark:text-gray-200 ${
            !selectedDistrict ? "opacity-75 cursor-not-allowed" : ""
          }`}
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-500">{errors.location}</p>
        )}
        
        {showLocationSuggestions && locationInput && filteredLocations.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 max-h-60 overflow-y-auto">
            {filteredLocations.map(location => (
              <li
                key={location.name}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200"
                onClick={() => selectLocation(location)}
              >
                <div className="flex justify-between items-center">
                  <span>{location.name}</span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 rounded px-2 py-1">
                    {location.type === 'panchayat' ? 'Panchayat' : 
                     location.type === 'municipality' ? 'Municipality' : 
                     'Corporation'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;