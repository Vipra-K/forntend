"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import eziyoApi from "../lib/eziyoApi";

interface User {
  id: string;
  name: string;
  email: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  eziyoLogin: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  ssoLoginWithToken: (
    eziyoJwt: string,
    eziyoUser: { id: string; name: string; email: string },
  ) => Promise<void>;
  forgotPassword: (
    email: string,
  ) => Promise<{ message: string; debugToken?: string }>;
  resetPassword: (token: string, newPass: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  token: "token",
  user: "user",
  eziyoAccessToken: "eziyoAccessToken",
  eziyoRefreshToken: "eziyoRefreshToken",
  eziyoAccessTokenExpiresAt: "eziyoAccessTokenExpiresAt",
  eziyoRefreshTokenExpiresAt: "eziyoRefreshTokenExpiresAt",
  eziyoDeviceId: "eziyoDeviceId",
  eziyoUserDetails: "eziyoUserDetails",
};

const getTokenExpiry = (token: string | null) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    if (!payload?.exp) return null;
    return new Date(payload.exp * 1000).toISOString();
  } catch {
    return null;
  }
};

const isExpired = (expiresAt: string | null, skewMs = 30000) => {
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt).getTime();
  return Date.now() >= expiry - skewMs;
};

const getOrCreateDeviceId = () => {
  const existing = localStorage.getItem(STORAGE_KEYS.eziyoDeviceId);
  if (existing) return existing;
  const deviceId = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEYS.eziyoDeviceId, deviceId);
  return deviceId;
};

const withSkipAuthRefresh = (config: Record<string, unknown> = {}) =>
  ({ ...config, skipAuthRefresh: true }) as any;

const buildEziyoUserPayload = (
  raw?: Record<string, unknown> | null,
): { id: string; name: string; email: string } | null => {
  if (!raw) return null;
  const id = (raw.user_id || raw.id || raw.userId) as string | undefined;
  const email = raw.email as string | undefined;
  const name =
    (raw.username as string | undefined) ||
    (raw.name as string | undefined) ||
    (email ? email.split("@")[0] : "");

  if (!id || !email || !name) return null;
  return { id, name, email };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const router = useRouter();

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  }, []);

  const clearEziyoSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.eziyoAccessToken);
    localStorage.removeItem(STORAGE_KEYS.eziyoRefreshToken);
    localStorage.removeItem(STORAGE_KEYS.eziyoAccessTokenExpiresAt);
    localStorage.removeItem(STORAGE_KEYS.eziyoRefreshTokenExpiresAt);
    localStorage.removeItem(STORAGE_KEYS.eziyoUserDetails);
  }, []);

  const saveEziyoSession = useCallback(
    (payload: {
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresAt?: string;
      refreshTokenExpiresAt?: string;
      userDetails?: Record<string, unknown>;
    }) => {
      const accessExpiresAt =
        payload.accessTokenExpiresAt || getTokenExpiry(payload.accessToken);
      const refreshExpiresAt =
        payload.refreshTokenExpiresAt || getTokenExpiry(payload.refreshToken);

      localStorage.setItem(STORAGE_KEYS.eziyoAccessToken, payload.accessToken);
      localStorage.setItem(
        STORAGE_KEYS.eziyoRefreshToken,
        payload.refreshToken,
      );
      if (accessExpiresAt) {
        localStorage.setItem(
          STORAGE_KEYS.eziyoAccessTokenExpiresAt,
          accessExpiresAt,
        );
      }
      if (refreshExpiresAt) {
        localStorage.setItem(
          STORAGE_KEYS.eziyoRefreshTokenExpiresAt,
          refreshExpiresAt,
        );
      }
      if (payload.userDetails) {
        localStorage.setItem(
          STORAGE_KEYS.eziyoUserDetails,
          JSON.stringify(payload.userDetails),
        );
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    clearEziyoSession();
    // Only redirect if we're NOT inside an iframe
    if (window.self === window.top) {
      router.push("/eziyo/login");
    }
  }, [clearSession, clearEziyoSession, router]);

  const refreshEziyoAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.eziyoRefreshToken);
    const refreshTokenExpiresAt = localStorage.getItem(
      STORAGE_KEYS.eziyoRefreshTokenExpiresAt,
    );

    if (!refreshToken) {
      return null;
    }

    if (refreshTokenExpiresAt && isExpired(refreshTokenExpiresAt)) {
      clearEziyoSession();
      return null;
    }

    const deviceId = getOrCreateDeviceId();
    const res = await eziyoApi.post("/api/v1/auth/refresh", {
      refreshToken,
      deviceId,
    });

    const payload = res.data?.data ?? res.data;
    if (!payload?.accessToken) {
      return null;
    }

    saveEziyoSession({
      accessToken: payload.accessToken,
      refreshToken,
      accessTokenExpiresAt:
        payload.accessTokenExpiresAt || getTokenExpiry(payload.accessToken),
      refreshTokenExpiresAt: refreshTokenExpiresAt || undefined,
    });

    return payload.accessToken as string;
  }, [clearEziyoSession, saveEziyoSession]);

  const refreshFormBuilderToken = useCallback(async () => {
    const eziyoAccessToken = localStorage.getItem(
      STORAGE_KEYS.eziyoAccessToken,
    );
    const eziyoAccessTokenExpiresAt = localStorage.getItem(
      STORAGE_KEYS.eziyoAccessTokenExpiresAt,
    );

    if (!eziyoAccessToken) {
      return null;
    }

    let activeEziyoToken = eziyoAccessToken;
    if (eziyoAccessTokenExpiresAt && isExpired(eziyoAccessTokenExpiresAt)) {
      const refreshed = await refreshEziyoAccessToken();
      if (!refreshed) {
        return null;
      }
      activeEziyoToken = refreshed;
    }

    const storedUser = localStorage.getItem(STORAGE_KEYS.eziyoUserDetails);
    const eziyoUser = buildEziyoUserPayload(
      storedUser ? (JSON.parse(storedUser) as Record<string, unknown>) : null,
    );
    if (!eziyoUser) {
      return null;
    }

    const res = await api.post(
      "/auth/identity/verify",
      {
        token: activeEziyoToken,
        user: eziyoUser,
      },
      withSkipAuthRefresh(),
    );
    const { accessToken } = res.data;
    if (!accessToken) return null;
    setToken(accessToken);
    localStorage.setItem(STORAGE_KEYS.token, accessToken);
    const me = await api.get("/auth/me", withSkipAuthRefresh());
    setUser(me.data);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(me.data));
    return accessToken as string;
  }, [refreshEziyoAccessToken]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(STORAGE_KEYS.token);
      if (savedToken) {
        try {
          const res = await api.get("/auth/me", withSkipAuthRefresh());
          setUser(res.data);
          setToken(savedToken);
        } catch {
          const refreshed = await refreshFormBuilderToken();
          if (!refreshed) {
            clearSession();
          }
        }
      } else {
        const refreshed = await refreshFormBuilderToken();
        if (!refreshed) {
          clearSession();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // 401 Interceptor: Automatically logout if session expires
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as {
          _retry?: boolean;
          skipAuthRefresh?: boolean;
          headers?: Record<string, string>;
        };

        if (
          error.response?.status === 401 &&
          !originalRequest?.skipAuthRefresh &&
          !originalRequest?._retry
        ) {
          originalRequest._retry = true;
          if (!refreshPromiseRef.current) {
            refreshPromiseRef.current = refreshFormBuilderToken().finally(
              () => {
                refreshPromiseRef.current = null;
              },
            );
          }

          const newToken = await refreshPromiseRef.current;
          if (newToken && originalRequest) {
            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${newToken}`,
            };
            return api(originalRequest);
          }

          clearSession();
          clearEziyoSession();
        }

        return Promise.reject(error);
      },
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [clearSession, clearEziyoSession, refreshFormBuilderToken]);

  const login = async (email: string, pass: string) => {
    const res = await api.post("/auth/login", { email, password: pass });
    const { user, accessToken } = res.data;
    setUser(user);
    setToken(accessToken);
    localStorage.setItem(STORAGE_KEYS.token, accessToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    router.push("/dashboard");
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password: pass,
    });
    const { user, accessToken } = res.data;
    setUser(user);
    setToken(accessToken);
    localStorage.setItem(STORAGE_KEYS.token, accessToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    router.push("/dashboard");
  };

  const eziyoLogin = async (email: string, pass: string) => {
    const deviceId = getOrCreateDeviceId();
    const res = await eziyoApi.post("/api/v1/auth/login", {
      email,
      password: pass,
      device_id: deviceId,
      device_name: "Form Builder Web",
    });

    const payload = res.data?.data ?? res.data;
    if (!payload?.accessToken || !payload?.refreshToken) {
      throw new Error("Invalid Eziyo login response");
    }

    const eziyoUser = buildEziyoUserPayload(payload.userDetails);
    if (!eziyoUser) {
      throw new Error("Eziyo user details missing required fields");
    }

    saveEziyoSession({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
      userDetails: eziyoUser,
    });

    await ssoLoginWithToken(payload.accessToken, eziyoUser);
  };

  // Eziyo SSO: exchange an Eziyo JWT for a Form Builder JWT
  const ssoLoginWithToken = async (
    eziyoJwt: string,
    eziyoUser: { id: string; name: string; email: string },
  ) => {
    try {
      const res = await api.post(
        "/auth/identity/verify",
        {
          token: eziyoJwt,
          user: eziyoUser,
        },
        withSkipAuthRefresh(),
      );
      const { accessToken } = res.data;
      if (!accessToken) {
        throw new Error("SSO response missing access token");
      }

      setToken(accessToken);
      localStorage.setItem(STORAGE_KEYS.token, accessToken);
      const me = await api.get("/auth/me", withSkipAuthRefresh());
      setUser(me.data);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(me.data));
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message || "SSO login failed";
      console.warn("[SSO] Login rejected:", msg);
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  };

  const resetPassword = async (token: string, newPass: string) => {
    await api.post("/auth/reset-password", { token, newPassword: newPass });
    router.push("/login");
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    await api.patch("/auth/change-password", {
      oldPassword: oldPass,
      newPassword: newPass,
    });
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    const res = await api.patch("/auth/me", data);
    const updatedUser = res.data;
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        eziyoLogin,
        logout,
        ssoLoginWithToken,
        forgotPassword,
        resetPassword,
        changePassword,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
