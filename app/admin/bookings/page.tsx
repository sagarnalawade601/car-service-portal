"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Booking, BookingStatus } from "@/lib/types";
import BookingCard from "@/components/BookingCard";

const STATUS_FLOW: BookingStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

export default function AdminBookingsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [supabase]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, vehicles(*), services(*), profiles(*)")
      .order("scheduled_at", { ascending: false });
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: BookingStatus) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  const visible = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) return <p className="text-sm text-steel">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-700">All bookings</h1>
        <select
          className="input w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value as BookingStatus | "all")}
        >
          <option value="all">All statuses</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-steel">No bookings match this filter.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              showCustomer
              actions={
                <select
                  className="input w-auto !py-1.5 text-sm"
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)}
                >
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
