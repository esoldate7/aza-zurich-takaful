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
let fruitInterval;
function startFruitSlice() {
  const game = document.getElementById("fruit-game");
  game.innerHTML = "";
  let score = 0;
  const scoreDisplay = document.createElement("div");
  scoreDisplay.className = "score-display";
  scoreDisplay.textContent = "Score: 0";
  game.appendChild(scoreDisplay);

  fruitInterval = setInterval(() => {
    const fruit = document.createElement("div");
    fruit.className = "fruit";
    fruit.textContent = "🍎";
    fruit.style.left = Math.random() * 80 + "%";
    fruit.style.top = Math.random() * 80 + "%";
    fruit.style.fontSize = "40px";
    game.appendChild(fruit);

    fruit.addEventListener("click", () => {
      fruit.style.transform = "scale(0)";
      score++;
      scoreDisplay.textContent = "Score: " + score;
      new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_0c1bdeef54.mp3?filename=knife-slice-1.mp3").play();
      setTimeout(() => fruit.remove(), 300);
    });

    setTimeout(() => fruit.remove(), 2000);
  }, 1500);
}

function stopFruitSlice() {
  clearInterval(fruitInterval);
  document.getElementById("fruit-game").innerHTML = "";
}

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
