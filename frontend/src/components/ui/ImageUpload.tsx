"use client";

import React, { useRef, useState } from "react";
import { Button } from "./Button";
import { Camera } from "lucide-react";

interface ImageUploadProps {
  currentImage?: string;
  onUploadSuccess: (url: string) => void;
  bucket?: string;
}

export function ImageUpload({ currentImage, onUploadSuccess }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/auth/me/avatar", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onUploadSuccess(data.profile_picture_url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200">
          {currentImage ? (
            <img src={currentImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 uppercase text-4xl">
              ?
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-full cursor-pointer"
        >
          <Camera className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Change</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {isUploading && <p className="text-xs text-orange-500 animate-pulse">Uploading...</p>}
    </div>
  );
}
