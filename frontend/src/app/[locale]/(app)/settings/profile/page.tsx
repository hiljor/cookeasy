"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      await refreshUser();
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Redirect back to profile after a short delay
      setTimeout(() => {
        router.push(`/u/${username}`);
      }, 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-8">Edit Profile</h1>
      
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Profile Picture</label>
        <ImageUpload 
          currentImage={user?.profile_picture_url} 
          onUploadSuccess={() => refreshUser()} 
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 min-h-[120px]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            placeholder="Tell us about your cooking journey..."
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
        </div>

        {message.text && (
          <p className={`text-sm text-center ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
            {message.text}
          </p>
        )}

        <div className="flex gap-4">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
