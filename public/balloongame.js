// balloongame.js
// Controls inline Balloon Pop in #balloon-game. Exposes startBalloonGame() & stopBalloonGame().

(function(){
  const $ = s => document.querySelector(s);
  const area = $('#balloon-game');
  if (!area) {
    console.warn('balloongame: #balloon-game not found.');
    return;
  }

  // inject minimal styles for balloon header/close (non-intrusive)
  const styleId = 'balloongame-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #balloongame-bar{position:absolute;left:0;top:0;right:0;height:42px;display:flex;align-items:center;justify-content:space-between;padding:6px 10px;z-index:20;background:linear-gradient(90deg,rgba(0,0,0,0.2),rgba(0,0,0,0.05));}
      #balloongame-bar .left{color:#fff;font-weight:700}
      #balloongame-close{background:transparent;border:none;color:#fff;font-size:16px;padding:6px;cursor:pointer;border-radius:8px}
      .balloon{position:absolute;bottom:0;left:0;user-select:none;cursor:pointer;transition:transform .12s ease-out;will-change:bottom,transform,opacity}
      .balloon-pop{transform:scale(1.4);opacity:0.9}
      .balloon-counter{position:absolute;left:12px;top:6px;color:#fff;font-weight:700;z-index:25}
    `;
    document.head.appendChild(style);
  }

  // sound
  const POP = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_2f6b6b1.mp3?filename=pop-1.mp3');
  POP.volume = 0.8;

  // state
  let spawnTimer = null;
  let riseIntervals = [];
  let score = 0;
  let running = false;
  let rainbowMode = false;
  let timeLimit = 30; // seconds
  let countdownTimer = null;

  function clearAll() {
    if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    riseIntervals.forEach(i => clearInterval(i));
    riseIntervals = [];
    area.innerHTML = ''; // wipe content
    running = false;
    rainbowMode = false;
  }

  function makeBar() {
    const bar = document.createElement('div');
    bar.id = 'balloongame-bar';
    const left = document.createElement('div'); left.className = 'left';
    left.textContent = '🎈 Balloon Pop';
    const right = document.createElement('div');
    const btnClose = document.createElement('button');
    btnClose.id = 'balloongame-close';
    btnClose.textContent = '✖ Tutup';
    btnClose.addEventListener('click', () => {
      stopBalloonGame();
    });
    right.appendChild(btnClose);
    bar.appendChild(left);
    bar.appendChild(right);
    return bar;
  }

  function makeScoreDisplay() {
    const d = document.createElement('div');
    d.className = 'balloon-counter';
    d.textContent = `Score: 0 🎈`;
    return d;
  }

  function startCountdown(onEnd){
    let t = timeLimit;
    const timerEl = document.createElement('div');
    timerEl.style.position = 'absolute';
    timerEl.style.right = '12px';
    timerEl.style.top = '8px';
    timerEl.style.color = '#fff';
    timerEl.style.fontWeight = '700';
    timerEl.textContent = `${t}s`;
    document.getElementById('balloongame-bar')?.appendChild(timerEl);
    countdownTimer = setInterval(() => {
      t--;
      timerEl.textContent = `${t}s`;
      if (t <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        if (typeof onEnd === 'function') onEnd();
      }
    }, 1000);
  }

  function spawnBalloon(areaEl, scoreDisplay) {
    const b = document.createElement('div');
    b.className = 'balloon';
    b.textContent = '🎈';
    const size = 30 + Math.random() * 40;
    b.style.fontSize = `${size}px`;
    b.style.left = (5 + Math.random() * 90) + '%';
    b.style.bottom = '0px';
    // color / glow if rainbow
    if (rainbowMode) {
      const hue = Math.floor(Math.random()*360);
      b.style.color = `hsl(${hue},100%,60%)`;
      b.style.filter = `drop-shadow(0 0 8px hsl(${hue},100%,65%))`;
    } else {
      b.style.color = '#fff';
    }
    areaEl.appendChild(b);

    // rise
    let bottom = 0;
    const riseSpeed = (rainbowMode ? 4+Math.random()*2 : 2+Math.random()*2);
    const id = setInterval(() => {
      if (!areaEl.contains(b)) { clearInterval(id); return; }
      bottom += riseSpeed;
      b.style.bottom = bottom + 'px';
      if (bottom > (areaEl.clientHeight + 100)) {
        if (b.parentNode) b.remove();
        clearInterval(id);
      }
    }, 40);
    riseIntervals.push(id);

    b.addEventListener('click', () => {
      try{ POP.currentTime = 0; POP.play(); }catch(e){}
      b.classList.add('balloon-pop');
      setTimeout(()=> { if (b.parentNode) b.remove(); }, 120);
      clearInterval(id);
      score++;
      scoreDisplay.textContent = `Score: ${score} 🎈`;

      if (!rainbowMode && score >= 10) {
        rainbowMode = true;
        // add small visual flair for existing balloons
        Array.from(areaEl.querySelectorAll('.balloon')).forEach(el => {
          const hue = Math.floor(Math.random()*360);
          el.style.color = `hsl(${hue},100%,60%)`;
          el.style.filter = `drop-shadow(0 0 6px hsl(${hue},100%,65%))`;
        });
      }
    });
  }

  // Exposed functions
  function startBalloonGame(opts){
    // opts: { timeLimitSec } optional
    if (running) return;
    running = true;
    score = 0;
    if (opts && typeof opts.timeLimitSec === 'number') timeLimit = Math.max(5, Math.floor(opts.timeLimitSec));
    area.innerHTML = '';
    // create header bar + score
    const bar = makeBar(); bar.id = 'balloongame-bar';
    area.appendChild(bar);
    const scoreDisplay = makeScoreDisplay();
    area.appendChild(scoreDisplay);

    // spawn loop
    spawnTimer = setInterval(() => {
      // keep at most ~10 balloons in DOM
      const currentB = area.querySelectorAll('.balloon').length;
      if (currentB < 10) spawnBalloon(area, scoreDisplay);
    }, 600);

    // start countdown
    startCountdown(() => {
      endGame();
    });
  }

  function endGame(){
    // show final message and keep it visible; user can close with button
    const msg = document.createElement('div');
    msg.className = 'end-msg';
    msg.style.color = '#ffcc00';
    msg.style.paddingTop = '12px';
    msg.textContent = `🎉 Tamat! Skor akhir: ${score}`;
    area.appendChild(msg);
    stopBalloonGame(); // stops spawns and rise intervals but leave UI so user can see final score and close
    // we won't clear area.innerHTML here so message + bar remain for user to close
  }

  function stopBalloonGame(){
    // only stop spawn/rises and leave content for user to close; to fully remove UI call clearAll()
    try { if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; } } catch(e){}
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    riseIntervals.forEach(i => clearInterval(i));
    riseIntervals = [];
    running = false;
    // do not wipe area.innerHTML here so user can see final message; but if called to force stop, clear UI:
    // clearAll();
  }

  // attach to global
  window.startBalloonGame = startBalloonGame;
  window.stopBalloonGame = clearAll;

  console.info('balloongame.js loaded — functions: startBalloonGame(), stopBalloonGame()');
})();
