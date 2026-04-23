import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Full Court Office | WNBA Fantasy Companion",
  description:
    "Custom scoring rankings, matchup analysis, and roster optimization for your WNBA fantasy league.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Full Court Office",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
