import { Response } from "express";
import { RequestType } from "../types";
import Coupon from "../models/coupon.model";

export const getCoupon = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user?._id,
      isActive: true,
    });
    res.json(coupon || null);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occured" });
    }
  }
};
export const validateCoupon = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.body;
  
    const coupon = await Coupon.findOne({
      code,
      userId: req.user?._id,
      isActive: true,
    });
    if (!coupon) {
      res.status(404).json({ message: "Coupon not found" });
      return;
    }
    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      res.status(404).json({ message: "Coupon expired" });
      return;
    }

    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occured" });
    }
  }
};
