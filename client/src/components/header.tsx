import { CalendarDays, MapPin, Map as MapIcon, Search, Facebook, Instagram } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import heroImage from "@assets/chappaqua_station_hero.jpg";

type TabKey = "events" | "specials" | "retailers";

interface HeaderProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
}

export function Header({ activeTab = "events", onTabChange }: HeaderProps) {
  return (
    <>
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-[10px] font-medium uppercase tracking-[.14em]">
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/chappaqua.ny/" target="_blank" rel="noopener noreferrer" aria-label="Chappaqua.NY on Instagram" className="opacity-80 hover:opacity-100 transition-opacity" data-testid="link-social-ig-chappaqua">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/chappaqua_millwood_chamber/" target="_blank" rel="noopener noreferrer" aria-label="Chappaqua-Millwood Chamber on Instagram" className="opacity-80 hover:opacity-100 transition-opacity" data-testid="link-social-ig-chamber">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/living-map.html" className="opacity-90 hover:opacity-100" data-testid="link-utility-map">Living Map</a>
              <span className="opacity-40" aria-hidden="true">|</span>
              <a href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event" className="opacity-90 hover:opacity-100" data-testid="link-utility-submit">Submit an Event</a>
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-primary/15 bg-background/95 text-foreground backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-secondary text-primary">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-editorial text-2xl md:text-3xl font-bold leading-none tracking-tight" data-testid="text-app-title">
                  Chappaqua Pulse
                </h1>
                <p className="mt-1 font-utility text-[9px] uppercase tracking-[.16em] text-muted-foreground">
                  The local edit
                </p>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <label className="relative w-full block">
                <span className="sr-only">Search events, restaurants, and places</span>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60 pointer-events-none" aria-hidden="true" />
                 <input
                  type="search"
                  placeholder="Use Cmd/Ctrl+F to search this page..."
                   className="w-full h-10 pl-9 pr-4 rounded-full text-sm text-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-secondary"
                  data-testid="input-global-search"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide bg-secondary text-secondary-foreground hover:brightness-95 transition-colors"
                data-testid="link-submit-cta"
              >
                Submit an Event
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <nav className="border-t border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <ul className="flex items-center gap-1 overflow-x-auto">
              <li>
                <button
                  onClick={() => onTabChange?.("events")}
                    className={`px-4 md:px-6 py-3 text-xs font-bold uppercase tracking-[.08em] whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === "events"
                      ? "border-secondary text-primary"
                      : "border-transparent text-muted-foreground hover:text-primary"
                  }`}
                  data-testid="link-nav-events"
                >
                  Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange?.("specials")}
                  className={`px-4 md:px-6 py-3 text-sm font-semibold uppercase tracking-wide whitespace-nowrap border-b-4 transition-colors ${
                    activeTab === "specials"
                      ? "border-primary-foreground bg-secondary-foreground/10"
                      : "border-transparent hover:bg-secondary-foreground/10"
                  }`}
                  data-testid="link-nav-dining"
                >
                  Dining & Specials
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange?.("retailers")}
                  className={`px-4 md:px-6 py-3 text-sm font-semibold uppercase tracking-wide whitespace-nowrap border-b-4 transition-colors ${
                    activeTab === "retailers"
                      ? "border-primary-foreground bg-secondary-foreground/10"
                      : "border-transparent hover:bg-secondary-foreground/10"
                  }`}
                  data-testid="link-nav-retailers"
                >
                  Retailers
                </button>
              </li>
              <li>
                <a
                  href="/living-map.html"
                  className="inline-flex items-center gap-1.5 px-4 md:px-6 py-3 text-xs font-bold uppercase tracking-[.08em] whitespace-nowrap border-b-2 border-transparent text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-nav-living-map"
                >
                  <MapIcon className="w-4 h-4" />
                  Living Map
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>

       <div className="relative w-full h-[23rem] md:h-[31rem] overflow-hidden" data-testid="hero-banner">
        <img
          src={heroImage}
          alt="Downtown Chappaqua, New York"
          className="w-full h-full object-cover"
        />
         <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/55 to-primary/10" />
         <div className="absolute inset-0 flex flex-col items-start justify-end pb-10 md:pb-16 max-w-7xl mx-auto px-5 md:px-8">
           <p className="font-utility text-[10px] uppercase tracking-[.2em] text-secondary mb-3">Chappaqua, New York</p>
           <h2 className="max-w-3xl text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground tracking-tight leading-[.95]" data-testid="text-hero-title">
             The good stuff,<br />close to home.
          </h2>
           <p className="mt-5 text-base md:text-lg text-primary-foreground/90 max-w-xl">
            Everything happening around town — events, dining, and the places that make our community.
          </p>
           <div className="mt-6 flex items-center gap-1.5 text-primary-foreground/85 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="font-medium uppercase tracking-widest text-xs">Chappaqua · Millwood · New Castle</span>
          </div>
        </div>
      </div>
    </>
  );
}
