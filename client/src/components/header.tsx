import { CalendarDays, MapPin, Map as MapIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import heroImage from "@assets/chappaqua_hero.png";

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight" data-testid="text-app-title">
                  Chappaqua Pulse
                </h1>
                <p className="text-xs text-muted-foreground">
                  A weekly tracker into what's happening in Chappaqua
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/living-map.html"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-foreground hover-elevate active-elevate-2 border border-border"
                data-testid="link-living-map"
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Living Map</span>
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <div className="relative w-full h-40 md:h-56 lg:h-64 overflow-hidden" data-testid="hero-banner">
        <img
          src={heroImage}
          alt="Downtown Chappaqua, New York"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 lg:left-8">
          <div className="flex items-center gap-1.5 text-white drop-shadow-lg">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Chappaqua, NY</span>
          </div>
        </div>
      </div>
    </>
  );
}
