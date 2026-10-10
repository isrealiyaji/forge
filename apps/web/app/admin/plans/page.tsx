import Panel from "@/components/ui/Panel";
import SettingsSection from "@/components/ui/SettingsSection";
import PlanRow from "@/components/admin/PlanRow";
import CreatePlanForm from "@/components/admin/CreatePlanForm";
import { adminApi } from "@/lib/api/admin";
import { getCookieHeader } from "@/lib/auth/session";

const AdminPlansPage = async () => {
  const cookie = await getCookieHeader();
  const { plans } = await adminApi.listPlans({ cookie });

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Plans</h1>
        <p className="mt-2 text-muted-inverse">{plans.length} total.</p>
      </header>

      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Existing Plans</h2>
        <Panel>
          <div className="px-6 py-5">
            {plans.length === 0 ? (
              <p className="py-4 text-sm text-muted">No plans yet — create one below.</p>
            ) : (
              plans.map((plan) => <PlanRow key={plan.id} plan={plan} />)
            )}
          </div>
        </Panel>
      </section>

      <SettingsSection title="Create Plan" description="New plans are active immediately once created.">
        <CreatePlanForm />
      </SettingsSection>
    </>
  );
};

export default AdminPlansPage;
