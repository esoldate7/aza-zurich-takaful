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
// ========== LITE GAMES SWITCHER ==========
function showGame(type) {
  const fruitArea = document.getElementById("fruit-game");
  const balloonArea = document.getElementById("balloon-game");

  if (type === "fruit") {
    fruitArea.style.display = "block";
    balloonArea.style.display = "none";

    // Start Fruit Game
    if (window.startFruitGame) startFruitGame();

    // Stop Balloon Game
    if (window.stopBalloonGame) stopBalloonGame();

  } else if (type === "balloon") {
    balloonArea.style.display = "block";
    fruitArea.style.display = "none";

    // Start Balloon Game
    if (window.startBalloonGame) startBalloonGame();

    // Stop Fruit Game
    if (window.stopFruitGame) stopFruitGame();
  }
}
// ========== LITE GAMES SWITCHER ==========
function showGame(type) {
  const fruitArea = document.getElementById("fruit-game");
  const balloonArea = document.getElementById("balloon-game");

  if (type === "fruit") {
    fruitArea.style.display = "block";
    balloonArea.style.display = "none";

    if (window.startFruitGame) startFruitGame();
    if (window.stopBalloonGame) stopBalloonGame();

  } else if (type === "balloon") {
    fruitArea.style.display = "none";
    balloonArea.style.display = "block";

    if (window.startBalloonGame) startBalloonGame();
    if (window.stopFruitGame) stopFruitGame();
  }
}
