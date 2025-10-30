// =============================
// 📍 SENARAI ZON & NEGERI
// =============================
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

// =============================
// 🚀 MULA
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const negeriSelect = document.getElementById("negeri");
  const solatResult = document.getElementById("solatResult");
  const cuacaResult = document.getElementById("cuacaResult");
  const year = document.getElementById("year");
  year.textContent = new Date().getFullYear();

  // Populate dropdown
  for (const [code, name] of Object.entries(zonNegeri)) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = name;
    negeriSelect.appendChild(opt);
  }

  // Auto detect cuaca & zon
  autoDetectCuaca();
  autoDetectLokasi();

  negeriSelect.addEventListener("change", (e) => {
    const zone = e.target.value;
    if (zone) fetchWaktu(zone);
  });
});

// =============================
// 🌍 LOKASI WAKTU SOLAT
// =============================
function autoDetectLokasi() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://corsproxy.io/?https://api.waktusolat.app/v2/zone/${latitude},${longitude}`);
          const data = await res.json();
          if (data && data.zone) {
            fetchWaktu(data.zone);
            document.getElementById("negeri").value = data.zone;
          } else showError("Tidak dapat kenal pasti zon lokasi.");
        } catch (e) {
          showError("Ralat semasa mendapatkan zon waktu solat.");
        }
      },
      () => showError("Akses lokasi ditolak. Sila pilih negeri secara manual.")
    );
  } else {
    showError("Peranti tidak menyokong geolocation.");
  }
}

// =============================
// 🕋 FETCH WAKTU SOLAT
// =============================
async function fetchWaktu(zone) {
  const solatResult = document.getElementById("solatResult");
  solatResult.innerHTML = "⏳ Memuatkan waktu solat...";

  try {
    const apiUrl = `https://corsproxy.io/?https://api.waktusolat.app/v2/solat/${zone}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data && data.prayerTime) {
      displayWaktu(data.prayerTime, data.zoneName);
    } else {
      showError("❌ Tiada data waktu solat ditemui.");
    }
  } catch {
    showError("❌ Gagal mendapatkan waktu solat.");
  }
}

// =============================
// ⏰ PAPAR WAKTU SOLAT
// =============================
function displayWaktu(waktu, zoneName) {
  const solatResult = document.getElementById("solatResult");

  const formatTime = (unixTime) => {
    const date = new Date(unixTime * 1000);
    return date.toLocaleTimeString("ms-MY", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kuala_Lumpur"
    });
  };

  solatResult.innerHTML = `
    <h3>📍 Zon: ${zoneName}</h3>
    <ul>
      <li>🌅 Subuh: <b>${formatTime(waktu.Subuh)}</b></li>
      <li>☀️ Zohor: <b>${formatTime(waktu.Zohor)}</b></li>
      <li>🌇 Asar: <b>${formatTime(waktu.Asar)}</b></li>
      <li>🌆 Maghrib: <b>${formatTime(waktu.Maghrib)}</b></li>
      <li>🌃 Isyak: <b>${formatTime(waktu.Isyak)}</b></li>
    </ul>
    <p>🗓 Hijri: ${waktu.Hijri}</p>
  `;
}

// =============================
// 🌦️ CUACA
// =============================
async function autoDetectCuaca() {
  const cuacaResult = document.getElementById("cuacaResult");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const apiKey = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current_weather=true";

      try {
        const res = await fetch(apiKey);
        const data = await res.json();
        const weather = data.current_weather;
        cuacaResult.innerHTML = `
          <p>🌡️ Suhu: <b>${weather.temperature}°C</b></p>
          <p>💨 Angin: <b>${weather.windspeed} km/j</b></p>
        `;
      } catch {
        cuacaResult.innerHTML = "❌ Gagal memuatkan data cuaca.";
      }
    });
  } else {
    cuacaResult.innerHTML = "❌ Peranti tidak menyokong geolocation.";
  }
}

// =============================
// ⚠️ PAPAR RALAT
// =============================
function showError(msg) {
  document.getElementById("solatResult").innerHTML = `<p style="color:#ffcccc;">${msg}</p>`;
}
// ===== Info Produk: interactive cards + modal quote (add at end of script.js) =====
(function initProducts(){
  const WA_NUMBER = "60123456789"; // <-- GANTI dengan nombor WhatsApp bro (no +)
  const products = [
    {
      id: "ztravel",
      title: "ZTravel",
      icon: "✈️",
      short: "Perlindungan perjalanan antarabangsa & domestik.",
      details: "Liputan perjalanan: pembatalan, perubatan kecemasan, kehilangan bagasi dan bantuan 24/7."
    },
    {
      id: "zdrive",
      title: "Z-Drive Assist",
      icon: "🛠️",
      short: "Bantuan tepi jalan & towing 24/7 untuk kenderaan.",
      details: "Termasuk towing, bantuan bateri, kunci terkunci, penghantaran minyak & tukar tayar kecemasan."
    },
    {
      id: "zrider",
      title: "Z-Rider",
      icon: "🏍️",
      short: "Takaful motosikal — perlindungan komprehensif dan TPFT.",
      details: "Perlindungan kemalangan, liabiliti pihak ketiga, dan bantuan kecemasan."
    },
    {
      id: "ztakaful",
      title: "ZTakaful (General)",
      icon: "🛡️",
      short: "Pelan am untuk perlindungan aset & liabiliti.",
      details: "Pilihan untuk kediaman, perniagaan kecil, dan perlindungan aset penting."
    }
  ];

  const grid = document.getElementById("productsGrid");
  const modal = document.getElementById("quoteModal");
  const modalTitle = document.getElementById("modalProductTitle");
  const form = document.getElementById("quoteForm");
  const modalClose = document.getElementById("modalClose");
  const modalCancel = document.getElementById("modalCancel");

  // render cards
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "prod-card";
    card.innerHTML = `
      <div class="prod-head">
        <div class="prod-icon">${p.icon}</div>
        <div style="flex:1">
          <p class="prod-title">${p.title}</p>
          <p class="prod-short">${p.short}</p>
        </div>
      </div>
      <div class="prod-actions">
        <button class="btn small" data-action="toggle" data-id="${p.id}">Details</button>
        <button class="btn small ghost" data-action="quote" data-id="${p.id}">Request Quote</button>
      </div>
      <div class="prod-details" id="details-${p.id}">${p.details}</div>
    `;
    grid.appendChild(card);
  });

  // event delegation for toggles & quote
  grid.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "toggle") {
      const d = document.getElementById(`details-${id}`);
      d.classList.toggle("open");
    } else if (action === "quote") {
      const prod = products.find(x => x.id === id);
      openModal(prod);
    }
  });

  // open modal prefill
  function openModal(prod){
    modalTitle.textContent = `Produk: ${prod.title}`;
    // clear form
    form.reset();
    // store product id in form dataset
    form.dataset.product = prod.title;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden","false");
  }

  function closeModal(){
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden","true");
  }

  modalClose.addEventListener("click", closeModal);
  modalCancel.addEventListener("click", closeModal);

  // handle form submit -> open WhatsApp with prefilled message
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pname = form.dataset.product || "Produk";
    const name = document.getElementById("q_name").value.trim();
    const phone = document.getElementById("q_phone").value.trim();
    const email = document.getElementById("q_email").value.trim();
    const msg = document.getElementById("q_message").value.trim();

    // prepare message
    let text = `Permintaan Sebutharga (${pname})%0ANama: ${encodeURIComponent(name)}%0ANo Telefon: ${encodeURIComponent(phone)}`;
    if (email) text += `%0AEmel: ${encodeURIComponent(email)}`;
    if (msg) text += `%0ANota: ${encodeURIComponent(msg)}`;

    // WhatsApp Web URL
    const waUrl = `https://wa.me/${60192506999}?text=${text}`;

    // open whatsapp (new tab)
    window.open(waUrl, "_blank");
    closeModal();
  });

  // close modal on background click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

})();
