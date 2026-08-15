import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guilt-Free Trainer & Pantry Companion",
  description:
    "Frontend for the Guilt-Free Personal Trainer & AI Pantry Companion backend: adaptive scheduling, AI coach, recipe/exercise search, and receipt OCR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
