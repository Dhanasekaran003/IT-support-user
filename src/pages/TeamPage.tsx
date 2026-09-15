import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { getData, send } from "../lib/api";
import type { PortalLookups, Site, User } from "../lib/types";
import { useAuth } from "../store/auth";
import { Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, Select } from "../components/ui/primitives";

export function TeamPage() {
  const role = useAuth((s) => s.user?.role);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "ClientUser", siteId: "" });

  const lookups = useQuery({
    queryKey: ["portal-lookups"],
    queryFn: () => getData<PortalLookups>("/portal/lookups"),
  });
  const sites = useQuery({
    queryKey: ["portal-sites"],
    queryFn: () => getData<Site[]>("/portal/sites"),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["portal-users"],
    queryFn: () => getData<User[]>("/portal/users"),
    enabled: role === "ClientAdmin",
  });

  const invite = useMutation({
    mutationFn: () =>
      send<{ invite?: { emailSent?: boolean; tempPassword?: string } }>("post", "/portal/users", {
        ...form,
        siteId: form.siteId || undefined,
      }),
    onSuccess: (res) => {
      toast.success(res.invite?.emailSent ? "Invite emailed" : `Invite created. Temp password: ${res.invite?.tempPassword}`);
      qc.invalidateQueries({ queryKey: ["portal-users"] });
      setOpen(false);
      setForm({ name: "", email: "", phone: "", role: "ClientUser", siteId: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (role !== "ClientAdmin") return <Navigate to="/" replace />;

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Invite colleagues to book and track services for this organization"
        action={<Button onClick={() => setOpen(true)}>Invite user</Button>}
      />
      <Card>
        {isLoading && <Empty text="Loading users…" />}
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((u) => (
                <tr key={u._id || u.id}>
                  <td className="font-semibold">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge tone="teal">{u.role}</Badge>
                  </td>
                  <td>
                    <Badge tone={u.status === "active" ? "green" : "slate"}>{u.status || "active"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={open} title="Invite portal user" onClose={() => setOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            invite.mutate();
          }}
        >
          <Field label="Name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {(lookups.data?.data.clientRoles || ["ClientUser", "ClientAdmin"]).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Site (optional)">
            <Select value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value })}>
              <option value="">All sites</option>
              {(sites.data?.data || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button disabled={invite.isPending}>Send invite</Button>
        </form>
      </Modal>
    </div>
  );
}
