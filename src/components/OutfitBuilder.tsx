import React, { useState } from "react";
import { WardrobeItem, OutfitSuggestion } from "../types";
import { Sparkles, Calendar, Layers, Plus, Trash2, Heart, RefreshCw, Compass } from "lucide-react";
import { ApparelSilhouette } from "./WardrobeCard";
import { motion, AnimatePresence } from "motion/react";

interface OutfitBuilderProps {
  wardrobe: WardrobeItem[];
  savedOutfits: OutfitSuggestion[];
  onSaveOutfit: (outfit: OutfitSuggestion) => void;
  onDeleteOutfit: (idx: number) => void;
}

export default function OutfitBuilder({ wardrobe, savedOutfits, onSaveOutfit, onDeleteOutfit }: OutfitBuilderProps) {
  const [objective, setObjective] = useState("Create versatile Parisian everyday capsules");
  const [loading, setLoading] = useState(false);
  const [aiOutfits, setAiOutfits] = useState<OutfitSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Manual outfit creating state
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualOccasion, setManualOccasion] = useState("");
  const [manualAesthetic, setManualAesthetic] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Trigger server-side Gemini 3.5 AI styling planner
  const generateAiOutfits = async () => {
    if (wardrobe.length === 0) {
      setError("Add some clothing items to your wardrobe first to let the AI Style Director design looks!");
      return;
    }

    setLoading(true);
    setError(null);
    setAiOutfits([]);

    try {
      const response = await fetch("/api/gemini/suggest-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass entire list so Gemini knows colors, brands, and notes
        body: JSON.stringify({ items: wardrobe, objective }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate outfit capsules");
      }

      const rawData = await response.json();
      
      // Map return IDs back to real wardrobe item references
      const parsedOutfits: OutfitSuggestion[] = rawData.map((out: any) => {
        const itemReferences = (out.itemIds || [])
          .map((id: string) => wardrobe.find(w => w.id === id))
          .filter(Boolean) as WardrobeItem[];

        return {
          name: out.name,
          description: out.description,
          items: itemReferences,
          occasion: out.occasion,
          aesthetic: out.aesthetic,
          stylingNotes: out.stylingNotes
        };
      }).filter((o: any) => o.items.length > 0);

      setAiOutfits(parsedOutfits);
    } catch (err: any) {
      console.error(err);
      setError("Could not connect to Gemini Style Director. Is your API key set correctly?");
    } finally {
      setLoading(false);
    }
  };

  // Add manually composed look
  const handleSaveManualOutfit = () => {
    if (!manualName || selectedItemIds.length === 0) {
      alert("Please provide an outfit name and select at least 1 clothing item.");
      return;
    }

    const compiledItems = selectedItemIds
      .map(id => wardrobe.find(w => w.id === id))
      .filter(Boolean) as WardrobeItem[];

    const newOutfit: OutfitSuggestion = {
      name: manualName,
      description: manualDescription || "A personally styled capsule combination.",
      items: compiledItems,
      occasion: manualOccasion || "Daily Smart Casual",
      aesthetic: manualAesthetic || "Modern Capsule",
      stylingNotes: manualNotes || "No special layering notes added."
    };

    onSaveOutfit(newOutfit);
    // Reset manual form
    setManualName("");
    setManualOccasion("");
    setManualAesthetic("");
    setManualNotes("");
    setManualDescription("");
    setSelectedItemIds([]);
    setManualMode(false);
  };

  const toggleManualItemSelection = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8" id="outfit-builder-module">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <h2 className="font-serif font-medium text-brand-charcoal text-2xl tracking-tight">
            Style Capsule Planner
          </h2>
          <p className="text-brand-sage text-sm mt-1">
            Generate Gemini-designed editorial styling outfits from your wardrobe or manually compile your signature ensembles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setManualMode(!manualMode);
              setAiOutfits([]);
            }}
            className={`px-6 py-2.5 text-xs font-semibold rounded-[32px] tracking-wider uppercase border transition-all cursor-pointer ${
              manualMode
                ? "bg-brand-charcoal text-white border-brand-charcoal"
                : "bg-white text-brand-charcoal border-brand-border hover:bg-brand-greige/50"
            }`}
          >
            {manualMode ? "Switch to AI Mode" : "Compose Lookbook Manually"}
          </button>
        </div>
      </div>

      {/* AI DIRECTIONAL CONSOLE */}
      {!manualMode && (
        <section className="bg-brand-greige/40 rounded-[20px] border border-brand-border p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-olive text-white rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-serif font-semibold text-brand-charcoal text-base">
                Gemini Style Assistant & Capsule Director
              </h3>
              <p className="text-xs text-brand-sage leading-relaxed">
                Type in an aesthetic mood, season, or specific travel destination, and the model will draft 3 customized outfits utilizing your wardrobe (with subtle additions of items from your wishlist to demonstrate styling versatility).
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-2.5">
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g., Casual autumn weekend trip to Copenhagen"
              className="flex-1 bg-white border border-brand-border text-brand-charcoal text-sm px-4.5 py-3 rounded-[32px] focus:ring-1 focus:ring-brand-olive focus:outline-none placeholder-brand-sage"
            />
            <button
              onClick={generateAiOutfits}
              disabled={loading}
              className="px-6 py-2.5 bg-brand-olive text-white hover:bg-[#484833] disabled:bg-brand-sage/40 font-semibold text-xs uppercase tracking-widest rounded-[32px] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Styling Lookbook...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Capsules
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-mono">
              {error}
            </p>
          )}

          {/* AI Output preview card collections */}
          <AnimatePresence>
            {aiOutfits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-4 border-t border-dashed border-stone-200"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                    Creative Concepts Generated ({aiOutfits.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {aiOutfits.map((outfit, index) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={index}
                      className="bg-white rounded-[20px] border border-brand-border p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase font-bold font-mono tracking-widest bg-brand-greige text-brand-charcoal px-2.5 py-0.5 rounded-md">
                              {outfit.aesthetic}
                            </span>
                            <span className="text-[10px] uppercase font-bold font-mono tracking-widest bg-brand-greige text-brand-charcoal px-2.5 py-0.5 rounded-md flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-brand-sage" /> {outfit.occasion}
                            </span>
                          </div>
                          <h5 className="font-serif font-semibold text-brand-charcoal text-lg">
                            {outfit.name}
                          </h5>
                          <p className="text-brand-sage text-xs italic leading-relaxed">
                            "{outfit.description}"
                          </p>
                        </div>

                        <div className="text-xs text-brand-charcoal bg-[#FAF9F6] p-4 rounded-xl border border-brand-border space-y-1">
                          <span className="font-bold text-brand-charcoal uppercase text-[9px] tracking-wider block font-sans">
                            Editorial Style Directions:
                          </span>
                          <p className="leading-relaxed">{outfit.stylingNotes}</p>
                        </div>

                        <button
                          onClick={() => {
                            onSaveOutfit(outfit);
                            // Remove from active draft view
                            setAiOutfits(prev => prev.filter((_, idx) => idx !== index));
                          }}
                          className="px-5 py-2.5 bg-[#E8F0E8] text-[#4A674A] hover:bg-[#dbebd8] text-[10px] font-bold tracking-widest uppercase rounded-[20px] flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 fill-[#4A674A] text-[#4A674A]" />
                          Pin Outfit to Lookbook
                        </button>
                      </div>

                      {/* Outfits horizontal strip displaying mini vector garments */}
                      <div className="w-full md:w-80 flex items-center justify-center gap-2 bg-brand-greige/35 rounded-xl p-3 border border-brand-border self-center">
                        {outfit.items.map((garment, gIdx) => (
                          <div
                            key={gIdx}
                            className="flex-1 text-center bg-white border border-brand-border p-2.5 rounded-lg flex flex-col items-center justify-between h-36 relative group shadow-2xs"
                          >
                            <span
                              className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full ${
                                garment.status === "buy" ? "bg-[#A6705D]" : "bg-[#4A674A]"
                              }`}
                              title={garment.status === "buy" ? "Wishlist buy item suggestion" : "Closet owned item"}
                            />
                            {/* Graphic core */}
                            <div className="w-12 h-16 flex items-center justify-center">
                              <ApparelSilhouette category={garment.aiSuggestedCategory || "Tops"} hexColor={garment.hex} />
                            </div>
                            {/* Info */}
                            <div className="w-full pt-1.5">
                              <p className="text-[9px] font-bold text-brand-charcoal truncate block capitalize leading-none mb-0.5">
                                {garment.item}
                              </p>
                              <p className="text-[8px] font-semibold text-brand-sage truncate block uppercase font-sans">
                                {garment.brand || "Unbranded"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* MANUAL COMPOSER CONSOLE */}
      {manualMode && (
        <section className="bg-brand-greige/40 rounded-[20px] border border-brand-border p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-olive text-white rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-serif font-semibold text-brand-charcoal text-base">
                Bespoke Capsule Look Composer
              </h3>
              <p className="text-xs text-brand-sage leading-relaxed">
                Build outfit boards manually by tapping garments in your list below, and adding metadata parameters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-brand-sage tracking-wider">
                  Outfit Set Name
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g., Casual Sunday Linen Chic"
                  className="w-full bg-white border border-brand-border text-brand-charcoal text-xs px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-brand-olive focus:outline-none placeholder-brand-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-sage tracking-wider">
                    Aesthetic
                  </label>
                  <input
                    type="text"
                    value={manualAesthetic}
                    onChange={(e) => setManualAesthetic(e.target.value)}
                    placeholder="e.g., French Riviera"
                    className="w-full bg-white border border-brand-border text-brand-charcoal text-xs px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-brand-olive focus:outline-none placeholder-brand-sage"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-sage tracking-wider">
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={manualOccasion}
                    onChange={(e) => setManualOccasion(e.target.value)}
                    placeholder="e.g., Casual Travel"
                    className="w-full bg-white border border-brand-border text-brand-charcoal text-xs px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-brand-olive focus:outline-none placeholder-brand-sage"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-brand-sage tracking-wider">
                  Sensory Description
                </label>
                <textarea
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Describe the look's atmosphere or fluid vibe..."
                  rows={2}
                  className="w-full bg-white border border-brand-border text-brand-charcoal text-xs px-3.5 py-2 rounded-xl focus:ring-1 focus:ring-brand-olive focus:outline-none resize-none placeholder-brand-sage"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-brand-sage tracking-wider">
                  Styling Notes & Guide
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="How to cuff sleeves, tuck cuffs, or wear accessories..."
                  rows={2}
                  className="w-full bg-white border border-brand-border text-brand-charcoal text-xs px-3.5 py-2 rounded-xl focus:ring-1 focus:ring-brand-olive focus:outline-none resize-none placeholder-brand-sage"
                />
              </div>
            </div>

            {/* Selector list */}
            <div className="space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-sage tracking-wider block mb-2">
                  Tap Clothes to Attach ({selectedItemIds.length} Selected)
                </span>
                
                <div className="bg-white border border-brand-border rounded-xl max-h-56 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
                  {wardrobe.map(garment => {
                    const isSelected = selectedItemIds.includes(garment.id);
                    return (
                      <button
                        key={garment.id}
                        onClick={() => toggleManualItemSelection(garment.id)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand-olive text-white border-brand-olive font-semibold shadow-xs"
                            : "bg-[#FAF9F6] hover:bg-brand-greige/40 text-brand-charcoal border-brand-border/60"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white shadow-xs block"
                            style={{ backgroundColor: garment.hex }}
                          />
                          <span className="capitalize">{garment.brand} - {garment.item} ({garment.color})</span>
                        </div>
                        <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-brand-greige text-brand-sage"
                        }`}>
                          {garment.status === "buy" ? "Wishlist" : "Closet"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSaveManualOutfit}
                disabled={!manualName || selectedItemIds.length === 0}
                className="w-full py-3 bg-brand-olive text-white hover:bg-[#484833] disabled:bg-brand-sage/40 text-xs font-semibold uppercase tracking-widest rounded-[32px] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Save Look Set to Book
              </button>
            </div>
          </div>
        </section>
      )}

      {/* SAVED PIED LOOKBOOK BOARD */}
      <div className="space-y-5">
        <h3 className="font-serif font-medium text-brand-charcoal text-lg flex items-center gap-2 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-brand-sage" /> Active pinned Lookbook ({savedOutfits.length})
        </h3>

        {savedOutfits.length === 0 ? (
          <div className="border border-brand-border border-dashed rounded-[20px] p-12 text-center bg-white shadow-xs">
            <Calendar className="w-8 h-8 text-brand-sage/50 mx-auto mb-3" />
            <p className="text-brand-charcoal font-medium text-sm">Your Capsule Lookbook is empty.</p>
            <p className="text-brand-sage text-xs mt-1">Use the Gemini Capsule Director above or compose tailored outfits manually!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedOutfits.map((outfit, index) => (
              <div
                key={index}
                className="bg-white rounded-[20px] border border-brand-border p-6 flex flex-col md:flex-row justify-between gap-6 relative shadow-[0_4px_12px_rgba(0,0,0,0.01)] group"
              >
                <button
                  onClick={() => onDeleteOutfit(index)}
                  className="absolute top-4 right-4 p-2 text-brand-sage hover:text-red-650 rounded-lg hover:bg-[#FAF9F6] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Remove Outfit from Lookbook"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-[9px] uppercase font-bold tracking-widest bg-brand-greige text-brand-charcoal px-2.5 py-0.5 rounded-md">
                        {outfit.aesthetic}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-widest bg-brand-greige text-brand-charcoal px-2.5 py-0.5 rounded-md">
                        {outfit.occasion}
                      </span>
                    </div>

                    <h4 className="font-serif font-semibold text-brand-charcoal text-base tracking-tight">
                      {outfit.name}
                    </h4>
                    <p className="text-brand-sage text-xs leading-relaxed mt-1 italic">
                      "{outfit.description}"
                    </p>
                  </div>

                  <div className="text-xs text-brand-charcoal/90 font-normal leading-relaxed border-l-2 border-brand-olive pl-3 py-1 bg-[#FAF9F6] pr-2 rounded-r-lg">
                    <p>{outfit.stylingNotes}</p>
                  </div>
                </div>

                {/* Displaying horizontal mini wardrobe cards */}
                <div className="w-full md:w-80 flex items-center justify-start gap-1.5 bg-brand-greige/30 rounded-xl p-2.5 border border-brand-border self-center">
                  {outfit.items.map((garment, gIdx) => (
                    <div
                      key={gIdx}
                      className="flex-1 text-center bg-white border border-brand-border p-2 rounded-lg flex flex-col items-center justify-between h-32 relative shadow-2xs"
                    >
                      <div className="w-10 h-12 flex items-center justify-center">
                        <ApparelSilhouette category={garment.aiSuggestedCategory || "Tops"} hexColor={garment.hex} />
                      </div>
                      <div className="w-full">
                        <p className="text-[9px] font-bold text-brand-charcoal truncate block capitalize leading-none mb-0.5">
                          {garment.item}
                        </p>
                        <p className="text-[8px] font-semibold text-brand-sage truncate block uppercase font-sans leading-none">
                          {garment.brand || "Unbranded"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
