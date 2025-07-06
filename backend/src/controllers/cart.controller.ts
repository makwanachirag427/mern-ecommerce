import { Response } from "express";
import { RequestType } from "../types";
import Product from "../models/product.model";

export const getCartProducts = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    const cart = req.user!.cartItems;

    // Get list of product IDs
    const productIds = cart.map((item) => item.product);

    // Fetch products from DB
    const products = await Product.find({ _id: { $in: productIds } });

    // Attach quantity to each product
    const cartItems = products.map((product) => {
      const item = cart.find(
        (cartItem) => cartItem.product.toString() === (product._id.toString())
      );

      return {
        ...product.toObject(),
        quantity: item?.quantity ?? 1,
      };
    });

    res.json(cartItems);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const addToCart = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user?.cartItems.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user?.cartItems.push({ quantity: 1, product: productId });
    }

    await user?.save();
    res.json(user?.cartItems);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const removeAllFromCart = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.body;
    const user = req.user!;

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};
export const updateQuantity = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;

    const user = req.user!;

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.product.toString() !== productId
        );
        await user.save();
        res.json(user.cartItems);
        return;
      }
      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};
