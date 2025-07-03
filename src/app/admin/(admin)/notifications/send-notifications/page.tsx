"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Send,
  ChevronDown,
  UploadCloud,
  Eye,
  CheckCircle,
  AlertCircle,
  Edit,
  RefreshCw,
  Image
} from "lucide-react";

// Define notification groups
const USER_GROUPS = [
  { id: "all", label: "All App Users", description: "Send to all users who have installed the app" },
  { id: "subscribers", label: "Subscription Users", description: "Users who have subscribed to notifications" },
  { id: "boxholders", label: "Box Holders", description: "Users who have donation boxes" },
  { id: "custom", label: "Custom Selection", description: "Select specific users or upload a CSV" },
];

// Define notification channels
const NOTIFICATION_CHANNELS = [
  { id: "push", label: "Push Notification", icon: <Bell className="h-4 w-4" /> },
  { id: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
];

// Define interfaces
interface Template {
  _id: string;
  name: string;
  type: string;
  subject?: string;
  title?: string;
  body: string;
  imageUrl?: string;
}

interface NotificationPayload {
  title?: string;
  body: string;
  imageUrl?: string;
  subject?: string;
  userGroup: string;
  channel: string;
  templateId?: string;
  scheduledFor?: string;
  customData?: {
    phones?: string[];
    emails?: string[];
  };
}

interface UserCounts {
  all: number;
  subscribers: number;
  boxholders: number;
}

export default function SendNotificationsPage() {
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("push");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [templateDetails, setTemplateDetails] = useState<Template | null>(null);
  const [customEmails, setCustomEmails] = useState<string>("");
  const [customPhones, setCustomPhones] = useState<string>("");
  const [csvData, setCsvData] = useState<string[] | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [scheduleNotification, setScheduleNotification] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("12:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [userCounts, setUserCounts] = useState<UserCounts>({ all: 0, subscribers: 0, boxholders: 0 });
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [actualSentCount, setActualSentCount] = useState<number | null>(null);

  // Custom notification content state
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");

  // Fetch user counts from API
  const fetchUserCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const response = await fetch('/api/notifications/user-counts', {
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user counts');
      }

      const data = await response.json();
      if (data.success && data.counts) {
        setUserCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching user counts:', error);
    } finally {
      setIsLoadingCounts(false);
    }
  }, []);

  // Fetch user counts on mount
  useEffect(() => {
    fetchUserCounts();
  }, [fetchUserCounts]);

  // Fetch templates by type
  const fetchTemplates = useCallback(async (type: string) => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch(`/api/notifications/templates?type=${type}`, {
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
      
      // Reset selected template
      setSelectedTemplate("");
      setTemplateDetails(null);
      setShowTemplateDetails(false);
      
      // Reset custom content when changing channel
      resetCustomContent();
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []); // Empty dependency array since no external dependencies are used

  // Fetch templates on load
  useEffect(() => {
    if (selectedChannel) {
      fetchTemplates(selectedChannel);
    }
  }, [selectedChannel, fetchTemplates]); // Added fetchTemplates as dependency

  // Reset custom content fields
  const resetCustomContent = () => {
    setCustomTitle("");
    setCustomBody("");
    setCustomSubject("");
    setCustomImageUrl("");
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Find template details
    const template = templates.find(t => t._id === templateId);
    if (template) {
      setTemplateDetails(template);
      setShowTemplateDetails(true);
      
      // Pre-fill custom fields with template data
      if (template.title) setCustomTitle(template.title);
      if (template.body) setCustomBody(template.body);
      if (template.subject) setCustomSubject(template.subject);
      if (template.imageUrl) setCustomImageUrl(template.imageUrl);
    } else {
      setTemplateDetails(null);
      setShowTemplateDetails(false);
    }
  };

  // Handle file upload click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const rows = text.split('\n').filter(row => row.trim());
        setCsvData(rows);

        // Determine if it's an email or phone CSV based on first row
        const firstRow = rows[0]?.trim();
        if (firstRow && firstRow.includes('@')) {
          setCustomEmails(rows.join('\n'));
          setCustomPhones('');
        } else {
          setCustomPhones(rows.join('\n'));
          setCustomEmails('');
        }
      }
    };
    reader.readAsText(file);
  };

  // Get recipient count
  const getRecipientCount = (): string => {
    if (selectedGroup === "custom") {
      let count = 0;
      if (selectedChannel === "email" && customEmails) {
        count = customEmails.split('\n').filter(email => email.trim()).length;
      } else if ((selectedChannel === "whatsapp" || selectedChannel === "push") && customPhones) {
        count = customPhones.split('\n').filter(phone => phone.trim()).length;
      }
      return count.toString();
    }
    
    // Use real counts from API for other groups
    if (isLoadingCounts) {
      return "Loading...";
    }
    
    if (selectedGroup === "all") return userCounts.all.toString();
    if (selectedGroup === "subscribers") return userCounts.subscribers.toString();
    if (selectedGroup === "boxholders") return userCounts.boxholders.toString();
    
    return "0";
  };

  // Validate form
  const validateForm = (): { valid: boolean; message: string } => {
    // Check for selected channel
    if (!selectedChannel) {
      return { valid: false, message: "Please select a notification channel" };
    }

    // Validate content
    if (selectedChannel === "push") {
      if (!customTitle) {
        return { valid: false, message: "Push notification title is required" };
      }
      if (!customBody) {
        return { valid: false, message: "Push notification body is required" };
      }
    } else if (selectedChannel === "email") {
      if (!customSubject) {
        return { valid: false, message: "Email subject is required" };
      }
      if (!customBody) {
        return { valid: false, message: "Email body is required" };
      }
    } else if (selectedChannel === "whatsapp") {
      if (!customBody) {
        return { valid: false, message: "WhatsApp message body is required" };
      }
    }

    // Validate recipient selection
    if (selectedGroup === "custom") {
      if (selectedChannel === "email" && !customEmails.trim()) {
        return { valid: false, message: "Please enter recipient emails or upload a CSV file" };
      }
      if ((selectedChannel === "whatsapp" || selectedChannel === "push") && !customPhones.trim()) {
        return { valid: false, message: "Please enter recipient phone numbers or upload a CSV file" };
      }
    }

    // Validate scheduled date/time if scheduling is enabled
    if (scheduleNotification) {
      if (!scheduledDate) {
        return { valid: false, message: "Please select a date for the scheduled notification" };
      }
      
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        return { valid: false, message: "Scheduled time must be in the future" };
      }
    }

    return { valid: true, message: "" };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSuccessMessage("");
    setErrorMessage("");
    setActualSentCount(null);
    
    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }
    
    setIsSubmitting(true);
    
    // Build notification payload
    const payload: NotificationPayload = {
      userGroup: selectedGroup,
      channel: selectedChannel,
      body: customBody,
      templateId: selectedTemplate || undefined,
    };
    
    // Add channel-specific fields
    if (selectedChannel === "push") {
      payload.title = customTitle;
      payload.imageUrl = customImageUrl || undefined;
    } else if (selectedChannel === "email") {
      payload.subject = customSubject;
    }
    
    // Add scheduled time if enabled
    if (scheduleNotification && scheduledDate) {
      payload.scheduledFor = `${scheduledDate}T${scheduledTime}:00`;
    }
    
    // Add custom recipient data
    if (selectedGroup === "custom") {
      payload.customData = {};
      
      if (selectedChannel === "email" && customEmails.trim()) {
        payload.customData.emails = customEmails.split('\n').filter(email => email.trim());
      }
      
      if ((selectedChannel === "whatsapp" || selectedChannel === "push") && customPhones.trim()) {
        payload.customData.phones = customPhones.split('\n').filter(phone => phone.trim());
      }
    }
    
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send notification');
      }
      
      const data = await response.json();
      
      // Extract actual number of sent notifications if available
      if (data.notification && data.notification.sentCount !== undefined) {
        setActualSentCount(data.notification.sentCount);
      }
      
      if (scheduleNotification) {
        setSuccessMessage(`Notification scheduled successfully for ${new Date(payload.scheduledFor!).toLocaleString()}`);
      } else {
        if (actualSentCount !== null) {
          setSuccessMessage(`Notification sent successfully to ${actualSentCount} recipients!`);
        } else {
          setSuccessMessage(`Notification sent successfully to ${getRecipientCount()} recipients!`);
        }
      }
      
      // Reset form
      setSelectedTemplate("");
      setTemplateDetails(null);
      setShowTemplateDetails(false);
      resetCustomContent();
      setCsvData(null);
      setUploadedFileName("");
      setScheduleNotification(false);
      setScheduledDate("");
      setScheduledTime("12:00");
    } catch (error) {
      console.error('Error sending notification:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  // Format date as yyyy-MM-dd for input
  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Render channel icon
  const renderChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push':
        return <Bell className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'email':
        return <Mail className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get channel label
  const getChannelLabel = (channelId: string): string => {
    const channel = NOTIFICATION_CHANNELS.find(c => c.id === channelId);
    return channel ? channel.label : channelId;
  };

  // Get group label
  const getGroupLabel = (groupId: string): string => {
    const group = USER_GROUPS.find(g => g.id === groupId);
    return group ? group.label : groupId;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Send Notifications</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and send notifications to your users across multiple channels
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Link
            href="/admin/notifications/create-template"
            className="px-4 py-2 bg-white/10 text-black dark:text-white backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" /> Manage Templates
          </Link>
          <Link
            href="/admin/notifications/track-notifications"
            className="px-4 py-2 bg-white/10 text-black dark:text-white backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Link>
        </div>
      </div>

      {/* Success and error messages */}
      {errorMessage && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Main form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Options */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Notification Settings
            </h3>

            {/* Notification channel selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notification Channel
              </label>
              <div className="grid grid-cols-1 gap-2">
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border 
                      ${selectedChannel === channel.id
                        ? "bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                        : "bg-white/5 border-gray-200 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      }`}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                        {channel.icon}
                      </div>
                      <span>{channel.label}</span>
                    </div>
                    {selectedChannel === channel.id && (
                      <div className="h-4 w-4 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* User group selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Recipients
              </label>
              <div className="grid grid-cols-1 gap-2">
                {USER_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedGroup(group.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border 
                      ${selectedGroup === group.id
                        ? "bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                        : "bg-white/5 border-gray-200 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{group.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{group.description}</span>
                      {group.id !== "custom" && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          {isLoadingCounts ? (
                            <span className="flex items-center">
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Loading...
                            </span>
                          ) : (
                            `${group.id === "all" ? userCounts.all : 
                              group.id === "subscribers" ? userCounts.subscribers : 
                              userCounts.boxholders} users`
                          )}
                        </span>
                      )}
                    </div>
                    {selectedGroup === group.id && (
                      <div className="h-4 w-4 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom recipients section */}
            {selectedGroup === "custom" && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/30">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {selectedChannel === "email" ? "Recipient Emails" : "Recipient Phone Numbers"}
                </h4>
                
                {/* Text input for emails/phones */}
                <textarea
                  value={selectedChannel === "email" ? customEmails : customPhones}
                  onChange={(e) => {
                    if (selectedChannel === "email") {
                      setCustomEmails(e.target.value);
                    } else {
                      setCustomPhones(e.target.value);
                    }
                  }}
                  placeholder={selectedChannel === "email" 
                    ? "Enter emails (one per line) or upload CSV" 
                    : "Enter phone numbers (one per line) or upload CSV"}
                  className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 mb-3"
                  rows={4}
                />
                
                {/* File upload button */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                  >
                    <UploadCloud className="h-4 w-4 mr-2" /> Upload CSV File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {uploadedFileName && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Uploaded: {uploadedFileName} ({csvData?.length || 0} recipients)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scheduling options */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="scheduleToggle"
                  checked={scheduleNotification}
                  onChange={() => setScheduleNotification(!scheduleNotification)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="scheduleToggle" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Schedule for later
                </label>
              </div>
              
              {scheduleNotification && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/30 space-y-3">
                  <div>
                    <label htmlFor="scheduleDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="scheduleDate"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={getFormattedDate()}
                      className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="scheduleTime" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      id="scheduleTime"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle column - Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Notification Content
              </h3>
              <button
                type="button"
                onClick={togglePreviewMode}
                className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-xs font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
              >
                <Eye className="h-3 w-3 mr-1" /> {previewMode ? "Edit" : "Preview"}
              </button>
            </div>

            {!previewMode ? (
              <form onSubmit={handleSubmit}>
                {/* Template selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Template (Optional)
                  </label>
                  
                  <div className="relative">
                    <select
                     value={selectedTemplate}
                     onChange={(e) => handleTemplateSelect(e.target.value)}
                     className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200 appearance-none pr-10"
                   >
                     <option value="">-- Select a template --</option>
                     {templates.map((template) => (
                       <option key={template._id} value={template._id}>
                         {template.name}
                       </option>
                     ))}
                   </select>
                   <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                     <ChevronDown className="h-4 w-4 text-gray-500" />
                   </div>
                 </div>
                 
                 {isLoadingTemplates && (
                   <div className="mt-2 flex items-center text-xs text-gray-500">
                     <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Loading templates...
                   </div>
                 )}
                 
                 {templates.length === 0 && !isLoadingTemplates && (
                   <div className="mt-2 text-xs text-amber-500 dark:text-amber-400">
                     No templates found for {getChannelLabel(selectedChannel)}. <Link href="/admin/notifications/create-template" className="underline">Create one</Link>
                   </div>
                 )}
               </div>

               {/* Template details */}
               {showTemplateDetails && templateDetails && (
                 <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/30">
                   <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                     {renderChannelIcon(templateDetails.type)}
                     <span className="ml-2">Template: {templateDetails.name}</span>
                   </h4>
                   
                   {templateDetails.type === 'push' && templateDetails.title && (
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                       <span className="font-medium">Title:</span> {templateDetails.title}
                     </p>
                   )}
                   
                   {templateDetails.type === 'email' && templateDetails.subject && (
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                       <span className="font-medium">Subject:</span> {templateDetails.subject}
                     </p>
                   )}
                   
                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                     <span className="font-medium">Content:</span>
                   </p>
                   <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-line max-h-40 overflow-y-auto">
                     {templateDetails.body}
                   </div>
                   
                   {templateDetails.type === 'push' && templateDetails.imageUrl && (
                     <div className="mt-2 flex items-center">
                      <Image 
                        className="h-4 w-4 text-gray-400 mr-1" 
                        aria-label="Template preview icon"
                      />
                       <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{templateDetails.imageUrl}</span>
                     </div>
                   )}
                 </div>
               )}

               {/* Custom content fields */}
               <div className="space-y-4">
                 {/* Show fields based on selected channel */}
                 {selectedChannel === "push" && (
                   <>
                     <div>
                       <label htmlFor="customTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                         Notification Title*
                       </label>
                       <input
                         type="text"
                         id="customTitle"
                         value={customTitle}
                         onChange={(e) => setCustomTitle(e.target.value)}
                         placeholder="Enter notification title"
                         className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                       />
                     </div>
                     <div>
                       <label htmlFor="customImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                         Image URL (Optional)
                       </label>
                       <input
                         type="text"
                         id="customImageUrl"
                         value={customImageUrl}
                         onChange={(e) => setCustomImageUrl(e.target.value)}
                         placeholder="Enter URL for notification image"
                         className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                       />
                     </div>
                   </>
                 )}
                 
                 {selectedChannel === "email" && (
                   <div>
                     <label htmlFor="customSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       Email Subject*
                     </label>
                     <input
                       type="text"
                       id="customSubject"
                       value={customSubject}
                       onChange={(e) => setCustomSubject(e.target.value)}
                       placeholder="Enter email subject line"
                       className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                     />
                   </div>
                 )}
                 
                 <div>
                   <label htmlFor="customBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {selectedChannel === "email" ? "Email Body*" : selectedChannel === "whatsapp" ? "Message Content*" : "Notification Body*"}
                   </label>
                   <textarea
                     id="customBody"
                     value={customBody}
                     onChange={(e) => setCustomBody(e.target.value)}
                     placeholder={selectedChannel === "whatsapp" ? "Enter message content. You can use placeholders like {name}, {amount}, etc." : "Enter content"}
                     className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                     rows={6}
                   ></textarea>
                   
                   {selectedChannel === "whatsapp" && (
                     <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                       Available placeholders: {"{name}"}, {"{amount}"}, {"{id}"}, {"{date}"}, {"{type}"}
                     </div>
                   )}
                 </div>
               </div>

               {/* Summary section */}
               <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/30">
                 <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                   Notification Summary
                 </h4>
                 
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="text-gray-500 dark:text-gray-400">Channel:</span>
                     <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                       {renderChannelIcon(selectedChannel)}
                       <span className="ml-1">{getChannelLabel(selectedChannel)}</span>
                     </span>
                   </div>
                   
                   <div className="flex justify-between">
                     <span className="text-gray-500 dark:text-gray-400">Recipients:</span>
                     <span className="font-medium text-gray-700 dark:text-gray-300">
                       {getGroupLabel(selectedGroup)} ({getRecipientCount()})
                     </span>
                   </div>
                   
                   {scheduleNotification && scheduledDate && (
                     <div className="flex justify-between">
                       <span className="text-gray-500 dark:text-gray-400">Scheduled for:</span>
                       <span className="font-medium text-gray-700 dark:text-gray-300">
                         {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                       </span>
                     </div>
                   )}
                 </div>
               </div>

               {/* Form actions */}
               <div className="mt-6 flex justify-end">
                 <button
                   type="submit"
                   disabled={isSubmitting}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                     isSubmitting
                       ? "bg-gray-400 text-white cursor-not-allowed"
                       : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                   }`}
                 >
                   {isSubmitting ? (
                     <>
                       <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                       {scheduleNotification ? "Scheduling..." : "Sending..."}
                     </>
                   ) : (
                     <>
                       <Send className="h-4 w-4 mr-2" />
                       {scheduleNotification ? "Schedule Notification" : "Send Notification"}
                     </>
                   )}
                 </button>
               </div>
             </form>
           ) : (
             // Preview Mode
             <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/30">
               <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-between">
                 <span>Notification Preview</span>
                 <button
                   onClick={togglePreviewMode}
                   className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                 >
                   Back to Edit
                 </button>
               </h4>
               
               {selectedChannel === "push" && (
                 <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                   <div className="p-4">
                     <div className="flex justify-between items-start">
                       <div className="flex items-center">
                         <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                           <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">AIC</span>
                         </div>
                         <div className="ml-3">
                           <p className="text-sm font-bold text-gray-900 dark:text-white">Akode Islamic Centre</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">Just now</p>
                         </div>
                       </div>
                     </div>
                     <h3 className="font-bold text-gray-800 dark:text-white mt-3">
                       {customTitle || "(No title)"}
                     </h3>
                     <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                       {customBody || "(No content)"}
                     </p>
                     {customImageUrl && (
                       <div className="mt-3 bg-gray-200 dark:bg-gray-700 h-40 rounded-lg flex items-center justify-center">
                         <Image 
                           className="h-6 w-6 text-gray-400" 
                           aria-label="Image preview placeholder"
                         />
                         <span className="ml-2 text-sm text-gray-500">Image Preview</span>
                       </div>
                     )}
                   </div>
                 </div>
               )}
               
               {selectedChannel === "whatsapp" && (
                 <div className="max-w-sm mx-auto bg-green-50 dark:bg-green-900/20 rounded-xl shadow-md overflow-hidden border border-green-200 dark:border-green-800/30">
                   <div className="bg-green-500 dark:bg-green-700 p-3 text-white flex items-center">
                     <MessageSquare className="h-5 w-5 mr-2" />
                     <span className="font-medium">WhatsApp Message</span>
                   </div>
                   <div className="p-4">
                     <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                       <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                         {customBody || "(No message content)"}
                       </p>
                       <p className="text-xs text-right text-gray-500 mt-2">
                         {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         <span className="ml-1 text-green-500">✓✓</span>
                       </p>
                     </div>
                   </div>
                 </div>
               )}
               
               {selectedChannel === "email" && (
                 <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                     <Mail className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                     <div>
                       <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                         From: Akode Islamic Centre 
                       </p>
                       <p className="text-xs text-gray-500 dark:text-gray-400">
                         To: {getGroupLabel(selectedGroup)}
                       </p>
                       <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                         Subject: {customSubject || "(No subject)"}
                       </p>
                     </div>
                   </div>
                   <div className="p-4">
                     <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-60">
                       <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                         {customBody || "(No email content)"}
                       </p>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
       </div>
     </div>
   </div>
 );
}