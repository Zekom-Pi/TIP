import { create } from "zustand";

import { authService } from "@/services/authService";

import type {
  User,
} from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  signIn: (
    username: string,
    password: string
  ) => Promise<void>;
  fetchMe: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    accessToken:
      localStorage.getItem(
        "accessToken"
      ),

    user: null,
    loading: true,

    
     // Đăng nhập
     
    signIn: async (
      username,
      password
    ) => {
      set({
        loading: true,
      });
      try {
        const response =
          await authService.signIn(
            username,
            password
          );

        const accessToken =
          response.accessToken;

        localStorage.setItem(
          "accessToken",
          accessToken
        );

        set({
          accessToken,
        });
        // Lấy thông tin Admin
        await useAuthStore
          .getState()
          .fetchMe();
      } finally {
        set({
          loading: false,
        });
      }
    },
      //Lấy thông tin Admin hiện tại
     
    fetchMe: async () => {
      const response =
        await authService.fetchMe();
      set({
        user: response.user,
      });
    },
     // Đăng xuất
    signOut: async () => {
      try {
        await authService.signOut();
      } finally {
        localStorage.removeItem(
          "accessToken"
        );

        set({
          accessToken: null,
          user: null,
        });
      }
    },

    /**
     * Khôi phục authentication
     * khi F5 hoặc mở lại trang
     */
    initialize: async () => {
      const token =
        localStorage.getItem(
          "accessToken"
        );

      if (!token) {
        set({
          accessToken: null,
          user: null,
          loading: false,
        });

        return;
      }

      try {
        set({
          accessToken: token,
        });

        await useAuthStore
          .getState()
          .fetchMe();
      } catch (error) {
        console.error(
          "Failed to initialize authentication:",
          error
        );

        localStorage.removeItem(
          "accessToken"
        );

        set({
          accessToken: null,
          user: null,
        });
      } finally {
        set({
          loading: false,
        });
      }
    },
  }));