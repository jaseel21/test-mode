"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Info,
  Loader2,
  FileText,
  Image as ImageIcon,
  Film
} from "lucide-react";
import { useStatusStore } from "@/store/statusStore";
import { Status } from "@/lib/types";

export default function DeleteStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusId = searchParams.get('id');

  const { statuses, deleteStatus, fetchStatuses } = useStatusStore(); // Removed storeLoading

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatusData = async () => {
      console.log('Fetching status data for ID:', statusId);

      if (!statusId) {
        console.log('No statusId provided, redirecting...');
        router.push('/admin/social-status/all');
        return;
      }

      try {
        setIsLoading(true);

        // If statuses are not loaded in the store, fetch them
        if (statuses.length === 0) {
          console.log('Statuses not in store, fetching all statuses...');
          await fetchStatuses();
        }

        // Find the status in the store
        const foundStatus = statuses.find(s => s._id === statusId);
        console.log('Found status in store:', foundStatus);

        if (foundStatus) {
          setStatus(foundStatus);
        } else {
          console.log('Status not in store, fetching from API...');
          const response = await fetch(`/api/statuses/${statusId}`, {
            headers: {
              'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
            },
          });
          const data = await response.json();
          console.log('API response:', data);

          if (data.success) {
            setStatus(data.data);
          } else {
            console.log('Status not found in API:', data.message);
            setStatus(null);
          }
        }
      } catch (error) {
        console.error('Error fetching status:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusData();
  }, [statusId, statuses, fetchStatuses, router]);

  const handleDeleteConfirm = async () => {
    if (!status || confirmText !== status.content || !statusId) {
      return;
    }

    setIsDeleting(true);

    try {
      console.log(`Attempting to delete status with ID: ${statusId}`);
      
      const response = await fetch(`/api/statuses/${statusId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });

      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete status');
      }

      deleteStatus(statusId);
      setShowConfirmation(true);

      setTimeout(() => {
        router.push('/admin/social-status/all');
      }, 3000);
    } catch (error) {
      console.error('Error deleting status:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsDeleting(false);
    }
  };

  // Helper function to render appropriate status content preview
  const renderStatusContent = () => {
    if (!status) return null;

    switch (status.type) {
      case 'text':
        return (
          <div 
            className="rounded-lg overflow-hidden p-6 flex items-center justify-center max-w-md mx-auto aspect-square"
            style={{ 
              backgroundColor: status.backgroundColor || '#111827', 
              color: status.textColor || '#ffffff',
              fontFamily: status.fontFamily || 'Arial'
            }}
          >
            <p 
              className="text-center" 
              style={{ fontSize: `${status.fontSize || 24}px` }}
            >
              {status.content}
            </p>
          </div>
        );
      
      case 'image':
        return status.mediaUrl && !imageError ? (
          <div className="rounded-lg overflow-hidden max-w-md mx-auto flex justify-center">
            <NextImage
              src={status.mediaUrl}
              alt={status.content}
              width={400}
              height={400}
              className="max-h-80 w-auto object-contain rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg max-w-md mx-auto aspect-square flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-20 w-20 text-gray-400 mx-auto" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {imageError ? "Failed to load image" : "No image available"}
              </p>
            </div>
          </div>
        );
      
      case 'video':
        return status.mediaUrl && !imageError ? (
          <div className="rounded-lg overflow-hidden max-w-md mx-auto">
            <video
              src={status.mediaUrl}
              controls
              className="max-h-80 w-auto mx-auto rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg max-w-md mx-auto aspect-video flex items-center justify-center">
            <div className="text-center">
              <Film className="h-20 w-20 text-gray-400 mx-auto" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {imageError ? "Failed to load video" : "No video available"}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 max-w-md mx-auto flex items-center justify-center">
            <p className="text-gray-500">{status.content}</p>
          </div>
        );
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

  if (error) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-300 dark:border-red-900/50 shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <div className="flex justify-center">
            <Link
              href="/admin/social-status/all"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Return to All Statuses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Status Deleted Successfully</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The social status has been permanently deleted.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Redirecting you back to the statuses page...
          </p>
          <div className="flex justify-center">
            <Link
              href="/admin/social-status/all"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Return to All Statuses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-300 dark:border-amber-900/50 shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-3">
              <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Status Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The status you are trying to delete could not be found.
          </p>
          <div className="flex justify-center">
            <Link
              href="/admin/social-status/all"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Return to All Statuses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
            <Trash2 className="mr-2 h-6 w-6 text-red-500" />
            Delete Social Status
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Permanently remove this status and all associated data
          </p>
        </div>
        <Link
          href="/admin/social-status/all"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-300 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Statuses
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-300 dark:border-red-900/50 shadow-xl overflow-hidden">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-200 dark:border-red-900/30">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-base font-medium text-red-800 dark:text-red-300">Warning: This action cannot be undone</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">You are about to delete the following status:</h4>
            
            {renderStatusContent()}
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mt-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status Type</dt>
                  <dd className="mt-1 text-sm flex items-center text-gray-800 dark:text-white">
                    {status.type === 'text' ? (
                      <>
                        <FileText className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="capitalize">Text Status</span>
                      </>
                    ) : status.type === 'image' ? (
                      <>
                        <ImageIcon className="h-4 w-4 mr-1 text-green-500" />
                        <span className="capitalize">Image Status</span>
                      </>
                    ) : (
                      <>
                        <Film className="h-4 w-4 mr-1 text-purple-500" />
                        <span className="capitalize">Video Status</span>
                      </>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white">{status.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Usage Count</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white">{status.usageCount || 0} uses</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      status.isActive 
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400" 
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                    }`}>
                      {status.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {status.featured && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                        Featured
                      </span>
                    )}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Content</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white">{status.content}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">This will permanently delete:</h4>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                  <li>The status content and settings</li>
                  {(status.type === 'image' || status.type === 'video') && (
                    <li>The {status.type} file from storage</li>
                  )}
                  <li>Usage statistics for this status</li>
                </ul>
                <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                  Users will no longer be able to share or view this status.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type <span className="font-bold italic">&quot;{status.content.length > 30 ? `${status.content.substring(0, 30)}...` : status.content}&quot;</span> to confirm deletion:
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-red-300 dark:border-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 dark:text-gray-200"
              placeholder={`Type "${status.content.length > 30 ? `${status.content.substring(0, 30)}...` : status.content}" to confirm`}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/social-status/all"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-300 flex items-center"
            >
              Cancel
            </Link>
            <button
              onClick={handleDeleteConfirm}
              disabled={confirmText !== status.content || isDeleting}
              className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-lg flex items-center ${
                confirmText !== status.content || isDeleting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-red-700'
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