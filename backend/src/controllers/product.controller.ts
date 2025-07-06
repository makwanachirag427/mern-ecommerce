import type { Request, Response } from "express";
import Product from "../models/product.model";
import { redis } from "../config/redis";
import { ProductDocument, RequestType } from "../types";
import cloudinary from "../config/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const getFeaturedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const featuredProductsFromRedis = await redis.get("featured_products");
    if (featuredProductsFromRedis) {
      res.json(JSON.parse(featuredProductsFromRedis));
      return;
    }

    //if not in redis, fetch from mongodb
    //.lean() is gonna return a plain javascript object instead of a mongodb document
    //which is good for performance

    const featuredProducts = await Product.find({
      isFeatured: true,
    }).lean(); //got an error here while sotring the featured products

    if (!featuredProducts) {
      res.status(404).json({ message: "No featured products found" });
      return;
    }

    // store in redis for future quick access
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const createProduct = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse: UploadApiResponse | null = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (product.image) {
      const publicId = product.image.split("/").pop()?.split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log(`deleted image from cloudinary`);
      } catch (error) {
        console.log("error deleting image from cloudinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const getRecommendedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const getProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const toggleFeaturedProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
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

async function updateFeaturedProductsCache() {
  try {
    // The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache function");
  }
}
