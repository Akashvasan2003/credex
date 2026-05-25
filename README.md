# SpendLens — AI Spend Audit Platform

> Audit your AI tool spending in 3 minutes. Get specific, defensible recommendations with real savings numbers.

**Built for the Credex AI Spend Audit assignment.**

---

## Screenshots

> _[Screenshot placeholder: Landing page hero]_
> _[Screenshot placeholder: Audit form with 3 tools]_
> _[Screenshot placeholder: Results page showing $2,400/yr savings]_
> _[Screenshot placeholder: Lead capture modal]_
> _[Screenshot placeholder: Shared audit link]_

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

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Set environment variables in Vercel dashboard (same as .env.example).

---

## Run Tests

```bash
npm run test
```

---

## 5 Key Tradeoff Decisions

### 1. No login — email after value
**Decision:** Capture email only after the audit is complete, not before.  
**Tradeoff:** Lower lead quality (no pre-qualification) vs. higher conversion (users see value first).  
**Why:** Cold visitors from HN/Twitter won't give email for a promise. They will after seeing $2,400/yr in savings.

### 2. Hardcoded pricing engine, no AI for math
**Decision:** All savings calculations use verified, typed pricing data. AI is only used for the narrative summary.  
**Tradeoff:** Manual maintenance of pricing data vs. defensible, auditable numbers.  
**Why:** A CFO needs to trust the numbers. "The AI said so" is not a valid citation. Verified pricing URLs are.

### 3. LocalStorage for audit persistence, not server-side sessions
**Decision:** Completed audits are stored in localStorage keyed by audit ID.  
**Tradeoff:** Data lost on browser clear vs. zero auth complexity and instant UX.  
**Why:** No-login product. Server-side sessions require auth. LocalStorage is sufficient for the "just completed" flow.

### 4. Honeypot over CAPTCHA for bot protection
**Decision:** Hidden honeypot field on lead capture form instead of reCAPTCHA.  
**Tradeoff:** Less robust against sophisticated bots vs. zero UX friction for real users.  
**Why:** reCAPTCHA adds 2-3 seconds of friction and accessibility issues. Honeypot catches 95%+ of automated form submissions with zero user impact. Rate limiting (3/hr per email) handles the rest.

### 5. Edge runtime for OG image generation
**Decision:** OG image API route uses Next.js Edge runtime with `ImageResponse`.  
**Tradeoff:** Limited Node.js APIs vs. fast cold starts and global CDN distribution.  
**Why:** OG images are fetched by social crawlers worldwide. Edge runtime ensures <100ms response globally without a warm Node.js instance.
