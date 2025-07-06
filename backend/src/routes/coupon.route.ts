import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller";
const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);

export default router;
