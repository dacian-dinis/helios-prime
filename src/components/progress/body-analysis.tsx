"use client";

import { useState, useRef } from "react";
import {
  X,
  Camera,
  Upload,
  Loader2,
  Sparkles,
  TrendingUp,
  Target,
  Dumbbell,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface BodyAnalysisResult {
  estimatedBodyFat: string;
  physiqueSummary: string;
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  muscleBalance: {
    upper: string;
    lower: string;
    core: string;
    overall: string;
  };
}

interface Props {
  userProfile: {
    goal?: string;
    weightKg?: number;
    heightCm?: number;
    workoutFrequency?: string;
  };
  onClose: () => void;
}

const balanceColors: Record<string, string> = {
  "underdeveloped": "text-red-400",
  "developing": "text-amber-400",
  "moderate": "text-blue-400",
  "well-developed": "text-green-400",
};

const balanceBg: Record<string, string> = {
  "underdeveloped": "bg-red-400",
  "developing": "bg-amber-400",
  "moderate": "bg-blue-400",
  "well-developed": "bg-green-400",
};

const balanceWidth: Record<string, string> = {
  "underdeveloped": "25%",
  "developing": "50%",
  "moderate": "75%",
  "well-developed": "100%",
};

export default function BodyAnalysis({ userProfile, onClose }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BodyAnalysisResult | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch {
      alert("Could not access camera. Please upload a photo instead.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    setImage(canvas.toDataURL("image/jpeg", 0.8));
    setResult(null);
    stopCamera();
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/body-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          goal: userProfile.goal,
          currentWeight: userProfile.weightKg,
          heightCm: userProfile.heightCm,
          workoutFrequency: userProfile.workoutFrequency,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={handleClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Body Analysis
          </h2>
          <button onClick={handleClose} className="rounded-lg p-1 transition hover:bg-foreground/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Privacy note */}
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-foreground/5 p-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40" />
          <p className="text-[10px] text-foreground/40">
            Your photo is sent to the AI for analysis only and is not stored. For best results, use a well-lit photo showing your full torso.
          </p>
        </div>

        {!result ? (
          <>
            {/* Camera / Upload */}
            {cameraActive ? (
              <div className="mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-xl bg-black"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-accent py-2.5 text-xs font-semibold text-black"
                  >
                    <Camera className="h-3.5 w-3.5" /> Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="rounded-lg border border-foreground/20 px-4 py-2.5 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : image ? (
              <div className="mb-4">
                <img src={image} alt="Body photo" className="w-full rounded-xl object-cover" />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={analyze}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-xs font-bold text-black transition hover:bg-accent-dark disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Analyze
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setImage(null); setResult(null); }}
                    className="rounded-lg border border-foreground/20 px-4 py-2.5 text-xs font-medium transition hover:bg-foreground/5"
                  >
                    Retake
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 flex gap-3">
                <button
                  onClick={startCamera}
                  className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6 transition hover:border-accent/30 hover:bg-accent/5"
                >
                  <Camera className="h-8 w-8 text-foreground/30" />
                  <span className="text-xs font-medium text-foreground/50">Take Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6 transition hover:border-accent/30 hover:bg-accent/5"
                >
                  <Upload className="h-8 w-8 text-foreground/30" />
                  <span className="text-xs font-medium text-foreground/50">Upload Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Results */}
            <div className="mb-4 flex items-center gap-3">
              {image && (
                <img src={image} alt="Body" className="h-20 w-20 rounded-xl object-cover" />
              )}
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                    ~{result.estimatedBodyFat} BF
                  </span>
                </div>
                <p className="text-xs text-foreground/60">{result.physiqueSummary}</p>
              </div>
            </div>

            {/* Muscle Balance */}
            <div className="mb-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
              <p className="mb-3 text-xs font-semibold text-foreground/50">Muscle Balance</p>
              <div className="space-y-2">
                {(["upper", "lower", "core"] as const).map((area) => {
                  const level = result.muscleBalance[area];
                  return (
                    <div key={area} className="flex items-center gap-3">
                      <span className="w-12 text-[10px] font-medium capitalize text-foreground/40">{area}</span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                          <div
                            className={`h-full rounded-full transition-all ${balanceBg[level] || "bg-foreground/30"}`}
                            style={{ width: balanceWidth[level] || "50%" }}
                          />
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium capitalize ${balanceColors[level] || ""}`}>
                        {level}
                      </span>
                    </div>
                  );
                })}
                <div className="mt-1 flex items-center gap-1 text-[10px] text-foreground/30">
                  <span>Overall:</span>
                  <span className="font-medium capitalize">{result.muscleBalance.overall}</span>
                </div>
              </div>
            </div>

            {/* Strengths & Areas to Improve */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mb-3 flex w-full items-center justify-between text-xs font-semibold text-foreground/50"
            >
              Detailed Breakdown
              {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showDetails && (
              <>
                <div className="mb-3 rounded-xl border border-green-500/10 bg-green-500/5 p-3">
                  <p className="mb-2 flex items-center gap-1 text-[10px] font-bold text-green-500">
                    <TrendingUp className="h-3 w-3" /> Strengths
                  </p>
                  <div className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <p key={i} className="text-xs text-foreground/60">• {s}</p>
                    ))}
                  </div>
                </div>

                <div className="mb-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
                  <p className="mb-2 flex items-center gap-1 text-[10px] font-bold text-amber-500">
                    <Target className="h-3 w-3" /> Areas to Improve
                  </p>
                  <div className="space-y-1.5">
                    {result.areasToImprove.map((a, i) => (
                      <p key={i} className="text-xs text-foreground/60">• {a}</p>
                    ))}
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-accent/10 bg-accent/5 p-3">
                  <p className="mb-2 flex items-center gap-1 text-[10px] font-bold text-accent">
                    <Dumbbell className="h-3 w-3" /> Recommendations
                  </p>
                  <div className="space-y-1.5">
                    {result.recommendations.map((r, i) => (
                      <p key={i} className="text-xs text-foreground/60">• {r}</p>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { setImage(null); setResult(null); }}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-accent py-2.5 text-xs font-semibold text-black transition hover:bg-accent-dark"
              >
                <Camera className="h-3.5 w-3.5" /> New Analysis
              </button>
              <button
                onClick={handleClose}
                className="rounded-lg border border-foreground/20 px-4 py-2.5 text-xs font-medium transition hover:bg-foreground/5"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
