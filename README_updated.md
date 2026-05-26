# SpendLens — AI Spend Audit Platform

> Audit your AI tool spending in minutes. Get defensible recommendations and identify AI cost savings.

**Built for the Credex AI Spend Audit assignment.**

SpendLens is a no-login AI Spend Audit platform designed for startup teams and founders. Users enter their AI stack, receive instant audit recommendations, estimated savings, and an AI-generated summary, with optional lead capture and shareable audit results.

---

## Screenshots

### Landing Page / Audit Flow
![Audit Form](./brave_screenshot_credex-lqc7t5d1w-akash-s-project1.vercel.app.png)

### Results Page
![Results Page](./brave_screenshot_credex-lqc7t5d1w-akash-s-project1.vercel.app%20(1).png)

### Lead Capture Modal
![Lead Capture](./brave_screenshot_credex-lqc7t5d1w-akash-s-project1.vercel.app%20(2).png)

### Email Confirmation
![Email Confirmation](./WhatsApp%20Image%202026-05-25%20at%2018.19.47.jpeg)

---

## Features

- AI spend input form
- Multi-tool audit engine
- Savings recommendations
- AI-generated summary with fallback
- Supabase lead capture
- Email report delivery
- Shareable audit results
- LocalStorage persistence

---

## Important Note About Email Delivery

Email sending is currently configured and working for my own testing email only.

Because I do not have a verified production email domain configured with Resend, email delivery may be limited outside testing. The lead capture flow, backend save, and email template system are fully implemented.

---

## Install & Run

```bash
# 1. Clone
git clone https://github.com/your-org/spendlens
cd spendlens

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, RESEND_API_KEY

# 4. Set up database
# Run supabase/schema.sql in your Supabase SQL editor

# 5. Run dev server
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Set environment variables in Vercel dashboard.

---

## Run Tests

```bash
npm run test
```

---

## 5 Key Tradeoff Decisions

### 1. No login — email after value
Capture email only after audit completion.

### 2. Hardcoded pricing engine
AI used only for summaries, not calculations.

### 3. LocalStorage persistence
Fast no-login experience.

### 4. Honeypot protection
Low-friction abuse protection.

### 5. Edge/runtime optimized sharing
Fast and scalable public sharing experience.
