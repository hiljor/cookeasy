"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/form/Button";
import Link from "next/link";
import { ChefHat, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/display/EmptyState";
import { ProfileSkeleton } from "@/components/ui/display/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  profile_picture_url?: string;
  is_private?: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const t = useTranslations("Social.profile");

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

  const isOwnProfile = currentUser?.username === profile?.username;

  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none');

  useEffect(() => {
    if (!isOwnProfile && currentUser && profile) {
      const checkStatus = async () => {
        try {
          const res = await fetch('/api/social/friends');
          const friends = await res.json();
          if (friends.some((f: any) => f.username === profile.username)) {
            setFriendStatus('friends');
          }
        } catch (e) {
          console.error(e);
        }
      };
      checkStatus();
    }
  }, [currentUser, profile, isOwnProfile]);

  const handleAddFriend = async () => {
    try {
      await fetch('/api/social/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: profile?.id }),
      });
      setFriendStatus('pending');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await fetch(`/api/social/friends/${profile?.id}`, { method: 'DELETE' });
      setFriendStatus('none');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <ProfileSkeleton key="skeleton" />
      ) : error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center text-red-500"
        >
          {error}
        </motion.div>
      ) : profile ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto p-4 sm:p-8"
        >
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-12">
            <div className="w-32 h-32 rounded-full bg-card overflow-hidden flex-shrink-0 border border-border">
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
                <h1 className="text-2xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                  @{profile.username}
                  {profile.is_private && <Lock className="h-4 w-4 text-muted" />}
                </h1>
                {isOwnProfile ? (
                  <Link href="/settings/profile">
                    <Button variant="outline" size="sm">Edit Profile</Button>
                  </Link>
                ) : currentUser && (
                  friendStatus === 'friends' ? (
                    <Button variant="destructive" size="sm" onClick={handleRemoveFriend}>Remove Friend</Button>
                  ) : friendStatus === 'pending' ? (
                    <Button variant="outline" size="sm" disabled>Pending</Button>
                  ) : (
                    <Button variant="default" size="sm" onClick={handleAddFriend}>Add Friend</Button>
                  )
                )}
              </div>
              
              {!profile.is_private ? (
                <>
                  <p className="text-gray-600 dark:text-zinc-400 mb-6">{profile.bio || "No bio yet."}</p>
                  
                  <div className="flex justify-center sm:justify-start gap-8 border-t border-b py-4 border-border">
                    <div className="text-center">
                      <span className="block font-bold text-foreground">0</span>
                      <span className="text-sm text-gray-500 dark:text-zinc-400">Recipes</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-foreground">0</span>
                      <span className="text-sm text-gray-500 dark:text-zinc-400">Friends</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-4 text-sm text-muted">
                  {t("privateDescription")}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Recipes</h2>
            {profile.is_private ? (
              <EmptyState 
                icon={Lock}
                title={t("privateTitle")}
                description={t("privateDescription")}
              />
            ) : (
              <EmptyState 
              icon={ChefHat}
              title={isOwnProfile ? t("empty.ownRecipes.title") : t("empty.recipes.title")}
              description={isOwnProfile ? t("empty.ownRecipes.description") : t("empty.recipes.description")}
              action={isOwnProfile ? {
                label: t("empty.ownRecipes.createRecipe"),
                onClick: () => console.log("Create recipe clicked")
              } : undefined}
              />            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


