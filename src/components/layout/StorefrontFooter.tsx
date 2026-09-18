import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth";

function FooterAccount() {
  const user = useAuth((s) => s.user);
  if (user) {
    return (
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Account</div>
        <Link className="text-muted-foreground hover:text-foreground" to="/tickets">
          My bookings
        </Link>
        <Link className="text-muted-foreground hover:text-foreground" to="/profile">
          Profile
        </Link>
        <Link className="text-muted-foreground hover:text-foreground" to="/book">
          Call a technician
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="font-semibold">Account</div>
      <Link className="text-muted-foreground hover:text-foreground" to="/login">
        Sign in
      </Link>
      <Link className="text-muted-foreground hover:text-foreground" to="/register">
        Create account
      </Link>
      <Link className="text-muted-foreground hover:text-foreground" to="/book">
        Book a visit
      </Link>
    </div>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-white">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-start justify-between gap-8 px-6 py-12 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-[11px] font-bold text-white">
              fl
            </span>
            <span className="text-sm font-semibold">FieldLink</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            IT services at your doorstep — laptops, networks, CCTV, printers, and AMC coverage for homes and offices.
          </p>
        </div>
          <div className="grid grid-cols-2 gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <div className="font-semibold">Services</div>
              <Link className="text-muted-foreground hover:text-foreground" to="/services?category=laptop-desktop">
                Laptop & Desktop
              </Link>
              <Link className="text-muted-foreground hover:text-foreground" to="/services?category=network-wifi">
                Network & WiFi
              </Link>
              <Link className="text-muted-foreground hover:text-foreground" to="/services?category=cctv">
                CCTV
              </Link>
            </div>
            <FooterAccount />
          </div>
      </div>
    </footer>
  );
}
