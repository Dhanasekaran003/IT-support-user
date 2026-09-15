import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getData, send } from "../lib/api";
import { nameOf } from "../lib/cn";
import type { Asset, PortalLookups, Site } from "../lib/types";
import { Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, Select } from "../components/ui/primitives";

export function AssetsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ siteId: "", type: "desktop", name: "", assetTag: "", serialNumber: "", warrantyExpiry: "", specs: "" });

  const lookups = useQuery({
    queryKey: ["portal-lookups"],
    queryFn: () => getData<PortalLookups>("/portal/lookups"),
  });
  const sites = useQuery({
    queryKey: ["portal-sites"],
    queryFn: () => getData<Site[]>("/portal/sites"),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["portal-assets"],
    queryFn: () => getData<Asset[]>("/portal/assets", { limit: 100 }),
  });

  const create = useMutation({
    mutationFn: () => send("post", "/portal/assets", form),
    onSuccess: () => {
      toast.success("Asset registered");
      qc.invalidateQueries({ queryKey: ["portal-assets"] });
      setOpen(false);
      setForm({ siteId: "", type: lookups.data?.data.assetTypes[0] || "desktop", name: "", assetTag: "", serialNumber: "", warrantyExpiry: "", specs: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Assets"
        subtitle="Equipment registered at your sites — used when booking a visit"
        action={<Button onClick={() => setOpen(true)}>Register asset</Button>}
      />
      <Card>
        {isLoading && <Empty text="Loading assets…" />}
        {!isLoading && !data?.data.length && <Empty text="No assets yet. Register a device to attach it to tickets." />}
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Name</th>
                <th>Type</th>
                <th>Site</th>
                <th>Warranty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((a) => (
                <tr key={a._id}>
                  <td className="font-mono text-xs">{a.assetTag}</td>
                  <td>{a.name || "—"}</td>
                  <td className="capitalize">{a.type}</td>
                  <td>{nameOf(a.siteId)}</td>
                  <td className="text-xs">{a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString("en-IN") : "—"}</td>
                  <td>
                    <Badge tone={a.status === "active" ? "green" : "slate"}>{a.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={open} title="Register asset" onClose={() => setOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <Field label="Site">
            <Select required value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value })}>
              <option value="">Select site</option>
              {(sites.data?.data || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {(lookups.data?.data.assetTypes || ["desktop"]).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Asset tag">
            <Input required minLength={2} value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} />
          </Field>
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Serial number">
            <Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
          </Field>
          <Field label="Warranty expiry">
            <Input type="date" value={form.warrantyExpiry} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })} />
          </Field>
          <Field label="Specs">
            <Input value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} />
          </Field>
          <Button disabled={create.isPending}>Save asset</Button>
        </form>
      </Modal>
    </div>
  );
}
