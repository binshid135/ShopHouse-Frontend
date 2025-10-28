// lib/types.ts
export interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  originalPrice: number;
  discountedPrice: number;
  images: string[];
  isRecommended: boolean;
  isMostRecommended: boolean;
  recommendationOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  user?: User;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}