import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

type AuthAdapter = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onRefreshFailure?: () => void;
};

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const persisted = localStorage.getItem("cartify-auth");
    const token = persisted ? JSON.parse(persisted)?.state?.accessToken : null;
    return token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

let authAdapter: AuthAdapter | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function configureAxiosAuth(adapter: AuthAdapter) {
  authAdapter = adapter;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getStoredAccessToken()}`,
  },
});

function setAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  token: string | null,
) {
  const headers = AxiosHeaders.from(config.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  config.headers = headers;
}

api.interceptors.request.use((config) => {
  const token = authAdapter?.getAccessToken() ?? getStoredAccessToken();
  setAuthorizationHeader(config, token);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const isAuthRequest = originalRequest?.url?.includes("/auth/");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest ||
      !authAdapter
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= authAdapter.refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const token = await refreshPromise;
      if (!token) throw new Error("Your session has expired.");

      setAuthorizationHeader(originalRequest, token);
      return api(originalRequest);
    } catch (refreshError) {
      authAdapter.onRefreshFailure?.();
      return Promise.reject(refreshError);
    }
  },
);
