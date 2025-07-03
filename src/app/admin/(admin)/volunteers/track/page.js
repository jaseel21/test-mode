"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { generatePDF } from "@/lib/receipt-pdf";
import { 
  Box, 
  Eye, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Banknote, 
  Search,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock
} from "lucide-react";

export default function BoxesPage() {
  const [boxes, setBoxes] = useState([]);
  const [vdata, setVdata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBox, setExpandedBox] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch volunteer data
        const volunteerResponse = await fetch(`/api/volunteers/findByid?phone=${encodeURIComponent(phone)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'x-api-key':process.env.NEXT_PUBLIC_API_KEY,
          },
        });

        if (!volunteerResponse.ok) {
          const errorData = await volunteerResponse.json();
          throw new Error(errorData.error || "Failed to fetch volunteer data");
        }

        const volunteerData = await volunteerResponse.json();
        setVdata(volunteerData);

        // Fetch boxes data
        const boxesResponse = await fetch(`/api/boxes/volunteer/find-donation?phone=${encodeURIComponent(phone)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          },
        });

        if (!boxesResponse.ok) {
          const errorData = await boxesResponse.json();
          throw new Error(errorData.error || "Failed to fetch boxes");
        }

        const boxesData = await boxesResponse.json();

        if (boxesData.message === "No boxes assigned to you") {
          setBoxes([]);
        } else {
          setBoxes(boxesData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (phone) {
      fetchData();
    }
  }, [phone]);

  const handleDownloadReceipt = async (box, donation, e) => {
    e.stopPropagation();
    console.log(box, donation);

    const ReceiptData = {
      _id: donation._id,
      amount: donation.amount,
      name: box.name,
      phone: donation.phone,
      type: donation.type,
      district: donation.district,
      panchayat: donation.panchayat,
      razorpayPaymentId: donation.paymentId,
      razorpayOrderId: donation.razorpayOrderId,
      instituteId: donation._id,
      createdAt: new Date().toISOString(),
    };

    try {
      await generatePDF(ReceiptData);
      console.log("Receipt downloaded successfully");
    } catch (err) {
      console.error("Error generating receipt:", err);
      setError("Failed to generate receipt. Please try again.");
    }
  };

  const toggleExpand = (boxId) => {
    setExpandedBox(expandedBox === boxId ? null : boxId);
  };

  const getSortedBoxes = () => {
    return [...boxes];
  };

  const filteredBoxes = getSortedBoxes().filter(box =>
    (box.name && box.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (box.serialNumber && box.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (box.mobileNumber && box.mobileNumber.includes(searchTerm))
  );

  const totalDonations = boxes.reduce((sum, box) => {
    return sum + box.donations.reduce((boxSum, donation) => boxSum + donation.amount, 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 text-lg font-medium">Loading your assigned boxes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-6">
            <div className="bg-red-50 p-3 rounded-full">
              <AlertTriangle className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-3">Error Loading Boxes</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header area with volunteer info */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {vdata && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href="/volunteer/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <User className="w-6 h-6 mr-2 text-blue-600 hidden sm:inline" /> {vdata.name}
                  </h1>
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1 text-gray-500 text-sm">
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1.5 text-gray-400" /> {vdata.phone}
                    </span>
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1.5 text-gray-400" /> {vdata.email}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5 text-gray-400" /> {vdata.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Dashboard stats */}
      {boxes.length > 0 && (
        <div className="bg-white border-b border-gray-200 pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 uppercase tracking-wide">Total Boxes</p>
                    <p className="mt-2 text-3xl font-bold text-blue-900">{boxes.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Box className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-blue-600">Collection boxes assigned to you</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 uppercase tracking-wide">Total Donations</p>
                    <p className="mt-2 text-3xl font-bold text-green-900">₹{totalDonations.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-green-600">Amount collected through all boxes</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800 uppercase tracking-wide">Payment Status</p>
                    <p className="mt-2 text-3xl font-bold text-purple-900">
                      {boxes.filter(box => box.paymentStatus === "Paid").length} / {boxes.length}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-purple-600">Paid boxes out of total assigned</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!boxes.length ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-4 rounded-full">
                <Box className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-3">No Boxes Assigned Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You don&apos;t have any donation boxes assigned to you at the moment. Please check back later or contact your administrator.
            </p>
            <Link
              href="/volunteer/dashboard"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-grow max-w-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, serial number, or mobile number..."
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    {filteredBoxes.length} Box{filteredBoxes.length !== 1 ? 'es' : ''} Found
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 border border-gray-200">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Donation Boxes</h2>
                <p className="text-sm text-gray-500">
                  Click on a box to view donation details
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredBoxes.map((box) => (
                  <div key={box._id} className="hover:bg-gray-50 transition-colors">
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => toggleExpand(box._id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-start">
                          <div className={`rounded-lg p-3 mr-4 flex-shrink-0 ${
                            box.paymentStatus === "Paid" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            <Box className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center flex-wrap gap-2">
                              {box.name}
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  box.paymentStatus === "Paid"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {box.paymentStatus} ({box.currentPeriod})
                              </span>
                            </h3>
                            <div className="mt-1.5 text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4">
                              <span className="flex items-center">
                                <span className="font-medium mr-1">Serial:</span> {box.serialNumber}
                              </span>
                              <span className="flex items-center">
                                <span className="font-medium mr-1">Mobile:</span> {box.mobileNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-4 md:mt-0">
                          <span className="text-sm font-medium text-gray-700 mr-3 bg-gray-100 px-2.5 py-1 rounded-md">
                            {box.donations.length} Donation{box.donations.length !== 1 ? 's' : ''}
                          </span>
                          <Link
                            href={`/box/${box._id}`}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors mr-1.5"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="View box details"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button 
                            className="p-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                            aria-label={expandedBox === box._id ? "Collapse" : "Expand"}
                          >
                            {expandedBox === box._id ? 
                              <ChevronUp className="w-5 h-5" /> : 
                              <ChevronDown className="w-5 h-5" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedBox === box._id && (
                      <div className="bg-gray-50 p-5 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                          Donation History
                        </h4>
                        {box.donations.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                            <Banknote className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No donations recorded yet</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                  <th scope="col" className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {box.donations.map((donation, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700">
                                      <div className="flex items-center">
                                        <Calendar className="text-gray-400 w-4 h-4 mr-2" />
                                        {new Date(donation.date).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700">
                                      <div className="flex items-center">
                                        <Banknote className="text-green-500 w-4 h-4 mr-2" />
                                        <span className="font-medium">₹{donation.amount.toLocaleString()}</span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700">
                                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                        {donation.paymentId}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                      <button
                                        onClick={(e) => handleDownloadReceipt(box, donation, e)}
                                        className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50 transition-colors inline-flex items-center justify-center"
                                        title="Download Receipt"
                                      >
                                        <Download className="w-5 h-5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}