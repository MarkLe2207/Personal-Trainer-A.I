import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlexiFit AI",
  description:
<<<<<<< HEAD
    "FlexiFit AI: adaptive workout tables, pantry storage, and AI recipes & nutrition advice built on your ingredients.",
=======
    "FlexiFit AI: adaptive scheduling, an AI coach, recipe/exercise search, post-workout nutrition advice, and receipt OCR.",
>>>>>>> upstream/main
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
