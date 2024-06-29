"use client";

import { ReactLenis as Lenis } from "lenis/react";

export function ReactLenis({ children }: { children: React.ReactNode }) {
  return <Lenis root>{children}</Lenis>;
}
