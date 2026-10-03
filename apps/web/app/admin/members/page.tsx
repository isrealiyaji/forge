import Panel from "@/components/ui/Panel";
import RosterRow from "@/components/ui/RosterRow";
import type { Tone } from "@/components/ui/StatusPill";
import DeactivateMemberButton from "@/components/admin/DeactivateMemberButton";
import { adminApi } from "@/lib/api/admin";
import { getCookieHeader } from "@/lib/auth/session";
import { formatShortDate } from "@/lib/dateTime";

const SUBSCRIPTION_STATUS: Record<string, { tone: Tone; label: string }> = {
  active: { tone: "good", label: "Active" },
  past_due: { tone: "alert", label: "Past Due" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

const AdminMembersPage = async () => {
  const cookie = await getCookieHeader();
  const { members } = await adminApi.listMembers({ cookie });

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Members</h1>
        <p className="mt-2 text-muted-inverse">{members.length} total.</p>
      </header>

      <Panel>
        <div className="px-6 py-5">
          {members.length === 0 ? (
            <p className="py-4 text-sm text-muted">No members yet.</p>
          ) : (
            members.map((member) => {
              const sub = member.subscription_status ? SUBSCRIPTION_STATUS[member.subscription_status] : null;
              const meta = [
                `Joined ${formatShortDate(member.created_at)}`,
                member.instructor_name ? `Coach ${member.instructor_name.split(" ")[0]}` : "Unassigned",
              ].join(" · ");

              return (
                <RosterRow
                  key={member.member_id}
                  title={member.name}
                  meta={meta}
                  tone={sub?.tone ?? "neutral"}
                  statusLabel={sub?.label ?? "No Plan"}
                  keyStat={`${member.current_streak} streak`}
                  action={<DeactivateMemberButton memberId={member.member_id} name={member.name} />}
                />
              );
            })
          )}
        </div>
      </Panel>
    </>
  );
};

export default AdminMembersPage;
