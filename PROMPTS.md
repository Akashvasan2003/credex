# Prompts

## AI Summary Prompt

### Final Prompt (in production)

```
You are a helpful AI finance advisor for startups. Write a concise ~100-word audit summary.

Context:
- Team size: {teamSize}
- Primary use case: {useCase}
- Total monthly AI spend: {totalMonthlySpend}
- Potential monthly savings: {totalMonthlySavings}

Tool breakdown:
{toolSummary}

Write a helpful, smart, non-salesy summary. Be specific about the biggest savings opportunity. 
End with one actionable next step. Do not use bullet points. Plain prose only.
```

### Model Used
`claude-3-5-haiku-20241022` — fast, cheap, sufficient quality for ~100-word summaries.

### Reasoning
- Haiku is 10x cheaper than Sonnet for this use case
- 200 max tokens is enough for ~100 words
- Temperature default (1.0) produces natural-sounding prose
- "Non-salesy" instruction prevents the model from pushing Credex unprompted

---

## Failed Attempts

### Attempt 1 — Too generic
```
Summarize this AI spend audit in 100 words.
```
**Problem:** Output was generic ("You should consider optimizing your AI tools..."). No specifics.

### Attempt 2 — Too salesy
```
You are a Credex advisor. Explain why this team should book a consultation.
```
**Problem:** Output was pushy and promotional. Users would distrust it.

### Attempt 3 — Bullet points
```
List the top 3 recommendations from this audit.
```
**Problem:** Bullet points don't read well in the UI. Prose flows better in the results card.

---

## Fallback Template

When Anthropic API is unavailable or fails after 3 retries:

```
Your team is spending {totalMonthlySpend}/month on AI tools with {totalMonthlySavings}/month 
in identified savings — {totalAnnualSavings} annually. The biggest opportunity is optimizing 
your {topTool} plan. Review the recommendations below and implement the highest-confidence 
changes first to capture savings without disrupting your workflow.
```

For optimized stacks:
```
Your team is spending {totalMonthlySpend}/month on AI tools and your stack looks 
well-optimized. You're making smart choices with your current plans. As your team grows, 
revisit this audit — pricing tiers and alternatives shift frequently in the AI space.
```

---

## Retry Logic

- 3 attempts with exponential backoff (1s, 2s, 3s)
- Falls back to template on all failures
- Errors logged to console (not surfaced to user)
