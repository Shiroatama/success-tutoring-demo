import { LessonForm } from "@/components/LessonForm";

export default function LessonGeneratorPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-[var(--dark)] backdrop-blur transition-colors hover:bg-white/80"
        >
          <span aria-hidden>←</span>
          Back
        </a>

        <h1 className="mt-6 text-balance text-3xl font-extrabold tracking-tight text-[var(--dark)] sm:text-5xl">
          AI Lesson Generator
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-[color:color-mix(in_oklab,var(--dark),transparent_25%)] sm:text-lg">
          Generate a structured lesson plan with objectives, warm-up, main activity steps, assessment, and homework.
        </p>

        <LessonForm />
      </div>
    </main>
  );
}

