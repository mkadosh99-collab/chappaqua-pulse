import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import heroImage from "@assets/chappaqua_station_hero.jpg";

type TabKey = "events" | "specials" | "retailers";

interface HeaderProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  onToday?: () => void;
}

export function Header({ activeTab = "events", onTabChange, onToday }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const selectTab = (tab: TabKey) => {
    onTabChange?.(tab);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 text-black backdrop-blur">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="flex min-h-[78px] items-center justify-between gap-5">
            <a href="/" className="font-editorial text-[19px] font-medium tracking-[-.055em] text-[#ed7e32]" data-testid="text-app-title">Chappaqua Pulse</a>
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
              <button onClick={() => selectTab("events")} className="pulse-nav-link" data-testid="link-nav-events">Events</button>
              <button onClick={() => selectTab("specials")} className="pulse-nav-link" data-testid="link-nav-dining">Dining &amp; Specials</button>
              <button onClick={() => selectTab("retailers")} className="pulse-nav-link" data-testid="link-nav-retailers">Retailers</button>
              <a href="/living-map.html" className="pulse-nav-link" data-testid="link-nav-living-map">Living Map</a>
              <a href="#get-involved" className="pulse-nav-link" data-testid="link-nav-get-involved">Get involved</a>
              <a href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event" className="pulse-nav-link">Submit event</a>
            </nav>
            <div className="flex items-center gap-2">
              <label className="hidden sm:block relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/55" />
                <input type="search" placeholder="Search this page" onFocus={(event) => event.currentTarget.placeholder = "Use Cmd/Ctrl + F"} className="h-10 w-[154px] rounded-full border border-[#ed7e32]/40 bg-transparent pl-9 pr-3 text-[11px] outline-none transition focus:w-[185px] focus:border-[#ed7e32]" data-testid="input-global-search" />
              </label>
              <ThemeToggle />
              <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="grid h-9 w-9 place-items-center lg:hidden" aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
            </div>
          </div>
          {menuOpen && <nav className="grid border-t border-black/10 py-3 lg:hidden" aria-label="Mobile navigation">
            <a href="#get-involved" onClick={() => setMenuOpen(false)} className="pulse-mobile-link">Get involved</a>
            <button onClick={() => selectTab("events")} className="pulse-mobile-link">Events</button><button onClick={() => selectTab("specials")} className="pulse-mobile-link">Dining &amp; Specials</button><button onClick={() => selectTab("retailers")} className="pulse-mobile-link">Retailers</button><a href="/living-map.html" className="pulse-mobile-link">Living Map</a><a href="mailto:hello@chappaquadaily.com?subject=Submit%20an%20Event" className="pulse-mobile-link">Submit event</a>
          </nav>}
        </div>
      </header>

      {activeTab === "events" && (
       <section className="relative w-full min-h-[510px] overflow-hidden md:min-h-[590px]" data-testid="hero-banner">
        <img
          src={heroImage}
           alt="Chappaqua train station in autumn"
           className="absolute inset-0 w-full h-full object-cover"
        />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative mx-auto flex min-h-[510px] max-w-4xl flex-col items-center justify-center px-5 pb-4 text-center text-white md:min-h-[590px]">
             <h2 className="max-w-4xl font-editorial text-[40px] font-light leading-[1.02] tracking-[-.055em] md:text-6xl lg:text-7xl" data-testid="text-hero-title">
              A town where everyone knows your name.
          </h2>
             <p className="mt-7 max-w-xl text-[12px] font-normal leading-relaxed text-white/90 md:text-[13px]">
               From town events and restaurant specials to new openings, find what&apos;s happening in Chappaqua and be part of the community.
          </p>
            <button type="button" onClick={onToday} className="mt-8 w-full max-w-[270px] rounded-full bg-[#ed7e32] px-8 py-4 text-[11px] font-medium text-white transition-transform hover:scale-[1.025] focus:outline-none focus:ring-2 focus:ring-white" data-testid="button-happening-today">happening today</button>
        </div>
       </section>
      )}
    </>
  );
}
