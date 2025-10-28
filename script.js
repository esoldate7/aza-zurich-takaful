document.addEventListener("DOMContentLoaded", () => {
  const btnManual = document.getElementById("btnManual");
  const controls = document.getElementById("controls");
  const zoneSelect = document.getElementById("zoneSelect");
  const status = document.getElementById("status");
  const spinner = document.getElementById("spinner");
  const result = document.getElementById("result");
  const zoneLabel = document.getElementById("zoneLabel");
  const prayerList = document.getElementById("prayerList");
  const year = document.getElementById("year");

  year.textContent = new Date().getFullYear();

  const zones = {
    "WLY01": "Wilayah Persekutuan Kuala Lumpur",
    "WLY02": "Wilayah Persekutuan Labuan",
    "WLY03": "Wilayah Persekutuan Putrajaya",
    "JHR01": "Johor Bahru, Kota Tinggi, Mersing",
    "KDH01": "Kota Setar, Kubang Pasu, Pokok Sena",
    "KTN01": "Kota Bharu, Bachok, Pasir Puteh",
    "MLK01": "Seluruh Negeri Melaka",
    "NSN01": "Seremban, Port Dickson",
    "PHG01": "Kuantan, Pekan, Rompin",
    "PRK01": "Tapah, Slim River, Tanjung Malim",
    "PLS01": "Seluruh Negeri Perlis",
    "PNG01": "Seluruh Negeri Pulau Pinang",
    "SBH01": "Kota Kinabalu, Penampang",
    "SWK01": "Kuching, Samarahan",
    "SGR01": "Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor",
    "TRG01": "Kuala Terengganu, Marang, Kuala Nerus"
  };

  for (const [code, name] of Object.entries(zones)) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = name;
    zoneSelect.appendChild(opt);
  }

  btnManual.addEventListener("click", () => {
    controls.classList.toggle("hidden");
  });

  zoneSelect.addEventListener("change", async () => {
    const zone = zoneSelect.value;
    if (!zone) return;

    status.textContent = "Mengambil data waktu solat...";
    spinner.classList.remove("hidden");
    result.classList.add("hidden");

    try {
      const apiUrl = `https://corsproxy.io/?https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=day&zone=${zone}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.prayerTime && data.prayerTime.length > 0) {
        displayWaktu(data, zone);
      } else {
        status.textContent = "❌ Tiada data waktu solat ditemui.";
      }
    } catch (err) {
      status.textContent = "⚠️ Ralat mengambil data waktu solat.";
      console.error(err);
    } finally {
      spinner.classList.add("hidden");
    }
  });

  function displayWaktu(data, zone) {
    status.textContent = "";
    result.classList.remove("hidden");
    zoneLabel.textContent = zones[zone] || zone;
    prayerList.innerHTML = "";

    const waktu = data.prayerTime[0];
    for (const [key, value] of Object.entries(waktu)) {
      if (key !== "date") {
        const li = document.createElement("li");
        li.textContent = `${key.toUpperCase()}: ${value}`;
        prayerList.appendChild(li);
      }
    }
  }
});
