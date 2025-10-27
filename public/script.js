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
// 🕌 MULA PROSES
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const negeriSelect = document.getElementById("negeri");
  const result = document.getElementById("result");

  // Populate dropdown
  for (const [zone, name] of Object.entries(zonNegeri)) {
    const opt = document.createElement("option");
    opt.value = zone;
    opt.textContent = name;
    negeriSelect.appendChild(opt);
  }

  // Cuba auto detect lokasi
  autoDetectLokasi();

  // Bila user pilih negeri manual
  negeriSelect.addEventListener("change", (e) => {
    const zone = e.target.value;
    if (zone) fetchWaktu(zone);
  });
});

// =============================
// 🌍 AUTO DETECT LOKASI
// =============================
function autoDetectLokasi() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://api.waktusolat.app/v2/zone/${latitude},${longitude}`);
          const data = await res.json();
          if (data && data.zone) {
            fetchWaktu(data.zone);
            document.getElementById("negeri").value = data.zone;
          } else {
            showError("Tidak dapat kenal pasti zon lokasi.");
          }
        } catch (e) {
          showError("Ralat semasa dapatkan lokasi zon.");
        }
      },
      () => showError("Akses lokasi ditolak. Sila pilih negeri secara manual.")
    );
  } else {
    showError("Peranti tidak menyokong geolocation.");
  }
}

// =============================
// ⏰ FETCH WAKTU SOLAT
// =============================
async function fetchWaktu(zone) {
  const result = document.getElementById("result");
  result.innerHTML = "<p>⏳ Memuatkan waktu solat...</p>";

  try {
    const apiUrl = `https://api.waktusolat.app/v2/solat/${zone}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data && data.data && data.data.length > 0) {
      const waktu = data.data[0].times;
      const zoneName = data.zone?.name || zonNegeri[zone] || zone;
      const tarikh = data.data[0].date;
      displayWaktu(waktu, zoneName, tarikh);
    } else {
      showError("❌ Tiada data waktu solat ditemui.");
    }
  } catch (err) {
    console.error(err);
    showError("❌ Gagal mendapatkan waktu solat. Semak sambungan internet.");
  }
}

// =============================
// 📅 PAPAR WAKTU SOLAT
// =============================
function displayWaktu(waktu, zoneName, tarikh) {
  const result = document.getElementById("result");
  result.innerHTML = `
    <div class="card">
      <h3>📍 Zon: ${zoneName}</h3>
      <ul>
        <li>🌅 Subuh: <b>${waktu.Subuh}</b></li>
        <li>☀️ Zohor: <b>${waktu.Zohor}</b></li>
        <li>🌇 Asar: <b>${waktu.Asar}</b></li>
        <li>🌆 Maghrib: <b>${waktu.Maghrib}</b></li>
        <li>🌃 Isyak: <b>${waktu.Isyak}</b></li>
      </ul>
      <p>🗓 Tarikh: ${tarikh}</p>
    </div>
  `;
}

// =============================
// ⚠️ PAPAR RALAT
// =============================
function showError(msg) {
  const result = document.getElementById("result");
  result.innerHTML = `<p style="color:red;">${msg}</p>`;
}
