import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientHydrator } from "@/components/shared";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cartify — Considered Goods",
  description:
    "A warm, editorial storefront for considered goods, with a checkout built to disappear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <ClientHydrator />
        {children}
      </body>
    </html>
  );
}
