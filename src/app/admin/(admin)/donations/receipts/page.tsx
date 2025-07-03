"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Download,
  FileText,
  Mail,
  Search,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  X,
  Loader2,
  Check,
  Info,
  MessageSquare,
  RefreshCw
} from "lucide-react";

// Define the Donation interface
interface Donation {
  _id: string;
  id: string;
  donor: string;
  email: string;
  phone: string;
  amount: string;
  type: string;
  status: string;
  date: string;
  receipt_generated: boolean;
  displayDate?: string;
}

// Define API response interface
interface DonationResponse {
  donations: Donation[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// Define the format for receipt generation
type ReceiptFormat = "pdf" | "image" | "csv";

// Define the type for notification status
interface NotificationStatus {
  type: "success" | "error" | "info" | "warning" | null;
  message: string;
}

export default function GenerateReceiptsPage() {
  // States with explicit types
  const [searchText, setSearchText] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<ReceiptFormat>("pdf");
  const [selectedDonations, setSelectedDonations] = useState<string[]>([]);
  const [allPagesDonationIds, setAllPagesDonationIds] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notification, setNotification] = useState<NotificationStatus>({
    type: null,
    message: "",
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState<boolean>(false);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [whatsAppMessage, setWhatsAppMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);
  const [selectAllPages, setSelectAllPages] = useState<boolean>(false);
  const [isFetchingAllDonations, setIsFetchingAllDonations] = useState<boolean>(false);

  // Calculate if any selected donations have emails/phones
  const hasSelectedDonationsWithEmail = useMemo(() => {
    return donations.some(d =>
      selectedDonations.includes(d._id) &&
      d.email &&
      d.email !== 'N/A'
    );
  }, [donations, selectedDonations]);

  const hasSelectedDonationsWithPhone = useMemo(() => {
    return donations.some(d =>
      selectedDonations.includes(d._id) &&
      d.phone &&
      d.phone !== 'N/A'
    );
  }, [donations, selectedDonations]);

  // Memoized fetchDonations function
  const fetchDonations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: 'Completed',
        search: searchText,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (selectedType) params.append('type', selectedType);

      const response = await fetch(`/api/donations/dashboard/receipts?${params.toString()}`, {
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch donations');
      }

      const data: DonationResponse = await response.json();

      const receiptDonations: Donation[] = data.donations.map((donation: Donation) => ({
        ...donation,
        receipt_generated: donation.receipt_generated ?? false
      }));

      setDonations(receiptDonations);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error('Error fetching donations for receipts:', error);
      showNotification("error", "Failed to fetch donations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [searchText, dateFrom, dateTo, selectedType, currentPage, itemsPerPage]);

  // Memoized fetchAllDonationsIds function
  const fetchAllDonationsIds = useCallback(async () => {
    setIsFetchingAllDonations(true);
    try {
      const params = new URLSearchParams({
        status: 'Completed',
        search: searchText,
        getAll: 'true'
      });

      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (selectedType) params.append('type', selectedType);

      const response = await fetch(`/api/donations/dashboard/receipts/all-ids?${params.toString()}`, {
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all donation IDs');
      }

      const data = await response.json();
      setAllPagesDonationIds(data.donationIds);

      if (selectAllPages) {
        setSelectedDonations(data.donationIds);
      }
    } catch (error) {
      console.error('Error fetching all donation IDs:', error);
      showNotification("error", "Failed to fetch all donation IDs. Please try again.");
    } finally {
      setIsFetchingAllDonations(false);
    }
  }, [searchText, dateFrom, dateTo, selectedType, selectAllPages]);

  // Fetch donations when filters change
    useEffect(() => {
      if (currentPage === 1) {
        fetchDonations();
      } else {
        setCurrentPage(1); // This will trigger the second useEffect to fetch
      }
      setSelectedDonations([]);
      setSelectAllPages(false);
    }, [searchText, dateFrom, dateTo, selectedType, fetchDonations,currentPage]);

  // Fetch donations when page changes
  useEffect(() => {
    fetchDonations();
  }, [currentPage, itemsPerPage, fetchDonations]);

  // Fetch all donation IDs when select all pages or filters change
  useEffect(() => {
    if (selectAllPages ||
      (searchText !== '' || dateFrom !== '' || dateTo !== '' || selectedType !== '')) {
      fetchAllDonationsIds();
    }
  }, [selectAllPages, searchText, dateFrom, dateTo, selectedType, fetchAllDonationsIds]);

  // Apply filters and search
  const applyFilters = async () => {
    setCurrentPage(1);
    await fetchDonations();
    setSelectedDonations([]);
    setSelectAllPages(false);
  };

  // Helper function to show notifications
  const showNotification = (type: "success" | "error" | "info" | "warning", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: "" });
    }, 5000);
  };

  // Receipt preview component
  const ReceiptPreview = ({ donation }: { donation: Donation }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-lg w-full max-w-md mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-3">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">AIC</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">AIC Amal</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Donation Receipt #{donation.id}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
              {donation.status}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(donation.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Donor</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{donation.donor}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{donation.amount}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{donation.type}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{donation.email}</p>
          </div>
        </div>

        <div className="text-center border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Thank you for your generous contribution!
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Akode Islamic Centre - Your support makes a difference.
          </p>
        </div>
      </div>
    );
  };

  // Toggle selection for a donation
  const toggleSelect = (id: string) => {
    if (selectedDonations.includes(id)) {
      setSelectedDonations(selectedDonations.filter(donId => donId !== id));
    } else {
      setSelectedDonations([...selectedDonations, id]);
    }
  };

  // Toggle select all functionality for current page
  const toggleSelectAll = () => {
    const currentPageIds = donations.map(d => d._id);
    const allSelected = currentPageIds.every(id => selectedDonations.includes(id));

    if (allSelected) {
      setSelectedDonations(selectedDonations.filter(id => !currentPageIds.includes(id)));
    } else {
      const newSelection = [...new Set([...selectedDonations, ...currentPageIds])];
      setSelectedDonations(newSelection);
    }
  };

  // Toggle select all pages functionality
  const toggleSelectAllPages = () => {
    const newSelectAllPages = !selectAllPages;
    setSelectAllPages(newSelectAllPages);

    if (newSelectAllPages) {
      if (allPagesDonationIds.length === 0) {
        fetchAllDonationsIds();
      } else {
        setSelectedDonations(allPagesDonationIds);
      }
    } else {
      setSelectedDonations([]);
    }
  };

  // Generate receipts function
  const generateReceipts = async () => {
    if (selectedDonations.length === 0) {
      showNotification("warning", "Please select at least one donation to generate receipts");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/donations/dashboard/generate-receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          donationIds: selectedDonations,
          format: selectedFormat,
          updateStatus: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipts');
      }

      if (selectedFormat === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `donation-receipts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else if (selectedFormat === 'pdf' || selectedFormat === 'image') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }

      setDonations(prevDonations =>
        prevDonations.map(donation =>
          selectedDonations.includes(donation._id)
            ? { ...donation, receipt_generated: true }
            : donation
        )
      );

      showNotification("success", `Successfully generated ${selectedDonations.length} receipts in ${selectedFormat.toUpperCase()} format`);
    } catch (error) {
      console.error('Error generating receipts:', error);
      showNotification("error", "Failed to generate receipts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Send emails function
  const sendEmails = async () => {
    if (selectedDonations.length === 0) {
      showNotification("warning", "Please select at least one donation to send emails");
      return;
    }

    const validEmailDonations = selectedDonations.filter(id => {
      const donation = donations.find(d => d._id === id);
      return donation && donation.email && donation.email !== 'N/A';
    });

    if (validEmailDonations.length === 0) {
      showNotification("warning", "None of the selected donations have a valid email address");
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/donations/dashboard/send-receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          donationIds: validEmailDonations,
          subject: emailSubject || 'Your Donation Receipt from Akode Islamic Centre',
          body: emailBody || 'Thank you for your generous donation. Please find attached your donation receipt.',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send emails');
      }

      const result = await response.json();

      showNotification("success", `Successfully sent ${result.sentCount} emails. ${result.failedCount ? `Failed to send ${result.failedCount} emails.` : ''}`);
      setEmailModalOpen(false);
    } catch (error) {
      console.error('Error sending emails:', error);
      showNotification("error", `Failed to send emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Send WhatsApp messages function
  const sendWhatsAppMessages = async () => {
    if (selectedDonations.length === 0) {
      showNotification("warning", "Please select at least one donation to send WhatsApp messages");
      return;
    }

    const validPhoneDonations = selectedDonations.filter(id => {
      const donation = donations.find(d => d._id === id);
      return donation && donation.phone && donation.phone !== 'N/A';
    });

    if (validPhoneDonations.length === 0) {
      showNotification("warning", "None of the selected donations have a valid phone number");
      return;
    }

    setIsSendingWhatsApp(true);
    try {
      const response = await fetch('/api/donations/dashboard/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          donationIds: validPhoneDonations,
          message: whatsAppMessage || 'Thank you for your generous donation to Akode Islamic Centre. Your contribution makes a real difference.',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send WhatsApp messages');
      }

      const result = await response.json();

      showNotification("success", `Successfully sent ${result.sentCount} WhatsApp messages. ${result.failedCount ? `Failed to send ${result.failedCount} messages.` : ''}`);
      setWhatsAppModalOpen(false);
    } catch (error) {
      console.error('Error sending WhatsApp messages:', error);
      showNotification("error", `Failed to send WhatsApp messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Show receipt preview function
  const showReceiptPreview = (id: string) => {
    const donation = donations.find(d => d._id === id);
    if (donation) {
      setCurrentPreview(id);
      setShowPreview(true);
    }
  };

  // Download individual receipt
  const downloadIndividualReceipt = async (id: string, format: ReceiptFormat = 'pdf') => {
    try {
      const response = await fetch(`/api/donations/dashboard/generate-receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          donationIds: [id],
          format: format,
          updateStatus: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      if (format === 'csv') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `donation-receipt-${id}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        window.open(url, '_blank');
      }

      setDonations(prevDonations =>
        prevDonations.map(donation =>
          donation._id === id ? { ...donation, receipt_generated: true } : donation
        )
      );

      showNotification("success", `Successfully generated receipt in ${format.toUpperCase()} format`);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      showNotification("error", "Failed to download receipt. Please try again.");
    }
  };

  // Send individual email
  const sendIndividualEmail = async (id: string) => {
    const donation = donations.find(d => d._id === id);

    if (!donation) {
      showNotification("error", "Donation not found");
      return;
    }

    if (!donation.email || donation.email === 'N/A') {
      showNotification("warning", "This donation doesn't have a valid email address");
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/donations/dashboard/send-receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          donationIds: [id],
          subject: `Your Donation Receipt #${donation.id} from Akode Islamic Centre`,
          body: `Dear ${donation.donor},\n\nThank you for your generous donation of ${donation.amount}. Please find attached your donation receipt.\n\nBest regards,\nAkode Islamic Centre`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      showNotification("success", "Email sent successfully");
    } catch (error) {
      console.error('Error sending email:', error);
      showNotification("error", `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Send individual WhatsApp message
  const sendIndividualWhatsApp = async (id: string) => {
    const donation = donations.find(d => d._id === id);

    if (!donation) {
      showNotification("error", "Donation not found");
      return;
    }

    if (!donation.phone || donation.phone === 'N/A') {
      showNotification("warning", "This donation doesn't have a valid phone number");
      return;
    }

    setIsSendingWhatsApp(true);
    try {
      const response = await fetch('/api/donations/dashboard/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          donationIds: [id],
          message: `Dear ${donation.donor},\n\nThank you for your generous donation of ${donation.amount} to Akode Islamic Centre. Your donation receipt #${donation.id} has been generated.\n\nBest regards,\nAkode Islamic Centre Team`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send WhatsApp message');
      }

      showNotification("success", "WhatsApp message sent successfully");
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      showNotification("error", `Failed to send WhatsApp message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchText("");
    setDateFrom("");
    setDateTo("");
    setSelectedType("");
    setCurrentPage(1);
    fetchDonations();
    setSelectedDonations([]);
    setSelectAllPages(false);
  };

  // Calculate pagination numbers
  const getPaginationNumbers = (): (number | string)[] => {
    const result: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
      return result;
    }

    result.push(1);

    if (currentPage > 3) {
      result.push('...');
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      result.push(i);
    }

    if (currentPage < totalPages - 2) {
      result.push('...');
    }

    if (totalPages > 1) {
      result.push(totalPages);
    }

    return result;
  };

  // Get default email content for bulk emails
  const getDefaultEmailContent = () => {
    const selectedCount = selectedDonations.length;
    const defaultSubject = `Your Donation Receipt${selectedCount > 1 ? 's' : ''} from Akode Islamic Centre`;
    const defaultBody = `Dear Donor,

  Thank you for your generous donation to Akode Islamic Centre. Please find attached your donation receipt${selectedCount > 1 ? 's' : ''}.

  Your support enables us to continue our mission and make a difference in the community.

  Best regards,
  Akode Islamic Centre Team`;

    return { subject: defaultSubject, body: defaultBody };
  };

  // Get default WhatsApp message for bulk messages
  const getDefaultWhatsAppMessage = () => {
    const selectedCount = selectedDonations.length;
    const defaultMessage = `Dear Donor,

  Thank you for your generous donation to Akode Islamic Centre. Your donation receipt${selectedCount > 1 ? 's have' : ' has'} been generated.

  Your support helps us make a real difference in our community.

  Best regards,
  Akode Islamic Centre Team`;

    return defaultMessage;
  };

  // Init email modal
  const openEmailModal = () => {
    if (selectedDonations.length === 0) {
      showNotification("warning", "Please select at least one donation to send emails");
      return;
    }

    const donationsWithEmail = donations.filter(
      d => selectedDonations.includes(d._id) && d.email && d.email !== 'N/A'
    );

    if (donationsWithEmail.length === 0) {
      showNotification("warning", "None of the selected donations have email addresses");
      return;
    }

    const donationsWithoutEmail = selectedDonations.length - donationsWithEmail.length;
    if (donationsWithoutEmail > 0) {
      showNotification("info", `${donationsWithoutEmail} selected donation(s) don't have email addresses and will be skipped`);
    }

    const { subject, body } = getDefaultEmailContent();
    setEmailSubject(subject);
    setEmailBody(body);
    setEmailModalOpen(true);
  };

  // Init WhatsApp modal
  const openWhatsAppModal = () => {
    if (selectedDonations.length === 0) {
      showNotification("warning", "Please select at least one donation to send WhatsApp messages");
      return;
    }

    const donationsWithPhone = donations.filter(
      d => selectedDonations.includes(d._id) && d.phone && d.phone !== 'N/A'
    );

    if (donationsWithPhone.length === 0) {
      showNotification("warning", "None of the selected donations have phone numbers");
      return;
    }

    const donationsWithoutPhone = selectedDonations.length - donationsWithPhone.length;
    if (donationsWithoutPhone > 0) {
      showNotification("info", `${donationsWithoutPhone} selected donation(s) don't have phone numbers and will be skipped`);
    }

    const defaultMessage = getDefaultWhatsAppMessage();
    setWhatsAppMessage(defaultMessage);
    setWhatsAppModalOpen(true);
  };

  // Refresh data
  const refreshData = () => {
    fetchDonations();
  };

  // Get notification styling based on type
  const getNotificationStyles = () => {
    switch (notification.type) {
      case "success":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          border: "border-green-200 dark:border-green-800",
          text: "text-green-800 dark:text-green-400",
          icon: <CheckCircle className="h-5 w-5 mr-2" />
        };
      case "error":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-800 dark:text-red-400",
          icon: <AlertCircle className="h-5 w-5 mr-2" />
        };
      case "warning":
        return {
          bg: "bg-amber-100 dark:bg-amber-900/30",
          border: "border-amber-200 dark:border-amber-800",
          text: "text-amber-800 dark:text-amber-400",
          icon: <AlertCircle className="h-5 w-5 mr-2" />
        };
      case "info":
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          border: "border-blue-200 dark:border-blue-800",
          text: "text-blue-800 dark:text-blue-400",
          icon: <Info className="h-5 w-5 mr-2" />
        };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Generate Receipts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage donation receipts for your donors
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={refreshData}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center bg-white/10 text-gray-700 dark:text-gray-300 backdrop-blur-md border border-white/20 hover:bg-white/20"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {hasSelectedDonationsWithEmail && (
            <button
              onClick={() => openEmailModal()}
              disabled={selectedDonations.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${selectedDonations.length > 0
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Selected {selectedDonations.length > 0 && `(${selectedDonations.length})`}
            </button>
          )}
          {hasSelectedDonationsWithPhone && (
            <button
              onClick={() => openWhatsAppModal()}
              disabled={selectedDonations.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${selectedDonations.length > 0
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp Selected {selectedDonations.length > 0 && `(${selectedDonations.length})`}
            </button>
          )}
          <button
            onClick={generateReceipts}
            disabled={selectedDonations.length === 0 || isGenerating}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${selectedDonations.length > 0 && !isGenerating
              ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
              : "bg-gray-400 text-white cursor-not-allowed"
              }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Selected ({selectedDonations.length})
              </>
            )}
          </button>
        </div>
      </div>

      {notification.type && (
        <div className={`${getNotificationStyles().bg} ${getNotificationStyles().border} ${getNotificationStyles().text} px-4 py-3 rounded-lg flex items-center justify-between`}>
          <div className="flex items-center">
            {getNotificationStyles().icon}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification({ type: null, message: "" })}
            className="ml-auto focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by donor name or ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            >
              <option value="">All Types</option>
              <option value="General">General</option>
              <option value="Yatheem">Yatheem</option>
              <option value="Hafiz">Hafiz</option>
              <option value="Building">Building</option>
              <option value="Campaign">Campaign</option>
              <option value="Institution">Institution</option>
              <option value="Box">Box</option>
              <option value="Sponsor-Yatheem">Sponsor-Yatheem</option>
              <option value="Sponsor-Hafiz">Sponsor-Hafiz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-10 px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-10 px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as ReceiptFormat)}
              className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            >
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="flex space-x-2 items-end">
            <button
              className="px-4 py-2 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center text-gray-700 dark:text-gray-300"
              onClick={resetFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {(searchText || dateFrom || dateTo || selectedType) && (
        <div className="flex flex-wrap gap-2">
          {searchText && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium">
              Search: {searchText}
              <button
                onClick={() => {
                  setSearchText("");
                  applyFilters();
                }}
                className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {selectedType && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs font-medium">
              Type: {selectedType}
              <button
                onClick={() => {
                  setSelectedType("");
                  applyFilters();
                }}
                className="ml-2 text-purple-500 hover:text-purple-700 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {dateFrom && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium">
              From: {new Date(dateFrom).toLocaleDateString()}
              <button
                onClick={() => {
                  setDateFrom("");
                  applyFilters();
                }}
                className="ml-2 text-green-500 hover:text-green-700 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {dateTo && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium">
              To: {new Date(dateTo).toLocaleDateString()}
              <button
                onClick={() => {
                  setDateTo("");
                  applyFilters();
                }}
                className="ml-2 text-green-500 hover:text-green-700 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          {donations.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto bg-gray-200 dark:bg-gray-700 p-6 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No donations found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {searchText || dateFrom || dateTo || selectedType
                  ? "No donations match your current filters. Try adjusting your search criteria."
                  : "There are no completed donations available for generating receipts."}
              </p>
              {(searchText || dateFrom || dateTo || selectedType) && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative inline-block ml-2">
                    <input
                      type="checkbox"
                      id="selectAllPages"
                      className="sr-only"
                      onChange={toggleSelectAllPages}
                      checked={selectAllPages}
                      disabled={isFetchingAllDonations}
                    />
                    <label
                      htmlFor="selectAllPages"
                      className={`flex items-center text-sm font-medium cursor-pointer ${isFetchingAllDonations ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      <span className={`block w-5 h-5 mr-2 rounded border transition-colors ${selectAllPages
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-white/10 border-gray-300 dark:border-gray-600'
                        }`}>
                        {selectAllPages && (
                          <Check className="h-4 w-4 text-white absolute top-0.5 left-0.5" />
                        )}
                      </span>
                      {isFetchingAllDonations ? (
                        <span className="flex items-center">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading all pages...
                        </span>
                      ) : (
                        <span>Select all pages ({totalItems} donations)</span>
                      )}
                    </label>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDonations.length} selected of {totalItems} total
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-lg">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            onChange={toggleSelectAll}
                            checked={donations.length > 0 && donations.every(d => selectedDonations.includes(d._id))}
                          />
                        </div>
                      </th>
                      <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Donor Name
                      </th>
                      <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="sticky top-0 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-lg">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation, index) => (
                      <tr
                        key={donation._id}
                        className={`hover:bg-white/5 dark:hover:bg-gray-800/50 backdrop-blur-md transition-all ${index % 2 === 0 ? 'bg-white/2' : 'bg-white/5 dark:bg-gray-800/20'
                          }`}
                      >
                        <td className="p-3 border-b border-white/10">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            checked={selectedDonations.includes(donation._id)}
                            onChange={() => toggleSelect(donation._id)}
                          />
                        </td>
                        <td className="p-3 text-sm font-medium text-gray-900 dark:text-white border-b border-white/10">
                          {donation.id}
                        </td>
                        <td className="p-3 border-b border-white/10">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {donation.donor}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {donation.email !== 'N/A' ? donation.email : donation.phone}
                          </div>
                        </td>
                        <td className="p-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 border-b border-white/10">
                          {donation.amount}
                        </td>
                        <td className="p-3 text-sm text-gray-800 dark:text-gray-200 border-b border-white/10">
                          <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs font-medium">
                            {donation.type}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-500 dark:text-gray-400 border-b border-white/10">
                          {new Date(donation.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 border-b border-white/10">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => showReceiptPreview(donation._id)}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => downloadIndividualReceipt(donation._id, selectedFormat)}
                              className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                            >
                              Download
                            </button>
                            {donation.email && donation.email !== 'N/A' && (
                              <button
                                onClick={() => sendIndividualEmail(donation._id)}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                              >
                                Email
                              </button>
                            )}
                            {donation.phone && donation.phone !== 'N/A' && (
                              <button
                                onClick={() => sendIndividualWhatsApp(donation._id)}
                                className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                              >
                                WhatsApp
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} donations
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg text-sm ${currentPage === 1
                      ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white/10 text-gray-700 dark:text-gray-200 backdrop-blur-md border border-white/20 hover:bg-white/20'
                      } transition-all duration-300`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  {getPaginationNumbers().map((page, i) => (
                    typeof page === 'string' ? (
                      <span key={`ellipsis-${i}`} className="px-3 py-1 text-gray-500 dark:text-gray-400">
                        {page}
                      </span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 rounded-lg text-sm ${currentPage === page
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/10 text-gray-700 dark:text-gray-200 backdrop-blur-md border border-white/20 hover:bg-white/20'
                          } transition-all duration-300`}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg text-sm ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white/10 text-gray-700 dark:text-gray-200 backdrop-blur-md border border-white/20 hover:bg-white/20'
                      } transition-all duration-300`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showPreview && currentPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Receipt Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <ReceiptPreview donation={donations.find(d => d._id === currentPreview) as Donation} />

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={() => downloadIndividualReceipt(currentPreview, 'pdf')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" /> PDF
              </button>
              <button
                onClick={() => downloadIndividualReceipt(currentPreview, 'image')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center"
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Image
              </button>
              {donations.find(d => d._id === currentPreview)?.email &&
                donations.find(d => d._id === currentPreview)?.email !== 'N/A' && (
                  <button
                    onClick={() => {
                      sendIndividualEmail(currentPreview);
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-all duration-300 flex items-center"
                  >
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </button>
                )}
              {donations.find(d => d._id === currentPreview)?.phone &&
                donations.find(d => d._id === currentPreview)?.phone !== 'N/A' && (
                  <button
                    onClick={() => {
                      sendIndividualWhatsApp(currentPreview);
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-300 flex items-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {emailModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send Email Receipts</h3>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Subject
                </label>
                <input
                  id="emailSubject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Message
                </label>
                <textarea
                  id="emailBody"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                  className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                  placeholder="Enter email message"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-400">
                <div className="flex items-start">
                  <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Email Information</p>
                    <p>You are about to send emails to {donations.filter(d => selectedDonations.includes(d._id) && d.email && d.email !== 'N/A').length} donors. The receipts will be attached automatically as PDFs.</p>
                    <p className="mt-2">Note: Only donors with valid email addresses will receive the emails.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                disabled={isSendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={sendEmails}
                disabled={isSendingEmail}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-all duration-300 flex items-center"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Emails
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {whatsAppModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send WhatsApp Messages</h3>
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="whatsAppMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  WhatsApp Message
                </label>
                <textarea
                  id="whatsAppMessage"
                  value={whatsAppMessage}
                  onChange={(e) => setWhatsAppMessage(e.target.value)}
                  rows={6}
                  className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                  placeholder="Enter WhatsApp message"
                />
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-800 dark:text-green-400">
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">WhatsApp Information</p>
                    <p>You are about to send WhatsApp messages to {donations.filter(d => selectedDonations.includes(d._id) && d.phone && d.phone !== 'N/A').length} donors.</p>
                    <p className="mt-2">Note: Only donors with valid phone numbers will receive the messages.</p>
                    <p className="mt-2">You can use the following placeholders in your message:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                      <div className="font-mono text-xs">{'{name}'}</div><div className="text-xs">Donor&apos;s name</div>
                      <div className="font-mono text-xs">{'{amount}'}</div><div className="text-xs">Donation amount</div>
                      <div className="font-mono text-xs">{'{id}'}</div><div className="text-xs">Donation ID</div>
                      <div className="font-mono text-xs">{'{date}'}</div><div className="text-xs">Donation date</div>
                      <div className="font-mono text-xs">{'{type}'}</div><div className="text-xs">Donation type</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                disabled={isSendingWhatsApp}
              >
                Cancel
              </button>
              <button
                onClick={sendWhatsAppMessages}
                disabled={isSendingWhatsApp}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-300 flex items-center"
              >
                {isSendingWhatsApp ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send WhatsApp Messages
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDonations.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-xl px-6 py-3 flex items-center space-x-4 border border-gray-200 dark:border-gray-700 z-40 animate-fadeIn">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {selectedDonations.length} selected
          </span>
          <div className="h-6 border-r border-gray-300 dark:border-gray-600"></div>
          <button
            onClick={generateReceipts}
            disabled={isGenerating}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" />
                Generate All
              </>
            )}
          </button>
          {hasSelectedDonationsWithEmail && (
            <button
              onClick={openEmailModal}
              disabled={isSendingEmail}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-3 w-3 mr-1" />
                  Email All
                </>
              )}
            </button>
          )}
          {hasSelectedDonationsWithPhone && (
            <button
              onClick={openWhatsAppModal}
              disabled={isSendingWhatsApp}
              className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center"
            >
              {isSendingWhatsApp ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  WhatsApp All
                </>
              )}
            </button>
          )}
          <button
            onClick={() => setSelectedDonations([])}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}