import { api, configureAxiosAuth } from "@/lib/axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  data: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  };
}

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

interface UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

interface AuthResponse {
  data: { access_token: string; refresh_token: string };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;

  login: (credentials: LoginDto) => Promise<void>;
  register: (credentials: RegisterDto) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  logout: () => void;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,

      initialize: async () => {
        const token = get().accessToken;

        if (!token) {
          set({ loading: false });
          return;
        }

        set({ loading: true });

        try {
          const { data } = await api.get<User>("/users/me");

          set({
            user: data,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error("Initialize failed:", error);
          get().logout();
        }
      },

      login: async (credentials) => {
        set({
          loading: true,
          error: null,
        });

        try {
          const { data } = await api.post<AuthResponse>(
            "/auth/login",
            credentials,
          );

          set({
            accessToken: data?.data?.access_token,
            refreshToken: data?.data?.refresh_token,
          });

          console.log("Access Token:", data?.data?.access_token);
          console.log("Refresh Token:", data?.data?.refresh_token);

          const profile = await api.get<User>("/users/me");

          set({
            user: profile.data,
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error:
              error.response?.data?.message ?? error.message ?? "Login failed",
          });

          throw error;
        }
      },

      register: async (credentials) => {
        set({
          loading: true,
          error: null,
        });

        try {
          await api.post("/auth/register", credentials);

          set({
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error:
              error.response?.data?.message ??
              error.message ??
              "Registration failed",
          });

          throw error;
        }
      },

      getAccessToken: async () => {
        const refreshToken = get().refreshToken;

        if (!refreshToken) {
          return null;
        }

        try {
          const { data } = await api.post<AuthResponse>("/auth/refresh", {
            refresh_token: refreshToken,
          });

          set({
            accessToken: data?.data?.access_token,
          });

          return data?.data?.access_token;
        } catch (error) {
          console.error("Refresh token failed:", error);
          get().logout();
          return null;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false,
          error: null,
        });
      },

      updateProfile: async (payload) => {
        set({
          loading: true,
          error: null,
        });

        try {
          const { data } = await api.put<User>("/users/me", payload);

          set({
            user: data,
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error:
              error.response?.data?.message ??
              error.message ??
              "Profile update failed",
          });

          throw error;
        }
      },
    }),
    {
      name: "cartify-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

configureAxiosAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: () => useAuthStore.getState().getAccessToken(),
  onRefreshFailure: () => useAuthStore.getState().logout(),
});
