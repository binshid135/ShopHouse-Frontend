"use client";

import { GoogleAnalytics as GA } from "@next/third-parties/google";

export default function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!GA_ID) return null;

  return <GA gaId={GA_ID} />;
}
