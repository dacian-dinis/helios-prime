"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkoutStore } from "@/stores/workout-store";
import { useProgressStore } from "@/stores/progress-store";
import { useFastingStore } from "@/stores/fasting-store";
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Flame,
  Dumbbell,
  Timer,
  TrendingDown,
  Send,
  Sparkles,
} from "lucide-react";

interface FeedPost {
  id: string;
  userName: string;
  avatar: string;
  time: string;
  type: "workout" | "milestone" | "streak" | "weight" | "fasting";
  title: string;
  body: string;
  likes: number;
  comments: number;
  isOwn?: boolean;
}

const SAMPLE_POSTS: FeedPost[] = [
  {
    id: "s1",
    userName: "Alex R.",
    avatar: "AR",
    time: "2h ago",
    type: "workout",
    title: "New PR on Bench Press!",
    body: "Finally hit 100kg for 3 reps. Been chasing this for months. Progressive overload really works when you're patient.",
    likes: 24,
    comments: 8,
  },
  {
    id: "s2",
    userName: "Sarah M.",
    avatar: "SM",
    time: "4h ago",
    type: "milestone",
    title: "30 Day Streak!",
    body: "Haven't missed a single day logging my food for 30 days straight. The consistency is paying off — down 4kg!",
    likes: 47,
    comments: 12,
  },
  {
    id: "s3",
    userName: "Jake T.",
    avatar: "JT",
    time: "6h ago",
    type: "fasting",
    title: "Completed a 24h Fast",
    body: "First time doing OMAD. Wasn't as hard as I expected after getting used to 18:6 for a few weeks.",
    likes: 15,
    comments: 5,
  },
  {
    id: "s4",
    userName: "Maria K.",
    avatar: "MK",
    time: "1d ago",
    type: "weight",
    title: "Hit My Goal Weight!",
    body: "Started at 78kg in January, goal was 65kg. Today I weighed in at 64.8kg! Couldn't have done it without tracking everything.",
    likes: 89,
    comments: 31,
  },
  {
    id: "s5",
    userName: "Chris D.",
    avatar: "CD",
    time: "1d ago",
    type: "workout",
    title: "5x5 Squats Complete",
    body: "Leg day done. Squatted 120kg 5x5. Walking might be optional tomorrow.",
    likes: 32,
    comments: 9,
  },
];

const TYPE_ICONS: Record<string, typeof Trophy> = {
  workout: Dumbbell,
  milestone: Trophy,
  streak: Flame,
  weight: TrendingDown,
  fasting: Timer,
};

const TYPE_COLORS: Record<string, string> = {
  workout: "bg-blue-500/10 text-blue-400",
  milestone: "bg-amber-500/10 text-amber-400",
  streak: "bg-orange-500/10 text-orange-400",
  weight: "bg-green-500/10 text-green-400",
  fasting: "bg-purple-500/10 text-purple-400",
};

export default function CommunityPage() {
  const { user, isLoading, loadFromStorage } = useAuthStore();
  const { sessions, loadFromStorage: loadWorkouts } = useWorkoutStore();
  const { weightLog, loadFromStorage: loadProgress } = useProgressStore();
  const { history: fastingHistory, loadFromStorage: loadFasting } = useFastingStore();

  const [posts, setPosts] = useState<FeedPost[]>(SAMPLE_POSTS);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [shareType, setShareType] = useState<string | null>(null);
  const [shareText, setShareText] = useState("");

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (user) {
      loadWorkouts(user.id);
      loadProgress(user.id);
      loadFasting(user.id);
    }
  }, [user, loadWorkouts, loadProgress, loadFasting]);

  const handleLike = (id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likes: likedPosts.has(id) ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleShare = () => {
    if (!shareType || !shareText.trim() || !user) return;
    const newPost: FeedPost = {
      id: Math.random().toString(36).slice(2),
      userName: user.name || "You",
      avatar: (user.name || "U").slice(0, 2).toUpperCase(),
      time: "Just now",
      type: shareType as FeedPost["type"],
      title: shareText.split("\n")[0] || "Update",
      body: shareText,
      likes: 0,
      comments: 0,
      isOwn: true,
    };
    setPosts([newPost, ...posts]);
    setShareType(null);
    setShareText("");
  };

  if (isLoading || !user) return null;

  // Quick share suggestions from user data
  const recentSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const totalWorkouts = sessions.length;
  const completedFasts = fastingHistory.filter((f) => !f.cancelled).length;

  const suggestions = [
    totalWorkouts > 0 && {
      type: "workout",
      text: `Just completed workout #${totalWorkouts}${recentSession ? `: ${recentSession.planName || "Quick Session"}` : ""}!`,
    },
    weightLog.length >= 2 && {
      type: "weight",
      text: `Weight update: ${weightLog[weightLog.length - 1].weightKg}kg — ${
        weightLog[weightLog.length - 1].weightKg < weightLog[0].weightKg ? "down" : "up"
      } ${Math.abs(weightLog[weightLog.length - 1].weightKg - weightLog[0].weightKg).toFixed(1)}kg from start!`,
    },
    completedFasts > 0 && {
      type: "fasting",
      text: `Completed ${completedFasts} fasting session${completedFasts > 1 ? "s" : ""}! Intermittent fasting is becoming a habit.`,
    },
  ].filter(Boolean) as { type: string; text: string }[];

  return (
    <div className="pb-24 md:pb-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Users className="h-5 w-5 text-accent" />
          Community
        </h1>
      </div>

      {/* Share Section */}
      <div className="mb-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
        {shareType ? (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${TYPE_COLORS[shareType]}`}>
                {shareType}
              </span>
              <button
                onClick={() => { setShareType(null); setShareText(""); }}
                className="text-[10px] text-foreground/30 hover:text-foreground/50"
              >
                Cancel
              </button>
            </div>
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Share your achievement..."
              rows={3}
              className="mb-3 w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm placeholder:text-foreground/30 focus:border-accent/30 focus:outline-none"
            />
            <button
              onClick={handleShare}
              disabled={!shareText.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-black transition hover:bg-accent-dark disabled:opacity-50"
            >
              <Send className="h-3 w-3" />
              Post
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-foreground/50">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Share an Achievement
            </p>

            {suggestions.length > 0 ? (
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setShareType(s.type); setShareText(s.text); }}
                    className="flex w-full items-start gap-2 rounded-lg border border-foreground/10 p-2.5 text-left transition hover:border-accent/30 hover:bg-accent/5"
                  >
                    <Share2 className="mt-0.5 h-3 w-3 shrink-0 text-foreground/30" />
                    <span className="text-xs text-foreground/60">{s.text}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-foreground/30">
                Complete a workout, log your weight, or finish a fast to share with the community!
              </p>
            )}

            <button
              onClick={() => setShareType("milestone")}
              className="mt-2 text-xs font-medium text-accent hover:text-accent-dark"
            >
              Write a custom post →
            </button>
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => {
          const Icon = TYPE_ICONS[post.type] || Trophy;
          const liked = likedPosts.has(post.id);
          return (
            <div
              key={post.id}
              className={`rounded-2xl border p-4 transition ${
                post.isOwn
                  ? "border-accent/20 bg-accent/5"
                  : "border-foreground/10 bg-foreground/[0.02]"
              }`}
            >
              {/* Header */}
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-bold">
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">
                    {post.userName}
                    {post.isOwn && <span className="ml-1 text-accent">(You)</span>}
                  </p>
                  <p className="text-[10px] text-foreground/30">{post.time}</p>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[post.type]}`}>
                  <Icon className="h-2.5 w-2.5" />
                  {post.type}
                </span>
              </div>

              {/* Content */}
              <p className="mb-1 text-sm font-semibold">{post.title}</p>
              <p className="mb-3 text-xs text-foreground/60 leading-relaxed">{post.body}</p>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 text-xs transition ${
                    liked ? "font-semibold text-red-400" : "text-foreground/40 hover:text-red-400"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-400" : ""}`} />
                  {post.likes + (liked ? 1 : 0)}
                </button>
                <span className="flex items-center gap-1 text-xs text-foreground/30">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {post.comments}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
