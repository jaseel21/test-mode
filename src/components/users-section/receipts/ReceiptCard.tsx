import React, { JSX, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export interface Receipt {
    receiptNumber: string;
    _id: string;
    amount: number;
    type: string;
    name: string;
    phone: string;
    status: string;
    createdAt: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;

    // Optional fields based on donation type
    boxId?: string;
    campaignId?: string;
    instituteId?: string;
    district?: string;
    panchayat?: string;
    userId?: string;
}

interface ReceiptCardProps {
    receipt: Receipt;
    onDownload: (receipt: Receipt) => void;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onDownload }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format amount with ₹ symbol
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Generate receipt number from order ID or use the one from database
    const generateReceiptNumber = (receipt: Receipt): string => {
        if (receipt.receiptNumber) return receipt.receiptNumber;
        if (!receipt.razorpayOrderId) return 'N/A';
        return `RCP-${receipt.razorpayOrderId.slice(-8).toUpperCase()}`;
    };

    // Get donation type icon and color
    const getDonationTypeInfo = (type: string = 'General') => {
        type = type || 'General'; // Default to 'General' if type is null/undefined

        const typeMap: Record<string, { icon: JSX.Element, color: string, bgColor: string, borderColor: string }> = {
            'General': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                color: 'from-blue-500 to-indigo-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200'
            },
            'Yatheem': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                ),
                color: 'from-emerald-500 to-green-600',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200'
            },
            'Hafiz': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                ),
                color: 'from-purple-500 to-indigo-600',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200'
            },
            'Building': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
                color: 'from-amber-500 to-orange-600',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200'
            },
            'Campaign': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                ),
                color: 'from-rose-500 to-pink-600',
                bgColor: 'bg-rose-50',
                borderColor: 'border-rose-200'
            },
            'Institute': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                ),
                color: 'from-cyan-500 to-blue-600',
                bgColor: 'bg-cyan-50',
                borderColor: 'border-cyan-200'
            },
            'Box': {
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                ),
                color: 'from-teal-500 to-emerald-600',
                bgColor: 'bg-teal-50',
                borderColor: 'border-teal-200'
            },
            'Sponsor-Hafiz': {
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <circle cx="256" cy="256" r="256" fill="#FFDE59" />

                        <g transform="translate(128, 96) scale(1.15)">
                            <circle cx="112" cy="64" r="64" fill="black" />

                            <path d="M 0 240 C 0 176 224 176 224 240 L 224 256 L 0 256 Z" fill="black" />

                            <path d="M 0 256 L 112 288 L 224 256 L 224 320 L 112 352 L 0 320 Z" fill="black" />

                            <path d="M 112 288 L 112 352" stroke="white" stroke-width="8" />
                        </g>
                    </svg>
                ),
                color: 'from-emerald-500 to-green-600',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200'
            },
            'Sponsor-Yatheem': {
                icon: (
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
  />
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M9 11l3 3L21 5"
  />
</svg>
                ),
                color: 'from-emerald-500 to-green-600',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200'
            },
        };

        // Handle when type is not in our map
        return typeMap[type] || typeMap['General'];
    };

    // Get status information
    const getStatusInfo = (status: string) => {
        if (status === 'Completed') {
            return {
                color: 'text-green-600',
                bgColor: 'bg-green-100',
                icon: (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ),
                label: 'Completed'
            };
        }
        if (status === 'Pending') {
            return {
                color: 'text-amber-600',
                bgColor: 'bg-amber-100',
                icon: (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                label: 'Pending'
            };
        }
        return {
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
            icon: null,
            label: status || 'Unknown'
        };
    };

    const typeInfo = getDonationTypeInfo(receipt.type);
    const statusInfo = getStatusInfo(receipt.status);

    return (
        <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 15
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ 
                y: -5,
                transition: { duration: 0.2 } 
            }}
        >
            {/* Card container */}
            <div className={`rounded-xl overflow-hidden shadow-md ${isHovered ? 'shadow-lg' : ''} transition-shadow duration-300 ${typeInfo.borderColor} border`}>
                {/* Card header */}
                <div
                    className={`p-4 cursor-pointer ${typeInfo.bgColor} transition-all duration-300`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeInfo.color} text-white flex items-center justify-center`}>
                                {typeInfo.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    {receipt.type || 'General Donation'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatDate(receipt.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className={`flex items-center ${statusInfo.bgColor} px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                        <div>
                            <p className="text-xs text-gray-500 mb-0.5">Receipt No</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {generateReceiptNumber(receipt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-right text-gray-500 mb-0.5">Amount</p>
                            <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {formatAmount(receipt.amount)}
                            </p>
                        </div>
                    </div>

                    {/* Expand/collapse indicator */}
                    <div className="flex justify-center mt-3">
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </motion.div>
                    </div>
                </div>

                {/* Expandable content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            className="border-t border-gray-200 bg-white"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        >
                            <div className="p-4 space-y-4">
                                {/* Donor details */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Donor Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 pl-5">
                                        <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="text-sm font-medium">{receipt.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="text-sm font-medium">{receipt.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location details (if available) */}
                                {(receipt.district || receipt.panchayat) && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Location
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 pl-5">
                                            {receipt.district && (
                                                <div>
                                                    <p className="text-xs text-gray-500">District</p>
                                                    <p className="text-sm font-medium">{receipt.district}</p>
                                                </div>
                                            )}
                                            {receipt.panchayat && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Panchayat</p>
                                                    <p className="text-sm font-medium">{receipt.panchayat}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Additional details based on donation type */}
                                {(receipt.boxId || receipt.campaignId || receipt.instituteId) && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Additional Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 pl-5">
                                            {receipt.boxId && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Pay Box ID</p>
                                                    <p className="text-sm font-medium">{receipt.boxId}</p>
                                                </div>
                                            )}
                                            {receipt.campaignId && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Campaign</p>
                                                    <p className="text-sm font-medium">{receipt.campaignId}</p>
                                                </div>
                                            )}
                                            {receipt.instituteId && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Institute</p>
                                                    <p className="text-sm font-medium">{receipt.instituteId}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Payment details */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Payment Details
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2 pl-5">
                                        {receipt.razorpayPaymentId && (
                                            <div>
                                                <p className="text-xs text-gray-500">Payment ID</p>
                                                <p className="text-sm font-medium text-gray-600 truncate max-w-xs">
                                                    {receipt.razorpayPaymentId}
                                                </p>
                                            </div>
                                        )}
                                        {receipt.razorpayOrderId && (
                                            <div>
                                                <p className="text-xs text-gray-500">Order ID</p>
                                                <p className="text-sm font-medium text-gray-600 truncate max-w-xs">
                                                    {receipt.razorpayOrderId}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-end space-x-3 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDownload(receipt);
                                        }}
                                        className="flex items-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                    </motion.button>

                                    <Link 
                                        href={`/receipts/${receipt._id}`}
                                        className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Details
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ReceiptCard;