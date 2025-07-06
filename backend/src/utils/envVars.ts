import dotenv from "dotenv";
dotenv.config();

export const ENVVARS = {
  PORT: process.env.PORT!,
  MONGODB_URI: process.env.MONGODB_URI!,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  NODE_ENV: process.env.NODE_ENV!,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  CLIENT_URL: process.env.CLIENT_URL!,
};
