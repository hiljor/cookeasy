"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

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
  const t = useTranslations("Social.friends");
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
      toast.error("Failed to fetch friends data");
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
      if (res.ok) {
        toast.success(action === "accepted" ? "Friend request accepted" : "Friend request rejected");
        fetchData();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Action failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemove = async (friendId: string) => {
    if (!confirm(t("actions.removeConfirm"))) return;
    try {
      const res = await fetch(`/api/social/friends/${friendId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Friend removed");
        fetchData();
      } else {
        throw new Error("Failed to remove friend");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold dark:text-white">{t("title")}</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none dark:bg-zinc-900 dark:border-zinc-800">
            <Search className="w-4 h-4 mr-2" /> {t("findUsers")}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("all")}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "all" ? "text-orange-500" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}
        >
          {t("tabs.all")} ({friends.length})
          {activeTab === "all" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
        </button>
        <button 
          onClick={() => setActiveTab("requests")}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "requests" ? "text-orange-500" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}
        >
          {t("tabs.requests")}
          {requests.length > 0 && <Badge variant="primary" className="ml-2">{requests.length}</Badge>}
          {activeTab === "requests" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">{t("loading")}</div>
      ) : (
        <>
          {activeTab === "all" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {friends.length === 0 ? (
                <div className="sm:col-span-2 text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-500 dark:text-zinc-400">{t("empty.friends")}</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <Card key={friend.id} className="dark:bg-zinc-900 dark:border-zinc-800">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar src={friend.profile_picture_url} fallback={friend.username} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate dark:text-white">@{friend.username}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{friend.bio || "No bio"}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(friend.id)}>
                        <UserMinus className="w-4 h-4 text-zinc-400 hover:text-red-500 transition-colors" />
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
                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-500 dark:text-zinc-400">{t("empty.requests")}</p>
                </div>
              ) : (
                requests.map((req) => (
                  <Card key={req.id} className="dark:bg-zinc-900 dark:border-zinc-800">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar src={req.sender.profile_picture_url} fallback={req.sender.username} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate dark:text-white">@{req.sender.username}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("actions.wantsToBeFriend")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRespond(req.id, "accepted")}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10" onClick={() => handleRespond(req.id, "rejected")}>
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
