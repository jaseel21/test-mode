// src/app/admin/(admin)/donations/create/page.tsx
"use client";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import LocationSelector from '@/components/LocationSelector';
import keralaData from '../../../../../../public/kerala_local.json';

export default function CreateDonationPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [notificationStatus, setNotificationStatus] = useState({
        attempted: false,
        success: false,
        message: ""
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        amount: "",
        type: "General",
        status: "Completed",
        paymentMethod: "Offline",
        district: "",
        locationType: "",
        location: "",
        panchayat: "", // Added panchayat field
        address: "",
        notes: "",
        sendWhatsAppNotification: false
    });

    const [locationErrors, setLocationErrors] = useState<{
        district?: string;
        location?: string;
    }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        // Handle checkbox inputs differently
        const inputValue = type === 'checkbox' ? checked : value;

        // For phone field, remove any +91 prefix when displaying in the input
        // but store with the prefix internally
        if (name === 'phone') {
            let phoneValue = inputValue as string;

            // If user is typing a phone number, remove any +91 prefix they might have added
            if (phoneValue.startsWith('+91')) {
                phoneValue = phoneValue.substring(3);
            }

            // Store only the digits, ignore any formatting characters
            const digitsOnly = phoneValue.replace(/\D/g, '');

            setFormData(prev => ({ ...prev, [name]: digitsOnly }));
        } else {
            setFormData(prev => ({ ...prev, [name]: inputValue }));
        }
    };

    // Memoized handleLocationChange to match CreateSponsorshipPage
    const handleLocationChange = useCallback((locationData: {
        district: string;
        locationType: 'district' | 'municipality' | 'corporation' | 'panchayat';
        location: string;
        address?: string;
    }) => {
        setFormData(prev => {
            if (
                prev.district === locationData.district &&
                prev.locationType === locationData.locationType &&
                prev.location === locationData.location &&
                prev.panchayat === locationData.location &&
                prev.address === (locationData.address || '')
            ) {
                return prev;
            }
            return {
                ...prev,
                district: locationData.district,
                locationType: locationData.locationType,
                location: locationData.location,
                panchayat: locationData.location, // Set panchayat to location
                address: locationData.address || ''
            };
        });
        setLocationErrors({});
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Reset errors and statuses
        setLocationErrors({});
        setErrorMessage("");
        setSuccessMessage("");
        setNotificationStatus({
            attempted: false,
            success: false,
            message: ""
        });

        // Validate location
        const locationValidationErrors: { district?: string; location?: string } = {};
        if (!formData.district) {
            locationValidationErrors.district = "District is required";
        }
        if (!formData.location) {
            locationValidationErrors.location = "Location is required";
        }

        if (Object.keys(locationValidationErrors).length > 0) {
            setLocationErrors(locationValidationErrors);
            return;
        }

        // Validate phone number if sending WhatsApp notification
        if (formData.sendWhatsAppNotification && !formData.phone) {
            setErrorMessage("Phone number is required for WhatsApp notification");
return;
        }

        // Create a copy of form data with properly formatted phone number
        const submissionData = { ...formData };

        // Add +91 prefix to phone number if it doesn't already have it
        if (submissionData.phone && !submissionData.phone.startsWith('+91')) {
            submissionData.phone = `+91${submissionData.phone}`;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/donations/dashboard/donations/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create donation');
            }

            const data = await response.json();
            setSuccessMessage("Donation created successfully!");

            // Check if WhatsApp notification was requested and update status
            if (formData.sendWhatsAppNotification) {
                setNotificationStatus({
                    attempted: true,
                    success: data.notification?.success || false,
                    message: data.notification?.message || "No notification status received"
                });
            }

            // Reset form
            setFormData({
                name: "",
                email: "",
                phone: "",
                amount: "",
                type: "General",
                status: "Completed",
                paymentMethod: "Offline",
                district: "",
                locationType: "",
                location: "",
                panchayat: "", // Added panchayat field
                address: "",
                notes: "",
                sendWhatsAppNotification: false
            });

            // Redirect to the donation details page after a brief delay
            setTimeout(() => {
                router.push(`/admin/donations/detail?id=${data.donation._id}`);
            }, 2000);

        } catch (error) {
            console.error("Error creating donation:", error);
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Create Manual Donation</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add offline donations manually to the system
                    </p>
                </div>

                <Link
                    href="/admin/donations/all"
                    className="px-4 py-2 bg-white/10 text-black dark:text-white backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Donations
                </Link>
            </div>

            {errorMessage && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            {notificationStatus.attempted && (
                <div className={`${notificationStatus.success
                    ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400"
                    : "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400"
                    } px-4 py-3 rounded-lg flex items-center gap-2`}>
                    <MessageSquare size={16} />
                    {notificationStatus.message}
                </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Donor Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white pb-2 border-b border-white/10">
                                Donor Information
                            </h3>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Donor Name*
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Full name of the donor"
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email address (optional)"
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border 
                  dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 
                  focus:ring-emerald-500 focus:border-transparent 
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone Number*
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <span className="text-gray-500 dark:text-gray-400">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="Phone number"
                                        className="pl-10 px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg 
                    border dark:border-white/20 border-gray-600/20 focus:outline-none 
                    focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                    text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Location Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location*
                                </label>
                                <LocationSelector
                                    keralaData={keralaData}
                                    onChange={handleLocationChange}
                                    errors={locationErrors}
                                />
                            </div>

                            {/* WhatsApp Notification Toggle */}
                            <div className="flex items-center mt-4">
                                <input
                                    type="checkbox"
                                    id="sendWhatsAppNotification"
                                    name="sendWhatsAppNotification"
                                    checked={formData.sendWhatsAppNotification}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-emerald-500 focus:ring-emerald-400 border-gray-300 rounded"
                                />
                                <label htmlFor="sendWhatsAppNotification" className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-emerald-500" />
                                    Send WhatsApp confirmation to donor
                                </label>
                            </div>
                        </div>

                        {/* Donation Details */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white pb-2 border-b border-white/10">
                                Donation Details
                            </h3>

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Amount (₹)*
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    step="0.01"
                                    placeholder="Donation amount"
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border 
                  dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 
                  focus:ring-emerald-500 focus:border-transparent 
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Donation Type*
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                >
                                    <option className="text-black" value="General">General</option>
                                    <option className="text-black" value="Yatheem">Yatheem</option>
                                    <option className="text-black" value="Hafiz">Hafiz</option>
                                    <option className="text-black" value="Building">Building</option>
                                    <option className="text-black" value="Campaign">Campaign</option>
                                    <option className="text-black" value="Institution">Institution</option>
                                    <option className="text-black" value="Box">Box</option>
                                    <option className="text-black" value="Sponsor-Yatheem">Sponsor-Yatheem</option>
                                    <option className="text-black" value="Sponsor-Hafiz">Sponsor-Hafiz</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Method*
                                </label>
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    required
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                >
                                    <option className="text-black" value="Offline">Cash</option>
                                    <option className="text-black" value="Check">Check</option>
                                    <option className="text-black" value="Bank Transfer">Bank Transfer</option>
                                    <option className="text-black" value="UPI">UPI</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status*
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                >
                                    <option className="text-black" value="Completed">Completed</option>
                                    <option className="text-black" value="Pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Additional Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any additional information about this donation"
                            rows={3}
                            className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Link
                            href="/admin/donations/all"
                            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isSubmitting
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                                }`}
                        >
                            {isSubmitting ? "Creating..." : "Create Donation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}