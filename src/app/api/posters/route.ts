import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FALLBACK_POSTERS = [
  "WhatsApp Image 2026-08-03 at 5.44.26 PM.jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.27 PM.jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.28 PM.jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.30 PM (1).jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.30 PM.jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.31 PM (1).jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.31 PM.jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.32 PM (1).jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.32 PM (2).jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.32 PM.jpeg",
  "WhatsApp Image 2026-08-03 at 5.44.33 PM.jpeg"
];

export async function GET() {
  try {
    const postersDir = path.join(process.cwd(), "public", "posters");
    if (fs.existsSync(postersDir)) {
      const files = fs.readdirSync(postersDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
      if (imageFiles.length > 0) {
        return NextResponse.json({
          success: true,
          posters: imageFiles.map(file => `/posters/${file}`),
        });
      }
    }
  } catch (e) {
    console.warn("Failed to read posters directory on server", e);
  }

  // Fallback if readdir fails or directory is empty
  return NextResponse.json({
    success: true,
    posters: FALLBACK_POSTERS.map(file => `/posters/${file}`),
  });
}
