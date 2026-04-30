"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { UserPlus, UserMinus, Check, X, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface Friend {
  id: string;
  username: string;
  profile_picture_url?: string;
  bio?: string;
}

interface FriendRequest {
  id: string;
  sender: Friend;
  created_at: string;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        fetch("/api/social/friends"),
        fetch("/api/social/friends/requests"),
      ]);

      if (friendsRes.ok) setFriends(await friendsRes.json());
      if (requestsRes.ok) setRequests(await requestsRes.json());
    } catch (error) {
      console.error("Failed to fetch friends data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespond = async (requestId: string, action: "accepted" | "rejected") => {
    try {
      const res = await fetch("/api/social/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, action }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to respond to request", error);
    }
  };

  const handleRemove = async (friendId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    try {
      const res = await fetch(`/api/social/friends/${friendId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to remove friend", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Community</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Search className="w-4 h-4 mr-2" /> Find Users
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("all")}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === "all" ? "text-orange-500" : "text-gray-500 hover:text-gray-700"}`}
        >
          My Friends ({friends.length})
          {activeTab === "all" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
        </button>
        <button 
          onClick={() => setActiveTab("requests")}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === "requests" ? "text-orange-500" : "text-gray-500 hover:text-gray-700"}`}
        >
          Pending Requests
          {requests.length > 0 && <Badge variant="primary" className="ml-2">{requests.length}</Badge>}
          {activeTab === "requests" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading your circle...</div>
      ) : (
        <>
          {activeTab === "all" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {friends.length === 0 ? (
                <div className="sm:col-span-2 text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                  <p className="text-gray-500">You haven't added any friends yet.</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <Card key={friend.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar src={friend.profile_picture_url} fallback={friend.username} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">@{friend.username}</p>
                        <p className="text-xs text-gray-500 truncate">{friend.bio || "No bio"}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(friend.id)}>
                        <UserMinus className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="grid gap-4">
              {requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                  <p className="text-gray-500">No pending requests.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar src={req.sender.profile_picture_url} fallback={req.sender.username} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">@{req.sender.username}</p>
                        <p className="text-xs text-gray-500">Wants to be your friend</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleRespond(req.id, "accepted")}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleRespond(req.id, "rejected")}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
