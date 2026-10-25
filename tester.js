// ═══════════════════════════════════════════════════════════════
// ██████████████  AUDIO MANAGER GLOBAL (AM)  ████████████████████
// ─────────────────────────────────────────────────────────────
// WAJIB di paling atas script.js — Part 0 butuh AM saat init
// ═══════════════════════════════════════════════════════════════

var AM = (function () {
  'use strict';

  var s = {
    ambientOn:  false,
    musicOn:    false,
    musicVol:   0.50,
    ambientVol: 0.18,
    trackIdx:   0,
    duration:   0,
    musicReady: false,
    audioReady: false,
  };

  // ✏️ EDIT: Isi nama file audio (tanpa .mp3, tanpa path)
  var audioFiles = ['string-theory'];

  var tracks = audioFiles.map(function (name) {
    return {
      title:  name.replace(/-/g, ' '),
      artist: '—',
      src:    'assets/audio/' + name + '.mp3',
    };
  });

  // ── Helper elemen ──
  function _ambEl() { return document.getElementById('audio'); }
  function _musEl()  { return document.getElementById('p1PlAudio'); }

  // ── AMBIENT ──
  function toggleAmbient() {
    var a = _ambEl();
    if (!a) return;
    if (!s.audioReady) { a.volume = s.ambientVol; s.audioReady = true; }
    if (s.ambientOn) {
      a.pause(); s.ambientOn = false;
    } else {
      if (s.musicOn) _pauseMusic();
      a.play().catch(function () {});
      s.ambientOn = true;
    }
    _syncUI();
  }

  function _pauseAmbient() {
    var a = _ambEl();
    if (a && s.ambientOn) { a.pause(); s.ambientOn = false; _syncUI(); }
  }

  // ── AUTO START — dipanggil dari W.enter() saat user interaction ──
  function autoStart() {
    if (tracks.length === 0) return;
    if (s.musicOn) return;

    _injectAudioEl();
    var m = _musEl();
    if (!m) return;

    if (!s.musicReady) { m.volume = s.musicVol; s.musicReady = true; }
    if (s.ambientOn) _pauseAmbient();

    if (!m.src || m.src === window.location.href) {
      _loadTrackSilent(0);
    }

    // ✅ FIX: pill "playing" cuma muncul kalau play() BENERAN berhasil — bukan optimis.
    // Sebelumnya UI langsung nunjukin "playing" walau file 404, jadi nutupin konten di baliknya.
    var playPromise = m.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        s.musicOn = true;
        _setPlayUI(true);
        _syncUI();
      }).catch(function () {
        s.musicOn = false;
        _setPlayUI(false);
        _syncUI();
      });
    }
  }

  // ── TOGGLE MUSIC — dari hamburger ──
  function toggleMusic() {
    if (tracks.length === 0) {
      alert('✏️ Playlist belum diisi — tambahkan lagu di variabel audioFiles di Audio Manager.');
      return;
    }
    var m = _musEl();
    if (!m) return;
    if (!s.musicReady) { m.volume = s.musicVol; s.musicReady = true; }
    if (s.musicOn) {
      _pauseMusic();
    } else {
      if (s.ambientOn) _pauseAmbient();
      var playPromise = m.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          s.musicOn = true;
          _setPlayUI(true);
          _syncUI();
        }).catch(function () {
          alert('⚠️ File audio tidak ditemukan. Cek path di variabel audioFiles.');
          s.musicOn = false;
          _setPlayUI(false);
          _syncUI();
        });
      }
    }
  }

  function _pauseMusic() {
    var m = _musEl();
    if (m) m.pause();
    s.musicOn = false;
    _setPlayUI(false);
    _syncUI();
  }

  // ── TRACK MANAGEMENT ──
  function _loadTrackSilent(idx) {
    if (!tracks.length) return;
    s.trackIdx = (idx + tracks.length) % tracks.length;
    var t = tracks[s.trackIdx];
    var m = _musEl();
    if (!m) return;
    m.src = t.src; m.load(); s.duration = 0;
    _updatePillTitle(t.title);
  }

  function loadTrack(idx) {
    if (!tracks.length) return;
    s.trackIdx = (idx + tracks.length) % tracks.length;
    var t = tracks[s.trackIdx];
    var m = _musEl();
    if (!m) return;
    m.src = t.src; m.load(); s.duration = 0;
    _updatePillTitle(t.title);
    _updateProg(0); _updateTime(0, 0);
    if (s.musicOn) m.play().catch(function () {});
  }

  function nextTrack() { loadTrack(s.trackIdx + 1); }
  function prevTrack() { loadTrack(s.trackIdx - 1); }

  function setMusicVol(val) {
    s.musicVol = val / 100;
    var m = _musEl();
    if (m) m.volume = s.musicVol;
  }

  function seek(e) {
    var m    = _musEl();
    var wrap = document.querySelector('.p1-pl-prog');
    if (!m || !wrap || !s.duration) return;
    var rect  = wrap.getBoundingClientRect();
    var ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    m.currentTime = ratio * s.duration;
    _updateProg(ratio * 100);
  }

  // ── UI HELPERS ──
  function _updateProg(pct) {
    var el = document.getElementById('p1PlFill');
    if (el) el.style.width = pct + '%';
  }

  function _updateTime(cur, dur) {
    var c = document.getElementById('p1PlCur');
    var d = document.getElementById('p1PlDur');
    if (c) c.textContent = _fmt(cur);
    if (d) d.textContent = _fmt(dur);
  }

  function _fmt(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    return Math.floor(sec / 60) + ':' + ('0' + Math.floor(sec % 60)).slice(-2);
  }

  function _updatePillTitle(title) {
    var el = document.getElementById('p1PillTitle');
    if (el) el.textContent = title || '—';
  }

  function _setPlayUI(on) {
    var pill = document.getElementById('p1Pill');
    if (pill) pill.classList.toggle('playing', on);
  }

  function _syncUI() {
    var musicBtn = document.getElementById('p1GcMusic');
    if (musicBtn) musicBtn.classList.toggle('on', s.musicOn);
    var p0s = document.getElementById('soundBtn');
    if (p0s) p0s.classList.toggle('on', s.ambientOn);
  }

  // ── INJECT ELEMEN AUDIO ──
  function _injectAudioEl() {
    if (document.getElementById('p1PlAudio')) return;
    var audio = document.createElement('audio');
    audio.id = 'p1PlAudio';
    audio.preload = 'none';
    audio.loop = false;
    document.body.appendChild(audio);
  }

  // ── INIT EVENTS ── (dipanggil dari W.enter() saat preload)
  function initMusicEvents() {
    _injectAudioEl();
    var m = _musEl();
    if (!m) return;
    m.addEventListener('timeupdate', function () {
      if (!s.duration) return;
      var pct = (m.currentTime / s.duration) * 100;
      _updateProg(pct);
      _updateTime(m.currentTime, s.duration);
    });
    m.addEventListener('loadedmetadata', function () {
      s.duration = m.duration;
      _updateTime(0, m.duration);
    });
    m.addEventListener('ended', nextTrack);
    if (tracks.length > 0) {
      _loadTrackSilent(0);
    }
  }

  // ── PUBLIC API ──
  return {
    toggleAmbient: toggleAmbient,
    toggleMusic:   toggleMusic,
    autoStart:     autoStart,
    nextTrack:     nextTrack,
    prevTrack:     prevTrack,
    setMusicVol:   setMusicVol,
    seek:          seek,
    initMusic:     initMusicEvents,
    get musicOn()   { return s.musicOn; },
    get ambientOn() { return s.ambientOn; },
  };

})();


// ═══════════════════════════════════════════════════════════════
// ██████████████████████  PART 0 — LOGIN SCREEN  ████████████████
// ═══════════════════════════════════════════════════════════════

var W = (function () {
  'use strict';

  var s = {
    // ✅ Baca dari attribute HTML — sudah di-set inline script di <head> (OS/localStorage)
    lang:    document.documentElement.getAttribute('data-lang')  || 'id',
    theme:   document.documentElement.getAttribute('data-theme') || 'light',
    sound:   false,
    audioOk: false,
    entered: false,
    lowEnd:  false,
  };

  // ── DETECT DEVICE ──
  function detect() {
    var cores = navigator.hardwareConcurrency || 4;
    var mem   = navigator.deviceMemory || 4;
    var ua    = navigator.userAgent;

    // Win 7 = Chrome max ver 109
    var chromeVer   = (ua.match(/Chrome\/(\d+)/) || [])[1];
    var isOldChrome = chromeVer && parseInt(chromeVer) < 110;
    var isWin7      = /Windows NT 6\.[01]/.test(ua);

    s.lowEnd = (cores <= 2) || (mem <= 2) || isOldChrome || isWin7;

    if (s.lowEnd) document.documentElement.classList.add('no-blur');
  }

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', function () {
    detect();
    initClock();
    initParticles();
    initParallax();
    initKeyboard();
    initRipple();
    initMagnetic();
    initSpotlight();
    updateMetaTheme();
    _syncThemeLangUI(); // ✅ sinkronkan icon tema (☀/○) & label bahasa dengan hasil deteksi OS/localStorage
    revealUI();
    _initBgFade();
    if (typeof SN !== 'undefined' && SN.init) SN.init();
  });

  // ── MAGNETIC HOVER — tombol utama "tertarik" ke kursor. Desktop-only, skip di lowEnd. ──
  function initMagnetic() {
    if (s.lowEnd) return;
    if (!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    var sel = '.enter, .p2-btn, .p5-back, .p6-back, .pe-back, .sn-icon, .cmdk-trigger, .p1-cr-cta, .p1-exp-cta, .p1-cvf-tl-cta';
    document.querySelectorAll(sel).forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var relX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var relY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        el.style.transform = 'translate(' + (relX * 6).toFixed(1) + 'px,' + (relY * 6).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  // ── SPOTLIGHT — highlight radial ikut kursor di kartu ber-class .spotlight ──
  // Event delegation di document — otomatis kerja juga buat strip P3 yang dibuat belakangan.
  function initSpotlight() {
    if (s.lowEnd) return;
    if (!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    document.addEventListener('mousemove', function (e) {
      var el = e.target.closest ? e.target.closest('.spotlight') : null;
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', x + '%');
      el.style.setProperty('--my', y + '%');
    }, { passive: true });
  }

  // Sinkronkan tampilan toggle tema & bahasa di topbar dengan state s (dipanggil sekali di awal)
  function _syncThemeLangUI() {
    var ico = document.getElementById('themeIco');
    if (ico) ico.textContent = s.theme === 'dark' ? '○' : '☀';
    var lbl = document.getElementById('langLbl');
    if (lbl) lbl.textContent = s.lang === 'id' ? 'EN' : 'ID';
  }

  // Fade in background photo P0 setelah load
  function _initBgFade() {
    var bg = document.getElementById('bgPhoto');
    if (!bg) return;
    if (bg.complete && bg.naturalWidth > 0) {
      // Sudah di-cache browser — fade in singkat
      requestAnimationFrame(function () {
        bg.classList.add('loaded');
      });
    } else {
      bg.addEventListener('load', function () {
        bg.classList.add('loaded');
      });
      bg.addEventListener('error', function () {
        // Gagal load — tetap tambah class agar tidak blank
        bg.classList.add('loaded');
      });
    }
  }

  // ── REVEAL UI — urutan animasi sinematik ──
  function revealUI() {
    var topbar  = document.getElementById('topbar');
    var clock   = document.getElementById('clock');
    var card    = document.getElementById('card');
    var hint    = document.getElementById('hint');
    var decos   = document.querySelectorAll('.deco');
    var bubbles = document.querySelectorAll('.bubble');
    var noAnim  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(el, ms) {
      setTimeout(function () {
        if (!el) return;
        el.classList.add('show');
        if (noAnim) el.style.opacity = '1';
      }, noAnim ? 0 : ms);
    }

    if (noAnim) {
      show(topbar, 0); show(clock, 0); show(card, 0); show(hint, 0);
      decos.forEach(function (d)   { d.style.opacity = '1'; });
      bubbles.forEach(function (b) { b.classList.add('show'); });
      return;
    }

    // Fase 0: napas sinematik (0–80ms)
    // Fase 1: chrome UI
    show(topbar, 80);
    show(clock,  200);
    // Fase 2: corner deco (stagger)
    decos.forEach(function (d, i) {
      setTimeout(function () {
        d.style.transition = 'opacity .60s cubic-bezier(.16,1,.3,1)';
        d.style.opacity = '1';
      }, 160 + i * 70);
    });
    // Fase 3: card
    show(card, 350);
    // Fase 4: hint (paling akhir)
    show(hint, 950);
    // Fase 5: bubbles (stagger)
    bubbles.forEach(function (b, i) {
      setTimeout(function () { b.classList.add('show'); }, 680 + i * 150);
    });
  }

  // ── CLOCK ──
  function initClock() {
    function tick() {
      var now = new Date();
      var ct  = document.getElementById('ct');
      var cd  = document.getElementById('cd');
      if (!ct || !cd) return;
      ct.textContent = now.toLocaleTimeString('id-ID', { hour12: false });
      var offset = now.getTimezoneOffset();
      var zona   = offset === -480 ? 'WITA' : offset === -420 ? 'WIB' : offset === -540 ? 'WIT' : 'UTC' + (offset < 0 ? '+' : '') + (-offset / 60);
      cd.textContent = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + zona;
    }
    tick();
    setInterval(tick, 1000);
  }

  // ── PARTICLES — adaptive ──
  function initParticles() {
    var canvas = document.getElementById('cv');
    if (!canvas) return;

    if (s.lowEnd || window.innerWidth < 480) {
      canvas.style.display = 'none';
      return;
    }

    var ctx = canvas.getContext('2d');
    var W_, H_, pts = [], raf;

    function resize() {
      W_ = canvas.width  = window.innerWidth;
      H_ = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var count = Math.min(26, Math.floor(window.innerWidth / 40));
    for (var i = 0; i < count; i++) {
      pts.push({
        x:  Math.random() * window.innerWidth,
        y:  Math.random() * window.innerHeight,
        vx: (Math.random() - .5) * .20,
        vy: (Math.random() - .5) * .20,
        r:  Math.random() * 1.2 + .4,
        a:  Math.random() * .28 + .07,
        c:  Math.random() > .5 ? '#4A90D9' : '#C8A96E',
      });
    }

    var DIST2 = 8100;
    function draw() {
      ctx.clearRect(0, 0, W_, H_);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x = (p.x + p.vx + W_) % W_;
        p.y = (p.y + p.vy + H_) % H_;
        ctx.globalAlpha = p.a;
        ctx.fillStyle   = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.lineWidth   = 0.5;
      ctx.strokeStyle = '#4A90D9';
      for (var i = 0; i < pts.length - 1; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x;
          var dy = pts[i].y - pts[j].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < DIST2) {
            ctx.globalAlpha = (1 - d2 / DIST2) * .055;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    draw();

    // Pause saat tab tidak aktif
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    });
  }

  // ── PARALLAX — foto background, skip di lowEnd ──
  function initParallax() {
    if (s.lowEnd) return;
    var photo = document.getElementById('bgPhoto');
    if (!photo) return;

    var tx = 0, ty = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth  - .5) * 10;
      ty = (e.clientY / window.innerHeight - .5) * 10;
    }, { passive: true });

    function anim() {
      cx += (tx - cx) * .05;
      cy += (ty - cy) * .05;
      photo.style.transform = 'translate(' + (cx * .5) + 'px,' + (cy * .5) + 'px) scale(1.06)';
      requestAnimationFrame(anim);
    }
    anim();
  }

  // ── RIPPLE — micro-interaction tombol masuk ──
  function initRipple() {
    var btn = document.getElementById('enterBtn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      var ep   = btn.querySelector('.ep');
      if (!ep) return;
      var rect = btn.getBoundingClientRect();
      ep.style.left = (e.clientX - rect.left) + 'px';
      ep.style.top  = (e.clientY - rect.top) + 'px';
      ep.classList.remove('ripple');
      void ep.offsetWidth; // force reflow
      ep.classList.add('ripple');
    });
  }

  // ── KEYBOARD — tekan Enter ──
  function initKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.repeat && !s.entered) W.enter();
    });
  }

  // ── META THEME COLOR ──
  function updateMetaTheme() {
    var meta = document.getElementById('metaTheme');
    if (!meta) return;
    meta.content = s.theme === 'dark' ? '#111A2C' : '#B4BECC';
  }

  // ── TOGGLE THEME ──
  function toggleTheme() {
    s.theme = s.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', s.theme);
    var ico = document.getElementById('themeIco');
    if (ico) ico.textContent = s.theme === 'dark' ? '○' : '☀';
    updateMetaTheme();
    try { localStorage.setItem('wahyu-cv-theme', s.theme); } catch (e) { /* private mode dll */ }
    if (typeof P1 !== 'undefined' && P1.sync) P1.sync();
  }

  // ── TOGGLE BAHASA ──
  function toggleLang() {
    s.lang = s.lang === 'id' ? 'en' : 'id';
    document.documentElement.setAttribute('data-lang', s.lang);
    document.documentElement.setAttribute('lang', s.lang); // ✅ FIX: lang attribute sekarang ikut sync
    var lbl = document.getElementById('langLbl');
    if (lbl) lbl.textContent = s.lang === 'id' ? 'EN' : 'ID';

    document.querySelectorAll('[data-id]').forEach(function (el) {
      var v = s.lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
      if (v !== null) el.textContent = v;
    });

    try { localStorage.setItem('wahyu-cv-lang', s.lang); } catch (e) { /* private mode dll */ }

    if (typeof P1 !== 'undefined' && P1.sync) P1.sync();
    if (typeof SN !== 'undefined' && SN.sync) SN.sync();
    if (typeof P4 !== 'undefined' && P4.sync) P4.sync();
    if (typeof P5 !== 'undefined' && P5.sync) P5.sync();
    if (typeof P6 !== 'undefined' && P6.sync) P6.sync();
    if (typeof PE !== 'undefined' && PE.sync) PE.sync();
  }

  // ── TOGGLE SOUND (Ambient) ──
  function toggleSound() {
    var audio = document.getElementById('audio');
    var btn   = document.getElementById('soundBtn');
    if (!audio || !btn) return;

    if (!s.audioOk) { audio.volume = .18; s.audioOk = true; }

    if (s.sound) {
      audio.pause();
      btn.classList.remove('on');
      s.sound = false;
    } else {
      audio.play().catch(function () {});
      btn.classList.add('on');
      s.sound = true;
    }
  }

  // ── ENTER — Transisi ke Part 1 ──
  function enter() {
    if (s.entered) return;
    s.entered = true;
    document.body.classList.add('entered'); // ✅ munculkan floating cmdk-trigger, sembunyikan tombol search topbar Part 0

    var overlay = document.getElementById('overlay');
    var btn     = document.getElementById('enterBtn');
    var hint    = document.getElementById('hint');
    var p1      = document.getElementById('p1');
    var card    = document.getElementById('card');
    var topbar  = document.getElementById('topbar');
    var clock   = document.getElementById('clock');

    // Preload musik saat user interaction
    if (typeof AM !== 'undefined' && AM.initMusic) AM.initMusic();

    // Step 1: Sembunyikan hint dan disable tombol
    if (hint) { hint.style.transition = 'opacity .2s ease'; hint.style.opacity = '0'; }
    if (btn)  { btn.disabled = true; btn.classList.add('firing'); }

    // Step 2: Overlay show dengan transisi cepat (.25s)
    if (overlay) {
      overlay.style.transition = 'opacity .25s var(--ease)';
      overlay.classList.add('show');
    }

    // Step 3: Setelah overlay penuh menutup (280ms),
    //         sembunyikan P0 dan init P1 di balik overlay
    setTimeout(function () {

      if (card)   { card.style.display   = 'none'; }
      if (topbar) { topbar.style.display = 'none'; }
      if (clock)  { clock.style.display  = 'none'; }

      if (p1) {
        p1.removeAttribute('hidden');
        requestAnimationFrame(function () {
          p1.classList.add('active');
          if (typeof P1 !== 'undefined' && P1.init) P1.init();

          // Step 4: Beri P1 waktu 80ms untuk mulai render animasinya,
          //         lalu buka overlay perlahan (.55s) — terasa seperti curtain terbuka
          setTimeout(function () {
            if (overlay) {
              overlay.style.transition = 'opacity .55s var(--ease)';
              overlay.classList.remove('show');
            }
          }, 80);
        });
      }

      // Auto start musik
      setTimeout(function () {
        if (typeof AM !== 'undefined' && AM.autoStart) AM.autoStart();
      }, 300);

    }, 280);
  }

  // ── PUBLIC API ──
  return { theme: toggleTheme, lang: toggleLang, sound: toggleSound, enter: enter };

})();


// ═══════════════════════════════════════════════════════════════
// ██████████████████  PART 1 — HALAMAN UTAMA  ████████████████████
// ═══════════════════════════════════════════════════════════════

var P1 = (function () {
  'use strict';

  var s = {
    navOpen: false,
    cvMode:  'short',
    obs:     null,
    sections: [],
    curSec:  0,
  };

  // ════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════
  function init() {
    var p1 = document.getElementById('p1');
    if (!p1) return;

    _initHero();
    _initCV();
    _initObserver();
    _initCarousel();
    _syncAll();
  }

  // ── HERO — foto fade saat scroll ──
  function _initHero() {
    var scroll = document.getElementById('p1Scroll');
    var img    = document.getElementById('p1HeroImg');
    if (!scroll || !img) return;

    // Fade in hero image setelah load
    function _heroLoaded() {
      requestAnimationFrame(function () {
        img.classList.add('loaded');
      });
    }
    if (img.complete && img.naturalWidth > 0) {
      _heroLoaded();
    } else {
      img.addEventListener('load',  _heroLoaded);
      img.addEventListener('error', _heroLoaded); // tetap muncul meski gambar error
    }

    // Throttle scroll dengan RAF — tidak fire tiap pixel, hanya tiap frame
    var ticking = false;
    scroll.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var y  = scroll.scrollTop;
          var vh = window.innerHeight;
          if (y < vh) {
            var r = y / vh;
            // Hanya ubah transform saat scroll, opacity dikontrol .loaded class
            var currentOpacity = parseFloat(img.style.opacity);
            if (isNaN(currentOpacity)) currentOpacity = 1;
            img.style.opacity   = Math.max(0, 1 - r * 1.3);
            img.style.transform = 'scale(' + (1 + r * 0.06) + ')';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── CV MODE — tampilkan tab Sekilas saat init ──
  function _initCV() {
    var el = document.getElementById('p1CvShort');
    if (el) {
      el.style.display = 'grid';
      setTimeout(function () { el.classList.add('vis'); }, 80);
    }
  }

  // ── CV TAB — smooth transition antar Sekilas / Lengkap ──
  function setCvTab(mode) {
    if (s.cvMode === mode) return;

    var sh = document.getElementById('p1CvShort');
    var fl = document.getElementById('p1CvFull');
    var ts = document.getElementById('p1TabShort');
    var tf = document.getElementById('p1TabFull');

    var fromEl    = mode === 'short' ? fl : sh;
    var toEl      = mode === 'short' ? sh : fl;
    var toDisplay = mode === 'short' ? 'grid' : 'block';

    // Update tab button langsung
    if (mode === 'short') {
      if (ts) ts.classList.add('active');
      if (tf) tf.classList.remove('active');
    } else {
      if (tf) tf.classList.add('active');
      if (ts) ts.classList.remove('active');
    }

    // Jika tidak ada elemen aktif — langsung tampil
    if (!fromEl || fromEl.style.display === 'none' || !fromEl.classList.contains('vis')) {
      if (fromEl) { fromEl.style.display = 'none'; fromEl.classList.remove('vis', 'fade-out'); }
      if (toEl)   { toEl.style.display = toDisplay; setTimeout(function () { toEl.classList.add('vis'); }, 20); }
      s.cvMode = mode;
      return;
    }

    // Ada elemen aktif — fade-out dulu, lalu fade-in
    fromEl.classList.remove('vis');
    fromEl.classList.add('fade-out');

    setTimeout(function () {
      fromEl.style.display = 'none';
      fromEl.classList.remove('fade-out');

      if (toEl) {
        toEl.classList.remove('vis');
        toEl.style.display = toDisplay;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            toEl.classList.add('vis');
          });
        });
      }
      s.cvMode = mode;
    }, 240);
  }

  // ── INTERSECTION OBSERVER — elemen masuk viewport ──
  function _initObserver() {
    if (!('IntersectionObserver' in window)) return;

    s.obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('vis');
          s.obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll('#p1 .p1-pg, #p1 .p1-exp-grid, #p1 .p1-sp-wrap, #p1 .p1-cm-wrap').forEach(function (el) {
      s.obs.observe(el);
    });
  }


  // ════════════════════════════════════════
  // CAROUSEL PORTOFOLIO
  // ════════════════════════════════════════
  var cr = {
    track:    null,
    slides:   [],
    dots:     [],
    total:    0,
    current:  0,
    timer:    null,
    interval: 3500,
    dragging: false,
    isDragged: false, // ✅ FIX: flag beda dari 'dragging' — true kalau gerakan sudah lewat threshold klik
    dragStartX: 0,
    dragDeltaX: 0,
    paused:   false,
  };

  function _initCarousel() {
    setTimeout(function () {
      cr.track  = document.getElementById('p1CrTrack');
      if (!cr.track) return;

      cr.slides = Array.from(cr.track.querySelectorAll('.p1-cr-slide'));
      cr.total  = cr.slides.length;
      if (cr.total === 0) return;

      _crBuildDots();
      _crGoTo(0, false);
      _crStartAuto();
      _crInitDrag();
      _crInitHoverPause();
    }, 350);
  }

  function _crBuildDots() {
    var container = document.getElementById('p1CrDots');
    if (!container) return;
    container.innerHTML = '';
    cr.dots = [];

    cr.slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'p1-cr-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function () { _crGoTo(i); });
      container.appendChild(dot);
      cr.dots.push(dot);
    });
  }

  function _crGoTo(idx, animate) {
    if (animate === undefined) animate = true;
    cr.current = (idx + cr.total) % cr.total;

    if (!animate) cr.track.style.transition = 'none';
    cr.track.style.transform = 'translateX(-' + (cr.current * 100) + '%)';
    if (!animate) {
      cr.track.offsetHeight; // force reflow
      cr.track.style.transition = '';
    }

    cr.dots.forEach(function (d, i) {
      d.classList.toggle('active', i === cr.current);
    });

    var prev = document.getElementById('p1CrPrev');
    var next = document.getElementById('p1CrNext');
    if (prev) prev.style.opacity = '1';
    if (next) next.style.opacity = '1';
  }

  function _crStartAuto() {
    if (cr.timer) clearInterval(cr.timer);
    cr.timer = setInterval(function () {
      if (!cr.paused && !cr.dragging) _crGoTo(cr.current + 1);
    }, cr.interval);
  }

  function _crStopAuto() {
    if (cr.timer) { clearInterval(cr.timer); cr.timer = null; }
  }

  function _crInitHoverPause() {
    var wrap = document.getElementById('p1CrWrap');
    if (!wrap) return;
    wrap.addEventListener('mouseenter', function () { cr.paused = true; });
    wrap.addEventListener('mouseleave', function () { cr.paused = false; });
  }

  function _crInitDrag() {
    var wrap = document.getElementById('p1CrWrap');
    if (!wrap) return;

    var DRAG_THRESHOLD = 6; // px — lewat ini dianggap drag, bukan klik

    // ✅ FIX: cegat klik di fase capture kalau barusan drag — supaya onclick="P1.go('porto')"
    // di slide tidak ikut ke-trigger saat user sebenarnya lagi geser carousel.
    wrap.addEventListener('click', function (e) {
      if (cr.isDragged) {
        e.stopPropagation();
        e.preventDefault();
        cr.isDragged = false;
      }
    }, true);

    // Touch
    wrap.addEventListener('touchstart', function (e) {
      cr.dragStartX = e.touches[0].clientX;
      cr.dragging   = true;
      cr.isDragged  = false;
      _crStopAuto();
    }, { passive: true });
    wrap.addEventListener('touchmove', function (e) {
      if (!cr.dragging) return;
      cr.dragDeltaX = e.touches[0].clientX - cr.dragStartX;
      if (Math.abs(cr.dragDeltaX) > DRAG_THRESHOLD) cr.isDragged = true;
    }, { passive: true });
    wrap.addEventListener('touchend', function () {
      if (!cr.dragging) return;
      cr.dragging = false;
      if (Math.abs(cr.dragDeltaX) > 30) {
        if (cr.dragDeltaX < 0) _crGoTo(cr.current + 1);
        else                    _crGoTo(cr.current - 1);
      }
      cr.dragDeltaX = 0;
      _crStartAuto();
    });

    // Mouse (desktop drag)
    wrap.addEventListener('mousedown', function (e) {
      cr.dragStartX = e.clientX;
      cr.dragging   = true;
      cr.isDragged  = false;
      _crStopAuto();
    });
    window.addEventListener('mousemove', function (e) {
      if (!cr.dragging) return;
      cr.dragDeltaX = e.clientX - cr.dragStartX;
      if (Math.abs(cr.dragDeltaX) > DRAG_THRESHOLD) cr.isDragged = true;
    });
    window.addEventListener('mouseup', function () {
      if (!cr.dragging) return;
      cr.dragging = false;
      if (Math.abs(cr.dragDeltaX) > 40) {
        if (cr.dragDeltaX < 0) _crGoTo(cr.current + 1);
        else                    _crGoTo(cr.current - 1);
      }
      cr.dragDeltaX = 0;
      _crStartAuto();
      // Reset isDragged di akhir microtask — biar click listener (capture) di atas sempat baca dulu
      setTimeout(function () { cr.isDragged = false; }, 0);
    });

    // Keyboard
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { _crGoTo(cr.current - 1); _crStartAuto(); }
      if (e.key === 'ArrowRight') { _crGoTo(cr.current + 1); _crStartAuto(); }
    });
  }

  // Fungsi public carousel (dipanggil dari HTML onclick)
  function crPrev() { _crGoTo(cr.current - 1); _crStartAuto(); }
  function crNext() { _crGoTo(cr.current + 1); _crStartAuto(); }

  // ════════════════════════════════════════
  // SKILL — hover description box
  // ════════════════════════════════════════
  var SK_DATA = {
    soft: {
      icon:     '🤝',
      id:       'Komunikasi, kepemimpinan, kreativitas, empati — cara saya berinteraksi dengan manusia dan dunia.',
      en:       'Communication, leadership, creativity, empathy — how I interact with people and the world.',
      chips_id: ['Komunikasi', 'Empati', 'Analitis', 'Kolaborasi'],
      chips_en: ['Communication', 'Empathy', 'Analytical', 'Collaboration'],
      hint_id:  'Klik untuk jelajahi →',
      hint_en:  'Click to explore →',
    },
    hard: {
      icon:     '⚙️',
      id:       'Tools, software, platform, teknik — ilmu yang bisa diukur, dibuktikan, dan dikembangkan.',
      en:       'Tools, software, platforms, techniques — knowledge that can be measured, proven, and built upon.',
      chips_id: ['Adobe Suite', 'Microsoft 365', 'Visual Design', 'Coding'],
      chips_en: ['Adobe Suite', 'Microsoft 365', 'Visual Design', 'Coding'],
      hint_id:  'Klik untuk jelajahi →',
      hint_en:  'Click to explore →',
    },
  };

  // Cache elemen desc box (query sekali saja)
  var _skBox = null, _skInner = null, _skText = null, _skChips = null, _skHint = null;

  function _skCache() {
    if (_skBox) return;
    _skBox   = document.getElementById('p1SkDescBox');
    _skInner = document.getElementById('p1SkDescInner');
    _skText  = document.getElementById('p1SkDescText');
    _skChips = document.getElementById('p1SkDescChips');
    _skHint  = document.getElementById('p1SkDescHint');
  }

  function skHover(type) {
    _skCache();
    if (!_skBox || !_skInner) return;

    var lang = document.documentElement.getAttribute('data-lang') || 'id';
    var d    = SK_DATA[type];
    if (!d) return;

    var iconEl = document.getElementById('p1SkDescIcon');
    if (iconEl)  iconEl.textContent = d.icon;
    if (_skText) _skText.textContent = lang === 'en' ? d.en : d.id;

    if (_skChips) {
      _skChips.innerHTML = '';
      var chips = lang === 'en' ? d.chips_en : d.chips_id;
      for (var i = 0; i < chips.length; i++) {
        var chip = document.createElement('span');
        chip.className   = 'p1-sk-desc-chip';
        chip.textContent = chips[i];
        _skChips.appendChild(chip);
      }
    }

    if (_skHint) _skHint.textContent = lang === 'en' ? d.hint_en : d.hint_id;

    _skInner.setAttribute('data-type', type);
    _skInner.classList.add('visible');
  }

  function skLeave() {
    _skCache();
    if (_skInner) _skInner.classList.remove('visible');
  }

  // ════════════════════════════════════════
  // NAVIGASI
  // ════════════════════════════════════════

  // Scroll ke section dalam P1
  function scrollTo(id) {
    if (s.navOpen) toggleNav();
    var map = {
      hero:    'p1Hero',
      cv:      'p1CV',
      skill:   'p1Skill',
      porto:   'p1Porto',
      explore: 'p1Explore',
      comment: 'p1Comment',
      contact: 'p1Contact',
    };
    var el     = document.getElementById(map[id] || id);
    var scroll = document.getElementById('p1Scroll');
    if (el && scroll) scroll.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  }

  // Pindah ke Part lain (page transition)
  function go(target) {
    if (s.navOpen) toggleNav();
    var overlay = document.getElementById('p1Overlay');
    if (overlay) overlay.classList.add('show');

    setTimeout(function () {
      if (target === 'softskill' || target === 'hardskill') {
        var ctx = target === 'softskill' ? 'soft' : 'hard';
        var p2El = document.getElementById('p2');
        if (p2El) {
          p2El.removeAttribute('hidden');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              if (typeof P2 !== 'undefined' && P2.init) P2.init(ctx);
              setTimeout(function () {
                if (overlay) overlay.classList.remove('show');
              }, 300);
            });
          });
        }
      } else if (target === 'porto') {
        if (typeof P6 !== 'undefined' && P6.init) P6.init();
        setTimeout(function () { if (overlay) overlay.classList.remove('show'); }, 300);
      } else if (target === 'explore' || target === 'exp') {
        if (typeof PE !== 'undefined' && PE.init) PE.init();
        setTimeout(function () { if (overlay) overlay.classList.remove('show'); }, 300);
      } else {
        if (overlay) overlay.classList.remove('show');
      }
    }, 520);
  }

  // Toggle hamburger nav
  function toggleNav() {
    s.navOpen = !s.navOpen;
    var nav = document.getElementById('p1Nav');
    var ham = document.getElementById('p1Ham');
    if (!nav || !ham) return;

    nav.classList.toggle('open', s.navOpen);
    nav.setAttribute('aria-hidden', String(!s.navOpen));
    ham.setAttribute('aria-expanded', String(s.navOpen));
    ham.classList.toggle('nav-open', s.navOpen);

    if (s.navOpen) _syncAll();
  }

  // ════════════════════════════════════════
  // KOMENTAR
  // ════════════════════════════════════════
  function submitComment() {
    var nEl = document.getElementById('p1CmName');
    var mEl = document.getElementById('p1CmMsg');
    if (!nEl || !mEl) return;

    var name = nEl.value.trim();
    var msg  = mEl.value.trim();
    if (!name) { nEl.focus(); _shake(nEl); return; }
    if (!msg)  { mEl.focus(); _shake(mEl); return; }

    // ✏️ EDIT: Ganti dengan Firebase saat sudah siap — SN.addNote() yang nempelin ke wall
    if (typeof SN !== 'undefined' && SN.addNote) SN.addNote(name, msg);

    nEl.value = ''; mEl.value = '';
  }

  function _shake(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'p1Shake .4s ease';
    el.addEventListener('animationend', function () { el.style.animation = ''; }, { once: true });
  }

  function _esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ════════════════════════════════════════
  // SYNC GLOBAL — tema & bahasa
  // ════════════════════════════════════════
  function _syncAll() {
    var theme = document.documentElement.getAttribute('data-theme') || 'light';
    var lang  = document.documentElement.getAttribute('data-lang')  || 'id';

    var tIco = document.getElementById('p1GcTheme');
    var lLbl = document.getElementById('p1GcLang');
    if (tIco) tIco.textContent = theme === 'dark' ? '○' : '☀';
    if (lLbl) lLbl.textContent = lang  === 'id'   ? 'EN' : 'ID';

    var mBtn = document.getElementById('p1GcMusic');
    if (mBtn) mBtn.classList.toggle('on', AM.musicOn);

    _syncLang(lang);
  }

  function _syncLang(lang) {
    if (!lang) lang = document.documentElement.getAttribute('data-lang') || 'id';
    document.querySelectorAll('#p1 [data-id]').forEach(function (el) {
      var v = lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll('#p1 [data-ph-id]').forEach(function (el) {
      el.placeholder = lang === 'id'
        ? el.getAttribute('data-ph-id')
        : el.getAttribute('data-ph-en');
    });
  }

  // ── PUBLIC API ──
  return {
    init:    init,
    nav:     toggleNav,
    go:      go,
    to:      scrollTo,
    cvTab:   setCvTab,
    comment: submitComment,
    sync:    _syncAll,
    skHover: skHover,
    skLeave: skLeave,
    crPrev:  crPrev,
    crNext:  crNext,
  };

})();

// Inject keyframe shake untuk validasi form komentar
(function () {
  var style = document.createElement('style');
  style.textContent = '@keyframes p1Shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}';
  document.head.appendChild(style);
})();


// ═══════════════════════════════════════════════════════════════
// ████████████████  PART 2 dst — JS DI BAWAH SINI  ████████████
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ████████████████████  PART 2 — SKILL HUB  V7  ██████████████
// ─────────────────────────────────────────────────────────────
// Paste di script.js — di bawah sekat Part 1
// ═══════════════════════════════════════════════════════════════

var P2 = (function () {
  'use strict';

  var s = {
    ctx:     'soft',   // 'soft' | 'hard'
    navOpen: false,
    lowEnd:  false,
    sections: [],
  };

  // ════════════════════════════════════════
  // DATA KONTEN
  // ════════════════════════════════════════
  var DATA = {

    soft: {
      title_id: 'Softskill',   title_en: 'Softskill',
      tag_id:   'Cara saya berinteraksi, berpikir, dan tumbuh bersama dunia di luar layar.',
      tag_en:   'How I interact, think, and grow with the world beyond the screen.',
      desc_id:  'Softskill saya tumbuh dari dua arah yang saling menguatkan — <strong>sisi teknis</strong> yang terlatih berpikir sistematis dan kritis, serta <strong>sisi kreatif</strong> yang peka terhadap manusia, konteks, dan nuansa yang tidak selalu bisa diukur angka.',
      desc_en:  'My soft skills grow from two mutually reinforcing directions — a <strong>technical side</strong> trained to think systematically and critically, and a <strong>creative side</strong> attuned to people, context, and nuances that cannot always be measured.',
      // 3 chip teknis + 3 chip kreatif = 6 total
      chips_id: ['Analitis', 'Problem Solving', 'Komunikasi', 'Empati', 'Kreativitas', 'Kolaborasi'],
      chips_en: ['Analytical', 'Problem Solving', 'Communication', 'Empathy', 'Creativity', 'Collaboration'],
      orb_a: 'rgba(74,144,217,.16)', orb_b: 'rgba(200,169,110,.12)', orb_c: 'rgba(74,144,217,.09)',

      tek_desc_id:  'Kemampuan berpikir yang terstruktur, logis, dan dapat dikomunikasikan. Fondasi dari setiap keputusan yang saya buat.',
      tek_desc_en:  'Thinking abilities that are structured, logical, and communicable. The foundation of every decision I make.',
      tek_chips_id: ['Berpikir Kritis', 'Analitis', 'Problem Solving', 'Manajemen Waktu'],
      tek_chips_en: ['Critical Thinking', 'Analytical', 'Problem Solving', 'Time Management'],

      kre_desc_id:  'Kemampuan manusiawi yang tumbuh dari kepekaan. Mendengar yang tidak diucapkan dan berkolaborasi tanpa ego.',
      kre_desc_en:  'Human abilities that grow from sensitivity. Hearing what is unsaid and collaborating without ego.',
      kre_chips_id: ['Empati', 'Kreativitas', 'Kolaborasi', 'Adaptasi', 'Storytelling'],
      kre_chips_en: ['Empathy', 'Creativity', 'Collaboration', 'Adaptability', 'Storytelling'],

      // ✏️ EDIT: 3 simbol Teknis (kiri) — ganti SVG dengan ilustrasi/icon pilihan kamu
      symbols_tek: [
        { label_id: 'Analitis', label_en: 'Analytical',
          svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' },
        { label_id: 'Problem\nSolving', label_en: 'Problem\nSolving',
          svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' },
        { label_id: 'Komunikasi', label_en: 'Communication',
          svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
      ],
      // ✏️ EDIT: 3 simbol Kreatif (kanan)
      symbols_kre: [
        { label_id: 'Empati', label_en: 'Empathy',
          svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' },
        { label_id: 'Kreativitas', label_en: 'Creativity',
          svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' },
        { label_id: 'Kolaborasi', label_en: 'Collaboration',
          svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' },
      ],
    },

    hard: {
      title_id: 'Hardskill',   title_en: 'Hardskill',
      tag_id:   'Tools, teknik, dan platform yang saya kuasai — bisa diukur, dibuktikan, dan terus dikembangkan.',
      tag_en:   'Tools, techniques, and platforms I master — measurable, provable, and continuously developed.',
      desc_id:  'Hardskill saya lahir dari dua dunia yang tidak biasa berdampingan. <strong>Sisi teknis</strong> — ekosistem Microsoft, logika data, dan cara kerja yang terstruktur. <strong>Sisi kreatif</strong> — Adobe Suite, desain visual, dan kemampuan membuat sesuatu yang tidak hanya benar, tapi juga indah dan komunikatif.',
      desc_en:  'My hard skills come from two worlds that rarely coexist. The <strong>technical side</strong> — Microsoft ecosystem, data logic, and structured workflows. The <strong>creative side</strong> — Adobe Suite, visual design, and the ability to create something not just correct, but also beautiful and communicative.',
      // 3 chip teknis + 3 chip kreatif = 6 total
      chips_id: ['Microsoft 365', 'HTML & CSS', 'Logika Data', 'Adobe Suite', 'Tipografi', 'Visual Design'],
      chips_en: ['Microsoft 365', 'HTML & CSS', 'Data Logic', 'Adobe Suite', 'Typography', 'Visual Design'],
      orb_a: 'rgba(200,169,110,.16)', orb_b: 'rgba(0,85,165,.12)', orb_c: 'rgba(200,169,110,.09)',

      tek_desc_id:  'Kemampuan teknikal yang saya bangun secara mandiri. Dari spreadsheet yang berbicara data, hingga kode yang membangun pengalaman digital.',
      tek_desc_en:  'Technical skills I built independently. From spreadsheets that speak data, to code that builds digital experiences.',
      tek_chips_id: ['Microsoft Word', 'Excel', 'PowerPoint', 'HTML & CSS', 'Logika Data'],
      tek_chips_en: ['Microsoft Word', 'Excel', 'PowerPoint', 'HTML & CSS', 'Data Logic'],

      kre_desc_id:  'Di sinilah sisi DKV saya paling hidup. Setiap elemen visual adalah keputusan tentang warna, ruang, hierarki, dan pesan.',
      kre_desc_en:  'This is where my DKV side comes alive. Every visual element is a decision about color, space, hierarchy, and message.',
      kre_chips_id: ['Photoshop', 'Illustrator', 'Tipografi', 'Layout', 'Identitas Visual'],
      kre_chips_en: ['Photoshop', 'Illustrator', 'Typography', 'Layout', 'Visual Identity'],

      // 3 tool Teknis (kiri) + 3 tool Kreatif (kanan)
      tools_tek: [
        { name: 'Word',  url: 'https://cdn.simpleicons.org/microsoftword/2B579A',  fb: 'Wd' },
        { name: 'Excel', url: 'https://cdn.simpleicons.org/microsoftexcel/217346', fb: 'Ex' },
        { name: 'HTML5', url: 'https://cdn.simpleicons.org/html5/E34F26',          fb: 'Ht' },
      ],
      tools_kre: [
        { name: 'Photoshop',   url: 'https://cdn.simpleicons.org/adobephotoshop/31A8FF',   fb: 'Ps' },
        { name: 'Illustrator', url: 'https://cdn.simpleicons.org/adobeillustrator/FF9A00', fb: 'Ai' },
        { name: 'CSS3',        url: 'https://cdn.simpleicons.org/css3/1572B6',             fb: 'Cs' },
      ],
    },
  };

  // ════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════
  function init(ctx) {
    s.ctx    = ctx || 'soft';
    var cores = navigator.hardwareConcurrency || 4;
    var mem   = navigator.deviceMemory || 4;
    s.lowEnd  = (cores <= 2) || (mem <= 2);

    var el = document.getElementById('p2');
    if (!el) return;

    el.removeAttribute('hidden');
    el.className = el.className.replace(/ctx-\w+/g, '').trim();
    el.classList.add('ctx-' + s.ctx);

    var scroll = document.getElementById('p2Scroll');
    if (scroll) scroll.scrollTop = 0;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('active');
        _populateAll();
        _syncAll();
      });
    });
  }

  // ════════════════════════════════════════
  // POPULATE
  // ════════════════════════════════════════
  function _populateAll() {
    var lang = document.documentElement.getAttribute('data-lang') || 'id';
    var d    = DATA[s.ctx];
    if (!d) return;
    _populateZ1(d, lang);
    _populateZ2(d, lang);
  }

  function _populateZ1(d, lang) {
    // Breadcrumb nav
    _setEl('p2NavCtxCur', function (el) { el.textContent = lang === 'id' ? d.title_id : d.title_en; });
    // Judul
    _setEl('p2Z1Title', function (el) {
      el.textContent = lang === 'id' ? d.title_id : d.title_en;
      if (typeof FX !== 'undefined' && FX.scramble) FX.scramble(el);
    });
    // Tagline
    _setEl('p2Z1Tag', function (el) { el.textContent = lang === 'id' ? d.tag_id : d.tag_en; });
    // Deskripsi (innerHTML — ada <strong>)
    _setEl('p2Z1Desc', function (el) { el.innerHTML = lang === 'id' ? d.desc_id : d.desc_en; });

    // Chips — 6, seragam
    var chipsEl = document.getElementById('p2Z1Chips');
    if (chipsEl) {
      chipsEl.innerHTML = '';
      (lang === 'id' ? d.chips_id : d.chips_en).forEach(function (chip) {
        var span = document.createElement('span');
        span.className   = 'p2-z1-chip';
        span.textContent = chip;
        chipsEl.appendChild(span);
      });
    }

    // Orb colors
    if (!s.lowEnd) {
      _setEl('p2OrbA', function (el) { el.style.background = d.orb_a; });
      _setEl('p2OrbB', function (el) { el.style.background = d.orb_b; });
      _setEl('p2OrbC', function (el) { el.style.background = d.orb_c; });
    }

    // Logos
    _buildLogos(d, lang);
  }

  function _buildLogos(d, lang) {
    var logos = document.getElementById('p2Z1Logos');
    if (!logos) return;
    logos.innerHTML = '';

    var row     = document.createElement('div');  row.className = 'p2-logos-row';
    var sideTek = document.createElement('div');  sideTek.className = 'p2-logos-side';
    var sep     = document.createElement('div');  sep.className = 'p2-logos-sep';
    var sideKre = document.createElement('div');  sideKre.className = 'p2-logos-side';

    if (s.ctx === 'hard') {
      d.tools_tek.forEach(function (t) { sideTek.appendChild(_mkTool(t)); });
      d.tools_kre.forEach(function (t) { sideKre.appendChild(_mkTool(t)); });
    } else {
      d.symbols_tek.forEach(function (sym) { sideTek.appendChild(_mkSymbol(sym, lang)); });
      d.symbols_kre.forEach(function (sym) { sideKre.appendChild(_mkSymbol(sym, lang)); });
    }

    row.appendChild(sideTek);
    row.appendChild(sep);
    row.appendChild(sideKre);
    logos.appendChild(row);
  }

  function _mkTool(tool) {
    var item = document.createElement('div');  item.className = 'p2-logo-item';
    var ico  = document.createElement('div');
    var img  = document.createElement('img');
    img.src = tool.url;  img.alt = tool.name;  img.width = img.height = 26;
    img.onerror = function () {
      ico.innerHTML = '';
      var fb = document.createElement('span');
      fb.className   = 'p2-logo-fb';
      fb.textContent = tool.fb;
      ico.appendChild(fb);
    };
    ico.appendChild(img);
    var nm = document.createElement('span');  nm.textContent = tool.name;
    item.appendChild(ico);  item.appendChild(nm);
    return item;
  }

  function _mkSymbol(sym, lang) {
    var box = document.createElement('div');  box.className = 'p2-ss-symbol';
    var ico = document.createElement('div');  ico.className = 'p2-ss-symbol-ico';
    ico.innerHTML = sym.svg;
    var lbl = document.createElement('span');  lbl.className = 'p2-ss-symbol-lbl';
    lbl.textContent = lang === 'id' ? sym.label_id : sym.label_en;
    box.appendChild(ico);  box.appendChild(lbl);
    return box;
  }

  function _populateZ2(d, lang) {
    // Info box Teknis
    _setEl('p2InfoTekDesc', function (el) { el.textContent = lang === 'id' ? d.tek_desc_id : d.tek_desc_en; });
    _buildChips('p2InfoTekChips', lang === 'id' ? d.tek_chips_id : d.tek_chips_en);
    // Info box Kreatif
    _setEl('p2InfoKreDesc', function (el) { el.textContent = lang === 'id' ? d.kre_desc_id : d.kre_desc_en; });
    _buildChips('p2InfoKreChips', lang === 'id' ? d.kre_chips_id : d.kre_chips_en);
    // Nama tombol
    document.querySelectorAll('#p2 .p2-btn-name').forEach(function (el) {
      var v = lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
      if (v) el.textContent = v;
    });
  }

  function _buildChips(elId, chips) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '';
    chips.forEach(function (chip) {
      var span = document.createElement('span');
      span.className   = 'p2-info-chip';
      span.textContent = chip;
      el.appendChild(span);
    });
  }


  // ════════════════════════════════════════
  // NAVIGASI
  // ════════════════════════════════════════
  function go(type) {
    var overlay = document.getElementById('p2Overlay');
    if (overlay) overlay.classList.add('show');
    setTimeout(function () {
      P3.init(s.ctx, type);
      setTimeout(function () {
        if (overlay) overlay.classList.remove('show');
      }, 300);
    }, 200);
  }

  function back() {
    var overlay = document.getElementById('p2Overlay');
    var p2El    = document.getElementById('p2');
    var p1El    = document.getElementById('p1');
    if (overlay) overlay.classList.add('show');
    if (s.navOpen) _closeNav();
    setTimeout(function () {
      if (p2El) {
        p2El.classList.remove('active', 'ctx-soft', 'ctx-hard');
        setTimeout(function () { p2El.setAttribute('hidden', ''); }, 300);
      }
      if (p1El) { p1El.style.opacity = '1'; p1El.style.pointerEvents = 'all'; }
      setTimeout(function () { if (overlay) overlay.classList.remove('show'); }, 100);
    }, 520);
  }

  function scrollTo(zone) {
    if (s.navOpen) toggleNav();
    var map = { z1: 'p2Z1', z2: 'p2Z2' };
    var el     = document.getElementById(map[zone] || zone);
    var scroll = document.getElementById('p2Scroll');
    if (el && scroll) scroll.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  }

  function toggleNav() {
    s.navOpen = !s.navOpen;
    var nav = document.getElementById('p2Nav');
    var ham = document.getElementById('p2Ham');
    if (!nav || !ham) return;
    nav.classList.toggle('open', s.navOpen);
    nav.setAttribute('aria-hidden', String(!s.navOpen));
    ham.setAttribute('aria-expanded', String(s.navOpen));
    ham.classList.toggle('nav-open', s.navOpen);
    if (s.navOpen) _syncAll();
  }

  function _closeNav() {
    s.navOpen = false;
    var nav = document.getElementById('p2Nav');
    var ham = document.getElementById('p2Ham');
    if (nav) { nav.classList.remove('open'); nav.setAttribute('aria-hidden', 'true'); }
    if (ham) { ham.setAttribute('aria-expanded', 'false'); ham.classList.remove('nav-open'); }
  }

  // ════════════════════════════════════════
  // SYNC TEMA & BAHASA
  // ════════════════════════════════════════
  function _syncAll() {
    var theme = document.documentElement.getAttribute('data-theme') || 'light';
    var lang  = document.documentElement.getAttribute('data-lang')  || 'id';
    _setEl('p2GcTheme', function (el) { el.textContent = theme === 'dark' ? '○' : '☀'; });
    _setEl('p2GcLang',  function (el) { el.textContent = lang  === 'id'   ? 'EN' : 'ID'; });
    document.querySelectorAll('#p2 [data-id]').forEach(function (el) {
      var v = lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
      if (v !== null) el.textContent = v;
    });
    _populateAll();
  }

  // Helpers
  function _setEl(id, fn) { var el = document.getElementById(id); if (el) fn(el); }

  // ── PUBLIC API ──
  return {
    init:     init,
    go:       go,
    back:     back,
    nav:      toggleNav,
    scrollTo: scrollTo,
    sync:     _syncAll,
  };

})();


// ═══════════════════════════════════════════════════════════════
// ████████████████  PART 3 dst — JS DI BAWAH SINI  ████████████
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ████████████████████  PART 3 — SKILL CATALOG  ██████████████
// ─────────────────────────────────────────────────────────────
// Paste di script.js — di bawah sekat Part 2
// ═══════════════════════════════════════════════════════════════

var P3 = (function () {
  'use strict';

  var s = {
    ctx:     'hard',    // 'soft' | 'hard' — dari P2
    type:    'kreatif', // 'teknis' | 'kreatif' — dari P2
    navOpen: false,
    lowEnd:  false,
  };

  // ════════════════════════════════════════
  // DATA KONTEN — ✏️ EDIT sesuai kebutuhan
  // ════════════════════════════════════════
  var DATA = {

    hard: {
      kreatif: {
        eyebrow_id: 'Hardskill · Kreatif',   eyebrow_en: 'Hardskill · Creative',
        title_id:   'Pilih Tool Kreatif',     title_en:   'Choose Creative Tool',
        sub_id:     'Klik untuk lihat karya dan detail penggunaan.',
        sub_en:     'Click to see works and usage details.',
        items: [
          // ✏️ EDIT: logo = path ke file gambar, kosongkan jika belum ada
          { id: 'photoshop',   name: 'Adobe Photoshop',   logo: '', fb: 'Ps',
            desc_id: 'Photo editing, compositing, dan manipulasi digital.',
            desc_en: 'Photo editing, compositing, and digital manipulation.',
            level: 82, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Photoshop jadi tempat Wahyu mengasah rasa visual sejak awal masuk DKV — dari retouching foto, compositing, sampai eksplorasi manipulasi digital untuk tugas dan proyek pribadi.',
            long_en: "Photoshop is where Wahyu sharpens his visual instinct since starting DKV — from photo retouching and compositing to digital manipulation experiments for school and personal projects.",
            examples: [
              { title_id: 'Retouching Foto Profil', title_en: 'Profile Photo Retouching', desc_id: 'Edit foto profil dan materi promosi supaya konsisten dengan brand personal.', desc_en: 'Editing profile photos and promo material to stay consistent with personal brand.' },
              { title_id: 'Poster Tugas Sekolah', title_en: 'School Assignment Posters', desc_id: 'Compositing elemen visual untuk poster dan materi presentasi kelas DKV.', desc_en: 'Compositing visual elements for posters and class presentation materials.' },
            ] },
          { id: 'illustrator', name: 'Adobe Illustrator', logo: '', fb: 'Ai',
            desc_id: 'Desain vektor, ilustrasi, dan identitas visual.',
            desc_en: 'Vector design, illustration, and visual identity.',
            level: 78, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Illustrator dipakai Wahyu untuk membangun elemen vektor — dari logo, ikon, sampai identitas visual — supaya hasil desain tetap rapi di berbagai ukuran.',
            long_en: 'Illustrator is used to build vector elements — logos, icons, and visual identity — keeping designs crisp at any size.',
            examples: [
              { title_id: 'Logo & Ikon Custom', title_en: 'Custom Logo & Icons', desc_id: 'Membuat logo dan set ikon untuk proyek identitas visual sekolah.', desc_en: 'Creating logos and icon sets for school visual identity projects.' },
              { title_id: 'Elemen Grafis Web CV', title_en: 'Web CV Graphic Elements', desc_id: 'Menggambar elemen dekoratif vektor yang dipakai di web CV ini.', desc_en: 'Drawing decorative vector elements used throughout this web CV.' },
            ] },
          { id: 'capcut',      name: 'CapCut',            logo: '', fb: 'Cc',
            desc_id: 'Video editing mobile dan konten kreatif.',
            desc_en: 'Mobile video editing and creative content.',
            level: 88, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'CapCut adalah tool utama Wahyu untuk konten cepat — video pendek, reels, dan editing on-the-go langsung dari HP.',
            long_en: "CapCut is Wahyu's go-to tool for fast content — short videos, reels, and on-the-go editing straight from his phone.",
            examples: [
              { title_id: 'Konten Media Sosial', title_en: 'Social Media Content', desc_id: 'Edit video pendek untuk Instagram dan TikTok pribadi.', desc_en: 'Editing short videos for personal Instagram and TikTok.' },
              { title_id: 'Dokumentasi Kegiatan', title_en: 'Activity Documentation', desc_id: 'Menyusun video dokumentasi kegiatan sekolah jadi konten singkat yang enak ditonton.', desc_en: 'Turning school activity footage into short, watchable content.' },
            ] },
          { id: 'premiere',    name: 'Premiere Pro',      logo: '', fb: 'Pr',
            desc_id: 'Video editing profesional dan produksi konten.',
            desc_en: 'Professional video editing and content production.',
            level: 70, level_id: 'Cukup Mahir', level_en: 'Intermediate',
            long_id: 'Premiere Pro dipakai untuk proyek video yang butuh kontrol lebih detail — multi-track editing, color grading dasar, dan penyuntingan audio.',
            long_en: 'Premiere Pro is used for video projects needing finer control — multi-track editing, basic color grading, and audio editing.',
            examples: [
              { title_id: 'Video Profil Sekolah', title_en: 'School Profile Video', desc_id: 'Ikut menyunting video profil untuk keperluan sekolah.', desc_en: 'Co-editing a profile video for school purposes.' },
              { title_id: 'Proyek Eksplorasi Pribadi', title_en: 'Personal Exploration Project', desc_id: 'Latihan color grading dan editing multi-layer di waktu luang.', desc_en: 'Practicing color grading and multi-layer editing in free time.' },
            ] },
          { id: 'canva',       name: 'Canva',             logo: '', fb: 'Cv',
            desc_id: 'Desain grafis cepat dan presentasi visual.',
            desc_en: 'Quick graphic design and visual presentations.',
            level: 90, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Canva jadi andalan Wahyu untuk desain cepat — dari materi presentasi, feed media sosial, sampai template yang butuh hasil rapi dalam waktu singkat.',
            long_en: "Canva is Wahyu's go-to for quick design — presentation materials, social media feeds, and templates that need clean results fast.",
            examples: [
              { title_id: 'Materi Presentasi Sekolah', title_en: 'School Presentation Materials', desc_id: 'Menyusun slide dan materi visual untuk presentasi tugas kelas.', desc_en: 'Building slides and visuals for class assignment presentations.' },
              { title_id: 'Feed Media Sosial', title_en: 'Social Media Feed', desc_id: 'Desain feed dan story Instagram dengan template konsisten.', desc_en: 'Designing Instagram feed and stories with consistent templates.' },
            ] },
          { id: 'corel',       name: 'CorelDRAW',         logo: '', fb: 'Cd',
            desc_id: 'Desain vektor dan layout publikasi cetak.',
            desc_en: 'Vector design and print publication layout.',
            level: 65, level_id: 'Cukup Mahir', level_en: 'Intermediate',
            long_id: 'CorelDRAW dipelajari Wahyu untuk kebutuhan desain vektor dan layout cetak — pelengkap workflow Illustrator untuk proyek publikasi.',
            long_en: "CorelDRAW was learned for vector design and print layout needs — complementing the Illustrator workflow for publication projects.",
            examples: [
              { title_id: 'Layout Publikasi Cetak', title_en: 'Print Publication Layout', desc_id: 'Menyusun layout untuk materi cetak sekolah seperti banner dan pamflet.', desc_en: 'Laying out school print materials like banners and pamphlets.' },
              { title_id: 'Eksplorasi Desain Vektor', title_en: 'Vector Design Exploration', desc_id: 'Latihan teknik vektor alternatif di luar Illustrator.', desc_en: 'Practicing alternative vector techniques outside Illustrator.' },
            ] },
        ],
      },

      teknis: {
        eyebrow_id: 'Hardskill · Teknis',    eyebrow_en: 'Hardskill · Technical',
        title_id:   'Pilih Tool Teknis',      title_en:   'Choose Technical Tool',
        sub_id:     'Klik untuk lihat kemampuan dan contoh penggunaan.',
        sub_en:     'Click to see capabilities and usage examples.',
        items: [
          { id: 'word',   name: 'Microsoft Word',       logo: '', fb: 'Wd',
            desc_id: 'Dokumen profesional, laporan, dan penulisan terstruktur.',
            desc_en: 'Professional documents, reports, and structured writing.',
            level: 90, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Word adalah tool utama Wahyu untuk dokumen formal — laporan, proposal, dan tulisan terstruktur dengan format rapi dan konsisten.',
            long_en: "Word is Wahyu's main tool for formal documents — reports, proposals, and structured writing with clean, consistent formatting.",
            examples: [
              { title_id: 'Laporan Tugas Sekolah', title_en: 'School Assignment Reports', desc_id: 'Menyusun laporan praktik dan tugas dengan format akademik yang rapi.', desc_en: 'Writing practice reports and assignments with clean academic formatting.' },
              { title_id: 'Dokumen CV & Surat', title_en: 'CV & Letter Documents', desc_id: 'Menulis dan menata dokumen CV serta surat lamaran/formal lainnya.', desc_en: 'Writing and formatting CV documents and other formal letters.' },
            ] },
          { id: 'excel',  name: 'Microsoft Excel',      logo: '', fb: 'Ex',
            desc_id: 'Spreadsheet, analisis data, dan visualisasi angka.',
            desc_en: 'Spreadsheet, data analysis, and number visualization.',
            level: 85, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Excel dipakai Wahyu untuk mengolah data — dari rekap nilai, anggaran kegiatan, sampai visualisasi angka sederhana pakai chart.',
            long_en: 'Excel is used for data work — grade recaps, activity budgets, and simple number visualization with charts.',
            examples: [
              { title_id: 'Rekap Data Kegiatan', title_en: 'Activity Data Recap', desc_id: 'Menyusun dan menghitung data kegiatan organisasi/sekolah.', desc_en: 'Compiling and calculating organization/school activity data.' },
              { title_id: 'Anggaran & Perencanaan', title_en: 'Budget & Planning', desc_id: 'Membuat spreadsheet anggaran sederhana untuk proyek kelas.', desc_en: 'Building simple budget spreadsheets for class projects.' },
            ] },
          { id: 'ppt',    name: 'Microsoft PowerPoint', logo: '', fb: 'Pp',
            desc_id: 'Presentasi profesional dan komunikasi visual terstruktur.',
            desc_en: 'Professional presentations and structured visual communication.',
            level: 88, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'PowerPoint dipakai untuk menyusun presentasi yang jelas dan komunikatif — menggabungkan sisi desain dengan struktur informasi yang runtut.',
            long_en: "PowerPoint is used to build clear, communicative presentations — combining design sense with well-structured information.",
            examples: [
              { title_id: 'Presentasi Tugas & Proyek', title_en: 'Assignment & Project Presentations', desc_id: 'Menyusun slide presentasi untuk tugas kelompok dan individu.', desc_en: 'Building presentation slides for group and individual assignments.' },
              { title_id: 'Materi Pitch Ide', title_en: 'Idea Pitch Deck', desc_id: 'Membuat deck sederhana untuk menyampaikan ide atau konsep proyek.', desc_en: 'Creating a simple deck to pitch ideas or project concepts.' },
            ] },
          { id: 'html',   name: 'HTML & CSS',           logo: '', fb: 'Ht',
            desc_id: 'Membangun tampilan web dari nol — termasuk web CV ini.',
            desc_en: 'Building web interfaces from scratch — including this web CV.',
            level: 75, level_id: 'Cukup Mahir', level_en: 'Intermediate',
            long_id: 'HTML & CSS adalah pintu masuk Wahyu ke dunia teknis — dipelajari otodidak dari nol, dan langsung dipraktikkan lewat proyek nyata: web CV ini sendiri.',
            long_en: "HTML & CSS is Wahyu's entry point into the technical world — self-taught from scratch, and put into practice directly through a real project: this very web CV.",
            examples: [
              { title_id: 'Web CV Personal (Proyek Ini)', title_en: 'Personal Web CV (This Project)', desc_id: 'Membangun seluruh halaman ini dari nol — struktur, styling, sampai animasi.', desc_en: 'Building this entire site from scratch — structure, styling, and animation.' },
              { title_id: 'Eksperimen Layout & Animasi', title_en: 'Layout & Animation Experiments', desc_id: 'Belajar CSS transition, grid, dan animasi lewat coba-coba proyek kecil.', desc_en: 'Learning CSS transitions, grid, and animation through small experiments.' },
            ] },
        ],
      },
    },

    soft: {
      kreatif: {
        eyebrow_id: 'Softskill · Kreatif',   eyebrow_en: 'Softskill · Creative',
        title_id:   'Pilih Skill Kreatif',    title_en:   'Choose Creative Skill',
        sub_id:     'Klik untuk lihat lebih dalam.',
        sub_en:     'Click to explore further.',
        items: [
          { id: 'empati',      name: 'Empati',      logo: '', fb: '♡',
            desc_id: 'Mendengar yang tidak diucapkan dan hadir sepenuhnya.',
            desc_en: 'Hearing the unspoken and being fully present.',
            level: 85, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Empati membantu Wahyu memahami kebutuhan orang lain sebelum mendesain — baik itu klien, teman tim, atau audiens dari sebuah karya.',
            long_en: "Empathy helps Wahyu understand others' needs before designing — whether it's a client, teammate, or the audience of a piece of work.",
            examples: [
              { title_id: 'Diskusi Brief Desain', title_en: 'Design Brief Discussions', desc_id: 'Menggali kebutuhan sebenarnya di balik permintaan desain sebelum mulai kerja.', desc_en: "Digging into the real need behind a design request before starting work." },
              { title_id: 'Kerja Tim Kelompok', title_en: 'Group Teamwork', desc_id: 'Peka terhadap dinamika tim saat mengerjakan proyek bersama.', desc_en: 'Staying attuned to team dynamics while working on group projects.' },
            ] },
          { id: 'kreativitas', name: 'Kreativitas', logo: '', fb: '✦',
            desc_id: 'Menemukan solusi baru dari sudut pandang yang tidak biasa.',
            desc_en: 'Finding new solutions from unusual perspectives.',
            level: 90, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Kreativitas adalah fondasi Wahyu dalam mendekati masalah — mencari sudut pandang baru, bukan sekadar mengikuti pola yang sudah ada.',
            long_en: "Creativity is Wahyu's foundation for approaching problems — finding new angles, not just following existing patterns.",
            examples: [
              { title_id: 'Konsep Visual Web CV', title_en: 'Web CV Visual Concept', desc_id: 'Merancang konsep sinematik dan hybrid identity untuk web CV ini.', desc_en: 'Designing the cinematic, hybrid-identity concept for this web CV.' },
              { title_id: 'Solusi Tugas Non-Konvensional', title_en: 'Unconventional Assignment Solutions', desc_id: 'Mencari pendekatan berbeda saat mengerjakan tugas kreatif sekolah.', desc_en: 'Finding different approaches when working on creative school assignments.' },
            ] },
          { id: 'kolaborasi',  name: 'Kolaborasi',  logo: '', fb: '◎',
            desc_id: 'Bekerja bersama tanpa ego dan menghasilkan lebih banyak.',
            desc_en: 'Working together without ego and achieving more.',
            level: 82, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Kolaborasi berarti Wahyu bisa bekerja bersama tanpa ego — mendengarkan masukan, membagi peran, dan menghasilkan lebih banyak daripada kerja sendirian.',
            long_en: "Collaboration means Wahyu can work with others without ego — listening to input, dividing roles, and achieving more than working alone.",
            examples: [
              { title_id: 'Proyek Kelompok DKV', title_en: 'DKV Group Projects', desc_id: 'Berbagi peran desain dan eksekusi dalam tugas kelompok kelas.', desc_en: 'Sharing design and execution roles in class group assignments.' },
              { title_id: 'Sesi Iteratif dengan AI', title_en: 'Iterative Sessions with AI', desc_id: 'Membangun web CV ini secara kolaboratif, Part demi Part, bersama AI.', desc_en: 'Building this web CV collaboratively, Part by Part, together with AI.' },
            ] },
          { id: 'storytelling',name: 'Storytelling', logo: '', fb: '∿',
            desc_id: 'Menyampaikan pesan dengan cara yang terasa dan diingat.',
            desc_en: 'Delivering messages in ways that are felt and remembered.',
            level: 78, level_id: 'Cukup Mahir', level_en: 'Intermediate',
            long_id: 'Storytelling membantu Wahyu menyampaikan pesan lewat visual dan kata — bukan sekadar informasi, tapi sesuatu yang terasa dan diingat.',
            long_en: "Storytelling helps Wahyu deliver messages through visuals and words — not just information, but something felt and remembered.",
            examples: [
              { title_id: 'Narasi Web CV Ini', title_en: "This Web CV's Narrative", desc_id: 'Menyusun alur cerita dari Login Screen sampai Kontak agar terasa sinematik.', desc_en: 'Crafting the story arc from Login Screen to Contact to feel cinematic.' },
              { title_id: 'Caption & Konten Sosial', title_en: 'Captions & Social Content', desc_id: 'Menulis caption yang punya nada dan pesan, bukan sekadar deskripsi.', desc_en: 'Writing captions with tone and message, not just plain description.' },
            ] },
        ],
      },

      teknis: {
        eyebrow_id: 'Softskill · Teknis',    eyebrow_en: 'Softskill · Technical',
        title_id:   'Pilih Skill Teknis',     title_en:   'Choose Technical Skill',
        sub_id:     'Klik untuk lihat lebih dalam.',
        sub_en:     'Click to explore further.',
        items: [
          { id: 'kritis',    name: 'Berpikir Kritis', logo: '', fb: '⊕',
            desc_id: 'Menganalisis masalah secara sistematis sebelum bertindak.',
            desc_en: 'Analyzing problems systematically before acting.',
            level: 85, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Berpikir kritis membuat Wahyu terbiasa mempertanyakan asumsi dan menganalisis masalah sebelum bertindak — bukan langsung eksekusi tanpa arah.',
            long_en: "Critical thinking makes Wahyu question assumptions and analyze problems before acting — not jumping into execution without direction.",
            examples: [
              { title_id: 'Evaluasi Keputusan Desain', title_en: 'Design Decision Evaluation', desc_id: 'Mempertimbangkan alasan di balik setiap pilihan desain, bukan cuma insting.', desc_en: 'Weighing the reasoning behind each design choice, not just instinct.' },
              { title_id: 'Debugging Kode', title_en: 'Code Debugging', desc_id: 'Menelusuri akar masalah saat bug muncul di web CV, bukan asal coba-coba.', desc_en: 'Tracing root causes when bugs show up in the web CV, not just guessing.' },
            ] },
          { id: 'analitis',  name: 'Analitis',         logo: '', fb: '≡',
            desc_id: 'Membaca data, pola, dan konteks dengan presisi.',
            desc_en: 'Reading data, patterns, and context with precision.',
            level: 88, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Analitis adalah sisi teknik Wahyu yang membaca data, pola, dan konteks dengan presisi — cocok dipadukan dengan insting desainnya.',
            long_en: "Analytical is Wahyu's technical side that reads data, patterns, and context with precision — a good pair for his design instincts.",
            examples: [
              { title_id: 'Struktur Kode Modular', title_en: 'Modular Code Structure', desc_id: 'Merancang sistem Part-per-Part yang rapi dan mudah diperluas di web CV.', desc_en: 'Designing a clean, extensible Part-by-Part system for the web CV.' },
              { title_id: 'Riset Referensi Desain', title_en: 'Design Reference Research', desc_id: 'Menganalisis pola desain dari referensi sebelum menerapkannya.', desc_en: 'Analyzing design patterns from references before applying them.' },
            ] },
          { id: 'problem',   name: 'Problem Solving',  logo: '', fb: '◈',
            desc_id: 'Menemukan jalan keluar bahkan dari situasi yang kompleks.',
            desc_en: 'Finding a way out even from complex situations.',
            level: 84, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Problem solving adalah kemampuan Wahyu menemukan jalan keluar bahkan dari situasi kompleks — baik itu bug kode atau kebuntuan desain.',
            long_en: "Problem solving is Wahyu's ability to find a way out even from complex situations — whether it's a code bug or a design deadlock.",
            examples: [
              { title_id: 'Fix Bug Web CV', title_en: 'Fixing Web CV Bugs', desc_id: 'Menelusuri dan memperbaiki bug seperti carousel drag/click yang tricky.', desc_en: 'Tracking down and fixing tricky bugs like carousel drag/click conflicts.' },
              { title_id: 'Iterasi Desain Buntu', title_en: 'Iterating Past Design Deadlocks', desc_id: 'Mencari pendekatan baru saat satu arah desain terasa mentok.', desc_en: 'Finding a new approach when one design direction hits a wall.' },
            ] },
          { id: 'komunikasi',name: 'Komunikasi',        logo: '', fb: '⌁',
            desc_id: 'Menyampaikan ide dengan jelas, terstruktur, dan tepat sasaran.',
            desc_en: 'Conveying ideas clearly, structured, and on point.',
            level: 80, level_id: 'Mahir', level_en: 'Proficient',
            long_id: 'Komunikasi membuat Wahyu bisa menyampaikan ide — baik lewat visual maupun kata — dengan jelas, terstruktur, dan tepat sasaran.',
            long_en: "Communication lets Wahyu convey ideas — through visuals or words — clearly, structured, and on point.",
            examples: [
              { title_id: 'Presentasi Tugas & Proyek', title_en: 'Assignment & Project Presentations', desc_id: 'Menjelaskan konsep desain ke guru dan teman dengan runtut.', desc_en: 'Explaining design concepts to teachers and peers in a clear order.' },
              { title_id: 'Brief ke AI Collaborator', title_en: 'Briefing the AI Collaborator', desc_id: 'Menyampaikan kebutuhan project dengan jelas saat membangun web CV bersama AI.', desc_en: 'Clearly conveying project needs while building the web CV together with AI.' },
            ] },
        ],
      },
    },
  };

  // ════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════
  function init(ctx, type) {
    s.ctx  = ctx  || 'hard';
    s.type = type || 'kreatif';

    var cores = navigator.hardwareConcurrency || 4;
    var mem   = navigator.deviceMemory || 4;
    s.lowEnd  = (cores <= 2) || (mem <= 2);

    var el = document.getElementById('p3');
    if (!el) return;

    el.removeAttribute('hidden');
    el.className = el.className.replace(/ctx-\w+/g, '').trim();

    // Scroll ke atas
    var body = el.querySelector('.p3-body');
    if (body) body.scrollTop = 0;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('active');
        _populateAll();
        _syncAll();
      });
    });
  }

  // ════════════════════════════════════════
  // POPULATE
  // ════════════════════════════════════════
  function _populateAll() {
    var lang = document.documentElement.getAttribute('data-lang') || 'id';
    var d    = DATA[s.ctx] && DATA[s.ctx][s.type];
    if (!d) return;

    // Header
    _setEl('p3Eyebrow', function (el) { el.textContent = lang === 'id' ? d.eyebrow_id : d.eyebrow_en; });
    _setEl('p3Title',   function (el) {
      el.textContent = lang === 'id' ? d.title_id   : d.title_en;
      if (typeof FX !== 'undefined' && FX.scramble) FX.scramble(el);
    });
    _setEl('p3Sub',     function (el) { el.textContent = lang === 'id' ? d.sub_id     : d.sub_en; });

    // Breadcrumb
    _setEl('p3NavCtxB', function (el) {
      el.textContent = s.ctx === 'soft' ? 'Softskill' : 'Hardskill';
    });
    _setEl('p3NavCtxC', function (el) {
      el.textContent = s.type === 'teknis' ? 'Teknis' : 'Kreatif';
    });
    _setEl('p3NavBackLbl', function (el) {
      el.textContent = lang === 'id'
        ? 'Kembali ke ' + (s.ctx === 'soft' ? 'Softskill' : 'Hardskill')
        : 'Back to ' + (s.ctx === 'soft' ? 'Softskill' : 'Hardskill');
    });

    // Catalog strips
    _buildCatalog(d.items, lang);
  }

  function _buildCatalog(items, lang) {
    var catalog = document.getElementById('p3Catalog');
    if (!catalog) return;
    catalog.innerHTML = '';

    items.forEach(function (item) {
      var strip = document.createElement('div');
      strip.className  = 'p3-strip spotlight';
      strip.setAttribute('role', 'listitem');
      strip.setAttribute('tabindex', '0');
      strip.setAttribute('aria-label', item.name);

      // Klik & keyboard
      strip.addEventListener('click', function () { P3.goDetail(item.id); });
      strip.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); P3.goDetail(item.id); }
      });

      // ── Logo box ──
      var logoBox = document.createElement('div');
      logoBox.className = 'p3-strip-logo';

      if (item.logo) {
        var img = document.createElement('img');
        img.alt  = item.name;
        img.src  = item.logo;
        img.addEventListener('load',  function () { img.classList.add('loaded'); });
        img.addEventListener('error', function () {
          // Fallback ke teks jika gambar tidak ada
          logoBox.innerHTML = '';
          var fb = document.createElement('span');
          fb.className   = 'p3-strip-logo-fb';
          fb.textContent = item.fb;
          logoBox.appendChild(fb);
        });
        logoBox.appendChild(img);
      } else {
        // Belum ada gambar — tampilkan fallback
        var fb = document.createElement('span');
        fb.className   = 'p3-strip-logo-fb';
        fb.textContent = item.fb;
        logoBox.appendChild(fb);
      }

      // ── Info ──
      var info = document.createElement('div');
      info.className = 'p3-strip-info';

      var name = document.createElement('p');
      name.className   = 'p3-strip-name';
      name.textContent = item.name;

      var desc = document.createElement('p');
      desc.className   = 'p3-strip-desc';
      desc.textContent = lang === 'id' ? item.desc_id : item.desc_en;

      info.appendChild(name);
      info.appendChild(desc);

      // ── Arrow ──
      var arr = document.createElement('div');
      arr.className   = 'p3-strip-arr';
      arr.innerHTML   = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      arr.setAttribute('aria-hidden', 'true');

      strip.appendChild(logoBox);
      strip.appendChild(info);
      strip.appendChild(arr);
      catalog.appendChild(strip);
    });
  }

  // ════════════════════════════════════════
  // NAVIGASI
  // ════════════════════════════════════════

  // Cari item di semua kategori berdasarkan id — dipakai P4 buat ambil data detail
  function getItem(itemId) {
    var cats  = ['hard', 'soft'];
    var types = ['kreatif', 'teknis'];
    for (var i = 0; i < cats.length; i++) {
      for (var j = 0; j < types.length; j++) {
        var d = DATA[cats[i]] && DATA[cats[i]][types[j]];
        if (!d) continue;
        for (var k = 0; k < d.items.length; k++) {
          if (d.items[k].id === itemId) return d.items[k];
        }
      }
    }
    return null;
  }

  // Masuk ke detail tool (Part 4) — modal di atas katalog
  function goDetail(itemId) {
    if (typeof P4 !== 'undefined' && P4.init) P4.init(itemId);
  }

  // Kembali ke P2
  function back() {
    var overlay = document.getElementById('p3Overlay');
    var p3El    = document.getElementById('p3');
    var p2El    = document.getElementById('p2');
    if (overlay) overlay.classList.add('show');
    if (s.navOpen) _closeNav();

    setTimeout(function () {
      if (p3El) {
        p3El.classList.remove('active');
        setTimeout(function () { p3El.setAttribute('hidden', ''); }, 400);
      }
      if (p2El) {
        p2El.style.opacity      = '1';
        p2El.style.pointerEvents = 'all';
      }
      setTimeout(function () { if (overlay) overlay.classList.remove('show'); }, 60);
    }, 200);
  }

  // Langsung ke P1 (Beranda)
  function toP1() {
    var overlay = document.getElementById('p3Overlay');
    var p3El    = document.getElementById('p3');
    var p2El    = document.getElementById('p2');
    var p1El    = document.getElementById('p1');
    if (overlay) overlay.classList.add('show');
    if (s.navOpen) _closeNav();

    setTimeout(function () {
      if (p3El) { p3El.classList.remove('active'); setTimeout(function () { p3El.setAttribute('hidden', ''); }, 400); }
      if (p2El) { p2El.classList.remove('active'); setTimeout(function () { p2El.setAttribute('hidden', ''); }, 400); }
      if (p1El) { p1El.style.opacity = '1'; p1El.style.pointerEvents = 'all'; }
      setTimeout(function () { if (overlay) overlay.classList.remove('show'); }, 60);
    }, 200);
  }

  // Hamburger nav
  function toggleNav() {
    s.navOpen = !s.navOpen;
    var nav = document.getElementById('p3Nav');
    var ham = document.getElementById('p3Ham');
    if (!nav || !ham) return;
    nav.classList.toggle('open', s.navOpen);
    nav.setAttribute('aria-hidden', String(!s.navOpen));
    ham.setAttribute('aria-expanded', String(s.navOpen));
    ham.classList.toggle('nav-open', s.navOpen);
    if (s.navOpen) _syncAll();
  }

  function _closeNav() {
    s.navOpen = false;
    var nav = document.getElementById('p3Nav');
    var ham = document.getElementById('p3Ham');
    if (nav) { nav.classList.remove('open'); nav.setAttribute('aria-hidden', 'true'); }
    if (ham) { ham.setAttribute('aria-expanded', 'false'); ham.classList.remove('nav-open'); }
  }

  // ════════════════════════════════════════
  // SYNC TEMA & BAHASA
  // ════════════════════════════════════════
  function _syncAll() {
    var theme = document.documentElement.getAttribute('data-theme') || 'light';
    var lang  = document.documentElement.getAttribute('data-lang')  || 'id';
    _setEl('p3GcTheme', function (el) { el.textContent = theme === 'dark' ? '○' : '☀'; });
    _setEl('p3GcLang',  function (el) { el.textContent = lang  === 'id'   ? 'EN' : 'ID'; });
    document.querySelectorAll('#p3 [data-id]').forEach(function (el) {
      var v = lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
      if (v !== null) el.textContent = v;
    });
    _populateAll();
  }

  function _setEl(id, fn) { var el = document.getElementById(id); if (el) fn(el); }

  // ── PUBLIC API ──
  return {
    init:     init,
    back:     back,
    toP1:     toP1,
    nav:      toggleNav,
    goDetail: goDetail,
    getItem:  getItem,
    sync:     _syncAll,
  };

})();


// ═══════════════════════════════════════════════════════════════
// ████████████████████  STICKY NOTE SYSTEM  ██████████████████
// ─────────────────────────────────────────────────────────────
// Muncul di: Part 0 (wajib), ikon global di semua Part, dan wall
// di section Komentar Part 1. Data masih dummy — Firebase nanti.
// ═══════════════════════════════════════════════════════════════

var SN = (function () {
  'use strict';

  var COLORS = ['sn-yellow', 'sn-pink', 'sn-blue'];

  // ✏️ EDIT: Dummy data — nanti diganti fetch dari Firebase
  var NOTES = [
    { id: 1, name: 'raka_design', msg_id: 'Portfolionya keren banget 🔥', msg_en: 'Your portfolio is amazing 🔥', time_id: '2 hari lalu', time_en: '2 days ago' },
    { id: 2, name: 'maya.studio', msg_id: 'Hybrid DKV × teknik — rare combo', msg_en: 'Hybrid DKV × engineering — rare combo', time_id: '5 jam lalu', time_en: '5 hours ago' },
    { id: 3, name: 'dito.archi', msg_id: 'Singaraja punya talent 🌊', msg_en: 'Singaraja has talent 🌊', time_id: 'kemarin', time_en: 'yesterday' },
    { id: 4, name: 'sasha_ui', msg_id: 'Timeline hidupnya related banget sama aku', msg_en: 'The life timeline really resonates with me', time_id: '3 hari lalu', time_en: '3 days ago' },
    { id: 5, name: 'anon', msg_id: 'Semangat terus buat portofolionya!', msg_en: 'Keep going with the portfolio!', time_id: '1 minggu lalu', time_en: '1 week ago' },
    { id: 6, name: 'wildan_', msg_id: 'CV paling niat yang pernah aku liat', msg_en: 'Most thoughtful CV I have seen', time_id: '4 hari lalu', time_en: '4 days ago' },
  ];

  var s = { nextId: NOTES.length + 1, panelOpen: false, lastFocus: null };

  // ── Assign warna + rotasi tetap per note (sekali aja, biar konsisten tiap render) ──
  function _decorate(note) {
    if (note._color) return note;
    note._color = COLORS[Math.floor(Math.random() * COLORS.length)];
    note._rot   = (Math.random() * 8 - 4).toFixed(1); // -4deg .. 4deg
    return note;
  }

  function _lang() { return document.documentElement.getAttribute('data-lang') || 'id'; }

  function _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Bikin 1 elemen sticky note ──
  function _buildNoteEl(note, size) {
    _decorate(note);
    var lang = _lang();
    var el = document.createElement('div');
    el.className = 'sn-note ' + note._color + (size ? ' sn-' + size : '');
    el.style.setProperty('--rot', note._rot + 'deg');
    el.innerHTML =
      '<span class="sn-pin" aria-hidden="true"></span>' +
      '<p class="sn-msg">' + _esc(lang === 'id' ? note.msg_id : note.msg_en) + '</p>' +
      '<div class="sn-foot">' +
        '<span class="sn-user">' + _esc(note.name) + '</span>' +
        '<span class="sn-time">' + _esc(lang === 'id' ? note.time_id : note.time_en) + '</span>' +
      '</div>';
    return el;
  }

  // ── Badge angka di ikon global — jumlah total note ──
  function _updateBadge() {
    var dot = document.getElementById('snIconDot');
    if (!dot) return;
    dot.textContent = NOTES.length > 99 ? '99+' : String(NOTES.length);
  }

  // ════════════════════════════════════════
  // PART 0 — 3 note random di 3 slot tetap
  // ════════════════════════════════════════
  function renderPart0() {
    var slots = ['p0Sn1', 'p0Sn2', 'p0Sn3'];
    var pool  = NOTES.slice().sort(function () { return Math.random() - .5; }).slice(0, 3);

    slots.forEach(function (id, i) {
      var host = document.getElementById(id);
      if (!host || !pool[i]) return;
      host.innerHTML = '';
      host.appendChild(_buildNoteEl(pool[i], 'p0'));
    });
  }

  // ════════════════════════════════════════
  // IKON GLOBAL + PANEL
  // ════════════════════════════════════════
  function togglePanel() {
    s.panelOpen = !s.panelOpen;
    var panel = document.getElementById('snPanel');
    var icon  = document.getElementById('snIcon');
    if (!panel) return;
    panel.classList.toggle('open', s.panelOpen);
    panel.setAttribute('aria-hidden', String(!s.panelOpen));
    if (icon) icon.classList.toggle('active', s.panelOpen);
    if (s.panelOpen) {
      renderPanel();
      s.lastFocus = document.activeElement;
      var closeBtn = document.querySelector('.sn-panel-x');
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 100);
    } else if (s.lastFocus && typeof s.lastFocus.focus === 'function') {
      s.lastFocus.focus();
    }
  }

  function closePanel() {
    if (!s.panelOpen) return;
    togglePanel();
  }

  function renderPanel() {
    var list = document.getElementById('snPanelList');
    if (!list) return;
    list.innerHTML = '';
    NOTES.slice(0, 8).forEach(function (note) {
      list.appendChild(_buildNoteEl(note, 'sm'));
    });
  }

  // Dari panel → lompat ke wall (Komentar). Kalau masih di Part 0, masuk dulu.
  function goWall() {
    closePanel();
    var p1 = document.getElementById('p1');
    if (p1 && !p1.classList.contains('active')) {
      if (typeof W !== 'undefined' && W.enter) W.enter();
      setTimeout(function () {
        if (typeof P1 !== 'undefined' && P1.to) P1.to('comment');
      }, 900);
    } else if (typeof P1 !== 'undefined' && P1.to) {
      P1.to('comment');
    }
  }

  // ════════════════════════════════════════
  // WALL — grid semua note (section Komentar, Part 1)
  // ════════════════════════════════════════
  function renderWall() {
    var grid = document.getElementById('snWallGrid');
    if (!grid) return;
    grid.innerHTML = '';
    NOTES.forEach(function (note) {
      grid.appendChild(_buildNoteEl(note, 'wall'));
    });
  }

  // ════════════════════════════════════════
  // TAMBAH NOTE BARU (dari form komentar)
  // ════════════════════════════════════════
  function addNote(name, msg) {
    var note = {
      id: s.nextId++,
      name: name,
      msg_id: msg, msg_en: msg,
      time_id: 'baru saja', time_en: 'just now',
    };
    NOTES.unshift(note);
    renderWall();
    _updateBadge();
    if (s.panelOpen) renderPanel();

    // ✨ Konfeti kecil dari posisi tombol "Tempel Note" — dopamine hit ringan
    if (typeof FX !== 'undefined' && FX.confetti) {
      var btn = document.querySelector('.p1-cm-send');
      if (btn) {
        var r = btn.getBoundingClientRect();
        FX.confetti(r.left + r.width / 2, r.top + r.height / 2);
      } else {
        FX.confetti();
      }
    }
  }

  // ════════════════════════════════════════
  // SYNC — dipanggil saat ganti bahasa
  // ════════════════════════════════════════
  function sync() {
    renderPart0();
    renderWall();
    if (s.panelOpen) renderPanel();
  }

  function init() {
    renderPart0();
    renderWall();
    _updateBadge();
    _initSwipeClose();
  }

  // ── SWIPE-KANAN-UNTUK-TUTUP — drawer dari kanan, natural digeser ke kanan buat nutup ──
  function _initSwipeClose() {
    var panel = document.querySelector('.sn-panel-body');
    if (!panel) return;
    var startX = 0, delta = 0, dragging = false;

    panel.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      dragging = true;
      panel.style.transition = 'none';
    }, { passive: true });

    panel.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      delta = e.touches[0].clientX - startX;
      if (delta > 0) panel.style.transform = 'translateX(' + delta + 'px)';
    }, { passive: true });

    panel.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
      panel.style.transform = '';
      if (delta > 90) closePanel();
      delta = 0;
    });
  }

  // ── PUBLIC API ──
  return {
    init:        init,
    togglePanel: togglePanel,
    closePanel:  closePanel,
    goWall:      goWall,
    addNote:     addNote,
    sync:        sync,
  };

})();


// ═══════════════════════════════════════════════════════════════
// ██████████████████████  PART 4 — DETAIL SKILL/TOOL  █████████████
// ─────────────────────────────────────────────────────────────
// Modal/panel di atas Part 3 — BUKAN page transition. Datanya
// diambil dari P3.getItem(itemId). Tutup pakai X / scrim / Esc.
// ═══════════════════════════════════════════════════════════════

var P4 = (function () {
  'use strict';

  var s = { open: false, itemId: null, lastFocus: null };

  function init(itemId) {
    var item = (typeof P3 !== 'undefined' && P3.getItem) ? P3.getItem(itemId) : null;
    if (!item) return;
    s.itemId = itemId;
    s.lastFocus = document.activeElement; // ✅ simpan elemen yang tadi fokus, buat dikembalikan pas modal ditutup
    _populate(item);
    _open();
  }

  function _lang() { return document.documentElement.getAttribute('data-lang') || 'id'; }

  function _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _populate(item) {
    var lang = _lang();

    _setEl('p4Name', function (el) { el.textContent = item.name; });
    _setEl('p4LevelVal', function (el) {
      el.textContent = (lang === 'id' ? item.level_id : item.level_en) + ' · ' + item.level + '%';
    });
    _setEl('p4LevelFill', function (el) { el.style.width = item.level + '%'; });
    _setEl('p4Desc', function (el) { el.textContent = lang === 'id' ? item.long_id : item.long_en; });

    // Logo box — sama pola dengan strip di P3 (fallback ke inisial kalau gambar gagal)
    var logoBox = document.getElementById('p4Logo');
    if (logoBox) {
      logoBox.innerHTML = '';
      if (item.logo) {
        var img = document.createElement('img');
        img.alt = item.name;
        img.src = item.logo;
        img.addEventListener('error', function () {
          logoBox.innerHTML = '<span class="p4-logo-fb">' + _esc(item.fb) + '</span>';
        });
        logoBox.appendChild(img);
      } else {
        logoBox.innerHTML = '<span class="p4-logo-fb">' + _esc(item.fb) + '</span>';
      }
    }

    // Contoh Pemakaian
    var list = document.getElementById('p4ExamplesList');
    if (list) {
      list.innerHTML = '';
      (item.examples || []).forEach(function (ex) {
        var card = document.createElement('div');
        card.className = 'p4-example';
        card.innerHTML =
          '<span class="p4-example-dot" aria-hidden="true"></span>' +
          '<div class="p4-example-body">' +
            '<p class="p4-example-ttl">' + _esc(lang === 'id' ? ex.title_id : ex.title_en) + '</p>' +
            '<p class="p4-example-desc">' + _esc(lang === 'id' ? ex.desc_id : ex.desc_en) + '</p>' +
          '</div>';
        list.appendChild(card);
      });
    }
  }

  function _open() {
    var modal = document.getElementById('p4Modal');
    if (!modal) return;
    modal.removeAttribute('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        s.open = true;
        // ✅ Pindahkan fokus keyboard ke dalam modal (tombol close) — aksesibilitas
        var closeBtn = document.getElementById('p4Close');
        if (closeBtn) closeBtn.focus();
      });
    });
  }

  function close() {
    if (!s.open) return;
    var modal = document.getElementById('p4Modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    s.open = false;
    setTimeout(function () { modal.setAttribute('hidden', ''); }, 320);
    // ✅ Kembalikan fokus ke elemen yang tadi memicu modal (strip item di katalog)
    if (s.lastFocus && typeof s.lastFocus.focus === 'function') s.lastFocus.focus();
  }

  // Dipanggil saat ganti bahasa — re-render kalau modal lagi kebuka
  function sync() {
    if (!s.open || !s.itemId) return;
    var item = (typeof P3 !== 'undefined' && P3.getItem) ? P3.getItem(s.itemId) : null;
    if (item) _populate(item);
  }

  function _setEl(id, fn) { var el = document.getElementById(id); if (el) fn(el); }

  function _initEvents() {
    var closeBtn = document.getElementById('p4Close');
    var backBtn  = document.getElementById('p4Back');
    var scrim    = document.getElementById('p4Scrim');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backBtn)  backBtn.addEventListener('click', close);
    if (scrim)    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && s.open) close();
    });
    _initSwipeClose();
  }

  // ── SWIPE-DOWN-TO-CLOSE — buat bottom-sheet mobile ──
  function _initSwipeClose() {
    var panel = document.getElementById('p4Panel');
    if (!panel) return;
    var startY = 0, delta = 0, dragging = false;

    panel.addEventListener('touchstart', function (e) {
      startY = e.touches[0].clientY;
      dragging = true;
      panel.style.transition = 'none';
    }, { passive: true });

    panel.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      delta = e.touches[0].clientY - startY;
      if (delta > 0) panel.style.transform = 'translateY(' + delta + 'px)';
    }, { passive: true });

    panel.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
      panel.style.transform = '';
      if (delta > 100) close();
      delta = 0;
    });
  }
  document.addEventListener('DOMContentLoaded', _initEvents);

  // ── PUBLIC API ──
  return {
    init:  init,
    close: close,
    sync:  sync,
  };

})();


// ═══════════════════════════════════════════════════════════════
// ██████████████████████  PART 5 — PENGALAMAN  ████████████████
// ═══════════════════════════════════════════════════════════════

var P5 = (function () {
  'use strict';

  var s = { inited: false };

  function init() {
    var el = document.getElementById('p5');
    if (!el) return;

    var p1El = document.getElementById('p1');
    if (p1El) { p1El.style.opacity = '0'; p1El.style.pointerEvents = 'none'; }

    el.removeAttribute('hidden');
    var scroll = document.getElementById('p5Scroll');
    if (scroll) scroll.scrollTop = 0;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('active');
        s.inited = true;
        var ttl = document.querySelector('#p5 .p5-ttl');
        if (ttl && typeof FX !== 'undefined' && FX.scramble) FX.scramble(ttl);
      });
    });
  }

  function back() {
    var overlay = document.getElementById('p5Overlay');
    var p5El    = document.getElementById('p5');
    var p1El    = document.getElementById('p1');
    if (overlay) overlay.classList.add('show');
    setTimeout(function () {
      if (p5El) {
        p5El.classList.remove('active');
        setTimeout(function () { p5El.setAttribute('hidden', ''); }, 300);
      }
      if (p1El) { p1El.style.opacity = '1'; p1El.style.pointerEvents = 'all'; }
      setTimeout(function () { if (overlay) overlay.classList.remove('show'); }, 100);
    }, 400);
  }

  function sync() {
    var lang = document.documentElement.getAttribute('data-lang') || 'id';
    document.querySelectorAll('#p5 [data-id]').forEach(function (el) {
      var v = lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
      if (v !== null) el.textContent = v;
    });
  }

  return { init: init, back: back, sync: sync };

})();


// ═══════════════════════════════════════════════════════════════
// ██████████████████████  PART 6 — PORTOFOLIO  ████████████████
// ═══════════════════════════════════════════════════════════════

var P6 = (function () {
  'use strict';

  function init() {
    var el = document.getElementById('p6');
    if (!el) return;

    var p1El = document.getElementById('p1');
    if (p1El) { p1El.style.opacity = '0'; p1El.style.pointerEvents = 'none'; }

    el.removeAttribute('hidden');
    var scroll = document.getElementById('p6Scroll');
    if (scroll) scroll.scrollTop = 0;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('active');
        var ttl = document.querySelector('#p6 .p6-ttl');
        if (ttl && typeof FX !== 'undefined' && FX.scramble) FX.scramble(ttl);
      });
    });
  }

  function back() {
    var overlay = document.getElementById('p6Overlay');
    var p6El    = document.getElementById('p6');
    var p1El    = document.getElementById('p1');
    if (overlay) overlay.classList.add('show');
    setTimeout(function () {
      if (p6El) {
        p6El.classList.remove('active');
        setTimeout(function () { p6El.setAttribute('hidden', ''); }, 300);
      }
      if (p1El) { p1El.style.opacity = '1'; p1El.style.pointerEvents = 'all'; }
      setTimeout(function () { if (overlay) overlay.classList.remove('show'); }, 100);
    }, 400);
  }

  function sync() {
    var lang = document.documentElement.getAttribute('data-lang') || 'id';
    document.querySelectorAll('#p6 [data-id]').forEach(function (el) {
      var v = lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
      if (v !== null) el.textContent = v;
    });
  }

  return { init: init, back: back, sync: sync };

})();


// ═══════════════════════════════════════════════════════════════
// ██████████████████  PART EXP — KENALI LEBIH JAUH  ██████████
// ═══════════════════════════════════════════════════════════════

var PE = (function () {
  'use strict';

  var s = { tab: 'analisis' };

  function init() {
    var el = document.getElementById('pe');
    if (!el) return;

    var p1El = document.getElementById('p1');
    if (p1El) { p1El.style.opacity = '0'; p1El.style.pointerEvents = 'none'; }

    el.removeAttribute('hidden');
    var scroll = document.getElementById('peScroll');
    if (scroll) scroll.scrollTop = 0;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('active');
        var ttl = document.querySelector('#pe .pe-ttl');
        if (ttl && typeof FX !== 'undefined' && FX.scramble) FX.scramble(ttl);
      });
    });
  }

  function tab(name) {
    if (s.tab === name) return;
    s.tab = name;

    var tabs = { analisis: 'peTabAnalisis', game: 'peTabGame', tulisan: 'peTabTulisan' };
    var panels = { analisis: 'pePanelAnalisis', game: 'pePanelGame', tulisan: 'pePanelTulisan' };

    Object.keys(tabs).forEach(function (k) {
      var t = document.getElementById(tabs[k]);
      var p = document.getElementById(panels[k]);
      if (t) t.classList.toggle('active', k === name);
      if (p) p.classList.toggle('active', k === name);
    });
  }

  function back() {
    var overlay = document.getElementById('peOverlay');
    var peEl    = document.getElementById('pe');
    var p1El    = document.getElementById('p1');
    if (overlay) overlay.classList.add('show');
    setTimeout(function () {
      if (peEl) {
        peEl.classList.remove('active');
        setTimeout(function () { peEl.setAttribute('hidden', ''); }, 300);
      }
      if (p1El) { p1El.style.opacity = '1'; p1El.style.pointerEvents = 'all'; }
      setTimeout(function () { if (overlay) overlay.classList.remove('show'); }, 100);
    }, 400);
  }

  function sync() {
    var lang = document.documentElement.getAttribute('data-lang') || 'id';
    document.querySelectorAll('#pe [data-id]').forEach(function (el) {
      var v = lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
      if (v !== null) el.textContent = v;
    });
  }

  return { init: init, tab: tab, back: back, sync: sync };

})();


// ═══════════════════════════════════════════════════════════════
// ██████████████████████  FX — CONFETTI & EASTER EGG  █████████
// ─────────────────────────────────────────────────────────────
// Efek dekoratif ringan — mati otomatis di lowEnd & reduced-motion.
// ═══════════════════════════════════════════════════════════════

var FX = (function () {
  'use strict';

  function _skip() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lowEnd  = document.documentElement.classList.contains('no-blur'); // dipasang W.detect() di device kentang
    return reduced || lowEnd;
  }

  // ── CONFETTI BURST — canvas sekali pakai, auto-hapus ──
  function confetti(x, y) {
    if (_skip()) return;
    if (typeof x !== 'number') x = window.innerWidth / 2;
    if (typeof y !== 'number') y = window.innerHeight / 2;

    var canvas = document.createElement('canvas');
    canvas.className = 'fx-confetti-canvas';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    var colors = ['#C8A96E', '#4A90D9', '#FFE066', '#FFB3C6', '#A8D8FF'];
    var particles = [];
    var count = 42;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 4;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        vr: (Math.random() - .5) * 10,
        life: 1,
      });
    }

    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var elapsed = ts - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        p.vy += 0.12; // gravitasi
        p.x += p.vx; p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.012;
        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .6);
        ctx.restore();
      });
      if (elapsed < 1400) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  // ── TOAST — pesan singkat muncul di bawah, dipakai buat easter egg dll ──
  var _toastTimer = null;
  function toast(msg) {
    var el = document.querySelector('.fx-egg-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'fx-egg-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    clearTimeout(_toastTimer);
    requestAnimationFrame(function () { el.classList.add('show'); });
    _toastTimer = setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { if (el && el.parentNode) el.remove(); }, 400);
    }, 3200);
  }

  // ── KONAMI CODE — ↑↑↓↓←→←→BA ──
  var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var _progress = 0;
  document.addEventListener('keydown', function (e) {
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[_progress]) {
      _progress++;
      if (_progress === KONAMI.length) {
        _progress = 0;
        var lang = document.documentElement.getAttribute('data-lang') || 'id';
        toast(lang === 'id' ? '🎮 Konami Code! Kamu nemu easter egg tersembunyi.' : '🎮 Konami Code! You found a hidden easter egg.');
        confetti(window.innerWidth / 2, window.innerHeight * 0.3);
      }
    } else {
      _progress = (key === KONAMI[0]) ? 1 : 0;
    }
  });

  // ── SCRAMBLE — efek "decode" teks acak yang resolve jadi teks asli ──
  // Dipakai buat judul Part saat pertama kali muncul — nunjukin sisi teknis/hybrid.
  function scramble(el, duration) {
    if (!el || _skip()) return; // reduced-motion/lowEnd → langsung skip, teks asli tetap tampil
    var finalText = el.textContent;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=';
    var len = finalText.length;
    var totalFrames = Math.max(1, Math.round((duration || 700) / 32));
    var frame = 0;

    var timer = setInterval(function () {
      frame++;
      var revealCount = Math.floor((frame / totalFrames) * len);
      var out = '';
      for (var i = 0; i < len; i++) {
        var c = finalText[i];
        if (c === ' ' || c === '\n' || i < revealCount) { out += c; continue; }
        out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (frame >= totalFrames) {
        el.textContent = finalText; // pastikan hasil akhir 100% presisi
        clearInterval(timer);
      }
    }, 32);
  }

  return { confetti: confetti, toast: toast, scramble: scramble };

})();


// ═══════════════════════════════════════════════════════════════
// ██████████████████████  COMMAND PALETTE (CMDK)  █████████████
// ─────────────────────────────────────────────────────────────
// Ctrl/Cmd+K — lompat ke section/Part manapun secara instan.
// ═══════════════════════════════════════════════════════════════

var CMDK = (function () {
  'use strict';

  var s = { open: false, active: 0, results: [], lastFocus: null };

  // Masuk dulu ke Part 1 kalau masih di layar login, baru jalankan aksi
  function _ensureEntered(cb) {
    var p1 = document.getElementById('p1');
    if (p1 && !p1.classList.contains('active')) {
      if (typeof W !== 'undefined' && W.enter) W.enter();
      setTimeout(cb, 900);
    } else {
      cb();
    }
  }

  function _commands() {
    return [
      { ico:'🏠', id:'Hero', en:'Hero',              sub_id:'Ke bagian atas halaman', sub_en:'Back to the top', run:function () { _ensureEntered(function () { P1.to('hero'); }); } },
      { ico:'📋', id:'Tentang & CV', en:'About & CV', sub_id:'Ringkasan & CV lengkap', sub_en:'Overview & full CV', run:function () { _ensureEntered(function () { P1.to('cv'); }); } },
      { ico:'⚡', id:'Skill', en:'Skill',             sub_id:'Softskill & Hardskill', sub_en:'Soft & hard skills', run:function () { _ensureEntered(function () { P1.to('skill'); }); } },
      { ico:'🖼️', id:'Portofolio', en:'Portfolio',    sub_id:'Galeri karya', sub_en:'Work gallery', run:function () { _ensureEntered(function () { P1.go('porto'); }); } },
      { ico:'🧭', id:'Kenali Lebih Jauh', en:'Explore More', sub_id:'Analisis, game, tulisan', sub_en:'Analysis, gaming, writing', run:function () { _ensureEntered(function () { P1.go('explore'); }); } },
      { ico:'📌', id:'Sticky Note / Komentar', en:'Sticky Notes / Comments', sub_id:'Tinggalkan jejak', sub_en:'Leave a trace', run:function () { if (typeof SN !== 'undefined' && SN.goWall) SN.goWall(); } },
      { ico:'✉️', id:'Kontak', en:'Contact',          sub_id:'Email, IG, WA, dll', sub_en:'Email, IG, WA, etc.', run:function () { _ensureEntered(function () { P1.to('contact'); }); } },
      { ico:'🕰️', id:'Pengalaman', en:'Experience',   sub_id:'Jejak perjalanan', sub_en:'The journey timeline', run:function () { _ensureEntered(function () { P1.go('exp'); }); } },
      { ico:'🤝', id:'Skill Hub — Softskill', en:'Skill Hub — Softskill', sub_id:'Komunikasi, empati, dll', sub_en:'Communication, empathy, etc.', run:function () { _ensureEntered(function () { P1.go('softskill'); }); } },
      { ico:'⚙️', id:'Skill Hub — Hardskill', en:'Skill Hub — Hardskill', sub_id:'Tools & teknik', sub_en:'Tools & techniques', run:function () { _ensureEntered(function () { P1.go('hardskill'); }); } },
      { ico:'☀', id:'Ganti Tema', en:'Toggle Theme',   sub_id:'Light / Dark', sub_en:'Light / Dark', run:function () { if (typeof W !== 'undefined') W.theme(); } },
      { ico:'🌐', id:'Ganti Bahasa', en:'Toggle Language', sub_id:'Indonesia / English', sub_en:'Indonesian / English', run:function () { if (typeof W !== 'undefined') W.lang(); } },
      { ico:'🎵', id:'Toggle Musik', en:'Toggle Music', sub_id:'Play / pause', sub_en:'Play / pause', run:function () { if (typeof AM !== 'undefined') AM.toggleMusic(); } },
      { ico:'⌨️', id:'Pintasan Keyboard', en:'Keyboard Shortcuts', sub_id:'Lihat semua pintasan', sub_en:'View all shortcuts', run:function () { if (typeof KBD !== 'undefined') KBD.open(); } },
    ];
  }

  function open() {
    if (s.open) return;
    s.open = true;
    s.lastFocus = document.activeElement;
    var modal = document.getElementById('cmdkModal');
    var input = document.getElementById('cmdkInput');
    if (!modal) return;
    modal.removeAttribute('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        if (input) { input.value = ''; input.focus(); }
        _filter('');
      });
    });
  }

  function close() {
    if (!s.open) return;
    s.open = false;
    var modal = document.getElementById('cmdkModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(function () { modal.setAttribute('hidden', ''); }, 260);
    if (s.lastFocus && typeof s.lastFocus.focus === 'function') s.lastFocus.focus();
  }

  function toggle() { s.open ? close() : open(); }

  function _filter(query) {
    var lang = document.documentElement.getAttribute('data-lang') || 'id';
    var q = query.trim().toLowerCase();
    var all = _commands();
    s.results = !q ? all : all.filter(function (c) {
      var label = (lang === 'id' ? c.id : c.en).toLowerCase();
      var sub   = (lang === 'id' ? c.sub_id : c.sub_en).toLowerCase();
      return label.indexOf(q) !== -1 || sub.indexOf(q) !== -1;
    });
    s.active = 0;
    _render();
  }

  function _render() {
    var lang = document.documentElement.getAttribute('data-lang') || 'id';
    var list = document.getElementById('cmdkList');
    if (!list) return;
    list.innerHTML = '';

    if (s.results.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'cmdk-empty';
      empty.textContent = lang === 'id' ? 'Tidak ada hasil.' : 'No results.';
      list.appendChild(empty);
      return;
    }

    s.results.forEach(function (c, i) {
      var item = document.createElement('div');
      item.className = 'cmdk-item' + (i === s.active ? ' active' : '');
      item.setAttribute('role', 'option');
      item.innerHTML =
        '<span class="cmdk-item-ico" aria-hidden="true">' + c.ico + '</span>' +
        '<span class="cmdk-item-body">' +
          '<span class="cmdk-item-lbl">' + (lang === 'id' ? c.id : c.en) + '</span>' +
          '<span class="cmdk-item-sub">' + (lang === 'id' ? c.sub_id : c.sub_en) + '</span>' +
        '</span>';
      item.addEventListener('click', function () { _run(i); });
      list.appendChild(item);
    });
  }

  function _run(i) {
    var cmd = s.results[i];
    if (!cmd) return;
    close();
    setTimeout(function () { cmd.run(); }, 260);
  }

  function _initEvents() {
    var input = document.getElementById('cmdkInput');
    var scrim = document.getElementById('cmdkScrim');
    if (input) input.addEventListener('input', function () { _filter(input.value); });
    if (scrim) scrim.addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
      // Ctrl/Cmd+K — buka dari mana saja
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
        return;
      }
      // "/" — buka juga, kecuali sedang mengetik di input/textarea lain
      if (!s.open && e.key === '/' ) {
        var tag = (e.target && e.target.tagName) || '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); open(); }
        return;
      }
      if (!s.open) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); s.active = Math.min(s.active + 1, s.results.length - 1); _render(); _scrollActive(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); s.active = Math.max(s.active - 1, 0); _render(); _scrollActive(); }
      if (e.key === 'Enter')    { e.preventDefault(); _run(s.active); }
    });
  }

  function _scrollActive() {
    var list = document.getElementById('cmdkList');
    var el = list && list.children[s.active];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }

  document.addEventListener('DOMContentLoaded', _initEvents);

  return { open: open, close: close, toggle: toggle };

})();


// ═══════════════════════════════════════════════════════════════
// ██████████████████████  PANEL PINTASAN KEYBOARD (KBD)  ██████
// ═══════════════════════════════════════════════════════════════

var KBD = (function () {
  'use strict';

  var s = { open: false, lastFocus: null };

  function open() {
    if (s.open) return;
    s.open = true;
    s.lastFocus = document.activeElement;
    var el = document.getElementById('kbdHelp');
    if (!el) return;
    el.removeAttribute('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('open');
        el.setAttribute('aria-hidden', 'false');
        var x = document.getElementById('kbdHelpClose');
        if (x) x.focus();
      });
    });
  }

  function close() {
    if (!s.open) return;
    s.open = false;
    var el = document.getElementById('kbdHelp');
    if (!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    setTimeout(function () { el.setAttribute('hidden', ''); }, 260);
    if (s.lastFocus && typeof s.lastFocus.focus === 'function') s.lastFocus.focus();
  }

  function _initEvents() {
    var x     = document.getElementById('kbdHelpClose');
    var scrim = document.getElementById('kbdHelpScrim');
    if (x)     x.addEventListener('click', close);
    if (scrim) scrim.addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
      if (e.key === '?' && !s.open) {
        var tag = (e.target && e.target.tagName) || '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); open(); }
        return;
      }
      if (e.key === 'Escape' && s.open) close();
    });
  }
  document.addEventListener('DOMContentLoaded', _initEvents);

  return { open: open, close: close };

})();


// ═══════════════════════════════════════════════════════════════
// ██████  ESC KEY — tutup halaman full-page P5/P6/PE yang aktif  ██
// ─────────────────────────────────────────────────────────────
// Satu listener global — konsisten dengan Esc-to-close di P4 (modal).
// ═══════════════════════════════════════════════════════════════

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  var p5El = document.getElementById('p5');
  var p6El = document.getElementById('p6');
  var peEl = document.getElementById('pe');
  if (p5El && p5El.classList.contains('active') && typeof P5 !== 'undefined') P5.back();
  else if (p6El && p6El.classList.contains('active') && typeof P6 !== 'undefined') P6.back();
  else if (peEl && peEl.classList.contains('active') && typeof PE !== 'undefined') PE.back();
});


// ═══════════════════════════════════════════════════════════════
// ████████████████  BAGIAN LAIN — JS DI BAWAH SINI  ███████████
// ═══════════════════════════════════════════════════════════════