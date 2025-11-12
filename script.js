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

// ========== WAKTU SOLAT ==========
async function fetchWaktuFromESolat(zone) {
  const solatResult = document.getElementById("solatResult");
  solatResult.textContent = '⏳ Memuatkan waktu solat...';
  try {
    // 🔧 Override Putrajaya supaya ikut KL (WLY01)
    if (zone === "WLY02") zone = "WLY01";

    const r = await fetch(`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`);
    const data = await r.json();

    if (data && data.prayerTime && data.prayerTime[0]) {
      const d = data.prayerTime[0];
      solatResult.innerHTML = `
        <strong>Zon: ${data.zone || zone}</strong><br>
        🌅 Subuh: <b>${d.fajr}</b> &nbsp; ☀️ Syuruk: <b>${d.syuruk || d.sunrise || '-'}</b><br>
        🕌 Zohor: <b>${d.dhuhr}</b> &nbsp; 🌇 Asar: <b>${d.asr}</b><br>
        🌆 Maghrib: <b>${d.maghrib}</b> &nbsp; 🌃 Isyak: <b>${d.isha}</b><br>
        <small>Tarikh: ${d.date || '-'}</small>
      `;
    } else {
      throw new Error("Tiada data eSolat");
    }
  } catch (err) {
    solatResult.textContent = '❌ Gagal memuatkan waktu solat.';
    console.error(err);
  }
}

// ========== FRUIT SLICE GAME ==========
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const sliceSound = new Audio("assets/slice.mp3");
sliceSound.volume = 0.6;

let fruits = [];
let score = 0;
let lives = 3;
let gravity = 0.05;
let gameOver = false;

ctx.font = "20px Poppins";
ctx.fillStyle = "#fff";

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
    const gradient = ctx.createRadialGradient(this.x, this.y, this.size * 0.2, this.x, this.y, this.size);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(1, this.color);
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += gravity;
  }
}

function spawnFruit() {
  if (gameOver) return;
  const size = 55 + Math.random() * 15; // besar & realistik
  const x = Math.random() * canvas.width;
  const y = canvas.height + 30;
  const color = `hsl(${Math.random() * 360}, 70%, 55%)`;
  const speedX = -2 + Math.random() * 4;
  const speedY = -10 - Math.random() * 3;
  fruits.push(new Fruit(x, y, size, color, speedX, speedY));
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 30);

  fruits.forEach((fruit, index) => {
    fruit.update();
    fruit.draw();
    if (fruit.y - fruit.size > canvas.height) {
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

setInterval(spawnFruit, 1000); // seimbang: tak terlalu cepat
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

  const popSound = new Audio("assets/pop.mp3");

  balloonInterval = setInterval(() => {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.textContent = "🎈";
    balloon.style.left = Math.random() * 90 + "%";
    balloon.style.bottom = "0px";
    balloon.style.fontSize = 45 + Math.random() * 10 + "px";
    area.appendChild(balloon);

    let bottom = 0;
    const rise = setInterval(() => {
      bottom += 3;
      balloon.style.bottom = bottom + "px";
      if (bottom > 400) {
        balloon.remove();
        clearInterval(rise);
      }
    }, 40);

    balloon.addEventListener("click", () => {
      popSound.currentTime = 0;
      popSound.play();
      score++;
      scoreDisplay.textContent = "Score: " + score + " 🎈";
      balloon.remove();
      clearInterval(rise);
    });
  }, 1000); // stabil & tak serabut
}

function stopBalloonGame() {
  clearInterval(balloonInterval);
  document.getElementById("balloon-game").innerHTML = "";
}
