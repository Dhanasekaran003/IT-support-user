import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../store/auth";
import { Button, Field, Input } from "../components/ui/primitives";
import { safeNext } from "../hooks/useRequireAuth";

export function LoginPage() {
  const login = useAuth((s) => s.login);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const booking = next.startsWith("/book");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in");
      nav(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-16">
      <div className="w-full max-w-[420px]">
        <h1 className="text-2xl font-bold">{booking ? "Sign in to call a technician" : "Sign in"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking ? "You can browse the catalog without an account. Booking a visit needs a login." : "Book support, track tickets, and manage your sites."}
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-card p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field label="Work email">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShow((s) => !s)}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Button disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              New organization?{" "}
              <Link className="font-semibold text-foreground" to={`/register?next=${encodeURIComponent(next)}`}>
                Create an account
              </Link>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Or{" "}
              <Link className="font-semibold text-foreground" to="/">
                keep browsing
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
