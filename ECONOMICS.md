# Economics

## Unit Economics for SpendLens as a Lead Gen Tool

---

## Cost to Run

| Item | Monthly Cost |
|---|---|
| Vercel (Pro) | $20 |
| Supabase (Pro) | $25 |
| Anthropic API (haiku, ~1000 audits/mo) | ~$2 |
| Resend (1000 emails/mo) | $0 (free tier) |
| **Total** | **~$47/month** |

**Cost per audit:** ~$0.05 (dominated by Anthropic API at ~$0.002/summary)

---

## Revenue Model

SpendLens is a **lead generation tool** for Credex's core business.

### Lead Value Calculation

Assumptions:
- 1,000 audits/month
- 8% email capture rate = 80 leads/month
- 10% of leads book consultation = 8 consultations/month
- 25% of consultations convert to Credex customer = 2 customers/month
- Average Credex customer LTV = $5,000

**Monthly revenue from SpendLens leads:** 2 × $5,000 = **$10,000/month**  
**Monthly cost:** $47  
**ROI:** 212x

---

## Sensitivity Analysis

| Conversion Rate | Customers/mo | Revenue/mo |
|---|---|---|
| Conservative (1%) | 0.8 | $4,000 |
| Base case (2%) | 2 | $10,000 |
| Optimistic (5%) | 5 | $25,000 |

---

## Payback Period

At base case: $47 cost → $10,000 revenue = **immediate positive ROI from month 1**.

---

## Scaling Costs

At 10,000 audits/month:
- Anthropic API: ~$20/month
- Supabase: $25/month (same tier)
- Vercel: $20/month (same tier)
- **Total: ~$65/month**

The tool is essentially free to scale.

---

## Alternative: Direct Monetization

If SpendLens were a standalone product:

- **Freemium:** Free audit, $29/month for team dashboard + alerts
- **TAM:** ~500,000 startups globally using AI tools
- **Addressable:** ~50,000 spending >$500/month
- **At 1% conversion:** 500 customers × $29 = $14,500 MRR
