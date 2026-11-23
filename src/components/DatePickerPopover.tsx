"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatReadableDate,
  getTodayKey,
  isPastDateKey,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/lib/dateUtils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Custom, local-date-aware calendar popover (no native date popup). */
export default function DatePickerPopover({
  value,
  onChange,
  id,
  hasError = false,
}: {
  value: string;
  onChange: (dateKey: string) => void;
  id?: string;
  hasError?: boolean;
}) {
  const today = getTodayKey();
  const [open, setOpen] = useState(false);
  const initial = parseLocalDateKey(value) ?? parseLocalDateKey(today)!;
  const [view, setView] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<number | null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const now = new Date();
  const atCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  function select(dateKey: string) {
    const date = parseLocalDateKey(dateKey);
    if (date) setView(new Date(date.getFullYear(), date.getMonth(), 1));
    onChange(dateKey);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <button
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={`inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 ${
            hasError
              ? "border-red-400"
              : "border-neutral-300 hover:border-neutral-400"
          }`}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.8} aria-hidden="true" />
          <span className={value ? "text-neutral-900" : "text-neutral-400"}>
            {value ? formatReadableDate(value) : "Select a date"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => select(today)}
          className="shrink-0 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-rose-300 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          Today
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Choose appointment date"
          className="absolute left-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-neutral-200 bg-white p-3 shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setView(new Date(year, month - 1, 1))}
              disabled={atCurrentMonth}
              aria-label="Previous month"
              className="rounded-lg p-1.5 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-sm font-semibold text-neutral-900">
              {view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => setView(new Date(year, month + 1, 1))}
              aria-label="Next month"
              className="rounded-lg p-1.5 text-neutral-600 transition hover:bg-neutral-100"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-400">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">{day}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) return <span key={`empty-${index}`} />;
              const dateKey = toLocalDateKey(new Date(year, month, day));
              const disabled = isPastDateKey(dateKey);
              const selected = dateKey === value;
              const isToday = dateKey === today;
              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={disabled}
                  aria-disabled={disabled}
                  aria-pressed={selected}
                  aria-label={formatReadableDate(dateKey)}
                  onClick={() => select(dateKey)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                    disabled
                      ? "cursor-not-allowed text-neutral-300"
                      : selected
                        ? "bg-rose-700 font-semibold text-white hover:bg-rose-800"
                        : isToday
                          ? "bg-rose-50 font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                          : "text-neutral-700 hover:bg-rose-50"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <p className="mt-2 border-t border-neutral-100 pt-2 text-xs text-neutral-500">
            Past dates are unavailable. Choose today or a future date.
          </p>
        </div>
      )}
    </div>
  );
}
