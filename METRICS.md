# Metrics

## North Star Metric

**Qualified leads generated per month** (leads with identified savings >$500/yr)

---

## Acquisition Metrics

| Metric | Target (Month 1) | Target (Month 3) |
|---|---|---|
| Monthly visitors | 500 | 5,000 |
| Audit starts | 200 (40%) | 2,000 (40%) |
| Audit completions | 150 (75%) | 1,500 (75%) |
| Email captures | 12 (8%) | 120 (8%) |
| Qualified leads (>$500 savings) | 8 | 80 |

---

## Engagement Metrics

| Metric | Definition | Target |
|---|---|---|
| Audit completion rate | Completions / starts | >75% |
| Email capture rate | Leads / completions | >8% |
| Share rate | Share links created / completions | >15% |
| Return visit rate | Users who audit again in 90 days | >10% |

---

## Revenue Metrics (Lead Gen Model)

| Metric | Target |
|---|---|
| Consultation booking rate | 10% of leads |
| Consultation → customer rate | 25% |
| Average customer LTV | $5,000 |
| Revenue per lead | $125 |
| Revenue per audit | $10 |

---

## Product Quality Metrics

| Metric | Target |
|---|---|
| Lighthouse Performance (mobile) | ≥85 |
| Lighthouse Accessibility | ≥90 |
| Lighthouse Best Practices | ≥90 |
| Audit engine accuracy | 100% (verified pricing) |
| AI summary generation success rate | ≥95% |
| Email delivery rate | ≥98% |

---

## Tracking Implementation

**Analytics:** Vercel Analytics (privacy-first, no cookies)  
**Events to track:**
- `audit_started` — form page loaded
- `audit_completed` — results page loaded
- `lead_captured` — email submitted
- `share_link_created` — share button clicked
- `credex_cta_clicked` — Credex CTA clicked

**No PII in analytics events.**

---

## Weekly Review Checklist

- [ ] Audit completion rate this week vs. last week
- [ ] New leads this week
- [ ] Average savings identified
- [ ] Top traffic sources
- [ ] Any errors in Supabase logs
