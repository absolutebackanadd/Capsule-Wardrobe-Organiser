import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

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

    const prompt = `You are a high-end fashion director specializing in Capsule Wardrobes. 
I have a list of clothes in my closet (marked "existing") and some on my wish list (marked "buy"). 
Based on these items, generate 3 highly cohesive, elegant outfit capsules. 

Focusing on the user's objective: "${objective || "Create versatile everyday outfits"}"

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
  try {
    const { item, color, brand } = req.body;
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
