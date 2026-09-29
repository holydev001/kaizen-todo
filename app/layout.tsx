import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Museboard — make room for good ideas",
  description: "A calm, creative task space for turning sparks into finished work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
