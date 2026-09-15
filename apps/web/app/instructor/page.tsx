import Panel from "@/components/ui/Panel";
import RosterRow from "@/components/ui/RosterRow";
import { instructorToday } from "@/lib/mock-data";

const InstructorDashboard = () => {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-5xl tracking-poster text-ink-inverse">Tonight&apos;s Lineup</h1>
        <p className="mt-2 text-muted-inverse">
          {instructorToday.sessionsToday.length} sessions today · {instructorToday.rosterCount} of{" "}
          {instructorToday.assignmentCap} members assigned to you
        </p>
      </header>

      <Panel className="mb-8">
        <div className="px-6 py-5">
          {instructorToday.sessionsToday.map((session) => (
            <RosterRow
              key={session.id}
              title={session.title}
              meta={session.meta}
              tone={session.tone}
              statusLabel={session.statusLabel}
              keyStat={session.keyStat}
            />
          ))}
        </div>
      </Panel>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">
            Nutrition Plans Needing You
          </h2>
          <Panel>
            <div className="px-6 py-5">
              {instructorToday.pendingNutritionDrafts.map((draft) => (
                <RosterRow
                  key={draft.id}
                  title={draft.title}
                  meta={draft.meta}
                  tone={draft.tone}
                  statusLabel={draft.statusLabel}
                  keyStat={draft.keyStat}
                  action={
                    <a
                      href="#"
                      className="rounded-sm bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-panel transition-opacity hover:opacity-80"
                    >
                      Open
                    </a>
                  }
                />
              ))}
            </div>
          </Panel>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">My Members</h2>
          <Panel>
            <div className="px-6 py-5">
              {instructorToday.roster.map((member) => (
                <RosterRow
                  key={member.id}
                  title={member.title}
                  meta={member.meta}
                  tone={member.tone}
                  statusLabel={member.statusLabel}
                  keyStat={member.keyStat}
                />
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </>
  );
};

export default InstructorDashboard;
