import Panel from "@/components/ui/Panel";
import RosterRow from "@/components/ui/RosterRow";
import DeactivateInstructorButton from "@/components/admin/DeactivateInstructorButton";
import { adminApi } from "@/lib/api/admin";
import { getCookieHeader } from "@/lib/auth/session";

const AdminInstructorsPage = async () => {
  const cookie = await getCookieHeader();
  const [{ instructors }, { settings }] = await Promise.all([
    adminApi.listInstructors({ cookie }),
    adminApi.settings({ cookie }),
  ]);
  const cap = settings.max_members_per_instructor;

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Instructors</h1>
        <p className="mt-2 text-muted-inverse">{instructors.length} total.</p>
      </header>

      <Panel>
        <div className="px-6 py-5">
          {instructors.length === 0 ? (
            <p className="py-4 text-sm text-muted">No instructors yet.</p>
          ) : (
            instructors.map((instructor) => {
              const atCap = instructor.member_count >= cap;
              return (
                <RosterRow
                  key={instructor.id}
                  title={instructor.name}
                  meta={`${instructor.email} · ${instructor.specialty || "No specialty set"}`}
                  tone={atCap ? "alert" : "good"}
                  statusLabel={atCap ? "At Cap" : "Active"}
                  keyStat={`${instructor.member_count}/${cap} members`}
                  action={<DeactivateInstructorButton instructorId={instructor.id} name={instructor.name} />}
                />
              );
            })
          )}
        </div>
      </Panel>
    </>
  );
};

export default AdminInstructorsPage;
