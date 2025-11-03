document.addEventListener("DOMContentLoaded", () => {

/* ====================================================
   🎮 GLOBAL GAME SYSTEM (Shared modal, scoreboard, etc.)
   ==================================================== */
const modal = document.getElementById("gameModal");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const btnClose = document.getElementById("closeGameModal");
const btnPause = document.getElementById("pauseGame");
const btnRestart = document.getElementById("restartGame");
const btnScores = document.getElementById("showScores");
const overlay = document.getElementById("gameOverlay");
const overlayRestart = document.getElementById("overlayRestart");
const scoreText = document.getElementById("gameScore");
const titleText = document.getElementById("gameTitle");
const finalScore = document.getElementById("finalScore");

let currentGame = null;
let isPaused = false;
let score = 0;
let W, H, DPR = window.devicePixelRatio || 1;
function resizeCanvas(){
  canvas.width = Math.floor(canvas.clientWidth * DPR);
  canvas.height = Math.floor(canvas.clientHeight * DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  W = canvas.clientWidth; H = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);

/* SCOREBOARD */
const SCORE_KEY = "liteGameScores";
function saveScore(game, points){
  const data = JSON.parse(localStorage.getItem(SCORE_KEY) || "{}");
  if(!data[game]) data[game] = [];
  data[game].push(points);
  data[game].sort((a,b)=>b-a);
  if(data[game].length>5) data[game].length=5;
  localStorage.setItem(SCORE_KEY, JSON.stringify(data));
}
function showTopScores(){
  const data = JSON.parse(localStorage.getItem(SCORE_KEY) || "{}");
  let html = "<h2>🏆 Skor Tertinggi</h2>";
  for (const [game, scores] of Object.entries(data)){
    html += `<p><strong>${game}</strong>: ${scores.join(", ") || "Tiada skor"}</p>`;
  }
  overlay.innerHTML = html + `<button id="closeScores" class="fg-btn">Tutup</button>`;
  overlay.classList.add("show");
  document.getElementById("closeScores").onclick = () => overlay.classList.remove("show");
}

/* ========= Launch game modal ========== */
function openGame(name, startFunc){
  modal.classList.add("show");
  titleText.textContent = name;
  resizeCanvas();
  score = 0;
  scoreText.textContent = score;
  overlay.classList.remove("show");
  currentGame = startFunc();
}

/* ========= Close modal ========== */
function closeModal(){
  modal.classList.remove("show");
  currentGame = null;
}
btnClose.onclick = closeModal;
btnScores.onclick = showTopScores;

/* ====================================================
   🍉 FRUIT SLICE GAME
   ==================================================== */
document.getElementById("openFruitGame").onclick = ()=> openGame("🍉 Fruit Slice", FruitSliceGame);

function FruitSliceGame(){
  const fruits = [];
  const slices = [];
  let running = true, t = 0;
  const sound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_2f6b6b1.mp3?filename=pop-1.mp3");

  function spawn(){
    fruits.push({
      x: Math.random()*W,
      y: H + 50,
      r: 30 + Math.random()*20,
      vy: -6 - Math.random()*3,
      vx: (Math.random()-0.5)*4,
      color: `hsl(${Math.random()*360},80%,60%)`
    });
  }
  function update(){
    for(let f of fruits){
      f.x += f.vx;
      f.y += f.vy;
      f.vy += 0.25;
    }
    fruits.forEach((f,i)=>{ if(f.y>H+100) fruits.splice(i,1); });
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(let f of fruits){
      ctx.beginPath();
      ctx.fillStyle = f.color;
      ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
      ctx.fill();
    }
    for(let s of slices){
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x1,s.y1);
      ctx.lineTo(s.x2,s.y2);
      ctx.stroke();
    }
  }
  function loop(){
    if(!running) return;
    t++;
    if(t%40===0) spawn();
    update();
    draw();
    requestAnimationFrame(loop);
  }
  function slice(x,y){
    fruits.forEach((f,i)=>{
      const dx=x-f.x, dy=y-f.y;
      if(dx*dx+dy*dy<=f.r*f.r){
        fruits.splice(i,1);
        score+=10; scoreText.textContent=score;
        sound.currentTime=0; sound.play().catch(()=>{});
        slices.push({x1:x-10,y1:y-10,x2:x+10,y2:y+10,color:f.color});
        setTimeout(()=>slices.shift(),300);
      }
    });
  }
  canvas.onmousedown = e => slice(e.offsetX,e.offsetY);
  canvas.ontouchstart = e=>{
    const t=e.touches[0]; slice(t.clientX-canvas.getBoundingClientRect().left,t.clientY-canvas.getBoundingClientRect().top);
  };
  loop();
  btnRestart.onclick = ()=>{ fruits.length=0; score=0; scoreText.textContent=0; };
  overlayRestart.onclick = ()=>{ overlay.classList.remove("show"); fruits.length=0; score=0; running=true; loop(); };
  btnPause.onclick = ()=>{ running=!running; if(running) loop(); };
  return ()=>{ running=false; saveScore("Fruit Slice",score); };
}

/* ====================================================
   🎈 BALLOON POP GAME
   ==================================================== */
document.getElementById("openBalloonGame").onclick = ()=> openGame("🎈 Letup Belon", BalloonGame);

function BalloonGame(){
  const balloons=[], parts=[];
  let running=true, timer=0;
  const popSnd = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_2f6b6b1.mp3?filename=pop-1.mp3");

  function spawn(){
    const r=25+Math.random()*20;
    balloons.push({
      x:Math.random()*(W-r*2)+r,
      y:H+r,
      r,
      vy:-2-Math.random()*2,
      color:`hsl(${Math.random()*360},80%,60%)`
    });
  }
  function update(){
    for(const b of balloons){ b.y+=b.vy; }
    balloons.forEach((b,i)=>{ if(b.y<-b.r) balloons.splice(i,1); });
    for(const p of parts){ p.y+=p.vy; p.x+=p.vx; p.vy+=0.2; p.life-=16; }
    for(let i=parts.length-1;i>=0;i--) if(parts[i].life<=0) parts.splice(i,1);
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(const b of balloons){
      ctx.beginPath();
      ctx.fillStyle=b.color;
      ctx.ellipse(b.x,b.y,b.r*0.9,b.r,0,0,Math.PI*2);
      ctx.fill();
    }
    for(const p of parts){
      ctx.fillStyle=p.color;
      ctx.globalAlpha=Math.max(0,p.life/500);
      ctx.beginPath();
      ctx.arc(p.x,p.y,3,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1;
    }
  }
  function pop(x,y){
    for(let i=balloons.length-1;i>=0;i--){
      const b=balloons[i]; const dx=x-b.x,dy=y-b.y;
      if(dx*dx+dy*dy<=b.r*b.r){
        balloons.splice(i,1);
        score+=5; scoreText.textContent=score;
        popSnd.currentTime=0; popSnd.play().catch(()=>{});
        for(let j=0;j<10;j++) parts.push({x,y,vx:(Math.random()-0.5)*6,vy:(Math.random()-1)*6,life:500,color:b.color});
        break;
      }
    }
  }
  canvas.onmousedown=e=>pop(e.offsetX,e.offsetY);
  canvas.ontouchstart=e=>{
    const t=e.touches[0]; pop(t.clientX-canvas.getBoundingClientRect().left,t.clientY-canvas.getBoundingClientRect().top);
  };
  function loop(){
    if(!running) return;
    timer++;
    if(timer%40===0) spawn();
    update(); draw();
    requestAnimationFrame(loop);
  }
  loop();
  btnRestart.onclick = ()=>{ balloons.length=0; parts.length=0; score=0; scoreText.textContent=0; };
  overlayRestart.onclick = ()=>{ overlay.classList.remove("show"); balloons.length=0; parts.length=0; running=true; loop(); };
  btnPause.onclick = ()=>{ running=!running; if(running) loop(); };
  return ()=>{ running=false; saveScore("Letup Belon",score); };
}

}); // end DOMContentLoaded
