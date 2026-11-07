'use strict';

if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } });
  },{threshold:.1});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });
} else {
  document.querySelectorAll('.rv').forEach(function(el){ el.classList.add('on'); });
}

(function(){
  var items = document.querySelectorAll('.rail-item');
  if (!items.length) return;
  items.forEach(function(btn){
    btn.addEventListener('click', function(){
      var el = document.getElementById(btn.dataset.target);
      if (el) el.scrollIntoView({behavior:'smooth'});
    });
  });
  if ('IntersectionObserver' in window){
    var map = {};
    items.forEach(function(btn){ map[btn.dataset.target] = btn; });
    var io2 = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var btn = map[e.target.id];
        if (btn) btn.classList.toggle('active', e.isIntersecting);
      });
    }, {rootMargin:'-40% 0px -40% 0px'});
    Object.keys(map).forEach(function(id){
      var el = document.getElementById(id);
      if (el) io2.observe(el);
    });
  }
})();

// ===== DAFTAR ASET: ganti jalur di sini kalau nama atau foldernya berbeda =====
var WAHYU_PHOTO = 'assets/img/cutout.webp';
var WAHYU_PHOTO_LO = 'assets/img/cutout-1000.webp';
var WAHYU_LOGOS = {
  capcut: 'assets/icon/capcut.svg',
  canva: 'assets/icon/canva.svg',
  ibispaint: 'assets/icon/ibispaint.svg',
  chatgpt: 'assets/icon/chatgpt.svg',
  gw: 'assets/icon/google-workspace.svg',
  notion: 'assets/icon/notion.svg',
  github: 'assets/icon/github.svg',
  claude: 'assets/icon/claude.svg',
  tiktok: 'assets/icon/tiktok-studio.svg',
  m365: 'assets/icon/microsoft-365.svg',
  smp: 'assets/icon/smp.webp',
  smk: 'assets/icon/smk.webp',
  dkv: 'assets/icon/dkv.webp'
};

// pilih ukuran foto sesuai kebutuhan layar, lalu mulai mengunduh semua aset sekarang (saat halo berjalan) supaya sudah siap sebelum "duar"
(function(){
  var port = innerHeight >= innerWidth, pw = port ? Math.min(innerWidth * 1.22, innerHeight * .76) : Math.min(innerHeight * .94, innerWidth * .64);
  window.__photoUse = pw * (window.devicePixelRatio || 1) <= 1000 ? WAHYU_PHOTO_LO : WAHYU_PHOTO;
  [window.WAHYU_STAGE_PHOTO || window.__photoUse].concat(Object.keys(WAHYU_LOGOS).map(function(k){ return WAHYU_LOGOS[k]; })).forEach(function(u){ var im = new Image(); im.decoding = 'async'; im.src = u; });
})();

// ===== Persiapan ringan saat halo berjalan: (1) hangatkan font tiap bahasa agar kata tidak tersendat saat pertama tampil, (2) ukur kelancaran perangkat =====
(function(){
  var el = document.getElementById('p0Welcome'), p0 = document.getElementById('p0');
  if (el && p0) {
    var cs = getComputedStyle(el), h = document.createElement('div');
    h.setAttribute('aria-hidden', 'true');
    h.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:' + cs.font;
    h.innerHTML = ['Hello','你好','Hola','नमस्ते','مرحبا','Bonjour','こんにちは','안녕하세요','Привет','Olá','Halo'].map(function(x){ return '<span>' + x + '</span>'; }).join(' ');
    p0.appendChild(h); setTimeout(function(){ if (h.parentNode) h.parentNode.removeChild(h); }, 3000);
  }
  var sd = [], sl = 0, s0 = 0;
  requestAnimationFrame(function sm(t){ if (sl) sd.push(t - sl); sl = t; if (!s0) s0 = t;
    if (t - s0 < 1400) requestAnimationFrame(sm);
    else { sd.shift(); window.__perfAvg = sd.reduce(function(a, b){ return a + b; }, 0) / (sd.length || 1); } });
})();

// ===== PANGGUNG INTRO v3: foto png transparan + animasi dari kode. Gaya berawalan st-/--s-; animasi baru jalan saat "duar" =====
(function(){
  var __go = function(){
  var stage = document.getElementById('stage'), p0 = document.getElementById('p0');
  if (!stage || !p0) return;
  // Foto cutout transparan (siluetnya juga dipakai sebagai mask nama). Kalau di-hosting boleh diganti: window.WAHYU_STAGE_PHOTO = 'foto-cutout.webp'
  var src = window.WAHYU_STAGE_PHOTO || window.__photoUse || WAHYU_PHOTO;
  var phEl = stage.querySelector('.st-photo'), lnEl = stage.querySelector('.st-line'), imgCss = 'url("' + src + '")';
  phEl.style.backgroundImage = imgCss; lnEl.style.webkitMaskImage = imgCss; lnEl.style.maskImage = imgCss;
  function fit(){   // mask nama hanya seluas jalur teks (bukan satu layar penuh), jadi blend jauh lebih murah
    stage.style.setProperty('--s-mx', (phEl.offsetLeft - lnEl.offsetLeft) + 'px'); stage.style.setProperty('--s-my', (phEl.offsetTop - lnEl.offsetTop) + 'px');
    stage.style.setProperty('--s-mw', phEl.offsetWidth + 'px'); stage.style.setProperty('--s-mh', phEl.offsetHeight + 'px');
  }
  fit(); window.addEventListener('resize', fit); window.addEventListener('orientationchange', fit);
  var warm = new Image(); warm.src = src; if (warm.decode) warm.decode().catch(function(){});
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NAME = 'I Gede Wahyu Ananta';
  var L = WAHYU_LOGOS;   // jalur logo: lihat DAFTAR ASET di atas. Ganti satu logo cukup menimpa berkasnya di assets/logo/
  var IC = {
    musik:'<svg viewBox="0 0 100 100"><defs><linearGradient id="stg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8cc0"/><stop offset=".5" stop-color="#e8336f"/><stop offset="1" stop-color="#8f1248"/></linearGradient><linearGradient id="stg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffd3e6"/></linearGradient></defs><rect width="100" height="100" fill="url(#stg1)"/><circle cx="84" cy="14" r="38" fill="#fff" opacity=".1"/><g fill="url(#stg2)"><path d="M38 27 74 19v13L38 40z"/><rect x="38" y="34" width="6.5" height="34"/><rect x="67.5" y="26" width="6.5" height="34"/><ellipse cx="32" cy="69" rx="11.5" ry="8.5" transform="rotate(-22 32 69)"/><ellipse cx="61.5" cy="61" rx="11.5" ry="8.5" transform="rotate(-22 61.5 61)"/></g></svg>',
    game:'<svg viewBox="0 0 100 100"><defs><linearGradient id="stg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a7bff"/><stop offset=".55" stop-color="#5a3fd6"/><stop offset="1" stop-color="#2b1a86"/></linearGradient><linearGradient id="stg4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d9d2ff"/></linearGradient></defs><rect width="100" height="100" fill="url(#stg3)"/><circle cx="16" cy="90" r="40" fill="#fff" opacity=".08"/><path d="M26 32H74C82 32 87.5 37 89.5 45L94 63C95.5 69 91 75 85 75C81.5 75 78.5 73.2 76.8 70.2L71.5 61H28.5L23.2 70.2C21.5 73.2 18.5 75 15 75C9 75 4.5 69 6 63L10.5 45C12.5 37 18 32 26 32Z" fill="url(#stg4)"/><path d="M25 41h6v5.5h5.5v6H31v5.5h-6v-5.5h-5.5v-6H25z" fill="#4a2fb0"/><circle cx="71" cy="43.5" r="3.6" fill="#ff5d7a"/><circle cx="77.5" cy="50" r="3.6" fill="#ffc233"/><circle cx="71" cy="56.5" r="3.6" fill="#3ddc97"/><circle cx="64.5" cy="50" r="3.6" fill="#4aa3ff"/><circle cx="46" cy="55" r="3" fill="#8f86d9"/><circle cx="54" cy="55" r="3" fill="#8f86d9"/></svg>',
    kamera:'<svg viewBox="0 0 100 100"><defs><linearGradient id="stg5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34e0cf"/><stop offset=".55" stop-color="#0e8fa0"/><stop offset="1" stop-color="#0b4a63"/></linearGradient><linearGradient id="stg6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cfd8e3"/></linearGradient><radialGradient id="stg7" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#6fb3ff"/><stop offset=".45" stop-color="#1c3f8f"/><stop offset="1" stop-color="#070d1f"/></radialGradient></defs><rect width="100" height="100" fill="url(#stg5)"/><path d="M36 27h28l4 7H32z" fill="url(#stg6)"/><rect x="12" y="32" width="76" height="52" rx="10" fill="url(#stg6)"/><rect x="12" y="43" width="76" height="5" fill="#1f2937" opacity=".1"/><circle cx="50" cy="59" r="21" fill="#1f2937"/><circle cx="50" cy="59" r="21" fill="none" stroke="#e5eaf1" stroke-width="3"/><circle cx="50" cy="59" r="14.5" fill="url(#stg7)"/><circle cx="43.5" cy="52.5" r="3.8" fill="#fff" opacity=".85"/><circle cx="56" cy="65" r="1.8" fill="#fff" opacity=".5"/><rect x="72" y="37.5" width="9" height="5.5" rx="1.8" fill="#ffc233"/><circle cx="21" cy="40" r="2.2" fill="#ff5d7a"/></svg>'};
  // [kunci logo, x%, y%, ukuran, rotasi, (warna, egg) untuk ikon buatan]. Pojok: A kiri atas, B kanan atas, C kiri bawah, D kanan bawah
  var Q = [
    {p:'st-l st-top', g:[['capcut',28,19,1,-10],['canva',70,23,1,9],['ibispaint',28,43,1,12],['chatgpt',70,46,1,-8],['gw',50,70,1.1,-5]]},
    {p:'st-r st-top', g:[['notion',68,19,1,9],['github',30,23,1,-11],['claude',68,43,1,12],['tiktok',30,46,1,-9],['m365',50,70,1.1,5]]},
    {p:'st-l st-bot', g:[['smp',30,30,1,-8],['smk',72,45,1,7],['dkv',38,80,1,12]]},   // nanti: smp, smk, itb
    {p:'st-r st-bot', g:[['musik',66,28,1,7,'#e8478b','musik'],['game',28,42,1,-11,'#6d4cd6','game'],['kamera',60,80,1,9,'#0e8fa0','kamera']]}
  ];
  var g3 = ('<span>' + NAME + '</span>').repeat(3);
  stage.querySelectorAll('.st-track').forEach(function(t){ t.innerHTML = g3 + g3; });
  document.getElementById('stQs').innerHTML = Q.map(function(q, i){
    return '<div class="st-q ' + q.p + '" style="--s-i:' + i + ';--s-k:' + (6 + i * 2) + '">' + q.g.map(function(c, j){
      var w = c[0] === 'gw' || c[0] === 'm365', col = c[5], e = c[6];
      return '<div class="st-t' + (w ? ' st-w' : '') + '"' + (e ? ' data-e="' + e + '" role="button" tabindex="0" aria-label="' + e + '"' : '') +
        ' style="--s-j:' + (i * 3 + j) + ';--s-dx:' + c[1] + ';--s-dy:' + c[2] + ';--s-s:' + c[3] + ';--s-r:' + c[4] + (col ? ';--s-c:' + col : '') + '">' +
        '<span class="st-m"><b' + (col ? ' class="st-c"' : '') + '>' + (L[c[0]] ? '<img src="' + L[c[0]] + '" alt="' + c[0] + '" draggable="false">' : IC[c[0]]) + '</b></span></div>';
    }).join('') + '</div>';
  }).join('');

  var spk = document.createElement('div'); spk.className = 'st-spk'; spk.setAttribute('aria-hidden', 'true'); var sh = '';
  for (var n = 0; n < 8; n++) { var sz = 6 + Math.random() * 10; sh += '<i class="st-sp" style="left:' + (Math.random() * 96 + 2).toFixed(1) + '%;top:' + (Math.random() * 96 + 2).toFixed(1) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;animation-delay:' + (-Math.random() * 5).toFixed(2) + 's"></i>'; }
  spk.innerHTML = sh; stage.insertBefore(spk, document.getElementById('stQs'));
  // decode logo satu per satu (bukan serentak) supaya tidak menyentak
  var imgs = [].slice.call(stage.querySelectorAll('.st-t img'));
  (function nxt(i){ if (i >= imgs.length || !imgs[i].decode) return; imgs[i].decode().catch(function(){}).then(function(){ setTimeout(function(){ nxt(i + 1); }, 40); }); })(0);
  // sorotan acak: 3 dari 5 logo per sisi atas, bergilir adil; hanya jalan setelah "duar" dan saat panggung terlihat
  var running = function(){ return p0.classList.contains('done') && !stage.classList.contains('off'); };
  function spot(idx, delay){
    var ms = [].slice.call(stage.querySelectorAll('.st-q')[idx].querySelectorAll('.st-m')), cnt = ms.map(function(){ return 0; }), prev = '';
    function tick(){
      var o;
      for (var n = 0; n < 4; n++){
        o = ms.map(function(_, k){ return [cnt[k] + Math.random() * 1.6, k]; }).sort(function(a, b){ return a[0] - b[0]; }).slice(0, 3).map(function(x){ return x[1]; });
        if (o.slice().sort().join() !== prev) break;
      }
      prev = o.slice().sort().join(); o.forEach(function(k){ cnt[k]++; });
      ms.forEach(function(m, k){ m.classList.remove('st-in'); m.classList.toggle('st-hi', o.indexOf(k) > -1); });
    }
    setTimeout(function(){ tick(); setInterval(function(){ if (running()) tick(); }, 3400); }, delay);
  }
  stage.querySelectorAll('.st-top .st-m').forEach(function(m){ m.classList.add(reduced ? 'st-hi' : 'st-in'); });   // masuk dalam keadaan terang; sorotan bergilir mulai setelah semuanya muncul
  if (!reduced) { var w8 = setInterval(function(){ if (p0.classList.contains('go')) { clearInterval(w8); spot(0, 5400); spot(1, 7000); } }, 250); }

  // easter egg di pojok kanan bawah (ISI DATA ASLIMU di GAMES dan GALLERY)
  var GAMES = [['Genshin Impact','UID 800000000'],['Mobile Legends','ID 12345678 (1234)'],['Minecraft','Username']];
  var GALLERY = [['Karya 01',''],['Karya 02',''],['Karya 03',''],['Karya 04','']];   // ['Judul','url gambar']
  var pop = document.createElement('div'); pop.id = 'stPop'; pop.hidden = true; stage.appendChild(pop);
  var fl = document.createElement('div'); fl.id = 'stFl'; stage.appendChild(fl);
  var FOUND = {}, nFound = 0, ac, mt = 0, open = '';
  function AC(){ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); return ac; }
  function stopM(){ clearInterval(mt); mt = 0; }
  function closePop(){ pop.hidden = true; stopM(); open = ''; }
  function show(k, title, html){ open = k; pop.hidden = false; pop.innerHTML = '<button class="st-x" aria-label="Tutup">✕</button><h3>' + title + '</h3>' + html; pop.querySelector('.st-x').onclick = closePop; }
  function music(){
    var a = AC(), N = [261.6,329.6,392,523.3,392,329.6,293.7,349.2,440,587.3,440,349.2], i = 0;
    mt = setInterval(function(){
      var o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
      o.type = 'triangle'; o.frequency.value = N[i++ % N.length];
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + .5);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + .55);
    }, 360);
  }
  function shutter(){
    var a = AC(), n = a.sampleRate * .08, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = a.createBufferSource(), g = a.createGain(); g.gain.value = .25; s.buffer = b; s.connect(g); g.connect(a.destination); s.start();
    fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
  }
  function egg(k){
    if (open === k) { closePop(); return; }
    stopM(); if (!FOUND[k]) { FOUND[k] = 1; nFound++; }
    if (k === 'musik') { show(k, 'Now playing', '<div class="st-eq"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><p><span>Judul lagu</span><span>♪ ganti dengan lagumu</span></p>'); music(); }
    else if (k === 'game') show(k, 'ID Game', GAMES.map(function(x){ return '<p><span>' + x[0] + '</span><span>' + x[1] + '</span></p>'; }).join(''));
    else { shutter(); show(k, 'Galeri', '<div class="st-gal">' + GALLERY.map(function(g, i){ return '<div style="--s-a:hsl(' + (200 + i * 65) + ' 70% 58%);--s-b:hsl(' + (240 + i * 65) + ' 70% 38%)">' + (g[1] ? '<img src="' + g[1] + '" alt="' + g[0] + '">' : '') + '<span>' + g[0] + '</span></div>'; }).join('') + '</div>'); }
  }
  var qs = document.getElementById('stQs');
  qs.addEventListener('click', function(e){ var t = e.target.closest('[data-e]'); if (t) egg(t.dataset.e); });
  qs.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { var t = e.target.closest('[data-e]'); if (t) { e.preventDefault(); egg(t.dataset.e); } } });

  // tingkat performa: 0 penuh, 1 menengah (tanpa blend/bintang/bayangan), 2 ringan (tanpa gerak 3D). Hanya bisa naik, tidak turun.
  var tier = 0;
  var frozen = false;   // dikunci saat panggung mulai bergerak, supaya tampilan tidak berganti gaya di tengah animasi
  function setTier(n){ if (frozen || n <= tier) return; tier = n; stage.classList.toggle('lite', n >= 1); stage.classList.toggle('low', n >= 2); }
  if ((navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2) setTier(2);
  else if ((navigator.deviceMemory || 8) <= 4) setTier(1);
  if (/Windows NT 6\.[01]/.test(navigator.userAgent)) setTier(2);   // Windows 7/Vista: browser tua, langsung mode ringan
  if (window.__perfAvg) { if (window.__perfAvg > 45) setTier(2); else if (window.__perfAvg > 26) setTier(1); }   // hasil ukur saat halo
  // parallax mouse (hanya perangkat dengan pointer halus)
  if (window.matchMedia && matchMedia('(pointer:fine)').matches) {
    var raf = 0, qsEl = [].slice.call(stage.querySelectorAll('.st-q')), mx = 0, my = 0;
    window.addEventListener('pointermove', function(e){
      if (tier >= 1 || stage.classList.contains('off')) return;   // hanya tingkat penuh
      mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
      if (!raf) raf = requestAnimationFrame(function(){ raf = 0; qsEl.forEach(function(q, i){ var k = 6 + i * 2; q.style.translate = (mx * k).toFixed(1) + 'px ' + (my * k).toFixed(1) + 'px'; }); });
    }, { passive: true });
  }
  // isi panggung mulai bergerak 0,85 dtk setelah "duar" (tirai sudah terbuka). Kalau 70 frame pertama rata-rata lambat, otomatis pakai mode ringan.
  function startGlint(){
    if (tier < 1 || reduced) return;   // tingkat penuh sudah punya semua efek kilaunya sendiri
    var every = tier >= 2 ? 1700 : 1000, last = null;
    setInterval(function(){
      if (!running()) return;
      var c = [].slice.call(stage.querySelectorAll('.st-q.st-bot .st-m, .st-q.st-top .st-m.st-hi'));
      if (!c.length) return;
      var m, g = 0; do { m = c[Math.floor(Math.random() * c.length)]; } while (m === last && c.length > 1 && ++g < 5);
      last = m; m.classList.add('st-glint'); setTimeout(function(){ m.classList.remove('st-glint'); }, 1300);
    }, every);
  }
  function startGo(){
    p0.classList.add('go');
    // masuk bertahap: (1) Google + Microsoft + 1 logo acak di tiap sisi atas, (2) jeda napas, (3) pojok bawah C dan D berpasangan, (4) 6 logo atas sisanya perlahan
    var tl = [].slice.call(stage.querySelectorAll('.st-q')).map(function(q){ return [].slice.call(q.querySelectorAll('.st-t')); }), k;
    var pick = function(a){ return a[Math.floor(Math.random() * a.length)]; };
    var ta = tl[0].slice(0, 4), tb = tl[1].slice(0, 4), ra = pick(ta), rb = pick(tb), rest = [];
    for (k = 0; k < 4; k++) { if (ta[k] !== ra) rest.push(ta[k]); if (tb[k] !== rb) rest.push(tb[k]); }
    var steps = [[tl[0][4], 0], [tl[1][4], 130], [ra, 330], [rb, 460]], t = 1160;
    for (k = 0; k < 3; k++) { steps.push([tl[2][k], t], [tl[3][k], t]); t += 200; }
    t += 500;
    rest.forEach(function(el, i){ steps.push([el, t + i * 240]); });
    steps.forEach(function(st){ setTimeout(function(){ st[0].classList.add('st-on'); }, reduced ? 0 : st[1]); });
    frozen = true;
    setTimeout(startGlint, reduced ? 0 : 4200);   // setelah semua logo masuk
  }
  // nama baru mulai berjalan setelah font Anton benar-benar siap (kalau tidak, huruf berganti rupa mendadak di tengah jalan); panjang jalur disesuaikan lebar layar
  var fontsReady = new Promise(function(res){ var d = false, ok = function(){ if (!d) { d = true; res(); } }; setTimeout(ok, 2800); if (document.fonts && document.fonts.load) document.fonts.load('400 1em Anton').then(ok, ok); else ok(); });
  function buildTracks(){
    var sp = stage.querySelector('.st-track span'), w = sp ? sp.getBoundingClientRect().width : 0, reps = w ? Math.max(1, Math.ceil(innerWidth / w)) : 2, g = ('<span>' + NAME + '</span>').repeat(reps);
    stage.querySelectorAll('.st-track').forEach(function(t){ t.innerHTML = g + g; });
  }
  var gwait = setInterval(function(){ if (p0.classList.contains('done')) { clearInterval(gwait); fontsReady.then(function(){ buildTracks(); setTimeout(startGo, reduced ? 0 : 850); }); } }, 100);
  // jeda animasi + musik saat panggung tidak terlihat
  var inView = true;
  function sync(){ var off = !inView || document.hidden; stage.classList.toggle('off', off); stage.style.visibility = inView ? '' : 'hidden'; if (off) closePop(); }   // di luar layar: animasi berhenti, lapisan dilepas, musik mati
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ es.forEach(function(e){ inView = e.isIntersecting; sync(); }); }).observe(p0);
  document.addEventListener('visibilitychange', sync);
  };
  setTimeout(__go, 1700);   // setelah 10 kata selesai (1,6 dtk) dan "Halo" sedang diam: main thread longgar, halo tidak tersendat
})();

(function(){
  var p0 = document.getElementById('p0');
  var el = document.getElementById('p0Welcome');
  var banner = document.getElementById('p0Banner');
  var video = document.getElementById('p0Video');
  if (!p0 || !el) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // sambutan kilat: terjemahan "halo" dalam 10 bahasa, satu kata per bahasa, melaju makin cepat lalu mendarat di "Halo"
  var words = ['Hello','你好','Hola','नमस्ते','مرحبا','Bonjour','こんにちは','안녕하세요','Привет','Olá'];
  var FINAL = 'Halo';
  var START = 160, ACCEL = 0, MIN_STEP = 160;  // jeda per kata SERAGAM 160 ms (10 kata = 1,6 dtk), lalu "Halo" ditahan sampai duar
  var INTRO_MS = 2500;                         // DURASI TETAP: "duar" selalu tepat di detik ini, apa pun yang terjadi (tanpa mode singkat)

  // tidak ada video yang ditunggu: panggung intro murni gambar + animasi kode
  var mediaReady = true;
  function startPreload(){}
  function playVideo(){}

  var revealed = false;
  function reveal(){
    if (revealed) return; revealed = true;
    p0.classList.add('done');                                   // duar
    playVideo();
    setTimeout(function(){ p0.classList.add('ready'); }, 350);  // tombol Lanjut muncul
    try { sessionStorage.setItem('wahyu-cv-intro', '1'); } catch(e) {}
    document.documentElement.classList.remove('lock');
  }

  if (reduced) { el.textContent = FINAL; startPreload(); p0.classList.add('done','ready'); document.documentElement.classList.remove('lock'); return; }

  document.documentElement.classList.add('lock');
  startPreload();

  // JADWAL TETAP, dihitung dari waktu mulai (bukan rantai timer yang bisa melenceng): kata demi kata, "Halo" ditahan, "duar" tepat di INTRO_MS.
  var t0 = Date.now(), timers = [];
  function at(ms, fn){ timers.push(setTimeout(fn, Math.max(0, ms - (Date.now() - t0)))); }
  window.IntroSkip = function(){ if (revealed) return; timers.forEach(clearTimeout); el.textContent = FINAL; reveal(); };   // hanya untuk pengujian/pemanggilan internal
  var t = 0;
  words.forEach(function(w, i){ at(t, function(){ el.textContent = w; }); t += Math.max(MIN_STEP, START - i * ACCEL); });
  at(t, function(){ el.textContent = FINAL; });
  at(INTRO_MS, reveal);
})();

// rail muncul setelah intro keluar dari layar
(function(){
  var p0 = document.getElementById('p0');
  if (!p0 || !('IntersectionObserver' in window)) { document.body.classList.add('past-intro'); return; }
  new IntersectionObserver(function(entries){
    entries.forEach(function(e){ document.body.classList.toggle('past-intro', !e.isIntersecting); });
  }, {threshold:.5}).observe(p0);
})();

var CVMode = (function(){
  function set(mode, btn){
    document.querySelectorAll('#cvTabs button').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    document.querySelectorAll('.cv-mode').forEach(function(m){ m.classList.toggle('active', m.dataset.mode === mode); });
  }
  return { set: set };
})();

var Theme = (function(){
  function get(){ return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function paint(){
    var seg = document.getElementById('orbTheme'); if (!seg) return;
    seg.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.v === get())); });
  }
  function set(t){
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('wahyu-cv-theme', t); } catch(e) {}
    paint();
  }
  return { get:get, set:set, paint:paint };
})();

// Ganti bahasa ID/EN. Kamus berbasis teks asli (Indonesia) -> Inggris, dicocokkan ke elemen saat init.
var I18N = (function(){
  var DICT = {
    'Lewati intro':'Skip intro',
    'Lanjut':'Continue',
    '03 SKILL':'03 SKILLS','04 KARYA':'04 WORK','05 JEJAK':'05 JOURNEY','06 LAINNYA':'06 MORE','07 KONTAK':'07 CONTACT',
    '<b>DKV × Teknik</b><span class="k-more"> · Singaraja, Bali · Tersedia untuk kolaborasi</span>':'<b>DKV × Tech</b><span class="k-more"> · Singaraja, Bali · Open to collaboration</span>',
    'Lokasi':'Location','Sekolah':'School','Lulus':'Graduating','Tersedia untuk kolaborasi':'Open to collaboration',
    'Siswa DKV yang suka ngoding. Web ini aku bikin sendiri.':'A DKV student who likes coding. I built this site myself.',
    'Unduh CV (PDF)':'Download CV (PDF)',
    'Langsung ke Kontak':'Jump to Contact',
    'Taruh foto-formal.jpg (rasio 4:5) di folder yang sama':'Put foto-formal.jpg (4:5 ratio) in the same folder',
    'Tentang &amp; CV':'About &amp; CV',
    'Ringkas':'Summary','Lengkap':'Full',
    'Suka desain, suka ngoding, dan masih belajar dua-duanya.':'I like design, I like coding, and I’m still learning both.',
    'RINGKASAN':'SUMMARY','FOKUS':'FOCUS','PENDIDIKAN':'EDUCATION','KEAHLIAN':'EXPERTISE','NILAI':'VALUES',
    'Siswa DKV · Tersedia untuk kolaborasi':'DKV student · Open to collaboration',
    'Aku suka desain dan suka bikin web. Situs yang lagi kamu buka ini bikinan sendiri.':'I like design and I like building websites. The site you’re looking at is my own work.',
    'SMKN 3 Singaraja · Lulus 2027 · Singaraja, Bali':'SMKN 3 Singaraja · Graduating 2027 · Singaraja, Bali',
    'Siswa SMKN 3 Singaraja jurusan Desain Komunikasi Visual. Selain desain, aku belajar bikin web sendiri di luar jam sekolah.':'A student at SMKN 3 Singaraja majoring in Visual Communication Design. Besides design, I teach myself web development outside school hours.',
    'SMKN 3 Singaraja, Desain Komunikasi Visual · 2025 sampai 2027':'SMKN 3 Singaraja, Visual Communication Design · 2025 to 2027',
    'Ekosistem Microsoft':'Microsoft ecosystem','Adobe &amp; Kreatif':'Adobe &amp; Creative','Soft Skill':'Soft skills',
    'Teliti, mau belajar, enak diajak kerja bareng.':'Detail-oriented, willing to learn, easy to work with.',
    'Seniman Analitis':'Analytical Artist',
    'Lihat Perjalanan Lengkap →':'See the full journey →',
    'Skill':'Skills','Hardskill':'Hard skills','Softskill':'Soft skills',
    'Portofolio':'Portfolio',
    'Screenshot Web CV Ini':'Screenshot of this CV site',
    '01 / Digital · Sistem':'01 / Digital · Systems',
    'Web CV Personal (Proyek Ini)':'Personal CV Site (This Project)',
    'Dibuat dari nol pakai HTML, CSS, dan JS biasa, tanpa framework.':'Built from scratch with plain HTML, CSS, and JS, no framework.',
    '● Situs yang lagi kamu buka':'● The site you’re on right now',
    'Foto Karya Visual':'Visual work photo',
    'Karya segera hadir':'Work coming soon',
    'Belum ada karya yang dipasang. Menyusul.':'No work posted yet. Coming later.',
    'Segitu dulu karyanya.':'That’s the work so far.',
    'Lanjut ke pengalaman ↓':'On to my experience ↓',
    'Pengalaman':'Experience',
    'Perjalanan singkatku di desain dan web.':'A short look at my path in design and web.',
    '2026 sampai sekarang':'2026 to present','2025 sampai sekarang':'2025 to present',
    'Berlangsung':'Ongoing',
    'Mengerjakan Web CV Ini':'Working on This CV Site',
    'Mengerjakan web CV ini sedikit demi sedikit sambil belajar menyusun kode.':'Working on this CV site bit by bit while learning how to structure code.',
    'Memecah web jadi beberapa bagian: Hero, CV, Skill, Portofolio, dan seterusnya.':'Split the site into sections: Hero, CV, Skills, Portfolio, and so on.',
    'Bikin fitur sticky note: form, penyimpanan, dan dinding notenya.':'Built the sticky note feature: form, storage, and the note wall.',
    'Mendalami desain komunikasi visual: tipografi, layout, identitas visual. Sekaligus mengembangkan sisi teknis secara mandiri di luar jam sekolah.':'Going deeper into visual communication design: typography, layout, visual identity. While independently developing the technical side outside school hours.',
    'Menyelesaikan tugas identitas visual (logo, tipografi, layout) untuk beberapa proyek kelas DKV.':'Completed visual identity assignments (logo, typography, layout) for several DKV class projects.',
    'Mulai Membangun Web CV Personal':'Started Building a Personal CV Site',
    'Pertama kali serius masuk ke dunia web: HTML, CSS, JS dari nol.':'First time seriously entering the web world: HTML, CSS, JS from scratch.',
    'Belajar struktur HTML semantik dan dasar CSS layout lewat coba-coba proyek kecil berulang.':'Learned semantic HTML structure and CSS layout basics through repeated small experiments.',
    'Mulai Belajar Desain':'Started Learning Design',
    'Mulai eksplorasi Adobe Suite. Mulai suka bikin visual.':'Started exploring Adobe Suite. Started to enjoy making visuals.',
    'Menyelesaikan 3 proyek poster kelas pakai Photoshop dan Illustrator dari nol.':'Finished 3 class poster projects with Photoshop and Illustrator from scratch.',
    'Kenali Lebih Jauh':'Get to Know Me More',
    'Analisis':'Analysis','Tulisan':'Writing',
    'Analisis &amp; Hipotesis':'Analysis &amp; Hypotheses',
    'PDF analisis dan catatan belajar. Belum ada isi.':'PDFs of analyses and study notes. Nothing here yet.',
    'Dunia Game':'Gaming World',
    'ID game dan hal-hal seputar game. Belum diisi.':'My game IDs and game-related stuff. Not filled in yet.',
    'Pikiran &amp; Tulisan':'Thoughts &amp; Writing',
    'Tulisan pribadi. Belum ada.':'Personal writing. Nothing yet.',
    'JEJAK PENGUNJUNG':'VISITOR NOTES',
    'Portfolionya keren banget 🔥':'Your portfolio is amazing 🔥',
    'Hybrid DKV × teknik, rare combo':'Hybrid DKV × engineering, rare combo',
    'Singaraja punya talent, keren banget karyanya 🌊':'Singaraja has talent, love the work 🌊',
    'Timeline hidupnya related banget sama aku':'His life timeline really resonates with me',
    'Semangat terus buat portofolionya!':'Keep going with the portfolio!',
    'CV paling niat yang pernah aku liat':'The most thoughtful CV I’ve seen',
    'Tempel Note':'Pin a Note','Tempel':'Pin',
    'Kontak':'Contact',
    'Yuk <em>ngobrol.</em>':'Let’s <em>talk.</em>',
    'Pintasan':'Shortcuts','Beranda':'Home',
    'Tema':'Theme','Terang':'Light','Gelap':'Dark','Bahasa':'Language'
  };
  var PH = [['snFormName','Nama / username','Name / username'],['snFormMsg','Tulis sesuatu...','Write something...']];
  var lang = 'id';
  try { lang = localStorage.getItem('wahyu-cv-lang') === 'en' ? 'en' : 'id'; } catch(e) {}
  var regs = [], notes = [];

  function get(){ return lang; }

  function register(){
    var skip = '.meta-panel,#skillTek,#skillKre,#skillOverview';
    document.querySelectorAll('body *').forEach(function(el){
      if (['SCRIPT','STYLE','svg','path','circle','VIDEO'].indexOf(el.tagName) > -1 || el.closest('svg')) return;
      if (el.closest(skip)) return;
      if (el.parentElement && el.parentElement.closest('[data-i18n-reg]')) return;
      var html = el.innerHTML.trim().replace(/\s+/g, ' ');
      if (Object.prototype.hasOwnProperty.call(DICT, html)) {
        el.setAttribute('data-i18n-reg', '');
        el._id = el.innerHTML; el._en = DICT[html]; regs.push(el);
      }
      if (el.classList.contains('sn') && el.firstChild && el.firstChild.nodeType === 3) {
        var k = el.firstChild.nodeValue.trim();
        if (Object.prototype.hasOwnProperty.call(DICT, k)) notes.push({ node: el.firstChild, id: el.firstChild.nodeValue, en: DICT[k] });
      }
    });
  }

  function paintSeg(){
    var seg = document.getElementById('orbLang'); if (!seg) return;
    seg.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.v === lang)); });
  }

  function apply(l, save){
    lang = l;
    regs.forEach(function(el){ el.innerHTML = l === 'en' ? el._en : el._id; });
    notes.forEach(function(n){ n.node.nodeValue = l === 'en' ? n.en : n.id; });
    PH.forEach(function(p){ var el = document.getElementById(p[0]); if (el) el.placeholder = l === 'en' ? p[2] : p[1]; });
    document.documentElement.lang = l;
    var orb = document.getElementById('orb'), panel = document.getElementById('orbPanel');
    if (orb) orb.setAttribute('aria-label', l === 'en' ? 'Open shortcuts' : 'Buka pintasan');
    if (panel) panel.setAttribute('aria-label', l === 'en' ? 'Shortcuts' : 'Pintasan');
    if (save) { try { localStorage.setItem('wahyu-cv-lang', l); } catch(e) {} }
    paintSeg();
    if (typeof SkillCat !== 'undefined' && SkillCat.rerender) SkillCat.rerender();
  }

  function init(){ register(); apply(lang, false); }
  return { get:get, set:function(l){ apply(l, true); }, init:init };
})();


var SkillCat = (function(){
  var DATA = {
    hard: {
      title:'Hardskill',
      overview:'Hardskill aku dibagi dua. <strong>Teknis</strong>: Microsoft Office dan HTML/CSS. <strong>Kreatif</strong>: Adobe, Canva, CapCut, dan CorelDRAW.',
      tek:[
        {name:'Microsoft Word',lvl:'Mahir',desc:'Dokumen profesional, laporan, dan penulisan terstruktur.',ex:['Laporan tugas sekolah dengan format akademik yang rapi.','Dokumen CV dan surat lamaran atau formal lainnya.']},
        {name:'Microsoft Excel',lvl:'Mahir',desc:'Spreadsheet, analisis data, dan visualisasi angka.',ex:['Rekap dan hitung data kegiatan organisasi atau sekolah.','Anggaran sederhana untuk proyek kelas.']},
        {name:'Microsoft PowerPoint',lvl:'Mahir',desc:'Presentasi profesional dan komunikasi visual terstruktur.',ex:['Slide presentasi untuk tugas kelompok dan individu.','Materi pitch ide atau konsep proyek.']},
        {name:'HTML & CSS',lvl:'Menengah',desc:'Membangun tampilan web dari nol, termasuk web CV ini.',ex:['Membangun seluruh web CV ini dari nol, struktur sampai animasi.','Belajar CSS grid dan transition lewat eksperimen kecil berulang.']}
      ],
      kre:[
        {name:'Adobe Photoshop',lvl:'Mahir',desc:'Photo editing, compositing, dan manipulasi digital.',ex:['Retouching foto profil untuk brand personal dan materi Instagram.','Poster tugas kelas DKV, compositing elemen visual untuk presentasi.']},
        {name:'Adobe Illustrator',lvl:'Mahir',desc:'Desain vektor, ilustrasi, dan identitas visual.',ex:['Logo dan ikon custom untuk proyek identitas visual sekolah.','Elemen grafis vektor yang dipakai di web CV ini.']},
        {name:'CapCut',lvl:'Mahir',desc:'Video editing mobile dan konten kreatif.',ex:['Edit video pendek untuk Instagram dan TikTok pribadi.','Dokumentasi kegiatan sekolah jadi konten singkat.']},
        {name:'Premiere Pro',lvl:'Menengah',desc:'Video editing profesional dan produksi konten.',ex:['Ikut menyunting video profil untuk keperluan sekolah.','Latihan color grading di waktu luang.']},
        {name:'Canva',lvl:'Mahir',desc:'Desain grafis cepat dan presentasi visual.',ex:['Slide presentasi tugas kelompok dengan template konsisten.','Desain feed dan story Instagram pribadi.']},
        {name:'CorelDRAW',lvl:'Menengah',desc:'Desain vektor dan layout publikasi cetak.',ex:['Layout materi cetak sekolah seperti banner dan pamflet.','Eksplorasi teknik vektor alternatif di luar Illustrator.']}
      ]
    },
    soft: {
      title:'Softskill',
      overview:'Softskill aku juga dibagi dua. <strong>Teknis</strong>: cara berpikir dan menyelesaikan masalah. <strong>Kreatif</strong>: bekerja dengan orang lain dan menyampaikan ide.',
      tek:[
        {name:'Berpikir Kritis',lvl:'Mahir',desc:'Memikirkan masalah dulu sebelum bertindak.',ex:['Mempertimbangkan alasan di balik tiap pilihan desain, bukan cuma insting.','Menelusuri akar masalah saat bug muncul, bukan asal coba-coba.']},
        {name:'Analitis',lvl:'Mahir',desc:'Membaca data dan pola sebelum mengambil keputusan.',ex:['Merancang struktur Part-per-Part yang rapi dan mudah diperluas.','Riset referensi desain sebelum menerapkan pola visual baru.']},
        {name:'Problem Solving',lvl:'Mahir',desc:'Mencari jalan keluar saat ada masalah.',ex:['Melacak dan memperbaiki bug carousel yang salah trigger klik.','Mencari pendekatan baru saat satu arah desain mentok.']},
        {name:'Komunikasi',lvl:'Mahir',desc:'Menyampaikan ide dengan jelas.',ex:['Menjelaskan konsep desain ke guru dan teman dengan runtut.','Menyampaikan kebutuhan proyek dengan jelas saat kerja bareng AI.']}
      ],
      kre:[
        {name:'Empati',lvl:'Mahir',desc:'Peka terhadap kebutuhan orang lain.',ex:['Menggali kebutuhan asli di balik permintaan desain sebelum eksekusi.','Peka terhadap dinamika tim saat kerja proyek bersama.']},
        {name:'Kreativitas',lvl:'Mahir',desc:'Mencari ide dan cara baru.',ex:['Merancang konsep dan tampilan web CV ini.','Mencari pendekatan berbeda saat mengerjakan tugas kreatif sekolah.']},
        {name:'Kolaborasi',lvl:'Mahir',desc:'Kerja bareng dan bagi tugas dengan jelas.',ex:['Berbagi peran desain dan eksekusi di tugas kelompok DKV.','Membangun web CV ini secara iteratif bareng AI, Part demi Part.']},
        {name:'Storytelling',lvl:'Menengah',desc:'Menyampaikan pesan lewat cerita.',ex:['Menyusun urutan isi web CV ini dari intro sampai kontak.','Menulis caption yang punya nada dan pesan, bukan cuma deskripsi.']}
      ]
    }
  };

  var SKILL_EN = {
  'Microsoft Word':{d:'Professional documents, reports, and structured writing.',x:['School assignment reports in a clean academic format.','CV documents and application or other formal letters.']},
  'Microsoft Excel':{d:'Spreadsheets, data analysis, and visualizing numbers.',x:['Recapping and calculating organization or school activity data.','Simple budgets for class projects.']},
  'Microsoft PowerPoint':{d:'Professional presentations and structured visual communication.',x:['Presentation slides for group and individual assignments.','Pitch material for ideas or project concepts.']},
  'HTML & CSS':{d:'Building web interfaces from scratch, including this CV site.',x:['Built this entire CV site from scratch, from structure to animation.','Learned CSS grid and transitions through repeated small experiments.']},
  'Adobe Photoshop':{d:'Photo editing, compositing, and digital manipulation.',x:['Retouching profile photos for personal branding and Instagram material.','DKV class assignment posters, compositing visual elements for presentations.']},
  'Adobe Illustrator':{d:'Vector design, illustration, and visual identity.',x:['Custom logos and icons for school visual identity projects.','Vector graphic elements used in this CV site.']},
  'CapCut':{d:'Mobile video editing and creative content.',x:['Editing short videos for personal Instagram and TikTok.','Turning school activity footage into short content.']},
  'Premiere Pro':{d:'Professional video editing and content production.',x:['Co-editing a profile video for school purposes.','Practicing color grading in spare time.']},
  'Canva':{d:'Quick graphic design and visual presentations.',x:['Group assignment slides with consistent templates.','Designing a personal Instagram feed and stories.']},
  'CorelDRAW':{d:'Vector design and print publication layout.',x:['Laying out school print materials such as banners and pamphlets.','Exploring vector techniques outside Illustrator.']},
  'Berpikir Kritis':{n:'Critical Thinking',d:'Thinking a problem through before acting.',x:['Weighing the reasoning behind each design choice, not just instinct.','Tracing root causes when bugs appear, instead of guessing.']},
  'Analitis':{n:'Analytical',d:'Reading data and patterns before making decisions.',x:['Designing a Part-by-Part structure that is clean and easy to extend.','Researching design references before applying a new visual pattern.']},
  'Problem Solving':{d:'Finding a way out when something goes wrong.',x:['Tracking down and fixing a carousel bug that triggered clicks wrongly.','Finding a new approach when one design direction stalls.']},
  'Komunikasi':{n:'Communication',d:'Explaining ideas clearly.',x:['Explaining design concepts to teachers and peers in a clear order.','Stating project needs clearly when working with AI.']},
  'Empati':{n:'Empathy',d:'Being sensitive to what other people need.',x:['Digging into the real need behind a design request before executing.','Staying attuned to team dynamics during group projects.']},
  'Kreativitas':{n:'Creativity',d:'Coming up with new ideas and approaches.',x:['Designing the concept and look of this CV site.','Finding different approaches to creative school assignments.']},
  'Kolaborasi':{n:'Collaboration',d:'Working together and dividing tasks clearly.',x:['Sharing design and execution roles in DKV group assignments.','Building this CV site iteratively with AI, Part by Part.']},
  'Storytelling':{d:'Getting a message across through story.',x:['Ordering the content of this CV site from intro to contact.','Writing captions with tone and message, not just description.']}
};
  var OVERVIEW_EN = {
    hard:'My hard skills split into two. <strong>Technical</strong>: Microsoft Office and HTML/CSS. <strong>Creative</strong>: Adobe, Canva, CapCut, and CorelDRAW.',
    soft:'My soft skills split into two as well. <strong>Technical</strong>: how I think and solve problems. <strong>Creative</strong>: working with others and getting ideas across.'
  };
  var LVL_EN = { 'Mahir':'Proficient', 'Menengah':'Intermediate' };
  var GRP = { id:{tek:'TEKNIS',kre:'KREATIF'}, en:{tek:'TECHNICAL',kre:'CREATIVE'} };
  var curCat = 'hard';

  function rowHTML(item, idx){
    var en = I18N.get() === 'en';
    var tr = en ? SKILL_EN[item.name] : null;
    var name = tr && tr.n ? tr.n : item.name;
    var desc = tr ? tr.d : item.desc;
    var ex = tr ? tr.x : item.ex;
    var lvl = en ? LVL_EN[item.lvl] : item.lvl;
    var n = String(idx+1).padStart(2,'0');
    return '<div class="skill-row">'+
      '<div class="skill-row-head" onclick="SkillCat.toggle(this)">'+
        '<span class="skill-row-num">'+n+'</span>'+
        '<span class="skill-row-name">'+name+'</span>'+
        '<span class="skill-row-lvl"><b>'+lvl+'</b></span>'+
        '<span class="skill-row-plus">+</span>'+
      '</div>'+
      '<div class="skill-row-body"><div class="skill-row-body-in">'+desc+
        '<ul class="dot-list">'+ex.map(function(e){ return '<li>'+e+'</li>'; }).join('')+'</ul>'+
      '</div></div>'+
    '</div>';
  }

  function render(cat){
    curCat = cat;
    var lang = I18N.get(), d = DATA[cat];
    document.getElementById('skillOverview').innerHTML = lang === 'en' ? OVERVIEW_EN[cat] : d.overview;
    document.getElementById('skillTek').innerHTML = '<p class="skill-group-lbl">'+GRP[lang].tek+'</p>' + d.tek.map(rowHTML).join('');
    document.getElementById('skillKre').innerHTML = '<p class="skill-group-lbl">'+GRP[lang].kre+'</p>' + d.kre.map(rowHTML).join('');
  }

  function rerender(){ render(curCat); }

  function toggle(headEl){
    var row = headEl.closest('.skill-row');
    var wasOpen = row.classList.contains('open');
    row.parentElement.querySelectorAll('.skill-row.open').forEach(function(r){ r.classList.remove('open'); });
    if (!wasOpen) row.classList.add('open');
  }

  function set(cat, btn){
    document.querySelectorAll('#skillTabs button').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    render(cat);
  }

  render('hard');
  return { set: set, toggle: toggle, rerender: rerender };

})();

var PE = (function(){
  function tab(name){
    document.querySelectorAll('.exp-tabs button').forEach(function(t){ t.classList.toggle('active', t.dataset.c === name); });
    document.querySelectorAll('.exp-panel').forEach(function(p){ p.classList.toggle('active', p.dataset.c === name); });
  }
  return { tab: tab };
})();

var SNDemo = (function(){
  function toggle(){ document.getElementById('snForm').classList.toggle('open'); }
var KEY = 'wahyu-cv-notes';
  function load(){ try { var a = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(a) ? a : []; } catch(e) { return []; } }
  function store(a){ try { localStorage.setItem(KEY, JSON.stringify(a.slice(-30))); } catch(e) {} }
  function addNote(n){
    var wall = document.querySelector('.sn-wrap');
    var note = document.createElement('div');
    note.className = 'sn ' + (['y','p','b'].indexOf(n.c) > -1 ? n.c : 'y');
    note.style.transform = 'rotate(' + (+n.r || 0) + 'deg)';
    var foot = document.createElement('div');
    foot.className = 'sn-foot'; foot.textContent = n.n || 'anonim';
    note.appendChild(document.createTextNode(n.t)); note.appendChild(foot);
    wall.insertBefore(note, wall.lastElementChild);
  }
  var CFG = window.WAHYU_NOTES || {};
  var remote = !!(CFG.url && CFG.anonKey);          // true = pakai Supabase; false = mode lokal
  var COOLDOWN = 30000, LAST = 'wahyu-cv-notes-last';
  function api(path, opt){
    opt = opt || {};
    opt.headers = Object.assign({ apikey:CFG.anonKey, Authorization:'Bearer ' + CFG.anonKey, 'Content-Type':'application/json' }, opt.headers || {});
    return fetch(CFG.url.replace(/\/$/, '') + '/rest/v1/' + path, opt).then(function(r){
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text().then(function(t){ return t ? JSON.parse(t) : null; });
    });
  }
  function say(idMsg, enMsg){ var m = document.getElementById('snMsg'); if (m) m.textContent = I18N.get() === 'en' ? enMsg : idMsg; }
  function submit(btn){
    var name = document.getElementById('snFormName');
    var msg = document.getElementById('snFormMsg');
    var hp = document.getElementById('snHp');
    if (!msg.value.trim()) { msg.focus(); return; }
    if (hp && hp.value) return;                                      // honeypot: hanya bot yang mengisi
    var last = 0; try { last = +localStorage.getItem(LAST) || 0; } catch(e) {}
    if (Date.now() - last < COOLDOWN) { say('Tunggu sebentar sebelum menempel lagi.', 'Please wait a moment before pinning again.'); return; }
    var n = { t: msg.value.trim(), n: name.value.trim() || 'anonim', c: ['y','p','b'][Math.floor(Math.random()*3)], r: (Math.random()*8-4).toFixed(1) };
    function done(){ burst(btn); name.value = ''; msg.value = ''; try { localStorage.setItem(LAST, String(Date.now())); } catch(e) {} }
    if (remote) {
      // tersimpan di server sebagai "menunggu persetujuan"; baru tampil untuk semua orang setelah kamu setujui
      api('notes', { method:'POST', headers:{ Prefer:'return=minimal' }, body:JSON.stringify({ name:n.n, text:n.t, color:n.c, rot:+n.r }) })
        .then(function(){ done(); say('Terima kasih! Notemu tampil setelah disetujui.', 'Thank you! Your note will appear once approved.'); })
        .catch(function(){ say('Gagal mengirim. Coba lagi nanti.', 'Could not send. Please try again later.'); });
      return;
    }
    addNote(n); var all = load(); all.push(n); store(all); done();
    document.getElementById('snForm').classList.remove('open');
  }
      function burst(fromEl){
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var rect = fromEl.getBoundingClientRect();
    var colors = ['#FFD43B','#FF8FA8','#7CC2FF','#FFE066'];
    for (var i=0;i<14;i++){
      var p = document.createElement('span');
      var angle = Math.random()*Math.PI*2, dist = 40+Math.random()*60;
      p.style.cssText = 'position:fixed;left:'+(rect.left+rect.width/2)+'px;top:'+(rect.top+rect.height/2)+'px;width:6px;height:6px;background:'+colors[i%4]+';border-radius:1px;pointer-events:none;z-index:999;transition:transform .6s cubic-bezier(.16,1,.3,1),opacity .6s ease;opacity:1';
      document.body.appendChild(p);
      requestAnimationFrame((function(el,ang,d){ return function(){ el.style.transform='translate('+(Math.cos(ang)*d)+'px,'+(Math.sin(ang)*d-20)+'px) rotate('+(Math.random()*180)+'deg)'; el.style.opacity='0'; }; })(p,angle,dist));
      setTimeout(function(el){ el.remove(); }, 650, p);
    }
  }
  if (remote) {
    api('notes?select=t:text,n:name,c:color,r:rot&approved=eq.true&order=created_at.desc&limit=30')
      .then(function(rows){ (rows || []).reverse().forEach(addNote); })
      .catch(function(){});
  } else { load().forEach(addNote); }
  return { toggle:toggle, submit:submit };
})();

// ORB PINTASAN: bisa diseret, menempel ke tepi kiri/kanan, posisi diingat, bisa dipakai lewat keyboard
var Orb = (function(){
  var orb = document.getElementById('orb'), panel = document.getElementById('orbPanel');
  if (!orb || !panel) return {};
  var SZ = 48, M = 12, KEY = 'wahyu-cv-orb', SP = 46;   // SP = jarak minimum antar ikon di busur
  var st = { side:'right', y:16 };
  try {
    var sv = JSON.parse(localStorage.getItem(KEY));
    if (sv && (sv.side === 'left' || sv.side === 'right') && typeof sv.y === 'number') st = sv;
  } catch(e) {}
  var open = false, dragging = false, moved = false, dragEnd = 0, sx = 0, sy = 0, ox = 0, oy = 0;

  var ITEMS = [
    {id:'hero',   ic:'M3 11l9-8 9 8M5 10v10h14V10', l:['Beranda','Home']},
    {id:'cv',     ic:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6', l:['Tentang & CV','About & CV']},
    {id:'skill',  ic:'M13 2L4 14h7l-1 8 9-12h-7l1-8z', l:['Skill','Skills']},
    {id:'porto',  ic:'M4 5h16v14H4zM4 15l5-5 5 5 2-2 4 4', l:['Portofolio','Portfolio']},
    {id:'tl',     ic:'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2', l:['Pengalaman','Experience']},
    {id:'exp',    ic:'M12 3l2.6 5.8 6.4.7-4.8 4.3 1.4 6.2L12 17l-5.6 3 1.4-6.2L3 9.5l6.4-.7z', l:['Kenali Lebih Jauh','Get to Know Me']},
    {id:'kontak', ic:'M3 6h18v12H3zM3 7l9 7 9-7', l:['Kontak','Contact']},
    {id:'_theme', l:['Ganti tema','Switch theme']},
    {id:'_lang',  l:['Ganti bahasa','Switch language']}
  ];
  var els = ITEMS.map(function(it, i){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'orb-item'; b.dataset.id = it.id; b.setAttribute('role','menuitem');
    b.style.setProperty('--i', i);
    if (it.id === '_theme') b.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 010 17z" fill="currentColor"/></svg>';
    else if (it.id !== '_lang') b.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + it.ic + '"/></svg>';
    panel.appendChild(b);
    return b;
  });
  function paint(){
    var en = I18N.get() === 'en';
    ITEMS.forEach(function(it, i){ els[i].setAttribute('data-label', it.l[en ? 1 : 0]); els[i].setAttribute('aria-label', it.l[en ? 1 : 0]); });
    els[els.length - 1].textContent = I18N.get().toUpperCase();
  }

  function railW(){ return window.innerWidth > 900 ? 64 : 0; }
  function clampY(y){ return Math.max(M, Math.min(window.innerHeight - SZ - M, y)); }
  function xFor(side){ return side === 'left' ? railW() + M : window.innerWidth - SZ - M; }
  function place(){ orb.style.left = xFor(st.side) + 'px'; orb.style.top = clampY(st.y) + 'px'; }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e) {} }

  // Dua tingkat busur: dalam 4 ikon, luar 5 ikon. Bentuk busur mengikuti ruang tersisa:
  // setengah lingkaran di tengah tepi layar, seperempat di pojok. Radius dibesarkan seperlunya.
  var RINGS = [[0,1,2,3],[4,5,6,7,8]], GAP = 52;
  function layout(){
    var r = orb.getBoundingClientRect(), cx = r.left + SZ / 2, cy = r.top + SZ / 2;
    var W = window.innerWidth, H = window.innerHeight, L = st.side === 'left' ? railW() : 0, m = 26;
    var base = st.side === 'right' ? 180 : 0;
    function span(R){
      function ok(a){ var t = a * Math.PI / 180, x = cx + R * Math.cos(t), y = cy + R * Math.sin(t); return x >= L + m && x <= W - m && y >= m && y <= H - m; }
      var up = 0, dn = 0;
      while (up < 90 && ok(base - up - 1)) up++;
      while (dn < 90 && ok(base + dn + 1)) dn++;
      return { a0: base - up, a1: base + dn, deg: up + dn };
    }
    function fits(R, sp, n){ return R * sp.deg * Math.PI / 180 / (n - 1) >= SP; }
    var R1, s1, s2;
    for (R1 = 64; R1 <= 170; R1 += 4) {
      s1 = span(R1); s2 = span(R1 + GAP);
      if (fits(R1, s1, RINGS[0].length) && fits(R1 + GAP, s2, RINGS[1].length)) break;
    }
    [[R1, s1, RINGS[0]], [R1 + GAP, s2, RINGS[1]]].forEach(function(g){
      var R = g[0], sp = g[1], idx = g[2], n = idx.length, pts = [];
      for (var k = 0; k < n; k++) { var a = (sp.a0 + (sp.a1 - sp.a0) * k / (n - 1)) * Math.PI / 180; pts.push({ x:R * Math.cos(a), y:R * Math.sin(a) }); }
      pts.sort(function(p, q){ return p.y - q.y; });
      pts.forEach(function(p, i){ var el = els[idx[i]]; el.style.setProperty('--x', p.x.toFixed(1) + 'px'); el.style.setProperty('--y', p.y.toFixed(1) + 'px'); });
    });
    panel.style.left = cx + 'px'; panel.style.top = cy + 'px'; panel.dataset.side = st.side;
  }

  var tipEl = null;
  function clearTip(){ if (tipEl) tipEl.classList.remove('tip', 'sel'); tipEl = null; panel.classList.remove('has-sel'); }
  function select(b){ clearTip(); tipEl = b; b.classList.add('sel'); panel.classList.add('has-sel'); }
  function setOpen(v, returnFocus, kbd){
    open = v; clearTip();
    if (v) orb.classList.remove('hint');
    orb.setAttribute('aria-expanded', String(v));
    if (v) {
      layout(); panel.classList.add('open');
      if (kbd) setTimeout(function(){ els[0].focus({ preventScroll:true }); }, 30);
    } else {
      panel.classList.remove('open');
      if (returnFocus) orb.focus({ preventScroll:true });
    }
  }

  function go(id){
    var el = document.getElementById(id); if (!el) return;
    if (document.documentElement.classList.contains('lock') && window.IntroSkip) {
      window.IntroSkip();
      setTimeout(function(){ el.scrollIntoView({ behavior:'smooth' }); }, 900);
    } else { el.scrollIntoView({ behavior:'smooth' }); }
  }

  orb.addEventListener('pointerdown', function(e){
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true; moved = false; sx = e.clientX; sy = e.clientY;
    var r = orb.getBoundingClientRect(); ox = r.left; oy = r.top;
    try { orb.setPointerCapture(e.pointerId); } catch(err) {}
  });
  orb.addEventListener('pointermove', function(e){
    if (!dragging) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.hypot(dx, dy) > 6) { moved = true; orb.classList.add('dragging'); if (open) setOpen(false); }
    if (moved) {
      orb.style.left = Math.max(4, Math.min(window.innerWidth - SZ - 4, ox + dx)) + 'px';
      orb.style.top  = Math.max(4, Math.min(window.innerHeight - SZ - 4, oy + dy)) + 'px';
    }
  });
  function endDrag(e){
    if (!dragging) return;
    dragging = false;
    try { orb.releasePointerCapture(e.pointerId); } catch(err) {}
    if (moved) {
      var r = orb.getBoundingClientRect();
      st.side = (r.left + SZ / 2) < window.innerWidth / 2 ? 'left' : 'right';
      st.y = clampY(r.top);
      orb.classList.remove('dragging');
      place(); save(); dragEnd = Date.now();
    }
  }
  orb.addEventListener('pointerup', endDrag);
  orb.addEventListener('pointercancel', endDrag);
  orb.addEventListener('click', function(e){ if (Date.now() - dragEnd < 350) return; setOpen(!open, false, e.detail === 0); });

  orb.addEventListener('keydown', function(e){
    var k = e.key, used = true;
    if (k === 'ArrowLeft') st.side = 'left';
    else if (k === 'ArrowRight') st.side = 'right';
    else if (k === 'ArrowUp') st.y = clampY(st.y - 40);
    else if (k === 'ArrowDown') st.y = clampY(st.y + 40);
    else used = false;
    if (used) { e.preventDefault(); if (open) setOpen(false); place(); save(); }
  });

  panel.addEventListener('click', function(e){
    var b = e.target.closest('.orb-item'); if (!b) return;
    var id = b.dataset.id;
    if (id === '_theme') { Theme.set(Theme.get() === 'dark' ? 'light' : 'dark'); return; }
    if (id === '_lang') { I18N.set(I18N.get() === 'en' ? 'id' : 'en'); paint(); return; }
    // sentuh/pena: ketukan pertama memilih (ikon menyala, label + panah), ketukan kedua pada ikon yang sama berpindah
    if (e.detail !== 0 && (lastPT === 'touch' || lastPT === 'pen') && b !== tipEl) { select(b); return; }
    setOpen(false); go(id);
  });
  // label: mouse = hover; sentuh = lewat status terpilih (lihat select)
  panel.addEventListener('pointerover', function(e){ if (e.pointerType !== 'mouse') return; var b = e.target.closest('.orb-item'); if (b) b.classList.add('hv'); });
  panel.addEventListener('pointerout', function(e){ var b = e.target.closest('.orb-item'); if (b) b.classList.remove('hv'); });
  var lastPT = 'mouse';
  panel.addEventListener('pointerdown', function(e){ lastPT = e.pointerType; });
  panel.addEventListener('keydown', function(e){
    var i = els.indexOf(document.activeElement); if (i < 0) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); els[(i + 1) % els.length].focus(); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); els[(i - 1 + els.length) % els.length].focus(); }
  });
  document.addEventListener('pointerdown', function(e){
    if (open && !panel.contains(e.target) && !orb.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && open) setOpen(false, true); });
  window.addEventListener('resize', function(){ place(); if (open) layout(); });

  if ('IntersectionObserver' in window) {
    var links = {};
    els.forEach(function(b){ if (b.dataset.id.charAt(0) !== '_') links[b.dataset.id] = b; });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ var a = links[en.target.id]; if (a) a.classList.toggle('active', en.isIntersecting); });
    }, { rootMargin:'-40% 0px -40% 0px' });
    Object.keys(links).forEach(function(id){ var el = document.getElementById(id); if (el) io.observe(el); });
  }

  function home(){ st.side = 'right'; st.y = (window.innerHeight - SZ) / 2; place(); save(); }   // kanan tengah
  place(); paint();
  return { place:place, home:home };
})();

// Orb lahir di Hero setelah "Lanjut" ditekan, satu rangkaian yang saling menyambung (±1,6 detik):
// POP di tengah -> langsung meluncur (sonic boom halus) -> riak menyapu dan memunculkan Hero -> mendarat di kanan tengah.
// Semua efek memakai satu bahasa visual: cincin tipis warna aksen. Tidak memblokir scroll maupun klik.
(function(){
  var root = document.documentElement;
  var wrap = document.getElementById('orbWrap'), orb = document.getElementById('orb'), fx = document.getElementById('orbFx');
  var btn = document.getElementById('p0Scroll'), p0 = document.getElementById('p0');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function showHero(){ root.classList.remove('hero-wait'); }
  if (!wrap || !orb || !Orb.home) { showHero(); return; }
  if (!fx || !orb.animate || reduced) { showHero(); Orb.home(); wrap.classList.add('ready'); return; }
  var started = false, RS = 480;
  function mk(css, parent){ var i = document.createElement('i'); i.style.cssText = css; (parent || fx).appendChild(i); return i; }
  function bz(s){ var u = 1 - s; return [3*u*u*s*.2 + 3*u*s*s*.25 + s*s*s, 3*u*u*s*.7 + 3*u*s*s + s*s*s]; }   // kurva riak (.2,.7,.25,1)
  function tFor(y, dur){ var lo = 0, hi = 1; for (var k = 0; k < 24; k++) { var m = (lo + hi) / 2; if (bz(m)[1] < y) lo = m; else hi = m; } return bz((lo + hi) / 2)[0] * dur; }
  function ring(x, y, size, from, to, dur, op){
    return mk('width:' + size + 'px;height:' + size + 'px;margin:' + (-size / 2) + 'px 0 0 ' + (-size / 2) + 'px;left:' + x + 'px;top:' + y + 'px;opacity:0;box-sizing:border-box;border:1px solid var(--accent)')
      .animate([{ transform:'scale(' + from + ')', opacity:op }, { transform:'scale(' + to + ')', opacity:0 }], { duration:dur, easing:'cubic-bezier(.2,.7,.25,1)', fill:'forwards' });
  }
  function charge(){
    if (started) return; started = true;
    if (btn) { btn.style.transition = 'opacity .2s ease'; btn.style.opacity = '0'; btn.style.pointerEvents = 'none'; }   // tombol memudar saat diklik
    orb.style.transition = 'none'; Orb.home(); void orb.offsetWidth; orb.style.transition = '';
    var r = orb.getBoundingClientRect(), fx0 = r.left + r.width / 2, fy0 = r.top + r.height / 2;
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, dx = mx - fx0, dy = my - fy0, vx = -dx, vy = -dy, ph = Math.atan2(vy, vx) + 'rad';
    var maxD = Math.hypot(Math.max(mx, window.innerWidth - mx), Math.max(my, window.innerHeight - my));
    var smax = maxD / (RS / 2) * 1.05;
    // 1) POP: orb muncul membal kecil di tengah, satu cincin tipis ikut mekar
    orb.style.translate = dx + 'px ' + dy + 'px';
    wrap.classList.add('ready'); orb.classList.add('flying');
    orb.animate([{ opacity:0, scale:'.3' }, { opacity:1, scale:'1.12', offset:.6 }, { opacity:1, scale:'1' }], { duration:450, easing:'cubic-bezier(.23,1,.32,1)', fill:'backwards' });
    ring(mx, my, 90, .6, 2.2, 650, .4);
    // 2) BOOM: dari posisi pop, orb langsung meluncur; riak menyapu dan Hero muncul bersamanya
    setTimeout(function(){
      var D = 950, E = 'cubic-bezier(.45,0,.1,1)';
      orb.style.translate = '';
      var fl = orb.animate([
        { translate:dx + 'px ' + dy + 'px', rotate:ph, scale:'1 1' },
        { rotate:ph, scale:'1.28 .86', offset:.25 },
        { rotate:ph, scale:'1.06 .97', offset:.65 },
        { translate:'0px 0px', rotate:ph, scale:'1 1' }], { duration:D, easing:E });
      ring(mx, my, RS, .1, smax, 1000, .35);
      showHero();
      document.querySelectorAll('#hero .rv').forEach(function(e){
        e.classList.add('on');
        var b = e.getBoundingClientRect(), d = Math.hypot(b.left + b.width / 2 - mx, b.top + b.height / 2 - my);
        var y = Math.max(0, Math.min(1, (d / (RS / 2) - .1) / (smax - .1)));
        e.animate([{ opacity:0, transform:'translateY(8px)' }, { opacity:1, transform:'none' }], { duration:520, delay:tFor(y, 1000) * .8, easing:'cubic-bezier(.23,1,.32,1)', fill:'backwards' });
      });
      // dua garis tipis kerucut Mach mengikuti orb
      var w = mk('left:' + mx + 'px;top:' + my + 'px;width:0;height:0;border-radius:0');
      w.animate([{ transform:'translate(0,0) rotate(' + ph + ')' }, { transform:'translate(' + vx + 'px,' + vy + 'px) rotate(' + ph + ')' }], { duration:D, easing:E, fill:'forwards' });
      [14, -14].forEach(function(rot){
        mk('position:absolute;left:-110px;top:-.5px;width:110px;height:1px;transform-origin:100% 50%;opacity:0;background:linear-gradient(to left,var(--accent),transparent)', w)
          .animate([{ transform:'rotate(' + rot + 'deg) scaleX(.1)', opacity:0 }, { transform:'rotate(' + rot + 'deg) scaleX(1)', opacity:.55, offset:.25 }, { transform:'rotate(' + rot + 'deg) scaleX(.3)', opacity:.25, offset:.65 }, { transform:'rotate(' + rot + 'deg) scaleX(0)', opacity:0 }], { duration:D, easing:E, fill:'forwards' });
      });
      // 3) MENDARAT: orb berhenti di kanan tengah, denyut petunjuk memakai cincin yang sama
      fl.onfinish = function(){ orb.classList.remove('flying'); orb.classList.add('hint'); setTimeout(function(){ fx.textContent = ''; }, 500); };
    }, 560);
  }
  // pemicu utama: tombol "Lanjut". Cadangan: pengunjung scroll sendiri keluar dari thumbnail.
  function check(){
    if (started) return;
    if (p0 && p0.getBoundingClientRect().bottom < window.innerHeight * 0.5) { window.removeEventListener('scroll', check); charge(); }
  }
  window.addEventListener('scroll', check, { passive:true });
  if (btn) btn.addEventListener('click', charge);
  // coba scroll di thumbnail: tombol "Lanjut" menyentak halus, mengajak diklik
  ['wheel', 'touchmove'].forEach(function(ev){
    window.addEventListener(ev, function(){ if (started || !btn || !btn.offsetParent) return; btn.classList.remove('nudge'); void btn.offsetWidth; btn.classList.add('nudge'); }, { passive:true });
  });
})();

// aria-pressed mengikuti class "active" pada semua tab
(function(){
  document.querySelectorAll('.tabs button, .exp-tabs button').forEach(function(b){
    function sync(){ b.setAttribute('aria-pressed', String(b.classList.contains('active'))); }
    sync(); new MutationObserver(sync).observe(b, { attributes:true, attributeFilter:['class'] });
  });
})();

I18N.init();
