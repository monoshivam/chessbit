import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

import GridPatternBackground from "@/components/GridPatternBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "chessty",
  description:
    "A modern, sleek, and intuitive chess analysis platform built for players who want to grow smarter with every move.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <GridPatternBackground />
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
