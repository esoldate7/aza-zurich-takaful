// Dashboard combined: Waktu Solat + Cuaca (sequential animation)
// - uses CORS proxy for prayer API (for GitHub Pages)
// - Open-Meteo for weather (no key)

const YEAR_EL = document.getElementById("year");
if (YEAR_EL) YEAR_EL.textContent = new Date().getFullYear();

const zoneSelect = document.getElementById("zoneSelect");
const statusText = document.getElementById("statusText");
const spinner = document.getElementById("spinner");
const content = document.getElementById("content");
const waktuArea = document.getElementById("waktuArea");
const cuacaArea = document.getElementById("cuacaArea");
const zoneLabel = document.getElementById("zoneLabel");
const prayerList = document.getElementById("prayerList");

const detectedPlace = document.getElementById("detectedPlace");
const weatherIconEl = document.getElementById("weatherIcon");
const weatherDescEl = document.getElementById("weatherDesc");
const tempInfoEl = document.getElementById("tempInfo");
const windInfoEl = document.getElementById("windInfo");
const locCoordsEl = document.getElementById("locCoords");

// zone map with lat/lon fallback (centers)
const ZONES = {
  "WLY01": { name: "Kuala Lumpur & Putrajaya", lat: 3.1390, lon: 101.6869 },
  "SGR01": { name: "Selangor", lat: 3.0738, lon: 101.5183 },
  "JHR01": { name: "Johor", lat: 1.4927, lon: 103.7414 },
  "KDH01": { name: "Kedah", lat: 6.1184, lon: 100.3685 },
  "KTN01": { name: "Kelantan", lat: 6.1254, lon: 102.238 },
  "MLK01": { name: "Melaka", lat: 2.1896, lon: 102.2501 },
  "NSN01": { name: "Negeri Sembilan", lat: 2.7258, lon: 101.9424 },
  "PHG01": { name: "Pahang", lat: 3.8126, lon: 103.3256 },
  "PRK01": { name: "Perak", lat: 4.5975, lon: 101.0901 },
  "PLS01": { name: "Perlis", lat: 6.4447, lon: 100.2048 },
  "PNG01": { name: "Pulau Pinang", lat: 5.4164, lon: 100.3327 },
  "SBH01": { name: "Sabah", lat: 5.9804, lon: 116.0735 },
  "SWK01": { name: "Sarawak", lat: 1.5533, lon: 110.3592 },
  "TRG01": { name: "Terengganu", lat: 5.3290, lon: 103.1370 },
  "LBN01": { name: "Labuan", lat: 5.2831, lon: 115.2308 }
};

// populate dropdown
Object.entries(ZONES).forEach(([code, obj]) => {
  const o = document.createElement("option");
  o.value = code;
  o.textContent = obj.name;
  zoneSelect.appendChild(o);
});

// listen user selection
zoneSelect.addEventListener("change", async () => {
  const zone = zoneSelect.value;
  if (!zone) return;
  // show spinner + hide content
  showLoading("Mengambil data…");
  const z = ZONES[zone];
  try {
    // fetch both in parallel (but animate sequentially on render)
    const [prayerData, weatherData] = await Promise.all([
      fetchPrayer(zone),
      fetchWeather(z.lat, z.lon)
    ]);
    renderCombined(prayerData, weatherData, z.name);
  } catch (e) {
    console.error(e);
    showError("Ralat mengambil data. Sila cuba semula.");
  }
});

// try auto-detect geolocation first
(async function tryAuto() {
  showLoading("Mencari lokasi anda…");
  if (!navigator.geolocation) {
    showStatus("Geolocation tidak disokong — pilih negeri secara manual.");
    document.getElementById("zoneSelect").classList.remove("hidden");
    hideSpinner();
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    detectedPlace.textContent = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
    try {
      // reverse geocode -> best effort to map to our ZONES by checking nearby zone via simple distance
      const picked = pickNearestZone(latitude, longitude);
      zoneSelect.value = picked;
      // fetch both
      const [prayerData, weatherData] = await Promise.all([
        fetchPrayer(picked),
        fetchWeather(latitude, longitude)
      ]);
      renderCombined(prayerData, weatherData, ZONES[picked].name);
    } catch (e) {
      console.warn("Auto detect error:", e);
      showStatus("Tidak dapat kenal pasti zon — pilih negeri manual.");
      hideSpinner();
    }
  }, (err) => {
    console.warn("Geolocation denied:", err);
    showStatus("Lokasi tidak dibenarkan — pilih negeri manual.");
    hideSpinner();
  }, { timeout: 10000, maximumAge: 60000 });
})();

// helpers
function showLoading(txt="Mengambil data…"){
  statusText.textContent = txt;
  spinner.classList.remove("hidden");
  content.classList.add("hidden");
}
function hideSpinner(){ spinner.classList.add("hidden"); }
function showStatus(txt){ statusText.textContent = txt; }
function showError(txt){
  statusText.textContent = txt;
  spinner.classList.add("hidden");
  content.classList.add("hidden");
}

// pick nearest zone by Euclidean on lat/lon (approx)
function pickNearestZone(lat, lon){
  let best = null; let bestD = 1e12;
  for (const [code, o] of Object.entries(ZONES)){
    const d = (o.lat - lat)*(o.lat - lat) + (o.lon - lon)*(o.lon - lon);
    if (d < bestD){ bestD = d; best = code; }
  }
  return best || "WLY01";
}

// --- FETCH PRAYER (robust) ---
async function fetchPrayer(zone) {
  // use corsproxy for GitHub Pages; for production replace with your own proxy or serverless function
  const base = `https://api.waktusolat.app/v2/solat/${zone}`;
  const proxyUrl = `https://corsproxy.io/?${base}`;
  const res = await fetch(proxyUrl, { cache: "no-cache" });
  if (!res.ok) throw new Error("Prayer API network error");
  const data = await res.json();

  // normalise common shapes
  // 1) { prayerTime: [ { date, time: { Subuh, Zohor... } }, ... ], zoneName: '...' }
  if (data.prayerTime && Array.isArray(data.prayerTime)) {
    return { type: "waktusolat_v2", data };
  }
  // 2) { prayers: [ { date, subuh: "05:xx", zohor... } , ... ], zone: '...' }
  if (data.prayers && Array.isArray(data.prayers)) {
    return { type: "prayers_array", data };
  }
  // 3) legacy e-solat style (data.prayerTime maybe inside nested)
  if (data.data && Array.isArray(data.data)) {
    return { type: "generic_data_array", data };
  }
  // fallback: return raw
  return { type: "raw", data };
}

// --- FETCH WEATHER ---
async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather network error");
  return await res.json();
}

// --- RENDER combined sequentially ---
function renderCombined(prayerWrapped, weather, placeName){
  // prayerWrapped contains type & data
  // extract today's times
  let timesObj = null;
  let zoneLabelText = placeName || "";

  if (prayerWrapped.type === "waktusolat_v2"){
    const arr = prayerWrapped.data.prayerTime;
    if (arr && arr.length) {
      const today = arr[0];
      // possible shapes: today.time or today.times
      timesObj = today.time || today.times || today;
      zoneLabelText = prayerWrapped.data.zoneName || zoneLabelText;
    }
  } else if (prayerWrapped.type === "prayers_array"){
    const arr = prayerWrapped.data.prayers;
    if (arr && arr.length){ timesObj = arr[0]; zoneLabelText = prayerWrapped.data.zone || zoneLabelText; }
  } else if (prayerWrapped.type === "generic_data_array"){
    const arr = prayerWrapped.data.data;
    if (arr && arr.length){
      const t = arr[0];
      timesObj = t.time || t.times || t;
      zoneLabelText = prayerWrapped.data.zoneName || zoneLabelText;
    }
  } else {
    // try to find any object with time keys
    const raw = prayerWrapped.data;
    if (raw && raw.prayerTime && Array.isArray(raw.prayerTime)) { timesObj = raw.prayerTime[0].time || raw.prayerTime[0]; }
    else timesObj = raw;
  }

  if (!timesObj) {
    showError("❌ Tiada data waktu solat untuk zon ini.");
    return;
  }

  // prepare prayer list: normalize keys to common labels
  const labelMap = {
    Subuh: "Subuh", subuh: "Subuh", fajr: "Subuh",
    Zohor: "Zohor", zohor: "Zohor", dhuhr: "Zohor",
    Asar: "Asar", asar: "Asar", asr: "Asar",
    Maghrib: "Maghrib", maghrib: "Maghrib", maghrib_time: "Maghrib",
    Isyak: "Isyak", isyak: "Isyak", isha: "Isyak"
  };

  // Build ordered display keys
  const order = ["Subuh","Zohor","Asar","Maghrib","Isyak"];
  const items = [];
  // timesObj may have keys in various cases
  for (const k of Object.keys(timesObj)){
    const label = labelMap[k] || (k[0].toUpperCase()+k.slice(1));
    items.push({ key:k, label, value: timesObj[k] });
  }
  // try to create ordered list by order mapping
  const ordered = [];
  order.forEach(lbl => {
    const found = items.find(it => it.label === lbl);
    if (found) ordered.push(found);
  });
  // if not found some, append remaining
  items.forEach(it => {
    if (!ordered.includes(it)) ordered.push(it);
  });

  // Render: waktu area first (with animation), then cuaca
  zoneLabel.textContent = zoneLabelText;
  prayerList.innerHTML = "";
  ordered.forEach((it, idx) => {
    const li = document.createElement("li");
    li.textContent = `${it.label}: ${it.value}`;
    // add animation classes with delays
    li.classList.add("fadeUp");
    li.classList.add(`delay-${Math.min(2, Math.floor(idx/2))}`); // group delays
    prayerList.appendChild(li);
  });

  // render weather
  const cw = weather.current_weather;
  let icon = "🌤️";
  let desc = "Cuaca";
  if (cw){
    const code = cw.weathercode; // open-meteo code
    icon = weatherIconFromCode(code);
    desc = weatherDescFromCode(code);
  }

  // update weather UI
  weatherIconEl.textContent = icon;
  weatherDescEl.textContent = desc;
  tempInfoEl.textContent = cw ? `${cw.temperature}°C` : "—";
  windInfoEl.textContent = cw ? `Angin ${cw.windspeed} km/h` : "—";
  locCoordsEl.textContent = (weather.latitude && weather.longitude) ? `Lat ${weather.latitude.toFixed(3)}, Lon ${weather.longitude.toFixed(3)}` : "";

  // show with sequence
  hideSpinner();
  content.classList.remove("hidden");

  // show waktu area then cuaca area with delays
  waktuArea.classList.remove("hidden");
  waktuArea.classList.add("fadeUp");
  waktuArea.classList.add("delay-1");

  // show cuaca after short delay
  setTimeout(() => {
    cuacaArea.classList.remove("hidden");
    cuacaArea.classList.add("fadeUp");
    cuacaArea.classList.add("delay-2");
  }, 520);
}

// helpers: weather icon/desc
function weatherIconFromCode(code){
  // basic mapping for open-meteo codes
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if ([45,48].includes(code)) return "🌫️";
  if ([51,53,55,56,57].includes(code)) return "🌦️";
  if ([61,63,65].includes(code)) return "🌧️";
  if ([71,73,75].includes(code)) return "❄️";
  if ([95,96,99].includes(code)) return "⛈️";
  return "🌡️";
}
function weatherDescFromCode(code){
  const map = {
    0:"Cerah",1:"Sedikit Berawan",2:"Separa Mendung",3:"Mendung",
    45:"Berkabus",48:"Kabus",51:"Hujan Renyai",61:"Hujan",63:"Hujan Sederhana",
    71:"Salji",95:"Ribut Petir"
  };
  return map[code] || "Cuaca";
}
