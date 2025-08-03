import { Response } from "express";
import type { productItem, RequestType, SessionMetadata } from "../types";
import Coupon from "../models/coupon.model";
import { stripe } from "../config/stripe";
import { ENVVARS } from "../utils/envVars";
import Order from "../models/order.model";

const FRONTEND_URL =
  ENVVARS.NODE_ENV === "developemnt"
    ? ENVVARS.NODE_ENV
    : "https://mern-ecommerce-k0ia.onrender.com";

export const createCheckoutSession = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      res.status(400).json({ error: "Invalid or empty product array" });
      return;
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); //stripe wants you to send in the format of cents;
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user?._id.toString(),
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${FRONTEND_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/purchase-cancel`,
      shipping_address_collection: {
        allowed_countries: ["US", "IN"], // Add others as needed
      },
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user?._id.toString() || "",
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    if (totalAmount >= 20000) {
      console.log("creating new coupon", req.user?.id.toString());
      await createNewCoupon(req.user?.id.toString());
    }
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const checkoutSuccess = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const metadata = session.metadata as SessionMetadata;

      if (metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: metadata.couponCode,
            userId: metadata.userId,
          },
          { isActive: false }
        );
      }

      const products: productItem[] = JSON.parse(metadata.products);

      const newOrder = new Order({
        user: metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total ? session.amount_total / 100 : 0, //convert from cents to dollars
        stripeSessionId: sessionId,
      });

      await newOrder.save();

      res.status(200).json({
        success: true,
        message:
          "Payment successful, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

async function createStripeCoupon(discountPercentage: number) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
}

async function createNewCoupon(userId: string) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
}
