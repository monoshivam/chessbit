import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import GridPatternBackground from "@/components/GridPatternBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chess Analyzer!!!",
  description:
    "Analyze your chess games with Stockfish engine and AI commentary",
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
        {children}
      </body>
    </html>
  );
}
