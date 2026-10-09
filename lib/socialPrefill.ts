import type { Gender } from './saju';

/**
 * What a login provider shared that can prefill 내 정보 on first input. Every field is
 * optional: a provider fills only what it sends. Supabase keeps the provider's profile in
 * user_metadata; standard OpenID Connect names (name, gender, birthdate) are read first,
 * then the 카카오/네이버 style (nickname, birthyear + birthday "MMDD").
 *
 * Reading a field here is not the same as collecting it: a field only arrives if the
 * provider's consent screen asks for it. Before requesting a new one (e.g. 카카오 gender
 * or birthday), add it to the privacy policy in lib/legal.ts.
 */
export type SocialPrefill = {
  name?: string;
  gender?: Gender;
  birth?: { year: number; month: number; day: number };
};

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

function genderOf(v: unknown): Gender | undefined {
  const g = str(v)?.toLowerCase();
  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';
  return undefined;
}

function validDate(year: number, month: number, day: number) {
  const d = new Date(year, month - 1, day);
  const ok = year >= 1900 && d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day && d <= new Date();
  return ok ? { year, month, day } : undefined;
}

function birthOf(meta: Record<string, unknown>) {
  const iso = str(meta.birthdate)?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return validDate(+iso[1], +iso[2], +iso[3]);
  const year = str(meta.birthyear)?.match(/^\d{4}$/);
  const md = str(meta.birthday)?.replace('-', '').match(/^(\d{2})(\d{2})$/);
  return year && md ? validDate(+year[0], +md[1], +md[2]) : undefined;
}

export function socialPrefillOf(userMetadata: unknown): SocialPrefill {
  const meta = (userMetadata && typeof userMetadata === 'object' ? userMetadata : {}) as Record<string, unknown>;
  const name = ['name', 'full_name', 'nickname', 'preferred_username', 'user_name'].map((k) => str(meta[k])).find(Boolean);
  const out: SocialPrefill = {};
  if (name) out.name = name;
  const gender = genderOf(meta.gender);
  if (gender) out.gender = gender;
  const birth = birthOf(meta);
  if (birth) out.birth = birth;
  return out;
}
