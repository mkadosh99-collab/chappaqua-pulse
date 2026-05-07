import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPin, Store, UtensilsCrossed, Shirt, Sparkles, Home, Wrench, Building2 } from "lucide-react";
import retailersData from "@shared/retailers.json";

type Retailer = {
  id: string;
  name: string;
  category: string;
  cluster: string;
  address: string;
  owner: string;
};

const RETAILERS = retailersData as Retailer[];

const CATEGORY_META: Record<string, { label: string; icon: typeof Store; blurb: string }> = {
  food: { label: "Food & Drink", icon: UtensilsCrossed, blurb: "Restaurants, cafes, bakeries, and grocers." },
  apparel: { label: "Apparel & Accessories", icon: Shirt, blurb: "Clothing, shoes, and accessory boutiques." },
  specialty: { label: "Specialty Retail", icon: Sparkles, blurb: "Books, gifts, jewelry, flowers, and curated goods." },
  home: { label: "Home & Design", icon: Home, blurb: "Interiors, hardware, paint, tile, and home goods." },
  wellness: { label: "Health & Wellness", icon: Sparkles, blurb: "Salons, spas, fitness, and personal care." },
  service: { label: "Services", icon: Wrench, blurb: "Professional, financial, and everyday services." },
  civic: { label: "Civic & Community", icon: Building2, blurb: "Banks, town offices, and community institutions." },
};

const CLUSTER_LABELS: Record<string, string> = {
  chappaqua_downtown: "Downtown Chappaqua",
  chappaqua_south: "South Greeley Ave",
  chappaqua_north: "North Greeley Ave",
  millwood: "Millwood",
  king_st: "King Street",
  station_plaza: "Station Plaza",
};

const CATEGORY_ORDER = ["food", "apparel", "specialty", "home", "wellness", "service", "civic"];

function searchUrlFor(name: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${name} Chappaqua NY`)}`;
}

function mapsUrlFor(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function RetailersSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const el = document.getElementById("retailers");
    if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Retailer[]> = {};
    for (const r of RETAILERS) {
      if (!map[r.category]) map[r.category] = [];
      map[r.category].push(r);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, []);

  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);
  const visibleCategories = activeCategory ? [activeCategory] : categories;

  return (
    <div id="retailers" className="py-8 scroll-mt-24" data-testid="section-retailers">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Local Retailers</h2>
        <p className="text-muted-foreground">
          Browse Chappaqua and Millwood businesses by tenant type. Source: Chappaqua-Millwood Chamber directory.
        </p>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
            activeCategory === null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover-elevate"
          }`}
          data-testid="filter-retailer-all"
        >
          <Store className="w-4 h-4" />
          All
          <span className="opacity-70">({RETAILERS.length})</span>
        </button>
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(active ? null : cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover-elevate"
              }`}
              data-testid={`filter-retailer-${cat}`}
            >
              <Icon className="w-4 h-4" />
              {meta.label}
              <span className="opacity-70">({grouped[cat].length})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-10">
        {visibleCategories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const items = grouped[cat] || [];
          return (
            <section key={cat} data-testid={`group-retailer-${cat}`}>
              <div className="flex items-baseline justify-between gap-3 mb-3 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{meta.label}</h3>
                  <span className="text-xs text-muted-foreground font-medium">({items.length})</span>
                </div>
                <p className="text-xs text-muted-foreground hidden md:block">{meta.blurb}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((r) => (
                  <div
                    key={r.id}
                    className="bg-card border border-card-border rounded-lg p-4 hover-elevate transition-colors"
                    data-testid={`card-retailer-${r.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-foreground leading-snug" data-testid={`text-retailer-name-${r.id}`}>
                        {r.name}
                      </h4>
                    </div>
                    {r.address && (
                      <p className="text-xs text-muted-foreground mb-1 flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{r.address}</span>
                      </p>
                    )}
                    {CLUSTER_LABELS[r.cluster] && (
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80 mb-3">
                        {CLUSTER_LABELS[r.cluster]}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a
                        href={searchUrlFor(r.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        data-testid={`link-retailer-website-${r.id}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Find website
                      </a>
                      {r.address && (
                        <a
                          href={mapsUrlFor(r.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
                          data-testid={`link-retailer-map-${r.id}`}
                        >
                          <MapPin className="w-3 h-3" />
                          Directions
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
