import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlexiFit AI",
  description:
    "FlexiFit AI: adaptive workout tables, pantry storage, and AI recipes & nutrition advice built on your ingredients.",
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
