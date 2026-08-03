"use client";

import { ReactNode } from "react";
import { AppHeader } from "@/components/common/AppHeader";

export function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
