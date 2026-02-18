import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Inter, Lato } from "next/font/google";
import "./globals.css";
import { Navigation } from "./_components/navigation";
import { AppProvider } from "./providers";
// import { getPages } from "@/lib/api/pages";
import AuthDebugger from "@/components/debug/auth-debugger";
import AuthStateDebug from "./api/auth/debug/auth-state";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["arial", "sans-serif"],
});

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
  fallback: ["arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "VolunMe",
  description: "Help others, build friendships, and make a real difference.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const pages = await getPages();

  return (
    <html lang="en">
      <body
        className={`${inter.className} ${inter.variable} ${lato.variable} antialiased bg-brand-fill-bg`}
      >
        <AppProvider>
          <header className="fixed top-0 left-0 right-0 z-50 bg-brand-fill-bg border-b border-brand-stroke-weak">
            <AuthDebugger />
            {/* <Navigation pages={pages} /> */}
            <Navigation />
          </header>
          <main className="pt-16">
            <NuqsAdapter>{children}</NuqsAdapter>
            {/* <AuthStateDebug /> */}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
