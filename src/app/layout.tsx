import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/tokens.css";
import { RootLayoutClient } from "@/components/layout/RootLayoutClient";

export const metadata: Metadata = {
  title: "LocalLens - AI-Powered Neighborhood Scoring",
  description: "Find your perfect neighborhood with personalized AI insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-primary text-text-primary min-h-screen relative">
        <div className="paper-texture" aria-hidden="true" />
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
