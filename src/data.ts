import { WardrobeItem, WardrobeStats } from "./types";

// Gorgeous initial curated capsule wardrobe.
// These represent actual real clothing pieces with realistic notes, brands, and colors
// that immediately look highly polished and curated on load.
export const initialCuratedWardrobe: WardrobeItem[] = [
  {
    id: "curated-001",
    item: "Trench Coat",
    color: "Camel",
    hex: "#c19a6b",
    description: "Double breasted water-resistant trench with sash belt",
    brand: "Burberry",
    notes: "A timeless layering anchor. Vintage silhouette fits comfortably over chunky knits.",
    status: "existing",
    aiStyleTags: ["French Chic", "Outerwear Base", "Classic Vintage"],
    aiStylingAdvice: "Pair loose over charcoal denim and cream knitwear. Leave open to reveal inner tailoring layers."
  },
  {
    id: "curated-002",
    item: "Cashmere Crewneck",
    color: "Ivory White",
    hex: "#fcfaf2",
    description: "100% Mongolian cashmere lightweight ribbed sweater",
    brand: "Everlane",
    notes: "Super soft, slightly cropped boxy fit.",
    status: "existing",
    aiStyleTags: ["Quiet Luxury", "Soft Minimalist", "Cozy Layer"],
    aiStylingAdvice: "High-contrast pairing: wear tucked into high-rise black trousers with a sleek brown leather belt."
  },
  {
    id: "curated-003",
    item: "Double-Breasted Blazer",
    color: "Charcoal Grey",
    hex: "#565c63",
    description: "Relaxed fit structured wool-blend blazer",
    brand: "COS",
    notes: "Slightly oversized drape, gorgeous tortoise-shell horn buttons.",
    status: "existing",
    aiStyleTags: ["Tailored Minimal", "Office Smart", "Boyfriend Slouch"],
    aiStylingAdvice: "Roll up blazer sleeves slightly. Contrast the masculine structure with feminine gold jewelry and straight jeans."
  },
  {
    id: "curated-004",
    item: "Wide Leg Linen Pants",
    color: "Oatmeal Beige",
    hex: "#eae6df",
    description: "Relaxed high-waisted linen blend trouser",
    brand: "Uniqlo",
    notes: "Flowy, perfect drape. Incredibly comfortable for hot summer office days.",
    status: "existing",
    aiStyleTags: ["Summer Breeze", "Airy Lounge", "Natural Tone"],
    aiStylingAdvice: "Pair with a fitted black silk cami or structured tank to balanced the breezy linen proportions."
  },
  {
    id: "curated-005",
    item: "Tailored Trousers",
    color: "Jet Black",
    hex: "#111111",
    description: "Double pleated straight trouser with crisp pressed crease",
    brand: "Zara",
    notes: "Slimmer straight fit, sturdy wrinkle-resistant stretch weave.",
    status: "existing",
    aiStyleTags: ["Daily tailoring", "Minimal Anchor", "Power Dressing"],
    aiStylingAdvice: "Instantly pairs with everything. Tuck in any button-down or sweater, and slide into black leather loafers."
  },
  {
    id: "curated-006",
    item: "Pointed Leather Boots",
    color: "Burgundy Cherry",
    hex: "#58181a",
    description: "Soft Italian calfskin boots with small block heel",
    brand: "Miista",
    notes: "Adds a stunning pop of subtle color to an otherwise monochrome neutral wardrobe.",
    status: "existing",
    aiStyleTags: ["Cherry Accent", "90s Minimalist", "Sleek Footer"],
    aiStylingAdvice: "Let these peak out from under wide-leg light denim or straight charcoal trousers."
  },
  {
    id: "curated-007",
    item: "Slip Silk Midi Dress",
    color: "Champagne Silt",
    hex: "#e2d3be",
    description: "Sandwashed mulberry silk bias-cut midi dress",
    brand: "Reformation",
    notes: "Stunning low cowl back. Fluid lightweight silk.",
    status: "existing",
    aiStyleTags: ["Aesthetic Fluid", "Cocktail Slip", "Romantic Chic"],
    aiStylingAdvice: "Throw the oversized grey COS blazer over your shoulders for a stylish, nonchalant nighttime outerwear twist."
  },
  {
    id: "curated-008",
    item: "Structured Leather Tote",
    color: "Cognac Brown",
    hex: "#8B5A2B",
    description: "Minimalist full-grain leather saddle shoulder bag",
    brand: "APC",
    notes: "Fits a small laptop. Beautiful golden brass hardware details.",
    status: "existing",
    aiStyleTags: ["Architectural", "Day Anchor", "Classic Leather"],
    aiStylingAdvice: "Coordinates flawlessly with a camel trench or vintage brown leather boots."
  },
  {
    id: "curated-009",
    item: "Silk Button-Down Shirt",
    color: "Sage Green",
    hex: "#9caf88",
    description: "Relaxed mulberry silk pajama-style collared shirt",
    brand: "Equipment",
    notes: "Effortlessly elegant drape, gorgeous subtle dusty sage-olive tonality.",
    status: "buy",
    aiStyleTags: ["Muted Accent", "Fluid Satin", "Sophisticated Tone"],
    aiStylingAdvice: "Wishlist highlight: Wear half-tucked into crisp white linen trousers or high-rise black trousers."
  },
  {
    id: "curated-010",
    item: "Minimalist Loafers",
    color: "Silt Tan Leather",
    hex: "#b89065",
    description: "Ultra soft pebble leather pointed-toe slipper loafers",
    brand: "The Row",
    notes: "Insanely soft leather. High priority wishlist purchase.",
    status: "buy",
    aiStyleTags: ["Laidback Luxury", "Daily Slipper", "Effortless Flat"],
    aiStylingAdvice: "Pair with black tailored trousers and a simple white crewneck tee for the ultimate quiet luxury uniform."
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

// Simple parsing helper that handles:
// 1. Copy-Pasted spreadsheets (Tab-Separated TSV)
// 2. Common CSV values
export function parseSpreadsheetText(text: string): Omit<WardrobeItem, "id" | "hex">[] {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0 || !lines[0].trim()) return [];

  // Detect delimiter: check if tab exists in first non-empty line
  let delimiter = ",";
  const headerLine = lines[0];
  if (headerLine.includes("\t")) {
    delimiter = "\t";
  }

  // We are expecting: "Item", "Colour", "Description" (or notes/brand etc)
  // Let's analyze the headers
  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase());
  
  // Find index of matching columns
  const itemIdx = headers.findIndex(h => h.includes("item") || h.includes("product") || h.includes("apparel"));
  const colorIdx = headers.findIndex(h => h.includes("color") || h.includes("colour"));
  const descIdx = headers.findIndex(h => h.includes("desc"));
  const brandIdx = headers.findIndex(h => h.includes("brand") || h.includes("label"));
  const notesIdx = headers.findIndex(h => h.includes("note") || h.includes("comment"));
  const statusIdx = headers.findIndex(h => h.includes("existing") || h.includes("buy") || h.includes("status") || h.includes("own"));

  const parsedItems: Omit<WardrobeItem, "id" | "hex">[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Splitting by delimiter (handles basic quotes)
    let parts: string[] = [];
    if (delimiter === ",") {
      // Clean CSV splitted line
      parts = parseCsvLine(line);
    } else {
      parts = line.split(delimiter).map(p => p.trim());
    }

    const itemVal = itemIdx !== -1 && parts[itemIdx] ? parts[itemIdx].trim() : "";
    const colorVal = colorIdx !== -1 && parts[colorIdx] ? parts[colorIdx].trim() : "";
    const descVal = descIdx !== -1 && parts[descIdx] ? parts[descIdx].trim() : "";
    const brandVal = brandIdx !== -1 && parts[brandIdx] ? parts[brandIdx].trim() : "";
    const notesVal = notesIdx !== -1 && parts[notesIdx] ? parts[notesIdx].trim() : "";
    const statusValRaw = statusIdx !== -1 && parts[statusIdx] ? parts[statusIdx].toLowerCase().trim() : "";

    // Determine status (Existing or Buy)
    let status: 'existing' | 'buy' = "existing";
    if (statusValRaw.includes("buy") || statusValRaw.includes("wish") || statusValRaw.includes("need") || statusValRaw === "no" || statusValRaw === "0") {
      status = "buy";
    }

    if (itemVal) {
      parsedItems.push({
        item: itemVal,
        color: colorVal || "Neutral",
        description: descVal,
        brand: brandVal || "Classic",
        notes: notesVal,
        status: status,
      });
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

// Convert wardobe list back to a downloadable Excel-friendly CSV string
export function exportToCSVString(items: WardrobeItem[]): string {
  const headers = ["Item", "Colour", "Description", "Brand", "Notes", "Existing or Buy"];
  const rows = items.map(item => [
    item.item,
    item.color,
    item.description,
    item.brand,
    item.notes,
    item.status === "existing" ? "Existing" : "Buy"
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
