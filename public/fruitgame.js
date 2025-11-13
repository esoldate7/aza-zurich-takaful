// fruitgame.js
// Handles the fullscreen Fruit Slice modal (uses existing HTML elements:
// #fruitModal, #fruitCanvas, #fgPause, #fgRestart, #fgClose, #fgScore, #fgOverlay, #fgFinalScore, #fgOverlayRestart)

(function(){
  // helpers
  const $ = s => document.querySelector(s);
  if (!$('#fruitModal') || !$('#fruitCanvas')) {
    console.warn('fruitgame: required DOM elements missing (fruitModal/fruitCanvas).');
    return;
  }

  const fruitModal = $('#fruitModal');
  const fgCanvas = $('#fruitCanvas');
  const fgPause = $('#fgPause');
  const fgRestart = $('#fgRestart');
  const fgClose = $('#fgClose');
  const fgScore = $('#fgScore');
  const fgOverlay = $('#fgOverlay');
  const fgFinalScore = $('#fgFinalScore');
  const fgOverlayRestart = $('#fgOverlayRestart');

  // audio (CDN fallback)
  const S_SLICE = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_896b8b71f1.mp3?filename=slice-1.mp3');
  const S_POP = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_2f6b6b1.mp3?filename=pop-1.mp3');
  const S_BOMB = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_f7a0b7b0.mp3?filename=explode-01.mp3');
  [S_SLICE, S_POP, S_BOMB].forEach(a => { try{ a.volume = 0.7; a.preload='auto'; }catch(e){} });

  // canvas & DPR handling
  let ctx = null, DPR = window.devicePixelRatio || 1, W = 0, H = 0;
  function resizeCanvas(){
    DPR = window.devicePixelRatio || 1;
    fgCanvas.style.height = (window.innerHeight - 140) + 'px';
    fgCanvas.style.width = '100%';
    fgCanvas.width = Math.max(300, fgCanvas.clientWidth) * DPR;
    fgCanvas.height = Math.max(300, fgCanvas.clientHeight) * DPR;
    ctx = fgCanvas.getContext('2d');
    ctx.setTransform(DPR,0,0,DPR,0,0);
    W = fgCanvas.clientWidth;
    H = fgCanvas.clientHeight;
  }

  // game state
  let running = false, paused = false;
  let items = [], particles = [], slicePath = [];
  let lastTS = 0, spawnTick = 0;
  let score = 0;

  // constants
  const GRAVITY = 900;
  const FRUIT_TYPES = [
    { name:'apple', color:'#ff5252', r:38, pts:10 },
    { name:'orange', color:'#ff9800', r:42, pts:12 },
    { name:'watermelon', color:'#4caf50', r:52, pts:18 },
    { name:'lemon', color:'#ffeb3b', r:36, pts:9 }
  ];
  const BOMB = { name:'bomb', color:'#333', r:40 };

  const rand = (a,b) => a + Math.random() * (b-a);

  function spawn(){
    const isBomb = Math.random() < 0.06;
    const x = rand(60, W-60);
    const vx = rand(-60, 60) / 1000;
    if (isBomb) {
      items.push({ type: BOMB, x, y: H + 80, vx, vy: -rand(500,700), r:BOMB.r, exploded:false });
    } else {
      const t = FRUIT_TYPES[Math.floor(Math.random()*FRUIT_TYPES.length)];
      items.push({ type: t, x, y: H + 80, vx, vy: -rand(420,700), r: t.r, cut:false, pts: t.pts, color: t.color });
    }
  }

  function spawnParticles(x,y,color){
    for (let i=0;i<12;i++){
      particles.push({ x, y, vx: rand(-300,300)/1000, vy: rand(-300,0)/1000, life: rand(400,900), t:0, color });
    }
  }

  function pointInCircle(px,py,cx,cy,r){
    const dx = px - cx, dy = py - cy;
    return dx*dx + dy*dy <= r*r;
  }

  function checkSlice(){
    if (slicePath.length < 2) return;
    const sample = slicePath.slice(Math.max(0, slicePath.length - 12));
    for (const it of items) {
      if (it.cut || (it.type.name === 'bomb' && it.exploded)) continue;
      for (let i=1;i<sample.length;i++){
        const x1 = sample[i-1].x, y1 = sample[i-1].y, x2 = sample[i].x, y2 = sample[i].y;
        for (let t=0; t<=1; t+=0.25){
          const sx = x1 + (x2-x1)*t, sy = y1 + (y2-y1)*t;
          if (pointInCircle(sx, sy, it.x, it.y, it.r * 0.9)) {
            if (it.type.name === 'bomb') {
              try{ S_BOMB.currentTime=0; S_BOMB.play(); }catch(e){}
              it.exploded = true;
              end(true);
              return;
            } else {
              if (!it.cut) {
                it.cut = true;
                score += it.pts || 10;
                fgScore.textContent = score;
                spawnParticles(it.x, it.y, it.color || it.type.color);
                try{ S_SLICE.currentTime=0; S_SLICE.play(); }catch(e){}
                setTimeout(()=>{ try{ S_POP.currentTime=0; S_POP.play(); }catch(e){} }, 80);
              }
            }
            break;
          }
        }
        if (it.cut) break;
      }
    }
    items = items.filter(i => !i.cut);
  }

  function update(dt){
    for (const it of items){
      it.vy += GRAVITY * (dt/1000);
      it.x += it.vx * dt;
      it.y += it.vy * dt;
    }
    for (const p of particles){
      p.vy += 1200 * (dt/1000);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.t += dt;
    }
    particles = particles.filter(p => p.t < p.life);
    items = items.filter(it => (it.y - it.r) <= (H + 120));
  }

  function draw(){
    if (!ctx) return;
    ctx.clearRect(0,0,W,H);

    // items
    for (const it of items){
      ctx.save(); ctx.translate(it.x, it.y);
      ctx.beginPath(); ctx.arc(6,6,it.r+6,0,Math.PI*2); ctx.fillStyle='rgba(0,0,0,0.14)'; ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,it.r,0,Math.PI*2); ctx.fillStyle = it.color || it.type.color; ctx.fill();
      ctx.beginPath(); ctx.ellipse(-it.r*0.35, -it.r*0.35, it.r*0.3, it.r*0.18, 0, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();
      if (it.type.name === 'bomb') {
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0,0,it.r*0.55,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `${Math.max(14, Math.floor(it.r*0.45))}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('💣',0,0);
      }
      ctx.restore();
    }

    // particles
    for (const p of particles){
      ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fillStyle = p.color || '#fff'; ctx.fill();
    }

    // slice path (fade)
    if (slicePath.length > 1){
      for (let i=1;i<slicePath.length;i++){
        const a = i / slicePath.length;
        ctx.beginPath(); ctx.moveTo(slicePath[i-1].x, slicePath[i-1].y); ctx.lineTo(slicePath[i].x, slicePath[i].y);
        ctx.lineWidth = 6 * (0.6 + 0.4*a);
        ctx.strokeStyle = `rgba(255,255,255,${0.15 + 0.8*a})`; ctx.lineCap='round'; ctx.stroke();
      }
    }
  }

  function loop(ts){
    if (!running) return;
    const dt = Math.min(40, ts - lastTS); lastTS = ts;
    if (!paused){
      spawnTick += dt;
      if (spawnTick > rand(700,1500)) { spawnTick = 0; spawn(); }
      update(dt);
      checkSlice();
    }
    draw();
    requestAnimationFrame(loop);
  }

  // input handling (mouse + touch)
  let drawing = false;
  function addPoint(x,y){ slicePath.push({x,y,t:Date.now()}); if (slicePath.length>30) slicePath.shift(); }
  function startDraw(x,y){ drawing=true; slicePath = [{x,y,t:Date.now()}]; addPoint(x,y); }
  function moveDraw(x,y){ if (!drawing) return; addPoint(x,y); }
  function endDraw(){ drawing=false; setTimeout(()=>slicePath=[],200); }

  function getXYFromEvent(e){
    const rect = fgCanvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: (e.touches[0].clientX - rect.left), y: (e.touches[0].clientY - rect.top) };
    } else {
      return { x: (e.clientX - rect.left), y: (e.clientY - rect.top) };
    }
  }

  fgCanvas.addEventListener('mousedown', e => { const p = getXYFromEvent(e); startDraw(p.x, p.y); });
  fgCanvas.addEventListener('mousemove', e => { const p = getXYFromEvent(e); moveDraw(p.x, p.y); });
  window.addEventListener('mouseup', endDraw);
  fgCanvas.addEventListener('touchstart', e => { e.preventDefault(); const p = getXYFromEvent(e); startDraw(p.x,p.y); }, {passive:false});
  fgCanvas.addEventListener('touchmove', e => { e.preventDefault(); const p = getXYFromEvent(e); moveDraw(p.x,p.y); }, {passive:false});
  fgCanvas.addEventListener('touchend', e => { e.preventDefault(); endDraw(); }, {passive:false});

  // control functions
  function startFG(){
    score = 0; fgScore.textContent = '0';
    items = []; particles = []; slicePath = [];
    running = true; paused = false; lastTS = performance.now(); spawnTick = 0;
    fgOverlay.classList.remove('show');
    resizeCanvas();
    requestAnimationFrame(loop);
  }
  function pauseFG(){ paused = !paused; if (fgPause) fgPause.textContent = paused ? '▶️ Main' : '⏸️ Jeda'; }
  function end(bomb=false){
    running = false;
    fgFinalScore.textContent = score;
    const title = document.getElementById('fgOverlayTitle');
    if (title) title.textContent = bomb ? 'Boom! Game Over 💥' : 'Game Over';
    if (fgOverlay) fgOverlay.classList.add('show');
  }

  // wire UI buttons (if exist)
  if (fgClose) fgClose.addEventListener('click', () => { fruitModal.classList.remove('show'); fruitModal.setAttribute('aria-hidden','true'); running=false; });
  if (fgRestart) fgRestart.addEventListener('click', () => { startFG(); });
  if (fgPause) fgPause.addEventListener('click', () => { pauseFG(); });
  if (fgOverlayRestart) fgOverlayRestart.addEventListener('click', () => { fgOverlay.classList.remove('show'); startFG(); });

  // ensure resize on window change
  window.addEventListener('resize', () => { if (fruitModal.classList.contains('show')) resizeCanvas(); });

  // expose to global so index.html showGame() can call them
  window.startFG = function(){
    if (!fruitModal.classList.contains('show')) {
      fruitModal.classList.add('show');
      fruitModal.setAttribute('aria-hidden','false');
    }
    resizeCanvas();
    startFG();
  };
  window.stopFG = function(){
    running = false;
    if (fruitModal.classList.contains('show')) {
      fruitModal.classList.remove('show');
      fruitModal.setAttribute('aria-hidden','true');
    }
  };

  // small log
  console.info('fruitgame.js loaded — Fruit modal functions available: startFG(), stopFG()');
})();
