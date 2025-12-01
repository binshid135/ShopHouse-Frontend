import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/cartContext";
import PageTransition from './components/PageTransition';
import GoogleAnalytics from "./components/GoogleAnalytics";
import WebVitals from "./components/WebVitals";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Best Household and Kitchen Items in Al Ain | Shop House General trading",
  description: "Discover high-quality household and kitchen items at our Al Ain shop. We provide everything from cookware to home essentials for homes and restaurants in the Al ain.",
  alternates: {
    canonical: "https://www.shophousealain.com",
  },
  keywords: [
    "household items Al Ain",
    "kitchen equipments",
    "kitchen items Al Ain",
    "restaurant supplies Al Ain",
    "kitchen utensils Al Ain",
    "home items Al Ain",
    "Shop House Al Ain",
    "restaurant supplies",
    "kitchen supplies",
    "shop house general trading"
  ],
  metadataBase: new URL("https://www.shophousealain.com"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Shop House general trading Al Ain – Household, Kitchen and Restaurant equipments",
    description:
      "Best shop in Al Ain for kitchen items, household essentials, restaurant supplies & cleaning products.",
    url: "https://www.shophousealain.com/",
    siteName: "Shop House General trading Al ain",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <PageTransition>
            {children}
            <GoogleAnalytics />
            <WebVitals />
          </PageTransition>
        </CartProvider>
      </body>
    </html>
  );
}
