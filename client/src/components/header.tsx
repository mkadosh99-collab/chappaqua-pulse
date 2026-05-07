import { CalendarDays, MapPin, Map as MapIcon, Search, Facebook, Instagram } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import heroImage from "@assets/chappaqua_hero.png";

type TabKey = "events" | "specials" | "retailers";

interface HeaderProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
}

export function Header({ activeTab = "events", onTabChange }: HeaderProps) {
  return (
    <>
      {/* Top utility bar */}
      <div className="bg-primary text-primary-foreground border-b border-primary/40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9 text-xs">
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/chappaqua.ny/" target="_blank" rel="noopener noreferrer" aria-label="Chappaqua.NY on Instagram" className="opacity-80 hover:opacity-100 transition-opacity" data-testid="link-social-ig-chappaqua">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/chappaqua_millwood_chamber/" target="_blank" rel="noopener noreferrer" aria-label="Chappaqua-Millwood Chamber on Instagram" className="opacity-80 hover:opacity-100 transition-opacity" data-testid="link-social-ig-chamber">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-4 font-medium tracking-wide uppercase">
              <a href="/living-map.html" className="opacity-90 hover:opacity-100" data-testid="link-utility-map">Living Map</a>
              <span className="opacity-40" aria-hidden="true">|</span>
              <a href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event" className="opacity-90 hover:opacity-100" data-testid="link-utility-submit">Submit an Event</a>
            </div>
          </div>
        </div>
      </div>

      {/* Brand band */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary-foreground/10 border border-primary-foreground/20">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight" data-testid="text-app-title">
                  Chappaqua Pulse
                </h1>
                <p className="text-[11px] md:text-xs uppercase tracking-widest opacity-80">
                  Discover · Dine · Connect
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
                  className="w-full h-10 pl-9 pr-4 rounded-md text-sm text-foreground bg-background border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-secondary"
                  data-testid="input-global-search"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wide bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                data-testid="link-submit-cta"
              >
                Submit an Event
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Nav band */}
        <nav className="bg-secondary text-secondary-foreground border-t border-primary-foreground/10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <ul className="flex items-center gap-1 overflow-x-auto">
              <li>
                <button
                  onClick={() => onTabChange?.("events")}
                  className={`px-4 md:px-6 py-3 text-sm font-semibold uppercase tracking-wide whitespace-nowrap border-b-4 transition-colors ${
                    activeTab === "events"
                      ? "border-primary-foreground bg-secondary-foreground/10"
                      : "border-transparent hover:bg-secondary-foreground/10"
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
                  className="inline-flex items-center gap-1.5 px-4 md:px-6 py-3 text-sm font-semibold uppercase tracking-wide whitespace-nowrap border-b-4 border-transparent hover:bg-secondary-foreground/10 transition-colors"
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

      {/* Hero with title overlay */}
      <div className="relative w-full h-56 md:h-72 lg:h-96 overflow-hidden" data-testid="hero-banner">
        <img
          src={heroImage}
          alt="Downtown Chappaqua, New York"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-lg uppercase" data-testid="text-hero-title">
            Your Weekly Chappaqua
          </h2>
          <p className="mt-3 text-base md:text-xl text-white/95 max-w-2xl drop-shadow-md">
            Everything happening around town — events, dining, and the places that make our community.
          </p>
          <div className="mt-5 flex items-center gap-1.5 text-white/90 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="font-medium uppercase tracking-widest text-xs">Chappaqua · Millwood · New Castle</span>
          </div>
        </div>
      </div>
    </>
  );
}
