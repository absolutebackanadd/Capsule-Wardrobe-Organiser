import React from "react";
import { WardrobeItem } from "../types";
import { CheckCircle2, Bookmark, Eye, Tag, Edit, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface WardrobeCardProps {
  key?: React.Key;
  item: WardrobeItem;
  cardNumber?: number;
  onSelect: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

// Custom curated minimalist vector silhouette blueprints
export function ApparelSilhouette({ category, hexColor }: { category: string; hexColor: string }) {
  const normalizedCategory = (category || "Tops").toLowerCase();
  const fill = hexColor || "#cbd5e1";

  // Render a beautifully crafted high-contrast vector apparel blueprint matching the exact hex color!
  switch (normalizedCategory) {
    case "outerwear":
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 transition-all duration-300 transform hover:scale-105" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))">
          {/* Long Minimalist Coat Trenchcoat */}
          <path d="M50,15 L32,32 L32,110 L48,110 L48,65 L52,65 L52,110 L68,110 L68,32 Z" fill={fill} />
          {/* Collar/Lapels detailing */}
          <path d="M50,15 L32,32 L44,45 Z" fill="#ffffff" opacity="0.15" />
          <path d="M50,15 L68,32 L56,45 Z" fill="#ffffff" opacity="0.15" />
          {/* Belt sash */}
          <rect x="31" y="52" width="38" height="6" fill="#1e293b" opacity="0.25" rx="1" />
        </svg>
      );
    case "bottoms":
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 transition-all duration-300 transform hover:scale-105" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))">
          {/* Wide Leg Tailored Pants trousers */}
          <path d="M30,20 L70,20 L66,110 L51,110 L50,45 L49,110 L34,110 Z" fill={fill} />
          {/* Belt Loops or crease lines */}
          <line x1="42" y1="20" x2="42" y2="105" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 2" />
          <line x1="58" y1="20" x2="58" y2="105" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 2" />
        </svg>
      );
    case "dresses":
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 transition-all duration-300 transform hover:scale-105" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))">
          {/* Elegant Slip Silk Dress */}
          <path d="M38,15 L62,15 L64,30 L72,110 L28,110 L36,30 Z" fill={fill} />
          {/* Spaghetti straps */}
          <line x1="38" y1="15" x2="38" y2="8" stroke={fill} strokeWidth="2" />
          <line x1="62" y1="15" x2="62" y2="8" stroke={fill} strokeWidth="2" />
          {/* Drape accent lines */}
          <path d="M32,38 Q50,43 68,38" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />
          <path d="M30,60 Q50,66 70,60" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.15" />
        </svg>
      );
    case "shoes":
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full opacity-90 transition-all duration-300 transform hover:scale-105" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))">
          {/* Sleek Pointed Slipper Loafers / Boots */}
          <path d="M15,65 Q15,45 35,42 Q60,40 105,62 Q105,75 80,75 L25,75 Q15,75 11,68" fill={fill} />
          {/* Heel rubber sole details */}
          <path d="M15,73 L28,73 L26,79 L17,79 Z" fill="#111111" opacity="0.6" />
          <path d="M32,74 L98,74 L94,76 L35,76 Z" fill="#111111" opacity="0.4" />
          {/* Stitch detailing */}
          <path d="M38,45 Q55,46 92,62" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 1.5" />
        </svg>
      );
    case "accessories":
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 transition-all duration-300 transform hover:scale-105" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))">
          {/* Minimalist shoulder clutch bag */}
          <rect x="25" y="45" width="50" height="35" rx="3" fill={fill} />
          {/* Leather strap loop */}
          <path d="M32,45 C32,15 68,15 68,45" fill="none" stroke={fill} strokeWidth="4" />
          {/* Flap enclosure */}
          <path d="M25,45 L75,45 L68,62 L32,62 Z" fill="#111111" opacity="0.08" />
          {/* Brass button lock */}
          <circle cx="50" cy="57" r="3.5" fill="#eab308" />
        </svg>
      );
    case "tops":
    default:
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 transition-all duration-300 transform hover:scale-105" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))">
          {/* Classic Ribbed Sweater / T-Shirt */}
          <path d="M30,18 L38,18 Q50,22 62,18 L70,18 L88,38 L76,48 L70,42 L70,110 L30,110 L30,42 L24,48 L12,38 Z" fill={fill} />
          {/* Crewneck border details */}
          <path d="M38,18 Q50,21 62,18" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
        </svg>
      );
  }
}

export default function WardrobeCard({ item, cardNumber, onSelect, onDelete, onToggleStatus }: WardrobeCardProps) {
  const isExisting = item.status === "existing";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative bg-[#FAF9F6] rounded-[20px] border border-brand-border overflow-hidden flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow"
      id={`wardrobe-card-${item.id}`}
    >
      {/* Auto numbering badge */}
      {cardNumber !== undefined && (
        <div className="absolute top-3 left-3 z-30 bg-white/95 border border-brand-border/80 px-2 py-0.5 rounded-md font-mono text-[9px] font-bold text-stone-500 shadow-3xs select-none">
          {cardNumber.toString().padStart(2, '0')}
        </div>
      )}
      {/* Extreme Right Action Buttons */}
      <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 p-0.5 rounded-lg border border-brand-border backdrop-blur-xs shadow-xs">
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1.5 text-brand-sage hover:text-red-650 rounded-md transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Vector Silhouette Stage */}
      <div
        onClick={() => onSelect(item)}
        className="cursor-pointer h-40 w-full flex items-center justify-center bg-[#F2EFE9]/40 relative group overflow-hidden border-b border-brand-border/60"
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.item}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Graceful fallback to null if image loading breaks (e.g. invalid URLs)
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <>
            {/* Soft background ambient halo of the garment's precise color */}
            <div
              className="absolute inset-0 m-auto w-24 h-24 blur-xl rounded-full opacity-15 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none"
              style={{ backgroundColor: item.hex }}
            />
            
            {/* Category label as text watermark style */}
            <span className="font-serif italic text-brand-sage/60 text-[11px] absolute top-3 left-4 select-none">
              {item.aiSuggestedCategory || "Apparel"} Preview
            </span>

            {/* Dynamic Apparel silhouette */}
            <div className="w-full h-full max-w-[70px] max-h-[110px] flex items-center justify-center z-1 pt-4">
              <ApparelSilhouette category={item.aiSuggestedCategory || "Tops"} hexColor={item.hex} />
            </div>
          </>
        )}

        {/* Hover overlay trigger cue */}
        <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 rounded-t-[20px] flex items-center justify-center transition-all duration-300 z-10">
          <span className="bg-white/95 text-brand-charcoal text-[11px] px-3 py-1.5 rounded-full font-semibold shadow-sm flex items-center gap-1 border border-brand-border">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>

        {/* Classic styled color swatch with thick border, bottom-right of visual card */}
        <div 
          className="absolute bottom-3 right-3 w-6 h-6 rounded-full border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-10 transition-transform group-hover:scale-110"
          style={{ backgroundColor: item.hex }}
          title={item.color}
        />
      </div>

      {/* Card Content Footer labels */}
      <div className="p-5 flex flex-col gap-2 cursor-pointer flex-1 justify-between" onClick={() => onSelect(item)}>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[10px] uppercase font-bold tracking-wider text-brand-sage font-sans">
              {item.brand || "Unbranded"}
            </p>
            {item.season && (
              <>
                <span className="text-[8px] text-brand-sage/60">•</span>
                <span className="text-[9px] font-sans font-semibold text-brand-olive uppercase tracking-wider">
                  {item.season.replace(" capsule 2026", " '26").replace(" capsule 2025 - 26", " '25-26")}
                </span>
              </>
            )}
          </div>
          <h3 className="font-serif font-semibold text-brand-charcoal text-[17px] tracking-tight capitalize truncate leading-tight">
            {item.item}
          </h3>
          
          {item.description && (
            <p className="text-[12px] text-brand-sage italic line-clamp-1 mt-1 leading-normal">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-brand-border/40">
          <span className="text-xs text-brand-charcoal/80 font-medium truncate capitalize">
            {item.color}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleStatus) onToggleStatus(item.id);
            }}
            className={`self-start px-3 py-1 rounded-[20px] text-[10px] font-bold uppercase tracking-wider border transition-all ${
              isExisting
                ? "bg-[#E8F0E8] text-[#4A674A] border-transparent hover:brightness-95"
                : "bg-[#F8EEE8] text-[#A6705D] border-transparent hover:brightness-95"
            }`}
            title="Toggle Closet Item / Wishlist"
          >
            {isExisting ? "Existing" : "Wishlist"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
