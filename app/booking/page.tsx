"use client";

import { useEffect, useMemo, useState } from "react";

type Tutor = {
  id: string;
  name: string;
  subjects: string[];
  sessionDurationMins: number;
  availability: Array<{ dayOfWeek: number; start: string; end: string }>;
};

type Session = {
  id: string;
  tutorId: string;
  startAt: string;
  endAt: string;
  studentName: string;
  notes?: string;
  createdAt: string;
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  return h * 60 + m;
}

function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60_000);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmtDay(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export default function BookingPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const [studentName, setStudentName] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/scheduling/tutors");
      const data = (await res.json()) as { tutors: Tutor[] };
      setTutors(data.tutors);
      setSelectedTutorId((prev) => prev || data.tutors[0]?.id || "");
    })();
  }, []);

  const selectedTutor = useMemo(
    () => tutors.find((t) => t.id === selectedTutorId) ?? null,
    [tutors, selectedTutorId],
  );

  const range = useMemo(() => {
    const from = startOfDay(new Date());
    const to = addMinutes(from, 7 * 24 * 60);
    return { from, to };
  }, []);

  useEffect(() => {
    if (!selectedTutorId) return;
    (async () => {
      const url = new URL("/api/scheduling/sessions", window.location.origin);
      url.searchParams.set("tutorId", selectedTutorId);
      url.searchParams.set("from", range.from.toISOString());
      url.searchParams.set("to", range.to.toISOString());
      const res = await fetch(url.toString());
      const data = (await res.json()) as { sessions: Session[] };
      setSessions(data.sessions);
    })();
  }, [selectedTutorId, range.from, range.to]);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < 7; i += 1) out.push(addMinutes(range.from, i * 24 * 60));
    return out;
  }, [range.from]);

  const slotsByDay = useMemo(() => {
    if (!selectedTutor) return [];
    const duration = selectedTutor.sessionDurationMins;

    return days.map((day) => {
      const weekday = day.getDay();
      const rules = selectedTutor.availability.filter(
        (a) => a.dayOfWeek === weekday,
      );

      const sessionsForTutor = sessions
        .filter((s) => s.tutorId === selectedTutor.id)
        .map((s) => ({
          start: Date.parse(s.startAt),
          end: Date.parse(s.endAt),
        }))
        .filter((x) => !Number.isNaN(x.start) && !Number.isNaN(x.end));

      const slots: Array<{ start: Date; end: Date }> = [];
      for (const rule of rules) {
        const startMins = toMinutes(rule.start);
        const endMins = toMinutes(rule.end);

        let cursor = addMinutes(startOfDay(day), startMins);
        const limit = addMinutes(startOfDay(day), endMins);
        while (cursor.getTime() + duration * 60_000 <= limit.getTime()) {
          const end = addMinutes(cursor, duration);
          const startMs = cursor.getTime();
          const endMs = end.getTime();

          const blocked = sessionsForTutor.some((s) =>
            overlaps(startMs, endMs, s.start, s.end),
          );
          if (!blocked) slots.push({ start: cursor, end });
          cursor = addMinutes(cursor, duration);
        }
      }

      return { day, slots };
    });
  }, [days, selectedTutor, sessions]);

  const book = async (slot: { start: Date; end: Date }) => {
    if (!selectedTutor) return;
    const name = studentName.trim();
    if (!name) {
      setError("Please enter the student name.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/scheduling/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: selectedTutor.id,
          startAt: slot.start.toISOString(),
          endAt: slot.end.toISOString(),
          studentName: name,
          notes: notes.trim() || undefined,
        }),
      });

      const data = (await res.json()) as
        | { session: Session }
        | { error: string };

      if (!res.ok) {
        throw new Error("error" in data ? data.error : "Booking failed");
      }

      if ("session" in data) setSessions((s) => [data.session, ...s]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  };

  const removeSession = async (session: Session) => {
    setBusy(true);
    setError(null);
    try {
      const url = new URL("/api/scheduling/sessions", window.location.origin);
      url.searchParams.set("id", session.id);
      url.searchParams.set("tutorId", session.tutorId);
      const res = await fetch(url.toString(), { method: "DELETE" });
      const data = (await res.json()) as
        | { session: Session }
        | { error: string };

      if (!res.ok) {
        throw new Error("error" in data ? data.error : "Delete failed");
      }

      setSessions((prev) => prev.filter((s) => s.id !== session.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a
              href="/"
              className="text-sm font-extrabold text-[color:color-mix(in_oklab,var(--dark),transparent_35%)] hover:text-[var(--dark)]"
            >
              ← Back
            </a>
            <h1 className="mt-3 text-balance text-3xl font-black tracking-tight text-[var(--dark)] sm:text-5xl">
              Book a tutoring session
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-[color:color-mix(in_oklab,var(--dark),transparent_25%)] sm:text-lg">
              Lean scheduling demo: pick a tutor, choose an available slot, and book.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <section className="rounded-3xl border border-black/10 bg-white/70 p-5 backdrop-blur lg:col-span-1">
            <label className="grid gap-2">
              <span className="text-xs font-extrabold tracking-tight text-[var(--dark)]">
                Tutor
              </span>
              <select
                value={selectedTutorId}
                onChange={(e) => setSelectedTutorId(e.target.value)}
                className="h-11 rounded-2xl border border-black/10 bg-white/80 px-3 text-sm font-extrabold text-[var(--dark)] outline-none focus:border-black/20"
              >
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} • {t.sessionDurationMins} min
                  </option>
                ))}
              </select>
            </label>

            {selectedTutor ? (
              <div className="mt-4 rounded-2xl bg-[var(--teal-light)] p-4">
                <p className="text-sm font-black text-[var(--dark)]">
                  Subjects
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:color-mix(in_oklab,var(--dark),transparent_25%)]">
                  {selectedTutor.subjects.join(", ")}
                </p>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2">
                <span className="text-xs font-extrabold tracking-tight text-[var(--dark)]">
                  Student name
                </span>
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g., Ava"
                  className="h-11 rounded-2xl border border-black/10 bg-white/80 px-3 text-sm font-extrabold text-[var(--dark)] outline-none placeholder:text-black/30 focus:border-black/20"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-extrabold tracking-tight text-[var(--dark)]">
                  Notes (optional)
                </span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Year 7 maths revision"
                  className="h-11 rounded-2xl border border-black/10 bg-white/80 px-3 text-sm font-semibold text-[var(--dark)] outline-none placeholder:text-black/30 focus:border-black/20"
                />
              </label>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl bg-[var(--coral-light)] p-4 text-sm font-semibold text-[var(--dark)]">
                {error}
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-black/10 bg-white/70 p-5 backdrop-blur lg:col-span-2">
            <div className="rounded-2xl bg-[var(--teal-light)] p-4 mb-8">
              <p className="text-sm font-black text-[var(--dark)]">
                Booked sessions (this tutor)
              </p>
              <div className="mt-2 grid gap-2 text-sm">
                {sessions
                  .filter((s) => s.tutorId === selectedTutorId)
                  .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
                  .slice(0, 8)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col justify-between gap-1 rounded-xl bg-white/70 px-3 py-2 sm:flex-row sm:items-center"
                    >
                      <span className="font-extrabold text-[var(--dark)]">
                        {s.studentName}
                      </span>
                      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <span className="font-semibold text-[color:color-mix(in_oklab,var(--dark),transparent_25%)]">
                          {fmtDay(new Date(s.startAt))} •{" "}
                          {fmtTime(new Date(s.startAt))}
                        </span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeSession(s)}
                          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-extrabold text-[var(--dark)] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                {!sessions.filter((s) => s.tutorId === selectedTutorId).length ? (
                  <p className="font-semibold text-[color:color-mix(in_oklab,var(--dark),transparent_25%)]">
                    No bookings yet.
                  </p>
                ) : null}
              </div>
            </div>

            <p className="text-xs font-extrabold tracking-tight text-[var(--dark)]">
              Available slots (next 7 days)
            </p>

            <div className="mt-4 grid gap-4">
              {slotsByDay.map(({ day, slots }) => (
                <div key={day.toISOString()} className="rounded-2xl bg-white/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-[var(--dark)]">
                      {fmtDay(day)}
                    </p>
                    <p className="text-xs font-semibold text-[color:color-mix(in_oklab,var(--dark),transparent_35%)]">
                      {slots.length ? `${slots.length} slots` : "No availability"}
                    </p>
                  </div>

                  {slots.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {slots.map((s) => (
                        <button
                          key={s.start.toISOString()}
                          type="button"
                          disabled={busy}
                          onClick={() => book(s)}
                          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-extrabold text-[var(--dark)] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {fmtTime(s.start)}–{fmtTime(s.end)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

