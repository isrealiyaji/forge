import type { ReactNode } from "react";
import Panel from "./Panel";

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const SettingsSection = ({ title, description, children }: SettingsSectionProps) => {
  return (
    <section className="mb-8">
      <h2 className="font-display text-2xl tracking-poster text-ink-inverse">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-inverse">{description}</p> : null}
      <Panel className="mt-4">
        <div className="px-6 py-6 sm:px-8">{children}</div>
      </Panel>
    </section>
  );
};

export default SettingsSection;
