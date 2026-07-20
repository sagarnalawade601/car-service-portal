"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Service, Vehicle, formatPrice } from "@/lib/types";

export default function BookingForm() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [serviceId, setServiceId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newYear, setNewYear] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setReady(true);
        return;
      }
      setUserId(userData.user.id);

      const [{ data: svc }, { data: veh }] = await Promise.all([
        supabase.from("services").select("*").eq("active", true).order("name"),
        supabase.from("vehicles").select("*").eq("owner_id", userData.user.id),
      ]);
      setServices(svc ?? []);
      setVehicles(veh ?? []);
      if (veh?.length) setVehicleId(veh[0].id);
      else setAddingVehicle(true);
      setReady(true);
    }
    load();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      router.push("/login");
      return;
    }
    setError(null);
    setLoading(true);

    let finalVehicleId = vehicleId;

    if (addingVehicle) {
      if (!newMake || !newModel) {
        setError("Enter at least a make and model for the vehicle.");
        setLoading(false);
        return;
      }
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          owner_id: userId,
          make: newMake,
          model: newModel,
          year: newYear ? parseInt(newYear) : null,
        })
        .select()
        .single();
      if (vehicleError || !vehicle) {
        setError(vehicleError?.message ?? "Could not save vehicle.");
        setLoading(false);
        return;
      }
      finalVehicleId = vehicle.id;
    }

    if (!serviceId || !date || !time) {
      setError("Choose a service, date, and time.");
      setLoading(false);
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    const { error: bookingError } = await supabase.from("bookings").insert({
      customer_id: userId,
      vehicle_id: finalVehicleId,
      service_id: serviceId,
      scheduled_at: scheduledAt,
      notes: notes || null,
    });

    setLoading(false);
    if (bookingError) {
      setError(bookingError.message);
      return;
    }
    router.push("/my-bookings");
  }

  if (!ready) return <p className="text-sm text-steel">Loading...</p>;

  if (!userId) {
    return (
      <div className="card">
        <p className="mb-3 text-sm text-steel">
          Sign in to book a service appointment.
        </p>
        <button className="btn-primary" onClick={() => router.push("/login")}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <label className="label">Service</label>
        <select
          className="input"
          required
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatPrice(s.price_cents)} (~{s.duration_minutes} min)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Vehicle</label>
        {vehicles.length > 0 && !addingVehicle && (
          <div className="space-y-2">
            <select
              className="input"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year ? `${v.year} ` : ""}
                  {v.make} {v.model}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-sm text-garage hover:underline"
              onClick={() => setAddingVehicle(true)}
            >
              + Add a different vehicle
            </button>
          </div>
        )}
        {addingVehicle && (
          <div className="grid grid-cols-3 gap-2">
            <input
              className="input col-span-1"
              placeholder="Year"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
            />
            <input
              className="input col-span-1"
              placeholder="Make"
              value={newMake}
              onChange={(e) => setNewMake(e.target.value)}
            />
            <input
              className="input col-span-1"
              placeholder="Model"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
            />
            {vehicles.length > 0 && (
              <button
                type="button"
                className="col-span-3 text-left text-sm text-garage hover:underline"
                onClick={() => setAddingVehicle(false)}
              >
                Use an existing vehicle instead
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date</label>
          <input
            className="input"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Time</label>
          <input
            className="input"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Notes (optional)</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Anything the shop should know — noises, symptoms, requests..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Booking..." : "Confirm booking"}
      </button>
    </form>
  );
}
