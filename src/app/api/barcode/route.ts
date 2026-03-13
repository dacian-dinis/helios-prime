import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No barcode provided" }, { status: 400 });
  }

  try {
    // Use Open Food Facts API (free, no key needed)
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}?fields=product_name,brands,nutriments,serving_size,image_url`,
      { next: { revalidate: 86400 } }
    );

    const data = await res.json();

    if (data.status === 0 || !data.product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const p = data.product;
    const n = p.nutriments || {};

    return NextResponse.json({
      name: [p.product_name, p.brands].filter(Boolean).join(" - "),
      servingSize: p.serving_size || "100g",
      calories: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
      protein: Math.round(n.proteins_100g || 0),
      carbs: Math.round(n.carbohydrates_100g || 0),
      fat: Math.round(n.fat_100g || 0),
      imageUrl: p.image_url || null,
      per100g: true,
    });
  } catch (error) {
    console.error("Barcode lookup error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
