"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  profile_picture_url?: string;
  created_at: string;
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${username}`);
        if (!response.ok) throw new Error("User not found");
        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!profile) return null;

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {profile.profile_picture_url ? (
            <img src={profile.profile_picture_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl uppercase">
              {profile.username[0]}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">@{profile.username}</h1>
            {isOwnProfile && (
              <Link href="/settings/profile">
                <Button variant="outline" size="sm">Edit Profile</Button>
              </Link>
            )}
          </div>
          
          <p className="text-gray-600 mb-6">{profile.bio || "No bio yet."}</p>
          
          <div className="flex justify-center sm:justify-start gap-8 border-t border-b py-4">
            <div className="text-center">
              <span className="block font-bold">0</span>
              <span className="text-sm text-gray-500">Recipes</span>
            </div>
            <div className="text-center">
              <span className="block font-bold">0</span>
              <span className="text-sm text-gray-500">Friends</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
