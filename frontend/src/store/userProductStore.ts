import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-toastify";
import type { ProductStoreType } from "../types";
import { AxiosError } from "axios";
export const useProductStore = create<ProductStoreType>((set) => ({
  products: [],
  loading: false,
  setProducts: (products) => set({ products }),
  createProduct: async (product) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", product);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
      toast.success("Product added successfully");
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
        set({ loading: false });
      }
    }
  },
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      set({ products: res.data.products });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          error.response?.data?.message || "Failed to fetch products"
        );
      }
    } finally {
      set({ loading: false });
    }
  },
  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/products/category/${category}`);
      set({ products: res.data.products });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch products by category"
        );
      }
    } finally {
      set({ loading: false });
    }
  },
  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${id}`);
      set((preProducts) => ({
        products: preProducts.products.filter((product) => product._id !== id),
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          error.response?.data?.message || "Failed to delete product"
        );
      }
    } finally {
      set({ loading: false });
    }
  },
  toggleFeaturedProduct: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${id}`);
      // this will update the isFeatured prop of the product
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === id
            ? { ...product, isFeatured: response.data.isFeatured }
            : product
        ),
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          error.response?.data?.message || "Failed to delete product"
        );
      }
    } finally {
      set({ loading: false });
    }
  },
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products/featured");
      set({ products: res.data });
    } catch (error) {
      console.log("Error fetching featured products:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
