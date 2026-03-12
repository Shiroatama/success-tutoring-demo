"use client";

import { useMemo, useState } from "react";
import { LessonOutput } from "@/components/LessonOutput";

type Subject = "Math" | "English" | "Science" | "History";
type Duration = "30 min" | "45 min" | "60 min";

type LessonPlan = {
  objectives: string[];
  warmUp: { title: string; description: string; duration: string };
  mainActivity: { title: string; steps: string[]; duration: string };
  assessment: string;
  homework: string;
};

const subjects: Subject[] = ["Math", "English", "Science", "History"];
const durations: Duration[] = ["30 min", "45 min", "60 min"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-extrabold tracking-tight text-[var(--dark)]">
      {children}
    </span>
  );
}

function InputShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur">
      {children}
    </div>
  );
}

export function LessonForm() {
  const grades = useMemo(
    () => Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
    [],
  );

  const [subject, setSubject] = useState<Subject>("Math");
  const [grade, setGrade] = useState<string>("Grade 6");
  const [topic, setTopic] = useState<string>("");
  const [duration, setDuration] = useState<Duration>("45 min");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonPlan | null>(null);

  const canSubmit = topic.trim().length > 1 && !loading;

  const startOver = () => {
    setLesson(null);
    setError(null);
    setTopic("");
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setLesson(null);

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade, topic, duration }),
      });

      const data = (await res.json()) as
        | { lesson: LessonPlan }
        | { error: string };

      if (!res.ok) {
        throw new Error("error" in data ? data.error : "Failed to generate");
      }

      if (!("lesson" in data)) {
        throw new Error("Unexpected response");
      }

      setLesson(data.lesson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <InputShell>
          <label className="grid gap-2">
            <FieldLabel>Subject</FieldLabel>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="h-11 rounded-xl border border-black/10 bg-white/80 px-3 text-sm font-semibold text-[var(--dark)] outline-none focus:border-black/20"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </InputShell>

        <InputShell>
          <label className="grid gap-2">
            <FieldLabel>Grade level</FieldLabel>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-11 rounded-xl border border-black/10 bg-white/80 px-3 text-sm font-semibold text-[var(--dark)] outline-none focus:border-black/20"
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </InputShell>

        <InputShell>
          <label className="grid gap-2">
            <FieldLabel>Topic</FieldLabel>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='e.g. "Fractions" or "Persuasive writing"'
              className="h-11 rounded-xl border border-black/10 bg-white/80 px-3 text-sm font-semibold text-[var(--dark)] outline-none placeholder:text-black/30 focus:border-black/20"
            />
          </label>
        </InputShell>

        <InputShell>
          <label className="grid gap-2">
            <FieldLabel>Lesson duration</FieldLabel>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as Duration)}
              className="h-11 rounded-xl border border-black/10 bg-white/80 px-3 text-sm font-semibold text-[var(--dark)] outline-none focus:border-black/20"
            >
              {durations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </InputShell>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={generate}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--coral)] px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[color:color-mix(in_oklab,var(--coral),black_12%)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Crafting your lesson..." : "Generate Lesson"}
        </button>
        <p className="text-sm font-semibold text-[color:color-mix(in_oklab,var(--dark),transparent_35%)]">
          {loading
            ? "Crafting your lesson… hang tight."
            : "Tip: be specific (e.g., “adding fractions with unlike denominators”)."}
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-3xl border border-black/10 bg-[var(--coral-light)] p-5 text-sm font-semibold text-[var(--dark)]">
          {error}
        </div>
      ) : null}

      {lesson ? <LessonOutput lesson={lesson} onStartOver={startOver} /> : null}
    </div>
  );
}

