import { NextRequest, NextResponse } from "next/server";
import { CohereClientV2 } from "cohere-ai";

function getMockScore(data: Record<string, unknown>) {
  let score = 50;
  const tips: string[] = [];

  const calorieAdherence = data.calorieAdherence as number || 0;
  if (calorieAdherence > 80) { score += 15; }
  else if (calorieAdherence > 50) { score += 8; tips.push("Try to hit your calorie target more consistently"); }
  else { tips.push("You're missing your calorie goals most days — focus on meal planning"); }

  const proteinAdherence = data.proteinAdherence as number || 0;
  if (proteinAdherence > 80) { score += 10; }
  else { tips.push("Increase your protein intake to support your goals"); }

  const workoutsThisWeek = data.workoutsThisWeek as number || 0;
  if (workoutsThisWeek >= 4) { score += 15; }
  else if (workoutsThisWeek >= 2) { score += 8; tips.push("Try to get in one more workout this week"); }
  else { tips.push("Aim for at least 3 workouts per week for best results"); }

  const waterAdherence = data.waterAdherence as number || 0;
  if (waterAdherence > 80) { score += 10; }
  else { tips.push("Drink more water — aim for at least 2.5L daily"); }

  if (tips.length === 0) tips.push("You're doing great! Keep up the consistency");

  return {
    score: Math.min(score, 100),
    grade: score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D",
    summary: score >= 80
      ? "Excellent work! You're maintaining great habits across nutrition and training."
      : score >= 60
        ? "Good progress! A few areas could use some attention to reach your full potential."
        : "Room for improvement. Focus on consistency with your nutrition and training.",
    tips,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.COHERE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(getMockScore(body));
    }

    const cohere = new CohereClientV2({ token: apiKey });

    const prompt = `You are a fitness coach AI. Based on the following user data from the past 7 days, generate a health score (0-100), a letter grade, a 1-2 sentence summary, and 3-5 actionable tips.

User data:
- Goal: ${body.goal}
- Daily calorie target: ${body.calorieTarget} kcal
- Calorie adherence: ${body.calorieAdherence}% (days within 10% of target)
- Protein adherence: ${body.proteinAdherence}% (days hitting protein target)
- Average daily water: ${body.avgWaterMl} ml (goal: 2500ml)
- Water adherence: ${body.waterAdherence}%
- Workouts completed this week: ${body.workoutsThisWeek}
- Workout frequency goal: ${body.workoutFrequency} per week
- Current weight: ${body.currentWeight} kg
- Target weight: ${body.targetWeight} kg
- Energy level trend: ${body.avgEnergyLevel}/5

Return ONLY valid JSON (no markdown):
{
  "score": 75,
  "grade": "B",
  "summary": "Brief 1-2 sentence summary",
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

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
    console.error("AI health score error:", error);
    return NextResponse.json(getMockScore({}));
  }
}
