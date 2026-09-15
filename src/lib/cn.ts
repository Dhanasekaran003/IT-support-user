import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function inr(n: number | undefined | null) {
  return (n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

export function idOf(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "_id" in value) return String((value as { _id: string })._id);
  return String(value);
}

export function nameOf(value: unknown, fallback = "—"): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (typeof o.name === "string") return o.name;
    if (o.userId && typeof o.userId === "object" && o.userId && "name" in (o.userId as object)) {
      return String((o.userId as { name: string }).name);
    }
  }
  return fallback;
}

export function statusTone(status: string) {
  if (["Closed", "Rated", "Completed", "ClientSigned"].includes(status)) return "green" as const;
  if (["Open", "Assigned", "Accepted", "EnRoute"].includes(status)) return "blue" as const;
  if (["PartsPending", "Declined"].includes(status)) return "amber" as const;
  if (status === "InProgress") return "teal" as const;
  return "slate" as const;
}
