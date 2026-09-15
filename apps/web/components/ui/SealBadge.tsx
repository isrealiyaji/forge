const SealBadge = ({ label, sublabel }: { label: string; sublabel: string }) => {
  return (
    <div
      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-2 border-gold text-center leading-none text-gold"
      style={{ borderStyle: "double", borderWidth: "3px" }}
    >
      <span className="font-display text-lg tracking-poster">{label}</span>
      <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-gold/80">{sublabel}</span>
    </div>
  );
};

export default SealBadge;
