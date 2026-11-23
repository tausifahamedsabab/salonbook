"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock } from "lucide-react";
import { api, formatMoney } from "@/lib/api";
import { getBrowserTimeZone, getTodayKey, isPastDateKey, nowMinutes, slotToMinutes } from "@/lib/dateUtils";
import { useSession } from "@/lib/session";
import { TIME_SLOTS } from "@/lib/slots";
import DatePickerPopover from "@/components/DatePickerPopover";
import { Spinner } from "@/components/PageLoading";
import { useToast } from "@/lib/toast";

/** Booking form on the service details page: date, time slot, message. */
export default function AppointmentRequestForm({
  serviceId,
  serviceName,
  price,
}: {
  serviceId: string;
  serviceName: string;
  price: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { data } = useSession();
  const user = (data?.user ?? null) as { role?: string } | null;

  const today = getTodayKey();
  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [message, setMessage] = useState("");
  const [dateError, setDateError] = useState("");
  const [slotError, setSlotError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const availableSlots = useMemo(() => {
    if (appointmentDate !== today) return TIME_SLOTS;
    const cutoff = nowMinutes();
    return TIME_SLOTS.filter((slot) => slotToMinutes(slot) > cutoff);
  }, [appointmentDate, today]);

  function handleDateChange(date: string) {
    setAppointmentDate(date);
    setDateError("");
    const cutoff = nowMinutes();
    const slots = date === today
      ? TIME_SLOTS.filter((slot) => slotToMinutes(slot) > cutoff)
      : TIME_SLOTS;
    if (!slots.includes(timeSlot)) setTimeSlot(slots[0] || "");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setDateError("");
    setSlotError("");

    if (!appointmentDate) {
      setDateError("Please pick an appointment date.");
      return;
    }
    if (isPastDateKey(appointmentDate)) {
      setDateError("Please choose today or a future date.");
      return;
    }
    if (appointmentDate === today) {
      if (!timeSlot) {
        setSlotError("No time slots remain for today. Please choose another date.");
        return;
      }
      if (slotToMinutes(timeSlot) <= nowMinutes()) {
        setSlotError("That time has already passed today. Please choose a later slot.");
        return;
      }
    }

    setLoading(true);
    try {
      await api("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          serviceId,
          appointmentDate,
          timeSlot,
          message,
          timezone: getBrowserTimeZone(),
        }),
      });
      showToast("success", `Appointment request sent for ${serviceName}!`);
      setAppointmentDate("");
      setMessage("");
      setTimeSlot(TIME_SLOTS[0]);
      router.push("/customer/appointments");
    } catch (err) {
      const text =
        err instanceof Error
          ? err.message
          : "Could not submit your appointment request.";
      if (/date/i.test(text) && /past/i.test(text)) setDateError(text);
      else if (/time|slot/i.test(text)) setSlotError(text);
      else setError(text);
      showToast("error", text);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
        Please sign in with your customer account to request an appointment.
      </div>
    );
  }
  if (user?.role === "admin") {
    return (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
        Customer appointment requests are not available for admins.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="appointment-date" className="mb-1.5 block text-sm font-medium text-neutral-800">
            Appointment date
          </label>
          <DatePickerPopover
            id="appointment-date"
            value={appointmentDate}
            onChange={handleDateChange}
            hasError={Boolean(dateError)}
          />
          {dateError ? (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {dateError}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-neutral-500">
              Today and future dates only.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="appointment-slot" className="mb-1.5 block text-sm font-medium text-neutral-800">
            Available time slot
          </label>
          <div className="relative">
            <Clock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <select
              id="appointment-slot"
              value={timeSlot}
              onChange={(e) => {
                setTimeSlot(e.target.value);
                setSlotError("");
              }}
              className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 transition focus:border-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              {availableSlots.length === 0 ? (
                <option value="">No slots left today</option>
              ) : (
                availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))
              )}
            </select>
          </div>
          {slotError ? (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {slotError}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-neutral-500">
              {appointmentDate === today
                ? "Only upcoming times are shown for today."
                : "Pick a time that works for you."}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="appointment-notes" className="mb-1.5 block text-sm font-medium text-neutral-800">
          Additional message <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="appointment-notes"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Anything to share about ${serviceName}?`}
          rows={3}
          className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        />
        <p className="mt-1.5 text-xs text-neutral-500">
          We&apos;ll confirm your request before payment is due.
        </p>
      </div>

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-rose-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && <Spinner size={16} />}
        {loading ? "Submitting…" : `Request appointment — ${formatMoney(price)}`}
      </button>
    </form>
  );
}
