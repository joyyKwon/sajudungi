// Renders the public website (GitHub Pages): the legal documents from lib/legal.ts — the
// same source the app shows — plus the account-deletion page that Google Play requires.
// Pure: returns file contents; scripts/build-site.ts writes them, and
// .github/workflows/pages.yml publishes them when these sources change.
import { LEGAL_CONFIG, LEGAL_DOCS, LEGAL_VERSION, LegalDoc } from '../lib/legal';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `
:root { --bg:#FBF3E7; --card:#FFFDF9; --ink:#3B2A1D; --soft:#8A7A68; --line:#E9DCC8; --red:#B23A22; --redSoft:#F6D9CE; }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font-family: "Gowun Dodum", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif; line-height:1.7; }
h1, h2, .brand, .links a { font-family: "Gowun Batang", "Gowun Dodum", serif; }
main { max-width: 720px; margin: 0 auto; padding: 28px 20px 64px; }
a { color: var(--red); }
.brand { font-weight: 700; font-size: 15px; color: var(--soft); text-decoration: none; }
h1 { font-size: 24px; margin: 14px 0 6px; }
h2 { font-size: 16px; margin: 28px 0 8px; }
p { margin: 0 0 8px; font-size: 14.5px; }
.meta { color: var(--soft); font-size: 13px; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; margin-top: 16px; }
#loginHint + .card { margin-top: 8px; }
#loginForm label:first-child { margin-top: 0; }
.links a { display:block; padding: 14px 0; border-bottom: 1px solid var(--line); text-decoration:none; color: var(--ink); font-weight: 700; }
.links a:last-child { border-bottom: 0; }
.hero { text-align:center; margin-top: 8px; }
.hero img { display:block; width: 108px; height: 108px; margin: 0 auto; }
.hero h1 { margin: 2px 0 0; }
.hero .meta { margin: 0; }
label { display:block; font-size: 13px; color: var(--soft); margin: 12px 0 4px; }
input { width:100%; padding: 12px 14px; font-size: 15px; border: 1.5px solid var(--line); border-radius: 12px; background:#fff; color: var(--ink); }
button { width:100%; padding: 13px; margin-top: 12px; font-family: inherit; font-size: 15px; font-weight: 700; border-radius: 12px; border: 1.5px solid var(--line); background:#fff; color: var(--ink); cursor:pointer; }
button.primary { background: var(--red); border-color: var(--red); color:#fff; }
button:disabled { opacity: .5; cursor: default; }
/* Brand rules: Kakao — #FEE500 container, black symbol, 85% black label. Google — white fill, #747775 stroke, #1F1F1F label. */
button.social { display:flex; align-items:center; justify-content:center; gap: 8px; }
button.kakao { background:#FEE500; border-color:#FEE500; color: rgba(0,0,0,.85); }
button.google { background:#FFFFFF; border: 1px solid #747775; color:#1F1F1F; }
.msg { margin-top: 6px; font-size: 13px; color: var(--red); }
.msg:empty { display: none; }
.or { text-align:center; color: var(--soft); font-size: 12px; margin: 16px 0 4px; }
[hidden] { display: none !important; }
footer { margin-top: 40px; color: var(--soft); font-size: 12px; }
`;

const page = (title: string, body: string, scripts = '') => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ${esc(LEGAL_CONFIG.serviceName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<main>
<a class="brand" href="./">${esc(LEGAL_CONFIG.serviceName)}</a>
${body}
<footer>${esc(LEGAL_CONFIG.serviceName)} · 문서 버전 ${esc(LEGAL_VERSION)}</footer>
</main>
${scripts}</body>
</html>
`;

const DELETE_TITLE = '계정 삭제 요청';

const legalPage = (doc: LegalDoc) =>
  page(
    doc.title,
    `<h1>${esc(doc.title)}</h1>
${doc.intro ? `<p class="meta">${esc(doc.intro)}</p>\n` : ''}${doc.sections
      .map((s) => `<h2>${esc(s.heading)}</h2>\n${s.body.map((line) => `<p>${esc(line)}</p>`).join('\n')}`)
      .join('\n')}`,
  );

const index = () =>
  page(
    '안내',
    `<div class="hero">
<img src="mascot.png" alt="${esc(LEGAL_CONFIG.serviceName)} 캐릭터" width="108" height="108">
<h1>${esc(LEGAL_CONFIG.serviceName)}</h1>
<p class="meta">사주풀이 · 만세력 · 사주공부 앱 "${esc(LEGAL_CONFIG.serviceName)}"의 약관과 개인정보 안내 페이지예요.</p>
</div>
<div class="card links">
${(['terms', 'privacy', 'notice'] as const).map((id) => `<a href="${id}.html">${esc(LEGAL_DOCS[id].title)}</a>`).join('\n')}
<a href="delete-account.html">${DELETE_TITLE}</a>
</div>`,
  );

// The deletion page talks to Supabase with the same public (publishable) key the app ships
// with (scripts/site.config.json); row-level security limits each signed-in user to their
// own rows.
const DELETE_SCRIPT = `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>
<script>
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var show = function (id) {
    ['signedOut', 'signedIn', 'requested', 'unavailable'].forEach(function (s) { $(s).hidden = s !== id; });
    $('loginHint').hidden = id !== 'signedOut'; // the hint sits above the box and only applies before sign-in
  };
  // Each state has its own message line right above its buttons (under the password field
  // when signed out); only the visible state's line shows, so one call sets them all.
  var say = function (text, good) {
    document.querySelectorAll('.msg').forEach(function (el) { el.textContent = text || ''; el.style.color = good ? 'var(--ink)' : ''; });
  };
  var cfg = window.SAJUDUNGI_CONFIG;
  if (!cfg || !cfg.url || !cfg.key || !window.supabase) { show('unavailable'); return; }

  // No stored session: this page is for one request, possibly on a shared computer.
  var sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: false, autoRefreshToken: false } });
  var user = null;
  var day = function (d) { return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; };

  function render(session) {
    user = session ? session.user : null;
    say('');
    if (!user) { show('signedOut'); return; }
    $('who').textContent = user.email || '소셜 로그인 계정';
    sb.from('deletion_requests').select('requested_at').eq('user_id', user.id).maybeSingle().then(function (res) {
      if (res.data) {
        var at = new Date(res.data.requested_at);
        $('when').textContent = day(at);
        $('purge').textContent = day(new Date(at.getTime() + 30 * 86400000));
        show('requested');
      } else {
        show('signedIn');
      }
    });
  }

  sb.auth.onAuthStateChange(function (_event, session) { render(session); });
  sb.auth.getSession().then(function (res) { render(res.data.session); });

  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    say('');
    $('loginBtn').disabled = true;
    sb.auth.signInWithPassword({ email: $('email').value.trim(), password: $('password').value }).then(function (res) {
      $('loginBtn').disabled = false;
      if (res.error) say('이메일 또는 비밀번호를 확인해주세요.');
    });
  });
  var oauth = function (provider) {
    return function () {
      sb.auth.signInWithOAuth({ provider: provider, options: { redirectTo: location.origin + location.pathname } }).then(function (res) {
        if (res.error) say('로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.');
      });
    };
  };
  $('kakaoBtn').addEventListener('click', oauth('kakao'));
  $('googleBtn').addEventListener('click', oauth('google'));

  $('deleteBtn').addEventListener('click', function () {
    if (!user || !confirm('계정 삭제를 요청할까요? 30일 뒤에 계정과 서버에 저장된 정보가 삭제돼요.')) return;
    $('deleteBtn').disabled = true;
    var requestedAt = new Date();
    sb.from('deletion_requests').upsert({ user_id: user.id, requested_at: requestedAt.toISOString() }).then(function (res) {
      $('deleteBtn').disabled = false;
      if (res.error) { say('요청을 저장하지 못했어요. 잠시 후 다시 시도해주세요.'); return; }
      $('when').textContent = day(requestedAt);
      $('purge').textContent = day(new Date(requestedAt.getTime() + 30 * 86400000));
      show('requested');
    });
  });
  $('cancelBtn').addEventListener('click', function () {
    if (!user) return;
    sb.from('deletion_requests').delete().eq('user_id', user.id).then(function (res) {
      if (res.error) { say('취소하지 못했어요. 잠시 후 다시 시도해주세요.'); return; }
      show('signedIn');
      say('삭제 요청을 취소했어요.', true); // not an error, so not in red
    });
  });
  var signOut = function () { sb.auth.signOut(); };
  $('signOutBtn').addEventListener('click', signOut);
  $('signOutBtn2').addEventListener('click', signOut);
})();
</script>
`;

const deleteAccount = () =>
  page(
    DELETE_TITLE,
    `<h1>${DELETE_TITLE}</h1>
<p class="meta">앱을 지웠거나 쓸 수 없어도, 이 페이지에서 ${esc(LEGAL_CONFIG.serviceName)} 계정과 서버에 저장된 정보의 삭제를 요청할 수 있어요.</p>

<h2>삭제되는 정보</h2>
<p>계정(로그인 정보), 서버에 백업된 사주 목록(이름·생년월일시·성별·메모 등), 학습 진도가 모두 삭제돼요.</p>
<p>삭제를 요청하면 30일 동안 보관한 뒤 완전히 삭제해요. 30일 안에 앱에서 다시 로그인하거나 이 페이지에서 취소하면 요청이 취소돼요. 따로 계속 보관하는 정보는 없어요.</p>
<p>로그인하지 않고 쓴 경우에는 정보가 기기에만 저장돼 있어요. 앱의 마이 &gt; 내 정보 삭제를 누르거나 앱을 삭제하면 지워져요.</p>

<h2>앱에서 삭제하기</h2>
<p>앱의 마이 &gt; 계정 삭제에서도 같은 요청을 할 수 있어요.</p>

<h2>이 페이지에서 삭제하기</h2>
<p id="loginHint">삭제할 계정으로 로그인해주세요.</p>
<div class="card">
  <div id="signedOut">
    <form id="loginForm">
      <label for="email">이메일</label>
      <input id="email" type="email" autocomplete="username" required>
      <label for="password">비밀번호</label>
      <input id="password" type="password" autocomplete="current-password" required>
      <div class="msg" role="alert"></div>
      <button id="loginBtn" class="primary" type="submit">이메일 로그인</button>
    </form>
    <div class="or">또는</div>
    <button id="kakaoBtn" class="social kakao" type="button"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#000" d="M12 3C6.9 3 3 6.4 3 10.6c0 2.7 1.7 5 4.3 6.4l-1 3.7c-.1.4.3.7.6.5l4.3-2.7c.3 0 .5.1.8.1 5.1 0 9-3.4 9-7.6S17.1 3 12 3z"/></svg>카카오 로그인</button>
    <button id="googleBtn" class="social google" type="button"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Google 로그인</button>
  </div>
  <div id="signedIn" hidden>
    <p><strong id="who"></strong> 계정으로 로그인했어요.</p>
    <div class="msg" role="status"></div>
    <button id="deleteBtn" class="primary" type="button">계정 삭제 요청</button>
    <button id="signOutBtn" type="button">로그아웃</button>
  </div>
  <div id="requested" hidden>
    <p><strong>삭제 요청이 접수됐어요.</strong></p>
    <p>요청한 날: <span id="when"></span><br>완전히 삭제되는 날: <span id="purge"></span> 이후</p>
    <div class="msg" role="status"></div>
    <button id="cancelBtn" type="button">삭제 요청 취소</button>
    <button id="signOutBtn2" type="button">로그아웃</button>
  </div>
  <div id="unavailable" hidden>
    <p>지금은 이 페이지에서 요청을 받을 수 없어요. 앱의 마이 &gt; 계정 삭제를 이용해주세요.</p>
  </div>
</div>`,
    DELETE_SCRIPT,
  );

export type SiteConfig = { supabaseUrl: string; supabasePublishableKey: string };

/** Every file of the site, keyed by file name. */
export function renderSite(config: SiteConfig): Record<string, string> {
  return {
    'index.html': index(),
    'terms.html': legalPage(LEGAL_DOCS.terms),
    'privacy.html': legalPage(LEGAL_DOCS.privacy),
    'notice.html': legalPage(LEGAL_DOCS.notice),
    'delete-account.html': deleteAccount(),
    'config.js': `// Public Supabase project address and publishable key (the same values the app ships with).\nwindow.SAJUDUNGI_CONFIG = ${JSON.stringify({ url: config.supabaseUrl, key: config.supabasePublishableKey })};\n`,
    '.nojekyll': '',
  };
}
