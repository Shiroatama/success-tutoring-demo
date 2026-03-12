export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[color:color-mix(in_oklab,var(--cream),white_35%)]/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" className="group inline-flex items-center gap-3">
          <span className="relative inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--dark)] text-sm font-extrabold text-[var(--cream)] shadow-sm">
            ST
            <span className="pointer-events-none absolute -right-1 -top-1 size-3 rounded-full bg-[var(--teal)] ring-2 ring-[var(--cream)]" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-tight text-[var(--dark)]">
              Success Tutoring
            </span>
            <span className="block text-xs font-semibold text-[color:color-mix(in_oklab,var(--dark),transparent_35%)]">
              Motivate • Inspire • Uplift
            </span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <a
            href="/lesson-generator"
            className="inline-flex items-center justify-center rounded-full bg-[var(--coral)] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[color:color-mix(in_oklab,var(--coral),black_12%)]"
          >
            Try the Lesson Generator
          </a>
        </div>
      </div>
    </header>
  );
}

