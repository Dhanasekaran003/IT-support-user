import axios, { type AxiosError } from "axios";
import type { Envelope } from "./types";

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";
const ACCESS = "flu_access";
const REFRESH = "flu_refresh";

export const api = axios.create({ baseURL, withCredentials: true });

export function setTokens(access?: string, refresh?: string) {
  if (access) localStorage.setItem(ACCESS, access);
  else localStorage.removeItem(ACCESS);
  if (refresh) localStorage.setItem(REFRESH, refresh);
  else localStorage.removeItem(REFRESH);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<Envelope<unknown>>) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes("/auth/login")) {
      original._retry = true;
      if (!refreshing) {
        refreshing = api
          .post<Envelope<{ accessToken: string; refreshToken?: string }>>("/auth/refresh", {
            refreshToken: localStorage.getItem(REFRESH),
          })
          .then((r) => {
            setTokens(r.data.data.accessToken, r.data.data.refreshToken);
            return r.data.data.accessToken;
          })
          .catch(() => {
            setTokens();
            return null;
          })
          .finally(() => {
            refreshing = null;
          });
      }
      const token = await refreshing;
      if (token && original.headers) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    const message = error.response?.data?.error?.message || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

export async function getData<T>(url: string, params?: object) {
  const { data } = await api.get<Envelope<T>>(url, { params });
  return { data: data.data, meta: data.meta };
}

export async function send<T>(method: "post" | "patch" | "delete", url: string, body?: object) {
  const { data } = await api[method]<Envelope<T>>(url, body);
  return data.data;
}
