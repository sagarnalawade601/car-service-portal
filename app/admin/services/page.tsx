"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Service, formatPrice } from "@/lib/types";

export default function AdminServicesPage() {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [supabase]);

  async function load() {
    const { data } = await supabase.from("services").select("*").order("name");
    setServices((data as Service[]) ?? []);
    setLoading(false);
  }

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !price) {
      setError("Name and price are required.");
      return;
    }
    const { error } = await supabase.from("services").insert({
      name,
      description: description || null,
      duration_minutes: parseInt(duration) || 60,
      price_cents: Math.round(parseFloat(price) * 100),
    });
    if (error) {
      setError(error.message);
      return;
    }
    setName("");
    setDescription("");
    setDuration("60");
    setPrice("");
    load();
  }

  async function toggleActive(s: Service) {
    await supabase.from("services").update({ active: !s.active }).eq("id", s.id);
    load();
  }

  if (loading) return <p className="text-sm text-steel">Loading...</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-2xl font-700">Services</h1>
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className="card flex items-center justify-between">
              <div>
                <p className="font-600">
                  {s.name}{" "}
                  {!s.active && (
                    <span className="ml-2 text-xs text-steel">(inactive)</span>
                  )}
                </p>
                <p className="text-sm text-steel">
                  {formatPrice(s.price_cents)} · {s.duration_minutes} min
                </p>
              </div>
              <button className="btn-outline !py-1.5 text-sm" onClick={() => toggleActive(s)}>
                {s.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-600">Add a service</h2>
        <form onSubmit={addService} className="card space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duration (min)</label>
              <input
                className="input"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Price (USD)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-alert">{error}</p>}
          <button className="btn-primary w-full">Add service</button>
        </form>
      </div>
    </div>
  );
}
