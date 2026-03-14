"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  GraduationCap,
  Star,
  MapPin,
  Filter,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Dumbbell,
  Apple,
  Heart,
  Brain,
  Flame,
} from "lucide-react";

interface Coach {
  id: string;
  name: string;
  avatar: string;
  title: string;
  specialties: string[];
  rating: number;
  reviews: number;
  location: string;
  priceRange: string;
  bio: string;
  certifications: string[];
  yearsExp: number;
  online: boolean;
}

const SPECIALTIES = [
  { id: "all", label: "All", icon: Filter },
  { id: "strength", label: "Strength", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "weight-loss", label: "Weight Loss", icon: Flame },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "mindset", label: "Mindset", icon: Brain },
];

const MOCK_COACHES: Coach[] = [
  {
    id: "c1",
    name: "David Chen",
    avatar: "DC",
    title: "Certified Strength Coach",
    specialties: ["strength", "nutrition"],
    rating: 4.9,
    reviews: 127,
    location: "Los Angeles, CA",
    priceRange: "$80-120/session",
    bio: "10+ years coaching competitive athletes and everyday lifters. I specialize in powerlifting programming and evidence-based nutrition coaching.",
    certifications: ["CSCS", "Precision Nutrition L2"],
    yearsExp: 12,
    online: true,
  },
  {
    id: "c2",
    name: "Emma Patel",
    avatar: "EP",
    title: "Registered Dietitian & Coach",
    specialties: ["nutrition", "weight-loss"],
    rating: 4.8,
    reviews: 93,
    location: "London, UK",
    priceRange: "$60-90/session",
    bio: "Registered dietitian specializing in sustainable weight loss. No fad diets — just science-backed strategies that fit your lifestyle.",
    certifications: ["RD", "ACE-CPT"],
    yearsExp: 8,
    online: true,
  },
  {
    id: "c3",
    name: "Marcus Johnson",
    avatar: "MJ",
    title: "Performance Coach",
    specialties: ["strength", "wellness"],
    rating: 4.7,
    reviews: 68,
    location: "Austin, TX",
    priceRange: "$70-100/session",
    bio: "Former D1 athlete turned coach. I help busy professionals build strength, improve mobility, and feel their best without living at the gym.",
    certifications: ["NASM-CPT", "FMS L2"],
    yearsExp: 6,
    online: true,
  },
  {
    id: "c4",
    name: "Lisa Nakamura",
    avatar: "LN",
    title: "Wellness & Mindset Coach",
    specialties: ["wellness", "mindset", "weight-loss"],
    rating: 4.9,
    reviews: 156,
    location: "Vancouver, BC",
    priceRange: "$90-130/session",
    bio: "Holistic approach to health — combining training, nutrition, sleep, and stress management. I believe fitness starts with your mindset.",
    certifications: ["ACE-HC", "Yoga Alliance RYT-500"],
    yearsExp: 10,
    online: true,
  },
  {
    id: "c5",
    name: "James Wright",
    avatar: "JW",
    title: "Bodybuilding & Physique Coach",
    specialties: ["strength", "nutrition"],
    rating: 4.6,
    reviews: 44,
    location: "Miami, FL",
    priceRange: "$100-150/session",
    bio: "Natural bodybuilding competitor and prep coach. I help clients build muscle, dial in their nutrition, and step on stage with confidence.",
    certifications: ["ISSA-CPT", "Precision Nutrition L1"],
    yearsExp: 7,
    online: true,
  },
  {
    id: "c6",
    name: "Ana Rodriguez",
    avatar: "AR",
    title: "Weight Loss Specialist",
    specialties: ["weight-loss", "nutrition", "mindset"],
    rating: 4.8,
    reviews: 112,
    location: "Madrid, Spain",
    priceRange: "$50-80/session",
    bio: "Lost 30kg myself and now help others do the same. Behavioral change is the key — I'll help you build habits that last a lifetime.",
    certifications: ["NASM-CPT", "Behavioral Change Specialist"],
    yearsExp: 5,
    online: true,
  },
];

export default function CoachesPage() {
  const { user, isLoading, loadFromStorage } = useAuthStore();
  const [filter, setFilter] = useState("all");
  const [expandedCoach, setExpandedCoach] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (isLoading || !user) return null;

  const filtered = filter === "all"
    ? MOCK_COACHES
    : MOCK_COACHES.filter((c) => c.specialties.includes(filter));

  return (
    <div className="pb-24 md:pb-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <GraduationCap className="h-5 w-5 text-accent" />
          Find a Coach
        </h1>
      </div>

      <p className="mb-4 text-xs text-foreground/40">
        Browse certified fitness coaches and nutritionists. All coaches offer online sessions.
      </p>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {SPECIALTIES.map((s) => {
          const active = filter === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-accent text-black"
                  : "border border-foreground/10 text-foreground/50 hover:border-accent/30 hover:text-foreground"
              }`}
            >
              <s.icon className="h-3 w-3" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Coach List */}
      <div className="space-y-4">
        {filtered.map((coach) => {
          const expanded = expandedCoach === coach.id;
          return (
            <div
              key={coach.id}
              className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 transition hover:border-foreground/20"
            >
              {/* Header */}
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                  {coach.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{coach.name}</p>
                  <p className="text-[11px] text-foreground/50">{coach.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                      <Star className="h-2.5 w-2.5 fill-amber-400" />
                      {coach.rating} ({coach.reviews})
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-foreground/30">
                      <MapPin className="h-2.5 w-2.5" />
                      {coach.location}
                    </span>
                  </div>
                </div>
                <span className="whitespace-nowrap rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-foreground/50">
                  {coach.priceRange}
                </span>
              </div>

              {/* Specialties */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {coach.specialties.map((s) => {
                  const spec = SPECIALTIES.find((sp) => sp.id === s);
                  return (
                    <span
                      key={s}
                      className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium capitalize text-accent"
                    >
                      {spec?.label || s}
                    </span>
                  );
                })}
              </div>

              {/* Bio */}
              <p className="mb-3 text-xs text-foreground/60 leading-relaxed">{coach.bio}</p>

              {/* Expand */}
              <button
                onClick={() => setExpandedCoach(expanded ? null : coach.id)}
                className="mb-3 flex items-center gap-1 text-[10px] font-medium text-foreground/30 hover:text-foreground/50"
              >
                {expanded ? "Less info" : "More info"}
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {expanded && (
                <div className="mb-3 space-y-2 rounded-lg bg-foreground/5 p-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-3 w-3 text-foreground/40" />
                    <span className="text-[10px] text-foreground/50">
                      Certifications: {coach.certifications.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3 w-3 text-foreground/40" />
                    <span className="text-[10px] text-foreground/50">
                      {coach.yearsExp} years experience
                    </span>
                  </div>
                  {coach.online && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3 text-accent" />
                      <span className="text-[10px] text-accent">Available for online coaching</span>
                    </div>
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-xs font-semibold text-black transition hover:bg-accent-dark">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contact
                </button>
                <button className="rounded-lg border border-foreground/10 px-4 py-2 text-xs font-medium text-foreground/60 transition hover:bg-foreground/5">
                  Save
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-xs text-foreground/30">
          No coaches found for this specialty. Try a different filter.
        </p>
      )}
    </div>
  );
}
