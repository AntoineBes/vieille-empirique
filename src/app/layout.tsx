import type { Metadata, Viewport } from "next";
import { Inter, Lora, DM_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://veille.empirisme-citoyen.fr";

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Veille Empirique — Données publiques françaises et européennes",
    template: "%s — Veille Empirique",
  },
  description:
    "Agrégateur de métadonnées de publications officielles françaises et européennes : lois, décrets, statistiques, rapports publics, jurisprudence. Sources ouvertes, données publiques.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: "/ve-logo.svg",
    apple: "/ve-logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Veille Empirique",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${lora.variable} ${dmMono.variable}`}>
      <body className="font-sans">
        <NavBar />
        <main id="main-content" className="min-h-[70vh]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
