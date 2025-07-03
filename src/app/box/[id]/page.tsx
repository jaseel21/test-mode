"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // For Next.js App Router
import {
  User,
  Home,
  MapPin,
  Phone,
  Calendar,
  Shield,
  CreditCard,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Define Box interface for type safety
interface Box {
  id: string;
  serialNumber: string;
  name: string;
  houseName: string;
  address: string;
  place: string;
  area: string;
  location: string;
  district: string;
  panchayath: string;
  ward: string;
  mahallu: string;
  pincode: string;
  mobileNumber: string;
  secondaryMobileNumber?: string;
  careOf?: string;
  isActive: boolean;
  registeredDate: string;
  lastPayment?: string;
  sessionUser: {
    name: string;
    phone: string;
  };
}

const BoxDetailsPage: React.FC = () => {
  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams(); // Get dynamic route params
  const { id } = params;

  // Fetch box data using useEffect
  useEffect(() => {
    const fetchBoxData = async () => {
      try {
        const response = await fetch(`/api/boxes/${id}`,{
          headers: {
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
        }); // API endpoint to fetch box data
        if (!response.ok) {
          throw new Error("Box not found");
        }
        const data = await response.json();
        setBox(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBoxData();
    }
  }, [id]); // Dependency array includes id to refetch if it changes

  // Loading state component
  const LoadingState = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500 rounded-full animate-pulse"></div>
        <p className="text-indigo-700 text-lg font-semibold">Loading Box Details...</p>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Box Details</h2>
        <p className="text-gray-600 mb-4">{error || "Unable to retrieve box information"}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Render individual detail row
  const DetailRow = ({
    icon: Icon,
    label,
    value,
    highlight = false,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | React.ReactNode;
    highlight?: boolean;
  }) => (
    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-indigo-50 transition-colors">
      <div className="mr-4">
        <Icon className={`w-6 h-6 ${highlight ? "text-indigo-600" : "text-gray-500"}`} />
      </div>
      <div className="flex-1">
        <span className="block text-sm text-gray-600 mb-1">{label}</span>
        <span className={`block font-semibold ${highlight ? "text-indigo-900" : "text-gray-800"}`}>
          {value}
        </span>
      </div>
    </div>
  );

  // Main render when data is loaded
  const BoxDetailsContent = () => {
    if (!box) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-indigo-600 text-white p-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-wide">
                Box Details: {box.serialNumber}
              </h1>
              <p className="text-indigo-100 mt-2">Detailed information about the donation box</p>
            </div>
            <div className={`p-3 rounded-full ${box.isActive ? "bg-green-500" : "bg-red-500"}`}>
              {box.isActive ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <DetailRow icon={User} label="Name" value={box.name} highlight />
              <DetailRow icon={Home} label="House Name" value={box.houseName} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <DetailRow
                icon={MapPin}
                label="Address"
                value={`${box.address}, ${box.place}, ${box.area}`}
              />
              <DetailRow
                icon={MapPin}
                label="Location"
                value={`${box.location}, ${box.district}`}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <DetailRow icon={Phone} label="Mobile Number" value={box.mobileNumber} highlight />
              {box.secondaryMobileNumber && (
                <DetailRow
                  icon={Phone}
                  label="Secondary Mobile"
                  value={box.secondaryMobileNumber}
                />
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <DetailRow
                icon={Calendar}
                label="Registered Date"
                value={new Date(box.registeredDate).toLocaleDateString()}
              />
              {box.lastPayment && (
                <DetailRow
                  icon={CreditCard}
                  label="Last Payment"
                  value={new Date(box.lastPayment).toLocaleDateString()}
                  highlight
                />
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <DetailRow
                icon={Shield}
                label="Volunteer"
                value={`${box.sessionUser.name} (${box.sessionUser.phone})`}
              />
              <DetailRow
                icon={MapPin}
                label="Additional Details"
                value={`Panchayath: ${box.panchayath}, Ward: ${box.ward}, Mahallu: ${box.mahallu}, Pincode: ${box.pincode}`}
              />
            </div>

            {box.careOf && (
              <DetailRow icon={User} label="Care Of" value={box.careOf} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Conditional rendering based on loading and error states
  if (loading) return <LoadingState />;
  if (error || !box) return <ErrorState />;

  return <BoxDetailsContent />;
};

export default BoxDetailsPage;