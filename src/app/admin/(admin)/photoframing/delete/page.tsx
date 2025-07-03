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
    Image as ImageIcon
} from "lucide-react";
import { useFrameStore } from "@/store/frameStore";

// Define proper type interfaces
interface TextSettings {
    x: number;
    y: number;
    width: number;
    height: number;
    font: string;
    size: number;
    color: string;
}

interface PlacementCoords {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Dimensions {
    width: number;
    height: number;
}

interface Frame {
    _id: string;
    name: string;
    imageUrl: string;
    dimensions: Dimensions;
    placementCoords: PlacementCoords;
    textSettings: TextSettings;
}

interface FrameStore {
    frames: Frame[];
    isLoading: boolean;
    error: string | null;
    fetchFrames: () => Promise<void>;
    deleteFrame: (frameId: string) => void;
}

export default function DeleteFramePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const frameId = searchParams.get('id');

    const { frames, deleteFrame, fetchFrames } = useFrameStore() as FrameStore;

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [confirmText, setConfirmText] = useState<string>("");
    const [frame, setFrame] = useState<Frame | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState<boolean>(false);

    useEffect(() => {
        const fetchFrameData = async () => {
            console.log('Fetching frame data for ID:', frameId); // Debug log

            if (!frameId) {
                console.log('No frameId provided, redirecting...');
                router.push('/admin/photoframing/all');
                return;
            }

            try {
                setIsLoading(true);

                // If frames are not loaded in the store, fetch them
                if (frames.length === 0) {
                    console.log('Frames not in store, fetching all frames...');
                    await fetchFrames();
                }

                // Find the frame in the store
                const foundFrame = frames.find(f => f._id === frameId);
                console.log('Found frame in store:', foundFrame); // Debug log

                if (foundFrame) {
                    setFrame(foundFrame);
                } else {
                    console.log('Frame not in store, fetching from API...');
                    const response = await fetch(`/api/frames/${frameId}`,{
                        headers: {
                            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                          },
                    });
                    const data = await response.json();
                    console.log('API response:', data); // Debug log

                    if (data.success) {
                        setFrame(data.data);
                    } else {
                        // Instead of throwing, set frame to null and let UI handle it
                        console.log('Frame not found in API:', data.message);
                        setFrame(null); // This will trigger the "Frame Not Found" UI
                    }
                }
            } catch (error) {
                console.error('Error fetching frame:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFrameData();
    }, [frameId, frames, fetchFrames, router]);

    const handleDeleteConfirm = async () => {
        if (!frame || confirmText !== frame.name || !frameId) {
            return;
        }

        setIsDeleting(true);

        try {
            console.log(`Attempting to delete frame with ID: ${frameId}`);
            
            const response = await fetch(`/api/frames/${frameId}`, {
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
                throw new Error(data.message || 'Failed to delete frame');
            }

            deleteFrame(frameId);
            setShowConfirmation(true);

            setTimeout(() => {
                router.push('/admin/photoframing/all');
            }, 3000);
        } catch (error) {
            console.error('Error deleting frame:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
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
                            href="/admin/photoframing/all"
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center shadow-lg"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Return to All Frames
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
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Frame Deleted Successfully</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        The frame has been permanently deleted.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Redirecting you back to the frames page...
                    </p>
                    <div className="flex justify-center">
                        <Link
                            href="/admin/photoframing/all"
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center shadow-lg"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Return to Frames
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!frame) {
        return (
            <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-300 dark:border-amber-900/50 shadow-xl p-8 max-w-md w-full text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-3">
                            <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Frame Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        The frame you are trying to delete could not be found.
                    </p>
                    <div className="flex justify-center">
                        <Link
                            href="/admin/photoframing/all"
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center shadow-lg"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Return to All Frames
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
                        Delete Frame
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Permanently remove this frame and all associated data
                    </p>
                </div>
                <Link
                    href="/admin/photoframing/all"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-300 flex items-center"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Frames
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
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">You are about to delete the following frame:</h4>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 aspect-video relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                    {imageError ? (
                                        <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-800 p-4">
                                            <div className="text-center">
                                                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Frame Image
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <NextImage
                                            src={frame.imageUrl}
                                            alt={frame.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            style={{ objectFit: "contain" }}
                                            className="rounded-lg"
                                            onError={() => setImageError(true)}
                                        />
                                    )}
                                </div>
                                <div className="w-full md:w-2/3">
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Frame Name</dt>
                                            <dd className="mt-1 text-sm text-gray-800 dark:text-white">{frame.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</dt>
                                            <dd className="mt-1 text-sm text-gray-800 dark:text-white">
                                                {frame.dimensions.width} × {frame.dimensions.height}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Placement</dt>
                                            <dd className="mt-1 text-sm text-gray-800 dark:text-white">
                                                {frame.placementCoords.width} × {frame.placementCoords.height}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Text</dt>
                                            <dd className="mt-1 text-sm text-gray-800 dark:text-white">
                                                {frame.textSettings.font}, {frame.textSettings.size}px
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <Info className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">This will permanently delete:</h4>
                                <ul className="mt-2 text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                                    <li>The frame template and all settings</li>
                                    <li>The frame image from storage</li>
                                    <li>Any associations with this frame</li>
                                </ul>
                                <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                                    Users will no longer be able to create photos with this frame.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Type <span className="font-bold">{frame.name}</span> to confirm deletion:
                        </label>
                        <input
                            type="text"
                            id="confirmText"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-red-300 dark:border-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                            placeholder={`Type "${frame.name}" to confirm`}
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Link
                            href="/admin/photoframing/all"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-300 flex items-center"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={confirmText !== frame.name || isDeleting}
                            className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-lg flex items-center ${
                                confirmText !== frame.name || isDeleting
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