// ======== BALLOON POP GAME ========
let balloonInterval;

function startBalloonGame() {
  stopBalloonGame();

  const area = document.getElementById("balloon-game-modal");
  area.innerHTML = "";

  let score = 0;
  const scoreBox = document.getElementById("bpScore");
  scoreBox.textContent = score;

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

      if (bottom > area.offsetHeight) {
        balloon.remove();
        clearInterval(rise);
      }
    }, 40);

    balloon.addEventListener("click", () => {
      const pop = new Audio("assets/pop.mp3");
      pop.play();

      score++;
      scoreBox.textContent = score;

      balloon.remove();
      clearInterval(rise);
    });
  }, 900);
}

function stopBalloonGame() {
  clearInterval(balloonInterval);
  const area = document.getElementById("balloon-game-modal");
  if (area) area.innerHTML = "";
}
