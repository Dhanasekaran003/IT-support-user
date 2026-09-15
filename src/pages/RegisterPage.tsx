import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Radio } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../store/auth";
import { Button, Field, Input } from "../components/ui/primitives";

export function RegisterPage() {
  const register = useAuth((s) => s.register);
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created");
      nav("/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#ccfbf1,_#f3f6fb_45%)] px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
            <Radio className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">FieldLink</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create an account to book services</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <h2 className="text-lg font-bold">Register</h2>
          <p className="mb-6 text-xs text-muted-foreground">You can add company and site details on your profile after signing up.</p>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name">
                <Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </Field>
              <Field label="Last name">
                <Input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </Field>
            </div>
            <Field label="Email">
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShow((s) => !s)}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Button disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have access?{" "}
              <Link className="font-semibold text-primary" to="/login">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
