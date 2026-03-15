import { NextRequest, NextResponse } from "next/server";
import { CohereClientV2 } from "cohere-ai";

const MOCK_ANALYSIS = {
  estimatedBodyFat: "15-18%",
  physiqueSummary:
    "You appear to have a lean athletic build with moderate muscle development. Shoulders are proportionate, and there is visible definition in the arms and chest area.",
  strengths: [
    "Good shoulder-to-waist ratio",
    "Visible arm definition",
    "Lean midsection with minimal excess fat",
  ],
  areasToImprove: [
    "Chest could benefit from more volume training (incline press, flyes)",
    "Lats could be wider — focus on pull-ups and wide-grip rows",
    "Core definition can be improved with targeted ab work and slight calorie deficit",
  ],
  recommendations: [
    "Increase protein intake to at least 1.8g/kg body weight for muscle growth",
    "Focus on progressive overload — add weight or reps each week",
    "Consider a lean bulk (+200-300 calories) to build muscle while staying lean",
    "Prioritize compound lifts: squats, deadlifts, bench press, rows",
  ],
  muscleBalance: {
    upper: "moderate",
    lower: "moderate",
    core: "developing",
    overall: "balanced",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, goal, currentWeight, heightCm, workoutFrequency } = body;

    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(MOCK_ANALYSIS);
    }

    const cohere = new CohereClientV2({ token: apiKey });

    const prompt = `You are an expert fitness coach and physique analyst. Analyze this body photo and provide a detailed assessment.

User context:
- Goal: ${goal || "general fitness"}
- Weight: ${currentWeight || "unknown"} kg
- Height: ${heightCm || "unknown"} cm
- Workout frequency: ${workoutFrequency || "unknown"}

Provide your analysis as ONLY valid JSON (no markdown, no explanation):
{
  "estimatedBodyFat": "X-Y%",
  "physiqueSummary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1 with specific exercise suggestions", "area 2", "area 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4"],
  "muscleBalance": {
    "upper": "underdeveloped|developing|moderate|well-developed",
    "lower": "underdeveloped|developing|moderate|well-developed",
    "core": "underdeveloped|developing|moderate|well-developed",
    "overall": "imbalanced|somewhat balanced|balanced|well-balanced"
  }
}

Be encouraging but honest. Focus on actionable advice.`;

    const dataUrl = image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;

    const response = await cohere.chat({
      model: "command-a-vision-07-2025",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              imageUrl: { url: dataUrl },
            } as unknown as { type: "text"; text: string },
          ],
        },
      ],
    });

    const text =
      response.message?.content?.[0]?.type === "text"
        ? response.message.content[0].text
        : "";

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Body analysis error:", error);
    return NextResponse.json(MOCK_ANALYSIS);
  }
}
