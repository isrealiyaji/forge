import Panel from "@/components/ui/Panel";
import RosterRow from "@/components/ui/RosterRow";
import RebalanceButton from "@/components/admin/RebalanceButton";
import ReassignControl from "@/components/admin/ReassignControl";
import { adminApi } from "@/lib/api/admin";
import { getCookieHeader } from "@/lib/auth/session";

const AdminAssignmentsPage = async () => {
  const cookie = await getCookieHeader();
  const [{ instructors }, { members }, { settings }] = await Promise.all([
    adminApi.listInstructors({ cookie }),
    adminApi.listMembers({ cookie }),
    adminApi.settings({ cookie }),
  ]);
  const cap = settings.max_members_per_instructor;

  return (
    <>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Assignments</h1>
          <p className="mt-2 text-muted-inverse">Member-to-instructor load, capped at {cap} per instructor.</p>
        </div>
        <RebalanceButton />
      </header>

      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Instructor Load</h2>
        <Panel>
          <div className="px-6 py-5">
            {instructors.length === 0 ? (
              <p className="py-4 text-sm text-muted">No instructors yet — add one before assigning members.</p>
            ) : (
              instructors.map((instructor) => (
                <RosterRow
                  key={instructor.id}
                  title={instructor.name}
                  meta={instructor.specialty || undefined}
                  tone={instructor.member_count >= cap ? "alert" : "good"}
                  statusLabel={instructor.member_count >= cap ? "At Cap" : "Active"}
                  keyStat={`${instructor.member_count}/${cap}`}
                />
              ))
            )}
          </div>
        </Panel>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Members</h2>
        <Panel>
          <div className="px-6 py-5">
            {members.length === 0 ? (
              <p className="py-4 text-sm text-muted">No members yet.</p>
            ) : (
              members.map((member) => (
                <RosterRow
                  key={member.member_id}
                  title={member.name}
                  meta={member.instructor_name ? `Coach ${member.instructor_name}` : "Unassigned"}
                  tone={member.instructor_id ? "good" : "neutral"}
                  statusLabel={member.instructor_id ? "Assigned" : "Unassigned"}
                  keyStat=""
                  action={
                    <ReassignControl
                      memberId={member.member_id}
                      currentInstructorId={member.instructor_id}
                      instructors={instructors}
                    />
                  }
                />
              ))
            )}
          </div>
        </Panel>
      </section>
    </>
  );
};

export default AdminAssignmentsPage;
