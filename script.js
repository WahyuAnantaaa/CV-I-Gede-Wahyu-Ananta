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

var SkillCat = (function(){
  var DATA = {
    hard: {
      title:'Hardskill',
      overview:'Hardskill aku lahir dari dua dunia yang nggak biasa berdampingan. <strong>Sisi teknis</strong>: ekosistem Microsoft, logika data, dan cara kerja yang terstruktur. <strong>Sisi kreatif</strong>: Adobe Suite, desain visual, dan kemampuan bikin sesuatu yang nggak cuma benar, tapi juga indah dan komunikatif.',
      tek:[
        {name:'Microsoft Word',pct:90,lvl:'Mahir',desc:'Dokumen profesional, laporan, dan penulisan terstruktur.',ex:['Laporan tugas sekolah dengan format akademik yang rapi.','Dokumen CV dan surat lamaran atau formal lainnya.']},
        {name:'Microsoft Excel',pct:85,lvl:'Mahir',desc:'Spreadsheet, analisis data, dan visualisasi angka.',ex:['Rekap dan hitung data kegiatan organisasi atau sekolah.','Anggaran sederhana untuk proyek kelas.']},
        {name:'Microsoft PowerPoint',pct:88,lvl:'Mahir',desc:'Presentasi profesional dan komunikasi visual terstruktur.',ex:['Slide presentasi untuk tugas kelompok dan individu.','Materi pitch ide atau konsep proyek.']},
        {name:'HTML & CSS',pct:75,lvl:'Cukup Mahir',desc:'Membangun tampilan web dari nol, termasuk web CV ini.',ex:['Membangun seluruh web CV ini dari nol, struktur sampai animasi.','Belajar CSS grid dan transition lewat eksperimen kecil berulang.']}
      ],
      kre:[
        {name:'Adobe Photoshop',pct:82,lvl:'Mahir',desc:'Photo editing, compositing, dan manipulasi digital.',ex:['Retouching foto profil untuk brand personal dan materi Instagram.','Poster tugas kelas DKV, compositing elemen visual untuk presentasi.']},
        {name:'Adobe Illustrator',pct:78,lvl:'Mahir',desc:'Desain vektor, ilustrasi, dan identitas visual.',ex:['Logo dan ikon custom untuk proyek identitas visual sekolah.','Elemen grafis vektor yang dipakai di web CV ini.']},
        {name:'CapCut',pct:88,lvl:'Mahir',desc:'Video editing mobile dan konten kreatif.',ex:['Edit video pendek untuk Instagram dan TikTok pribadi.','Dokumentasi kegiatan sekolah jadi konten singkat.']},
        {name:'Premiere Pro',pct:70,lvl:'Cukup Mahir',desc:'Video editing profesional dan produksi konten.',ex:['Ikut menyunting video profil untuk keperluan sekolah.','Latihan color grading di waktu luang.']},
        {name:'Canva',pct:90,lvl:'Mahir',desc:'Desain grafis cepat dan presentasi visual.',ex:['Slide presentasi tugas kelompok dengan template konsisten.','Desain feed dan story Instagram pribadi.']},
        {name:'CorelDRAW',pct:65,lvl:'Cukup Mahir',desc:'Desain vektor dan layout publikasi cetak.',ex:['Layout materi cetak sekolah seperti banner dan pamflet.','Eksplorasi teknik vektor alternatif di luar Illustrator.']}
      ]
    },
    soft: {
      title:'Softskill',
      overview:'Softskill aku tumbuh dari dua arah yang saling menguatkan. <strong>Sisi teknis</strong> yang terlatih berpikir sistematis dan kritis, dan <strong>sisi kreatif</strong> yang peka sama manusia, konteks, dan nuansa yang nggak selalu bisa diukur angka.',
      tek:[
        {name:'Berpikir Kritis',pct:85,lvl:'Mahir',desc:'Menganalisis masalah secara sistematis sebelum bertindak.',ex:['Mempertimbangkan alasan di balik tiap pilihan desain, bukan cuma insting.','Menelusuri akar masalah saat bug muncul, bukan asal coba-coba.']},
        {name:'Analitis',pct:88,lvl:'Mahir',desc:'Membaca data, pola, dan konteks dengan presisi.',ex:['Merancang struktur Part-per-Part yang rapi dan mudah diperluas.','Riset referensi desain sebelum menerapkan pola visual baru.']},
        {name:'Problem Solving',pct:84,lvl:'Mahir',desc:'Menemukan jalan keluar dari situasi kompleks.',ex:['Melacak dan memperbaiki bug carousel yang salah trigger klik.','Mencari pendekatan baru saat satu arah desain mentok.']},
        {name:'Komunikasi',pct:80,lvl:'Mahir',desc:'Menyampaikan ide dengan jelas dan tepat sasaran.',ex:['Menjelaskan konsep desain ke guru dan teman dengan runtut.','Menyampaikan kebutuhan proyek dengan jelas saat kerja bareng AI.']}
      ],
      kre:[
        {name:'Empati',pct:85,lvl:'Mahir',desc:'Mendengar yang tidak diucapkan, hadir sepenuhnya.',ex:['Menggali kebutuhan asli di balik permintaan desain sebelum eksekusi.','Peka terhadap dinamika tim saat kerja proyek bersama.']},
        {name:'Kreativitas',pct:90,lvl:'Mahir',desc:'Menemukan solusi baru dari sudut pandang tak biasa.',ex:['Merancang konsep sinematik dan hybrid identity untuk web CV ini.','Mencari pendekatan berbeda saat mengerjakan tugas kreatif sekolah.']},
        {name:'Kolaborasi',pct:82,lvl:'Mahir',desc:'Bekerja bersama tanpa ego, membagi peran.',ex:['Berbagi peran desain dan eksekusi di tugas kelompok DKV.','Membangun web CV ini secara iteratif bareng AI, Part demi Part.']},
        {name:'Storytelling',pct:78,lvl:'Cukup Mahir',desc:'Menyampaikan pesan dengan cara yang diingat.',ex:['Menyusun alur cerita dari intro sampai kontak biar terasa sinematik.','Menulis caption yang punya nada dan pesan, bukan cuma deskripsi.']}
      ]
    }
  };

  function rowHTML(item, idx){
    var n = String(idx+1).padStart(2,'0');
    return '<div class="skill-row">'+
      '<div class="skill-row-head" onclick="SkillCat.toggle(this)">'+
        '<span class="skill-row-num">'+n+'</span>'+
        '<span class="skill-row-name">'+item.name+'</span>'+
        '<span class="skill-row-lvl">'+item.lvl+' <b>'+item.pct+'%</b></span>'+
        '<span class="skill-row-plus">+</span>'+
      '</div>'+
      '<div class="skill-row-body"><div class="skill-row-body-in">'+item.desc+
        '<ul class="dot-list">'+item.ex.map(function(e){ return '<li>'+e+'</li>'; }).join('')+'</ul>'+
      '</div></div>'+
    '</div>';
  }

  function render(cat){
    var d = DATA[cat];
    document.getElementById('skillOverview').innerHTML = d.overview;
    document.getElementById('skillTek').innerHTML = '<p class="skill-group-lbl">TEKNIS</p>' + d.tek.map(rowHTML).join('');
    document.getElementById('skillKre').innerHTML = '<p class="skill-group-lbl">KREATIF</p>' + d.kre.map(rowHTML).join('');
  }

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
  return { set: set, toggle: toggle };
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
  function submit(btn){
    var name = document.getElementById('snFormName');
    var msg = document.getElementById('snFormMsg');
    if (!msg.value.trim()) { msg.focus(); return; }
    var wall = document.querySelector('.sn-wrap');
    var colors = ['y','p','b'];
    var note = document.createElement('div');
    note.className = 'sn ' + colors[Math.floor(Math.random()*3)];
    note.style.transform = 'rotate(' + (Math.random()*8-4).toFixed(1) + 'deg)';
    var text = document.createTextNode(msg.value.trim());
    var foot = document.createElement('div');
    foot.className = 'sn-foot';
    foot.textContent = name.value.trim() || 'anonim';
    note.appendChild(text); note.appendChild(foot);
    wall.insertBefore(note, wall.lastElementChild);
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
  return { toggle:toggle, submit:submit };
})();
