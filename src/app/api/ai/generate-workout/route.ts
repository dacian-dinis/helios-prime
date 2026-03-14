import { NextRequest, NextResponse } from "next/server";
import { CohereClientV2 } from "cohere-ai";

const MOCK_PLANS = [
  {
    name: "Push Day",
    description: "Chest, shoulders, and triceps",
    muscleGroups: ["chest", "shoulders", "arms"],
    exercises: [
      { exerciseId: "bench-press", name: "Bench Press", sets: 4, reps: 8, weight: 60, restSeconds: 90 },
      { exerciseId: "incline-bench", name: "Incline Bench Press", sets: 3, reps: 10, weight: 50, restSeconds: 90 },
      { exerciseId: "db-shoulder-press", name: "Dumbbell Shoulder Press", sets: 3, reps: 10, weight: 16, restSeconds: 60 },
      { exerciseId: "lateral-raise", name: "Lateral Raise", sets: 3, reps: 15, weight: 8, restSeconds: 45 },
      { exerciseId: "tricep-pushdown", name: "Tricep Pushdown", sets: 3, reps: 12, weight: 20, restSeconds: 45 },
      { exerciseId: "overhead-tricep-ext", name: "Overhead Tricep Extension", sets: 3, reps: 12, weight: 14, restSeconds: 45 },
    ],
    estimatedMinutes: 55,
  },
  {
    name: "Pull Day",
    description: "Back and biceps",
    muscleGroups: ["back", "arms"],
    exercises: [
      { exerciseId: "deadlift", name: "Deadlift", sets: 4, reps: 6, weight: 80, restSeconds: 120 },
      { exerciseId: "lat-pulldown", name: "Lat Pulldown", sets: 3, reps: 10, weight: 50, restSeconds: 60 },
      { exerciseId: "seated-cable-row", name: "Seated Cable Row", sets: 3, reps: 10, weight: 45, restSeconds: 60 },
      { exerciseId: "face-pulls", name: "Face Pulls", sets: 3, reps: 15, weight: 15, restSeconds: 45 },
      { exerciseId: "barbell-curl", name: "Barbell Curl", sets: 3, reps: 10, weight: 25, restSeconds: 45 },
      { exerciseId: "hammer-curl", name: "Hammer Curl", sets: 3, reps: 12, weight: 12, restSeconds: 45 },
    ],
    estimatedMinutes: 50,
  },
  {
    name: "Leg Day",
    description: "Quads, hamstrings, glutes, and calves",
    muscleGroups: ["legs", "core"],
    exercises: [
      { exerciseId: "squat", name: "Barbell Squat", sets: 4, reps: 8, weight: 70, restSeconds: 120 },
      { exerciseId: "romanian-deadlift", name: "Romanian Deadlift", sets: 3, reps: 10, weight: 60, restSeconds: 90 },
      { exerciseId: "leg-press", name: "Leg Press", sets: 3, reps: 12, weight: 120, restSeconds: 60 },
      { exerciseId: "leg-curl", name: "Leg Curl", sets: 3, reps: 12, weight: 30, restSeconds: 45 },
      { exerciseId: "calf-raise", name: "Calf Raise", sets: 4, reps: 15, weight: 40, restSeconds: 30 },
      { exerciseId: "plank", name: "Plank", sets: 3, reps: 60, weight: 0, restSeconds: 30 },
    ],
    estimatedMinutes: 55,
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goal, activityLevel, workoutFrequency, focus, equipment } = body;

    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      // Return mock plans
      return NextResponse.json({ plans: MOCK_PLANS });
    }

    const cohere = new CohereClientV2({ token: apiKey });

    const prompt = `You are a certified personal trainer. Generate 3 workout plans based on:
- Goal: ${goal || "general fitness"}
- Activity level: ${activityLevel || "moderate"}
- Workout frequency: ${workoutFrequency || "3-5 per week"}
- Focus: ${focus || "full body"}
- Available equipment: ${equipment || "full gym"}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "plans": [
    {
      "name": "Plan Name",
      "description": "Brief description",
      "muscleGroups": ["chest", "shoulders"],
      "exercises": [
        {
          "exerciseId": "bench-press",
          "name": "Bench Press",
          "sets": 4,
          "reps": 8,
          "weight": 60,
          "restSeconds": 90
        }
      ],
      "estimatedMinutes": 50
    }
  ]
}

Use these exercise IDs when possible: bench-press, incline-bench, db-bench, db-fly, push-ups, cable-crossover, chest-dips, deadlift, pull-ups, lat-pulldown, barbell-row, db-row, seated-cable-row, face-pulls, ohp, db-shoulder-press, lateral-raise, front-raise, rear-delt-fly, arnold-press, barbell-curl, db-curl, hammer-curl, tricep-pushdown, skull-crushers, overhead-tricep-ext, dips, squat, leg-press, romanian-deadlift, lunges, leg-extension, leg-curl, calf-raise, goblet-squat, hip-thrust, bulgarian-split-squat, plank, crunches, russian-twist, leg-raise, mountain-climbers, cable-crunch, ab-wheel, dead-bug, running, cycling, rowing, jump-rope, burpees, kettlebell-swing, thrusters, clean-and-press.

Each plan should have 5-7 exercises. Weight is in kg (0 for bodyweight). For cardio exercises, use reps as duration in seconds.`;

    const response = await cohere.chat({
      model: "command-a-08-2025",
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
    });

    const text =
      response.message?.content?.[0]?.type === "text"
        ? response.message.content[0].text
        : "";

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI workout generation error:", error);
    return NextResponse.json({ plans: MOCK_PLANS });
  }
}
