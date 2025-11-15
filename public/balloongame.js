// ======== BALLOON POP GAME ========
let balloonInterval;

function startBalloonGame() {
  stopBalloonGame();

  const area = document.getElementById("balloon-game");
  area.innerHTML = "";

  let score = 0;

  const scoreBox = document.createElement("div");
  scoreBox.className = "score-display";
  scoreBox.textContent = "Score: 0 🎈";
  scoreBox.style.color = "#fff";
  scoreBox.style.padding = "10px";
  area.appendChild(scoreBox);

  balloonInterval = setInterval(() => {
    const balloon = document.createElement("div");
    balloon.className = "balloon";

    balloon.textContent = "🎈";
    balloon.style.position = "absolute";
    balloon.style.left = Math.random() * 90 + "%";
    balloon.style.bottom = "0px";

    const size = 40 + Math.random() * 20;
    balloon.style.fontSize = size + "px";

    // rainbow effect
    const hue = Math.floor(Math.random() * 360);
    balloon.style.filter = `hue-rotate(${hue}deg)`;

    area.appendChild(balloon);

    let bottom = 0;
    const rise = setInterval(() => {
      bottom += 3;
      balloon.style.bottom = bottom + "px";

      if (bottom > 420) {
        balloon.remove();
        clearInterval(rise);
      }
    }, 40);

    balloon.addEventListener("click", () => {
      const pop = new Audio("assets/pop.mp3");
      pop.play();

      score++;
      scoreBox.textContent = "Score: " + score + " 🎈";

      balloon.remove();
      clearInterval(rise);
    });
  }, 900);
}

function stopBalloonGame() {
  clearInterval(balloonInterval);
  const area = document.getElementById("balloon-game");
  if (area) area.innerHTML = "";
}
