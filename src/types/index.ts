export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
  phone?: string;
  addresses: Address[];
  isVerified: boolean;
  isActive: boolean;
  loyaltyPoints: number;
  totalSpent: number;
  orderCount: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  type: "shipping" | "billing" | "both";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  category: string;
  subcategory?: string;
  images: string[];
  thumbnail: string;
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  tags: string[];
  productType: "digital" | "physical" | "bundle";
  downloadUrl?: string;
  fileSize?: string;
  version?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants?: ProductVariant[];
  isFeatured: boolean;
  isActive: boolean;
  isTaxable: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  rating: number;
  reviewCount: number;
  salesCount: number;
  viewCount: number;
  relatedProducts?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  name: string;
  options: Array<{
    value: string;
    price: number;
    stock: number;
    sku: string;
  }>;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive: boolean;
  order: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  paymentMethod: "stripe" | "paypal" | "sslcommerz" | "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  paymentId?: string;
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  notes?: string;
  adminNotes?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  customerIP?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  sku: string;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BillingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Review {
  _id: string;
  product: string;
  user: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  adminReply?: {
    message: string;
    repliedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  _id: string;
  user?: string;
  sessionId?: string;
  items: CartItem[];
  updatedAt: Date;
}

export interface CartItem {
  product: string;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  usagePerCustomer?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  createdAt: Date;
  updatedAt: Date;
}
