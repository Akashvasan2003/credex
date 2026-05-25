# Tests

## Test File

`src/__tests__/audit-engine.test.ts`

## Run Command

```bash
npm run test
```

## Coverage Summary

| Test Suite | Cases | What's Tested |
|---|---|---|
| Cursor audit | 2 | Business→Pro downgrade, Pro optimized |
| GitHub Copilot audit | 2 | Annual billing savings, Enterprise→Business |
| Claude audit | 2 | Max→Pro downgrade, Team minimum seat waste |
| API spend audit | 3 | Model routing, Batch API, low spend optimized |
| Total savings calculation | 2 | Multi-tool sum, zero savings stack |
| Redundancy detection | 3 | Cursor+Copilot, Claude+ChatGPT, no overlap |
| Windsurf audit | 1 | Teams→Pro for small teams |

**Total: 15 test cases across 7 suites**

## What's Tested

- Correct savings calculation with exact dollar amounts
- Correct plan recommendations per tool
- Correct `isOptimized` flag for already-optimal stacks
- Correct `annualSavings = monthlySavings * 12`
- Redundancy detection across tool combinations
- Edge cases: API tools, minimum seat requirements, annual billing

## What's Not Tested (and why)

- UI components: Require browser environment; covered by manual testing
- Server Actions: Require Supabase/Resend; covered by integration testing
- AI summary: Non-deterministic; tested via fallback logic

## Adding Tests

```bash
# Watch mode during development
npm run test:watch
```

Tests use Vitest with Node environment. No browser APIs needed for engine tests.
