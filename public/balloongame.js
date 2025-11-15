// ======== BALLOON POP GAME (MODAL VERSION) ========
let balloonInterval;
let bpScore = 0;

function startBalloonGame() {
  stopBalloonGame();

  const area = document.getElementById("balloonCanvasArea");
  area.innerHTML = "";

  bpScore = 0;
  document.getElementById("bpScore").textContent = bpScore;

  balloonInterval = setInterval(() => {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.textContent = "🎈";

    balloon.style.position = "absolute";
    balloon.style.left = Math.random() * 90 + "%";
    balloon.style.bottom = "0px";

    const size = 40 + Math.random() * 20;
    balloon.style.fontSize = size + "px";

    const hue = Math.floor(Math.random() * 360);
    balloon.style.filter = `hue-rotate(${hue}deg)`;

    area.appendChild(balloon);

    let bottom = 0;
    const rise = setInterval(() => {
      bottom += 3;
      balloon.style.bottom = bottom + "px";

      if (bottom > area.clientHeight) {
        balloon.remove();
        clearInterval(rise);
      }
    }, 40);

    balloon.addEventListener("click", () => {
      const pop = new Audio("assets/pop.mp3");
      pop.play();

      bpScore++;
      document.getElementById("bpScore").textContent = bpScore;

      balloon.remove();
      clearInterval(rise);
    });

  }, 900);
}

function stopBalloonGame() {
  clearInterval(balloonInterval);
  const area = document.getElementById("balloonCanvasArea");
  if (area) area.innerHTML = "";
}

// expose globally
window.startBalloonGame = startBalloonGame;
window.stopBalloonGame = stopBalloonGame;
