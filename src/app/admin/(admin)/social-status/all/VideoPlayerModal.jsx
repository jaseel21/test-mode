"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Volume2, VolumeX, Maximize, Minimize, Play, Pause, SkipForward, SkipBack } from "lucide-react";

export default function VideoPlayerModal({ isOpen, onClose, videoUrl, videoTitle }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef(null);
    const modalRef = useRef(null);
    const progressRef = useRef(null);

    useEffect(() => {
        // Auto play when modal opens
        if (isOpen && videoRef.current) {
            setTimeout(() => {
                videoRef.current.play().catch(e => console.log("Auto-play prevented:", e));
            }, 300);
        }

        // Setup keyboard shortcuts
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            
            switch (e.key) {
                case " ": // Space
                    togglePlay();
                    e.preventDefault();
                    break;
                case "Escape":
                    onClose();
                    break;
                case "ArrowRight":
                    skip(10);
                    break;
                case "ArrowLeft":
                    skip(-10);
                    break;
                case "m":
                    toggleMute();
                    break;
                case "f":
                    toggleFullscreen();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, videoRef.current]);

    // Handle closing fullscreen when modal closes
    useEffect(() => {
        if (!isOpen && isFullscreen) {
            document.exitFullscreen().catch(e => console.log("Error exiting fullscreen:", e));
            setIsFullscreen(false);
        }
    }, [isOpen, isFullscreen]);

    if (!isOpen) return null;

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(e => console.log("Playback prevented:", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!modalRef.current) return;

        if (!isFullscreen) {
            if (modalRef.current.requestFullscreen) {
                modalRef.current.requestFullscreen();
            } else if (modalRef.current.webkitRequestFullscreen) {
                modalRef.current.webkitRequestFullscreen();
            } else if (modalRef.current.msRequestFullscreen) {
                modalRef.current.msRequestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    const skip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration);
        }
    };

    const handleProgressClick = (e) => {
        if (!progressRef.current || !videoRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
            <div 
                ref={modalRef}
                className={`relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden bg-black shadow-2xl ${
                    isFullscreen ? 'fixed inset-0 max-w-none rounded-none' : ''
                }`}
            >
                {/* Video container */}
                <div className="relative aspect-video w-full group">
                    {/* Close button */}
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all"
                            title="Close video"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Main video element */}
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full"
                        playsInline
                        onClick={togglePlay}
                        onTimeUpdate={handleTimeUpdate}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                    />

                    {/* Play/Pause overlay */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={togglePlay}
                    >
                        <div className="p-4 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all">
                            {isPlaying ? (
                                <Pause className="h-10 w-10" />
                            ) : (
                                <Play className="h-10 w-10" />
                            )}
                        </div>
                    </div>

                    {/* Video controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Progress bar */}
                        <div 
                            ref={progressRef}
                            className="relative h-1.5 bg-gray-600 rounded-full mb-4 cursor-pointer"
                            onClick={handleProgressClick}
                        >
                            <div 
                                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Play/Pause button */}
                                <button 
                                    onClick={togglePlay}
                                    className="text-white hover:text-emerald-400 transition-colors"
                                    title={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? (
                                        <Pause className="h-5 w-5" />
                                    ) : (
                                        <Play className="h-5 w-5" />
                                    )}
                                </button>

                                {/* Skip backward */}
                                <button 
                                    onClick={() => skip(-10)}
                                    className="text-white hover:text-emerald-400 transition-colors"
                                    title="Rewind 10 seconds"
                                >
                                    <SkipBack className="h-5 w-5" />
                                </button>

                                {/* Skip forward */}
                                <button 
                                    onClick={() => skip(10)}
                                    className="text-white hover:text-emerald-400 transition-colors"
                                    title="Forward 10 seconds"
                                >
                                    <SkipForward className="h-5 w-5" />
                                </button>

                                {/* Time display */}
                                <div className="text-white text-sm">
                                    {formatTime(currentTime)} / {formatTime(duration || 0)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Volume control */}
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={toggleMute}
                                        className="text-white hover:text-emerald-400 transition-colors"
                                        title={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted || volume === 0 ? (
                                            <VolumeX className="h-5 w-5" />
                                        ) : (
                                            <Volume2 className="h-5 w-5" />
                                        )}
                                    </button>
                                    <input 
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-20 accent-emerald-500"
                                    />
                                </div>

                                {/* Fullscreen button */}
                                <button 
                                    onClick={toggleFullscreen}
                                    className="text-white hover:text-emerald-400 transition-colors"
                                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                >
                                    {isFullscreen ? (
                                        <Minimize className="h-5 w-5" />
                                    ) : (
                                        <Maximize className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video title and info */}
                {videoTitle && (
                    <div className="p-4 bg-gray-900 text-white">
                        <h3 className="text-lg font-medium">{videoTitle}</h3>
                        <div className="mt-1 text-xs text-gray-400">
                            Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Space</kbd> to play/pause, 
                            <kbd className="ml-1 px-1.5 py-0.5 bg-gray-700 rounded text-xs">←</kbd><kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">→</kbd> to seek, 
                            <kbd className="ml-1 px-1.5 py-0.5 bg-gray-700 rounded text-xs">F</kbd> for fullscreen, 
                            <kbd className="ml-1 px-1.5 py-0.5 bg-gray-700 rounded text-xs">M</kbd> to mute
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}