// ====================================================
// ========== SECTION SWITCHER ========================
// ====================================================

function showSection(id) {
  document.querySelectorAll("section").forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

// ====================================================
// ========== GAME SWITCHER ===========================
// ====================================================

function showGame(type) {
  const fruitGame = document.getElementById("fruit-game");
  const balloonGame = document.getElementById("balloon-game");

  if (!fruitGame || !balloonGame) return;

  fruitGame.style.display = "none";
  balloonGame.style.display = "none";

  // Hentikan game bila tukar
  if (typeof stopBalloonGame === "function") stopBalloonGame();

  if (type === "fruit") {
    fruitGame.style.display = "block";
  } else if (type === "balloon") {
    balloonGame.style.display = "block";
    if (typeof startBalloonGame === "function") startBalloonGame();
  }
}

// ====================================================
// ========== PRODUK ZURICH ===========================
// ====================================================

const products = [
  { name: "Z-Drive Assist", desc: "Perlindungan kenderaan menyeluruh dengan bantuan di jalan raya 24 jam." },
  { name: "Z-Motor", desc: "Pelan takaful komprehensif untuk motosikal dengan manfaat kemalangan & kehilangan." },
  { name: "Z-Rider", desc: "Perlindungan khas untuk penunggang motosikal dan skuter termasuk kemalangan diri." },
  { name: "Z-Travel", desc: "Perlindungan perjalanan dalam & luar negara, termasuk kehilangan bagasi & kelewatan." },
  { name: "PA Takaful", desc: "Perlindungan kemalangan diri 24 jam di seluruh dunia." },
  { name: "Fire Takaful (Business Owner)", desc: "Lindungi aset perniagaan daripada kebakaran, kilat & letupan." }
];

const productList = document.getElementById("product-list");
if (productList) {
  products.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <button class="btn-info" onclick="showProductInfo(${index})">Maklumat</button>
      <button class="btn-quote" onclick="openQuoteForm('${p.name}')">Request Quotation</button>
    `;
    productList.appendChild(div);
  });
}

function showProductInfo(index) {
  const p = products[index];
  alert(`📘 ${p.name}\n\n${p.desc}`);
}

function openQuoteForm(name) {
  alert(`📝 Borang quotation untuk ${name} akan dibuka di versi seterusnya.`);
}

// ====================================================
// ========== FRUIT SLICE GAME ========================
// ====================================================

// 🎵 Sound
const sliceSound = new Audio("assets/slice.mp3");
sliceSound.volume = 0.6;

// 🍉 Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas?.getContext("2d");

let fruits = [];
let score = 0;
let lives = 3;
let gravity = 0.04;
let gameOver = false;

if (ctx) {
  ctx.font = "20px Poppins";
  ctx.fillStyle = "#fff";
}

class Fruit {
  constructor(x, y, size, color, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speedX = speedX;
    this.speedY = speedY;
    this.rotation = Math.random() * 360;
    this.spin = (Math.random() - 0.5) * 8;
    this.isSliced = false;
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);

    const grad = ctx.createRadialGradient(0, 0, this.size * 0.2, 0, 0, this.size);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(1, this.color);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.stroke();

    ctx.restore();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += gravity;
    this.rotation += this.spin;
  }
}

function spawnFruit() {
  if (gameOver || !canvas) return;

  const size = 60 + Math.random() * 25;
  const x = 60 + Math.random() * (canvas.width - 120);
  const y = canvas.height + size;
  const color = `hsl(${Math.random() * 360}, 90%, 45%)`;
  const speedX = -1.5 + Math.random() * 3;
  const speedY = -8 - Math.random() * 3;

  fruits.push(new Fruit(x, y, size, color, speedX, speedY));
}

function animate() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "20px Poppins";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 30);

  fruits.forEach((fruit, index) => {
    fruit.update();
    fruit.draw();

    if (fruit.y - fruit.size > canvas.height + 50) {
      fruits.splice(index, 1);
      if (--lives <= 0) gameOver = true;
    }
  });

  if (!gameOver) {
    requestAnimationFrame(animate);
  } else {
    ctx.fillStyle = "#ff4444";
    ctx.font = "40px Poppins";
    ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2);
  }
}

if (canvas) {
  canvas.addEventListener("mousemove", (e) => {
    fruits.forEach((fruit, index) => {
      const dx = e.offsetX - fruit.x;
      const dy = e.offsetY - fruit.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < fruit.size && !fruit.isSliced) {
        fruit.isSliced = true;
        sliceSound.currentTime = 0;
        sliceSound.play();
        score += 10;
        fruits.splice(index, 1);
      }
    });
  });

  setInterval(spawnFruit, 800);
  animate();
}

// ====================================================
// ========== BALLOON POP GAME ========================
// ====================================================

let balloonInterval;
let activeRises = [];
const popSound = new Audio("assets/balloon-pop.mp3");
popSound.volume = 0.7;

function startBalloonGame() {
  const area = document.getElementById("balloon-game");
  if (!area) return;

  area.innerHTML = "";
  let score = 0;
  let gameOver = false;
  let rainbowMode = false;

  const scoreDisplay = document.createElement("div");
  scoreDisplay.className = "score-display";
  scoreDisplay.textContent = "Score: 0 🎈";
  area.appendChild(scoreDisplay);

  const rainbowBanner = document.createElement("div");
  rainbowBanner.className = "rainbow-banner";
  rainbowBanner.textContent = "";
  area.appendChild(rainbowBanner);

  balloonInterval = setInterval(() => {
    if (gameOver) return;

    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.textContent = "🎈";

    const size = 35 + Math.random() * 25;
    balloon.style.fontSize = `${size}px`;
    balloon.style.left = Math.random() * 85 + "%";
    balloon.style.bottom = "0px";

    if (rainbowMode) {
      const hue = Math.floor(Math.random() * 360);
      balloon.style.filter = `drop-shadow(0 0 6px hsl(${hue},100%,65%))`;
      balloon.style.color = `hsl(${hue},100%,60%)`;
    }

    const riseSpeed = rainbowMode ? 5 + Math.random() * 2 : 3 + Math.random() * 2;
    area.appendChild(balloon);

    let bottom = 0;
    const rise = setInterval(() => {
      if (gameOver) {
        balloon.remove();
        clearInterval(rise);
        return;
      }
      bottom += riseSpeed;
      balloon.style.bottom = bottom + "px";
      if (bottom > 450) {
        balloon.remove();
        clearInterval(rise);
      }
    }, 40);

    activeRises.push(rise);

    balloon.addEventListener("click", () => {
      balloon.style.transition = "transform 0.1s ease-out";
      balloon.style.transform = "scale(1.4)";
      popSound.currentTime = 0;
      popSound.play();
      setTimeout(() => balloon.remove(), 120);
      clearInterval(rise);
      score++;
      scoreDisplay.textContent = "Score: " + score + " 🎈";

      if (!rainbowMode && score >= 10) {
        rainbowMode = true;
        rainbowBanner.textContent = "🌈 RAINBOW MODE AKTIF!";
        rainbowBanner.style.animation = "glowText 1s infinite alternate";
      }

      if (score >= 30) {
        endBalloonGame("🎉 Anda berjaya pop 30 belon!");
        gameOver = true;
      }
    });
  }, 700);
}

function stopBalloonGame() {
  clearInterval(balloonInterval);
  activeRises.forEach(clearInterval);
  const area = document.getElementById("balloon-game");
  if (area) area.innerHTML = "";
}

function endBalloonGame(message) {
  clearInterval(balloonInterval);
  activeRises.forEach(clearInterval);
  const area = document.getElementById("balloon-game");
  if (area) area.innerHTML = `<div class="end-msg">${message}</div>`;
}

