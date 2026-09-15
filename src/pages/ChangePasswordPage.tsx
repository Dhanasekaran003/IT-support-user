import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { send } from "../lib/api";
import { useAuth } from "../store/auth";
import { Button, Card, Field, Input, PageHeader } from "../components/ui/primitives";
import type { User } from "../lib/types";

export function ChangePasswordPage() {
  const user = useAuth((s) => s.user);
  const nav = useNavigate();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const updated = await send<{ user: User }>("post", "/auth/change-password", { currentPassword, newPassword });
      useAuth.setState({ user: updated.user });
      toast.success("Password updated");
      nav("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PageHeader
        title="Set your password"
        subtitle={`Hi ${user?.name}. Enter the temporary password from your invite, then choose a new one.`}
      />
      <Card className="p-6">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <Field label="Current / temporary password">
            <Input type="password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="New password (min 8 characters)">
            <Input type="password" required minLength={8} value={newPassword} onChange={(e) => setNew(e.target.value)} />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          <Button disabled={loading}>{loading ? "Saving…" : "Save and continue"}</Button>
        </form>
      </Card>
    </div>
  );
}
