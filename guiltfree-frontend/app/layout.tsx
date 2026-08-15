import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlexiFit AI",
  description:
    "FlexiFit AI: adaptive scheduling, an AI coach, recipe/exercise search, post-workout nutrition advice, and receipt OCR.",
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
