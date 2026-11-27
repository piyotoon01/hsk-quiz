// 오프라인용 서비스 워커 (10/19) — 한 번 열면 인터넷이 없어도 열린다
// - 첫 화면(index.html): 인터넷 먼저 → 안 되면 저장해 둔 것 (그래서 새 버전이 올라가면 바로 반영)
// - 데이터·라이브러리·아이콘·글꼴: 저장해 둔 것 먼저 → 없으면 받아서 저장 (데이터 주소에 ?v= 버전이 붙어 새 파일은 새로 받는다)
// - /api/ (컴퓨터 미리보기 기록 저장)는 건드리지 않는다
const CACHE = "hsk-quiz-v1";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.pathname.startsWith("/api/")) return;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !font) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && (r.ok || r.type === "opaque")) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
    return r;
  })));
});
