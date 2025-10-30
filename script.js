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
