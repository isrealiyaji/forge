import type { ReactNode } from "react";
import Panel from "./Panel";
import ThemeToggle from "./ThemeToggle";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  eyebrowBadge?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const AuthShell = ({ title, subtitle, eyebrowBadge, children, footer }: AuthShellProps) => {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-ground px-5 py-12">
      <ThemeToggle className="absolute right-5 top-5" />
      <a href="/" className="mb-8 font-display text-2xl tracking-poster text-ink-inverse">
        FORGE
      </a>
      <Panel className="w-full max-w-md">
        <div className="px-6 py-8 sm:px-10">
          {eyebrowBadge ? (
            <span className="mb-4 inline-block rounded-sm bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-ink">
              {eyebrowBadge}
            </span>
          ) : null}
          <h1 className="font-display text-3xl tracking-poster text-ink">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </Panel>
      {footer ? <p className="mt-6 text-sm text-muted-inverse">{footer}</p> : null}
    </main>
  );
};

export default AuthShell;
