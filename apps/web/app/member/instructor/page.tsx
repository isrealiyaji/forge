import { Mail, Phone } from "lucide-react";
import Panel from "@/components/ui/Panel";
import SealBadge from "@/components/ui/SealBadge";
import { memberApi } from "@/lib/api/member";
import { getCookieHeader } from "@/lib/auth/session";
import { formatShortDate } from "@/lib/dateTime";

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
};

const MemberInstructorPage = async () => {
  const cookie = await getCookieHeader();
  const [{ member }, instructor] = await Promise.all([
    memberApi.me({ cookie }),
    memberApi.myInstructor({ cookie }),
  ]);
  const timezone = member.timezone || "UTC";

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">My Instructor</h1>
        <p className="mt-2 text-muted-inverse">Your assigned coach for every session.</p>
      </header>

      {instructor ? (
        <Panel>
          <div className="px-6 py-8 sm:px-8">
            <div className="flex items-start gap-5">
              <SealBadge label={initials(instructor.name)} sublabel="Coach" />
              <div>
                <p className="font-display text-3xl tracking-poster text-ink">{instructor.name}</p>
                {instructor.specialty ? (
                  <p className="mt-1 text-sm font-semibold text-accent">{instructor.specialty}</p>
                ) : null}
                <p className="mt-1 text-sm text-muted">
                  Coaching you since {formatShortDate(instructor.assigned_at, timezone)}
                </p>
              </div>
            </div>

            {instructor.bio ? (
              <p className="mt-6 max-w-2xl border-t border-line pt-6 text-sm leading-relaxed text-ink">
                {instructor.bio}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:gap-8">
              <a
                href={`mailto:${instructor.email}`}
                className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-accent"
              >
                <Mail size={16} strokeWidth={2} />
                {instructor.email}
              </a>
              {instructor.phone ? (
                <a
                  href={`tel:${instructor.phone}`}
                  className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-accent"
                >
                  <Phone size={16} strokeWidth={2} />
                  {instructor.phone}
                </a>
              ) : null}
            </div>
          </div>
        </Panel>
      ) : (
        <Panel>
          <div className="px-6 py-10 text-center">
            <p className="font-display text-xl tracking-poster text-ink">No coach assigned yet</p>
            <p className="mt-2 text-sm text-muted">
              You&apos;ll be paired with a coach shortly — check back soon.
            </p>
          </div>
        </Panel>
      )}
    </>
  );
};

export default MemberInstructorPage;
