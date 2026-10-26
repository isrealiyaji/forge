"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { memberApi } from "@/lib/api/member";
import { ApiError } from "@/lib/api/client";

type BookingButtonProps = {
  scheduleId: number;
  bookingId: number | null;
  status: "booked" | "waitlisted" | null;
  full: boolean;
};

const BookingButton = ({ scheduleId, bookingId, status, full }: BookingButtonProps) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      if (bookingId) {
        await memberApi.cancelBooking(bookingId);
      } else {
        await memberApi.bookClass(scheduleId);
      }
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  const label = pending
    ? "Saving…"
    : bookingId
      ? status === "waitlisted"
        ? "Leave Waitlist"
        : "Cancel"
      : full
        ? "Join Waitlist"
        : "Book";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`rounded-sm border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        bookingId
          ? "border-line text-ink hover:bg-line/10"
          : "border-accent bg-accent text-accent-ink hover:opacity-80"
      }`}
    >
      {label}
    </button>
  );
};

export default BookingButton;
