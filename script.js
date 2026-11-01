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

(function(){
  var p0 = document.getElementById('p0');
  var el = document.getElementById('p0Welcome');
  var banner = document.getElementById('p0Banner');
  var video = document.getElementById('p0Video');
  if (!p0 || !el) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // kosakata sambutan: sebanyak mungkin, kata terakhir selalu "Selamat Datang"
  var words = [
    'Welcome','ようこそ','환영합니다','Bonjour','Hola','Willkommen','Ciao','Olá','Добро пожаловать','欢迎',
    'مرحبا','नमस्ते','Merhaba','Sawubona','Aloha','Hej','Om Swastiastu','Welkom','Καλώς ήρθατε','ברוכים הבאים',
    'ยินดีต้อนรับ','Chào mừng','Maligayang pagdating','Karibu','Tervetuloa','Vítejte','Witamy','Üdvözöljük','Bine ați venit','Välkommen',
    'Haere mai','E komo mai','Bula vinaka','Afio mai','خوش آمدید','স্বাগতম','வரவேற்கிறோம்','Sugeng Rawuh','Wilujeng Sumping','Rahajeng Rauh',
    'Dobrodošli','Sveiki atvykę','Tere tulemast','Benvenuto','Bem-vindo','Bienvenido','Velkommen','Fáilte','Croeso','Dobro došli'
  ];
  var FINAL = 'Selamat Datang';
  var STEP = 90;          // ms per kata, konstan
  var MAX_WAIT = 8000;    // batas tunggu video (ms), lewat ini pakai gambar diam

  var mediaReady = false, mediaOk = false;
  function playVideo(){ if (mediaOk && video) { var pr = video.play(); if (pr && pr.catch) pr.catch(function(){}); } }
  function settle(ok){
    if (mediaReady) return;
    mediaReady = true; mediaOk = ok;
    if (ok && banner) banner.classList.add('has-media');
    if (ok && p0.classList.contains('done')) playVideo();   // video telat datang setelah "Lewati"
  }

  // lewati video kalau hemat data / koneksi lambat / tidak ada elemen video
  var conn = navigator.connection || {};
  var skipVideo = !video || conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || '');

  function startPreload(){
    if (skipVideo) { settle(false); return; }
    var useWebm = video.canPlayType && video.canPlayType('video/webm; codecs="vp9"');
    video.src = useWebm ? video.dataset.webm : video.dataset.mp4;
    video.addEventListener('canplaythrough', function(){ settle(true); }, {once:true});
    video.addEventListener('error', function(){ settle(false); }, {once:true});
    video.preload = 'auto';
    video.load();
    setTimeout(function(){ settle(mediaOk || (video.readyState >= 3)); }, MAX_WAIT);
  }

  var revealed = false;
  function reveal(){
    if (revealed) return; revealed = true;
    p0.classList.add('done');                                   // duar
    playVideo();
    setTimeout(function(){ p0.classList.add('ready'); }, 700);  // pop-up scroll
    document.documentElement.classList.remove('lock');
  }

  if (reduced) { el.textContent = FINAL; startPreload(); settle(true); p0.classList.add('done','ready'); document.documentElement.classList.remove('lock'); return; }

  document.documentElement.classList.add('lock');
  startPreload();                                               // download video dimulai bareng animasi halo

  var i = 0, passes = 0, timer;
  var skip = document.getElementById('p0Skip');
  if (skip) skip.addEventListener('click', function(){ clearInterval(timer); el.textContent = FINAL; reveal(); });
  window.IntroSkip = function(){ if (revealed) return; clearInterval(timer); el.textContent = FINAL; reveal(); };
  el.textContent = words[0];
  timer = setInterval(function(){
    i++;
    if (i >= words.length) { i = 0; passes++; }
    // minimal satu putaran penuh tampil; begitu video siap (atau batas waktu), langsung berhenti
    if (mediaReady && passes >= 1) {
      clearInterval(timer);
      el.textContent = FINAL;
      setTimeout(reveal, 600);
      return;
    }
    el.textContent = words[i];
  }, STEP);
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
    'Banner landscape 16:9. Taruh banner.webm / banner.mp4 + banner-poster.jpg di folder yang sama':'Landscape banner 16:9. Put banner.webm / banner.mp4 + banner-poster.jpg in the same folder',
    'Lanjut':'Continue',
    '03 SKILL':'03 SKILLS','04 KARYA':'04 WORK','05 JEJAK':'05 JOURNEY','06 LAINNYA':'06 MORE','07 KONTAK':'07 CONTACT',
    '<b>DKV × Teknik</b> · Singaraja, Bali · Tersedia untuk kolaborasi':'<b>DKV × Tech</b> · Singaraja, Bali · Open to collaboration',
    'Siswa DKV yang suka ngoding. Web ini aku bikin sendiri.':'A DKV student who likes coding. I built this site myself.',
    'Unduh CV (PDF)':'Download CV (PDF)',
    'Langsung ke Kontak':'Jump to Contact',
    'Foto formal, rasio 4:5, ganti dengan foto asli':'Formal photo, 4:5 ratio, replace with the real photo',
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
  function submit(btn){
    var name = document.getElementById('snFormName');
    var msg = document.getElementById('snFormMsg');
    if (!msg.value.trim()) { msg.focus(); return; }
    var n = { t: msg.value.trim(), n: name.value.trim() || 'anonim', c: ['y','p','b'][Math.floor(Math.random()*3)], r: (Math.random()*8-4).toFixed(1) };
    addNote(n);
    var all = load(); all.push(n); store(all);
    burst(btn);
    name.value=''; msg.value='';
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
  load().forEach(addNote);
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
  function clearTip(){ if (tipEl) tipEl.classList.remove('tip'); tipEl = null; }
  function setOpen(v, returnFocus){
    open = v; clearTip();
    if (v) orb.classList.remove('hint');
    orb.setAttribute('aria-expanded', String(v));
    if (v) {
      layout(); panel.classList.add('open');
      setTimeout(function(){ els[0].focus({ preventScroll:true }); }, 30);
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
  orb.addEventListener('click', function(){ if (Date.now() - dragEnd < 350) return; setOpen(!open); });

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
    var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
    if (touch && id.charAt(0) !== '_' && b !== tipEl) { clearTip(); tipEl = b; b.classList.add('tip'); return; }   // sentuh: tap pertama = tampilkan label
    if (id === '_theme') { Theme.set(Theme.get() === 'dark' ? 'light' : 'dark'); return; }
    if (id === '_lang') { I18N.set(I18N.get() === 'en' ? 'id' : 'en'); paint(); return; }
    setOpen(false); go(id);
  });
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

// Orb lahir di Hero setelah "Lanjut" ditekan. Hero kosong dulu; energi berkumpul, orb lahir lalu bersiap, kemudian
// meluncur ala sonic boom: gelombang kejut menyapu layar dan memunculkan isi Hero dari titik ledakan ke luar.
(function(){
  var root = document.documentElement;
  var wrap = document.getElementById('orbWrap'), orb = document.getElementById('orb'), fx = document.getElementById('orbFx');
  var btn = document.getElementById('p0Scroll'), p0 = document.getElementById('p0');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function showHero(){ root.classList.remove('hero-wait'); }
  if (!wrap || !orb || !Orb.home) { showHero(); return; }
  if (!fx || !orb.animate || reduced) { showHero(); Orb.home(); wrap.classList.add('ready'); return; }
  var started = false;
  function mk(css, parent){ var i = document.createElement('i'); i.style.cssText = css; (parent || fx).appendChild(i); return i; }
  function bz(s){ var u = 1 - s; return [3*u*u*s*.2 + 3*u*s*s*.25 + s*s*s, 3*u*u*s*.7 + 3*u*s*s + s*s*s]; }   // kurva gelombang kejut (.2,.7,.25,1)
  function tFor(y, dur){ var lo = 0, hi = 1; for (var k = 0; k < 24; k++) { var m = (lo + hi) / 2; if (bz(m)[1] < y) lo = m; else hi = m; } return bz((lo + hi) / 2)[0] * dur; }
  // cincin gelombang kejut: pita tipis yang melebar dan menipis
  function shock(x, y, S, dur, delay){
    return mk('width:' + S + 'px;height:' + S + 'px;margin:' + (-S / 2) + 'px 0 0 ' + (-S / 2) + 'px;left:' + x + 'px;top:' + y + 'px;opacity:0;background:radial-gradient(circle,transparent 52%,var(--accent) 58%,transparent 66%)').animate(
      [{ transform:'scale(.04)', opacity:.9 }, { opacity:.7, offset:.5 }, { transform:'scale(1)', opacity:0 }], { duration:dur, delay:delay || 0, easing:'cubic-bezier(.2,.7,.25,1)', fill:'forwards' });
  }
  // isi Hero muncul tepat saat gelombang kejut melewatinya
  function revealHero(mx, my, maxD){
    showHero();
    document.querySelectorAll('#hero .rv').forEach(function(e){
      e.classList.add('on');
      var r = e.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - mx, r.top + r.height / 2 - my);
      e.animate([{ opacity:0 }, { opacity:1 }], { duration:600, delay:tFor(Math.min(d / maxD, 1), 950), easing:'ease-out', fill:'backwards' });
    });
  }
  function charge(){
    if (started) return; started = true;
    orb.style.transition = 'none'; Orb.home(); void orb.offsetWidth; orb.style.transition = '';
    var r = orb.getBoundingClientRect(), fx0 = r.left + r.width / 2, fy0 = r.top + r.height / 2;
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, N = 48, last = 0, pts = [];
    for (var i = 0; i < N; i++) {
      var a = Math.random() * Math.PI * 2, d = 170 + Math.random() * 170, sz = 3 + Math.random() * 3, dur = 1600 + Math.random() * 1000, del = Math.random() * 800;
      last = Math.max(last, dur + del);
      var pt = mk('width:' + sz + 'px;height:' + sz + 'px;margin:' + (-sz / 2) + 'px 0 0 ' + (-sz / 2) + 'px;left:' + mx + 'px;top:' + my + 'px;opacity:0;background:' + (i % 3 ? 'var(--accent)' : 'var(--fg)'));
      pts.push(pt);
      pt.animate([{ transform:'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d + 'px) scale(.5)', opacity:0 }, { opacity:.9, offset:.3 }, { opacity:1, offset:.82 }, { transform:'translate(0,0) scale(.2)', opacity:0 }],
        { duration:dur, delay:del, easing:'cubic-bezier(.5,0,.9,.5)', fill:'forwards' });
    }
    var glow = mk('width:160px;height:160px;margin:-80px 0 0 -80px;left:' + mx + 'px;top:' + my + 'px;opacity:0;background:radial-gradient(circle,var(--accent),transparent 68%)');
    var ga = glow.animate([{ transform:'scale(.08)', opacity:0 }, { transform:'scale(1.1)', opacity:.7 }], { duration:last, easing:'cubic-bezier(.45,0,.9,.6)', fill:'forwards' });
    setTimeout(function(){
      var dx = mx - fx0, dy = my - fy0, vx = -dx, vy = -dy, ph = Math.atan2(vy, vx) + 'rad';
      orb.style.translate = dx + 'px ' + dy + 'px';
      wrap.classList.add('ready'); orb.classList.add('flying', 'pop');
      ga.cancel();
      pts.forEach(function(e){ e.remove(); });
      glow.animate([{ transform:'scale(1.1)', opacity:.7 }, { transform:'scale(2.4)', opacity:0 }], { duration:650, easing:'cubic-bezier(.23,1,.32,1)', fill:'forwards' });
      shock(mx, my, 220, 700, 0);
      // antisipasi: orb mengerut sebentar sebelum meluncur
      var squash = orb.animate([{ scale:'1 1' }, { scale:'.72 .72' }], { duration:520, delay:320, easing:'cubic-bezier(.23,1,.32,1)', fill:'forwards' });
      setTimeout(function(){ launch(mx, my, fx0, fy0, dx, dy, vx, vy, ph, squash); }, 900);
    }, last + 80);
  }
  function launch(mx, my, fx0, fy0, dx, dy, vx, vy, ph, squash){
    var D = 1100, E = 'cubic-bezier(.55,0,.1,1)', maxD = Math.hypot(Math.max(mx, window.innerWidth - mx), Math.max(my, window.innerHeight - my));
    squash.cancel(); orb.style.translate = '';
    // orb melesat: meregang paling panjang saat percepatan puncak, lalu merapat dan mendarat
    var fl = orb.animate([
      { translate:dx + 'px ' + dy + 'px', rotate:ph, scale:'.72 .72' },
      { rotate:ph, scale:'1.75 .58', offset:.2 },
      { rotate:ph, scale:'1.2 .86', offset:.6 },
      { translate:'0px 0px', rotate:ph, scale:'1 1' }], { duration:D, easing:E });
    // ledakan: gelombang kejut besar menyapu layar, kilatan, dan Hero muncul bersamanya
    shock(mx, my, maxD * 3.6, 950, 0);
    mk('left:0;top:0;width:100%;height:100%;border-radius:0;background:var(--accent);opacity:0').animate([{ opacity:.24 }, { opacity:0 }], { duration:520, easing:'ease-out', fill:'forwards' });
    revealHero(mx, my, maxD);
    // jejak di belakang orb: kerucut Mach (dua garis tepi), garis kecepatan, dan kabut uap
    var w = mk('left:' + mx + 'px;top:' + my + 'px;width:0;height:0;border-radius:0');
    w.animate([{ transform:'translate(0,0) rotate(' + ph + ')' }, { transform:'translate(' + vx + 'px,' + vy + 'px) rotate(' + ph + ')' }], { duration:D, easing:E, fill:'forwards' });
    function wk(el, tf, op){
      w.appendChild(el);
      el.animate([{ transform:tf(.1), opacity:0 }, { transform:tf(1), opacity:op, offset:.2 }, { transform:tf(.3), opacity:op * .6, offset:.6 }, { transform:tf(0), opacity:0 }], { duration:D, easing:E, fill:'forwards' });
    }
    function line(len, top, rot, bg, h){
      var l = document.createElement('i');
      l.style.cssText = 'position:absolute;left:' + (-len) + 'px;top:' + top + 'px;width:' + len + 'px;height:' + h + 'px;border-radius:2px;transform-origin:100% 50%;opacity:0;background:linear-gradient(to left,' + bg + ',transparent)';
      wk(l, function(sx){ return 'rotate(' + rot + 'deg) scaleX(' + sx + ')'; }, .85);
    }
    line(190, -1, 15, 'var(--accent)', 2); line(190, -1, -15, 'var(--accent)', 2);
    for (var k = 0; k < 6; k++) line(70 + Math.random() * 100, (k - 2.5) * 12, 0, 'var(--fg)', 1.5);
    var halo = document.createElement('i');
    halo.style.cssText = 'position:absolute;left:-60px;top:-60px;width:120px;height:120px;opacity:0;background:radial-gradient(circle,var(--accent),transparent 65%)';
    wk(halo, function(sx){ return 'scale(' + (.4 + sx * 1.1) + ')'; }, .55);
    // titik kecepatan puncak (progres jarak 50%) = 37% waktu: cincin kejut kedua tertinggal di jalur
    setTimeout(function(){ shock(mx + vx / 2, my + vy / 2, 420, 800, 0); shock(mx + vx / 2, my + vy / 2, 280, 700, 90); }, D * .37);
    fl.onfinish = function(){
      orb.classList.remove('flying', 'pop'); orb.classList.add('hint');
      shock(fx0, fy0, 160, 600, 0);
      setTimeout(function(){ fx.textContent = ''; }, 800);
    };
  }
  // pemicu utama: tombol "Lanjut", langsung tanpa jeda. Cadangan: pengunjung scroll sendiri keluar dari thumbnail.
  function check(){
    if (started) return;
    if (p0 && p0.getBoundingClientRect().bottom < window.innerHeight * 0.5) { window.removeEventListener('scroll', check); charge(); }
  }
  window.addEventListener('scroll', check, { passive:true });
  if (btn) btn.addEventListener('click', charge);
  // coba scroll di thumbnail: tombol "Lanjut" menyentak, mengajak diklik
  ['wheel', 'touchmove'].forEach(function(ev){
    window.addEventListener(ev, function(){ if (started || !btn || !btn.offsetParent) return; btn.classList.remove('nudge'); void btn.offsetWidth; btn.classList.add('nudge'); }, { passive:true });
  });
})();

I18N.init();
