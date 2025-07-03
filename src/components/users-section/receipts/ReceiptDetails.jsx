import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generatePDF } from '@/lib/receipt-pdf';
import BackButton from './BackButton';

const ReceiptDetails = ({ receipt }) => {
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile viewport on client side
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format amount with ₹ symbol
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Determine status color and icon
    const getStatusInfo = (status) => {
        if (status === 'Completed') {
            return {
                bgColor: 'bg-green-100 dark:bg-green-900/30',
                textColor: 'text-green-800 dark:text-green-300',
                borderColor: 'border-green-200 dark:border-green-700',
                gradientFrom: 'from-green-500',
                gradientTo: 'to-emerald-600',
                icon: (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )
            };
        }
        if (status === 'Pending') {
            return {
                bgColor: 'bg-amber-100 dark:bg-amber-900/30',
                textColor: 'text-amber-800 dark:text-amber-300',
                borderColor: 'border-amber-200 dark:border-amber-700',
                gradientFrom: 'from-amber-500',
                gradientTo: 'to-orange-600',
                icon: (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            };
        }
        return {
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            textColor: 'text-gray-800 dark:text-gray-300',
            borderColor: 'border-gray-200 dark:border-gray-700',
            gradientFrom: 'from-gray-500',
            gradientTo: 'to-gray-600',
            icon: null
        };
    };

    // Generate receipt number from order ID or donation ID
    const generateReceiptNumber = (receipt) => {
        if (receipt.receiptNumber) return receipt.receiptNumber;
        if (receipt.razorpayOrderId) {
            return `RCP-${receipt.razorpayOrderId.slice(-8).toUpperCase()}`;
        }
        return `RCP-${receipt._id.toString().slice(-8).toUpperCase()}`;
    };

    // Get donation type icon and color
    const getDonationTypeInfo = (type = 'General') => {
        type = type || 'General'; // Default to 'General' if type is null/undefined

        const typeMap = {
            'General': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                gradient: 'from-blue-500 to-indigo-600',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                textColor: 'text-blue-700 dark:text-blue-300'
            },
            'Yatheem': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                ),
                gradient: 'from-emerald-500 to-green-600',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                textColor: 'text-emerald-700 dark:text-emerald-300'
            },
            'Hafiz': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                ),
                gradient: 'from-purple-500 to-indigo-600',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                textColor: 'text-purple-700 dark:text-purple-300'
            },
            'Building': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
                gradient: 'from-amber-500 to-orange-600',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                textColor: 'text-amber-700 dark:text-amber-300'
            },
            'Campaign': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                ),
                gradient: 'from-rose-500 to-pink-600',
                bgColor: 'bg-rose-50 dark:bg-rose-900/20',
                textColor: 'text-rose-700 dark:text-rose-300'
            },
            'Institute': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                ),
                gradient: 'from-cyan-500 to-blue-600',
                bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
                textColor: 'text-cyan-700 dark:text-cyan-300'
            },
            'box': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                ),
                gradient: 'from-teal-500 to-emerald-600',
                bgColor: 'bg-teal-50 dark:bg-teal-900/20',
                textColor: 'text-teal-700 dark:text-teal-300'
            }
        };

        // Handle when type is not in our map
        return typeMap[type] || typeMap['General'];
    };

    const handleDownload = async () => {
        try {
            await generatePDF(receipt);
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Failed to generate receipt PDF. Please try again.');
        }
    };

    const receiptNumber = generateReceiptNumber(receipt);
    const statusInfo = getStatusInfo(receipt.status);
    const typeInfo = getDonationTypeInfo(receipt.type);

    // Mobile Layout
    if (isMobile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Sticky Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-2 px-3 border-b border-gray-200 dark:border-gray-800"
                >
                    <BackButton href="/receipts" label="Back to Receipts" />
                </motion.div>

                {/* Main Content */}
                <div className="px-3 pt-3 pb-20">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`bg-gradient-to-br ${statusInfo.gradientFrom} ${statusInfo.gradientTo} text-white p-4 rounded-xl relative overflow-hidden shadow-md`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2"></div>

                        {/* Receipt Type */}
                        <div className="flex items-center mb-3">
                            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center mr-2">
                                {typeInfo.icon}
                            </div>
                            <span className="text-sm font-medium text-white/90">{receipt.type || 'General Donation'}</span>
                        </div>

                        {/* Receipt Number */}
                        <h1 className="text-xl font-bold mb-2">{receiptNumber}</h1>

                        {/* Amount */}
                        <div className="text-2xl font-extrabold mb-3">{formatAmount(receipt.amount)}</div>

                        {/* Date */}
                        <div className="flex items-center text-xs text-white/80 mb-3">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(receipt.createdAt)}
                        </div>

                        {/* Status */}
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                            {statusInfo.icon}
                            {receipt.status}
                        </div>
                    </motion.div>

                    {/* Content Sections */}
                    <div className="mt-4 space-y-4">
                        {/* Donor Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Donor Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Name</div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.name || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.phone || 'N/A'}</div>
                                </div>
                                {(receipt.district || receipt.panchayat) && (
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                            {[receipt.district, receipt.panchayat].filter(Boolean).join(', ')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Payment Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment Details
                            </h3>
                            <div className="space-y-3 text-sm">
                                {receipt.razorpayPaymentId && (
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Payment ID</div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200 text-xs break-all">
                                            {receipt.razorpayPaymentId}
                                        </div>
                                    </div>
                                )}
                                {receipt.razorpayOrderId && (
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Order ID</div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200 text-xs break-all">
                                            {receipt.razorpayOrderId}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Additional Details */}
                        {(receipt.boxId || receipt.campaignId || receipt.instituteId) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Additional Details
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {receipt.boxId && (
                                        <div className={`p-3 rounded-md ${typeInfo.bgColor}`}>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Pay Box ID</div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.boxId}</div>
                                        </div>
                                    )}
                                    {receipt.campaignId && (
                                        <div className={`p-3 rounded-md ${typeInfo.bgColor}`}>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Campaign</div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.campaignId}</div>
                                        </div>
                                    )}
                                    {receipt.instituteId && (
                                        <div className={`p-3 rounded-md ${typeInfo.bgColor}`}>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Institute</div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.instituteId}</div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sticky Footer */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="fixed bottom-0 left-0 right-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 border-t border-gray-200 dark:border-gray-800 shadow-lg"
                    >
                        <button
                            onClick={handleDownload}
                            className={`w-full bg-gradient-to-r ${typeInfo.gradient} text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center text-sm`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Receipt
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Desktop Layout
    return (
        <div className="container mx-auto max-w-6xl px-6 py-8">
            <motion.div
                className="flex justify-between items-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <BackButton href="/receipts" label="Back to Receipts" />

                <motion.button
                    onClick={handleDownload}
                    className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full pl-3 pr-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                </motion.button>
            </motion.div>

            {/* Receipt Card */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left Column */}
                <motion.div
                    className="col-span-12 md:col-span-4 lg:col-span-3"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Receipt Meta Card */}
                    <div className={`bg-gradient-to-br ${statusInfo.gradientFrom} ${statusInfo.gradientTo} text-white rounded-2xl overflow-hidden shadow-lg mb-6`}>
                        <div className="relative p-6">
                            {/* Decorative Circle */}
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative">
                                <div className="text-white/70 text-sm mb-1">Receipt Number</div>
                                <h1 className="text-2xl font-bold mb-4">{receiptNumber}</h1>

                                <div className="mb-6">
                                    <div className="text-white/70 text-sm mb-1">Amount</div>
                                    <div className="text-3xl font-extrabold">
                                        {formatAmount(receipt.amount)}
                                    </div>
                                </div>

                                <div className="flex items-center mb-2">
                                    <svg className="w-4 h-4 mr-2 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div className="text-sm">{formatDate(receipt.createdAt)}</div>
                                </div>

                                <div className="w-full bg-white/20 rounded-lg p-3 flex items-center">
                                    {statusInfo.icon}
                                    <span className="font-medium">{receipt.status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm px-6 py-4 flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-white/20`}>
                                {typeInfo.icon}
                            </div>
                            <div>
                                <div className="text-white/70 text-xs">Donation Type</div>
                                <div className="font-medium">{receipt.type || 'General Donation'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Donor Card */}
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Donor Information
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.name || 'N/A'}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.phone || 'N/A'}</div>
                                </div>

                                {(receipt.district || receipt.panchayat) && (
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                            {[receipt.district, receipt.panchayat].filter(Boolean).join(', ')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Column */}
                <motion.div
                    className="col-span-12 md:col-span-8 lg:col-span-9"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Main Content Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        {/* Header */}
                        <div className={`${typeInfo.bgColor} p-6 border-b border-gray-200 dark:border-gray-700`}>
                            <h2 className={`text-2xl font-bold ${typeInfo.textColor} flex items-center`}>
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Donation Receipt Details
                            </h2>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Payment Details */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Payment Information
                                </h3>

                                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {receipt.razorpayPaymentId && (
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Payment ID</div>
                                                <div className="font-medium text-gray-800 dark:text-gray-200 break-all mt-1">
                                                    {receipt.razorpayPaymentId}
                                                </div>
                                            </div>
                                        )}

                                        {receipt.razorpayOrderId && (
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Order ID</div>
                                                <div className="font-medium text-gray-800 dark:text-gray-200 break-all mt-1">
                                                    {receipt.razorpayOrderId}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            {(receipt.boxId || receipt.campaignId || receipt.instituteId) && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Additional Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {receipt.boxId && (
                                            <motion.div
                                                className={`${typeInfo.bgColor} p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700`}
                                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                            >
                                                <div className="flex items-start">
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeInfo.gradient} text-white flex items-center justify-center mr-3 flex-shrink-0`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Pay Box ID</div>
                                                        <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.boxId}</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {receipt.campaignId && (
                                            <motion.div
                                                className={`${typeInfo.bgColor} p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700`}
                                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                            >
                                                <div className="flex items-start">
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeInfo.gradient} text-white flex items-center justify-center mr-3 flex-shrink-0`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Campaign</div>
                                                        <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.campaignId}</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {receipt.instituteId && (
                                            <motion.div
                                                className={`${typeInfo.bgColor} p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700`}
                                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                            >
                                                <div className="flex items-start">
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeInfo.gradient} text-white flex items-center justify-center mr-3 flex-shrink-0`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Institute</div>
                                                        <div className="font-medium text-gray-800 dark:text-gray-200">{receipt.instituteId}</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Download Button - Large and Centered */}
                            <motion.div
                                className="mt-10 flex justify-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                            >
                                <motion.button
                                    onClick={handleDownload}
                                    className={`bg-gradient-to-r ${typeInfo.gradient} text-white px-8 py-4 rounded-xl shadow-lg font-medium flex items-center justify-center min-w-64`}
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Receipt PDF
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReceiptDetails;