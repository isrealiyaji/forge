type Tone = "alert" | "good" | "neutral";

const TONE_STYLES: Record<Tone, string> = {
  alert: "bg-accent text-accent-ink",
  good: "bg-gold text-gold-ink",
  neutral: "bg-neutral text-ink-inverse",
};

const StatusPill = ({ tone, label }: { tone: Tone; label: string }) => {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${TONE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
};

export default StatusPill;
export type { Tone };
