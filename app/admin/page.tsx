"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/types";
import BookingCard from "@/components/BookingCard";

export default function AdminDashboard() {
  const supabase = createClient();
  const [today, setToday] = useState<Booking[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { data: todayBookings } = await supabase
        .from("bookings")
        .select("*, vehicles(*), services(*), profiles(*)")
        .gte("scheduled_at", startOfDay.toISOString())
        .lte("scheduled_at", endOfDay.toISOString())
        .order("scheduled_at");

      const { data: all } = await supabase.from("bookings").select("status");
      const tally: Record<string, number> = {};
      all?.forEach((b) => {
        tally[b.status] = (tally[b.status] ?? 0) + 1;
      });

      setToday((todayBookings as Booking[]) ?? []);
      setCounts(tally);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) return <p className="text-sm text-steel">Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-700">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {["pending", "confirmed", "in_progress", "completed", "cancelled"].map((s) => (
          <div key={s} className="card text-center">
            <p className="text-2xl font-700">{counts[s] ?? 0}</p>
            <p className="text-xs capitalize text-steel">{s.replace("_", " ")}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-600">Today's appointments</h2>
      {today.length === 0 ? (
        <p className="text-sm text-steel">Nothing booked for today.</p>
      ) : (
        <div className="space-y-3">
          {today.map((b) => (
            <BookingCard key={b.id} booking={b} showCustomer />
          ))}
        </div>
      )}
    </div>
  );
}
