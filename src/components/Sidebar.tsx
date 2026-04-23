"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/rankings", label: "Rankings", icon: "trophy" },
  { href: "/matchup", label: "Matchup", icon: "swords" },
  { href: "/streaming", label: "Streaming", icon: "zap" },
  { href: "/trade", label: "Trade", icon: "repeat" },
  { href: "/compare", label: "Compare", icon: "compare" },
  { href: "/settings", label: "Settings", icon: "sliders" },
];

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15l-2 5h4l-2-5zm0 0a6 6 0 006-6V4H6v5a6 6 0 006 6zM6 4H4a1 1 0 00-1 1v1a4 4 0 004 4M18 4h2a1 1 0 011 1v1a4 4 0 01-4 4" />
    </svg>
  ),
  swords: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M18 6h-5m5 0v5M18 18L6 6M6 6h5M6 6v5" />
    </svg>
  ),
  zap: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  repeat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  ),
  compare: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V5l7 7-7 7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v14l-7-7 7-7z" />
    </svg>
  ),
  sliders: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">FC</span>
          </div>
          <span className="font-semibold text-sm">Full Court Office</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-card-hover transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile nav overlay */}
      {collapsed && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setCollapsed(false)}>
          <nav className="absolute top-14 left-0 right-0 bg-card border-b border-border p-4 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCollapsed(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-foreground hover:bg-card-hover"
                  }`}
                >
                  {ICONS[item.icon]}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-card border-r border-border p-4 fixed left-0 top-0 bottom-0">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-white font-bold">FC</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Full Court Office</h1>
            <p className="text-xs text-muted">WNBA Fantasy</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-foreground hover:bg-card-hover"
                }`}
              >
                {ICONS[item.icon]}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          <div className="px-3 py-2">
            <p className="text-xs text-muted">Commissioner Jones</p>
            <p className="text-xs text-muted/60">4-Team League</p>
          </div>
        </div>
      </aside>
    </>
  );
}
