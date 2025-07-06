import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware";
import { getData } from "../controllers/analytics.controller";
const router = express.Router();

router.get("/",protectRoute,adminRoute,getData);

export default router;
