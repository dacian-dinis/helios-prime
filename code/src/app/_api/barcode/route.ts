import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No barcode provided" }, { status: 400 });
  }

  console.log("Scanned Barcode:", code);

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,nutriments,serving_size,image_url`,
      {
        headers: {
          "User-Agent": "HeliosPrime/1.0 (contact@heliosprime.app)",
        },
      }
    );

    // Handle non-OK HTTP responses cleanly instead of crashing
    if (!res.ok) {
      console.error(`Open Food Facts returned ${res.status} for barcode: ${code}`);
      if (res.status === 404) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      if (res.status === 403) {
        return NextResponse.json({ error: "Request blocked by Open Food Facts" }, { status: 403 });
      }
      return NextResponse.json(
        { error: `Open Food Facts error (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (data.status === 0 || !data.product) {
      console.log(`Product not found for barcode: ${code}`);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const p = data.product;
    const n = p.nutriments || {};

    const result = {
      name: [p.product_name, p.brands].filter(Boolean).join(" - ") || "Unknown product",
      servingSize: p.serving_size || "100g",
      calories: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
      protein: Math.round(n.proteins_100g || 0),
      carbs: Math.round(n.carbohydrates_100g || 0),
      fat: Math.round(n.fat_100g || 0),
      imageUrl: p.image_url || null,
      per100g: true,
    };

    console.log(`Found product: ${result.name} (${result.calories} kcal)`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Barcode lookup error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
