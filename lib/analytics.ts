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

export const viewItemGA = (product: any) => {
  event({
    action: "view_item",
    params: {
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          category: product.category
        },
      ],
    },
  });
};

export const addToCartGA = (product: any, quantity: number = 1) => {
  event({
    action: "add_to_cart",
    params: {
      currency: "AED",
      value: product.price * quantity,
      items: [
        {
          item_name: product,
          quantity,
        },
      ],
    },
  });
};

