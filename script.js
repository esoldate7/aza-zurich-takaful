// ========== SECTION SWITCHER ==========
function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ========== PRODUK ZURICH ==========
const products = [
  { name: "Z-Drive Assist", desc: "Perlindungan kenderaan menyeluruh dengan bantuan di jalan raya 24 jam." },
  { name: "Z-Motor", desc: "Pelan takaful komprehensif untuk motosikal dengan manfaat kemalangan & kehilangan." },
  { name: "Z-Rider", desc: "Perlindungan khas untuk penunggang motosikal dan skuter termasuk kemalangan diri." },
  { name: "Z-Travel", desc: "Perlindungan perjalanan dalam & luar negara, termasuk kehilangan bagasi & kelewatan." },
  { name: "PA Takaful", desc: "Perlindungan kemalangan diri 24 jam di seluruh dunia." },
  { name: "Fire Takaful (Business Owner)", desc: "Lindungi aset perniagaan daripada kebakaran, kilat & letupan." }
];

const productList = document.getElementById("product-list");
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

function showProductInfo(index) {
  const p = products[index];
  alert(`📘 ${p.name}\n\n${p.desc}`);
}

function openQuoteForm(name) {
  alert(`📝 Borang quotation untuk ${name} akan dibuka di versi seterusnya.`);
}

// ========== FRUIT SLICE GAME ==========
// ===============================
// 🎮 FRUIT SLICE - Refined Script
// ===============================

// 🎵 Load sound
const sliceSound = new Audio("assets/slice.mp3");
sliceSound.volume = 0.6; // lembut, tak bingit

// 🍉 Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let fruits = [];
let score = 0;
let lives = 3;
let gravity = 0.05;
let gameOver = false;

// 🎨 UI text setup
ctx.font = "20px Poppins";
ctx.fillStyle = "#fff";

// 🥝 Fruit class
class Fruit {
  constructor(x, y, size, color, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speedX = speedX;
    this.speedY = speedY;
    this.isSliced = false;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += gravity;
  }
}

// 🍊 Spawn fruits
function spawnFruit() {
  if (gameOver) return;

  const size = 40 + Math.random() * 25; // lebih besar
  const x = Math.random() * canvas.width;
  const y = canvas.height + 20;
  const color = `hsl(${Math.random() * 360}, 80%, 60%)`;
  const speedX = -3 + Math.random() * 6;
  const speedY = -9 - Math.random() * 4; // lonjak perlahan naik
  fruits.push(new Fruit(x, y, size, color, speedX, speedY));
}

// 🎯 Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 30);

  fruits.forEach((fruit, index) => {
    fruit.update();
    fruit.draw();

    // Buah jatuh bawah skrin
    if (fruit.y - fruit.size > canvas.height) {
      fruits.splice(index, 1);
      if (--lives <= 0) {
        gameOver = true;
      }
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

// 🍎 Slice detection
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

// 🍌 Start game
setInterval(spawnFruit, 1500); // lebih perlahan & stabil
animate();


// ========== BALLOON POP GAME ==========
let balloonInterval;
function startBalloonGame() {
  const area = document.getElementById("balloon-game");
  area.innerHTML = "";
  let score = 0;
  const scoreDisplay = document.createElement("div");
  scoreDisplay.className = "score-display";
  scoreDisplay.textContent = "Score: 0 🎈";
  area.appendChild(scoreDisplay);

  const popSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/22/audio_5b5cfa5b4f.mp3?filename=balloon-pop.mp3");

  balloonInterval = setInterval(() => {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.textContent = "🎈";
    balloon.style.left = Math.random() * 90 + "%";
    balloon.style.bottom = "0px";
    balloon.style.fontSize = "45px";
    area.appendChild(balloon);

    const rise = setInterval(() => {
      let bottom = parseInt(balloon.style.bottom);
      balloon.style.bottom = bottom + 5 + "px";
      if (bottom > 400) {
        balloon.remove();
        clearInterval(rise);
      }
    }, 100);

    balloon.addEventListener("click", () => {
      popSound.play();
      score++;
      scoreDisplay.textContent = "Score: " + score + " 🎈";
      balloon.remove();
      clearInterval(rise);
    });
  }, 1200);
}

function stopBalloonGame() {
  clearInterval(balloonInterval);
  document.getElementById("balloon-game").innerHTML = "";
}
