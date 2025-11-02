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
// =============================
// 🧠 Kuiz Zurich Takaful — Versi Dibaiki & Animasi Smooth
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const quizData = [
    {
      question: "Apakah tujuan utama takaful?",
      options: [
        "Perlindungan bersama berdasarkan tolong-menolong",
        "Untuk keuntungan individu semata-mata",
        "Sistem insurans konvensional",
        "Pelaburan jangka pendek"
      ],
      answer: 0
    },
    {
      question: "Apakah maksud 'Tabarru’' dalam takaful?",
      options: [
        "Sumbangan ikhlas ke dalam dana bersama",
        "Pembayaran balik pinjaman",
        "Bonus tahunan",
        "Faedah pelaburan"
      ],
      answer: 0
    },
    {
      question: "Produk Zurich manakah yang melindungi kenderaan anda?",
      options: [
        "Z-Rider",
        "Z-Drive Assist",
        "Z-Travel",
        "Fire Takaful"
      ],
      answer: 1
    },
    {
      question: "Z-Travel sesuai untuk apa?",
      options: [
        "Melindungi percutian dan perjalanan anda",
        "Melindungi rumah daripada kebakaran",
        "Memberi elaun hospital",
        "Untuk pelan pendidikan anak"
      ],
      answer: 0
    }
  ];

  const startBtn = document.getElementById("startQuiz");
  const questionBox = document.getElementById("quizQuestion");
  const optionsBox = document.getElementById("quizOptions");
  const progressBar = document.querySelector("#quizProgress div");

  let current = 0;
  let score = 0;
  let inProgress = false;

  // =============================
  // 🚀 Start Kuiz
  // =============================
  startBtn.addEventListener("click", () => {
    startBtn.style.display = "none";
    inProgress = true;
    current = 0;
    score = 0;
    showQuestion();
  });

  // =============================
  // 📄 Papar Soalan
  // =============================
  function showQuestion() {
    const q = quizData[current];
    questionBox.textContent = q.question;
    optionsBox.innerHTML = "";
    updateProgress();

    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.className = "quiz-option";
      btn.onclick = () => checkAnswer(i, btn);
      optionsBox.appendChild(btn);
    });

    // animasi kecil supaya smooth
    questionBox.style.opacity = 0;
    setTimeout(() => (questionBox.style.opacity = 1), 50);
  }

  // =============================
  // 🔄 Update Progress Bar
  // =============================
  function updateProgress() {
    const percent = ((current) / quizData.length) * 100;
    progressBar.style.width = percent + "%";
  }

  // =============================
  // ✅ Semak Jawapan
  // =============================
  function checkAnswer(i, btn) {
    if (!inProgress) return;

    const correct = quizData[current].answer;
    const buttons = optionsBox.querySelectorAll("button");
    buttons.forEach(b => (b.disabled = true));

    if (i === correct) {
      btn.style.background = "#a3ffb3";
      score++;
    } else {
      btn.style.background = "#ffb3b3";
      buttons[correct].style.background = "#a3ffb3";
    }

    // terus ke next soalan
    setTimeout(() => {
      current++;
      if (current < quizData.length) {
        showQuestion();
      } else {
        showResult();
      }
    }, 800);
  }

  // =============================
  // 🏁 Tamat Kuiz
  // =============================
  function showResult() {
    inProgress = false;
    progressBar.style.width = "100%";
    questionBox.innerHTML = `✅ Kuiz Tamat!<br>Markah Anda: <b>${score}/${quizData.length}</b>`;
    optionsBox.innerHTML = "";

    const restart = document.createElement("button");
    restart.textContent = "Ulang Kuiz 🔁";
    restart.id = "restartQuiz";
    restart.onclick = () => {
      startBtn.style.display = "block";
      questionBox.textContent = "Tekan butang di bawah untuk mula kuiz!";
      optionsBox.innerHTML = "";
      progressBar.style.width = "0%";
    };
    optionsBox.appendChild(restart);
  }
});
