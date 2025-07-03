"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Save,
  Loader2,
  Grid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Type,
  Layout,
  AlertTriangle,
  Info,
  Trash2,
  Eye
} from "lucide-react";
import { useFrameStore } from "@/store/frameStore";

// Define types
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

interface EditorData {
  dimensions: {
    width: number;
    height: number;
  };
  placementCoords: PlacementCoords;
  textSettings: TextSettings;
}

interface FormErrors {
  name?: string;
  frameImage?: string;
  submit?: string;
  fetch?: string;
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
}

interface FrameStore {
  frames: Frame[];
  updateFrame: (frame: Frame) => void;
  fetchFrames: () => Promise<void>;
  isLoading: boolean;
}

interface ResizeHandle {
  target: "image" | "text";
  handle: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}

// Canvas Container Component
interface CanvasContainerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  dimensions: { width: number; height: number };
  zoom: number;
  isPreviewMode: boolean;
  isLoading: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  cursorStyle: string;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({
  canvasRef,
  dimensions,
  zoom,
  isPreviewMode,
  isLoading,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  cursorStyle,
}) => {
  const calculateScale = () => {
    const maxWidth = 600;
    const maxHeight = 500;
    if (dimensions.width === 600 && dimensions.height === 600) return zoom;
    const widthScale = maxWidth / dimensions.width;
    const heightScale = maxHeight / dimensions.height;
    return Math.min(widthScale, heightScale, 1) * zoom;
  };

  const scale = calculateScale();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative h-[500px] flex items-center justify-center shadow-md">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          position: "relative",
        }}
        className="canvas-wrapper z-10"
      >
        {isPreviewMode ? (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              className="cursor-default shadow-md rounded"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-white/10 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm rounded">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            className={`${cursorStyle} rounded`}
          />
        )}
      </div>
      <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/70 text-gray-800 dark:text-white text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 backdrop-blur-sm z-10 font-medium">
        {dimensions.width} × {dimensions.height}px
      </div>
    </div>
  );
};

export default function EditFramePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const frameId = searchParams.get("id");

  const { frames, updateFrame, fetchFrames } = useFrameStore() as FrameStore;

  const [defaultSizes] = useState({
    image: { widthPercent: 0.3, heightPercent: 0.25, xPercent: 0.35, yPercent: 0.45 },
    text: { widthPercent: 0.7, heightPercent: 0.1, xPercent: 0.14, yPercent: 0.75 },
  });
  const [name, setName] = useState<string>("");
  const [sampleText, setSampleText] = useState<string>("John Doe");
  const [frameImage, setFrameImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingImage, setIsDraggingImage] = useState<boolean>(false);
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [editorData, setEditorData] = useState<EditorData>({
    dimensions: { width: 600, height: 600 },
    placementCoords: { x: 200, y: 200, width: 200, height: 200 },
    textSettings: { x: 200, y: 450, width: 200, height: 50, font: "Arial", size: 16, color: "#ffffff" },
  });

  // Debugging ref attachment
  useEffect(() => {
    console.log("fileInputRef:", fileInputRef.current);
  }, []);

  // Fetch frame data
  useEffect(() => {
    const fetchFrameData = async () => {
      if (!frameId) {
        router.push("/admin/photoframing/all");
        return;
      }

      try {
        setIsLoading(true);
        if (frames.length === 0) await fetchFrames();
        const frame = frames.find((f) => f._id === frameId);

        if (frame) {
          initializeFormWithFrame(frame);
        } else {
          const response = await fetch(`/api/frames/${frameId}`,{
            headers: {
              'x-api-key': "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
            },
          });
          const data = await response.json();
          if (data.success) {
            initializeFormWithFrame(data.data);
          } else {
            throw new Error(data.message || "Failed to fetch frame");
          }
        }
      } catch (error) {
        console.error("Error fetching frame:", error);
        setErrors({
          fetch: error instanceof Error ? error.message : "An unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrameData();
  }, [frameId, frames, fetchFrames, router]);

  const initializeFormWithFrame = (frame: Frame) => {
    console.log("Initializing with frame data:", frame);
    setName(frame.name);
    setSampleText(frame.name);
    setCurrentImageUrl(frame.imageUrl);
    setPreviewImage(frame.imageUrl);
    
    setEditorData({
      dimensions: frame.dimensions || { width: 600, height: 600 },
      placementCoords: { ...frame.placementCoords },
      textSettings: {
        x: typeof frame.textSettings.x === 'number' ? frame.textSettings.x : 200,
        y: typeof frame.textSettings.y === 'number' ? frame.textSettings.y : 450,
        width: typeof frame.textSettings.width === 'number' ? frame.textSettings.width : 200,
        height: typeof frame.textSettings.height === 'number' ? frame.textSettings.height : 50,
        font: frame.textSettings.font || "Arial",
        size: frame.textSettings.size || 16,
        color: frame.textSettings.color || "#ffffff",
      },
    });
  };

  const resetToDefaults = () => {
    const frameWidth = editorData.dimensions.width;
    const frameHeight = editorData.dimensions.height;
    setEditorData((prev) => ({
      ...prev,
      placementCoords: {
        x: Math.round(frameWidth * defaultSizes.image.xPercent),
        y: Math.round(frameHeight * defaultSizes.image.yPercent),
        width: Math.round(frameWidth * defaultSizes.image.widthPercent),
        height: Math.round(frameHeight * defaultSizes.image.heightPercent),
      },
      textSettings: {
        ...prev.textSettings,
        x: Math.round(frameWidth * defaultSizes.text.xPercent),
        y: Math.round(frameHeight * defaultSizes.text.yPercent),
        width: Math.round(frameWidth * defaultSizes.text.widthPercent),
        height: Math.round(frameHeight * defaultSizes.text.heightPercent),
      },
    }));
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
        URL.revokeObjectURL(img.src);
        resolve(dimensions);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image dimensions"));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleBrowseClick = () => {
    console.log("handleBrowseClick triggered");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("fileInputRef is null");
    }
  };

  const calculateScaleFactor = (canvas: HTMLCanvasElement, dimensions: { width: number; height: number }) => {
    const rect = canvas.getBoundingClientRect();
    return { x: dimensions.width / rect.width, y: dimensions.height / rect.height };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    console.log("handleImageUpload triggered");
    const files = "target" in e ? e.target.files : null;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, frameImage: "Please upload an image file (PNG, JPG)" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, frameImage: "Image size must be less than 5MB" });
      return;
    }

    const newErrors = { ...errors };
    delete newErrors.frameImage;
    setErrors(newErrors);

    try {
      const dimensions = await getImageDimensions(file);
      setEditorData((prev) => ({
        ...prev,
        dimensions,
        placementCoords: {
          x: Math.floor(dimensions.width * defaultSizes.image.xPercent),
          y: Math.floor(dimensions.height * defaultSizes.image.yPercent),
          width: Math.floor(dimensions.width * defaultSizes.image.widthPercent),
          height: Math.floor(dimensions.height * defaultSizes.image.heightPercent),
        },
        textSettings: {
          ...prev.textSettings,
          x: Math.floor(dimensions.width * defaultSizes.text.xPercent),
          y: Math.floor(dimensions.height * defaultSizes.text.yPercent),
          width: Math.floor(dimensions.width * defaultSizes.text.widthPercent),
          height: Math.floor(dimensions.height * defaultSizes.text.heightPercent),
        },
      }));
      setFrameImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      console.log("Image uploaded successfully:", objectUrl);
    } catch (error) {
      console.error("Error processing image:", error);
      setErrors({ ...errors, frameImage: "Failed to process image dimensions" });
    }
  };

  const resetImage = () => {
    console.log("Remove Image clicked");
    setFrameImage(null);
    setPreviewImage(currentImageUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!canvasRef.current || !previewImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = editorData.dimensions.width;
    canvas.height = editorData.dimensions.height;

    const handleSize = 10;
    const drawHandle = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
    };

    const img = new Image();
    img.src = previewImage;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      console.log("Drawing with settings:", { placementCoords: editorData.placementCoords, textSettings: editorData.textSettings });

      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.fillRect(editorData.placementCoords.x, editorData.placementCoords.y, editorData.placementCoords.width, editorData.placementCoords.height);
      ctx.strokeStyle = "rgba(37, 99, 235, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(editorData.placementCoords.x, editorData.placementCoords.y, editorData.placementCoords.width, editorData.placementCoords.height);

      ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
      ctx.fillRect(editorData.textSettings.x, editorData.textSettings.y, editorData.textSettings.width, editorData.textSettings.height);
      ctx.strokeStyle = "rgba(5, 150, 105, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(editorData.textSettings.x, editorData.textSettings.y, editorData.textSettings.width, editorData.textSettings.height);

      ctx.font = `${editorData.textSettings.size}px ${editorData.textSettings.font}`;
      ctx.fillStyle = editorData.textSettings.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textX = editorData.textSettings.x + editorData.textSettings.width / 2;
      const textY = editorData.textSettings.y + editorData.textSettings.height / 2;
      ctx.fillText(sampleText, textX, textY);

      const imageHandleColor = "rgba(37, 99, 235, 1)";
      drawHandle(ctx, editorData.placementCoords.x, editorData.placementCoords.y, imageHandleColor);
      drawHandle(ctx, editorData.placementCoords.x + editorData.placementCoords.width, editorData.placementCoords.y, imageHandleColor);
      drawHandle(ctx, editorData.placementCoords.x, editorData.placementCoords.y + editorData.placementCoords.height, imageHandleColor);
      drawHandle(ctx, editorData.placementCoords.x + editorData.placementCoords.width, editorData.placementCoords.y + editorData.placementCoords.height, imageHandleColor);

      const textHandleColor = "rgba(5, 150, 105, 1)";
      drawHandle(ctx, editorData.textSettings.x, editorData.textSettings.y, textHandleColor);
      drawHandle(ctx, editorData.textSettings.x + editorData.textSettings.width, editorData.textSettings.y, textHandleColor);
      drawHandle(ctx, editorData.textSettings.x, editorData.textSettings.y + editorData.textSettings.height, textHandleColor);
      drawHandle(ctx, editorData.textSettings.x + editorData.textSettings.width, editorData.textSettings.y + editorData.textSettings.height, textHandleColor);

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "rgba(37, 99, 235, 0.9)";
      ctx.fillRect(editorData.placementCoords.x, editorData.placementCoords.y, 80, 20);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Image Area", editorData.placementCoords.x + 6, editorData.placementCoords.y + 14);
      ctx.fillStyle = "rgba(5, 150, 105, 0.9)";
      ctx.fillRect(editorData.textSettings.x, editorData.textSettings.y, 70, 20);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Text Area", editorData.textSettings.x + 6, editorData.textSettings.y + 14);

      if (showGrid) {
        ctx.strokeStyle = "rgba(156, 163, 175, 0.2)";
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(156, 163, 175, 0.4)";
        for (let x = 0; x < canvas.width; x += 100) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 100) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
    };
  }, [previewImage, editorData, showGrid, sampleText]);

  useEffect(() => {
    if (!previewCanvasRef.current || !previewImage) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = editorData.dimensions.width;
    canvas.height = editorData.dimensions.height;

    const renderPreview = () => {
      setIsLoading(true);
      const frameImg = new Image();
      frameImg.src = previewImage;
      const userImg = new Image();
      userImg.src = "/api/placeholder/400/400";

      frameImg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

        userImg.onload = () => {
          ctx.drawImage(userImg, editorData.placementCoords.x, editorData.placementCoords.y, editorData.placementCoords.width, editorData.placementCoords.height);
          ctx.font = `${editorData.textSettings.size}px ${editorData.textSettings.font}`;
          ctx.fillStyle = editorData.textSettings.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const textX = editorData.textSettings.x + editorData.textSettings.width / 2;
          const textY = editorData.textSettings.y + editorData.textSettings.height / 2;
          ctx.fillText(sampleText, textX, textY);
          setIsLoading(false);
        };

        userImg.onerror = () => {
          ctx.fillStyle = "rgba(128, 128, 128, 0.5)";
          ctx.fillRect(editorData.placementCoords.x, editorData.placementCoords.y, editorData.placementCoords.width, editorData.placementCoords.height);
          ctx.fillStyle = "#ffffff";
          ctx.font = "14px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Sample User Image", editorData.placementCoords.x + editorData.placementCoords.width / 2, editorData.placementCoords.y + editorData.placementCoords.height / 2);
          setIsLoading(false);
        };
      };

      frameImg.onerror = () => {
        setIsLoading(false);
        console.error("Failed to load frame image");
      };
    };

    renderPreview();
  }, [previewImage, editorData, sampleText]);

  const getCursorStyle = (): string => {
    if (isDraggingImage || isDraggingText) return "cursor-grabbing";
    if (resizeHandle) {
      const { handle } = resizeHandle;
      if (handle === "topLeft" || handle === "bottomRight") return "cursor-nwse-resize";
      if (handle === "topRight" || handle === "bottomLeft") return "cursor-nesw-resize";
    }
    return "cursor-grab";
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = calculateScaleFactor(canvas, editorData.dimensions);
    const x = (e.clientX - rect.left) * scale.x;
    const y = (e.clientY - rect.top) * scale.y;
    const handleSize = 12;

    if (Math.abs(x - editorData.placementCoords.x) <= handleSize && Math.abs(y - editorData.placementCoords.y) <= handleSize) {
      setResizeHandle({ target: "image", handle: "topLeft" });
      return;
    }
    if (Math.abs(x - (editorData.placementCoords.x + editorData.placementCoords.width)) <= handleSize && Math.abs(y - editorData.placementCoords.y) <= handleSize) {
      setResizeHandle({ target: "image", handle: "topRight" });
      return;
    }
    if (Math.abs(x - editorData.placementCoords.x) <= handleSize && Math.abs(y - (editorData.placementCoords.y + editorData.placementCoords.height)) <= handleSize) {
      setResizeHandle({ target: "image", handle: "bottomLeft" });
      return;
    }
    if (Math.abs(x - (editorData.placementCoords.x + editorData.placementCoords.width)) <= handleSize && Math.abs(y - (editorData.placementCoords.y + editorData.placementCoords.height)) <= handleSize) {
      setResizeHandle({ target: "image", handle: "bottomRight" });
      return;
    }
    if (Math.abs(x - editorData.textSettings.x) <= handleSize && Math.abs(y - editorData.textSettings.y) <= handleSize) {
      setResizeHandle({ target: "text", handle: "topLeft" });
      return;
    }
    if (Math.abs(x - (editorData.textSettings.x + editorData.textSettings.width)) <= handleSize && Math.abs(y - editorData.textSettings.y) <= handleSize) {
      setResizeHandle({ target: "text", handle: "topRight" });
      return;
    }
    if (Math.abs(x - editorData.textSettings.x) <= handleSize && Math.abs(y - (editorData.textSettings.y + editorData.textSettings.height)) <= handleSize) {
      setResizeHandle({ target: "text", handle: "bottomLeft" });
      return;
    }
    if (Math.abs(x - (editorData.textSettings.x + editorData.textSettings.width)) <= handleSize && Math.abs(y - (editorData.textSettings.y + editorData.textSettings.height)) <= handleSize) {
      setResizeHandle({ target: "text", handle: "bottomRight" });
      return;
    }

    if (x >= editorData.placementCoords.x && x <= editorData.placementCoords.x + editorData.placementCoords.width && y >= editorData.placementCoords.y && y <= editorData.placementCoords.y + editorData.placementCoords.height) {
      setIsDraggingImage(true);
      setDragStartPos({ x: x - editorData.placementCoords.x, y: y - editorData.placementCoords.y });
      return;
    }
    if (x >= editorData.textSettings.x && x <= editorData.textSettings.x + editorData.textSettings.width && y >= editorData.textSettings.y && y <= editorData.textSettings.y + editorData.textSettings.height) {
      setIsDraggingText(true);
      setDragStartPos({ x: x - editorData.textSettings.x, y: y - editorData.textSettings.y });
      return;
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || (!isDraggingImage && !isDraggingText && !resizeHandle)) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = calculateScaleFactor(canvas, editorData.dimensions);
    const x = (e.clientX - rect.left) * scale.x;
    const y = (e.clientY - rect.top) * scale.y;

    if (resizeHandle) {
      const { target, handle } = resizeHandle;
      if (target === "image") {
        const coords = { ...editorData.placementCoords };
        switch (handle) {
          case "topLeft":
            const newWidthTL = coords.width + (coords.x - x);
            const newHeightTL = coords.height + (coords.y - y);
            if (newWidthTL >= 20 && newHeightTL >= 20) {
              setEditorData((prev) => ({
                ...prev,
                placementCoords: { x: Math.max(0, x), y: Math.max(0, y), width: newWidthTL, height: newHeightTL },
              }));
            }
            break;
          case "topRight":
            const newWidthTR = x - coords.x;
            const newHeightTR = coords.height + (coords.y - y);
            if (newWidthTR >= 20 && newHeightTR >= 20) {
              setEditorData((prev) => ({
                ...prev,
                placementCoords: { ...coords, y: Math.max(0, y), width: Math.min(newWidthTR, editorData.dimensions.width - coords.x), height: newHeightTR },
              }));
            }
            break;
          case "bottomLeft":
            const newWidthBL = coords.width + (coords.x - x);
            const newHeightBL = y - coords.y;
            if (newWidthBL >= 20 && newHeightBL >= 20) {
              setEditorData((prev) => ({
                ...prev,
                placementCoords: { x: Math.max(0, x), y: coords.y, width: newWidthBL, height: Math.min(newHeightBL, editorData.dimensions.height - coords.y) },
              }));
            }
            break;
          case "bottomRight":
            const newWidthBR = x - coords.x;
            const newHeightBR = y - coords.y;
            if (newWidthBR >= 20 && newHeightBR >= 20) {
              setEditorData((prev) => ({
                ...prev,
                placementCoords: { ...coords, width: Math.min(newWidthBR, editorData.dimensions.width - coords.x), height: Math.min(newHeightBR, editorData.dimensions.height - coords.y) },
              }));
            }
            break;
        }
      } else if (target === "text") {
        const coords = { ...editorData.textSettings };
        switch (handle) {
          case "topLeft":
            const newWidthTL = coords.width + (coords.x - x);
            const newHeightTL = coords.height + (coords.y - y);
            if (newWidthTL >= 20 && newHeightTL >= 20) {
              setEditorData((prev) => ({
                ...prev,
                textSettings: { ...prev.textSettings, x: Math.max(0, x), y: Math.max(0, y), width: newWidthTL, height: newHeightTL },
              }));
            }
            break;
          case "topRight":
            const newWidthTR = x - coords.x;
            const newHeightTR = coords.height + (coords.y - y);
            if (newWidthTR >= 20 && newHeightTR >= 20) {
              setEditorData((prev) => ({
                ...prev,
                textSettings: { ...prev.textSettings, y: Math.max(0, y), width: Math.min(newWidthTR, editorData.dimensions.width - coords.x), height: newHeightTR },
              }));
            }
            break;
          case "bottomLeft":
            const newWidthBL = coords.width + (coords.x - x);
            const newHeightBL = y - coords.y;
            if (newWidthBL >= 20 && newHeightBL >= 20) {
              setEditorData((prev) => ({
                ...prev,
                textSettings: { ...prev.textSettings, x: Math.max(0, x), width: newWidthBL, height: Math.min(newHeightBL, editorData.dimensions.height - coords.y) },
              }));
            }
            break;
          case "bottomRight":
            const newWidthBR = x - coords.x;
            const newHeightBR = y - coords.y;
            if (newWidthBR >= 20 && newHeightBR >= 20) {
              setEditorData((prev) => ({
                ...prev,
                textSettings: { ...prev.textSettings, width: Math.min(newWidthBR, editorData.dimensions.width - coords.x), height: Math.min(newHeightBR, editorData.dimensions.height - coords.y) },
              }));
            }
            break;
        }
      }
      return;
    }

    if (isDraggingImage) {
      const newX = Math.max(0, Math.min(editorData.dimensions.width - editorData.placementCoords.width, x - dragStartPos.x));
      const newY = Math.max(0, Math.min(editorData.dimensions.height - editorData.placementCoords.height, y - dragStartPos.y));
      setEditorData((prev) => ({ ...prev, placementCoords: { ...prev.placementCoords, x: newX, y: newY } }));
    }
    if (isDraggingText) {
      const newX = Math.max(0, Math.min(editorData.dimensions.width - editorData.textSettings.width, x - dragStartPos.x));
      const newY = Math.max(0, Math.min(editorData.dimensions.height - editorData.textSettings.height, y - dragStartPos.y));
      setEditorData((prev) => ({ ...prev, textSettings: { ...prev.textSettings, x: newX, y: newY } }));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingImage(false);
    setIsDraggingText(false);
    setResizeHandle(null);
  };

  const handleCanvasMouseLeave = () => {
    setIsDraggingImage(false);
    setIsDraggingText(false);
    setResizeHandle(null);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const togglePreviewMode = () => setPreviewMode(!previewMode);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Frame name is required";
    if (!previewImage) newErrors.frameImage = "Frame image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || !frameId) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (frameImage) formData.append("frameImage", frameImage);
      formData.append("currentImageUrl", currentImageUrl || "");
      formData.append("dimensions", JSON.stringify(editorData.dimensions));
      formData.append("placementCoords", JSON.stringify(editorData.placementCoords));
      formData.append("textSettings", JSON.stringify(editorData.textSettings));

      console.log("Submitting frame update with data:", {
        name,
        frameImage: frameImage ? frameImage.name : "No new image",
        currentImageUrl,
        dimensions: editorData.dimensions,
        placementCoords: editorData.placementCoords,
        textSettings: editorData.textSettings,
      });

      const response = await fetch(`/api/frames/${frameId}`, { method: "PUT", body: formData ,
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });
      const data = await response.json();

      if (!data.success) throw new Error(data.message || "Failed to update frame");

      updateFrame(data.data);
      router.push("/admin/photoframing/all");
    } catch (error) {
      console.error("Error updating frame:", error);
      setErrors({ submit: error instanceof Error ? error.message : "An unknown error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-300 dark:border-red-900/50 shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Frame</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{errors.fetch}</p>
          <Link href="/admin/photoframing/all" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center shadow-lg mx-auto">
            <ArrowLeft className="h-4 w-4 mr-2" /> Return to All Frames
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Frame</h2>
          <Link href="/admin/photoframing/all" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg flex items-center text-gray-700 dark:text-gray-200 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Frames
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 text-sm text-red-800 dark:text-red-300 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p>{errors.submit}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Frame Name*
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Holiday Frame"
                className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Frame Image*</label>
              <div className="flex items-center justify-center">
                <div className="w-full relative">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
                      errors.frameImage
                        ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                        : previewImage
                        ? "border-blue-400 bg-blue-50 dark:bg-blue-900/10"
                        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-900/10"
                    } transition-all duration-200`}
                  >
                    {previewImage ? (
                      <>
                        <NextImage
                          src={previewImage}
                          alt="Frame preview"
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ maxHeight: "15rem", width: "auto", objectFit: "contain" }}
                          className="mx-auto rounded-lg shadow"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log("Replace Image clicked");
                              handleBrowseClick();
                            }}
                            className="bg-blue-600/80 dark:bg-blue-700/80 rounded-full p-1.5 hover:bg-blue-500/80 transition-colors"
                            title="Replace Image"
                          >
                            <Upload className="h-4 w-4 text-white" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              resetImage();
                            }}
                            className="bg-gray-700/80 dark:bg-gray-800/80 rounded-full p-1.5 hover:bg-red-500/80 transition-colors"
                            title="Remove Image"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-100 dark:bg-gray-600 p-4 rounded-full mb-3">
                          <Upload className="h-10 w-10 text-gray-500 dark:text-gray-300" />
                        </div>
                        <p className="text-center mb-2 text-gray-700 dark:text-gray-300">
                          Drag and drop an image, or{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log("Browse clicked");
                              handleBrowseClick();
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">PNG with transparent background recommended</p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" id="frameImage" name="frameImage" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      console.log("Image dropped");
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const syntheticEvent = { target: { files: e.dataTransfer.files } };
                        handleImageUpload(syntheticEvent);
                      }
                    }}
                  ></div>
                  {errors.frameImage && <p className="mt-1 text-sm text-red-500">{errors.frameImage}</p>}
                  {frameImage && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      You&apos;ve selected a new image. The original will be replaced upon saving.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {previewImage && (
              <>
                <div>
                  <label htmlFor="sampleText" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Sample Text for Preview
                  </label>
                  <input
                    type="text"
                    id="sampleText"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    placeholder="Enter sample text"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This text will be used to preview how names will appear on your frame
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <CanvasContainer
                      canvasRef={previewMode ? previewCanvasRef : canvasRef}
                      dimensions={editorData.dimensions}
                      zoom={zoom}
                      isPreviewMode={previewMode}
                      isLoading={isLoading}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseLeave}
                      cursorStyle={getCursorStyle()}
                    />
                    <div className="mt-3 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded-lg flex items-center ${
                          showGrid
                            ? "bg-blue-100 dark:bg-blue-800/40 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400"
                            : "bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } transition-colors`}
                        title={showGrid ? "Hide Grid" : "Show Grid"}
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={handleZoomOut} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Zoom Out">
                        <ZoomOut className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={handleZoomIn} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Zoom In">
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={resetToDefaults} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Reset to Default Sizes">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={togglePreviewMode}
                        className={`p-2 rounded-lg flex items-center ${
                          previewMode
                            ? "bg-blue-100 dark:bg-blue-800/40 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400"
                            : "bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } transition-colors`}
                        title={previewMode ? "Edit Mode" : "Preview Mode"}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow h-full overflow-hidden">
                      <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => setActiveTab("image")}
                          className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors ${
                            activeTab === "image"
                              ? "bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-500 text-blue-700 dark:text-blue-400 font-medium"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Layers size={16} />
                          <span>Image Area</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("text")}
                          className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors ${
                            activeTab === "text"
                              ? "bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-500 text-blue-700 dark:text-blue-400 font-medium"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Type size={16} />
                          <span>Text Settings</span>
                        </button>
                      </div>

                      <div className="p-4 space-y-5">
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Layout size={14} /> Frame Dimensions
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Width (px)</label>
                              <input
                                type="number"
                                value={editorData.dimensions.width}
                                onChange={(e) => {
                                  const value = Math.max(100, parseInt(e.target.value) || 100);
                                  setEditorData((prev) => ({ ...prev, dimensions: { ...prev.dimensions, width: value } }));
                                }}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Height (px)</label>
                              <input
                                type="number"
                                value={editorData.dimensions.height}
                                onChange={(e) => {
                                  const value = Math.max(100, parseInt(e.target.value) || 100);
                                  setEditorData((prev) => ({ ...prev, dimensions: { ...prev.dimensions, height: value } }));
                                }}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Actual dimensions of the uploaded frame image.</p>
                        </div>

                        {activeTab === "image" && (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Layers size={14} /> Image Placement
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {(["x", "y", "width", "height"] as const).map((prop) => (
                                <div key={prop}>
                                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">{prop.charAt(0).toUpperCase() + prop.slice(1)}</label>
                                  <input
                                    type="number"
                                    value={Math.round(editorData.placementCoords[prop])}
                                    onChange={(e) => {
                                      const value = Math.max(0, parseInt(e.target.value) || 0);
                                      setEditorData((prev) => ({ ...prev, placementCoords: { ...prev.placementCoords, [prop]: value } }));
                                    }}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeTab === "text" && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Layout size={14} /> Text Area Position
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {(["x", "y", "width", "height"] as const).map((prop) => (
                                  <div key={prop}>
                                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">{prop.charAt(0).toUpperCase() + prop.slice(1)}</label>
                                    <input
                                      type="number"
                                      value={Math.round(editorData.textSettings[prop])}
                                      onChange={(e) => {
                                        const value = Math.max(0, parseInt(e.target.value) || 0);
                                        setEditorData((prev) => ({ ...prev, textSettings: { ...prev.textSettings, [prop]: value } }));
                                      }}
                                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Type size={14} /> Text Styling
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Font Family</label>
                                  <select
                                    value={editorData.textSettings.font}
                                    onChange={(e) => setEditorData((prev) => ({ ...prev, textSettings: { ...prev.textSettings, font: e.target.value } }))}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  >
                                    {["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"].map((font) => (
                                      <option key={font} value={font}>
                                        {font}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Font Size</label>
                                  <input
                                    type="number"
                                    value={editorData.textSettings.size}
                                    min="0"
                                    max="72"
                                    onChange={(e) => {
                                      const value = Math.max(0, Math.min(72, parseInt(e.target.value) || 0));
                                      setEditorData((prev) => ({ ...prev, textSettings: { ...prev.textSettings, size: value } }));
                                    }}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Font Color</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={editorData.textSettings.color}
                                      onChange={(e) => setEditorData((prev) => ({ ...prev, textSettings: { ...prev.textSettings, color: e.target.value } }))}
                                      className="h-8 w-10 p-0 bg-transparent border-0 rounded overflow-hidden cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={editorData.textSettings.color}
                                      onChange={(e) => setEditorData((prev) => ({ ...prev, textSettings: { ...prev.textSettings, color: e.target.value } }))}
                                      className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={isSubmitting || !previewImage}
                className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow flex items-center gap-2 font-medium ${
                  isSubmitting || !previewImage ? "opacity-60 cursor-not-allowed bg-gray-500 hover:bg-gray-500" : "hover:shadow-lg transition-all duration-200"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating Frame...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Update Frame
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tips for Great Frames</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Transparent Backgrounds</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Use PNG images with transparent backgrounds for best results. This allows user photos to show through properly.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-100 dark:border-green-800/30">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Text Readability</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Choose font colors that contrast well with your frame design. Consider the visibility of text on various backgrounds.</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border border-purple-100 dark:border-purple-800/30">
            <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">Test Your Design</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Preview your design with sample content to ensure it will work well with different user photos and names.</p>
          </div>
        </div>
      </div>
    </div>
  );
}