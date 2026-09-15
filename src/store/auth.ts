import { create } from "zustand";
import { api, setTokens } from "../lib/api";
import type { Envelope, User } from "../lib/types";

const CLIENT_ROLES = new Set(["ClientAdmin", "ClientUser"]);

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async (email, password) => {
    const { data } = await api.post<Envelope<{ user: User; accessToken: string; refreshToken?: string }>>(
      "/auth/login",
      { email, password }
    );
    if (!CLIENT_ROLES.has(data.data.user.role)) {
      throw new Error("This portal is for client organizations. Staff and technicians have their own portals.");
    }
    setTokens(data.data.accessToken, data.data.refreshToken);
    set({ user: data.data.user });
  },
  register: async (payload) => {
    const { data } = await api.post<Envelope<{ user: User; accessToken: string; refreshToken?: string }>>(
      "/auth/register-client",
      payload
    );
    if (!CLIENT_ROLES.has(data.data.user.role)) {
      throw new Error("This portal is for client organizations.");
    }
    setTokens(data.data.accessToken, data.data.refreshToken);
    set({ user: data.data.user });
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setTokens();
      set({ user: null });
    }
  },
  hydrate: async () => {
    if (!localStorage.getItem("flu_access") && !localStorage.getItem("flu_refresh")) {
      set({ loading: false, user: null });
      return;
    }
    try {
      const { data } = await api.get<Envelope<{ user: User }>>("/auth/me");
      if (!CLIENT_ROLES.has(data.data.user.role)) {
        setTokens();
        set({ user: null, loading: false });
        return;
      }
      set({ user: data.data.user, loading: false });
    } catch {
      setTokens();
      set({ user: null, loading: false });
    }
  },
}));
