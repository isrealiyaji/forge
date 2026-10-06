import Panel from "@/components/ui/Panel";
import RosterRow from "@/components/ui/RosterRow";
import SettingsSection from "@/components/ui/SettingsSection";
import CapacityControl from "@/components/admin/CapacityControl";
import ArchiveClassButton from "@/components/admin/ArchiveClassButton";
import CreateClassForm from "@/components/admin/CreateClassForm";
import CreateScheduleForm from "@/components/admin/CreateScheduleForm";
import { adminApi } from "@/lib/api/admin";
import { getCookieHeader } from "@/lib/auth/session";
import { formatClassSchedule } from "@/lib/dateTime";

const AdminClassesPage = async () => {
  const cookie = await getCookieHeader();
  const [{ classes }, { instructors }, { schedules }] = await Promise.all([
    adminApi.listClasses({ cookie }),
    adminApi.listInstructors({ cookie }),
    adminApi.listSchedules({ cookie }),
  ]);

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Classes</h1>
        <p className="mt-2 text-muted-inverse">{classes.length} total.</p>
      </header>

      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Classes</h2>
        <Panel>
          <div className="px-6 py-5">
            {classes.length === 0 ? (
              <p className="py-4 text-sm text-muted">No classes yet — create one below.</p>
            ) : (
              classes.map((c) => (
                <div key={c.id} className="flex flex-col gap-3 border-b border-line px-1 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{c.name}</p>
                    <p className="truncate text-sm text-muted">
                      {c.instructor_name ? `Coach ${c.instructor_name}` : "No instructor"}
                      {c.description ? ` · ${c.description}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <CapacityControl classId={c.id} capacity={c.capacity} />
                    <ArchiveClassButton classId={c.id} name={c.name} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>

      <SettingsSection title="Create Class">
        <CreateClassForm instructors={instructors} />
      </SettingsSection>

      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Upcoming Schedules</h2>
        <Panel>
          <div className="px-6 py-5">
            {schedules.length === 0 ? (
              <p className="py-4 text-sm text-muted">No upcoming sessions scheduled.</p>
            ) : (
              schedules.map((s) => {
                const { dayLabel, timeLabel } = formatClassSchedule(s.start_time);
                const full = s.booked_count >= s.capacity;
                return (
                  <RosterRow
                    key={s.schedule_id}
                    title={s.name}
                    meta={`${dayLabel} · ${timeLabel}`}
                    tone={full ? "alert" : "good"}
                    statusLabel={full ? "Full" : "Open"}
                    keyStat={`${s.booked_count}/${s.capacity}`}
                  />
                );
              })
            )}
          </div>
        </Panel>
      </section>

      <SettingsSection title="Schedule a Class" description="Times are in your browser's local timezone.">
        <CreateScheduleForm classes={classes} />
      </SettingsSection>
    </>
  );
};

export default AdminClassesPage;
