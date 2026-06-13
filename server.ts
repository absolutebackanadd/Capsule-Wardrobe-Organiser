import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features might fail.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// -------------------------------------------------------------------------
// SERVER ENDPOINTS
// -------------------------------------------------------------------------

// Endpoint 1: Analyze an item to fetch styling advice, style tags, and a CSS hex code.
app.post("/api/gemini/analyze-item", async (req, res) => {
  try {
    const { item, color, description, brand, notes } = req.body;
    if (!item) {
      return res.status(400).json({ error: "Item name is required" });
    }

    const client = getGeminiClient();
    
    const prompt = `Analyze this clothing item and return detailed style profile metadata.
Item Name: ${item}
Color Name: ${color || "unspecified"}
Description: ${description || ""}
Brand: ${brand || "unspecified"}
Personal Notes: ${notes || ""}

Generate styling tags, a representative CSS hex color code (high accuracy based on the color description like "Navy Blue" -> "#1e293b", "Olive Green" -> "#3d5236", etc.), a standardized visual category (one of: Tops, Bottoms, Outerwear, Dresses, Shoes, Accessories), and concise chic styling advice for Capsule Wardrobes.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hex: {
              type: Type.STRING,
              description: "A solid CSS 6-digit hex color starting with # representing this clothing color.",
            },
            aiSuggestedCategory: {
              type: Type.STRING,
              description: "Must be exactly one of: Tops, Bottoms, Outerwear, Dresses, Shoes, Accessories",
            },
            aiStyleTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-4 stylish tags describing its vibe e.g., 'French Minimalist', 'Office Smart', 'Summer Linen', 'Quiet Luxury'",
            },
            aiStylingAdvice: {
              type: Type.STRING,
              description: "A short elegant tip (2 sentences max) on how to style this elegant garment to build a capsule look.",
            }
          },
          required: ["hex", "aiSuggestedCategory", "aiStyleTags", "aiStylingAdvice"]
        }
      }
    });

    const text = response.text?.trim() || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error analyzing item with Gemini:", error);
    // Fallback data if API fails or isn't set up yet
    res.json({
      hex: "#cbd5e1",
      aiSuggestedCategory: "Tops",
      aiStyleTags: ["Classic", "Minimalist"],
      aiStylingAdvice: "A versatile wardrobe classic. Pair with neutrals for an effortlessly chic and timeless visual balance."
    });
  }
});

// Endpoint 2: Take available wardrobe list and generate cohesive Capsule Outfit Recommendations
app.post("/api/gemini/suggest-outfits", async (req, res) => {
  try {
    const { items, objective } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "A list of clothing items is required" });
    }

    const client = getGeminiClient();

    // Map to a lightweight representation to save tokens
    const miniItems = items.map(t => ({
      id: t.id,
      item: t.item,
      color: t.color,
      brand: t.brand,
      description: t.description,
      status: t.status
    }));

    // Read local styling memories to prevent repeating styling mistakes
    let stylingMemories = "";
    const memoriesPath = path.join(process.cwd(), "memories.md");
    try {
      if (fs.existsSync(memoriesPath)) {
        stylingMemories = fs.readFileSync(memoriesPath, "utf-8");
      } else {
        // Bootstrap memories file
        fs.writeFileSync(memoriesPath, `# Gemini Styling Correction Log\n\nThis file lists user styling feedback and outfit suitability corrections.\n`, "utf-8");
      }
    } catch (fsErr) {
      console.warn("Could not read/write memories.md:", fsErr);
    }

    const prompt = `You are a high-end fashion director specializing in Capsule Wardrobes. 
I have a list of clothes in my closet (marked "existing") and some on my wish list (marked "buy"). 
Based on these items, generate 3 highly cohesive, elegant outfit capsules. 

STRICT LEARNED RULES & FEEDBACK CONSTRAINTS:
You MUST follow the user corrections and styling suitability memories below. If a correction states that an item, color, brand, or style is unsuitable for a specific activity (e.g., kids active days, errand days, church) or shouldn't go together, you MUST STRICTLY obey that negative constraint and do NOT make that mistake again:
${stylingMemories || "No rules registered yet."}

Focusing on the user's objective/activity: "${objective || "Create versatile everyday outfits"}"

Each outfit should combine 2-4 items from the list. Try to mostly use "existing" items, but you can incorporate up to ONE "buy" item per outfit to show how she can integrate her wishlist items beautifully!

Return exactly 3 outfit suggestions as a JSON array.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: JSON.stringify(miniItems) + "\n\n" + prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Short catchy name for the outfit vibe e.g., 'Monochrome Monday', 'French Market Picnic', 'Casual Office Layer'",
              },
              description: {
                type: Type.STRING,
                description: "A beautiful sensory description of the look and mood.",
              },
              itemIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of the exact string IDs of 2 to 4 items used from the provided wardrobe array.",
              },
              occasion: {
                type: Type.STRING,
                description: "Appropriate context e.g., 'Sunday Brunch', 'Boardroom Meeting', 'Gallery Opening'",
              },
              aesthetic: {
                type: Type.STRING,
                description: "Aesthetic vibe e.g., 'Quiet Luxury', 'French Chic', 'Artistic Minimalist'",
              },
              stylingNotes: {
                type: Type.STRING,
                description: "Practical editorial styling tips e.g., 'Tuck the shirt loosely and role up the sleeves; contrast with dark boots.'",
              }
            },
            required: ["name", "description", "itemIds", "occasion", "aesthetic", "stylingNotes"]
          }
        }
      }
    });

    const text = response.text?.trim() || "[]";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error creating outfits with Gemini:", error);
    res.status(500).json({ error: "Failed to generate outfits", details: error.message });
  }
});

// Endpoint 3: Fast Fashion Ideas Looker: search for any vibe or clothing item and suggest full attributes
app.post("/api/gemini/explore-ideas", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Vibe or clothing search query is required" });
    }

    const client = getGeminiClient();

    const prompt = `The user wants ideas for clothing items to add to their Capsule Wardrobe matching this search / style vibe: "${query}"
Generate 4 perfect items that would fit this aesthetic. Include standardized categories, colors, brands that make high-quality versions, crisp descriptions, and notes on why they make solid capsule wardrobe investments. All response fields must be stylish and realistic labels. Generate 4 items.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: {
                type: Type.STRING,
                description: "Clothing item name (e.g., 'Double-Breasted Blazer', 'Silk Camisole', 'Leather Loafers')",
              },
              color: {
                type: Type.STRING,
                description: "Color name (e.g., 'Camel', 'Ivory', 'Espresso Brown')",
              },
              hex: {
                type: Type.STRING,
                description: "CSS 6-digit hex color code starting with # representing this precise color.",
              },
              brand: {
                type: Type.STRING,
                description: "A premium or cult-classic brand suggested (e.g., 'COS', 'Everlane', 'The Row', 'Toteme')",
              },
              description: {
                type: Type.STRING,
                description: "Beautiful detailed textile-focused description.",
              },
              notes: {
                type: Type.STRING,
                description: "Short reason why this is a highly versatile piece for capsule building.",
              },
              aiSuggestedCategory: {
                type: Type.STRING,
                description: "Must be exactly one of: Tops, Bottoms, Outerwear, Dresses, Shoes, Accessories",
              }
            },
            required: ["item", "color", "hex", "brand", "description", "notes", "aiSuggestedCategory"]
          }
        }
      }
    });

    const text = response.text?.trim() || "[]";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error exploring style ideas with Gemini:", error);
    res.status(500).json({ error: "Failed to explore style ideas", details: error.message });
  }
});

// Endpoint 4: Online Image Finder for Wardrobe Items
app.post("/api/image-search", async (req, res) => {
  const { item, color, brand } = req.body || {};
  try {
    if (!item) {
      return res.status(400).json({ error: "Item name is required for image search" });
    }

    // Build search query: brand + color + item + " clothing style"
    const queryParts = [];
    if (brand && brand.toLowerCase() !== "classic" && brand.toLowerCase() !== "unbranded") {
      queryParts.push(brand);
    }
    if (color) {
      queryParts.push(color);
    }
    queryParts.push(item);
    
    const searchQuery = queryParts.join(" ") + " style";
    const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(searchQuery)}`;
    
    // Add headers to look like a standard browser request
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    if (!response.ok) {
      // Unsplash rate limit or scraper protection can yield a 401/403. Fall back to high-quality Flickr CC apparel photos!
      console.warn(`\n[IMAGE CODES]: Unsplash search yielded ${response.status} (blocked/rate-limited). Switching to high-quality Flickr fashion visual matching for: "${item}"...\n`);
      const fallbackUrl = `https://loremflickr.com/400/450/fashion,clothing,${encodeURIComponent(item.toLowerCase().replace(/[^a-z0-9]/g, ""))}`;
      return res.json({ imageUrl: fallbackUrl });
    }

    const html = await response.text();

    // Look for Unsplash photo URLs
    // Unsplash photographic URLs are like: https://images.unsplash.com/photo-1539109136881-3be0616acf4b
    const photoRegex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_]+/g;
    const matches = html.match(photoRegex);

    if (matches && matches.length > 0) {
      const uniqueMatches = Array.from(new Set(matches));
      // First, filter out any matches containing "profile" or "avatar" or un-aesthetic ones if any.
      // Unsplash search results are usually the first few matches on the page.
      const firstPhoto = uniqueMatches[0];
      const optimizedUrl = `${firstPhoto}?auto=format&fit=crop&w=400&h=450&q=80`;
      return res.json({ imageUrl: optimizedUrl });
    }

    // Fallback if no images found in HTML page
    const fallbackUrl = `https://loremflickr.com/400/450/fashion,clothing,${encodeURIComponent(item.toLowerCase().replace(/[^a-z0-9]/g, ""))}`;
    res.json({ imageUrl: fallbackUrl });
  } catch (error: any) {
    console.warn("\n[IMAGE CODES]: Web image locator search had a connection issue. Using stable Flickr fashion fallback.");
    const fallbackUrl = `https://loremflickr.com/400/450/fashion,clothing,${encodeURIComponent(item?.toLowerCase()?.replace(/[^a-z0-9]/g, "") || "apparel")}`;
    res.json({ imageUrl: fallbackUrl }); // Fallback gracefully
  }
});


// Endpoint 5: Page Url Retail Image Scraper - scrapes og:image or high-quality product images from custom domains
app.post("/api/scrape-image", async (req, res) => {
  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ error: "No URL was entered. Please provide a storefront or catalog link." });
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res.status(400).json({ error: "Only valid HTTP and HTTPS URLs can be scraped." });
    }
  } catch (e) {
    return res.status(400).json({ error: "Please enter a valid webpage URL link." });
  }

  try {
    console.log(`\n[SCRAPER]: Fetching URL: ${url} ...\n`);
    const fResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      },
      redirect: "follow"
    });

    if (!fResponse.ok) {
      return res.status(400).json({ error: `The store page couldn't be requested. (HTTP Status ${fResponse.status})` });
    }

    const html = await fResponse.text();

    // 1. Look for og:image tags
    const ogRegex = /<meta\s+[^>]*property=["']og:image["']\s+content=["']([^"']+)["']/i;
    const ogRegexReverse = /<meta\s+[^>]*content=["']([^"']+)["']\s+property=["']og:image["']/i;
    const twitterRegex = /<meta\s+[^>]*name=["']twitter:image["']\s+content=["']([^"']+)["']/i;
    const twitterRegexReverse = /<meta\s+[^>]*content=["']([^"']+)["']\s+name=["']twitter:image["']/i;
    const itemPropRegex = /<meta\s+[^>]*itemprop=["']image["']\s+content=["']([^"']+)["']/i;
    const itemPropRegexReverse = /<meta\s+[^>]*content=["']([^"']+)["']\s+itemprop=["']image["']/i;

    let scrapeUrl = "";
    const matchOg = html.match(ogRegex) || html.match(ogRegexReverse);
    const matchTwitter = html.match(twitterRegex) || html.match(twitterRegexReverse);
    const matchItemProp = html.match(itemPropRegex) || html.match(itemPropRegexReverse);

    if (matchOg) {
      scrapeUrl = matchOg[1];
    } else if (matchTwitter) {
      scrapeUrl = matchTwitter[1];
    } else if (matchItemProp) {
      scrapeUrl = matchItemProp[1];
    } else {
      // Find standard high resolution images
      const imgRegex = /<img\s+[^>]*src=["']([^"']+)["']/gi;
      let match;
      const images: string[] = [];
      while ((match = imgRegex.exec(html)) !== null) {
        images.push(match[1]);
      }
      
      const productImg = images.find(img => {
        const lower = img.toLowerCase();
        return (lower.includes("product") || lower.includes("garment") || lower.includes("model") || lower.includes("detail") || lower.includes("goods") || lower.includes("media"));
      });
      scrapeUrl = productImg || images.find(img => !img.includes("logo") && !img.includes("icon")) || images[0] || "";
    }

    if (scrapeUrl) {
      scrapeUrl = scrapeUrl.replace(/&amp;/g, "&");

      // Resolve relative links
      if (scrapeUrl.startsWith("//")) {
        scrapeUrl = "https:" + scrapeUrl;
      } else if (scrapeUrl.startsWith("/")) {
        const origin = new URL(url).origin;
        scrapeUrl = origin + scrapeUrl;
      } else if (!scrapeUrl.startsWith("http://") && !scrapeUrl.startsWith("https://") && !scrapeUrl.startsWith("data:")) {
        const origin = new URL(url).origin;
        scrapeUrl = origin + "/" + scrapeUrl;
      }

      console.log(`[SCRAPER]: Success! Found scraped image link: ${scrapeUrl}`);
      return res.json({ imageUrl: scrapeUrl });
    }

    return res.status(404).json({ error: "No clothing display photo could be scraped from this storefront. Try entering a direct image URL instead." });
  } catch (err: any) {
    console.error("[SCRAPER ERROR]:", err);
    return res.status(500).json({ error: "Unable to access domain. The host might be blocking automated request visits. Please paste a direct image link or upload a local photo file instead.", details: err.message });
  }
});


// Endpoint 6: Analyze active capsule collection, suggest keywords & notes append
app.post("/api/gemini/summarize-capsule", async (req, res) => {
  try {
    const { items, season } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided for analysis" });
    }

    const client = getGeminiClient();

    const liteItems = items.map(item => ({
      id: item.id,
      item: item.item,
      color: item.color,
      brand: item.brand,
      description: item.description,
      notes: item.notes,
      category: item.aiSuggestedCategory || "Tops"
    }));

    const prompt = `You are a professional closet stylist and capsule wardrobe architecture designer.
We have selected a custom wardrobe subset representing the season "${season || "Active Season"}".

Here are the capsule items:
${JSON.stringify(liteItems, null, 2)}

Please analyze this active capsule collection and return:
1. Two to four sleek style Keywords (max 3 words each, e.g. "Nelson Corduroys", "Rich Earthy Layers", "Jewel Pops", "Minimalist Tailoring") representing the capsule's visual DNA.
2. A beautiful, coherent style summary/description (2-3 sentences max) outlining how these pieces interact together.
3. A short elegant note enrichment append suggestion (1-5 words max, e.g. "superb corduroy layering", "adds sharp contrast note", "unifies neutral blazers") for each garment based on its design, color, and brand. This must append cleanly onto their existing spreadsheet notes.

Return exactly this JSON response format:
{
  "capsuleSummaryKeywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
  "capsuleDescription": "A narrative summarizing the architectural cohesion, key layering options, and overall aesthetic vibe.",
  "notesEnrichment": [
    {
      "id": "exact_item_id_here",
      "suggestedNotesAppend": "elegant contrast element"
    }
  ]
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            capsuleSummaryKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 to 4 keywords summarizing the visual DNA of this season's clothing items"
            },
            capsuleDescription: {
              type: Type.STRING,
              description: "Professional, beautiful summary of the wardrobe's color palette, outerwear weight, and versatility."
            },
            notesEnrichment: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "The exact ID of the wardrobe item." },
                  suggestedNotesAppend: { type: Type.STRING, description: "Short stylistic phrase to append to the item notes (e.g. 'anchors bright outerwear' or 'chic slouchy layering'). Max 5 words." }
                },
                required: ["id", "suggestedNotesAppend"]
              }
            }
          },
          required: ["capsuleSummaryKeywords", "capsuleDescription", "notesEnrichment"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error summarizing capsule with Gemini:", error);
    res.status(500).json({ error: "Failed to compile style summary", details: error.message });
  }
});


// Endpoint 7: Analyze wardrobe structure and locate missing garment gaps
app.post("/api/gemini/analyze-gaps", async (req, res) => {
  try {
    const { items, season } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No clothing items found to check for gaps." });
    }

    const client = getGeminiClient();
    const liteItems = items.map(item => ({
      item: item.item,
      color: item.color,
      category: item.aiSuggestedCategory || "Tops",
      status: item.status
    }));

    const prompt = `You are a master wardrobe architecture analyst. We have a capsule collection for season "${season || "Active Season"}".
We want to evaluate its composition (tops vs bottoms, outerwear, footwear ratio) and identify what key gaps exist that would drastically improve style efficiency.

Here is the current item list:
${JSON.stringify(liteItems, null, 2)}

Analyze this collection:
1. Provide a general gap assessment (2 sentences maximum) pointing out what is missing or unbalanced (e.g. "Lacking structured ankle footwear for heavy rain", "Solid outerwear is abundant, but you need soft inner thermal base tops to avoid cold New Zealand winds").
2. Standardize three explicit high-value additions to fill these gaps. For each item recommend: the name, the standard category (must be one of: Tops, Bottoms, Outerwear, Dresses, Shoes, Accessories), a versatile color, and a brilliant style justification.

Return exactly this JSON response format:
{
  "generalGapAssessment": "Your concise 2-sentence review.",
  "suggestedItemsToBuy": [
    {
      "item": "Merino Wool Crewneck",
      "category": "Tops",
      "color": "Charcoal Grey",
      "reason": "Provides thin, high-heat insulating layeys underneath corduroy jacket shells without bulk."
    }
  ]
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generalGapAssessment: {
              type: Type.STRING,
              description: "Short, highly tailored review of what's missing or how to boost wardrobe versatility."
            },
            suggestedItemsToBuy: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING, description: "Name of recommended item to buy (e.g. Chunky Knit Sweater)" },
                  category: { type: Type.STRING, description: "Must be exactly one of: Tops, Bottoms, Outerwear, Dresses, Shoes, Accessories" },
                  color: { type: Type.STRING, description: "Recommended versatile color to unify existing items (e.g. Oatmeal Beige)" },
                  reason: { type: Type.STRING, description: "Editorial brief explanation of why this unblocks more outfit permutations." }
                },
                required: ["item", "category", "color", "reason"]
              },
              description: "Exactly 3 targeted wardrobe ideas to purchase."
            }
          },
          required: ["generalGapAssessment", "suggestedItemsToBuy"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error evaluating wardrobe gaps:", error);
    res.status(500).json({ error: "Failed to evaluate gaps", details: error.message });
  }
});


// Endpoint 8: Standardize non-standard spreadsheet categories into 6 core definitions
app.post("/api/gemini/condense-categories", async (req, res) => {
  try {
    const { categories } = req.body;
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: "No category names input for condensation" });
    }

    const client = getGeminiClient();

    const prompt = `You are an AI data cleaning assistant.
We have a set of user-generated wardrobe category titles imported from custom spreadsheet tabs:
${JSON.stringify(categories, null, 2)}

Please map each unique category/title to exactly one of our 6 standard elegant categories:
- "Tops"
- "Bottoms"
- "Outerwear"
- "Dresses"
- "Shoes"
- "Accessories"

Return a key-value mapping object where the keys are the original labels and the values are their mapped standardized counterparts.

Return exactly this JSON response format:
{
  "categoryMapping": {
    "pant": "Bottoms",
    "boot": "Shoes",
    "chelsea boots": "Shoes",
    "silk t-shirt": "Tops",
    "shacket": "Outerwear"
  }
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryMapping: {
              type: Type.OBJECT,
              description: "A dictionary mapping original messy category strings to standard neat ones from our list."
            }
          },
          required: ["categoryMapping"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error condensing categories with Gemini:", error);
    res.status(500).json({ error: "Failed to map standard categories", details: error.message });
  }
});


// Endpoint 9: Log styling corrections to memories.md (written locally in the repo)
app.post("/api/memory/wrong", async (req, res) => {
  try {
    const { activity, feedback, itemsList, outfitName } = req.body;
    if (!feedback) {
      return res.status(400).json({ error: "Feedback detail is required to log a correction." });
    }

    const memoriesPath = path.join(process.cwd(), "memories.md");
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const formattedEntry = `
### Correction: ${outfitName || "Custom Styled Outfit"} for "${activity || "General"}" (Logged ${dateStr})
- **Activity context**: ${activity || "Not specified"}
- **Styled items**: ${itemsList || "None designated"}
- **Styling feedback / Learned constraint**: ${feedback}
-------------------------------------------------------------------------
`;

    // Make sure memories.md exists
    if (!fs.existsSync(memoriesPath)) {
      fs.writeFileSync(memoriesPath, `# Gemini Styling Correction Log\n\nThis file lists user styling feedback and outfit suitability corrections.\n`, "utf-8");
    }

    fs.appendFileSync(memoriesPath, formattedEntry, "utf-8");
    res.json({ success: true, message: "Memory logged locally in memories.md!" });
  } catch (err: any) {
    console.error("Error writing memory correction:", err);
    res.status(500).json({ error: "Failed to persist memory locally", details: err.message });
  }
});

// Endpoint 10: Fetch the contents of memories.md so the UI can display recorded corrections
app.get("/api/memory/list", async (req, res) => {
  try {
    const memoriesPath = path.join(process.cwd(), "memories.md");
    if (!fs.existsSync(memoriesPath)) {
      fs.writeFileSync(memoriesPath, `# Gemini Styling Correction Log\n\nThis file lists user styling feedback and outfit suitability corrections.\n`, "utf-8");
    }
    const content = fs.readFileSync(memoriesPath, "utf-8");
    res.json({ content });
  } catch (err: any) {
    console.error("Error reading styling memories:", err);
    res.status(500).json({ error: "Failed to retrieve memories" });
  }
});

// Endpoint 11: Clear memories.md back to default bootstrap state
app.post("/api/memory/clear", async (req, res) => {
  try {
    const memoriesPath = path.join(process.cwd(), "memories.md");
    fs.writeFileSync(memoriesPath, `# Gemini Styling Correction Log\n\nThis file lists user styling feedback and outfit suitability corrections.\n`, "utf-8");
    res.json({ success: true, message: "Correction logs reset." });
  } catch (err: any) {
    console.error("Error clearing styling memories:", err);
    res.status(500).json({ error: "Failed to reset memories" });
  }
});


// -------------------------------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// -------------------------------------------------------------------------

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
