import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppProvider } from "@/components/app/AppProvider";
import { AppShell } from "@/components/app/AppShell";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dishy",
  description: "Plan het weekmenu van je gezin en maak je Colruyt Xtra-lijst.",
};

const CABINET_GROTESK_CSS =
  "https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800,900&display=swap";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      suppressHydrationWarning
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased [scrollbar-gutter:stable]`}
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={CABINET_GROTESK_CSS} />
      </head>
      <body suppressHydrationWarning className="neo-surface flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}