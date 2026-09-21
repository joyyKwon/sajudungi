import { BUNDLED_CONTENT, CONTENT_KEYS, ContentBundle } from './content/bundled';

export type ContentRow = { key: string; value: unknown };

export type MergeReport = {
  /** Text values taken from the server. */
  applied: number;
  /** Server values ignored because they were malformed or unsafe. */
  rejected: string[];
  /** Server rows whose key this app doesn't know. */
  unknownKeys: string[];
};

/** Fields that drive logic (not wording); the server may never change them. */
const LOCKED_FIELDS = new Set(['group', 'hanja']);
const MAX_TEXT_LENGTH = 2000;
const BAD_TEXT = /undefined|NaN|null|\[object/;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function mergeNode(base: unknown, remote: unknown, path: string, report: MergeReport): unknown {
  if (typeof base === 'string') {
    if (remote === undefined) return base;
    if (typeof remote !== 'string' || remote.trim().length === 0 || remote.length > MAX_TEXT_LENGTH || BAD_TEXT.test(remote)) {
      report.rejected.push(path);
      return base;
    }
    if (remote !== base) report.applied += 1;
    return remote;
  }
  if (Array.isArray(base)) return base;
  if (isRecord(base)) {
    if (remote !== undefined && !isRecord(remote)) {
      report.rejected.push(path);
      return base;
    }
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(base)) {
      out[k] = LOCKED_FIELDS.has(k) ? base[k] : mergeNode(base[k], isRecord(remote) ? remote[k] : undefined, `${path}.${k}`, report);
    }
    return out;
  }
  return base;
}

/**
 * Overlays server rows on the built-in text. Anything missing or invalid falls
 * back to the built-in value, so a bad row can never break or blank a screen.
 */
export function mergeRemoteContent(rows: ContentRow[], base: ContentBundle = BUNDLED_CONTENT): { bundle: ContentBundle; report: MergeReport } {
  const report: MergeReport = { applied: 0, rejected: [], unknownKeys: [] };
  const byKey = new Map<string, unknown>();
  for (const row of rows) {
    if (row && typeof row.key === 'string') byKey.set(row.key, row.value);
  }
  for (const key of byKey.keys()) {
    if (!(CONTENT_KEYS as string[]).includes(key)) report.unknownKeys.push(key);
  }
  const bundle = { ...base } as Record<string, unknown>;
  for (const key of CONTENT_KEYS) {
    if (byKey.has(key)) bundle[key] = mergeNode(base[key], byKey.get(key), key, report);
  }
  return { bundle: bundle as ContentBundle, report };
}
