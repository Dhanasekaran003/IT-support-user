import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../store/auth";

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function useRequireAuth() {
  const user = useAuth((s) => s.user);
  const nav = useNavigate();

  return (to: string) => {
    if (user) {
      nav(to);
      return true;
    }
    toast.message("Sign in to call a technician", {
      description: "You can browse services freely. Booking starts after login.",
    });
    nav(`/login?next=${encodeURIComponent(to)}`);
    return false;
  };
}
