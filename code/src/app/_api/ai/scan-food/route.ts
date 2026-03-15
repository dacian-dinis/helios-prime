import { NextRequest, NextResponse } from "next/server";
import { CohereClientV2 } from "cohere-ai";

interface FoodItem {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.COHERE_API_KEY;

    // If no API key, return mock data for development
    if (!apiKey) {
      return NextResponse.json({
        items: getMockResults(),
        mock: true,
      });
    }

    const cohere = new CohereClientV2({ token: apiKey });

    // Ensure image has a data URL prefix
    const dataUrl = image.startsWith("data:image/")
      ? image
      : `data:image/jpeg;base64,${image}`;

    const response = await cohere.chat({
      model: "command-a-vision-07-2025",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image. Identify every distinct food item visible.
For each item, estimate:
- name: the food item name
- servingSize: estimated portion (e.g. "150g", "1 cup", "1 medium")
- calories: estimated kcal
- protein: grams
- carbs: grams
- fat: grams

Return ONLY a valid JSON array of objects. No markdown, no explanation. Example:
[{"name":"Grilled Chicken Breast","servingSize":"150g","calories":248,"protein":38,"carbs":0,"fat":10}]`,
            },
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

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    const items: FoodItem[] = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ items, mock: false });
  } catch (error) {
    console.error("AI scan error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}

function getMockResults(): FoodItem[] {
  const foods: FoodItem[][] = [
    [
      { name: "Grilled Chicken Breast", servingSize: "150g", calories: 248, protein: 38, carbs: 0, fat: 10 },
      { name: "Brown Rice", servingSize: "1 cup", calories: 216, protein: 5, carbs: 45, fat: 2 },
      { name: "Steamed Broccoli", servingSize: "100g", calories: 35, protein: 3, carbs: 7, fat: 0 },
    ],
    [
      { name: "Scrambled Eggs", servingSize: "2 large", calories: 182, protein: 12, carbs: 2, fat: 14 },
      { name: "Toast (Whole Wheat)", servingSize: "2 slices", calories: 138, protein: 6, carbs: 24, fat: 2 },
      { name: "Avocado", servingSize: "½ medium", calories: 120, protein: 1, carbs: 6, fat: 11 },
    ],
    [
      { name: "Caesar Salad", servingSize: "1 bowl", calories: 320, protein: 18, carbs: 12, fat: 22 },
    ],
    [
      { name: "Banana", servingSize: "1 medium", calories: 105, protein: 1, carbs: 27, fat: 0 },
      { name: "Greek Yogurt", servingSize: "170g", calories: 100, protein: 17, carbs: 6, fat: 1 },
    ],
  ];
  return foods[Math.floor(Math.random() * foods.length)];
}
