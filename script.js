document.addEventListener("DOMContentLoaded", () => {
  const negeriSelect = document.getElementById("zoneSelect");
  const btnManual = document.getElementById("btnManual");
  const controls = document.getElementById("controls");
  const status = document.getElementById("status");
  const spinner = document.getElementById("spinner");
  const result = document.getElementById("result");
  const zoneLabel = document.getElementById("zoneLabel");
  const prayerList = document.getElementById("prayerList");

  // Peta kod zon JAKIM
  const zonNegeri = {
    "WLY01": "Wilayah Persekutuan Kuala Lumpur",
    "WLY02": "Wilayah Persekutuan Labuan",
    "WLY03": "Wilayah Persekutuan Putrajaya",
    "JHR01": "Johor Bahru, Kota Tinggi, Mersing",
    "KDH01": "Kedah - Kota Setar, Kubang Pasu, Pokok Sena",
    "KTN01": "Kelantan",
    "MLK01": "Melaka",
    "NSN01": "Negeri Sembilan",
    "PHG01": "Pahang Barat",
    "PRK01": "Perak Utara",
    "PLS01": "Perlis",
    "PNG01": "Pulau Pinang",
    "SBH01": "Sabah Barat",
    "SWK01": "Sarawak Utara",
    "SGR01": "Selangor",
    "TRG01": "Terengganu"
  };

  // Isi dropdown negeri
  for (const [zone, name] of Object.entries(zonNegeri)) {
    const opt = document.createElement("option");
    opt.value = zone;
    opt.textContent = name;
    negeriSelect.appendChild(opt);
  }

  // Tahun footer auto update
  document.getElementById("year").textContent = new Date().getFullYear();

  // Toggle manual pilih negeri
  btnManual.addEventListener("click", () => {
    controls.classList.toggle("hidden");
  });

  // Bila user pilih negeri manual
  negeriSelect.addEventListener("change", (e) => {
    const zone = e.target.value;
    if (zone) fetchWaktu(zone);
  });

  // Auto detect lokasi guna geolocation
  autoDetectLokasi();

  function autoDetectLokasi() {
    if (!navigator.geolocation) {
      status.textContent = "Geolokasi tidak disokong peranti ini.";
      return;
    }

    spinner.classList.remove("hidden");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        dapatkanZon(latitude, longitude);
      },
      () => {
        spinner.classList.add("hidden");
        status.textContent = "Tidak dapat kesan lokasi. Sila pilih negeri secara manual.";
        controls.classList.remove("hidden");
      }
    );
  }

  // Padankan lokasi pengguna dengan zon
  function dapatkanZon(lat, lon) {
    // Untuk versi offline ringkas, kita auto fallback ke Kuala Lumpur
    const zone = "WLY01";
    fetchWaktu(zone);
  }

  // Fetch waktu solat
  async function fetchWaktu(zone) {
    spinner.classList.remove("hidden");
    status.textContent = "Mengambil data waktu solat...";
    result.classList.add("hidden");

    try {
      const response = await fetch(`https://corsproxy.io/?https://api.waktusolat.app/v2/solat/${zone}`);
      const data = await response.json();

      if (!data || !data.prayers) throw new Error("Tiada data.");

      const prayers = data.prayers;
      zoneLabel.textContent = zonNegeri[zone] || zone;
      prayerList.innerHTML = "";

      for (const [name, time] of Object.entries(prayers)) {
        const li = document.createElement("li");
        li.textContent = `${formatNama(name)}: ${time}`;
        prayerList.appendChild(li);
      }

      spinner.classList.add("hidden");
      status.textContent = "";
      result.classList.remove("hidden");
    } catch (err) {
      spinner.classList.add("hidden");
      status.textContent = "Ralat mengambil data waktu solat.";
    }
  }

  function formatNama(key) {
    const map = {
      imsak: "Imsak",
      fajr: "Subuh",
      syuruk: "Syuruk",
      dhuhr: "Zohor",
      asr: "Asar",
      maghrib: "Maghrib",
      isha: "Isyak"
    };
    return map[key] || key;
  }
});
