# Reflection

## What I Built

SpendLens is a production-grade AI spend audit platform. It audits a startup's AI tool stack, identifies overspending with verified pricing data, generates AI-powered summaries, captures leads, and creates shareable audit reports.

---

## What Went Well

**The audit engine is genuinely useful.** The per-tool logic handles real edge cases: Claude Team's 5-seat minimum, GitHub Copilot's annual billing discount, API spend optimization via model routing. These aren't made-up savings — they're real opportunities with cited pricing.

**The UX flow converts.** No login → immediate value → email capture after results. This is the right order. Asking for email before showing value is the #1 conversion killer for tools like this.

**The design system is cohesive.** Dark-first, indigo/violet palette, consistent spacing, Framer Motion transitions. It looks like a real product, not a hackathon demo.

---

## What I'd Do Differently

**Real user interviews before building.** I made assumptions about what "founders care about" in AI spend. The USER_INTERVIEWS.md file has placeholders — those should be real conversations before v2.

**More granular API pricing.** The API spend audit uses percentage-based estimates. A better version would let users input their actual model mix (% GPT-4o vs GPT-4o-mini) and calculate exact savings.

**PDF export.** The results page is screenshot-worthy but a proper PDF export would make it shareable in board decks. Marked as bonus — would use `@react-pdf/renderer`.

---

## Technical Tradeoffs

| Tradeoff | Decision | Reasoning |
|---|---|---|
| Auth vs. no-auth | No auth | Maximize top-of-funnel conversion |
| AI math vs. hardcoded | Hardcoded | Defensible, auditable, no hallucinations |
| shadcn/ui vs. custom | Custom primitives | Fewer dependencies, full control |
| CAPTCHA vs. honeypot | Honeypot + rate limit | Zero UX friction |
| SSR vs. CSR for results | CSR (localStorage) | No session needed for just-completed audits |

---

## What I Learned

Building a "no-login" product that still captures leads requires careful UX sequencing. The value must be undeniable before you ask for anything. The results page hero — that big green savings number — is the moment that makes users want to share and convert.

The pricing engine was the most intellectually interesting part. Modeling the Claude Team minimum seat requirement, the Copilot annual billing discount, and API model routing required actually understanding the products, not just their prices.
