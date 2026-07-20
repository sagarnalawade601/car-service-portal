import BookingForm from "@/components/BookingForm";

export default function BookPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-700">Book a service</h1>
      <BookingForm />
    </div>
  );
}
