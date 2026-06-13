import { WardrobeItem, WardrobeStats } from "./types";

export interface SeasonConfig {
  id: string;
  name: string;
  type: "actual" | "future";
  description: string;
  summaryTitle: string;
  principles: { title: string; desc: string }[];
}

// Full-text aesthetic descriptions of her seasons as outlined in her spreadsheet tabs
export const SEASONS_CONFIG: SeasonConfig[] = [
  {
    id: "Summer 25-26",
    name: "Summer 25-26",
    type: "actual",
    description: "This summer capsule wardrobe maintains a refined, yet relaxed aesthetic that can be categorized as Elevated Casual Chic with a strong focus on breathable fabrics and versatile layering.",
    summaryTitle: "☀️ Summer Style Summary",
    principles: [
      {
        title: "Comfort & Breathability",
        desc: "Focus on comfort and breathability with a high presence of linen, lightweight cotton, and chambray (in dresses, tops, and shorts) making the wardrobe highly functional for hot weather."
      },
      {
        title: "Neutral Base, Soft Accents",
        desc: "The core colors are classic and cool (Navy, Black, White, Cream, Grey), which are instantly elevated by soft, sun-friendly accents like Khaki, Olive Green, and Sage."
      },
      {
        title: "Structured Fluidity",
        desc: "The silhouettes balance structure (Tailored Black Shorts, Tapered Trousers, Trench Coats) with flow (Midi Skirts, Linen Dresses), ensuring outfits look polished, not sloppy."
      },
      {
        title: "Practical Footwear",
        desc: "The choice of flat or low-heel shoe styles (sandals, trainers, loafers, slides, ballet flats) speaks to a lifestyle requiring comfort and ease."
      },
      {
        title: "Layering Capability",
        desc: "Even in summer, the inclusion of button-downs, light cardigans, and lightweight outerwear (trench, denim jackets) provides coverage for air conditioning or cooler evenings."
      }
    ]
  },
  {
    id: "Autumn 26",
    name: "Autumn 26",
    type: "actual",
    description: "🍁 Curated transitional wardrobe pulling layering fundamentals from both summer items and winter storage, accented by new designer garment purchases. Comfortable, rich, and balanced for autumn's golden lighting.",
    summaryTitle: "🍁 Autumn Style Summary",
    principles: [
      {
        title: "Transitional Layering",
        desc: "Pulleys light layers and breezy tanks from the summer capsule and integrates cozy wool blends and merino long sleeves to step seamlessly into cooler winds."
      },
      {
        title: "Silt Tones & Warm Accents",
        desc: "Features a rich base of deep black, greys, and cream, beautifully highlighted with muted silt elements, burnt orange, and washed denim accents."
      },
      {
        title: "Boot Utility & Durability",
        desc: "Ready for transition with premium Blundstone ankle boots in black and brown suede, ensuring perfect comfort."
      }
    ]
  },
  {
    id: "Winter 26",
    name: "Winter 26",
    type: "actual",
    description: "❄️ Nelson Winter Capsule Wardrobe: This wardrobe is strong on versatility, layering, and comfort, making it perfect for Nelson's variable winter weather. Relying heavily on classic neutrals accented by rich jewel tones.",
    summaryTitle: "❄️ Nelson Winter Style Summary",
    principles: [
      {
        title: "Tops & Knits (Versatility for Layering)",
        desc: "Excellent foundation with multiple V-neck tees and fitted tanks for essential layering under cardigans and coats. Crop wool and wrap cardigans provide adjustable heat retention."
      },
      {
        title: "Bottoms & Dresses (Practical & Texture)",
        desc: "Robust dark base of straight-cut ribcage jeans, tapered trousers, and thermal-lined leggings. Cozy warm wools and green corduroy add premium texture."
      },
      {
        title: "Outerwear (Weather Ready)",
        desc: "Essential protection from the elements with a Rains Waterproof Parka/Trench, thick Grey Wool coat, and an unexpected Dark Green denim jacket."
      },
      {
        title: "Accessories & Footwear (Comfort & Pop)",
        desc: "樱桃红 (Cherry Red) Doc Martens and Blundstone boots ensure waterproof resilience, while the Statement Red Leather Hobo Bag lifts neutral outerwear coats."
      }
    ]
  },
  {
    id: "Handbag Inventory",
    name: "Handbag Inventory",
    type: "actual",
    description: "💼 Accessories & Bag Collection: Minimalist yet highly functional organizer of current leather satchels, textured red hobos, greige totes, and waxed canvas bags. Evaluating carrying capacity and rating comfort.",
    summaryTitle: "💼 Accessories Collection Summary & Quality Grading",
    principles: [
      {
        title: "Graded Leather Patina",
        desc: "Includes premium unlined satchels from The Leather Satchel Company, Yukon full-grain leather, and soft, forgiving lined Etsy hobo findouts."
      },
      {
        title: "Capacities & Accessibility",
        desc: "Carefully outlines compartment space, identifying deep bags that can feel like a 'black hole' versus structured small daisy crossbody bags."
      },
      {
        title: "Utility & Straps",
        desc: "Rates performance from 1 to 5 stars based on strap comfort, hands-free crossbodies, external pockets accessibility, and top handles convenience."
      }
    ]
  },
  {
    id: "Dream AW",
    name: "Dream AW (Future)",
    type: "future",
    description: "⭐️ Dream AW Future Roadmap: A line-by-line dream aspiration planner mapping critical high-quality pieces she wants to acquire for a polished upcoming cold-season wardrobe.",
    summaryTitle: "⭐️ Future Capsule Planning Strategy",
    principles: [
      {
        title: "Coveted Brand Investments",
        desc: "Plan to purchase elite traditional footwear including RM Williams (yearling or gardener boots) and Cheaneys/Glenson brogues."
      },
      {
        title: "Textured Aspiration Patterns",
        desc: "Map classic winter textures including houndstooth wide-leg trousers and Kayla Kilt skirts for a structured traditional twist."
      },
      {
        title: "Strategic Avoidance of Excess",
        desc: "Clearly distinguishes 'Possembled' (E) from 'Target Needs' (Buy) preventing duplicate items and ensuring high wear-frequency ratio."
      }
    ]
  }
];

// Gorgeous initial curated capsule wardrobe.
// Tagged beautifully across her active seasons to showcase the multi-season tabs.
export const initialCuratedWardrobe: WardrobeItem[] = [
  {
    id: "curated-001",
    item: "Linen button down",
    color: "Off White",
    hex: "#eae6df",
    description: "Parchment marl linen shirt",
    brand: "MAX",
    notes: "Ordered in boxing day sale 30% off. Flowy, breathable fabric.",
    status: "existing",
    season: "Summer 25-26",
    aiStyleTags: ["Summer Base", "Linen Cool", "Relaxed Chic"],
    aiStylingAdvice: "Pair loose over linen shorts or straight crop black jeans with cream leather sandals."
  },
  {
    id: "curated-002",
    item: "High waisted denim shorts",
    color: "Mid Wash Blue",
    hex: "#60a5fa",
    description: "Relaxed high rise summer shorts",
    brand: "MAX",
    notes: "Ordered in black Friday sale, 20% off. Perfect soft cotton texture.",
    status: "existing",
    season: "Summer 25-26",
    aiStyleTags: ["Summer Style", "Laidback", "Everyday Base"],
    aiStylingAdvice: "Tuck in a basic white V-neck or fitted black tank. Roll up hem slightly."
  },
  {
    id: "curated-003",
    item: "Cropped length cardigan",
    color: "Black Wool",
    hex: "#1c1917",
    description: "Cropped button merino layer",
    brand: "Max",
    notes: "Pulled from storage for autumn transition. Super cozy wool stretch.",
    status: "existing",
    season: "Autumn 26",
    aiStyleTags: ["Autumn Wear", "Cozy Merino", "Smart Knit"],
    aiStylingAdvice: "Button fully and tuck into tapered cargo pants, or wear layer open over a striped breton top."
  },
  {
    id: "curated-004",
    item: "Straight cut crop jeans",
    color: "Black 501",
    hex: "#3f3f46",
    description: "Classic high waist crop jeans",
    brand: "Levis",
    notes: "Pulled from summer capsule. Great structure and matches black ankle boots.",
    status: "existing",
    season: "Autumn 26",
    aiStyleTags: ["Transition", "Classic Denim", "Edgy Minimal"],
    aiStylingAdvice: "Coordinate with brown suede Blundstones and cream fine knit silk cardigan."
  },
  {
    id: "curated-005",
    item: "Long sleeve dress",
    color: "Dark Green Corduroy",
    hex: "#3d5236",
    description: "Thick winter weight silhouette dress",
    brand: "Farmers",
    notes: "Super warm cotton corduroy fabric. Keeps cold Nelson wind away.",
    status: "existing",
    season: "Winter 26",
    aiStyleTags: ["Nelson Winter", "Rich Corduroy", "Jewel Tone"],
    aiStylingAdvice: "Style with thermal tights, cherry red Doc Martens, and the red leather Hobo bag for contrast."
  },
  {
    id: "curated-006",
    item: "Ankle boots",
    color: "Cherry Red",
    hex: "#58181a",
    description: "Waterproof leather bouncing sole boots",
    brand: "Dr Martens",
    notes: "Extremely durable, excellent for winter rain days and walks.",
    status: "existing",
    season: "Winter 26",
    aiStyleTags: ["Winter Rain", "Color Pop", "Tough Footwear"],
    aiStylingAdvice: "Wear under rolled-up dark indigo jeans with a long charcoal grey wool military coat."
  },
  {
    id: "curated-007",
    item: "Crossbody 'pixie' Bag",
    color: "Black Leather",
    hex: "#111111",
    description: "Expanded unlined crossbody",
    brand: "The Leather Satchel Company",
    notes: "Good size, fits a surprising amount. Elegant look, practical back slip pocket.",
    status: "existing",
    season: "Handbag Inventory",
    aiStyleTags: ["Premium Leather", "5-Star Satchel", "Day & Night"],
    aiStylingAdvice: "Matches cream sandals, black loafers, or Doc Martens effortlessly."
  },
  {
    id: "curated-008",
    item: "Hobo bag",
    color: "Red Leather",
    hex: "#8B5A2B",
    description: "Worn soft forgiving large shoulder carrier",
    brand: "The Leather Store (Etsy)",
    notes: "Matches cherry red Doc Martens. Autumn/Winter staple. Adds perfect splash of color.",
    status: "existing",
    season: "Handbag Inventory",
    aiStyleTags: ["Soft Suede", "Color Burst", "Winter Carrier"],
    aiStylingAdvice: "Perfect pairing with a grey wool coatigan or black trench coat."
  },
  {
    id: "curated-009",
    item: "Ankle boots",
    color: "Brown Leather",
    hex: "#5c4033",
    description: "Classic yearling Chelsea boots",
    brand: "RM Williams",
    notes: "Coveted premium boot investment. Aspirational item on wishlist.",
    status: "buy",
    season: "Dream AW",
    aiStyleTags: ["Dream Aspiration", "Lifetime Leather", "Heritage Workwear"],
    aiStylingAdvice: "Pair with vintage wash Levi ribcage denim and a grey cable knit sweater."
  },
  {
    id: "curated-010",
    item: "High waisted trousers",
    color: "Houndstooth Check",
    hex: "#78716c",
    description: "Clarke pleated traditional wool pants",
    brand: "Kilt",
    notes: "Local NZ designer wish list. Houndstooth coordinates beautifully.",
    status: "buy",
    season: "Dream AW",
    aiStyleTags: ["NZ Designer", "Pattern Texture", "Tailored Elegance"],
    aiStylingAdvice: "Coordinates with a black long sleeve merino knit and gold accent belt."
  }
];

// Helper to compile statistics for wardrobe analysis
export function compileWardrobeStats(items: WardrobeItem[]): WardrobeStats {
  const totalCount = items.length;
  const existingCount = items.filter(i => i.status === "existing").length;
  const buyCount = items.filter(i => i.status === "buy").length;

  const itemsByCategory: Record<string, number> = {};
  const colorsMap: Record<string, { color: string; hex: string; count: number }> = {};
  const brandsMap: Record<string, number> = {};

  items.forEach(item => {
    // 1. Category tally
    const cat = item.aiSuggestedCategory || "Tops";
    itemsByCategory[cat] = (itemsByCategory[cat] || 0) + 1;

    // 2. Color tally
    const colName = item.color.trim();
    if (colName) {
      if (!colorsMap[colName]) {
        colorsMap[colName] = { color: colName, hex: item.hex || "#cccccc", count: 0 };
      }
      colorsMap[colName].count += 1;
    }

    // 3. Brand tally
    const bName = item.brand.trim() || "Unbranded";
    brandsMap[bName] = (brandsMap[bName] || 0) + 1;
  });

  const colorsPresent = Object.values(colorsMap).sort((a, b) => b.count - a.count);
  const brandsPresent = Object.entries(brandsMap)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalCount,
    existingCount,
    buyCount,
    itemsByCategory,
    colorsPresent,
    brandsPresent
  };
}

// Advanced CSV / TSV spreadsheet parsing helper that automatically analyzes data models per tab!
export function parseSpreadsheetText(text: string, forceSeason?: string): Omit<WardrobeItem, "id" | "hex">[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // 1. Double check if we can guess the active season from the content/headers
  let detectedSeason = forceSeason || "Summer 25-26";
  const contentSnapshot = text.toLowerCase();

  if (contentSnapshot.includes("handbag inventory") || contentSnapshot.includes("leather, unlined") || contentSnapshot.includes("satchel company")) {
    detectedSeason = "Handbag Inventory";
  } else if (contentSnapshot.includes("dream capsule aw") || contentSnapshot.includes("rm williams") || contentSnapshot.includes("brogue boots")) {
    detectedSeason = "Dream AW";
  } else if (contentSnapshot.includes("winter capsule 2026") || contentSnapshot.includes("nelson winter") || contentSnapshot.includes("farmers") || contentSnapshot.includes("doc martens")) {
    detectedSeason = "Winter 26";
  } else if (contentSnapshot.includes("autumn 26") || contentSnapshot.includes("existing, pulled from storage")) {
    detectedSeason = "Autumn 26";
  } else if (contentSnapshot.includes("summer capsule 2025")) {
    detectedSeason = "Summer 25-26";
  }

  // Find a header line that has actual content keys
  // For handbags, there might not be a header line. Let's inspect the first non-intro line
  let headerIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const lLower = lines[i].toLowerCase();
    if (
      lLower.includes("item") || 
      lLower.includes("colour") || 
      lLower.includes("source") || 
      lLower.includes("brand") || 
      lLower.includes("satchel")
    ) {
      headerIndex = i;
      break;
    }
  }

  const headerLine = lines[headerIndex];
  // Detect delimiter
  let delimiter = ",";
  if (headerLine.includes("\t")) {
    delimiter = "\t";
  }

  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase());

  const parsedItems: Omit<WardrobeItem, "id" | "hex">[] = [];

  // Parse lines starting after headerIndex
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines or total rows
    if (!line || line.toLowerCase().startsWith("total") || line.startsWith(",,,") || line.startsWith("total,")) continue;

    let parts: string[] = [];
    if (delimiter === ",") {
      parts = parseCsvLine(line);
    } else {
      parts = line.split(delimiter).map(p => p.trim());
    }

    // Ignore line if it is just commas (from excel exporting wider blank cells)
    if (parts.every(p => !p || p === "")) continue;

    // Handle distinct model schemas
    if (detectedSeason === "Handbag Inventory") {
      // Schema: Brand, Color, Type, Material, Size, Pros, Cons, Rating
      // Or in the file: row starts with Brand like "The Leather Satchel Company, Black, Satchel..."
      // Let's safe read indexes:
      // index 0: Brand
      // index 1: Color
      // index 2: Type (Item)
      // index 3: Material
      // index 4: Size
      // index 5: Pros
      // index 6: Cons
      // index 7: Rating
      const brandVal = parts[0]?.trim() || "Classic";
      const colorVal = parts[1]?.trim() || "Black";
      const typeVal = parts[2]?.trim() || "Handbag";
      const materialVal = parts[3]?.trim() || "";
      const sizeVal = parts[4]?.trim() || "";
      const prosVal = parts[5]?.trim() || "";
      const consVal = parts[6]?.trim() || "";
      const ratingVal = parts[7]?.trim() || "5";

      if (brandVal && typeVal) {
        let cleanNotes = `Rating: ${ratingVal}/5. Size: ${sizeVal}. Material: ${materialVal}`;
        if (prosVal) cleanNotes += `. Pros: ${prosVal}`;
        if (consVal) cleanNotes += `. Cons: ${consVal}`;

        parsedItems.push({
          item: typeVal,
          color: colorVal,
          description: materialVal || `${sizeVal} Handbag`,
          brand: brandVal,
          notes: cleanNotes,
          status: "existing",
          season: "Handbag Inventory"
        });
      }
    } 
    else if (detectedSeason === "Summer 25-26") {
      // Schema: No, Item type, Colour / pattern, Source, Cost, Link, Size, Notes
      // Row 1: `1,Basic T-Shirt (V-Neck),White,E,,,,,,`
      // index 1: Item type (item)
      // index 2: Colour / pattern (color)
      // index 3: Source (could be E or S indicating status, or a brand)
      // index 4: Cost
      // index 5: Link/details
      // index 6: Size
      // index 7: Notes
      const itemVal = parts[1]?.trim();
      const colorVal = parts[2]?.trim();
      const sourceVal = parts[3]?.trim() || ""; // Might hold 'E' or 'S'
      const costVal = parts[4]?.trim() || "";
      const linkVal = parts[5]?.trim() || "";
      const sizeVal = parts[6]?.trim() || "";
      const notesVal = parts[7]?.trim() || "";

      if (itemVal) {
        // Parse E vs S status
        let status: "existing" | "buy" = "existing";
        if (sourceVal.toUpperCase() === "S" || sourceVal.toLowerCase().includes("buy") || notesVal.toLowerCase().includes("buy") || notesVal.toLowerCase().includes("wish list")) {
          status = "buy";
        }

        // Guess brand from link detail e.g. "MAX" or "AS Colour"
        let guessedBrand = "Classic";
        const combinedText = `${linkVal} ${notesVal}`.toLowerCase();
        if (combinedText.includes("max")) guessedBrand = "MAX";
        if (combinedText.includes("as colour")) guessedBrand = "AS Colour";
        if (combinedText.includes("decjuba")) guessedBrand = "Decjuba";

        let cleanNotes = notesVal;
        if (sizeVal) cleanNotes += ` (Size: ${sizeVal})`;
        if (costVal) cleanNotes += ` [Cost: ${costVal}]`;
        if (linkVal) cleanNotes += ` - ${linkVal}`;

        parsedItems.push({
          item: itemVal,
          color: colorVal || "Neutral",
          description: linkVal || `Summer essentials piece`,
          brand: guessedBrand,
          notes: cleanNotes,
          status: status,
          season: "Summer 25-26"
        });
      }
    }
    else if (detectedSeason === "Winter 26") {
      // Schema: No, Item type, Colour / pattern, Brand, Notes, Link, Size
      const itemVal = parts[1]?.trim();
      const colorVal = parts[2]?.trim();
      const brandVal = parts[3]?.trim() || "Classic";
      const notesVal = parts[4]?.trim() || "";
      const linkVal = parts[5]?.trim() || "";
      const sizeVal = parts[6]?.trim() || "";

      if (itemVal) {
        let status: "existing" | "buy" = "existing";
        const lNotes = (notesVal + " " + linkVal).toLowerCase();
        if (lNotes.includes("wish list") || lNotes.includes("buy") || lNotes.includes("shopping") || lNotes.includes("plan")) {
          status = "buy";
        }

        let cleanNotes = notesVal;
        if (sizeVal) cleanNotes += ` (Size: ${sizeVal})`;
        if (linkVal) cleanNotes += ` - Look: ${linkVal}`;

        parsedItems.push({
          item: itemVal,
          color: colorVal || "Neutral",
          description: `Winter layers base`,
          brand: brandVal,
          notes: cleanNotes,
          status: status,
          season: "Winter 26"
        });
      }
    }
    else if (detectedSeason === "Autumn 26") {
      // Schema: No, Item type, Colour / pattern, Brand , Notes
      const itemVal = parts[1]?.trim();
      const colorVal = parts[2]?.trim();
      const brandVal = parts[3]?.trim() || "Classic";
      const notesVal = parts[4]?.trim() || "";

      if (itemVal) {
        let status: "existing" | "buy" = "existing";
        if (notesVal.toLowerCase().includes("wish") || notesVal.toLowerCase().includes("buy") || notesVal.toLowerCase().includes("new")) {
          // If notes have "new" it could check price, mostly existing unless wishlist
          if (notesVal.toLowerCase().includes("wish")) {
            status = "buy";
          }
        }

        parsedItems.push({
          item: itemVal,
          color: colorVal || "Neutral",
          description: `Autumn transitional items`,
          brand: brandVal,
          notes: notesVal,
          status: status,
          season: "Autumn 26"
        });
      }
    }
    else {
      // Default / Dream AW / Universal fallback column search
      const itemIdx = headers.findIndex(h => h.includes("item") || h.includes("product") || h.includes("type"));
      const colorIdx = headers.findIndex(h => h.includes("color") || h.includes("colour") || h.includes("pattern") || h.includes("desc"));
      const brandIdx = headers.findIndex(h => h.includes("brand") || h.includes("label") || h.includes("source"));
      const notesIdx = headers.findIndex(h => h.includes("note") || h.includes("comment") || h.includes("desc"));
      const statusIdx = headers.findIndex(h => h.includes("existing") || h.includes("buy") || h.includes("status") || h.includes("own"));

      const itemVal = itemIdx !== -1 && parts[itemIdx] ? parts[itemIdx].trim() : parts[0] || "";
      const colorVal = colorIdx !== -1 && parts[colorIdx] ? parts[colorIdx].trim() : parts[1] || "";
      const brandVal = brandIdx !== -1 && parts[brandIdx] ? parts[brandIdx].trim() : parts[2] || "";
      const notesVal = notesIdx !== -1 && parts[notesIdx] ? parts[notesIdx].trim() : parts[3] || "";
      const statusValRaw = statusIdx !== -1 && parts[statusIdx] ? parts[statusIdx].toLowerCase().trim() : "";

      let status: "existing" | "buy" = (detectedSeason === "Dream AW") ? "buy" : "existing"; // Dream AW defaults to buy
      if (statusValRaw.toUpperCase() === "E" || statusValRaw.includes("exist") || statusValRaw.includes("own") || notesVal.toLowerCase().includes("existing")) {
        status = "existing";
      } else if (statusValRaw.includes("buy") || statusValRaw.includes("wish")) {
        status = "buy";
      }

      if (itemVal && itemVal.toLowerCase() !== "item" && itemVal.toLowerCase() !== "no") {
        parsedItems.push({
          item: itemVal,
          color: colorVal || "Neutral",
          description: `Capsule planning garment`,
          brand: brandVal || "Classic",
          notes: notesVal,
          status: status,
          season: detectedSeason
        });
      }
    }
  }

  return parsedItems;
}

// Simple regex parser for quoted CSV items
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cell = "";
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  result.push(cell.trim());
  return result;
}

// Convert wardrobe list back to a downloadable Excel-friendly CSV string
export function exportToCSVString(items: WardrobeItem[]): string {
  const headers = ["Item", "Colour", "Description", "Brand", "Notes", "Existing or Buy", "Season"];
  const rows = items.map(item => [
    item.item,
    item.color,
    item.description,
    item.brand,
    item.notes,
    item.status === "existing" ? "Existing" : "Buy",
    item.season || ""
  ]);

  const escapeCell = (val: string) => {
    let clean = (val || "").replace(/"/g, '""');
    if (clean.includes(",") || clean.includes("\n") || clean.includes('"')) {
      return `"${clean}"`;
    }
    return clean;
  };

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(escapeCell).join(","))
  ].join("\n");

  return csvContent;
}
