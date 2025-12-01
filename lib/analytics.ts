export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

// Log custom events
export const event = ({ action, params }: { action: string; params?: any }) => {
  if (!GA_ID) return;

  window.gtag("event", action, params);
};

// Pageview
export const pageview = (url: string) => {
  if (!GA_ID) return;

  window.gtag("config", GA_ID, {
    page_path: url,
  });
};
