import Panel from "@/components/ui/Panel";
import ReviewPlanButtons from "@/components/admin/ReviewPlanButtons";
import { adminApi } from "@/lib/api/admin";
import { getCookieHeader } from "@/lib/auth/session";
import { formatShortDate } from "@/lib/dateTime";

const formatValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatKey = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const AdminNutritionReviewPage = async () => {
  const cookie = await getCookieHeader();
  const { plans } = await adminApi.listPendingNutritionPlans({ cookie });

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Nutrition Review</h1>
        <p className="mt-2 text-muted-inverse">
          {plans.length} plan{plans.length === 1 ? "" : "s"} waiting on a decision.
        </p>
      </header>

      {plans.length === 0 ? (
        <Panel>
          <p className="px-6 py-8 text-center text-sm text-muted">Nothing to review right now.</p>
        </Panel>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => {
            const entries = Object.entries(plan.content || {});
            return (
              <Panel key={plan.plan_id}>
                <div className="px-6 py-6 sm:px-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl tracking-poster text-ink">{plan.member_name}</p>
                      <p className="mt-1 text-sm text-muted">
                        Proposed by Coach {plan.instructor_name} · Round {plan.version_number} ·{" "}
                        {formatShortDate(plan.created_at)}
                      </p>
                    </div>
                    <ReviewPlanButtons planId={plan.plan_id} />
                  </div>

                  <div className="mt-5 border-t border-line pt-5">
                    {entries.length === 0 ? (
                      <p className="text-sm text-muted">No details provided.</p>
                    ) : (
                      <dl className="grid gap-3 sm:grid-cols-2">
                        {entries.map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                              {formatKey(key)}
                            </dt>
                            <dd className="mt-0.5 text-sm text-ink">{formatValue(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
};

export default AdminNutritionReviewPage;
