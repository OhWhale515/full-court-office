"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/rankings", label: "Rankings", icon: "trophy" },
  { href: "/matchup", label: "Matchup", icon: "swords" },
  { href: "/draft", label: "Snake Draft", icon: "board" },
  { href: "/streaming", label: "Streaming", icon: "zap" },
  { href: "/trade", label: "Trade", icon: "repeat" },
  { href: "/compare", label: "Compare", icon: "compare" },
  { href: "/settings", label: "Settings", icon: "sliders" },
];

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 15l-2 5h4l-2-5zm0 0a6 6 0 006-6V4H6v5a6 6 0 006 6z" />
    </svg>
  ),
  swords: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M20 4L4 20M4 4l16 16" />
    </svg>
  ),
  board: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 3h18v18H3V3zm6 0v18m6-18v18M3 9h18M3 15h18" />
    </svg>
  ),
  zap: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  repeat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  ),
  compare: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 19V5l7 7-7 7zM15 5v14l-7-7 7-7z" />
    </svg>
  ),
  sliders: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-border-heavy px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent border-2 border-black flex items-center justify-center">
            <span className="text-black font-black text-xs">FC</span>
          </div>
          <span className="font-black text-sm uppercase tracking-tighter">Full Court Office</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 border-2 border-border-heavy hover:bg-accent hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile nav overlay */}
      {collapsed && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setCollapsed(false)}>
          <nav className="absolute top-14 left-0 right-0 bg-card border-b-4 border-accent p-6 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCollapsed(false)}
                  className={`flex items-center gap-4 px-4 py-4 border-2 font-bold uppercase tracking-wide transition-all ${
                    active
                      ? "bg-accent text-black border-black translate-x-1"
                      : "text-muted border-border-heavy hover:border-accent hover:text-foreground"
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
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r-2 border-border-heavy p-6 fixed left-0 top-0 bottom-0 z-30">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-accent border-2 border-black flex items-center justify-center shrink-0">
            <span className="text-black font-black text-xl">FC</span>
          </div>
          <div>
            <h1 className="font-black text-lg leading-none uppercase tracking-tighter">Full Court Office</h1>
            <p className="text-[10px] text-accent font-bold tracking-[0.2em] uppercase mt-1">Institutional Grade</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 border-2 font-bold uppercase text-xs tracking-widest transition-all group ${
                  active
                    ? "bg-accent text-black border-black shadow-[4px_4px_0px_#000]"
                    : "text-muted border-transparent hover:border-border-heavy hover:text-foreground"
                }`}
              >
                <span className={active ? "text-black" : "text-muted group-hover:text-accent"}>
                  {ICONS[item.icon]}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t-2 border-border-heavy">
          <div className="p-4 bg-background border-2 border-border-heavy">
            <p className="text-[10px] text-muted font-bold uppercase tracking-[0.1em] mb-1">Authenticated as</p>
            <p className="text-sm font-black text-foreground uppercase tracking-tight">Commissioner Jones</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green animate-pulse"></span>
              <span className="text-[10px] text-green font-black uppercase">System Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
