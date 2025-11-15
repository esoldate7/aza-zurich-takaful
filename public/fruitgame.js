// ======== FRUIT SLICE GAME ========
let fruitCanvas, fruitCtx;
let fruits = [];
let fruitScore = 0;
let fruitLives = 3;
let fruitGameOver = false;
let fruitLoop;
let spawnLoop;

function startFruitGame() {
  // Prevent duplicate canvas
  if (fruitLoop) cancelAnimationFrame(fruitLoop);
  if (spawnLoop) clearInterval(spawnLoop);

  fruitCanvas = document.getElementById("gameCanvas");
  fruitCtx = fruitCanvas.getContext("2d");

  fruits = [];
  fruitScore = 0;
  fruitLives = 3;
  fruitGameOver = false;

  const sliceSound = new Audio("assets/slice.mp3");
  sliceSound.volume = 0.6;

  class Fruit {
    constructor(x, y, size, color, dx, dy) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.color = color;
      this.dx = dx;
      this.dy = dy;
      this.sliced = false;
    }

    draw() {
      fruitCtx.beginPath();
      fruitCtx.fillStyle = this.color;
      fruitCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      fruitCtx.fill();
    }

    update() {
      this.x += this.dx;
      this.y += this.dy;
      this.dy += 0.2;
    }
  }

  function spawn() {
    const size = 40 + Math.random() * 20;
    const x = Math.random() * 400;
    const y = 430;
    const color = `hsl(${Math.random() * 360}, 70%, 60%)`;

    const dx = -2 + Math.random() * 4;
    const dy = -10 - Math.random() * 5;

    fruits.push(new Fruit(x, y, size, color, dx, dy));
  }

  function loop() {
    fruitCtx.clearRect(0, 0, 400, 400);

    fruitCtx.fillStyle = "#fff";
    fruitCtx.font = "18px Poppins";
    fruitCtx.fillText("Score: " + fruitScore, 20, 30);
    fruitCtx.fillText("Lives: " + fruitLives, 300, 30);

    fruits.forEach((f, i) => {
      f.update();
      f.draw();

      if (f.y > 450) {
        fruits.splice(i, 1);
        fruitLives--;
      }

      if (fruitLives === 0) fruitGameOver = true;
    });

    if (!fruitGameOver) {
      fruitLoop = requestAnimationFrame(loop);
    } else {
      fruitCtx.fillStyle = "red";
      fruitCtx.font = "40px Poppins";
      fruitCtx.fillText("Game Over", 100, 200);
    }
  }

  fruitCanvas.addEventListener("mousemove", (e) => {
    fruits.forEach((f, i) => {
      const dx = e.offsetX - f.x;
      const dy = e.offsetY - f.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < f.size && !f.sliced) {
        f.sliced = true;
        fruitScore += 10;
        fruits.splice(i, 1);
        const s = new Audio("assets/slice.mp3");
        s.play();
      }
    });
  });

  spawnLoop = setInterval(spawn, 1000);
  loop();
}

function stopFruitGame() {
  if (fruitLoop) cancelAnimationFrame(fruitLoop);
  if (spawnLoop) clearInterval(spawnLoop);

  fruits = [];
  const ctx = document.getElementById("gameCanvas").getContext("2d");
  ctx.clearRect(0, 0, 400, 400);
}
