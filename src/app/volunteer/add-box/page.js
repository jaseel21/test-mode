"use client";
import { useState } from "react";
import { useSession } from "../../../lib/Context/SessionContext";

const RegisterBox = () => {
  const session = useSession();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    serialNumber: "",
    location: "",
    name: "",
    houseName: "",
    address: "",
    place: "",
    area: "",
    district: "",
    panchayath: "",
    ward: "",
    mahallu: "",
    pincode: "",
    mobileNumber: "",
    secondaryMobileNumber: "",
    careOf: "",
    agentId:session.user.id,
      agentName:session.user.name,
      agentPhone:session.user.phone,
      agentEmail:session.user.email,
      agentRole:session.user.role,

    // registeredDate: "",
  });

  const requiredFields = [
    "serialNumber", "name", "houseName", "address", 
    "place", "area", "location", "district", "panchayath", 
    "ward", "mahallu", "pincode", "mobileNumber"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!session) {
      setMessage("❌ Please login first.");
      setLoading(false);
      return;
    }

    // Check for missing required fields
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      setMessage(`❌ Please fill out all required fields: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      // Validate date format
      // let formattedDate = new Date(formData.registeredDate);
      // if (isNaN(formattedDate.getTime())) {
      //   setMessage("❌ Invalid date. Please select a valid date.");
      //   setLoading(false);
      //   return;
      // }

      // Send data to the backend
      const response = await fetch("/api/boxes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
         },
        body: JSON.stringify({
          ...formData,
          // registeredDate: formattedDate.toISOString(),
        }),
      });

      const data = await response.json();

      if(data.existed){
        alert("Box already exists in this serialNumber")
      }
      if (!response.ok) throw new Error(data.error || "Failed to register");

      setMessage("✅ Box registered successfully!");
      setFormData({
        serialNumber: "",
        location: "",
        name: "",
        houseName: "",
        address: "",
        place: "",
        area: "",
        district: "",
        panchayath: "",
        ward: "",
        mahallu: "",
        pincode: "",
        mobileNumber: "",
        secondaryMobileNumber: "",
        careOf: "",
        // registeredDate: "",
      });
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Group form fields into logical sections
  const sections = [
    {
      title: "Box Information",
      fields: ["serialNumber"]
    },
    {
      title: "Personal Details",
      fields: ["name", "mobileNumber", "secondaryMobileNumber", "careOf"]
    },
    {
      title: "Address Information",
      fields: ["houseName", "address", "place", "area", "location", "district", "panchayath", "ward", "mahallu", "pincode"]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg my-8 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-6 px-8">
        <h2 className="text-2xl font-bold text-white">Register New Donation Box</h2>
        <p className="text-blue-100 mt-1">Please fill all the required information</p>
      </div>

      {/* Message display */}
      {message && (
        <div className={`px-8 py-4 ${message.includes("✅") ? "bg-green-50" : "bg-red-50"}`}>
          <p className={`text-sm font-medium flex items-center ${message.includes("✅") ? "text-green-800" : "text-red-800"}`}>
            <span className="mr-2">{message.includes("✅") ? "✅" : "❌"}</span>
            {message.replace(/^(✅|❌)\s/, '')}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8">
        {sections.map((section) => (
          <div key={section.title} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {section.fields.map((key) => (
                <div key={key} className="space-y-1">
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                    {requiredFields.includes(key) && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={key === "registeredDate" ? "date" : key.includes("mobile") ? "tel" : "text"}
                    id={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required={requiredFields.includes(key)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-900"
                    placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").trim().toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setFormData({
              serialNumber: "",
              location: "",
              name: "",
              houseName: "",
              address: "",
              place: "",
              area: "",
              district: "",
              panchayath: "",
              ward: "",
              mahallu: "",
              pincode: "",
              mobileNumber: "",
              secondaryMobileNumber: "",
              careOf: "",
              // registeredDate: "",
            })}
            className="px-6 py-2 mr-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium text-white shadow-md ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              "Register Box"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterBox;