"use client";

import React, { useState, useEffect, useRef, MouseEvent } from "react";
import {
  Upload,
  Save,
  X,
  ArrowRight,
  RefreshCw,
  Check,
  Camera,
  CropIcon,
  Info,
  Share2,
  Heart,
  CheckCircle2,
  Search,
  ChevronLeft,
  Eye,
  Share,
  Link as LinkIcon,
  Maximize2
} from "lucide-react";
import NextImage from "next/image"; // Import Next.js Image as NextImage
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface PlacementCoords {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  font: string;
  size: number;
  color: string;
}

interface Frame {
  _id: string;
  name: string;
  imageUrl: string;
  dimensions: {
    width: number;
    height: number;
  };
  placementCoords: PlacementCoords;
  textSettings: TextSettings;
  usageCount?: number;
}

// interface ImagePosition {
//   x: number;
//   y: number;
//   scale: number;
//   width: number;
//   height: number;
// }

const UserPhotoFraming: React.FC = () => {
  // const router = useRouter();
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"select" | "upload" | "crop" | "preview" | "complete">("select");
  // const [copySuccess, setCopySuccess] = useState<boolean>(false);
  // const [hoveredFrame, setHoveredFrame] = useState<string | null>(null);
  const [favoriteFrames, setFavoriteFrames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [shareUrl, setShareUrl] = useState<string>("");
  const [frameCopySuccess, setFrameCopySuccess] = useState<{ [key: string]: boolean }>({});
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const userImgRef = useRef<HTMLImageElement>(null);
  // const imageUrlRef = useRef<HTMLInputElement>(null);

  // const [imagePosition, setImagePosition] = useState<ImagePosition>({
  //   x: 0,
  //   y: 0,
  //   scale: 1,
  //   width: 0,
  //   height: 0
  // });

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Check if the user is on a mobile device
    const checkMobile = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768);
      setIsMobileDevice(isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/frames?activeOnly=true",
          {
            headers: {
              'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          setFrames(data.data);
          if (selectedFrame && !data.data.some((f: { _id: string; }) => f._id === selectedFrame._id)) {
            setSelectedFrame(null);
          }

          const urlParams = new URLSearchParams(window.location.search);
          const frameId = urlParams.get('frame');

          if (frameId) {
            const frameFromUrl = data.data.find((f: { _id: string; }) => f._id === frameId);
            if (frameFromUrl) {
              setSelectedFrame(frameFromUrl);
              setCurrentStep("upload");

              const aspectRatio = frameFromUrl.placementCoords.width / frameFromUrl.placementCoords.height;
              setAspect(aspectRatio);

              // setImagePosition({
              //   x: frameFromUrl.placementCoords.x,
              //   y: frameFromUrl.placementCoords.y,
              //   width: frameFromUrl.placementCoords.width,
              //   height: frameFromUrl.placementCoords.height,
              //   scale: 1
              // });
            }
          }
        } else {
          setError(data.message || "Failed to fetch frames");
        }
      } catch (err) {
        setError("An error occurred while fetching frames");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrames();

    const savedFavorites = localStorage.getItem('favoriteFrames');
    if (savedFavorites) {
      setFavoriteFrames(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteFrames', JSON.stringify(favoriteFrames));
  }, [favoriteFrames]);

  const toggleFavorite = (frameId: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setFavoriteFrames(prev => {
      if (prev.includes(frameId)) {
        return prev.filter(id => id !== frameId);
      } else {
        return [...prev, frameId];
      }
    });
  };

  const handleSelectFrame = (frame: Frame) => {
    setSelectedFrame(frame);
    setCurrentStep("upload");

    // Calculate the correct aspect ratio from the frame's placement coordinates
    const aspectRatio = frame.placementCoords.width / frame.placementCoords.height;
    setAspect(aspectRatio);

    // Store the image position for reference
    // setImagePosition({
    //   x: frame.placementCoords.x,
    //   y: frame.placementCoords.y,
    //   width: frame.placementCoords.width,
    //   height: frame.placementCoords.height,
    //   scale: 1
    // });

    const url = new URL(window.location.href);
    url.searchParams.set('frame', frame._id);
    window.history.pushState({}, '', url);
  };

  const handleCopyFrameLink = (frameId: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const shareLink = `${window.location.origin}${window.location.pathname}?frame=${frameId}`;

    navigator.clipboard.writeText(shareLink).then(
      () => {
        setFrameCopySuccess({ ...frameCopySuccess, [frameId]: true });
        setTimeout(() => {
          setFrameCopySuccess({ ...frameCopySuccess, [frameId]: false });
        }, 2000);
      },
      (err) => {
        console.error('Could not copy link: ', err);
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setError(null);

    const objectUrl = URL.createObjectURL(file);
    setUserImage(objectUrl);
    setCroppedImage(null);
    setCurrentStep("crop");
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!aspect || !selectedFrame) return;

    const { width, height } = e.currentTarget;

    // For mobile devices, ensure we're creating an appropriate initial crop
    // that matches the frame aspect ratio and is properly centered
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90, // Use percentage to be device-independent
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );

    setCrop(crop);
  };

  const handleAutoFit = () => {
    if (!userImgRef.current || !selectedFrame || !aspect) return;

    const image = userImgRef.current;
    const { width, height } = image;

    // Create an optimal crop that fits the entire image while maintaining the frame's aspect ratio
    const optimalCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 100,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );

    setCrop(optimalCrop);
    setCompletedCrop(optimalCrop as unknown as PixelCrop);
  };

  const createCroppedImage = () => {
    if (!userImgRef.current || !completedCrop || !selectedFrame) return;

    const image = userImgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Calculate the scaling factors between the displayed image and its natural size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set the canvas to the exact dimensions needed for the frame placement
    // This ensures the image will fit perfectly in the frame regardless of device
    const targetWidth = selectedFrame.placementCoords.width;
    const targetHeight = selectedFrame.placementCoords.height;

    // Create canvas at the exact dimensions needed for the frame
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Calculate the crop dimensions in the original image
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Enhanced image quality settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the image to fit the placement coordinates exactly
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, targetWidth, targetHeight
    );

    // Use PNG for better quality
    const croppedImageUrl = canvas.toDataURL('image/png', 1.0);
    setCroppedImage(croppedImageUrl);

    return croppedImageUrl;
  };

  const handleApplyCrop = () => {
    if (!completedCrop) {
      setError("Please complete the crop first");
      return;
    }

    const croppedImageUrl = createCroppedImage();
    if (croppedImageUrl) {
      setCroppedImage(croppedImageUrl);
      setCurrentStep("preview");
    }
  };

  useEffect(() => {
    if (currentStep !== "preview" || !canvasRef.current || !selectedFrame || !croppedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    setIsLoading(true);

    // Get device pixel ratio for high-DPI displays
    const pixelRatio = window.devicePixelRatio || 1;

    // Set canvas dimensions based on the frame dimensions
    canvas.width = selectedFrame.dimensions.width * pixelRatio;
    canvas.height = selectedFrame.dimensions.height * pixelRatio;

    // Set the canvas CSS dimensions for proper display
    canvas.style.width = `${selectedFrame.dimensions.width}px`;
    canvas.style.height = `${selectedFrame.dimensions.height}px`;

    // Scale the context to account for the pixel ratio
    ctx.scale(pixelRatio, pixelRatio);

    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const frameImg = new Image();
    const userImg = new Image();

    frameImg.crossOrigin = "anonymous";
    userImg.crossOrigin = "anonymous";

    frameImg.src = selectedFrame.imageUrl;
    userImg.src = croppedImage;

    const loadImages = () => {
      return new Promise<void>((resolve, reject) => {
        let loadedCount = 0;
        const onLoad = () => {
          loadedCount++;
          if (loadedCount === 2) resolve();
        };

        frameImg.onload = onLoad;
        userImg.onload = onLoad;

        frameImg.onerror = () => reject(new Error("Failed to load frame image"));
        userImg.onerror = () => reject(new Error("Failed to load user image"));
      });
    };

    loadImages()
      .then(() => {
        // Clear the entire canvas
        ctx.clearRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);

        const placement = selectedFrame.placementCoords;

        // Draw the user image at exact placement coordinates
        ctx.drawImage(
          userImg,
          0, 0, userImg.width, userImg.height,  // Source rectangle - use the entire cropped image
          placement.x, placement.y, placement.width, placement.height  // Destination rectangle - exact frame placement
        );

        // Draw the frame overlay
        ctx.drawImage(
          frameImg,
          0, 0,
          canvas.width / pixelRatio,
          canvas.height / pixelRatio
        );

        if (userName) {
          const textSettings = selectedFrame.textSettings;

          ctx.font = `${textSettings.size}px ${textSettings.font || 'Arial'}`;
          ctx.fillStyle = textSettings.color || '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textX = textSettings.x + (textSettings.width / 2);
          const textY = textSettings.y + (textSettings.height / 2);

          ctx.fillText(userName, textX, textY);
        }

        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error rendering preview:', error);
        setError('Failed to render preview. Please try again.');
        setIsLoading(false);
      });
  }, [currentStep, croppedImage, selectedFrame, userName]);

  const trackFrameUsage = async (frameId: string): Promise<boolean> => {
    if (!frameId) return false;

    try {
      const response = await fetch(`/api/frames/${frameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ incrementUsage: true }),
      });

      const data = await response.json();

      if (!data.success) {
        console.warn("Failed to track frame usage:", data.message);
        return false;
      }

      console.log('Frame usage tracked successfully:', data.data.usageCount);
      return true;
    } catch (error) {
      console.error("Error tracking frame usage:", error);
      return false;
    }
  };

  const handleGenerateImage = async () => {
    if (!canvasRef.current || !selectedFrame) return;

    setIsProcessing(true);
    try {
      // Use PNG format with maximum quality
      const dataUrl = canvasRef.current.toDataURL("image/png", 1.0);
      setFinalImage(dataUrl);

      const usageTracked = await trackFrameUsage(selectedFrame._id);
      if (!usageTracked) {
        console.warn('Usage tracking failed but image generated successfully');
      }

      // const shareableUrl = window.location.origin + '/share?frame=' + selectedFrame._id;
      // setShareUrl(shareableUrl);

      setCurrentStep("complete");
    } catch (err) {
      setError("Failed to generate image");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUserImage(null);
    setCroppedImage(null);
    setUserName("");
    setFinalImage(null);
    setSelectedFrame(null);
    setCurrentStep("select");
    // setImagePosition({ x: 0, y: 0, scale: 1, width: 0, height: 0 });
    setCrop(undefined);
    setCompletedCrop(null);
    // setCopySuccess(false);

    const url = new URL(window.location.href);
    url.searchParams.delete('frame');
    window.history.pushState({}, '', url);
  };

  // const handleCopyShareLink = () => {
  //   if (imageUrlRef.current) {
  //     imageUrlRef.current.select();
  //     document.execCommand('copy');
  //     setCopySuccess(true);
  //     setTimeout(() => setCopySuccess(false), 2000);
  //   }
  // };

  const handleShare = async () => {
    if (!finalImage) return;

    try {
      const response = await fetch(finalImage);
      const blob = await response.blob();
      const fileName = `framed-photo-${selectedFrame?.name.replace(/\s+/g, '-').toLowerCase() || 'photo'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'My Framed Photo',
            text: 'Check out my framed photo!',
            files: [file],
          });
          console.log('Shared successfully via Web Share API');
          return;
        } catch (error) {
          console.error('Web Share API failed:', error);
        }
      }

      try {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('Download triggered via Blob URL');
        return;
      } catch (error) {
        console.error('Blob URL download failed:', error);
      }

      const link = document.createElement('a');
      link.href = finalImage;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Download triggered via data URL');

    } catch (error) {
      console.error('Error in share function:', error);
      alert('Unable to share/download the image. Please try saving it manually by long-pressing the image.');
    }
  };

  const filteredFrames = frames.filter(frame =>
    frame.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && currentStep === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin h-12 w-12 border-4 border-gray-300 border-t-blue-500 rounded-full mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading frames...</p>
          <p className="text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error && !frames.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white rounded-lg border border-gray-200 p-8 max-w-md shadow-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4">
            <X className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!frames.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white rounded-lg border border-gray-200 p-8 max-w-md shadow-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Camera className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Frames</h3>
          <p className="text-gray-600">
            There are currently no active photo frames available.
            Please check back later or contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-medium text-gray-800">Photo Framing</div>

            <div className="flex-1 max-w-xl mx-auto">
              <div className="flex items-center justify-between px-2 sm:px-10">
                {['select', 'upload', 'crop', 'preview', 'complete'].map((step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 ${currentStep === step
                        ? "bg-blue-500 text-white"
                        : (['select', 'upload', 'crop', 'preview', 'complete'].indexOf(currentStep as string) >= index
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-500")
                        }`}
                    >
                      <span className="text-xs sm:text-sm">{index + 1}</span>
                    </div>
                    <span className="text-xs text-gray-500 hidden sm:block">
                      {step === 'select' ? 'Select' :
                        step === 'upload' ? 'Upload' :
                          step === 'crop' ? 'Crop' :
                            step === 'preview' ? 'Preview' :
                              'Share'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block absolute left-0 right-0 mx-auto w-2/3 h-0.5 bg-gray-200 -z-10 mt-4">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width:
                      currentStep === 'select' ? '0%' :
                        currentStep === 'upload' ? '25%' :
                          currentStep === 'crop' ? '50%' :
                            currentStep === 'preview' ? '75%' :
                              '100%'
                  }}
                ></div>
              </div>
            </div>

            {currentStep !== "select" && (
              <button
                onClick={handleReset}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-sm flex items-center transition-colors"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Restart
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto p-4 md:p-6 pb-16">
          {currentStep === "select" && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8 mt-4">
                <h1 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">Create Beautiful Photo Frames</h1>
                <p className="text-gray-600">
                  Select a frame, upload your photo, and create shareable moments in seconds.
                </p>

                <div className="mt-6 relative max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Search frames..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {filteredFrames.length === 0 ? (
                <div className="text-center bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-500 mb-3">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matching frames</h3>
                  <p className="text-gray-600 mb-4">
                    No frames match your search for &quot;{searchQuery}&quot;. Try a different search term.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  {/* Split frames into columns for masonry effect */}
                  {Array.from({ length: Math.ceil(filteredFrames.length / 3) }).map((_, colIndex) => (
                    <div key={colIndex} className="grid gap-4">
                      {filteredFrames
                        .slice(colIndex * 3, (colIndex + 1) * 3)
                        .map((frame) => (
                          <div
                            key={frame._id}
                            className="group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200"
                            onClick={() => handleSelectFrame(frame)}
                            // onMouseEnter={() => setHoveredFrame(frame._id)}
                            // onMouseLeave={() => setHoveredFrame(null)}
                          >
                            <div className="relative w-full">
                              <NextImage
                                src={frame.imageUrl}
                                alt={frame.name}
                                width={frame.dimensions.width}
                                height={frame.dimensions.height}
                                className="h-auto max-w-full rounded-lg object-cover"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                              <div className="absolute top-2 right-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={(e) => handleCopyFrameLink(frame._id, e)}
                                  className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
                                  aria-label="Copy share link"
                                  title="Copy share link"
                                >
                                  {frameCopySuccess[frame._id] ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <LinkIcon className="h-4 w-4 text-gray-500" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => toggleFavorite(frame._id, e)}
                                  className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
                                  aria-label={favoriteFrames.includes(frame._id) ? "Remove from favorites" : "Add to favorites"}
                                  title={favoriteFrames.includes(frame._id) ? "Remove from favorites" : "Add to favorites"}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${favoriteFrames.includes(frame._id) ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                                  />
                                </button>
                              </div>
                              <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-white shadow-md rounded-md py-2 px-4 text-blue-500 font-medium">
                                  Select Frame
                                </div>
                              </div>
                            </div>
                            <div className="p-3 bg-white">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{frame.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {frame.dimensions.width} × {frame.dimensions.height} px
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}

              {favoriteFrames.length > 0 && (
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-red-500 fill-red-500" />
                    Your Favorite Frames
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {frames
                      .filter(frame => favoriteFrames.includes(frame._id))
                      .map((frame) => (
                        <div
                          key={`fav-${frame._id}`}
                          className="group relative rounded-md overflow-hidden cursor-pointer bg-white border border-gray-200 hover:border-red-400 hover:shadow-sm transition-all"
                          onClick={() => handleSelectFrame(frame)}
                        >
                          <div
                            style={{
                              aspectRatio: `${frame.dimensions.width} / ${frame.dimensions.height}`,
                            }}
                            className="relative flex items-center justify-center bg-gray-50"
                          >
                            <NextImage
                              src={frame.imageUrl}
                              alt={frame.name}
                              width={frame.dimensions.width}
                              height={frame.dimensions.height}
                              className="w-full h-full object-contain p-1"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyFrameLink(frame._id, e);
                              }}
                              className="absolute top-1 right-1 z-10 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
                              aria-label="Copy share link"
                              title="Copy share link"
                            >
                              {frameCopySuccess[frame._id] ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <LinkIcon className="h-3 w-3 text-gray-500" />
                              )}
                            </button>
                          </div>
                          <div className="p-2 border-t border-gray-100">
                            <h3 className="text-xs font-medium text-gray-700 truncate">
                              {frame.name}
                            </h3>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === "upload" && selectedFrame && (
            <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Upload Your Photo</h2>
                <p className="text-sm text-gray-500 mt-1">Choose a photo to place in your selected frame</p>
              </div>

              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-1/2 lg:order-2">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-5">
                      <h3 className="text-base font-medium text-gray-700 mb-3">Selected Frame</h3>
                      <div
                        style={{
                          aspectRatio: `${selectedFrame.dimensions.width} / ${selectedFrame.dimensions.height}`,
                        }}
                        className="rounded-lg overflow-hidden relative flex items-center justify-center bg-gray-50"
                      >
                        <NextImage
                          src={selectedFrame.imageUrl}
                          alt={selectedFrame.name}
                          width={selectedFrame.dimensions.width}
                          height={selectedFrame.dimensions.height}
                          className="max-w-full max-h-full object-contain"
                          sizes="(max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <p className="mt-3 text-sm text-gray-500">
                        Frame: <span className="text-gray-700 font-medium">{selectedFrame.name}</span>
                      </p>
                    </div>



                    <div className="hidden md:block bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Info className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">Tips for Best Results:</h4>
                          <ul className="mt-2 text-sm text-blue-700 space-y-2">
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-600 text-xs mr-2">1</div>
                              <span>Use high-quality photos for the best output</span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-600 text-xs mr-2">2</div>
                              <span>In the next step, you&apos;ll crop your photo to fit the frame</span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-600 text-xs mr-2">3</div>
                              <span>Add your name to personalize your framed photo</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-1/2 lg:order-1">
                    <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative transition-colors group">
                      <div className="rounded-full p-4 mb-4 bg-gray-100 group-hover:bg-blue-50 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="text-base text-gray-700 text-center mb-2">
                        Drag and drop an image, or <span className="text-blue-500 cursor-pointer hover:underline">browse</span>
                      </p>
                      <p className="text-sm text-gray-500 text-center">
                        Supports JPG or PNG files (max 10MB)
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personalize Your Frame
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name (optional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Your name will appear in the text area of the frame
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("select")}
                    className="px -4 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                  </button>

                  <button
                    type="button"
                    disabled={!userImage}
                    className={`px-5 py-2 text-white rounded-md text-sm font-medium transition-colors flex items-center ${userImage
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-400 cursor-not-allowed'
                      }`}
                  >
                    Continue <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "crop" && selectedFrame && userImage && (
            <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Crop Your Photo</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Adjust your photo to perfectly fit the frame
                </p>
              </div>

              <div className="p-6">
                {/* New mobile-friendly crop controls */}
                {isMobileDevice && (
                  <div className="flex justify-center mb-4 space-x-3">
                    <button
                      onClick={handleAutoFit}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium flex items-center"
                    >
                      <Maximize2 className="h-4 w-4 mr-1" /> Auto-Fit
                    </button>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 p-4 mb-6 relative">
                  <div className="flex items-center justify-center">
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={aspect}
                      className="max-h-[500px] max-w-full"
                    >
                      <img
                        ref={userImgRef}
                        src={userImage}
                        alt="User uploaded image"
                        onLoad={onImageLoad}
                        className="max-h-[500px] max-w-full object-contain"
                      />
                    </ReactCrop>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white shadow-sm text-gray-700 text-xs px-3 py-1.5 rounded-full flex items-center">
                    <CropIcon className="h-3 w-3 mr-1.5" />
                    {isMobileDevice ? "Pinch or drag to adjust" : "Drag corners to adjust crop"}
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-base font-medium text-gray-700 mb-3 flex items-center">
                      <CropIcon className="h-4 w-4 mr-2 text-blue-500" />
                      Crop Instructions
                    </h3>

                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        {isMobileDevice
                          ? "Drag the corners of the selection box to crop your photo. Use the Auto-Fit button for a perfect fit."
                          : "Drag the corners of the selection box to perfectly crop your photo. The crop ratio is locked to match the frame's photo area dimensions."
                        }
                      </p>

                      {!isMobileDevice && (
                        <button
                          onClick={handleAutoFit}
                          className="mt-3 px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium flex items-center"
                        >
                          <Maximize2 className="h-4 w-4 mr-1.5" /> Auto-Fit to Frame
                        </button>
                      )}

                      {/* <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Personalize Your Frame
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter your name (optional)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div> */}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Cropping Tips
                    </h4>
                    <ul className="space-y-3 text-sm text-blue-700">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-600 text-xs mr-2">1</div>
                        <span>Focus on the most important part of your photo</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-600 text-xs mr-2">2</div>
                        <span>The aspect ratio is fixed to match the frame&apos;s photo area</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-600 text-xs mr-2">3</div>
                        <span>Make sure faces are clearly visible and centered</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-600 text-xs mr-2">4</div>
                        <span>{isMobileDevice ? "Use Auto-Fit for best results" : "When you're happy with the crop, click \"Apply Crop\""}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700 flex items-start">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" />
                    </div>
                    <p className="ml-3">{error}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("upload")}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="px-5 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
                  >
                    Apply Crop <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "preview" && selectedFrame && croppedImage && (
            <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Preview Your Framed Photo</h2>
                <p className="text-sm text-gray-500 mt-1">
                  This is how your final framed photo will look
                </p>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 p-4 mb-6 flex items-center justify-center relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full mb-3"></div>
                        <p className="text-gray-600 text-sm">Generating preview...</p>
                      </div>
                    </div>
                  )}

                  <div
                    className="relative"
                    style={{
                      width: 'auto',
                      maxWidth: '100%',
                      maxHeight: '70vh'
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain'
                      }}
                      className="rounded-md shadow-sm"
                    />
                  </div>
                </div>

                <div className="text-center text-xs text-gray-500 mb-6">
                  Final dimensions: {selectedFrame.dimensions.width} × {selectedFrame.dimensions.height} pixels
                </div>

                <div className="my-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personalize Your Frame
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                    }}
                    placeholder="Enter your name (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {userName && (
                    <p className="mt-2 text-xs text-green-600 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Your name will appear on the frame
                    </p>
                  )}
                </div>

                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-base font-medium text-gray-700 mb-3 flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-blue-500" />
                      Preview Details
                    </h3>

                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        This is how your framed photo will look. If you&apos;re happy with it, click &apos;Generate Final Image&apos; to create your shareable picture.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-600">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      What&apos;s Next?
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs mr-2">1</div>
                        <span>When you click &quot;Generate Final Image&quot;, your photo will be processed</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs mr-2">2</div>
                        <span>You&apos;ll be able to download your framed photo</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs mr-2">3</div>
                        <span>Share your creation directly to social media or messaging apps</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs mr-2">4</div>
                        <span>If you need to make changes, use the &quot;Back&quot; button</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700 flex items-start">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" />
                    </div>
                    <p className="ml-3">{error}</p>
                  </div>
                )}

                <div className="flex gap-4 justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("crop")}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    className="p-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Generate Image <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "complete" && finalImage && selectedFrame && (
            <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Framed Photo is Ready!</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Download or share your creation
                </p>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                    <Check className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Success!</h2>
                  <p className="text-gray-600">Your photo has been successfully framed and is ready to download or share.</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Final dimensions: {selectedFrame.dimensions.width} × {selectedFrame.dimensions.height} pixels
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 p-4 flex items-center justify-center">
                    <div
                      className="relative"
                      style={{
                        width: 'auto',
                        maxWidth: '100%',
                        maxHeight: '70vh'
                      }}
                    >
                      <NextImage
                        src={finalImage}
                        alt="Final framed photo"
                        width={selectedFrame.dimensions.width}
                        height={selectedFrame.dimensions.height}
                        className="max-w-full object-contain rounded-md shadow-sm"
                        sizes="(max-width: 1024px) 66vw, 50vw"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                      <h3 className="text-base font-medium text-gray-700 mb-4 flex items-center">
                        <Save className="h-4 w-4 mr-2 text-blue-500" />
                        Download Options
                      </h3>

                      <a
                        href={finalImage}
                        download={`framed-photo-${selectedFrame.name.replace(/\s+/g, '-').toLowerCase()}.png`}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md font-medium mb-3 hover:bg-blue-600 transition-colors flex items-center justify-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Download Image
                      </a>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Create Another
                      </button>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200 hidden md:block">
                      <h3 className="text-base font-medium text-gray-700 mb-4 flex items-center">
                        <Share2 className="h-4 w-4 mr-2 text-blue-500" />
                        Share Your Creation
                      </h3>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors flex items-center justify-center mb-3"
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share Image
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <h4 className="text-base font-medium text-gray-800 mb-2">
                    Thank You for Using Our Photo Framing Tool!
                  </h4>
                  <p className="text-gray-600 mb-4">
                    We hope you enjoyed creating your framed photo. Don&apos;t forget to download your creation and share it with your friends and family!
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Create Another Framed Photo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {(currentStep === "select" || currentStep === "upload") && (
        <section className="bg-white border-t border-gray-200 py-10 mt-6">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-xl font-medium text-gray-900 text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-blue-600" />
                  <div className="absolute -right-2 -top-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-medium text-sm">
                    1
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Frame</h3>
                <p className="text-gray-600 text-sm">
                  Choose from our collection of beautiful frames designed for every occasion.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CropIcon className="h-8 w-8 text-blue-600" />
                  <div className="absolute -right-2 -top-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-medium text-sm">
                    2
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Add Your Photo</h3>
                <p className="text-gray-600 text-sm">
                  Upload and crop your favorite photo to fit perfectly in the frame.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Share2 className="h-8 w-8 text-blue-600" />
                  <div className="absolute -right-2 -top-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-medium text-sm">
                    3
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Share Your Creation</h3>
                <p className="text-gray-600 text-sm">
                  Download your framed photo and share it with friends and family.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} SUHBA Union. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">Terms</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">Help</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default UserPhotoFraming;