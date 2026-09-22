# sajudungi

## Tests

```bash
npm run check      # type check + every verification script
npm test           # verification scripts only (parallel, ~30s)
npm test -- saju   # only scripts whose name contains "saju"
```

`scripts/verify-*.ts` cover the saju engine (pillars, 절기, 음력/윤달, 십신, 대운/세운), the interpretation
content, the 사주 목록 logic, the content merge from Supabase and the legal text. Each script prints a summary
and exits non-zero on failure; `scripts/run-tests.ts` runs them all. GitHub Actions (`.github/workflows/ci.yml`)
runs the type check, the scripts and an iOS/Android bundle export on every push and pull request.

Before a release also run `npx tsx scripts/verify-legal.ts --release`, which fails until the placeholders in
`lib/legal.ts` are filled in.
