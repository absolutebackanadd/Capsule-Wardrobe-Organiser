import React from "react";
import { WardrobeItem, WardrobeStats } from "../types";
import { compileWardrobeStats } from "../data";
import { ShoppingBag, Eye, Heart, BarChart3, PieChart } from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsPanelProps {
  wardrobe: WardrobeItem[];
}

export default function AnalyticsPanel({ wardrobe }: AnalyticsPanelProps) {
  const stats = compileWardrobeStats(wardrobe);

  // Completion calculation (In Closet vs total elements count)
  const percentOwned = stats.totalCount > 0 ? Math.round((stats.existingCount / stats.totalCount) * 100) : 0;

  return (
    <div className="space-y-8" id="wardrobe-analytics-module">
      {/* Intro */}
      <div className="border-b border-brand-border pb-5">
        <h2 className="font-serif font-medium text-brand-charcoal text-2xl tracking-tight">
          Wardrobe Color Story & Insights
        </h2>
        <p className="text-brand-sage text-sm mt-1">
          Explore proportions, dominant color stories, and top brand portfolios of your capsule.
        </p>
      </div>

      {/* Grid Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-border p-5 rounded-sm shadow-sm border-brand-border space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-sage block">
            Total Clothes Count
          </span>
          <p className="text-3xl font-serif font-bold text-brand-charcoal tracking-tight">
            {stats.totalCount}
          </p>
          <span className="text-xs text-brand-sage block">Active inside Capsule Studio</span>
        </div>

        <div className="bg-white border border-brand-border p-5 rounded-sm shadow-sm border-brand-border space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-sage block">
            In Closet (Owned)
          </span>
          <p className="text-3xl font-serif font-bold text-brand-charcoal tracking-tight flex items-center gap-2">
            {stats.existingCount}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8F0E8] text-[#4A674A] border border-[#d2eed2]">
              {percentOwned}%
            </span>
          </p>
          <span className="text-xs text-brand-sage block">Existing garments cataloged</span>
        </div>

        <div className="bg-white border border-brand-border p-5 rounded-sm shadow-sm border-brand-border space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-sage block">
            Wishlist Items
          </span>
          <p className="text-3xl font-serif font-bold text-brand-charcoal tracking-tight">
            {stats.buyCount}
          </p>
          <span className="text-xs text-brand-sage block">Future purchases planned</span>
        </div>

        {/* Dynamic Capsule Score text */}
        <div className="bg-brand-olive text-white p-5 rounded-sm shadow-sm border-brand-border flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-greige block">
            Capsule Vibe Rating
          </span>
          <div>
            <p className="text-lg font-serif font-bold text-white leading-snug">
              {percentOwned >= 80 ? "Cohesive Vault" : percentOwned >= 50 ? "Balanced Edit" : "Foundational Edit"}
            </p>
            <p className="text-[11px] text-brand-greige/90 mt-1 leading-relaxed">
              {stats.buyCount === 0
                ? "Perfect self-contained wardrobe. Zero buy leak."
                : `Perfecting look consistency with ${stats.buyCount} wishlist targets.`}
            </p>
          </div>
        </div>
      </div>

      {/* Aesthetic color palette analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dominant Color Palette Bento */}
        <div className="bg-white border border-brand-border p-6 rounded-sm shadow-sm border-brand-border space-y-5">
          <div className="flex items-center gap-2.5">
            <PieChart className="w-5 h-5 text-brand-sage" />
            <div>
              <h3 className="font-serif font-semibold text-brand-charcoal text-base">
                Dominant Color Story
              </h3>
              <p className="text-xs text-brand-sage">Your core color palette signature.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            {stats.colorsPresent.length === 0 ? (
              <p className="text-xs text-brand-sage italic">No color data found inside spreadsheet.</p>
            ) : (
              stats.colorsPresent.map((col, index) => {
                // Calculate percentage of total count
                const pct = stats.totalCount > 0 ? Math.round((col.count / stats.totalCount) * 100) : 0;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-[#FAF9F6] border border-brand-border/60 px-3 py-2 rounded-xl text-brand-charcoal text-xs min-w-[124px] shadow-3xs"
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-brand-border shadow-2xs block shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <div className="truncate">
                      <p className="font-bold capitalize truncate text-[11px] leading-tight">
                        {col.color}
                      </p>
                      <p className="text-[10px] text-brand-sage">
                        {col.count} {col.count === 1 ? "item" : "items"} • {pct}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-xs text-brand-charcoal bg-[#FAF9F6] p-4 rounded-xl border border-brand-border leading-relaxed">
            <span className="font-semibold text-brand-charcoal block mb-1">Color Palette Cohesion Guidance:</span>
            {stats.colorsPresent.length > 6 ? (
              <p>Your capsule colors span multiple hues. For maximum versatility, aim for 3 core neutrals (beige, black, grey) and 1-2 cohesive subtle color accents.</p>
            ) : (
              <p>A beautifully curated, focused palette! This small variance ensures all garments layer together effortlessly without color clashes.</p>
            )}
          </div>
        </div>

        {/* Proportional category bars */}
        <div className="bg-white border border-brand-border p-6 rounded-sm shadow-sm border-brand-border space-y-5">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-brand-sage" />
            <div>
              <h3 className="font-serif font-semibold text-brand-charcoal text-base">
                Category Distribution
              </h3>
              <p className="text-xs text-brand-sage">Balance of layering pieces, bottoms, and footers.</p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {["Outerwear", "Tops", "Bottoms", "Dresses", "Shoes", "Accessories"].map(category => {
              const count = stats.itemsByCategory[category] || 0;
              const pct = stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;

              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-serif font-medium text-brand-charcoal">{category}</span>
                    <span className="font-semibold text-brand-charcoal">{count} {count === 1 ? "item" : "items"}</span>
                  </div>
                  {/* Outer bar */}
                  <div className="w-full bg-brand-greige h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="bg-brand-olive h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brand lists portfolio */}
      <div className="bg-white border border-brand-border p-6 rounded-sm shadow-sm border-brand-border space-y-4">
        <h3 className="font-serif font-medium text-brand-charcoal text-lg uppercase tracking-wider">
          Brand Portfolio ({stats.brandsPresent.length} brands)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {stats.brandsPresent.map(({ brand, count }) => (
            <div key={brand} className="border border-brand-border/60 p-3.5 rounded-xl bg-[#FAF9F6] text-center">
              <span className="text-[10px] uppercase font-bold text-brand-sage tracking-widest block font-sans">
                {brand || "Unlabelled"}
              </span>
              <p className="text-xl font-serif font-bold text-brand-charcoal mt-1">{count}</p>
              <span className="text-[10px] text-brand-sage block">
                {count === 1 ? "item" : "items"} of capsule
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
