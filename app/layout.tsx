import type { Metadata, Viewport } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Coy Discover",
  description: "Swipe-based discovery tab for Coy",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}