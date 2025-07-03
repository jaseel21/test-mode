"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    Download,
    Upload,
    AlertCircle,
    CheckCircle,
    Loader2,
    Database,
    Image as ImageIcon,
    Info,
    X,
} from "lucide-react";

export default function BackupRestore() {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isExportingImages, setIsExportingImages] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [backupFile, setBackupFile] = useState(null);
    const [progress, setProgress] = useState({ value: 0, total: 0 });
    const [backupStats, setBackupStats] = useState({
        totalCollections: 0,
        totalDocuments: 0,
        collectionCounts: {},
        lastBackupDate: null,
    });
    const [showConfirmDialog, setShowConfirmDialog] = useState(null);
    const cancelRef = useRef(null);

    useEffect(() => {
        fetchBackupStats();
        return () => {
            cancelRef.current?.abort();
        };
    }, []);

    const fetchBackupStats = async () => {
        try {
            const response = await fetch("/api/backup/stats", {
                headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d" },
            });
            if (!response.ok) throw new Error("Failed to fetch backup statistics");
            const data = await response.json();
            setBackupStats(data);
        } catch (err) {
            console.error("Error fetching backup stats:", err);
        }
    };

    const handleBackup = useCallback(async () => {
        setIsBackingUp(true);
        setError("");
        setSuccess("");
        setProgress({ value: 0, total: 0 });
        cancelRef.current = new AbortController();

        try {
            const response = await fetch("/api/backup", {
                method: "POST",
                headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d" },
                signal: cancelRef.current.signal,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to create backup");

            setSuccess("Backup created successfully! Downloading...");
            const downloadUrl = data.downloadUrl;
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `backup-${new Date().toISOString()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            fetchBackupStats();
        } catch (err) {
            if (err.name === "AbortError") {
                setError("Backup operation cancelled");
            } else {
                setError(err.message || "An error occurred during backup");
            }
        } finally {
            setIsBackingUp(false);
            setProgress({ value: 0, total: 0 });
            cancelRef.current = null;
        }
    }, []);

    const handleExportImages = useCallback(async () => {
        setIsExportingImages(true);
        setError("");
        setSuccess("");
        setProgress({ value: 0, total: 0 });
        cancelRef.current = new AbortController();

        try {
            const response = await fetch("/api/backup/export-images", {
                method: "POST",
                headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d" },
                signal: cancelRef.current.signal,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to export Supabase images");

            setSuccess(
                data.failed > 0
                    ? `Images exported with ${data.failed} errors. ${data.successful} files successful.`
                    : "Images exported successfully! Downloading..."
            );
            if (data.errors) {
                setError(`Errors: ${data.errors.join("; ")}`);
            }
            setProgress({ value: data.successful, total: data.totalProcessed });

            const downloadUrl = data.downloadUrl;
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `images-backup-${new Date().toISOString()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            if (err.name === "AbortError") {
                setError("Image export operation cancelled");
            } else {
                setError(err.message || "An error occurred during image export");
            }
        } finally {
            setIsExportingImages(false);
            setTimeout(() => setProgress({ value: 0, total: 0 }), 2000);
            cancelRef.current = null;
        }
    }, []);

    const handleRestore = useCallback(async () => {
        if (!backupFile) {
            setError("Please select a backup file to restore");
            return;
        }
        setShowConfirmDialog("restore");
    }, [backupFile]);

    const confirmRestore = useCallback(async () => {
        setIsRestoring(true);
        setError("");
        setSuccess("");
        setProgress({ value: 0, total: 0 });
        cancelRef.current = new AbortController();

        try {
            const formData = new FormData();
            formData.append("backupFile", backupFile);

            const response = await fetch("/api/restore", {
                method: "POST",
                headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d" },
                body: formData,
                signal: cancelRef.current.signal,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to restore database");

            setSuccess("Database restored successfully!");
            setBackupFile(null);
            fetchBackupStats();
        } catch (err) {
            if (err.name === "AbortError") {
                setError("Restore operation cancelled");
            } else {
                setError(err.message || "An error occurred during restore");
            }
        } finally {
            setIsRestoring(false);
            setShowConfirmDialog(null);
            setProgress({ value: 0, total: 0 });
            cancelRef.current = null;
        }
    }, [backupFile]);

    const handleRestoreImages = useCallback(async () => {
        if (!backupFile || !backupFile.name.endsWith(".zip")) {
            setError("Please select a valid image backup ZIP file");
            return;
        }
        setShowConfirmDialog("restoreImages");
    }, [backupFile]);

    const confirmRestoreImages = useCallback(async () => {
        setIsRestoring(true);
        setError("");
        setSuccess("");
        setProgress({ value: 0, total: 0 });
        cancelRef.current = new AbortController();

        try {
            const formData = new FormData();
            formData.append("imageBackupFile", backupFile);

            const response = await fetch("/api/restore/images", {
                method: "POST",
                headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d" },
                body: formData,
                signal: cancelRef.current.signal,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to restore images");

            setSuccess(
                data.failed > 0
                    ? `Images restored with ${data.failed} errors. ${data.successful} files successful.`
                    : "Images restored successfully!"
            );
            if (data.errors) {
                setError(`Errors: ${data.errors.join("; ")}`);
            }
            setProgress({ value: data.successful, total: data.totalProcessed });
            setBackupFile(null);
        } catch (err) {
            if (err.name === "AbortError") {
                setError("Image restore operation cancelled");
            } else {
                setError(err.message || "An error occurred during image restore");
            }
        } finally {
            setIsRestoring(false);
            setShowConfirmDialog(null);
            setTimeout(() => setProgress({ value: 0, total: 0 }), 2000);
            cancelRef.current = null;
        }
    }, [backupFile]);

    const handleCancelOperation = () => {
        cancelRef.current?.abort();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && (file.type === "application/json" || file.name.endsWith(".zip"))) {
            setBackupFile(file);
            setError("");
        } else {
            setBackupFile(null);
            setError("Please select a valid JSON or ZIP file");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Custom Progress Bar Component
    const CustomProgress = ({ value, max }) => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        return (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        );
    };

    // Custom Confirmation Dialog Component
    const CustomConfirmDialog = ({
        open,
        onClose,
        onConfirm,
        title,
        description,
    }) => {
        if (!open) return null;
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{description}</p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
                        Database Backup & Restore
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your database and image backups with enhanced features
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle size={16} />
                    {success}
                </div>
            )}

            {progress.total > 0 && (
                <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <div className="flex-1">
                        <p>Processing {progress.value} of {progress.total} files</p>
                        <CustomProgress value={progress.value} max={progress.total} />
                    </div>
                    <button
                        onClick={handleCancelOperation}
                        className="text-red-600 hover:text-red-800 oligomers:text-red-400 dark:hover:text-red-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-500" />
                    Database Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Collections</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{backupStats.totalCollections}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Documents</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{backupStats.totalDocuments}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm p-5 rounded-xl hover:bg-white/30 transition-all duration-300 text-center shadow-lg flex items-center justify-center">
                        <button
                            onClick={fetchBackupStats}
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 text-sm"
                        >
                            <Loader2 className="h-4 w-4" />
                            Refresh Stats
                        </button>
                    </div>
                </div>
                {Object.keys(backupStats.collectionCounts).length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Collection Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {Object.entries(backupStats.collectionCounts).map(([collection, count]) => (
                                <div key={collection} className="flex justify-between text-xs px-3 py-2 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm rounded">
                                    <span className="text-gray-600 dark:text-gray-400">{collection}</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Backup Options</h3>
                    <div className="space-y-5">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-100 dark:border-emerald-800">
                            <h4 className="font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-2">
                                <Download className="h-4 w-4" />
                                Database Backup
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Export your MongoDB database as a JSON file and store it in Supabase storage.
                            </p>
                            <button
                                onClick={handleBackup}
                                disabled={isBackingUp}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isBackingUp
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                                    }`}
                            >
                                {isBackingUp ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Backing up...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Create Backup
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-100 dark:border-purple-800">
                            <h4 className="font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-2">
                                <ImageIcon className="h-4 w-4" />
                                Export Supabase Images
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Download all images from Supabase storage as a ZIP file for backup/migration.
                            </p>
                            <button
                                onClick={handleExportImages}
                                disabled={isExportingImages}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isExportingImages
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                                    }`}
                            >
                                {isExportingImages ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Exporting Images...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="h-4 w-4" />
                                        Export Supabase Images
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Restore Options</h3>
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Upload Backup File
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".json,.zip"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                            />
                            {backupFile && (
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Info className="h-3 w-3" />
                                    Selected: {backupFile.name} ({(backupFile.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-100 dark:border-amber-800">
                            <h4 className="font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-2">
                                <Database className="h-4 w-4" />
                                Restore Database
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                Upload a JSON backup file to restore your MongoDB database.
                            </p>
                            <button
                                onClick={handleRestore}
                                disabled={isRestoring || !backupFile || (backupFile && !backupFile.name.endsWith(".json"))}
                                className={`w-full px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isRestoring || !backupFile || (backupFile && !backupFile.name.endsWith(".json"))
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                    }`}
                            >
                                {isRestoring ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Restoring...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-3 w-3" />
                                        Restore Database
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/30 dark:to-red-900/30 border border-rose-100 dark:border-rose-800">
                            <h4 className="font-medium text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-2">
                                <ImageIcon className="h-4 w-4" />
                                Restore Images
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                Upload a ZIP file to restore images to Supabase storage.
                            </p>
                            <button
                                onClick={handleRestoreImages}
                                disabled={isRestoring || !backupFile || (backupFile && !backupFile.name.endsWith(".zip"))}
                                className={`w-full px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isRestoring || !backupFile || (backupFile && !backupFile.name.endsWith(".zip"))
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600"
                                    }`}
                            >
                                {isRestoring ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Restoring...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-3 w-3" />
                                        Restore Images
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="mt-5 p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            <AlertCircle className="h-3 w-3 inline-block mr-1 text-amber-500" />
                            Restoring will replace all existing data. Make sure you have a backup before proceeding.
                        </p>
                    </div>
                </div>
            </div>

            <CustomConfirmDialog
                open={showConfirmDialog !== null}
                onClose={() => setShowConfirmDialog(null)}
                onConfirm={showConfirmDialog === "restore" ? confirmRestore : confirmRestoreImages}
                title={showConfirmDialog === "restore" ? "Confirm Database Restore" : "Confirm Image Restore"}
                description={`This action will replace all existing ${showConfirmDialog === "restore" ? "database data" : "images"} with the contents of the uploaded file. This cannot be undone. Are you sure you want to proceed?`}
            />
        </div>
    );
}