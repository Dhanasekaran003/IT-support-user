import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Radio } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../store/auth";
import { Button, Field, Input } from "../components/ui/primitives";

export function LoginPage() {
  const login = useAuth((s) => s.login);
  const nav = useNavigate();
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
      nav("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#ccfbf1,_#f3f6fb_45%)] px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
            <Radio className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">FieldLink</h1>
          <p className="mt-1 text-sm text-muted-foreground">Client service portal</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <h2 className="text-lg font-bold">Sign in</h2>
          <p className="mb-6 text-xs text-muted-foreground">Book support, track tickets, and manage your sites from live data.</p>
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
              <Link className="font-semibold text-primary" to="/register">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
