"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/types";
import BookingCard from "@/components/BookingCard";

export default function MyBookingsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("bookings")
        .select("*, vehicles(*), services(*)")
        .eq("customer_id", userData.user.id)
        .order("scheduled_at", { ascending: false });
      setBookings((data as Booking[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function cancelBooking(id: string) {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
  }

  if (loading) return <p className="text-sm text-steel">Loading...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-700">My bookings</h1>
        <Link href="/book" className="btn-primary">
          New booking
        </Link>
      </div>
      {bookings.length === 0 ? (
        <p className="text-sm text-steel">
          No bookings yet.{" "}
          <Link href="/book" className="text-garage hover:underline">
            Book your first service
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              actions={
                b.status === "pending" || b.status === "confirmed" ? (
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="btn-outline !py-1.5 text-sm"
                  >
                    Cancel
                  </button>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
