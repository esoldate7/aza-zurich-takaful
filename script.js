document.getElementById("year").textContent = new Date().getFullYear();

const btnManual = document.getElementById("btnManual");
const zoneSelect = document.getElementById("zoneSelect");
const statusDiv = document.getElementById("status");
const spinner = document.getElementById("spinner");
const resultDiv = document.getElementById("result");
const prayerList = document.getElementById("prayerList");
const zoneLabel = document.getElementById("zoneLabel");

const cuacaStatus = document.getElementById("cuacaStatus");
const cuacaResult = document.getElementById("cuacaResult");
const lokasiCuaca = document.getElementById("lokasiCuaca");
const suhuCuaca = document.getElementById("suhuCuaca");
const keadaanCuaca = document.getElementById("keadaanCuaca");

const zones = {
  "WLY01": "Kuala Lumpur & Putrajaya",
  "SEL01": "Selangor",
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

for (const [code, name] of Object.entries(zones)) {
  const opt = document.createElement("option");
  opt.value = code;
  opt.textContent = name;
  zoneSelect.appendChild(opt);
}

btnManual.addEventListener("click", () => {
  document.getElementById("controls").classList.toggle("hidden");
});

zoneSelect.addEventListener("change", () => {
  if (zoneSelect.value) {
    getWaktuSolat(zoneSelect.value);
  }
});

async function getWaktuSolat(zone) {
  spinner.classList.remove("hidden");
  statusDiv.textContent = "Mengambil data waktu solat...";
  try {
    const response = await fetch(`https://corsproxy.io/?https://api.waktusolat.app/v2/solat/${zone}`);
    const data = await response.json();
    spinner.classList.add("hidden");
    if (data.prayers && data.zone) {
      displayWaktu(data);
    } else {
      throw new Error("Data tidak sah");
    }
  } catch (err) {
    spinner.classList.add("hidden");
    statusDiv.textContent = "Ralat mengambil data waktu solat.";
  }
}

function displayWaktu(data) {
  resultDiv.classList.remove("hidden");
  zoneLabel.textContent = data.zone;
  prayerList.innerHTML = "";
  Object.entries(data.prayers).forEach(([name, time]) => {
    const li = document.createElement("li");
    li.textContent = `${name}: ${time}`;
    prayerList.appendChild(li);
  });
  statusDiv.textContent = "";
}

// Auto detect lokasi
navigator.geolocation.getCurrentPosition(async (pos) => {
  const { latitude, longitude } = pos.coords;
  getCuaca(latitude, longitude);
}, () => {
  cuacaStatus.textContent = "Tidak dapat kesan lokasi, sila pilih negeri.";
});

// Cuaca
async function getCuaca(lat, lon) {
  cuacaStatus.textContent = "Mengambil data cuaca...";
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    const data = await response.json();

    const weather = data.current_weather;
    lokasiCuaca.textContent = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
    suhuCuaca.textContent = `Suhu: ${weather.temperature}°C`;
    keadaanCuaca.textContent = `Angin: ${weather.windspeed} km/j`;
    cuacaStatus.textContent = "";
    cuacaResult.classList.remove("hidden");
  } catch {
    cuacaStatus.textContent = "Gagal mengambil data cuaca.";
  }
}
