// Year update
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Populate Negeri List =====
const negeriSelect = document.getElementById("negeriSelect");
const solatResult = document.getElementById("solatResult");
const zonNegeri = {
  "WLY01": "Kuala Lumpur",
  "WLY02": "Putrajaya",
  "SGR01": "Selangor",
  "JHR01": "Johor",
  "KDH01": "Kedah",
  "KTN01": "Kelantan",
  "MLK01": "Melaka",
  "NSN01": "Negeri Sembilan",
  "PHG01": "Pahang",
  "PRK01": "Perak",
  "PLS01": "Perlis",
  "PNG01": "Pulau Pinang",
  "SBH01": "Sabah",
  "SWK01": "Sarawak",
  "TRG01": "Terengganu",
  "LBN01": "Labuan"
};
for (const [code, name] of Object.entries(zonNegeri)) {
  const opt = document.createElement("option");
  opt.value = code;
  opt.textContent = name;
  negeriSelect.appendChild(opt);
}

// ===== Fetch Waktu Solat =====
negeriSelect.addEventListener("change", async () => {
  const zone = negeriSelect.value;
  if (!zone) return;
  solatResult.innerHTML = "⏳ Memuatkan waktu solat...";
  try {
    const res = await fetch(`https://corsproxy.io/?https://api.waktusolat.app/v2/solat/${zone}`);
    const data = await res.json();
    const time = data.prayerTime[0];
    const html = `
      <ul>
        <li>🌅 Subuh: <b>${formatTime(time.Subuh)}</b></li>
        <li>☀️ Zohor: <b>${formatTime(time.Zohor)}</b></li>
        <li>🌇 Asar: <b>${formatTime(time.Asar)}</b></li>
        <li>🌆 Maghrib: <b>${formatTime(time.Maghrib)}</b></li>
        <li>🌃 Isyak: <b>${formatTime(time.Isyak)}</b></li>
      </ul>
      <p>🗓 ${time.Tarikh} (${data.zoneName})</p>
    `;
    solatResult.innerHTML = html;
  } catch {
    solatResult.innerHTML = "❌ Gagal memuatkan waktu solat.";
  }
});
function formatTime(epoch) {
  const d = new Date(epoch * 1000);
  return d.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
}

// ===== Cuaca =====
const cuacaResult = document.getElementById("cuacaResult");
navigator.geolocation?.getCurrentPosition(async pos => {
  const { latitude, longitude } = pos.coords;
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode`);
    const data = await res.json();
    const temp = data.current.temperature_2m;
    cuacaResult.textContent = `🌡️ Suhu: ${temp}°C`;
  } catch {
    cuacaResult.textContent = "Tidak dapat memuatkan cuaca.";
  }
}, () => cuacaResult.textContent = "❌ Tidak dapat kesan lokasi cuaca.");

// ===== Produk Zurich Info =====
const produkData = {
  zdrive: {
    nama: "Z-Drive Assist",
    info: "Perlindungan komprehensif bagi kenderaan anda termasuk bantuan kecemasan di jalan raya, towing, dan pembaikan segera.",
  },
  zmotor: {
    nama: "Z-Motor",
    info: "Pelan Takaful Motor yang memberi perlindungan menyeluruh untuk kenderaan peribadi terhadap kemalangan, kebakaran, dan kecurian.",
  },
  zrider: {
    nama: "Z-Rider",
    info: "Takaful khas untuk penunggang motosikal, dengan perlindungan kemalangan diri dan manfaat hospitalisasi.",
  },
  zpa: {
    nama: "Personal Accident",
    info: "Perlindungan 24 jam di seluruh dunia terhadap kemalangan diri dan kecederaan tidak dijangka.",
  },
  ztravel: {
    nama: "Z-Travel",
    info: "Perlindungan perjalanan dalam & luar negara termasuk kelewatan penerbangan, kehilangan bagasi, dan kecemasan perubatan.",
  },
  zfirebiz: {
    nama: "Fire Takaful (Business)",
    info: "Lindungi premis perniagaan anda daripada risiko kebakaran, letupan, dan bencana alam.",
  },
};

const modal = document.getElementById("produkModal");
const modalInfo = document.getElementById("produkInfo");
document.querySelectorAll(".produk-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const produk = produkData[btn.dataset.produk];
    modalInfo.innerHTML = `
      <h3>${produk.nama}</h3>
      <p>${produk.info}</p>
      <button class="btn-quote">📄 Request Quotation</button>
    `;
    modal.classList.remove("hidden");
  });
});
document.getElementById("closeModal").addEventListener("click", () => modal.classList.add("hidden"));

// ===== Fade-in Animation =====
(function setupFadeIn() {
  const cards = document.querySelectorAll(".section-fade");
  cards.forEach((el, i) => el.style.setProperty("--delay", `${i * 140}ms`));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  }, { threshold: 0.1 });
  cards.forEach(el => io.observe(el));
})();
