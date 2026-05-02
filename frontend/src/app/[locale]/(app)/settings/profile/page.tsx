"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/form/Button";
import { Input } from "@/components/ui/form/Input";
import { ImageUpload } from "@/components/ui/form/ImageUpload";
import { ThemeSelector } from "@/components/ui/form/ThemeSelector";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function EditProfilePage() {
  const t = useTranslations("Settings.profile");
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

  const handleSubmit = async (e: React.SubmitEvent) => {
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
        throw new Error(data.error || t("error"));
      }

      await refreshUser();
      setMessage({ type: "success", text: t("success") });
      
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
      <h1 className="text-2xl font-bold mb-8 text-foreground">{t("title")}</h1>
      
      <div className="mb-8">
        <label className="block text-sm font-medium text-muted mb-4 text-center">{t("pfp")}</label>
        <ImageUpload 
          currentImage={user?.profile_picture_url} 
          onUploadSuccess={() => refreshUser()} 
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={t("username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <div className="w-full">
          <label htmlFor="bio" className="block text-sm font-medium text-muted mb-1">{t("bio")}</label>
          <textarea
            id="bio"
            className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 min-h-[120px] text-foreground"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            placeholder={t("bioPlaceholder")}
          />
          <p className="text-xs text-muted mt-1 text-right">{bio.length}/500</p>
        </div>

        <div className="pt-6 border-t border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">{t("appearance")}</h2>
            <ThemeSelector />
        </div>

        {message.text && (
          <p className={`text-sm text-center ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
            {message.text}
          </p>
        )}

        <div className="flex gap-4">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {t("save")}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
