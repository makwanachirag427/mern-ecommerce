import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-toastify";
import type { UserStoreType } from "../types";
import { AxiosError } from "axios";

export const useUserStore = create<UserStoreType>((set, get) => ({
  user: null,
  loading: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axios.get("/auth/profile");
      set({ user: res.data });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });
    if (password !== confirmPassword) {
      set({ loading: false });
      toast.error("passoword do not match");
      return;
    }
    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      set({ user: res.data });
      toast.success("Account created successfully");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "An error occurred");
      }
    } finally {
      set({ loading: false });
    }
  },
  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/login", { email, password });
      set({ user: res.data });
      console.log(res.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "An error occurred");
      }
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "An error occured during logout"
        );
      }
    }
  },
  refreshToken: async () => {
    // Prevent multiple simultaneous refresh attempts
    if (get().isCheckingAuth) return;

    set({ isCheckingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      set({ isCheckingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, isCheckingAuth: false });
      throw error;
    }
  },
}));

// TODO: Implement the axios interceptors for refreshing access token

// Axios interceptor for token refresh
let refreshPromise: Promise<void> | null = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
