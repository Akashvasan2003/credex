# Dev Log

## Assignment: Credex AI Spend Audit Platform

---

### Phase 1 — Architecture + Branding
**Time:** ~1 hour  
**Decisions:**
- Named product "SpendLens" — clear, memorable, finance-adjacent
- Feature-based folder structure for scalability
- Dark-first design system with indigo/violet brand palette
- Chose Anthropic claude-3-5-haiku for AI summaries (fast, cheap, good enough)

**Challenges:**
- Balancing completeness vs. over-engineering for an assignment
- Decided against shadcn/ui CLI (adds complexity) — built primitives directly

---

### Phase 2 — Pricing Engine
**Time:** ~2 hours  
**Decisions:**
- Centralized `PRICING_DATA` object — single source of truth
- All pricing verified from vendor pages (see PRICING_DATA.md)
- Per-tool audit functions with explicit reasoning strings
- Redundancy detection as a separate utility

**Challenges:**
- Claude Team plan has a 5-seat minimum — needed to model this correctly
- API tools are usage-based — engine uses spend thresholds instead of per-seat logic

---

### Phase 3 — UI + Form
**Time:** ~2 hours  
**Decisions:**
- Framer Motion for all transitions — smooth but not distracting
- LocalStorage persistence — users can close and return
- Dynamic add/remove tool entries with AnimatePresence

---

### Phase 4 — Results Page
**Time:** ~1.5 hours  
**Decisions:**
- Hero section with animated savings number — "screenshot-worthy" moment
- Conditional Credex CTA only shown when savings ≥ $500/yr
- Honest messaging for optimized stacks — no fake urgency

---

### Phase 5 — Backend + Email
**Time:** ~1 hour  
**Decisions:**
- Supabase for zero-config Postgres + RLS
- Resend for transactional email — better DX than SendGrid
- Honeypot + rate limiting for lead form protection

---

### Phase 6 — Sharing + SEO
**Time:** ~45 min  
**Decisions:**
- 8-char random slug for share URLs
- Edge runtime OG image — fast global response
- Full OpenGraph + Twitter card metadata on share pages

---

### Phase 7 — Tests + CI
**Time:** ~1 hour  
**Decisions:**
- Vitest over Jest — faster, native ESM, better DX
- 7 test suites covering all major audit scenarios
- GitHub Actions CI with stubbed env vars

---

### Phase 8 — Documentation
**Time:** ~45 min  
**Output:** README, ARCHITECTURE, DEVLOG, REFLECTION, TESTS, PRICING_DATA, PROMPTS, GTM, ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS
