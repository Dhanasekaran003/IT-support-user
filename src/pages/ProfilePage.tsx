import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getData, send } from "../lib/api";
import type { Organization, PortalLookups, PortalMe, Site, User } from "../lib/types";
import { useAuth } from "../store/auth";
import { Button, Card, Empty, Field, Input, PageHeader, Select } from "../components/ui/primitives";

export function ProfilePage() {
  const session = useAuth((s) => s.user);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["portal-me"],
    queryFn: () => getData<PortalMe>("/portal/me"),
  });
  const lookups = useQuery({
    queryKey: ["portal-lookups"],
    queryFn: () => getData<PortalLookups>("/portal/lookups"),
  });

  const user = data?.data.user;
  const org = data?.data.org;
  const sites = data?.data.sites || [];
  const firstSite = sites[0];
  const isAdmin = session?.role === "ClientAdmin";

  const [profile, setProfile] = useState({ firstName: "", lastName: "", phone: "" });
  const [company, setCompany] = useState({ name: "", gstNumber: "", industry: "", contractType: "pay_per_ticket", contactPhone: "" });
  const [site, setSite] = useState({ name: "", address: "", city: "", zone: "" });

  useEffect(() => {
    if (!user) return;
    setProfile({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
    });
  }, [user]);

  useEffect(() => {
    if (!org) return;
    setCompany({
      name: org.name || "",
      gstNumber: org.gstNumber || "",
      industry: org.industry || "",
      contractType: org.contractType || "pay_per_ticket",
      contactPhone: org.contactPhone || "",
    });
  }, [org]);

  useEffect(() => {
    if (!firstSite) return;
    setSite({
      name: firstSite.name || "",
      address: firstSite.address || "",
      city: firstSite.city || "",
      zone: firstSite.zone || "",
    });
  }, [firstSite]);

  const saveProfile = useMutation({
    mutationFn: () => send<User>("patch", "/portal/me", profile),
    onSuccess: (updated) => {
      useAuth.setState({
        user: {
          ...session!,
          name: updated.name,
          firstName: updated.firstName,
          lastName: updated.lastName,
          phone: updated.phone,
        },
      });
      qc.invalidateQueries({ queryKey: ["portal-me"] });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveCompany = useMutation({
    mutationFn: async () => {
      const orgRes = await send<Organization>("patch", "/portal/organization", company);
      const sitePayload = {
        name: site.name,
        address: site.address,
        city: site.city,
        zone: site.zone,
        contactPerson: `${profile.firstName} ${profile.lastName}`.trim(),
        contactPhone: profile.phone,
      };
      if (site.name && site.address) {
        if (firstSite) await send<Site>("patch", `/portal/sites/${firstSite._id}`, sitePayload);
        else await send<Site>("post", "/portal/sites", sitePayload);
      }
      return orgRes;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal-me"] });
      qc.invalidateQueries({ queryKey: ["portal-sites"] });
      toast.success("Company details saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Profile" subtitle="Update your details any time after registration" />
      {isLoading && <Empty text="Loading profile…" />}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile.mutate();
            }}
          >
            <div className="text-sm font-semibold">Personal</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name">
                <Input required value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
              </Field>
              <Field label="Last name">
                <Input required value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
              </Field>
            </div>
            <Field label="Email">
              <Input value={user?.email || session?.email || ""} disabled />
            </Field>
            <Field label="Phone">
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </Field>
            <Button disabled={saveProfile.isPending}>{saveProfile.isPending ? "Saving…" : "Save profile"}</Button>
          </form>
        </Card>

        {isAdmin && (
          <Card className="p-5">
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                saveCompany.mutate();
              }}
            >
              <div className="text-sm font-semibold">Company</div>
              <Field label="Organization name">
                <Input required minLength={2} value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
              </Field>
              <Field label="GST number">
                <Input value={company.gstNumber} onChange={(e) => setCompany({ ...company, gstNumber: e.target.value })} />
              </Field>
              <Field label="Industry">
                <Input list="industry-options" value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} />
                <datalist id="industry-options">
                  {(lookups.data?.data.industries || []).map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </Field>
              <Field label="Contract type">
                <Select value={company.contractType} onChange={(e) => setCompany({ ...company, contractType: e.target.value })}>
                  {(lookups.data?.data.contractTypes || ["pay_per_ticket"]).map((type) => (
                    <option key={type} value={type}>
                      {type === "amc" ? "AMC" : type === "pay_per_ticket" ? "Pay per ticket" : type}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Company phone">
                <Input value={company.contactPhone} onChange={(e) => setCompany({ ...company, contactPhone: e.target.value })} />
              </Field>
              <div className="pt-2 text-sm font-semibold">Site</div>
              <Field label="Site name">
                <Input value={site.name} onChange={(e) => setSite({ ...site, name: e.target.value })} />
              </Field>
              <Field label="Address">
                <Input value={site.address} onChange={(e) => setSite({ ...site, address: e.target.value })} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="City">
                  <Input list="city-options" value={site.city} onChange={(e) => setSite({ ...site, city: e.target.value })} />
                  <datalist id="city-options">
                    {(lookups.data?.data.cities || []).map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Zone">
                  <Input list="zone-options" value={site.zone} onChange={(e) => setSite({ ...site, zone: e.target.value })} />
                  <datalist id="zone-options">
                    {(lookups.data?.data.zones || []).map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </Field>
              </div>
              <Button disabled={saveCompany.isPending}>{saveCompany.isPending ? "Saving…" : "Save company"}</Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
