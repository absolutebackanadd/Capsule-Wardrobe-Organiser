import React, { useState, useMemo, useEffect } from "react";
import { WardrobeItem } from "../types";
import { 
  Sparkles, 
  Check, 
  X, 
  Link2, 
  Unlink, 
  Layers, 
  Image as ImageIcon, 
  ExternalLink, 
  AlertCircle, 
  HelpCircle,
  CornerDownRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DuplicateSorterProps {
  wardrobe: WardrobeItem[];
  onUpdateWardrobe: (newWardrobe: WardrobeItem[]) => void;
}

interface DuplicateGroup {
  id: string;
  name: string;
  reason: string;
  items: WardrobeItem[];
}

export default function DuplicateSorter({ wardrobe, onUpdateWardrobe }: DuplicateSorterProps) {
  // Dismissed duplicate item ID pairings that the user explicitly wants to keep separate
  const [dismissedPairs, setDismissedPairs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("capsule_dismissed_duplicates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveDismissedPairs = (newPairs: string[]) => {
    setDismissedPairs(newPairs);
    localStorage.setItem("capsule_dismissed_duplicates", JSON.stringify(newPairs));
  };

  // State to toggle seeing "Suspected Duplicates" vs "Already Linked Items"
  const [activeTab, setActiveTab] = useState<"suspected" | "linked">("suspected");
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-dismiss alert after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Normalize string for fuzzy match comparison
  const normalize = (val: string) => {
    return (val || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  // Scan and identify clusters of suspected duplicates
  const suspectedGroups = useMemo(() => {
    const groups: DuplicateGroup[] = [];
    const processedIds = new Set<string>();

    // Skip items that have already been linked with a masterId
    const unlinkedItems = wardrobe.filter(item => !item.masterId);

    unlinkedItems.forEach((itemA) => {
      if (processedIds.has(itemA.id)) return;

      const cluster: WardrobeItem[] = [itemA];
      const nameA = normalize(itemA.item);
      const colA = normalize(itemA.color);
      const brandA = normalize(itemA.brand);

      unlinkedItems.forEach((itemB) => {
        if (itemA.id === itemB.id || processedIds.has(itemB.id)) return;

        // Check if this pair has been dismissed/ignored by the user
        const pairKey1 = `${itemA.id}_${itemB.id}`;
        const pairKey2 = `${itemB.id}_${itemA.id}`;
        if (dismissedPairs.includes(pairKey1) || dismissedPairs.includes(pairKey2)) {
          return;
        }

        const nameB = normalize(itemB.item);
        const colB = normalize(itemB.color);
        const brandB = normalize(itemB.brand);

        let matchReason = "";

        // Suspected duplicate heuristics:
        // 1. Exact item name AND exact color matching (possibly in separate caps)
        if (nameA === nameB && colA === colB && nameA.length > 2) {
          matchReason = "Identical garment silhouette & color pairing";
        }
        // 2. Exact item name AND specific brand matched
        else if (
          nameA === nameB && 
          brandA === brandB && 
          brandA !== "" && 
          brandA !== "classic" && 
          brandA !== "unbranded"
        ) {
          matchReason = "Same brand & category capsule overlap";
        }
        // 3. Close names / substring overlap with same base color
        else if (
          colA === colB && 
          colA !== "" && 
          colA !== "neutral" && 
          (nameA.includes(nameB) || nameB.includes(nameA)) && 
          Math.min(nameA.length, nameB.length) >= 4
        ) {
          matchReason = "Fuzzy item nomenclature & color overlay";
        }

        if (matchReason) {
          cluster.push(itemB);
        }
      });

      if (cluster.length > 1) {
        cluster.forEach(i => processedIds.add(i.id));
        
        // Determine primary display reason
        let clusterReason = "Highly matching attributes";
        const nameA_clean = normalize(itemA.item);
        const nameB_clean = normalize(cluster[1].item);
        const colA_clean = normalize(itemA.color);
        const colB_clean = normalize(cluster[1].color);
        
        if (nameA_clean === nameB_clean && colA_clean === colB_clean) {
          clusterReason = "Identical Item Name & Color Accent";
        } else if (nameA_clean === nameB_clean) {
          clusterReason = "Exact Silhouette Overlap (Between Seasons)";
        } else {
          clusterReason = "Fuzzy Silhouette Matching & Similar Tone";
        }

        groups.push({
          id: `cluster-${itemA.id}`,
          name: itemA.item,
          reason: clusterReason,
          items: cluster
        });
      }
    });

    return groups;
  }, [wardrobe, dismissedPairs]);

  // Aggregate already linked unique items groupings (sharing the same masterId)
  const linkedGroups = useMemo(() => {
    const groupsMap: Record<string, WardrobeItem[]> = {};
    
    wardrobe.forEach(item => {
      if (item.masterId) {
        if (!groupsMap[item.masterId]) {
          groupsMap[item.masterId] = [];
        }
        groupsMap[item.masterId].push(item);
      }
    });

    return Object.entries(groupsMap)
      .map(([masterId, items]) => ({
        id: masterId,
        name: items[0]?.item || "Linked Wardrobe Staple",
        reason: `Linked physical garment (${items.length} capsule occurrences)`,
        items: items
      }))
      .filter(g => g.items.length > 1); // Only show clusters containing actual replicas
  }, [wardrobe]);

  // Trigger linking & synchronizing wardrobe details for a group
  const handleLinkDuplicates = (itemsToLink: WardrobeItem[]) => {
    if (itemsToLink.length < 2) return;

    // 1. Generate or extract a singular master ID
    const masterId = itemsToLink[0].masterId || `master-${itemsToLink[0].id}`;

    // 2. Perform descriptive attribute merging to avoid losing her pictures/URLs or links
    // Find the first item with a valid absolute URL as the primary image
    const bestImageUrl = itemsToLink.find(i => i.imageUrl && i.imageUrl.startsWith("http"))?.imageUrl ||
                         itemsToLink.find(i => i.imageUrl)?.imageUrl || "";

    // Parse brand name cleanly
    const bestBrand = itemsToLink.find(i => i.brand && i.brand.toLowerCase() !== "classic" && i.brand.toLowerCase() !== "unbranded")?.brand ||
                      itemsToLink.find(i => i.brand)?.brand || "Classic";

    // Combine distinct notes/links, separated by periods
    const distinctNotes = Array.from(
      new Set(itemsToLink.map(i => i.notes?.trim()).filter(Boolean))
    );
    const mergedNotes = distinctNotes.join(". ");

    // Gather overall descriptions
    const bestDescription = itemsToLink.find(i => i.description && i.description.length > 5)?.description ||
                            itemsToLink.find(i => i.description)?.description || "";

    // Pick best HEX representation
    const bestHex = itemsToLink.find(i => i.hex && i.hex !== "#cccccc" && i.hex !== "#eae6df")?.hex ||
                    itemsToLink.find(i => i.hex)?.hex || "#cccccc";

    const bestCategory = itemsToLink.find(i => i.aiSuggestedCategory)?.aiSuggestedCategory || "";
    const bestStyleTags = itemsToLink.find(i => i.aiStyleTags && i.aiStyleTags.length > 0)?.aiStyleTags || [];
    const bestStylingAdvice = itemsToLink.find(i => i.aiStylingAdvice)?.aiStylingAdvice || "";

    // 3. Apply to State
    const idsToUpdate = new Set(itemsToLink.map(i => i.id));
    const updatedWardrobe = wardrobe.map((item) => {
      if (idsToUpdate.has(item.id)) {
        return {
          ...item,
          masterId,
          imageUrl: bestImageUrl,
          brand: bestBrand,
          notes: mergedNotes,
          description: bestDescription,
          hex: bestHex,
          aiSuggestedCategory: bestCategory || item.aiSuggestedCategory,
          aiStyleTags: bestStyleTags.length > 0 ? bestStyleTags : item.aiStyleTags,
          aiStylingAdvice: bestStylingAdvice || item.aiStylingAdvice
        };
      }
      return item;
    });

    onUpdateWardrobe(updatedWardrobe);
    setNotification(`Successfully synced and linked ${itemsToLink.length} duplicates across your season capsules!`);
  };

  // Keep separate (Ignore/Dismiss cluster)
  const handleKeepSeparate = (items: WardrobeItem[]) => {
    // Save pairings into dismissed pairs in localStorage so they don't prompt again
    const newPairs = [...dismissedPairs];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        newPairs.push(`${items[i].id}_${items[j].id}`);
      }
    }
    saveDismissedPairs(newPairs);
    setNotification("Suspected items dismissed. They are marked as distinct garments.");
  };

  // Unlink a currently linked cluster
  const handleUnlinkCluster = (masterId: string) => {
    const updatedWardrobe = wardrobe.map(item => {
      if (item.masterId === masterId) {
        // Remove the masterId linking field
        const cleanItem = { ...item };
        delete cleanItem.masterId;
        return cleanItem;
      }
      return item;
    });
    onUpdateWardrobe(updatedWardrobe);
    setNotification("Linked occurrences uncoupled into separate individual garments.");
  };

  // Format link for presentation safely
  const renderItemCardNotes = (notes: string) => {
    if (!notes) return <span className="text-brand-sage/60 italic text-[11px]">No notes written</span>;
    
    // Check if there is a URL link listed inside the notes
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = notes.match(urlRegex);
    
    if (urls && urls.length > 0) {
      return (
        <div className="space-y-1">
          <p className="text-[11px] text-brand-charcoal/90 truncate" title={notes}>{notes}</p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {urls.slice(0, 2).map((url, uidx) => (
              <a 
                key={uidx}
                href={url} 
                target="_blank" 
                rel="noreferrer" 
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] text-brand-olive font-semibold hover:underline bg-brand-olive/5 border border-brand-olive/15 px-2 py-0.5 rounded-full"
              >
                <ExternalLink className="w-2.5 h-2.5" /> Garment Link
              </a>
            ))}
          </div>
        </div>
      );
    }

    return <p className="text-[11px] text-brand-charcoal/80 line-clamp-2" title={notes}>{notes}</p>;
  };

  return (
    <div className="space-y-6" id="brand-duplicate-analyzer">
      {/* Editorial Header */}
      <div className="border-b border-brand-border pb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-serif font-medium text-brand-charcoal text-2xl tracking-tight">
            De-Duplicity Sorter
          </h2>
          <p className="text-brand-sage text-sm mt-1">
            Detect identical garments copied across multiple capsules/seasons. Link them to share pictures and links instantly!
          </p>
        </div>

        {/* Action Toggle Tabs */}
        <div className="flex border border-brand-border/80 rounded-xl overflow-hidden bg-[#FAF9F6] p-1 shrink-0 self-start">
          <button
            onClick={() => setActiveTab("suspected")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "suspected"
                ? "bg-brand-olive text-white shadow-xs"
                : "text-brand-sage hover:text-brand-charcoal"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Suspected ({suspectedGroups.length})
          </button>
          <button
            onClick={() => setActiveTab("linked")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "linked"
                ? "bg-brand-olive text-white shadow-xs"
                : "text-brand-sage hover:text-brand-charcoal"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> Currently Synced ({linkedGroups.length})
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2.5 font-sans shadow-3xs"
          >
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <span className="font-medium">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main duplicate dashboard */}
      {activeTab === "suspected" ? (
        <div className="space-y-6">
          {suspectedGroups.length === 0 ? (
            <div className="bg-white border border-brand-border p-12 text-center rounded-sm space-y-3 shadow-3xs max-w-2xl mx-auto my-6">
              <Check className="w-10 h-10 text-green-600/80 mx-auto" />
              <h3 className="font-serif font-bold text-brand-charcoal text-base">Your Wardrobe is Cleanly Sorted!</h3>
              <p className="text-xs text-brand-sage leading-relaxed text-balance">
                The duplicate sorter scanned all clothes inside your closet capsules and found zero suspected replicas. 
                Any duplicate garments imported previously are either linked, ignored, or have distinct names/colors.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-amber-50/40 border border-brand-border p-4.5 rounded-xl text-xs text-brand-charcoal leading-relaxed flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-olive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-serif font-semibold text-brand-charcoal block">Matching Architecture Principles</span>
                  <p>
                    These items exist as separate entries in your database (e.g. representing the same physical item that you wear in both <strong className="text-brand-charcoal">Summer</strong> and <strong className="text-brand-charcoal">Autumn</strong> capsules). 
                    Linking them assigns a single <strong className="text-brand-charcoal">internal primary key</strong>. 
                    This synchronizes their photos and web link sources automatically without losing any added metadata!
                  </p>
                </div>
              </div>

              {suspectedGroups.map((group) => {
                // Find what files/details will end up in the combined preview representation
                const modelImg = group.items.find(i => i.imageUrl && i.imageUrl.startsWith("http"))?.imageUrl || 
                                 group.items.find(i => i.imageUrl)?.imageUrl;
                const modelBrand = group.items.find(i => i.brand && i.brand.toLowerCase() !== "classic" && i.brand.toLowerCase() !== "unbranded")?.brand || 
                                   group.items.find(i => i.brand)?.brand || "Classic";
                const hasExistingLinks = group.items.some(i => i.notes && i.notes.includes("http"));

                return (
                  <div 
                    key={group.id} 
                    className="bg-white border border-brand-border rounded-sm shadow-sm overflow-hidden"
                  >
                    {/* Header bar */}
                    <div className="bg-[#FAF9F6] border-b border-brand-border/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono tracking-wider font-bold uppercase text-brand-olive bg-brand-olive/10 px-2 py-0.5 rounded">
                            {group.reason}
                          </span>
                          <span className="text-[10px] text-brand-sage font-medium font-sans">
                            {group.items.length} suspect occurrences
                          </span>
                        </div>
                        <h3 className="font-serif font-medium text-brand-charcoal text-base mt-1 capitalize">
                          "{group.items[0].item}"
                        </h3>
                      </div>

                      {/* Sync actions drawer */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleKeepSeparate(group.items)}
                          className="px-3.5 py-1.5 border border-brand-border text-brand-sage hover:text-brand-charcoal bg-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Keep Separate
                        </button>
                        <button
                          onClick={() => handleLinkDuplicates(group.items)}
                          className="px-4 py-1.5 bg-brand-olive hover:bg-[#484833] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-3xs"
                        >
                          <Link2 className="w-3.5 h-3.5" /> Sync & Link ID Keys
                        </button>
                      </div>
                    </div>

                    {/* Compare Cards Grid layout */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#FCFCFC]">
                      {group.items.map((item) => (
                        <div 
                          key={item.id} 
                          className="bg-white border border-brand-border/65 p-4 rounded-xl flex gap-3.5 shadow-3xs hover:border-brand-border transition-all relative"
                        >
                          {/* Item image or blank frame */}
                          <div className="w-16 h-20 bg-brand-greige border border-brand-border/40 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative bg-center bg-cover"
                            style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
                          >
                            {!item.imageUrl && (
                              <ImageIcon className="w-5 h-5 text-brand-sage/40" />
                            )}
                            <div className="absolute top-1 left-1 px-1 py-0.5 bg-brand-charcoal/65 backdrop-blur-xs rounded text-[8px] font-bold text-white uppercase tracking-wider scale-90">
                              {item.status === "existing" ? "E" : "Shop"}
                            </div>
                          </div>

                          {/* Attribute definitions */}
                          <div className="flex-1 min-w-0 space-y-1 text-xs">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-serif font-bold text-brand-charcoal truncate capitalize">{item.item}</span>
                            </div>

                            <p className="text-[11px] text-brand-sage font-medium">
                              Capsule: <strong className="text-brand-charcoal">{item.season || "General"}</strong>
                            </p>

                            <div className="flex items-center gap-1.5 py-0.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-brand-border/50 block shrink-0" 
                                style={{ backgroundColor: item.hex }}
                              />
                              <span className="text-[10px] text-brand-sage font-serif leading-none truncate capitalize">
                                {item.color} • {item.brand || "Unbranded"}
                              </span>
                            </div>

                            <div className="pt-1 border-t border-brand-border/40">
                              {renderItemCardNotes(item.notes)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sync Preview Footnote banner */}
                    <div className="bg-[#FAF9F6]/50 border-t border-brand-border/50 px-5 py-2.5 text-[10px] text-brand-sage flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-brand-olive shrink-0" />
                        <span>
                          <strong>Proposed Sync Result:</strong> Occurrence attributes will bundle and update to: {" "}
                          <strong className="text-brand-charcoal capitalize p-0.5 md:p-1 font-mono uppercase bg-brand-greige/40 rounded text-[9px]">{modelBrand}</strong> with {" "}
                          {modelImg ? <span className="text-green-700 font-bold">Image URL detected (Preserved!)</span> : <span className="italic">No photo file</span>} • {" "}
                          {hasExistingLinks ? <span className="text-green-700 font-bold">Web links matching (Preserved!)</span> : "Notes metadata synced"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {linkedGroups.length === 0 ? (
            <div className="bg-white border border-brand-border p-12 text-center rounded-sm space-y-3 shadow-3xs max-w-2xl mx-auto my-6">
              <Link2 className="w-10 h-10 text-brand-sage/60 mx-auto" />
              <h3 className="font-serif font-bold text-brand-charcoal text-base">No Linked Capsules Found</h3>
              <p className="text-xs text-brand-sage leading-relaxed text-balance">
                You haven't linked duplicates across your capsules yet. When you link a suspect duplicate set, they share a singular primary physical ID key so that updates, uploaded images, and links sync cleanly between them.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-green-50/40 border border-brand-border/70 p-4.5 rounded-xl text-xs text-brand-charcoal leading-relaxed flex items-start gap-3">
                <Check className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-serif font-semibold text-brand-charcoal block">Synchronized Garment Index</span>
                  <p>
                    These wardrobe items are currently bound to a singular physical garment ID. 
                    Any further edits she completes on either card (modifying its label, choosing high-resolution images, changing designer brands or notes/shopping links) will sync across all listed occurrences automatically!
                  </p>
                </div>
              </div>

              {linkedGroups.map((group) => (
                <div 
                  key={group.id} 
                  className="bg-white border border-brand-border rounded-sm shadow-sm overflow-hidden"
                >
                  {/* Header bar */}
                  <div className="bg-[#FAF9F6] border-b border-brand-border/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-brand-charcoal uppercase bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Synchronized & Active
                        </span>
                        <span className="text-[10px] text-brand-sage font-medium font-sans">
                          ID: {group.id.slice(0, 14)}...
                        </span>
                      </div>
                      <h3 className="font-serif font-medium text-brand-charcoal text-base mt-1 capitalize">
                        {group.name} ({group.items.length} occurrences)
                      </h3>
                    </div>

                    {/* Keep separate actions */}
                    <div>
                      <button
                        onClick={() => handleUnlinkCluster(group.id)}
                        className="px-3.5 py-1.5 border border-red-200/50 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Unlink className="w-3.5 h-3.5" /> Uncouple / Unlink
                      </button>
                    </div>
                  </div>

                  {/* Allied occurrences list */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#FCFCFC]">
                    {group.items.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border border-brand-border/65 p-4 rounded-xl flex gap-3.5 shadow-3xs relative"
                      >
                        <div className="w-16 h-20 bg-brand-greige border border-brand-border/40 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative bg-center bg-cover"
                          style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
                        >
                          {!item.imageUrl && (
                            <ImageIcon className="w-5 h-5 text-brand-sage/40" />
                          )}
                          <div className="absolute top-1 left-1 px-1 py-0.5 bg-green-700/80 backdrop-blur-xs rounded text-[7px] font-bold text-white uppercase tracking-wider">
                            Linked
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1 text-xs">
                          <span className="font-serif font-bold text-brand-charcoal truncate capitalize block">{item.item}</span>
                          <p className="text-[11px] text-brand-sage font-medium">
                            Capsule: <strong className="text-brand-charcoal">{item.season}</strong>
                          </p>

                          <div className="flex items-center gap-1.5 py-0.5">
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-brand-border/50 block shrink-0" 
                              style={{ backgroundColor: item.hex }}
                            />
                            <span className="text-[10px] text-brand-sage font-serif leading-none truncate capitalize">
                              {item.color} • {item.brand || "Unbranded"}
                            </span>
                          </div>

                          <div className="pt-1 border-t border-brand-border/40">
                            {renderItemCardNotes(item.notes)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
