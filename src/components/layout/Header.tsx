import { Bell } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getData, send } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { Button } from "../ui/primitives";

export function Header() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["user-notes"],
    queryFn: () => getData<{ items: { _id: string; title: string; read: boolean }[]; unread: number }>("/notifications"),
    refetchInterval: 15000,
  });
  const markAll = useMutation({
    mutationFn: () => send("post", "/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-notes"] }),
  });

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
      <div className="text-sm font-semibold">Service portal</div>
      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <button className="relative rounded-md p-2 hover:bg-muted" onClick={() => setOpen((v) => !v)}>
            <Bell className="h-5 w-5" />
            {!!data?.data.unread && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-card p-2 shadow-lg">
              <div className="flex justify-between px-2 py-1">
                <span className="text-xs font-bold">Alerts</span>
                <button className="text-[11px] text-primary" onClick={() => markAll.mutate()}>
                  Mark read
                </button>
              </div>
              {(data?.data.items || []).map((n) => (
                <div key={n._id} className={n.read ? "px-2 py-1.5 text-xs text-muted-foreground" : "px-2 py-1.5 text-xs font-semibold"}>
                  {n.title}
                </div>
              ))}
              {!data?.data.items?.length && <div className="p-3 text-center text-xs text-muted-foreground">No alerts</div>}
            </div>
          )}
        </div>
        <div className="hidden text-right sm:block">
          <div className="text-xs font-semibold">{user?.name}</div>
          <div className="text-[10px] uppercase text-muted-foreground">{user?.role}</div>
        </div>
        <Button variant="outline" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
