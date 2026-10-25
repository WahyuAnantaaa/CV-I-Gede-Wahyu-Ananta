'use strict';

// "Welcome" berganti bahasa, crossfade (bukan potong-tempel instan) biar kerasa organik,
// makin lambat dengan sedikit variasi acak tiap langkah, bukan formula kaku berulang.
(function(){
  var el = document.getElementById('p0Welcome');
  if (!el) return;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var words = ['Welcome','ようこそ','환영합니다','Bonjour','Hola','Willkommen','Selamat Datang'];
  if (reduced) { el.textContent = words[words.length - 1]; return; }
  var i = 0;
  var FADE = 160;
  function step(){
    el.style.opacity = '0';
    setTimeout(function(){
      el.textContent = words[i];
      el.style.opacity = '1';
      i++;
      if (i >= words.length) return; // berhenti di kata terakhir
      var delay = FADE + 70 + (i * i * 12) + Math.random() * 50; // melambat + sedikit jitter alami
      setTimeout(step, delay);
    }, FADE);
  }
  step();
})();

// reveal on scroll — satu observer untuk semua zona
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); }
    });
  },{threshold:.12});
  document.querySelectorAll('.rv, .rv-snap, .hero-pop').forEach(function(el){ io.observe(el); });
} else {
  document.querySelectorAll('.rv, .rv-snap, .hero-pop').forEach(function(el){ el.classList.add('on'); });
}

// Skill zone: filter Softskill/Hardskill (pengganti Gate lama) + strip Teknis/Kreatif + detail card
var SkillCat = (function(){
  var DATA = {
    hard: {
      title:'Hardskill', sub:'Tools, teknik, dan platform yang terukur dan bisa dibuktikan.',
      overview:'Hardskill aku lahir dari dua dunia yang nggak biasa berdampingan. <strong>Sisi teknis</strong>, ekosistem Microsoft, logika data, dan cara kerja yang terstruktur. <strong>Sisi kreatif</strong>, Adobe Suite, desain visual, dan kemampuan bikin sesuatu yang nggak cuma benar, tapi juga indah dan komunikatif.',
      chips:['Microsoft 365','HTML & CSS','Adobe Suite','Tipografi','Visual Design','Logika Data'],
      tek: [
        {logo:'Wd',name:'Microsoft Word',pct:90,lvl:'Mahir',desc:'Dokumen profesional, laporan, dan penulisan terstruktur.',
          ex:['Laporan tugas sekolah dengan format akademik yang rapi.','Dokumen CV dan surat lamaran/formal lainnya.']},
        {logo:'Ex',name:'Microsoft Excel',pct:85,lvl:'Mahir',desc:'Spreadsheet, analisis data, dan visualisasi angka.',
          ex:['Rekap dan hitung data kegiatan organisasi/sekolah.','Anggaran sederhana untuk proyek kelas.']},
        {logo:'Pp',name:'Microsoft PowerPoint',pct:88,lvl:'Mahir',desc:'Presentasi profesional dan komunikasi visual terstruktur.',
          ex:['Slide presentasi untuk tugas kelompok dan individu.','Materi pitch ide atau konsep proyek.']},
        {logo:'Ht',name:'HTML & CSS',pct:75,lvl:'Cukup Mahir',desc:'Membangun tampilan web dari nol, termasuk web CV ini.',
          ex:['Membangun seluruh web CV ini dari nol, struktur sampai animasi.','Belajar CSS grid dan transition lewat eksperimen kecil berulang.']},
      ],
      kre: [
        {logo:'Ps',name:'Adobe Photoshop',pct:82,lvl:'Mahir',desc:'Photo editing, compositing, dan manipulasi digital.',
          ex:['Retouching foto profil untuk brand personal dan materi Instagram.','Poster tugas kelas DKV, compositing elemen visual buat presentasi.']},
        {logo:'Ai',name:'Adobe Illustrator',pct:78,lvl:'Mahir',desc:'Desain vektor, ilustrasi, dan identitas visual.',
          ex:['Logo dan ikon custom untuk proyek identitas visual sekolah.','Elemen grafis vektor yang dipakai di web CV ini.']},
        {logo:'Cc',name:'CapCut',pct:88,lvl:'Mahir',desc:'Video editing mobile dan konten kreatif.',
          ex:['Edit video pendek untuk Instagram dan TikTok pribadi.','Dokumentasi kegiatan sekolah jadi konten singkat.']},
        {logo:'Pr',name:'Premiere Pro',pct:70,lvl:'Cukup Mahir',desc:'Video editing profesional dan produksi konten.',
          ex:['Ikut menyunting video profil untuk keperluan sekolah.','Latihan color grading di waktu luang.']},
        {logo:'Cv',name:'Canva',pct:90,lvl:'Mahir',desc:'Desain grafis cepat dan presentasi visual.',
          ex:['Slide presentasi tugas kelompok dengan template konsisten.','Desain feed dan story Instagram pribadi.']},
        {logo:'Cd',name:'CorelDRAW',pct:65,lvl:'Cukup Mahir',desc:'Desain vektor dan layout publikasi cetak.',
          ex:['Layout materi cetak sekolah seperti banner dan pamflet.','Eksplorasi teknik vektor alternatif di luar Illustrator.']},
      ],
    },
    soft: {
      title:'Softskill', sub:'Cara Wahyu berpikir, berkomunikasi, dan berkolaborasi.',
      overview:'Softskill aku tumbuh dari dua arah yang saling menguatkan. <strong>Sisi teknis</strong> yang terlatih berpikir sistematis dan kritis, dan <strong>sisi kreatif</strong> yang peka sama manusia, konteks, dan nuansa yang nggak selalu bisa diukur angka.',
      chips:['Analitis','Problem Solving','Empati','Kolaborasi','Berpikir Kritis','Storytelling'],
      tek: [
        {logo:'Kr',name:'Berpikir Kritis',pct:85,lvl:'Mahir',desc:'Menganalisis masalah secara sistematis sebelum bertindak.',
          ex:['Mempertimbangkan alasan di balik tiap pilihan desain, bukan cuma insting.','Menelusuri akar masalah saat bug muncul, bukan asal coba-coba.']},
        {logo:'An',name:'Analitis',pct:88,lvl:'Mahir',desc:'Membaca data, pola, dan konteks dengan presisi sebelum mengambil keputusan desain.',
          ex:['Merancang struktur Part-per-Part yang rapi dan mudah diperluas di web CV.','Riset referensi desain sebelum menerapkan pola visual baru.']},
        {logo:'Pb',name:'Problem Solving',pct:84,lvl:'Mahir',desc:'Menemukan jalan keluar bahkan dari situasi kompleks, baik bug kode maupun kebuntuan desain.',
          ex:['Melacak dan memperbaiki bug carousel yang salah trigger klik.','Mencari pendekatan baru saat satu arah desain mentok.']},
        {logo:'Km',name:'Komunikasi',pct:80,lvl:'Mahir',desc:'Menyampaikan ide dengan jelas, terstruktur, dan tepat sasaran.',
          ex:['Menjelaskan konsep desain ke guru dan teman dengan runtut.','Menyampaikan kebutuhan proyek dengan jelas saat kerja bareng AI.']},
      ],
      kre: [
        {logo:'Em',name:'Empati',pct:85,lvl:'Mahir',desc:'Mendengar yang tidak diucapkan, memahami kebutuhan sebelum mulai mendesain.',
          ex:['Menggali kebutuhan asli di balik permintaan desain sebelum eksekusi.','Peka terhadap dinamika tim saat kerja proyek bersama.']},
        {logo:'Kv',name:'Kreativitas',pct:90,lvl:'Mahir',desc:'Menemukan solusi baru dari sudut pandang yang tidak biasa.',
          ex:['Merancang konsep sinematik dan hybrid identity untuk web CV ini.','Mencari pendekatan berbeda saat mengerjakan tugas kreatif sekolah.']},
        {logo:'Kl',name:'Kolaborasi',pct:82,lvl:'Mahir',desc:'Bekerja bersama tanpa ego, membagi peran, menghasilkan lebih banyak daripada kerja sendiri.',
          ex:['Berbagi peran desain dan eksekusi di tugas kelompok DKV.','Membangun web CV ini secara iteratif bareng AI, Part demi Part.']},
        {logo:'St',name:'Storytelling',pct:78,lvl:'Cukup Mahir',desc:'Menyampaikan pesan dengan cara yang terasa dan diingat.',
          ex:['Menyusun alur cerita dari intro sampai kontak biar terasa sinematik.','Menulis caption yang punya nada dan pesan, bukan cuma deskripsi.']},
      ],
    },
  };

  function render(cat){
    var d = DATA[cat];
    document.getElementById('skillTitle').textContent = d.title;
    document.getElementById('skillSub').textContent = d.sub;
    document.getElementById('skillOverview').innerHTML = d.overview;
    document.getElementById('skillChips').innerHTML = d.chips.map(function(c){ return '<span class="skill-chip">'+c+'</span>'; }).join('');

    ['tek','kre'].forEach(function(grp){
      var wrap = document.getElementById(grp === 'tek' ? 'skillStripTek' : 'skillStripKre');
      wrap.innerHTML = d[grp].map(function(item, i){
        return '<div class="skill-row'+(i===0 && grp==='tek' ? ' active':'')+'" onclick="SkillCat.pick(\''+cat+'\',\''+grp+'\','+i+',this)">'+
          '<span class="skill-mono">'+item.logo+'</span>'+
          '<span class="skill-name">'+item.name+'</span>'+
          '<span class="skill-lvl">'+item.lvl+' <b>'+item.pct+'%</b></span></div>';
      }).join('');
    });

    pick(cat, 'tek', 0);
  }

  function pick(cat, grp, idx){
    document.querySelectorAll('.skill-row').forEach(function(r){ r.classList.remove('active'); });
    var wrap = document.getElementById(grp === 'tek' ? 'skillStripTek' : 'skillStripKre');
    if (wrap.children[idx]) wrap.children[idx].classList.add('active');
    var item = DATA[cat][grp][idx];
    document.getElementById('detailLogo').textContent = item.logo;
    document.getElementById('detailName').textContent = item.name;
    document.getElementById('detailFill').style.width = item.pct + '%';
    document.getElementById('detailDesc').textContent = item.desc;
    document.getElementById('detailExamples').innerHTML = item.ex.map(function(e){ return '<li>'+e+'</li>'; }).join('');
  }

  function set(cat, btn){
    document.querySelectorAll('.skill-cat-toggle button').forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    render(cat);
  }

  render('hard'); // script ada di akhir body, DOM udah ada — DOMContentLoaded udah lewat, jangan nunggu event itu lagi

  return { set: set, pick: pick };
})();

// Sticky note demo affordance — 1 state contoh, bukan sistem penuh.
// Submit dikasih reward kecil (confetti ringan) biar kerasa memuaskan pas "nempel" —
// ini yang bikin orang mau balik lagi, bukan cuma fungsional doang.
var SNDemo = (function(){
  function toggle(){ document.getElementById('snForm').classList.toggle('open'); }

  function submit(btn){
    var name = document.getElementById('snFormName');
    var msg = document.getElementById('snFormMsg');
    if (!msg.value.trim()) { msg.focus(); return; }

    // note baru numpuk di wall demo, konsisten sama gaya overlap yang udah ada
    var wall = document.querySelector('.sn-wrap');
    var colors = ['y','p','b'];
    var note = document.createElement('div');
    note.className = 'sn ' + colors[Math.floor(Math.random()*3)];
    note.style.transform = 'rotate(' + (Math.random()*8-4).toFixed(1) + 'deg)';
    note.innerHTML = (msg.value.trim()) + '<div class="sn-foot">' + (name.value.trim() || 'anonim') + '</div>';
    wall.insertBefore(note, wall.lastElementChild);

    burst(btn);
    name.value = ''; msg.value = '';
    document.getElementById('snForm').classList.remove('open');
  }

  function burst(fromEl){
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var rect = fromEl.getBoundingClientRect();
    var colors = ['#FFD43B','#FF8FA8','#7CC2FF','#FFE066'];
    for (var i = 0; i < 14; i++){
      var p = document.createElement('span');
      var angle = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 60;
      p.style.cssText = 'position:fixed;left:'+(rect.left+rect.width/2)+'px;top:'+(rect.top+rect.height/2)+'px;'+
        'width:6px;height:6px;background:'+colors[i%4]+';border-radius:1px;pointer-events:none;z-index:999;'+
        'transition:transform .6s cubic-bezier(.16,1,.3,1),opacity .6s ease;opacity:1';
      document.body.appendChild(p);
      requestAnimationFrame(function(el, ang, d){
        return function(){
          el.style.transform = 'translate('+(Math.cos(ang)*d)+'px,'+(Math.sin(ang)*d-20)+'px) rotate('+(Math.random()*180)+'deg)';
          el.style.opacity = '0';
        };
      }(p, angle, dist));
      setTimeout(function(el){ el.remove(); }, 650, p);
    }
  }

  return { toggle: toggle, submit: submit };
})();

// CV mode toggle — Ringkas / Lengkap
var CVMode = (function(){
  function set(mode, btn){
    document.querySelectorAll('.cv-toggle button').forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    document.querySelectorAll('.cv-mode').forEach(function(m){ m.classList.toggle('active', m.dataset.mode === mode); });
  }
  return { set: set };
})();

// Curtain P0 -> P1: dipicu murni lewat IntersectionObserver, bukan CSS eksperimental
// (animation-timeline:scroll() dibuang, itu sumber bug "P0 nggak muncul") dan bukan scroll
// listener polos juga. Sentinel 1px ditaruh persis di bawah p0-pin-wrap; begitu dia masuk
// viewport (artinya user udah scroll ngelewatin P0), gorden dibuka lewat toggle class + transition.
(function(){
  var pin = document.getElementById('p0Pin');
  var sentinel = document.getElementById('p0Sentinel');
  if (!pin || !sentinel) return;

  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ pin.classList.toggle('opening', e.isIntersecting); });
    }, { threshold: 0 });
    io.observe(sentinel);
  }
  // Kalau IO tidak tersedia (browser sangat lama): biarkan P0 statis diam,
  // tetap kelihatan penuh, cuma tanpa efek buka gorden. Tidak pernah nge-block konten.
})();

// EXP tab switch
var PE = (function(){
  function tab(name){
    document.querySelectorAll('.pe-tab').forEach(function(t){ t.classList.toggle('active', t.dataset.c === name); });
    document.querySelectorAll('.pe-panel').forEach(function(p){ p.classList.toggle('active', p.dataset.c === name); });
  }
  return { tab: tab };
})();
