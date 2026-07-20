"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    async function check() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userData.user.id)
        .single();
      setStatus(profile?.is_admin ? "ok" : "denied");
    }
    check();
  }, [supabase, router]);

  if (status === "checking") return <p className="text-sm text-steel">Checking access...</p>;
  if (status === "denied")
    return (
      <div className="card">
        <p className="text-sm text-steel">
          This area is for shop staff only. If you believe this is a mistake,
          ask an existing admin to grant your account access.
        </p>
      </div>
    );

  const tabs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/bookings", label: "Bookings" },
    { href: "/admin/services", label: "Services" },
  ];

  return (
    <div>
      <nav className="mb-6 flex gap-4 border-b border-line pb-3 text-sm">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={pathname === t.href ? "font-600 text-garage" : "text-steel hover:text-ink"}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
