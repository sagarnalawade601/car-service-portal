import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("price_cents");

  return (
    <div>
      <section className="mb-12 rounded-lg bg-ink px-8 py-14 text-paper">
        <p className="mb-2 text-sm uppercase tracking-widest text-garage">
          Book in under two minutes
        </p>
        <h1 className="mb-4 max-w-xl text-4xl font-700 leading-tight">
          Service your car without the phone tag.
        </h1>
        <p className="mb-6 max-w-lg text-steel/90">
          Pick a service, choose a time, and track your appointment from
          booking to pickup — all online.
        </p>
        <Link href="/book" className="btn-primary">
          Book an appointment
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-600">Our services</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {services?.map((s) => (
            <div key={s.id} className="card">
              <div className="mb-1 flex items-start justify-between">
                <h3 className="text-base font-600">{s.name}</h3>
                <span className="font-600 text-garage">
                  {formatPrice(s.price_cents)}
                </span>
              </div>
              <p className="mb-2 text-sm text-steel">{s.description}</p>
              <p className="text-xs text-steel/70">
                ~{s.duration_minutes} min
              </p>
            </div>
          ))}
          {!services?.length && (
            <p className="text-sm text-steel">
              No services configured yet — add some from the admin dashboard.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
