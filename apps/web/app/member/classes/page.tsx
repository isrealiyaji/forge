import Panel from "@/components/ui/Panel";
import RosterRow from "@/components/ui/RosterRow";
import BookingButton from "@/components/member/BookingButton";
import { memberApi } from "@/lib/api/member";
import { getCookieHeader } from "@/lib/auth/session";
import { formatClassSchedule } from "@/lib/dateTime";

const MemberClassesPage = async () => {
  const cookie = await getCookieHeader();
  const [{ member }, { schedules }, { bookings }] = await Promise.all([
    memberApi.me({ cookie }),
    memberApi.listSchedules({ cookie }),
    memberApi.myBookings({ cookie }),
  ]);
  const timezone = member.timezone || "UTC";

  const bookingByScheduleId = new Map(bookings.map((b) => [b.schedule_id, b]));

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Classes</h1>
        <p className="mt-2 text-muted-inverse">Book your spot in an upcoming session.</p>
      </header>

      <Panel>
        <div className="px-6 py-5">
          {schedules.length === 0 ? (
            <p className="py-4 text-sm text-muted">No upcoming sessions scheduled.</p>
          ) : (
            schedules.map((s) => {
              const { dayLabel, timeLabel } = formatClassSchedule(s.start_time, timezone);
              const full = s.booked_count >= s.capacity;
              const booking = bookingByScheduleId.get(s.schedule_id);
              const meta = [
                `${dayLabel} · ${timeLabel}`,
                s.instructor_name ? `Coach ${s.instructor_name.split(" ")[0]}` : "No instructor",
              ].join(" · ");

              return (
                <RosterRow
                  key={s.schedule_id}
                  title={s.name}
                  meta={meta}
                  tone={booking ? "good" : full ? "alert" : "neutral"}
                  statusLabel={
                    booking ? (booking.status === "waitlisted" ? "Waitlisted" : "Booked") : full ? "Full" : "Open"
                  }
                  keyStat={`${s.booked_count}/${s.capacity}`}
                  action={
                    <BookingButton
                      scheduleId={s.schedule_id}
                      bookingId={booking?.booking_id ?? null}
                      status={booking?.status ?? null}
                      full={full}
                    />
                  }
                />
              );
            })
          )}
        </div>
      </Panel>
    </>
  );
};

export default MemberClassesPage;
