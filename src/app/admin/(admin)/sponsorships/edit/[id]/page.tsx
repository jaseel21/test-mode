"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import LocationSelector from '@/components/LocationSelector';
import keralaData from '../../../../../../../public/kerala_local.json';

export default function EditSponsorshipPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
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
        type: "Sponsor-Yatheem",
        period: "One Year",
        status: "Completed",
        district: "",
        locationType: "",
        location: "",
        panchayat: "",
        address: "",
        notes: "",
        paymentMethod: "",
        sendWhatsAppNotification: false
    });

    const [originalData, setOriginalData] = useState(null);
    const [locationErrors, setLocationErrors] = useState<{
        district?: string;
        location?: string;
    }>({});

    // Fetch sponsorship data
    useEffect(() => {
        if (id) {
            fetchSponsorshipDetails();
        }
    });

    const fetchSponsorshipDetails = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/sponsorships/${id}`, {
                headers: {
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sponsorship details');
            }

            const data = await response.json();
            setOriginalData(data);

            // Determine payment method based on razorpayPaymentId
            let paymentMethod = "Offline"; // Default
            const paymentId = data.razorpayPaymentId;
            
            if (paymentId === 'OFFLINE_PAYMENT') {
                paymentMethod = 'Offline';
            } else if (paymentId?.startsWith('CHECK-')) {
                paymentMethod = 'Check';
            } else if (paymentId?.startsWith('BANK-')) {
                paymentMethod = 'Bank Transfer';
            } else if (paymentId?.startsWith('UPI-')) {
                paymentMethod = 'UPI';
            } else {
                paymentMethod = 'Offline';
            }

            // Format phone without the +91 prefix for display
            let displayPhone = data.phone || "";
            if (displayPhone.startsWith('+91')) {
                displayPhone = displayPhone.substring(3);
            }

            setFormData({
                name: data.name || "",
                email: data.email || "",
                phone: displayPhone,
                amount: data.amount?.toString() || "",
                type: data.type || "Sponsor-Yatheem",
                period: data.period || "One Year",
                status: data.status || "Completed",
                district: data.district || "",
                locationType: data.locationType || "panchayat",
                location: data.location || "",
                panchayat: data.panchayat || "",
                address: data.address || "",
                notes: data.notes || "",
                paymentMethod: paymentMethod,
                sendWhatsAppNotification: false
            });
        } catch (error) {
            console.error('Error fetching sponsorship:', error);
            setErrorMessage('Failed to load sponsorship data');
        } finally {
            setIsLoading(false);
        }
    };

    // Update amount automatically based on type and period
    useEffect(() => {
        if (!originalData) return; // Skip if original data isn't loaded yet
        
        let calculatedAmount = 0;
        
        switch(formData.period) {
            case "One Year":
                calculatedAmount = 30000;
                break;
            case "One Year(with education)":
                calculatedAmount = 50000;
                break;
            case "6 Months":
                calculatedAmount = 15000;
                break;
            case "6 Months(with education)":
                calculatedAmount = 25000;
                break;
            case "1 Month":
                calculatedAmount = 7500;
                break;
            case "1 Month(with education)":
                calculatedAmount = 12500;
                break;
            default:
                calculatedAmount = 30000;
        }
        
        setFormData(prev => ({
            ...prev,
            amount: calculatedAmount.toString()
        }));
    }, [formData.period, originalData]);

    // Update period if needed when type changes
    useEffect(() => {
        // If Yatheem is selected and current period has "education", switch to non-education option
        if (formData.type === "Sponsor-Yatheem" && formData.period.includes("education")) {
            // Extract the base period by removing the education part
            const basePeriod = formData.period.split("(")[0].trim();
            setFormData(prev => ({
                ...prev,
                period: basePeriod
            }));
        }
    }, [formData.type,formData.period]);

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

    const handleLocationChange = (locationData: {
        district: string;
        locationType: 'district' | 'municipality' | 'corporation' | 'panchayat';
        location: string;
        address?: string;
    }) => {
        setFormData(prev => ({
            ...prev,
            district: locationData.district,
            locationType: locationData.locationType,
            location: locationData.location,
            panchayat: locationData.location, // Add panchayat field with the same value as location
            address: locationData.address || ''
        }));

        // Clear any previous location errors
        setLocationErrors({});
    };

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

        // Don't change payment method as this would require changing the razorpayPaymentId
        // which is a protected field

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/admin/sponsorships/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update sponsorship');
            }

            const data = await response.json();
            setSuccessMessage("Sponsorship updated successfully!");

            // Check if WhatsApp notification was requested
            if (formData.sendWhatsAppNotification) {
                try {
                    // Use the existing send-whatsapp endpoint
                    const notificationResponse = await fetch('/api/donations/dashboard/send-whatsapp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                        },
                        body: JSON.stringify({
                            donationIds: [data._id], // Pass the sponsorship ID in an array
                            message: `Dear {name},\n\nYour sponsorship of {amount} for our ${formData.type.replace('Sponsor-', '')} program with a period of ${formData.period} has been updated.\n\nThank you for your continued support.\n\nWith gratitude,\nAkode Islamic Centre Team`
                        }),
                    });

                    const notificationData = await notificationResponse.json();
                    
                    setNotificationStatus({
                        attempted: true,
                        success: notificationData.success || false,
                        message: notificationData.message || "Notification sent"
                    });
                } catch (notificationError) {
                    console.error("Error sending notification:", notificationError);
                    setNotificationStatus({
                        attempted: true,
                        success: false,
                        message: "Failed to send notification"
                    });
                }
            }

            // Redirect to the sponsorship details page after a brief delay
            setTimeout(() => {
                router.push(`/admin/sponsorships/details/${id}`);
            }, 1500);

        } catch (error) {
            console.error("Error updating sponsorship:", error);
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Loading sponsorship data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Edit Sponsorship</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Update sponsorship information
                    </p>
                </div>

                <Link
                    href={`/admin/sponsorships/details/${id}`}
                    className="px-4 py-2 bg-white/10 text-black dark:text-white backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Details
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
                                    initialDistrict={formData.district}
                                    initialLocation={formData.location}
                                    // initialLocationType={formData.locationType as any}
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
                                    Send update notification to donor
                                </label>
                            </div>
                        </div>

                        {/* Sponsorship Details */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white pb-2 border-b border-white/10">
                                Sponsorship Details
                            </h3>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Sponsorship Type*
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                >
                                    <option className="text-black" value="Sponsor-Yatheem">Yatheem</option>
                                    <option className="text-black" value="Sponsor-Hafiz">Hafiz</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Sponsorship Period*
                                </label>
                                <select
                                    id="period"
                                    name="period"
                                    value={formData.period}
                                    onChange={handleChange}
                                    required
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                >
                                    <option className="text-black" value="One Year">One Year</option>
                                    {formData.type === "Sponsor-Hafiz" && (
                                        <option className="text-black" value="One Year(with education)">One Year (with education)</option>
                                    )}
                                    <option className="text-black" value="6 Months">6 Months</option>
                                    {formData.type === "Sponsor-Hafiz" && (
                                        <option className="text-black" value="6 Months(with education)">6 Months (with education)</option>
                                    )}
                                    <option className="text-black" value="1 Month">1 Month</option>
                                    {formData.type === "Sponsor-Hafiz" && (
                                        <option className="text-black" value="1 Month(with education)">1 Month (with education)</option>
                                    )}
                                </select>
                            </div>

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
                                    readOnly
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border 
                  dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 
                  focus:ring-emerald-500 focus:border-transparent 
                  text-gray-800 dark:text-gray-200 cursor-not-allowed opacity-90"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Amount is automatically calculated based on period selection
                                </p>
                            </div>

                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Method*
                                </label>
                                <input
                                    type="text"
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    disabled
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 cursor-not-allowed opacity-90"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Payment method cannot be changed after creation
                                </p>
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
                            placeholder="Any additional information about this sponsorship"
                            rows={3}
                            className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Link
                            href={`/admin/sponsorships/details/${id}`}
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
                            {isSubmitting ? "Updating..." : "Update Sponsorship"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}