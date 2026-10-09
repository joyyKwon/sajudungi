// socialPrefillOf: what a login provider's profile can prefill on the first 내 정보 input.
import { socialPrefillOf } from '../lib/socialPrefill';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// Shapes Supabase stores today
ok('카카오: nickname → name', same(socialPrefillOf({ name: '둥이', email: 'a@b.c', avatar_url: 'x', provider_id: '1' }), { name: '둥이' }));
ok('Google: name / full_name', same(socialPrefillOf({ full_name: 'Joy Kim', name: 'Joy Kim', picture: 'x' }), { name: 'Joy Kim' }));
ok('falls back through the name keys', same(socialPrefillOf({ nickname: '  둥이  ' }), { name: '둥이' }));
ok('blank names are ignored', same(socialPrefillOf({ name: '   ', preferred_username: 'joy' }), { name: 'joy' }));

// Fields a future provider or consent item may send
ok('OIDC gender + birthdate', same(socialPrefillOf({ gender: 'female', birthdate: '1995-06-15' }), { gender: 'female', birth: { year: 1995, month: 6, day: 15 } }));
ok('카카오/네이버 style birthyear + birthday', same(socialPrefillOf({ gender: 'M', birthyear: '1988', birthday: '0310' }), { gender: 'male', birth: { year: 1988, month: 3, day: 10 } }));
ok('네이버 style MM-DD birthday', same(socialPrefillOf({ birthyear: '1992', birthday: '11-17' }), { birth: { year: 1992, month: 11, day: 17 } }));
ok('birthday without a year is not enough', same(socialPrefillOf({ birthday: '0615' }), {}));

// Bad values never prefill anything
ok('impossible date', same(socialPrefillOf({ birthdate: '1995-02-30' }), {}));
ok('future date', same(socialPrefillOf({ birthdate: `${new Date().getFullYear() + 1}-01-01` }), {}));
ok('before 1900', same(socialPrefillOf({ birthdate: '1899-12-31' }), {}));
ok('unknown gender value', same(socialPrefillOf({ gender: 'other' }), {}));
ok('non-string values', same(socialPrefillOf({ name: 42, gender: true, birthdate: 19950615 }), {}));
ok('no metadata', same(socialPrefillOf(undefined), {}) && same(socialPrefillOf(null), {}) && same(socialPrefillOf('x'), {}));

console.log(`verify-social-prefill: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
