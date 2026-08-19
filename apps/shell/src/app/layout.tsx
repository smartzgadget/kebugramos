import type { Metadata } from "next";
import "./globals.css";
import "./tailwind.css";
import { SovereignSidebar } from "@/components/SovereignSidebar";
import { TopHeader } from "@/components/TopHeader";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "KebuGram — Sovereign Super App",
  description: "KebuGram consumer web app shell",
  manifest: "/manifest.webmanifest",
  themeColor: "#0B3A2E",
  appleWebApp: { capable: true, title: "KebuGram", statusBarStyle: "default" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <SovereignSidebar />
          <TopHeader />
          <main className="shell__main" id="mfe-slot">
            {children}
          </main>
        </div>
        <PwaRegister />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__KEBUGRAM_CONFIG__=${JSON.stringify({
              apiBase: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000",
              wsBase: process.env.NEXT_PUBLIC_WS_BASE || "ws://localhost:4001",
              env: process.env.NEXT_PUBLIC_ENV || "local",
            })}`,
          }}
        />
      </body>
    </html>
  );
}
