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

    m.play().catch(function () {});
    s.musicOn = true;
    _setPlayUI(true);
    _syncUI();
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
      m.play().catch(function () {
        alert('⚠️ File audio tidak ditemukan. Cek path di variabel audioFiles.');
      });
      s.musicOn = true;
      _setPlayUI(true);
    }
    _syncUI();
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
    lang:    'id',
    theme:   'light',
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
    updateMetaTheme();
    revealUI();
    _initBgFade();
  });

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
    if (typeof P1 !== 'undefined' && P1.sync) P1.sync();
  }

  // ── TOGGLE BAHASA ──
  function toggleLang() {
    s.lang = s.lang === 'id' ? 'en' : 'id';
    document.documentElement.setAttribute('data-lang', s.lang);
    var lbl = document.getElementById('langLbl');
    if (lbl) lbl.textContent = s.lang === 'id' ? 'EN' : 'ID';

    document.querySelectorAll('[data-id]').forEach(function (el) {
      var v = s.lang === 'id' ? el.getAttribute('data-id') : el.getAttribute('data-en');
      if (v !== null) el.textContent = v;
    });

    if (typeof P1 !== 'undefined' && P1.sync) P1.sync();
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

    // Touch
    wrap.addEventListener('touchstart', function (e) {
      cr.dragStartX = e.touches[0].clientX;
      cr.dragging   = true;
      _crStopAuto();
    }, { passive: true });
    wrap.addEventListener('touchmove', function (e) {
      if (!cr.dragging) return;
      cr.dragDeltaX = e.touches[0].clientX - cr.dragStartX;
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
      _crStopAuto();
    });
    window.addEventListener('mousemove', function (e) {
      if (!cr.dragging) return;
      cr.dragDeltaX = e.clientX - cr.dragStartX;
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
      var labels = {
        softskill: 'Softskill — Part 3A',
        hardskill: 'Hardskill — Part 3B',
        porto:     'Portofolio — Part 6',
        explore:   'Kenali Lebih Jauh — Part EXP',
        comment:   'Komentar — Part 8',
        contact:   'Kontak — Part 9',
        exp:       'Pengalaman — Part 5',
      };
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
      } else {
        alert('⏳ ' + (labels[target] || target) + ' — akan disambung saat Part selesai dibangun.');
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

    // ✏️ EDIT: Ganti dengan Firebase saat Part 8 dibangun
    var preview = document.getElementById('p1CmPreview');
    if (preview) {
      var item = document.createElement('div');
      item.className = 'p1-cm-item';
      item.style.opacity   = '0';
      item.style.transform = 'translateY(8px)';
      item.innerHTML =
        '<span class="p1-cm-user">● ' + _esc(name) + '</span>' +
        '<p class="p1-cm-msg">"' + _esc(msg) + '"</p>' +
        '<span class="p1-cm-time">baru saja</span>';
      preview.insertBefore(item, preview.firstChild);
      requestAnimationFrame(function () {
        item.style.transition = 'opacity .4s ease, transform .4s var(--ease)';
        item.style.opacity    = '1';
        item.style.transform  = 'translateY(0)';
      });
    }
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
    _setEl('p2Z1Title', function (el) { el.textContent = lang === 'id' ? d.title_id : d.title_en; });
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
      // ✏️ EDIT: Ganti alert dengan P3.init(s.ctx, type) saat Part 3 selesai dibangun
      alert('⏳ Part 3 (' + s.ctx + ' — ' + type + ') — akan disambung saat Part 3 selesai dibangun.');
      if (overlay) overlay.classList.remove('show');
    }, 520);
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