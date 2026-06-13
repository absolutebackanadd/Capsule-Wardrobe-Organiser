import React, { useState, useMemo } from "react";
import { WardrobeItem, WardrobeStats } from "../types";
import { compileWardrobeStats, SEASONS_CONFIG } from "../data";
import { ShoppingBag, Eye, Heart, BarChart3, PieChart, Layers, HelpCircle, ArrowRightLeft } from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsPanelProps {
  wardrobe: WardrobeItem[];
}

export default function AnalyticsPanel({ wardrobe }: AnalyticsPanelProps) {
  // Extract all unique capsule seasons present in the current wardrobe
  const dynamicCapsules = useMemo(() => {
    const list = Array.from(new Set(wardrobe.map(item => item.season).filter(Boolean))) as string[];
    // Keep a consistent order if they match SEASONS_CONFIG
    const knownSeasons = SEASONS_CONFIG.map(s => s.id);
    return list.sort((a, b) => {
      const idxA = knownSeasons.indexOf(a);
      const idxB = knownSeasons.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [wardrobe]);

  // State for active selected capsule filter (all = Overall Closet)
  const [selectedCapsule, setSelectedCapsule] = useState<string>("all");
  const [includeWishlist, setIncludeWishlist] = useState<boolean>(true);

  const filteredWardrobe = useMemo(() => {
    let items = selectedCapsule === "all" ? wardrobe : wardrobe.filter(item => item.season === selectedCapsule);
    if (!includeWishlist) {
      items = items.filter(item => item.status === "existing");
    }
    return items;
  }, [wardrobe, selectedCapsule, includeWishlist]);

  const stats = useMemo(() => compileWardrobeStats(filteredWardrobe), [filteredWardrobe]);

  // Completion calculation (In Closet vs total elements count)
  const percentOwned = stats.totalCount > 0 ? Math.round((stats.existingCount / stats.totalCount) * 100) : 0;

  // Inter-capsule comparisons and stats for side-by-side analysis
  const capsuleComparisonList = useMemo(() => {
    return dynamicCapsules.map(cap => {
      let capItems = wardrobe.filter(item => item.season === cap);
      if (!includeWishlist) {
        capItems = capItems.filter(item => item.status === "existing");
      }
      const capStats = compileWardrobeStats(capItems);
      const capPercent = capStats.totalCount > 0 ? Math.round((capStats.existingCount / capStats.totalCount) * 100) : 0;
      return {
        name: cap,
        total: capStats.totalCount,
        existing: capStats.existingCount,
        buy: capStats.buyCount,
        percent: capPercent,
        topColorName: capStats.colorsPresent[0]?.color || "None",
        topColorHex: capStats.colorsPresent[0]?.hex || "#cccccc",
        topBrand: capStats.brandsPresent[0]?.brand || "Unbranded"
      };
    });
  }, [wardrobe, dynamicCapsules]);

  return (
    <div className="space-y-8" id="wardrobe-analytics-module">
      {/* Intro */}
      <div className="border-b border-brand-border pb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-serif font-medium text-brand-charcoal text-2xl tracking-tight">
            Wardrobe Color Story & Insights
          </h2>
          <p className="text-brand-sage text-sm mt-1">
            Explore proportions, dominant color stories, and top brand portfolios of your capsule.
          </p>
        </div>

        {/* Dynamic Capsule Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-sage hover:text-brand-charcoal transition-colors">
            <input 
              type="checkbox" 
              checked={includeWishlist} 
              onChange={(e) => setIncludeWishlist(e.target.checked)}
              className="rounded border-brand-border/80 text-brand-olive focus:ring-brand-olive"
            />
            Include Wishlist (Buy) Items
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor="capsule-analyser-filter" className="text-xs font-mono font-bold uppercase text-brand-sage tracking-wider">
              Analyze Capsule:
            </label>
            <select
              id="capsule-analyser-filter"
              value={selectedCapsule}
              onChange={(e) => setSelectedCapsule(e.target.value)}
              className="px-3.5 py-2 bg-white border border-brand-border/85 rounded-xl text-xs font-medium text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-olive cursor-pointer"
            >
              <option value="all">📁 Entire Closet (Overall)</option>
              {dynamicCapsules.map(cap => (
                <option key={cap} value={cap}>
                  🧥 {cap}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-border p-5 rounded-sm shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-sage block">
            Total Clothes Count
          </span>
          <p className="text-3xl font-serif font-bold text-brand-charcoal tracking-tight">
            {stats.totalCount}
          </p>
          <span className="text-xs text-brand-sage block">
            {selectedCapsule === "all" ? "Active across all closets" : `Active inside is ${selectedCapsule}`}
          </span>
        </div>

        <div className="bg-white border border-brand-border p-5 rounded-sm shadow-sm space-y-2">
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

        <div className="bg-white border border-brand-border p-5 rounded-sm shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-sage block">
            Wishlist Items
          </span>
          <p className="text-3xl font-serif font-bold text-brand-charcoal tracking-tight">
            {stats.buyCount}
          </p>
          <span className="text-xs text-brand-sage block">Future purchases planned</span>
        </div>

        {/* Dynamic Capsule Score text */}
        <div className="bg-brand-olive text-white p-5 rounded-sm shadow-sm flex flex-col justify-between">
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
        <div className="bg-white border border-brand-border p-6 rounded-sm shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <PieChart className="w-5 h-5 text-brand-sage" />
            <div>
              <h3 className="font-serif font-semibold text-brand-charcoal text-base">
                Dominant Color Story
              </h3>
              <p className="text-xs text-brand-sage">
                {selectedCapsule === "all" ? "Your overall palette signature." : `Color palette signature for ${selectedCapsule}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            {stats.colorsPresent.length === 0 ? (
              <p className="text-xs text-brand-sage italic">No color data found inside this capsule.</p>
            ) : (
              stats.colorsPresent.map((col, index) => {
                // Calculate percentage of total count
                const pct = stats.totalCount > 0 ? Math.round((col.count / stats.totalCount) * 100) : 0;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-[#FAF9F6] border border-brand-border/60 px-3 py-2 rounded-xl text-brand-charcoal text-xs min-w-[124px] shadow-3xs hover:border-brand-border duration-200 transition-all"
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-brand-border shadow-2xs block shrink-0 animate-fade-in"
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
              <p>Your items span multiple hues in this view. For maximum versatility, aim for 3 core neutrals (beige, black, grey) and 1-2 cohesive subtle color accents.</p>
            ) : (
              <p>A beautifully curated, focused palette! This small variance ensures all garments layer together effortlessly without color clashes in your daily look matching.</p>
            )}
          </div>
        </div>

        {/* Proportional category bars */}
        <div className="bg-white border border-brand-border p-6 rounded-sm shadow-sm space-y-5">
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
      <div className="bg-white border border-brand-border p-6 rounded-sm shadow-sm space-y-4">
        <h3 className="font-serif font-medium text-brand-charcoal text-lg uppercase tracking-wider">
          Brand Portfolio ({stats.brandsPresent.length} brands)
        </h3>

        {stats.brandsPresent.length === 0 ? (
          <p className="text-xs text-brand-sage italic">No labeled brands exist inside this capsule filter.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {stats.brandsPresent.map(({ brand, count }) => (
              <div key={brand} className="border border-brand-border/60 p-3.5 rounded-xl bg-[#FAF9F6] text-center">
                <span className="text-[10px] uppercase font-bold text-brand-sage tracking-widest block font-sans truncate">
                  {brand || "Unlabeled"}
                </span>
                <p className="text-xl font-serif font-bold text-brand-charcoal mt-1">{count}</p>
                <span className="text-[10px] text-brand-sage block">
                  {count === 1 ? "item" : "items"} of capsule
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW SECTION: Inter-Capsule Comparison Metrics and Insights */}
      <div className="bg-white border border-brand-border p-6 rounded-sm shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 border-b border-brand-border/65 pb-3">
          <ArrowRightLeft className="w-5 h-5 text-brand-sage" />
          <div>
            <h3 className="font-serif font-semibold text-brand-charcoal text-base">
              Cross-Capsule Comparison Matrix
            </h3>
            <p className="text-xs text-brand-sage">
              Analyze statistics and item ratios side-by-side between your different closets.
            </p>
          </div>
        </div>

        {capsuleComparisonList.length <= 1 ? (
          <p className="text-xs text-brand-sage italic">Add or import multiple capsules to compare statistics between them.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border/80 text-[10px] uppercase text-brand-sage font-bold tracking-wider">
                  <th className="py-3 px-4">Capsule / Season</th>
                  <th className="py-3 px-4 text-center">Total Pieces</th>
                  <th className="py-3 px-4 text-center">Owned (E)</th>
                  <th className="py-3 px-4 text-center">Wishlist (Buy)</th>
                  <th className="py-3 px-4 text-center">Ownership %</th>
                  <th className="py-3 px-4">Dominant Accent</th>
                  <th className="py-3 px-4">Key Brand Partner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-xs">
                {capsuleComparisonList.map((row) => (
                  <tr key={row.name} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 font-serif font-bold text-brand-charcoal">
                      {row.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {row.total}
                    </td>
                    <td className="py-3.5 px-4 text-center text-green-700 font-medium">
                      {row.existing}
                    </td>
                    <td className="py-3.5 px-4 text-center text-amber-700 font-medium font-mono">
                      {row.buy}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-semibold text-brand-charcoal">{row.percent}%</span>
                        <div className="w-12 bg-brand-greige h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div className="bg-[#4A674A] h-full" style={{ width: `${row.percent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-sans font-medium text-brand-charcoal">
                      <div className="flex items-center gap-1.5">
                        {row.topColorName !== "None" && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-brand-border/45 inline-block shrink-0"
                            style={{ backgroundColor: row.topColorHex }}
                          />
                        )}
                        <span>{row.topColorName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-sage font-mono uppercase tracking-wider text-[10px]">
                      {row.topBrand}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-[#FAF9F6] border border-brand-border/60 p-4.5 rounded-xl space-y-2 mt-4">
          <h4 className="text-xs font-serif font-bold text-brand-charcoal flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-sage" /> Multi-Capsule Balancing Strategy
          </h4>
          <p className="text-xs text-brand-charcoal leading-relaxed">
            By analyzing counts across collections, you can identify which seasons are over-saturated or under-served. 
            For transitional climates (like Nelson, NZ), check if you have duplicated staples in your <strong className="text-brand-charcoal">Summer 25-26</strong> and <strong className="text-brand-charcoal">Autumn 26</strong> capsules. If so, utilize the global <strong className="font-semibold text-brand-olive text-[11px] tracking-wide uppercase px-1 rounded-sm bg-brand-olive/10">Duplicate Sorter</strong> tool to establish parent-child links between them to sync images, descriptions, and custom styling links effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
}

