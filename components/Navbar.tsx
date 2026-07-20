"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? null);
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single();
        setIsAdmin(!!profile?.is_admin);
      }
    });
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-lg font-700 text-ink">
          Ironline Auto
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/book" className="hover:text-garage">Book Service</Link>
          {email && (
            <Link href="/my-bookings" className="hover:text-garage">My Bookings</Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="hover:text-garage">Admin</Link>
          )}
          {email ? (
            <button onClick={signOut} className="btn-outline !py-1.5">
              Sign out
            </button>
          ) : (
            <Link href="/login" className="btn-primary !py-1.5">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
