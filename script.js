/* script.js — All-in-one for AZA Zurich app
   Features:
   - Waktu solat (dropdown + auto-detect)
   - Cuaca (Open-Meteo)
   - Produk Zurich + modal + WhatsApp quotation
   - Kuiz interaktif
   - Fruit Slice Game v2 (fullscreen modal, big fruits, juice splashes, sounds)
   Copy & replace whole existing script.js with this file.
*/

document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const WA_NUMBER = '60192506999';

  /*** ===== WAKTU SOLAT & CUACA ===== ***/
  const negeriSelect = $('#negeriSelect');
  const solatResult = $('#solatResult');
  const cuacaResult = $('#cuacaResult');
  const btnDetect = $('#btnDetect');

  const COORDS = {
    "WLY01":[3.139,101.6869],"WLY02":[2.9265,101.6965],"SGR01":[3.0738,101.5183],"PNG01":[5.4164,100.3327],
    "PRK01":[4.5975,101.0901],"JHR01":[1.4927,103.7414],"KTN01":[6.1254,102.2381],"KDH01":[6.1184,100.3685],
    "MLK01":[2.1896,102.2501],"NSN01":[2.7258,101.9424],"PHG01":[3.8126,103.3256],"PLS01":[6.4447,100.2046],
    "SBH01":[5.978,116.0753],"SWK01":[1.5533,110.3592],"TRG01":[5.3302,103.1408],"LBN01":[5.2831,115.2308]
  };

  async function fetchWaktuFromESolat(zone){
    solatResult.textContent = '⏳ Memuatkan waktu solat...';
    try {
      const r = await fetch(`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`);
      const data = await r.json();
      if (data && data.prayerTime && data.prayerTime[0]) {
        const d = data.prayerTime[0];
        solatResult.innerHTML = `
          <strong>Zon: ${data.zone || zone}</strong><br>
          🌅 Subuh: <b>${d.fajr}</b>&nbsp; ☀️ Syuruk: <b>${d.syuruk || d.sunrise || '-'}</b><br>
          🕌 Zohor: <b>${d.dhuhr || d.dhuhr}</b><br>
          🌇 Asar: <b>${d.asr}</b> &nbsp; 🌆 Maghrib: <b>${d.maghrib}</b> &nbsp; 🌃 Isyak: <b>${d.isha}</b><br>
          <small>Tarikh: ${d.date || d.Tarikh || '-'}</small>
        `;
      } else {
        throw new Error('tiada data eSolat');
      }
    } catch (err) {
      console.warn('eSolat failed', err);
      // fallback suggestion: try alternative API (optional)
      solatResult.textContent = '❌ Gagal memuatkan waktu solat (eSolat).';
    }
  }

  async function fetchCuacaByCoords(lat, lon){
    cuacaResult.textContent = '⛅ Memuatkan cuaca...';
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
      const d = await r.json();
      if (d && d.current_weather) {
        cuacaResult.innerHTML = `🌡️ ${d.current_weather.temperature}°C — 🌬️ ${d.current_weather.windspeed} km/h`;
      } else {
        throw new Error('no weather');
      }
    } catch (err) {
      console.warn('weather failed', err);
      cuacaResult.textContent = '❌ Gagal memuatkan cuaca.';
    }
  }

  // Select change
  if (negeriSelect) {
    negeriSelect.addEventListener('change', () => {
      const zone = negeriSelect.value;
      if (!zone) return;
      fetchWaktuFromESolat(zone);
      const c = COORDS[zone];
      if (c) fetchCuacaByCoords(c[0], c[1]);
    });
  }

  // Auto detect
  if (btnDetect) {
    btnDetect.addEventListener('click', () => {
      if (!navigator.geolocation) { alert('Geolocation tidak disokong.'); return; }
      navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        // reverse geocode to guess zone
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const jd = await res.json();
          const negeriName = jd.principalSubdivision || jd.city || jd.locality;
          const zoneMap = {
            "Kuala Lumpur":"WLY01","Putrajaya":"WLY02","Selangor":"SGR01","Pulau Pinang":"PNG01","Perak":"PRK01",
            "Johor":"JHR01","Kelantan":"KTN01","Kedah":"KDH01","Melaka":"MLK01","Negeri Sembilan":"NSN01",
            "Pahang":"PHG01","Perlis":"PLS01","Sabah":"SBH01","Sarawak":"SWK01","Terengganu":"TRG01","Labuan":"LBN01"
          };
          let pickedZone = null;
          if (negeriName) {
            for (const [k,v] of Object.entries(zoneMap)){
              if (negeriName.toLowerCase().includes(k.toLowerCase())) { pickedZone = v; break; }
            }
          }
          if (!pickedZone) {
            fetchCuacaByCoords(lat, lon);
            alert('Tidak dapat kenal pasti negeri secara automatik. Sila pilih negeri secara manual.');
            return;
          }
          negeriSelect.value = pickedZone;
          fetchWaktuFromESolat(pickedZone);
          fetchCuacaByCoords(lat, lon);
        } catch (err) {
          console.warn('reverse geocode failed', err);
          alert('Gagal detect lokasi automatik. Sila pilih negeri secara manual.');
        }
      }, () => {
        alert('Akses lokasi ditolak. Pilih negeri secara manual.');
      }, {timeout:10000});
    });
  }

  /*** ===== PRODUK & QUOTE (modal -> WhatsApp) ===== ***/
  const produkList = [
    { id:'zdrive', title:'Z-Drive Assist', desc:'Bantuan tepi jalan 24/7, towing & khidmat kecemasan.' },
    { id:'zmotor', title:'Z-Motor', desc:'Pelan Takaful Motor untuk perlindungan kemalangan, kecurian & kebakaran.' },
    { id:'zrider', title:'Z-Rider', desc:'Takaful khas untuk penunggang motosikal & skuter.' },
    { id:'ztravel', title:'Z-Travel', desc:'Perlindungan perjalanan — kelewatan, kehilangan bagasi & kecemasan perubatan.' },
    { id:'zpa', title:'Personal Accident', desc:'Perlindungan kemalangan diri 24/7.' },
    { id:'zfirebiz', title:'Fire Takaful (Business)', desc:'Perlindungan premis perniagaan daripada kebakaran & kerugian aset.' }
  ];
  const produkGrid = $('#produkGrid');
  produkList.forEach(p => {
    if (!produkGrid) return;
    const el = document.createElement('div');
    el.className = 'produk-card';
    el.dataset.id = p.id;
    el.innerHTML = `<h4>${p.title}</h4><p>${p.desc}</p>`;
    el.addEventListener('click', () => openProdukModal(p));
    produkGrid.appendChild(el);
  });

  const modalProduk = $('#modalProduk');
  const produkInfoBox = $('#produkInfoBox');
  const closeProduk = $('#closeProduk');
  const quoteForm = $('#quoteForm');
  const cancelQuote = $('#cancelQuote');

  function openProdukModal(p){
    produkInfoBox.innerHTML = `<h3>${p.title}</h3><p>${p.desc}</p>`;
    if (!modalProduk) return;
    modalProduk.classList.add('show');
    modalProduk.setAttribute('aria-hidden', 'false');
    // clear form
    $('#q_nama').value = ''; $('#q_tel').value = ''; $('#q_email').value = ''; $('#q_msg').value = '';
    quoteForm.dataset.product = p.title;
  }
  if (closeProduk) closeProduk.addEventListener('click', ()=> { modalProduk.classList.remove('show'); modalProduk.setAttribute('aria-hidden','true'); } );
  window.addEventListener('click', e => { if (e.target === modalProduk) { modalProduk.classList.remove('show'); modalProduk.setAttribute('aria-hidden','true'); }});
  if (cancelQuote) cancelQuote.addEventListener('click', ()=> { modalProduk.classList.remove('show'); modalProduk.setAttribute('aria-hidden','true'); });

  if (quoteForm) {
    quoteForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const nama = $('#q_nama').value.trim();
      const tel = $('#q_tel').value.trim();
      const email = $('#q_email').value.trim();
      const msg = $('#q_msg').value.trim();
      const prod = quoteForm.dataset.product || 'Zurich Takaful';
      const text = encodeURIComponent(`Assalamualaikum, saya nak minta quotation produk ${prod}.\nNama: ${nama}\nTelefon: ${tel}\nEmail: ${email}\nMesej: ${msg}`);
      window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank');
      produkInfoBox.insertAdjacentHTML('beforeend', `<p style="color:green;margin-top:8px">✅ Borang dibuka di WhatsApp</p>`);
      setTimeout(()=>{ modalProduk.classList.remove('show'); modalProduk.setAttribute('aria-hidden','true'); }, 1600);
    });
  }

  /*** ===== QUIZ ===== ***/
  const quizData = [
    { q:"Apakah tujuan utama takaful?", o:["Tolong-menolong (mutual help)","Untung individu semata","Insurans konvensional"], a:0 },
    { q:"Produk mana sesuai untuk penunggang motosikal/skuter?", o:["Z-Rider","Z-Travel","Fire Takaful"], a:0 },
    { q:"Apakah yang Z-Drive Assist tawarkan?", o:["Bantuan tepi jalan & towing","Takaful nyawa","Insurans rumah"], a:0 },
    { q:"Apakah kelebihan takaful berbanding insurans konvensional?", o:["Konsep tolong-menolong & tabarru'","Bayaran premium lebih rendah sentiasa","Tiada klausa"], a:0 }
  ];
  let qIndex = 0, qScore = 0;
  const quizQ = $('#quizQuestion'), quizO = $('#quizOptions'), startQuizBtn = $('#startQuiz');

  function showQuizQuestion(){
    const q = quizData[qIndex];
    quizQ.textContent = q.q;
    quizO.innerHTML = '';
    q.o.forEach((opt, i) => {
      const b = document.createElement('button'); b.className='cta'; b.textContent = opt;
      b.addEventListener('click', () => {
        if (i === q.a) qScore++;
        qIndex++;
        if (qIndex < quizData.length) showQuizQuestion();
        else finishQuiz();
      });
      quizO.appendChild(b);
    });
  }
  function finishQuiz(){
    quizQ.innerHTML = `✅ Kuiz Tamat! Skor: <strong>${qScore}/${quizData.length}</strong>`;
    quizO.innerHTML = `<button id="quizRestart" class="cta">Ulang Kuiz</button>`;
    $('#quizRestart').addEventListener('click', ()=> {
      qIndex=0; qScore=0; startQuizBtn.style.display='inline-block'; quizQ.textContent='Tekan "Mula Kuiz" untuk mula.'; quizO.innerHTML='';
    });
  }
  if (startQuizBtn) startQuizBtn.addEventListener('click', () => { startQuizBtn.style.display='none'; qIndex=0; qScore=0; showQuizQuestion(); });

  /*** ===== FRUIT SLICE GAME v2 (uses fruitCanvas id 'fruitCanvas') ===== ***/
  const openFruitGameBtn = $('#openFruitGame');
  const fruitModal = $('#fruitModal');
  const fgCanvas = $('#fruitCanvas');
  const fgPause = $('#fgPause');
  const fgRestart = $('#fgRestart');
  const fgClose = $('#fgClose');
  const fgScore = $('#fgScore');
  const fgOverlay = $('#fgOverlay');
  const fgFinalScore = $('#fgFinalScore');
  const fgOverlayRestart = $('#fgOverlayRestart');

  // audio
  const S_SLICE = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_896b8b71f1.mp3?filename=slice-1.mp3');
  const S_POP = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_2f6b6b1.mp3?filename=pop-1.mp3');
  const S_BOMB = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_f7a0b7b0.mp3?filename=explode-01.mp3');

  // canvas context & sizing
  let ctx = null, DPR = window.devicePixelRatio || 1, W = 0, H = 0;
  function resizeFG(){
    DPR = window.devicePixelRatio || 1;
    fgCanvas.style.height = (window.innerHeight - 140) + 'px';
    fgCanvas.style.width = '100%';
    fgCanvas.width = Math.floor(fgCanvas.clientWidth * DPR);
    fgCanvas.height = Math.floor(fgCanvas.clientHeight * DPR);
    if (!ctx) ctx = fgCanvas.getContext('2d');
    ctx.setTransform(DPR,0,0,DPR,0,0);
    W = fgCanvas.clientWidth; H = fgCanvas.clientHeight;
  }

  // state
  let items = [], particles = [], slicePath = [], isRunning = false, isPaused = false, scoreFG = 0, spawnTimer = 0, spawnInterval = 900, lastTime = 0;
  const FRUITS = [
    { name:'apple', color:'#ff5252', r:40, pts:10 },
    { name:'orange', color:'#ff9800', r:44, pts:12 },
    { name:'watermelon', color:'#4caf50', r:52, pts:18 },
    { name:'lemon', color:'#ffeb3b', r:38, pts:9 }
  ];
  const BOMB = { name:'bomb', color:'#333', r:40 };

  // helpers
  const rand = (a,b) => a + Math.random()*(b-a);
  function spawnItem(){
    const isBomb = Math.random() < 0.07; // slightly lower bomb chance
    const x = rand(60, W-60);
    const vx = rand(-80,80)/1000;
    if (isBomb){
      items.push({ type:BOMB, x, y: H + 80, vx, vy: -rand(650,920), r:BOMB.r, exploded:false });
    } else {
      const t = FRUITS[Math.floor(Math.random()*FRUITS.length)];
      items.push({ type:t, x, y: H + 80, vx, vy:-rand(500,800), r:t.r, cut:false, pts:t.pts, color:t.color });
    }
  }
  function spawnParticles(x,y,color){
    for (let i=0;i<12;i++){
      particles.push({ x, y, vx: rand(-240,240)/1000, vy: rand(-240,0)/1000, life: rand(600,1200), t:0, color });
    }
  }

  function pointCircle(px,py,cx,cy,r){ const dx=px-cx, dy=py-cy; return dx*dx+dy*dy <= r*r; }

  function checkSlice(){
    if (slicePath.length < 2) return;
    const path = slicePath.slice(-8);
    for (const it of items){
      if (it.cut || (it.type.name==='bomb' && it.exploded)) continue;
      for (let i=1;i<path.length;i++){
        const x1=path[i-1].x, y1=path[i-1].y, x2=path[i].x, y2=path[i].y;
        for (let t=0; t<=1; t+=0.25){
          const sx = x1 + (x2-x1)*t, sy = y1 + (y2-y1)*t;
          if (pointCircle(sx,sy,it.x,it.y,it.r)){
            if (it.type.name==='bomb'){
              S_BOMB.currentTime = 0; S_BOMB.play().catch(()=>{});
              it.exploded = true;
              endFG(true);
              return;
            } else {
              if (!it.cut){
                it.cut = true;
                scoreFG += it.pts || 10;
                fgScore.textContent = scoreFG;
                spawnParticles(it.x, it.y, it.color || it.type.color);
                S_SLICE.currentTime = 0; S_SLICE.play().catch(()=>{});
              }
            }
          }
        }
      }
    }
    items = items.filter(f => !f.cut);
  }

  function updateEntities(dt){
    for (const it of items){ it.vy += 1600*(dt/1000); it.x += it.vx*dt; it.y += it.vy*dt; }
    for (const p of particles){ p.vy += 1200*(dt/1000); p.x += p.vx*dt; p.y += p.vy*dt; p.t += dt; }
    particles = particles.filter(p => p.t < p.life);
    items = items.filter(it => (it.y - it.r) <= (H + 80));
  }

  function draw(){
    if (!ctx) return;
    ctx.clearRect(0,0,W,H);
    // draw items
    for (const it of items){
      ctx.save(); ctx.translate(it.x, it.y);
      // shadow
      ctx.beginPath(); ctx.arc(6,6,it.r+6,0,Math.PI*2); ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fill();
      // main
      ctx.beginPath(); ctx.arc(0,0,it.r,0,Math.PI*2); ctx.fillStyle = it.color || it.type.color; ctx.fill();
      // bomb mark
      if (it.type.name==='bomb'){ ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(0,0,it.r*0.6,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.font='24px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('💣',0,0); }
      ctx.restore();
    }
    // particles
    for (const p of particles){ ctx.beginPath(); ctx.arc(p.x, p.y, 4,0,Math.PI*2); ctx.fillStyle = p.color || '#fff'; ctx.fill(); }
    // slice path
    if (slicePath.length){
      ctx.beginPath(); ctx.moveTo(slicePath[0].x, slicePath[0].y);
      for (let i=1;i<slicePath.length;i++) ctx.lineTo(slicePath[i].x, slicePath[i].y);
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.94)'; ctx.lineCap = 'round'; ctx.stroke();
    }
  }

  function loop(ts){
    if (!isRunning) return;
    const dt = Math.min(40, ts - lastTime); lastTime = ts;
    if (!isPaused){
      spawnTimer += dt;
      if (spawnTimer > spawnInterval){ spawnTimer = 0; spawnInterval = rand(700,1200); spawnItem(); }
      updateEntities(dt); checkSlice();
    }
    draw();
    requestAnimationFrame(loop);
  }

  // input handling
  let drawing = false;
  function addPoint(x,y){ slicePath.push({x,y,t:Date.now()}); if (slicePath.length > 28) slicePath.shift(); }
  function startDraw(x,y){ drawing=true; slicePath = [{x,y,t:Date.now()}]; addPoint(x,y); }
  function moveDraw(x,y){ if (!drawing) return; addPoint(x,y); }
  function endDraw(){ drawing=false; setTimeout(()=>slicePath = [], 120); }

  // mouse
  fgCanvas.addEventListener('mousedown', e => startDraw(e.offsetX, e.offsetY));
  fgCanvas.addEventListener('mousemove', e => moveDraw(e.offsetX, e.offsetY));
  window.addEventListener('mouseup', () => endDraw());
  // touch
  fgCanvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; const r = fgCanvas.getBoundingClientRect(); startDraw(t.clientX - r.left, t.clientY - r.top); });
  fgCanvas.addEventListener('touchmove', e => { e.preventDefault(); const t = e.touches[0]; const r = fgCanvas.getBoundingClientRect(); moveDraw(t.clientX - r.left, t.clientY - r.top); });
  fgCanvas.addEventListener('touchend', e => { e.preventDefault(); endDraw(); });

  function startFG(){
    items = []; particles = []; slicePath = []; scoreFG = 0; fgScore.textContent = '0';
    spawnTimer = 0; spawnInterval = 900; isRunning = true; isPaused = false; fgOverlay.classList.remove('show');
    lastTime = performance.now();
    S_POP.currentTime = 0; S_POP.play().catch(()=>{});
    requestAnimationFrame(loop);
  }
  function pauseFG(){ isPaused = !isPaused; fgPause.textContent = isPaused ? '▶️ Main' : '⏸️ Jeda'; }
  function endFG(isBomb=false){
    isRunning = false;
    fgFinalScore.textContent = scoreFG;
    document.getElementById('fgOverlayTitle').textContent = isBomb ? 'Boom! Game Over 💥' : 'Game Over';
    fgOverlay.classList.add('show');
  }

  // wire UI
  if (openFruitGameBtn) openFruitGameBtn.addEventListener('click', () => { fruitModal.classList.add('show'); fruitModal.setAttribute('aria-hidden','false'); resizeFG(); startFG(); });
  if (fgClose) fgClose.addEventListener('click', () => { fruitModal.classList.remove('show'); fruitModal.setAttribute('aria-hidden','true'); isRunning = false; });
  if (fgRestart) fgRestart.addEventListener('click', () => { startFG(); });
  if (fgPause) fgPause.addEventListener('click', () => { pauseFG(); });
  if (fgOverlayRestart) fgOverlayRestart.addEventListener('click', () => { fgOverlay.classList.remove('show'); startFG(); });

  window.addEventListener('resize', () => { if (fruitModal.classList.contains('show')) resizeFG(); });

  // close modals with ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalProduk && modalProduk.classList.contains('show')) { modalProduk.classList.remove('show'); modalProduk.setAttribute('aria-hidden','true'); }
      if (fruitModal && fruitModal.classList.contains('show')) { fruitModal.classList.remove('show'); fruitModal.setAttribute('aria-hidden','true'); isRunning = false; }
    }
  });

  console.info('AZA Zurich script initialized.');
});
