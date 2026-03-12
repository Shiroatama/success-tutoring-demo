# Success Tutoring — AI Demo App (Developer Context)

> Internal build reference. Not for user viewing.
> Goal: Email + interview demo for AI App Developer role at Success Tutoring.
> Time budget: ~6 hours. Ship something real, not a mockup.

---

## What We're Building

A Next.js web app that demonstrates what you'd build for Success Tutoring — starting with an AI-powered Lesson Generator. The point is to show: (1) you can ship fast, (2) you know their stack, (3) you actually understand their product.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Matches JD exactly |
| Styling | Tailwind CSS | Matches JD exactly |
| AI | Claude API (claude-sonnet-4-20250514) | You use it daily, it's their tool of choice |
| Auth (future) | Firebase Auth | Google OAuth for students/tutors |
| Database (future) | Firestore | Lesson history, user data, scheduling |
| Payments (future) | Stripe | Membership billing |
| Mobile (future) | Expo + React Native | Student/parent app |

---

## Why Firebase Later (Not Now)

Right now Claude API is the demo centerpiece. Firebase gets added when we need:
- Saving generated lessons per student
- Tutor/student accounts
- Realtime session progress
- Cloud Functions to hide the API key server-side

For the demo, API key lives in `.env.local` and calls go through a Next.js API route — clean enough.

---

## Color Scheme (Match successtutoring.com.au)

```css
--coral:       #E8734A;   /* primary CTA, headings */
--coral-light: #FAD7C8;   /* backgrounds, tags */
--teal:        #5BBFBF;   /* accents, borders */
--teal-light:  #C8ECEC;   /* section backgrounds */
--cream:       #F9F5F0;   /* page background */
--dark:        #2D2D2D;   /* body text */
```

Fonts: Use **Nunito** (Google Fonts) — rounded, friendly, matches their brand energy.

---

## App Structure

```
/app
  /page.tsx              ← Landing page (hero + features + CTA)
  /lesson-generator
    /page.tsx            ← AI Lesson Generator tool
  /api
    /generate-lesson
      /route.ts          ← Claude API call (server-side, hides key)
/components
  /Navbar.tsx
  /Hero.tsx
  /FeatureCard.tsx
  /LessonForm.tsx        ← Input: topic, grade, subject, duration
  /LessonOutput.tsx      ← Rendered lesson plan
```

---

## Page 1: Landing Page (`/`)

**Sections:**
1. **Navbar** — Logo + "Try the Lesson Generator" CTA button
2. **Hero** — Headline, subheadline, single CTA → `/lesson-generator`
3. **Features Strip** — 3 cards: AI Lesson Generator, Tutor Scheduling (coming soon), Student Dashboard (coming soon)
4. **Footer** — Simple, branded

**Tone:** Warm, energetic, student-focused. Not corporate.

---

## Page 2: AI Lesson Generator (`/lesson-generator`)

**Form inputs:**
- Subject (dropdown: Math, English, Science, History)
- Grade level (dropdown: Grade 1–12)
- Topic (text input, e.g. "Fractions", "Persuasive writing")
- Lesson duration (dropdown: 30 min, 45 min, 60 min)

**Output:** Structured lesson plan with:
- Learning objectives
- Warm-up activity
- Main activity (step-by-step)
- Assessment idea
- Homework suggestion

**UX flow:**
1. Fill form → click "Generate Lesson"
2. Loading state (spinner with fun copy: "Crafting your lesson...")
3. Lesson renders below the form
4. "Copy" and "Start Over" buttons

---

## Claude API Prompt (Server Route)

```ts
// /app/api/generate-lesson/route.ts
const systemPrompt = `You are an expert curriculum designer for Success Tutoring, 
Australia's leading personalised tutoring service. Generate structured, 
engaging lesson plans that motivate and inspire students.
Always respond in valid JSON matching this schema:
{
  "objectives": string[],
  "warmUp": { "title": string, "description": string, "duration": string },
  "mainActivity": { "title": string, "steps": string[], "duration": string },
  "assessment": string,
  "homework": string
}`

const userPrompt = `Create a ${duration} lesson plan for a ${grade} student 
on the topic "${topic}" in the subject "${subject}".`
```

---

## Build Order (6-hour budget)

| Hour | Task |
|---|---|
| 0–1 | Scaffold Next.js app, Tailwind config, color tokens, Nunito font, Navbar |
| 1–2 | Landing page: Hero + Features strip |
| 2–3 | Lesson Generator form + API route + Claude integration |
| 3–4 | Lesson output component — styled, structured rendering |
| 4–5 | Polish: loading states, mobile responsiveness, micro-interactions |
| 5–6 | README for repo, deploy to Vercel, final review |

---

## Environment Variables

```env
ANTHROPIC_API_KEY=your_key_here
# Future:
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# STRIPE_SECRET_KEY=
```

---

## Deployment

Vercel. Connect repo, add env vars, done. Should take 5 minutes.
Use a custom subdomain if possible: `success-tutoring-demo.vercel.app`

---

## What to Say in the Email

- Built a working demo of an AI Lesson Generator using their exact stack
- Followed their color scheme and brand
- Claude API integrated via server-side Next.js route
- Firebase and Stripe are next — briefly explain how they'd fit
- Link to live Vercel URL + repo

---

## What to Say in the Interview

- Walk through the code, not just the UI
- Explain the prompt design choices
- Show you've thought about the Firebase architecture for production
- Mention you built TubigPadala solo on a similar stack (Supabase → Firebase is a day's work)