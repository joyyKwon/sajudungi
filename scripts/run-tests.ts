// Runs every scripts/verify-*.ts in parallel and prints one summary line per script.
//   npm test               all scripts
//   npm test -- saju flow  only scripts whose name contains one of the words
// Exits 1 if any script fails (non-zero exit or output containing "FAIL").
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = __dirname;
const filters = process.argv.slice(2);
const files = readdirSync(dir)
  .filter((f) => /^verify-.*\.ts$/.test(f) && (filters.length === 0 || filters.some((w) => f.includes(w))))
  .sort();

if (files.length === 0) {
  console.error('no matching verify scripts');
  process.exit(1);
}

type Result = { file: string; ok: boolean; seconds: number; summary: string; output: string };

const run = (file: string): Promise<Result> =>
  new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.execPath, [require.resolve('tsx/cli'), join(dir, file)], { cwd: join(dir, '..') });
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('close', (code) => {
      const lines = output.trim().split('\n').filter(Boolean);
      const summary = [...lines].reverse().find((l) => /passed|checked/.test(l)) ?? lines[lines.length - 1] ?? '(no output)';
      resolve({ file, ok: code === 0 && !/^FAIL/m.test(output), seconds: (Date.now() - started) / 1000, summary, output });
    });
  });

(async () => {
  const started = Date.now();
  const results = await Promise.all(files.map(run));
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.file.padEnd(28)} ${r.seconds.toFixed(1).padStart(5)}s  ${r.summary}`);
  const failed = results.filter((r) => !r.ok);
  for (const r of failed) console.log(`\n----- ${r.file} -----\n${r.output.trim().split('\n').slice(0, 30).join('\n')}`);
  console.log(`\n${results.length - failed.length}/${results.length} scripts passed in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  process.exit(failed.length ? 1 : 0);
})();
