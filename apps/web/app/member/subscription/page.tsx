import Panel from "@/components/ui/Panel";
import StatusPill from "@/components/ui/StatusPill";
import type { Tone } from "@/components/ui/StatusPill";
import SubscribeButton from "@/components/member/SubscribeButton";
import CancelSubscriptionButton from "@/components/member/CancelSubscriptionButton";
import CheckoutStatusBanner from "@/components/member/CheckoutStatusBanner";
import { memberApi } from "@/lib/api/member";
import { getCookieHeader } from "@/lib/auth/session";
import { formatShortDate } from "@/lib/dateTime";

const SUBSCRIPTION_STATUS: Record<string, { tone: Tone; label: string }> = {
  active: { tone: "good", label: "Active" },
  past_due: { tone: "alert", label: "Past Due" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

const formatPrice = (cents: number, interval: string) => `₦${(cents / 100).toLocaleString()} / ${interval}`;

const MemberSubscriptionPage = async () => {
  const cookie = await getCookieHeader();
  const [{ member }, { subscription }, { plans }] = await Promise.all([
    memberApi.me({ cookie }),
    memberApi.mySubscription({ cookie }),
    memberApi.listPlans({ cookie }),
  ]);

  const activePlans = plans.filter((p) => p.is_active);
  const status = subscription ? SUBSCRIPTION_STATUS[subscription.status] : null;
  const timezone = member.timezone || "UTC";

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Subscription</h1>
        <p className="mt-2 text-muted-inverse">Manage your membership plan and billing.</p>
      </header>

      <CheckoutStatusBanner />

      {subscription ? (
        <Panel className="mb-10">
          <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Current Plan</p>
              <p className="mt-1 font-display text-2xl tracking-poster text-ink">{subscription.plan_name}</p>
              {subscription.current_period_end ? (
                <p className="mt-1 text-sm text-muted">
                  Renews {formatShortDate(subscription.current_period_end, timezone)}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-4">
              {status ? <StatusPill tone={status.tone} label={status.label} /> : null}
              {subscription.status === "active" ? <CancelSubscriptionButton /> : null}
            </div>
          </div>
        </Panel>
      ) : (
        <p className="mb-10 text-sm text-muted-inverse">
          You don&apos;t have an active subscription yet — choose a plan below to get started.
        </p>
      )}

      <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">
        {subscription ? "Change Plan" : "Choose a Plan"}
      </h2>
      {activePlans.length === 0 ? (
        <p className="text-sm text-muted-inverse">No plans are available right now — check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activePlans.map((plan) => {
            const isCurrent = subscription?.plan_name === plan.name && subscription.status === "active";
            return (
              <Panel key={plan.id} className="flex flex-col p-7 text-ink">
                <p className="font-display text-2xl tracking-poster">{plan.name}</p>
                <p className="mt-1 text-sm font-semibold text-muted">{formatPrice(plan.price_cents, plan.interval)}</p>
                {plan.features.length > 0 ? (
                  <ul className="mt-5 flex-1 space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex-1" />
                )}
                <div className="mt-6">
                  {isCurrent ? (
                    <p className="text-center text-xs font-bold uppercase tracking-wide text-muted">Current Plan</p>
                  ) : (
                    <SubscribeButton
                      planId={plan.id}
                      mode={subscription?.status === "active" ? "upgrade" : "checkout"}
                      label={subscription?.status === "active" ? "Switch to this plan" : "Subscribe"}
                    />
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MemberSubscriptionPage;
