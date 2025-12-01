"use client";

import { useReportWebVitals } from "next/web-vitals";

export default function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("WebVital metric:", metric);
      return;
    }

    if (window.gtag) {
      window.gtag("event", metric.name, {
        value: Math.round(metric.value),
        event_category: metric.label === "web-vital" ? "Web Vitals" : "Custom",
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}
