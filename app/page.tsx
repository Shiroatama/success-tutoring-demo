export default function Home() {
  return (
    <main className="flex min-h-screen items-center bg-[var(--cream)]">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-balance text-4xl font-black tracking-tight text-[var(--dark)] sm:text-6xl">
          Generate a{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-[var(--coral)]">structured</span>
            <span className="absolute -bottom-1 left-0 right-0 -z-0 h-3 rounded-full bg-[var(--coral-light)]" />
          </span>{" "}
          lesson plan in minutes.
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-[color:color-mix(in_oklab,var(--dark),transparent_25%)]">
          A focused demo for Success Tutoring: enter subject, grade, topic, and duration — get objectives, warm-up,
          step-by-step main activity, assessment, and homework.
        </p>

        <div className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/lesson-generator"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--coral)] px-7 text-base font-extrabold text-white shadow-sm transition-colors hover:bg-[color:color-mix(in_oklab,var(--coral),black_12%)]"
          >
            Try the AI Lesson Generator
          </a>
          <a
            href="/booking"
            className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/70 px-7 text-base font-extrabold text-[var(--dark)] shadow-sm transition-colors hover:bg-white/90"
          >
            Book a session
          </a>
        </div>

        <div className="mt-10 w-full max-w-2xl rounded-3xl border border-black/10 bg-[var(--teal-light)] p-5 text-left text-sm text-[color:color-mix(in_oklab,var(--dark),transparent_25%)] backdrop-blur">
          <p className="font-extrabold text-[var(--dark)]">What this proves</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Next.js App Router + Tailwind UI shipped fast</li>
            <li>Server-side Claude integration via API route</li>
            <li>Clean UX: generate, copy, start over</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
