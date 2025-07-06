import express from "express";
import { ENVVARS } from "./utils/envVars";
import { connectDB } from "./config/db";
import cookieParser from "cookie-parser";
import cors from "cors";


// routes 
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import cartRoutes from "./routes/cart.route";
import couponRoutes from "./routes/coupon.route";
import paymentRoutes from "./routes/payment.route";
import analyticsRoutes from "./routes/analytics.route";

const app = express();
const PORT = ENVVARS.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors({
  origin :"http://localhost:5173",
  credentials: true,
}))

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is listening on port http://localhost:${PORT}`);
});
