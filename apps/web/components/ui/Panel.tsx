import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
  pinned?: boolean;
};

const Panel = ({ children, className = "", pinned = true }: PanelProps) => {
  return (
    <div
      className={`relative bg-panel text-ink shadow-[0_18px_40px_-24px_rgba(0,0,0,0.65)] ${className}`}
    >
      {pinned ? (
        <>
          <span
            className="absolute left-5 top-0 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            aria-hidden="true"
          />
          <span
            className="absolute right-5 top-0 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            aria-hidden="true"
          />
        </>
      ) : null}
      {children}
    </div>
  );
};

export default Panel;
