import type { LucideIcon } from "lucide-react";

export interface SignUpFormType {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export interface User {
  name: string;
  email: string;
  role: string;
}
export interface UserStoreType {
  user: User | null;
  loading: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  signup: (params: SignUpFormType) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface Category {
  href: string;
  name: string;
  imageUrl: string;
}

export interface categoryProps {
  category: Category;
}

export interface CreateProductType {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isFeatured: boolean;
  quantity: number;
}

export interface ProductStoreType {
  products: Product[];
  loading: boolean;
  setProducts: (products: Product[]) => void;
  createProduct: (product: CreateProductType) => Promise<void>;
  fetchAllProducts: () => Promise<void>;
  fetchProductsByCategory: (category: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleFeaturedProduct: (id: string) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
}

export interface ProductCardProps {
  product: Product;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  userId: string;
  expirationDate: Date;
}

export interface CartStoreType {
  cart: Product[];
  coupon: Coupon | null;
  total: number;
  subtotal: number;
  isCouponApplied: boolean;
  getCartItems: () => Promise<void>;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  calculateTotals: () => void;
  clearCart: () => Promise<void>;
  getMyCoupon: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

export interface CartItemProps {
  item: Product;
}

export interface AnalyticsDataType {
  users: number;
  products: number;
  totalSales: number;
  totalRevenue: number;
}

export interface DailySalesDataType {
  date: string;
  sales: number;
  revenue: number;
}

export interface AnalyticsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

export interface FeaturedProductsProps {
  featuredProducts: Product[];
}
