export interface WardrobeItem {
  id: string;
  item: string;          // Category (e.g. Coat, Shirt, Jeans, Shoes)
  color: string;         // Plain-text color (e.g. Olive Green, Navy, Cream)
  hex: string;           // Calculated hex color (e.g. #3d5236, #1e293b)
  description: string;
  brand: string;
  notes: string;
  status: 'existing' | 'buy'; // Existing or Buy
  aiStyleTags?: string[];
  aiStylingAdvice?: string;
  aiSuggestedCategory?: string; // Standardized wardrobe category
  imageUrl?: string;             // Auto-discovered representative look image
}

export interface OutfitSuggestion {
  name: string;
  description: string;
  items: WardrobeItem[];
  occasion: string; // e.g. "Casual Weekend", "Work Chic", "Smart Casual"
  aesthetic: string; // e.g. "Quiet Luxury", "French Minimalist"
  stylingNotes: string;
}

export interface WardrobeStats {
  totalCount: number;
  existingCount: number;
  buyCount: number;
  itemsByCategory: Record<string, number>;
  colorsPresent: { color: string; hex: string; count: number }[];
  brandsPresent: { brand: string; count: number }[];
}
