// ===== Update Tahun =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Senarai Negeri =====
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

// Populate dropdown
Object.entries(zonNegeri).forEach(([code, name]) => {
  const opt = document.createElement("option");
  opt.value = code;
  opt.textContent = name;
  negeriSelect.appendChild(opt);
});

// ===== Waktu Solat =====
negeriSelect.addEventListener("change", async () => {
  const zone = negeriSelect.value;
  if (!zone) return;

  solatResult.innerHTML = "⏳ Memuatkan waktu solat...";

  try {
    const res = await fetch(`https://corsproxy.io/?https://api.waktusolat.app/v2/solat/${zone}`);
    const data = await res.json();

    // Safety check
    if (!data.prayerTime || !data.prayerTime[0]) throw new Error("Tiada data waktu solat");

    const time = data.prayerTime[0];
    const html = `
      <ul>
        <li>🌅 Subuh: <b>${formatTime(time.Subuh)}</b></li>
        <li>☀️ Zohor: <b>${formatTime(time.Zohor)}</b></li>
        <li>🌇 Asar: <b>${formatTime(time.Asar)}</b></li>
        <li>🌆 Maghrib: <b>${formatTime(time.Maghrib)}</b></li>
        <li>🌃 Isyak: <b>${formatTime(time.Isyak)}</b></li>
      </ul>
      <p>🗓 ${time.Tarikh} (${data.zoneName || zone})</p>
    `;
    solatResult.innerHTML = html;
  } catch (err) {
    console.error(err);
    solatResult.innerHTML = "❌ Gagal memuatkan waktu solat.";
  }
});

function formatTime(epoch) {
  if (!epoch) return "-";
  const d = new Date(epoch * 1000);
  return d.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
}

// ===== Cuaca =====
const cuacaResult = document.getElementById("cuacaResult");
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode`
      );
      const data = await res.json();
      cuacaResult.textContent = `🌡️ Suhu: ${data.current.temperature_2m}°C`;
    } catch (e) {
      cuacaResult.textContent = "❌ Tidak dapat memuatkan cuaca.";
    }
  }, () => cuacaResult.textContent = "❌ Tidak dapat kesan lokasi cuaca.");
} else {
  cuacaResult.textContent = "Peranti tidak menyokong geolocation.";
}

// ===== Produk Zurich =====
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
const closeModal = document.getElementById("closeModal");

if (modal && modalInfo && closeModal) {
  document.querySelectorAll(".produk-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const produk = produkData[btn.dataset.produk];
      if (!produk) return;
      modalInfo.innerHTML = `
        <h3>${produk.nama}</h3>
        <p>${produk.info}</p>
        <button class="btn-quote">📄 Request Quotation</button>
      `;
      modal.classList.remove("hidden");
    });
  });

  closeModal.addEventListener("click", () => modal.classList.add("hidden"));
}

// ===== Fade-in Animation =====
(function setupFadeIn() {
  const sections = document.querySelectorAll(".section-fade");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  }, { threshold: 0.1 });

  sections.forEach((el, i) => {
    el.style.setProperty("--delay", `${i * 150}ms`);
    io.observe(el);
  });
})();
// ============================
    // 🎯 Kuiz Zurich Takaful
    // ============================
    const quizData = [
      {
        q: "Apakah tujuan utama takaful?",
        o: ["Untuk pelaburan cepat", "Perlindungan kewangan berasaskan perkongsian risiko", "Pinjaman tanpa faedah", "Insurans konvensional"],
        a: 1
      },
      {
        q: "Z-Drive Assist memberi perlindungan kepada…",
        o: ["Kenderaan & bantuan jalan raya", "Rumah & isi rumah", "Kesihatan peribadi", "Perniagaan kecil"],
        a: 0
      },
      {
        q: "Siapa yang boleh menyertai pelan takaful?",
        o: ["Hanya syarikat", "Hanya warga asing", "Sesiapa sahaja yang ingin perlindungan halal", "Orang berpendapatan tinggi sahaja"],
        a: 2
      }
    ];

    let currentQ = 0;
    let score = 0;

    const quizBox = document.getElementById("quizBox");
    const quizQuestion = document.getElementById("quizQuestion");
    const quizOptions = document.getElementById("quizOptions");
    const startBtn = document.getElementById("startQuiz");

    startBtn.addEventListener("click", startQuiz);

    function startQuiz() {
      currentQ = 0;
      score = 0;
      startBtn.style.display = "none";
      loadQuestion();
    }

    function loadQuestion() {
      const q = quizData[currentQ];
      quizQuestion.textContent = q.q;
      quizOptions.innerHTML = "";
      q.o.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(i);
        quizOptions.appendChild(btn);
      });
    }

    function checkAnswer(choice) {
      if (choice === quizData[currentQ].a) score++;
      currentQ++;
      if (currentQ < quizData.length) {
        loadQuestion();
      } else {
        endQuiz();
      }
    }

    function endQuiz() {
      quizQuestion.innerHTML = `✅ Selesai!<br>Markah anda: <b>${score}/${quizData.length}</b>`;
      quizOptions.innerHTML = "";
      startBtn.textContent = "Ulang Kuiz 🔁";
      startBtn.style.display = "block";
    }
