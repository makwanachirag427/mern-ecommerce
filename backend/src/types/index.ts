import { Request } from "express";
import { Document, Types } from "mongoose";

// Basic shape of user data (used for Schema)
export interface UserType extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  cartItems: { quantity: number; product: Types.ObjectId }[];
  role: "customer" | "admin";
}

// Mongoose document (includes instance methods and _id, timestamps, etc.)
export interface UserDocument extends UserType {
  comparePassword(password: string): Promise<boolean>;
}

export interface ProductDocument extends Document {
  _id : Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isFeatured: boolean;
}

export interface RequestType extends Request {
  user?: UserType;
}

export interface CouponDocument extends Document {
  code: string;
  discountPercentage: number;
  expirationDate: Date;
  isActive: boolean;
  userId: Types.ObjectId;
}

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  products: { product: Types.ObjectId; quantity: number; price: number }[];
  totalAmount: number;
  stripeSessionId: string;
}

export interface productItem {
  id: string;
  quantity: number;
  price: number;
}

export type SessionMetadata = {
  userId: string;
  couponCode?: string;
  products: string; //JSON string
};

export interface AnalyticsData {
  users: number;
  products: number;
  totalSales: number;
  totalRevenue: number;
}
