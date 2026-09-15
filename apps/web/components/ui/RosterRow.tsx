import type { ReactNode } from "react";
import type { Tone } from "./StatusPill";
import StatusPill from "./StatusPill";

type RosterRowProps = {
  title: string;
  meta?: string;
  tone: Tone;
  statusLabel: string;
  keyStat: string;
  action?: ReactNode;
};

const RosterRow = ({ title, meta, tone, statusLabel, keyStat, action }: RosterRowProps) => {
  return (
    <div className="flex flex-col gap-3 border-b border-line px-1 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{title}</p>
        {meta ? <p className="truncate text-sm text-muted">{meta}</p> : null}
      </div>
      <div className="flex items-center justify-between gap-3 sm:contents">
        <StatusPill tone={tone} label={statusLabel} />
        <div className="flex shrink-0 items-center gap-3">
          <p className="font-tnum text-sm font-semibold text-ink sm:w-20 sm:text-right">{keyStat}</p>
          {action}
        </div>
      </div>
    </div>
  );
};

export default RosterRow;
