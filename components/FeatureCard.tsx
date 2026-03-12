type FeatureCardProps = {
  title: string;
  description: string;
  badge?: string;
  tone?: "coral" | "teal" | "neutral";
};

export function FeatureCard({
  title,
  description,
  badge,
  tone = "neutral",
}: FeatureCardProps) {
  const toneStyles =
    tone === "coral"
      ? "bg-[var(--coral-light)] border-black/10"
      : tone === "teal"
        ? "bg-[var(--teal-light)] border-black/10"
        : "bg-white/70 border-black/10";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur",
        toneStyles,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-extrabold tracking-tight text-[var(--dark)]">
          {title}
        </h3>
        {badge ? (
          <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold text-[var(--dark)]">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-7 text-[color:color-mix(in_oklab,var(--dark),transparent_25%)]">
        {description}
      </p>
      <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-white/40 blur-2xl" />
    </div>
  );
}

