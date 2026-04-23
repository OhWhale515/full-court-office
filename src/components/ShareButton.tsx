"use client";

import { useState } from "react";
import type { ShareableLineup } from "@/lib/share";
import { shareLineup, saveLineup } from "@/lib/share";

interface ShareButtonProps {
  lineup: ShareableLineup;
}

export default function ShareButton({ lineup }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleShare(method: "native" | "copy" | "twitter" | "sms" | "email") {
    try {
      await shareLineup(lineup, method);
      if (method === "copy") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled native share
    }
    setShowMenu(false);
  }

  function handleSave() {
    saveLineup(lineup);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-background border border-border text-muted hover:text-foreground transition-colors"
        >
          {saved ? "Saved!" : "Save Lineup"}
        </button>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent/90 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl p-2 w-48 shadow-xl animate-fade-in">
            {hasNativeShare && (
              <ShareOption label="Share..." icon="share" onClick={() => handleShare("native")} />
            )}
            <ShareOption label={copied ? "Copied!" : "Copy to Clipboard"} icon="copy" onClick={() => handleShare("copy")} />
            <ShareOption label="Text Message" icon="sms" onClick={() => handleShare("sms")} />
            <ShareOption label="Email" icon="email" onClick={() => handleShare("email")} />
            <ShareOption label="Post on X" icon="twitter" onClick={() => handleShare("twitter")} />
          </div>
        </>
      )}
    </div>
  );
}

function ShareOption({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  const icons: Record<string, React.ReactNode> = {
    share: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    copy: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    sms: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    email: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    twitter: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-card-hover transition-colors"
    >
      {icons[icon]}
      {label}
    </button>
  );
}
