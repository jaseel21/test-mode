"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2,
  Trash2,
  Info,
  Loader2
} from "lucide-react";

// Define campaign data type
interface CampaignData {
  id: string;
  name: string;
  type: string;
  goal: string;
  raised: string;
  donorCount: number;
  startDate: string;
  endDate: string;
  description: string;
}

export default function DeleteCampaignPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [campaignData, setCampaignData] = useState<CampaignData>({
    id: "",
    name: "",
    type: "",
    goal: "",
    raised: "",
    donorCount: 0,
    startDate: "",
    endDate: "",
    description: ""
  });
  
  // Fetch campaign data
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) {
        router.push('/campaigns/ongoing');
        return;
      }
      
      setIsLoading(true);
      try {
        // In a real app, you would fetch data from your API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock campaign data
        const mockData: CampaignData = {
          id: campaignId,
          name: campaignId === "CAM-001" ? "Dates Challenge" : "She-Fine Campus Masjid Construction",
          type: campaignId === "CAM-001" ? "Fundraising" : "Building",
          goal: campaignId === "CAM-001" ? "₹50,000" : "₹100,000",
          raised: campaignId === "CAM-001" ? "₹20,000" : "₹30,000",
          donorCount: campaignId === "CAM-001" ? 45 : 67,
          startDate: campaignId === "CAM-001" ? "2023-11-01" : "2023-10-15",
          endDate: campaignId === "CAM-001" ? "2023-12-15" : "2024-02-28",
          description: campaignId === "CAM-001" 
            ? "Special campaign focused on fundraising during specific periods." 
            : "An ongoing project for the construction of a campus mosque."
        };
        
        setCampaignData(mockData);
      } catch (error) {
        console.error("Error loading campaign data:", error);
        alert("Failed to load campaign data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCampaignData();
  }, [campaignId, router]);
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (confirmText !== campaignData.name) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // In a real app, you would send a delete request to your API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show confirmation screen
      setShowConfirmation(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/campaigns/ongoing');
      }, 3000);
      
    } catch (error) {
      console.error("Error deleting campaign:", error);
      alert("Failed to delete campaign. Please try again.");
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-red-500 animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (showConfirmation) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Campaign Deleted Successfully</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The campaign &quot;{campaignData.name}&quot; has been permanently deleted.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Redirecting you back to the campaigns page...
          </p>
          <div className="flex justify-center">
            <Link 
              href="/campaigns/ongoing" 
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-sm font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Return to Campaigns
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
            <Trash2 className="mr-2 h-6 w-6 text-red-500" />
            Delete Campaign
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Permanently remove this campaign and all associated data
          </p>
        </div>
        
        <Link 
          href="/campaigns/ongoing" 
          className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Campaigns
        </Link>
      </div>
      
      {/* Delete warning card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-red-300 dark:border-red-900/50 shadow-xl overflow-hidden">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-200 dark:border-red-900/30">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-base font-medium text-red-800 dark:text-red-300">Warning: This action cannot be undone</h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">You are about to delete the following campaign:</h4>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Campaign ID</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white">{campaignData.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Campaign Name</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white">{campaignData.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white">{campaignData.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white">{campaignData.startDate}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Goal</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white">{campaignData.goal}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Raised</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white">{campaignData.raised}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">This will delete:</h4>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                  <li>All campaign information and settings</li>
                  <li>Donation records associated with this campaign</li>
                  <li>Campaign analytics and performance data</li>
                  <li>Campaign media and visual assets</li>
                </ul>
                <p className="mt-2 text-sm text-red-700 dark:text-red-400">Donor records will be preserved in the central database.</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type <span className="font-bold">{campaignData.name}</span> to confirm deletion:
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-red-300 dark:border-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              placeholder={`Type "${campaignData.name}" to confirm`}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Link
              href={`/campaigns/edit?id=${campaignId}`}
              className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
            >
              Cancel
            </Link>
            
            <button
              onClick={handleDeleteConfirm}
              disabled={confirmText !== campaignData.name || isDeleting}
              className={`px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium shadow-lg flex items-center ${
                confirmText !== campaignData.name || isDeleting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-red-600 hover:to-red-700'
              } transition-all duration-300`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Permanently Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}