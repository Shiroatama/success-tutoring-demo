"use client";

import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

type LessonPlan = {
  objectives: string[];
  warmUp: { title: string; description: string; duration: string };
  mainActivity: { title: string; steps: string[]; duration: string };
  assessment: string;
  homework: string;
};

function safeFilename(base: string) {
  return base
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function lessonToPlainText(lesson: LessonPlan) {
  return [
    "Success Tutoring — Lesson Plan",
    "",
    "Learning objectives:",
    ...lesson.objectives.map((o) => `- ${o}`),
    "",
    `Warm-up (${lesson.warmUp.duration}): ${lesson.warmUp.title}`,
    lesson.warmUp.description,
    "",
    `Main activity (${lesson.mainActivity.duration}): ${lesson.mainActivity.title}`,
    ...lesson.mainActivity.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Assessment idea:",
    lesson.assessment,
    "",
    "Homework suggestion:",
    lesson.homework,
    "",
  ].join("\n");
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white/70 p-6 backdrop-blur">
      <h3 className="text-sm font-extrabold tracking-tight text-[var(--dark)]">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-7 text-[color:color-mix(in_oklab,var(--dark),transparent_25%)]">
        {children}
      </div>
    </section>
  );
}

export function LessonOutput({
  lesson,
  onStartOver,
}: {
  lesson: LessonPlan;
  onStartOver: () => void;
}) {
  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    const lines = doc.splitTextToSize(lessonToPlainText(lesson), width);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    let y = margin;
    const lineHeight = 14;
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    doc.save(`${safeFilename("lesson-plan") || "lesson-plan"}.pdf`);
  };

  const exportDocx = async () => {
    const title = new Paragraph({
      text: "Success Tutoring — Lesson Plan",
      heading: HeadingLevel.HEADING_1,
    });

    const heading = (text: string) =>
      new Paragraph({ text, heading: HeadingLevel.HEADING_2 });

    const bullet = (text: string) =>
      new Paragraph({
        children: [new TextRun(text)],
        bullet: { level: 0 },
      });

    const numbered = (text: string) =>
      new Paragraph({
        children: [new TextRun(text)],
        numbering: { reference: "steps", level: 0 },
      });

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "steps",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: "left",
              },
            ],
          },
        ],
      },
      sections: [
        {
          children: [
            title,
            heading("Learning objectives"),
            ...lesson.objectives.map(bullet),
            new Paragraph({ text: "" }),
            heading(`Warm-up (${lesson.warmUp.duration})`),
            new Paragraph({ text: lesson.warmUp.title }),
            new Paragraph({ text: lesson.warmUp.description }),
            new Paragraph({ text: "" }),
            heading(`Main activity (${lesson.mainActivity.duration})`),
            new Paragraph({ text: lesson.mainActivity.title }),
            ...lesson.mainActivity.steps.map(numbered),
            new Paragraph({ text: "" }),
            heading("Assessment idea"),
            new Paragraph({ text: lesson.assessment }),
            new Paragraph({ text: "" }),
            heading("Homework suggestion"),
            new Paragraph({ text: lesson.homework }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${safeFilename("lesson-plan") || "lesson-plan"}.docx`);
  };

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black tracking-tight text-[var(--dark)]">
          Your lesson plan
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportPdf}
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/15 bg-white/70 px-4 py-2 text-sm font-extrabold text-[var(--dark)] shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-black/25 hover:bg-white/90 hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            Export PDF
          </button>
          <button
            type="button"
            onClick={exportDocx}
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/15 bg-white/70 px-4 py-2 text-sm font-extrabold text-[var(--dark)] shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-black/25 hover:bg-white/90 hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            Export DOCX
          </button>
          <button
            type="button"
            onClick={onStartOver}
                        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/15 bg-white/70 px-4 py-2 text-sm font-extrabold text-[var(--dark)] shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-black/25 hover:bg-white/90 hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            Start over
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <Section title="Learning objectives">
          <ul className="list-disc pl-5">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </Section>

        <div className="grid gap-4 md:grid-cols-2">
          <Section title={`Warm-up (${lesson.warmUp.duration})`}>
            <p className="font-extrabold text-[var(--dark)]">
              {lesson.warmUp.title}
            </p>
            <p className="mt-1">{lesson.warmUp.description}</p>
          </Section>

          <Section title={`Main activity (${lesson.mainActivity.duration})`}>
            <p className="font-extrabold text-[var(--dark)]">
              {lesson.mainActivity.title}
            </p>
            <ol className="mt-2 list-decimal pl-5">
              {lesson.mainActivity.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Section title="Assessment idea">
            <p>{lesson.assessment}</p>
          </Section>
          <Section title="Homework suggestion">
            <p>{lesson.homework}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

