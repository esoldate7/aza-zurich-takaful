// ===================== WAKTU SOLAT & CUACA =====================

// Senarai negeri Malaysia
const negeriList = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang",
  "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak",
  "Selangor", "Terengganu", "W.P. Kuala Lumpur", "W.P. Putrajaya", "W.P. Labuan"
];

const negeriSelect = document.getElementById("negeriSelect");
const solatBox = document.getElementById("solatBox");
const cuacaBox = document.getElementById("cuacaBox");

// Populate dropdown negeri
negeriList.forEach(n => {
  const opt = document.createElement("option");
  opt.value = n;
  opt.textContent = n;
  negeriSelect.appendChild(opt);
});

negeriSelect.addEventListener("change", () => {
  const negeri = negeriSelect.value;
  if (negeri) {
    getWaktuSolat(negeri);
    getCuaca(negeri);
  }
});

// API Waktu Solat
async function getWaktuSolat(negeri) {
  solatBox.innerHTML = "⏳ Memuatkan waktu solat...";
  try {
    const resp = await fetch(`https://corsproxy.io/?https://api.waktusolat.app/v2/solat/${encodeURIComponent(negeri)}`);
    const data = await resp.json();
    if (data.prayerTime && data.prayerTime[0]) {
      const w = data.prayerTime[0];
      const toTime = ts => new Date(ts * 1000).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
      solatBox.innerHTML = `
        <h3>📍 Zon: ${data.zone}</h3>
        <p>Subuh: ${toTime(w.fajr)}</p>
        <p>Syuruk: ${toTime(w.syuruk)}</p>
        <p>Zohor: ${toTime(w.dhuhr)}</p>
        <p>Asar: ${toTime(w.asr)}</p>
        <p>Maghrib: ${toTime(w.maghrib)}</p>
        <p>Isyak: ${toTime(w.isha)}</p>
        <small>Tarikh Hijri: ${w.hijri}</small>
      `;
    } else {
      solatBox.innerHTML = "❌ Gagal memuatkan waktu solat.";
    }
  } catch (err) {
    solatBox.innerHTML = "⚠️ Ralat capaian API waktu solat.";
  }
}

// API Cuaca
async function getCuaca(negeri) {
  cuacaBox.innerHTML = "⏳ Memuatkan data cuaca...";
  try {
    const resp = await fetch(`https://corsproxy.io/?https://api.open-meteo.com/v1/forecast?latitude=3.139&longitude=101.6869&current_weather=true`);
    const data = await resp.json();
    const weather = data.current_weather;
    cuacaBox.innerHTML = `
      <h3>🌤️ Cuaca Semasa</h3>
      <p>Negeri: ${negeri}</p>
      <p>Suhu: ${weather.temperature}°C</p>
      <p>Kelajuan Angin: ${weather.windspeed} km/j</p>
      <p>Keadaan: ${weather.weathercode < 3 ? "Cerah" : "Berawan / Hujan"}</p>
    `;
  } catch (err) {
    cuacaBox.innerHTML = "⚠️ Tidak dapat memuatkan cuaca.";
  }
}

// ===================== PRODUK ZURICH TAKAFUL =====================

const produkInfo = {
  zdrive: {
    nama: "Z-Drive Assist",
    info: "Perlindungan menyeluruh untuk kenderaan anda termasuk bantuan tepi jalan, tunda dan kemalangan.",
  },
  zmotor: {
    nama: "Z-Motor",
    info: "Takaful komprehensif untuk kereta anda meliputi kerosakan, kecurian dan liabiliti pihak ketiga.",
  },
  zrider: {
    nama: "Z-Rider",
    info: "Perlindungan untuk penunggang motosikal — termasuk kemalangan diri dan kehilangan kenderaan.",
  },
  zpa: {
    nama: "Personal Accident (PA)",
    info: "Lindungi diri anda dan keluarga daripada risiko kemalangan dengan pampasan tunai segera.",
  },
  ztravel: {
    nama: "Z-Travel",
    info: "Takaful perjalanan bagi melindungi anda daripada kecemasan, kehilangan bagasi dan kelewatan penerbangan.",
  },
  zfirebiz: {
    nama: "Fire Takaful (Business)",
    info: "Perlindungan untuk premis perniagaan anda terhadap risiko kebakaran, letupan dan bencana lain.",
  }
};

const modal = document.getElementById("modal");
const produkInfoDiv = document.getElementById("produkInfo");
const closeModal = document.getElementById("closeModal");

document.querySelectorAll(".produk-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.produk;
    const p = produkInfo[key];
    if (p) {
      produkInfoDiv.innerHTML = `
        <h3>${p.nama}</h3>
        <p>${p.info}</p>
      `;
      modal.classList.add("show");
    }
  });
});

closeModal.addEventListener("click", () => modal.classList.remove("show"));
window.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

// Borang Quotation
const quoteForm = document.getElementById("quoteForm");
quoteForm.addEventListener("submit", e => {
  e.preventDefault();
  alert("✅ Permohonan quotation telah dihantar! Kami akan hubungi anda tidak lama lagi.");
  modal.classList.remove("show");
  quoteForm.reset();
});

// ===================== KUIZ =====================
const quizSection = document.getElementById("quizSection");
const quizBox = document.getElementById("quizBox");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const startQuiz = document.getElementById("startQuiz");

const quizData = [
  {
    q: "Apakah maksud 'Takaful'?",
    o: ["Perlindungan bersama", "Insurans konvensional", "Pinjaman kewangan"],
    a: 0
  },
  {
    q: "Z-Drive Assist direka untuk?",
    o: ["Perlindungan rumah", "Bantuan kecemasan kenderaan", "Pelan pelancongan"],
    a: 1
  },
  {
    q: "Z-Travel memberi perlindungan untuk?",
    o: ["Kemalangan tempat kerja", "Perjalanan dan bagasi", "Pembelian kereta"],
    a: 1
  },
  {
    q: "Personal Accident (PA) memberi pampasan untuk?",
    o: ["Kemalangan diri", "Kecurian kenderaan", "Bencana alam"],
    a: 0
  }
];

let current = 0;
let score = 0;

startQuiz.addEventListener("click", start);

function start() {
  current = 0;
  score = 0;
  startQuiz.style.display = "none";
  loadQuestion();
}

function loadQuestion() {
  const q = quizData[current];
  quizQuestion.textContent = q.q;
  quizOptions.innerHTML = "";
  q.o.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "produk-btn";
    btn.onclick = () => checkAnswer(i);
    quizOptions.appendChild(btn);
  });
}

function checkAnswer(i) {
  if (i === quizData[current].a) score++;
  current++;
  if (current < quizData.length) {
    loadQuestion();
  } else {
    quizQuestion.innerHTML = `🎉 Tamat! Skor anda: <b>${score}/${quizData.length}</b>`;
    quizOptions.innerHTML = "";
    startQuiz.textContent = "Main Semula";
    startQuiz.style.display = "block";
  }
}

// Tahun automatik footer
document.getElementById("year").textContent = new Date().getFullYear();
