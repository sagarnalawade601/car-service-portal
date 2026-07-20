import { Booking, formatPrice } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending confirmation",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function BookingCard({
  booking,
  showCustomer = false,
  actions,
}: {
  booking: Booking;
  showCustomer?: boolean;
  actions?: React.ReactNode;
}) {
  const when = new Date(booking.scheduled_at);

  return (
    <div className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-600">{booking.services?.name ?? "Service"}</h3>
          <span className={`badge-${booking.status}`}>
            {STATUS_LABEL[booking.status]}
          </span>
        </div>
        <p className="text-sm text-steel">
          {when.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          at {when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          {" · "}
          {booking.vehicles
            ? `${booking.vehicles.year ?? ""} ${booking.vehicles.make} ${booking.vehicles.model}`
            : "Vehicle"}
          {booking.services && ` · ${formatPrice(booking.services.price_cents)}`}
        </p>
        {showCustomer && booking.profiles && (
          <p className="text-sm text-steel">
            {booking.profiles.full_name} {booking.profiles.phone && `· ${booking.profiles.phone}`}
          </p>
        )}
        {booking.notes && (
          <p className="mt-1 text-sm italic text-steel/80">"{booking.notes}"</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
