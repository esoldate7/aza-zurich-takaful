// script.js — standalone interactive Waktu Solat (modern gradient UI)
const zonMapping = [
  { name: "Kuala Lumpur", code: "WLY01" },
  { name: "Putrajaya", code: "WLY02" },
  { name: "Selangor", code: "SGR01" },
  { name: "Johor", code: "JHR01" },
  { name: "Kedah", code: "KDH01" },
  { name: "Kelantan", code: "KTN01" },
  { name: "Melaka", code: "MLK01" },
  { name: "Negeri Sembilan", code: "NGS01" },
  { name: "Pahang", code: "PHG01" },
  { name: "Pulau Pinang", code: "PNG01" },
  { name: "Perak", code: "PRK01" },
  { name: "Perlis", code: "PLS01" },
  { name: "Sabah", code: "SBH01" },
  { name: "Sarawak", code: "SWK01" },
  { name: "Terengganu", code: "TRG01" }
];

const apiBase = "https://api.waktusolat.app/v2/solat/"; // main public API

// DOM
const btnManual = document.getElementById('btnManual');
const controls = document.getElementById('controls');
const zoneSelect = document.getElementById('zoneSelect');
const statusEl = document.getElementById('status');
const spinner = document.getElementById('spinner');
const result = document.getElementById('result');
const zoneLabel = document.getElementById('zoneLabel');
const prayerList = document.getElementById('prayerList');
document.getElementById('year').textContent = new Date().getFullYear();

// populate select
zonMapping.forEach(z=>{
  const o = document.createElement('option');
  o.value = z.code; o.textContent = z.name; zoneSelect.appendChild(o);
});

btnManual.addEventListener('click', () => {
  controls.classList.toggle('hidden');
});

// ui helpers
function showSpinner(v){ spinner.classList.toggle('hidden', !v); }
function setStatus(s){ statusEl.textContent = s || ''; }
function showResult(v){ result.classList.toggle('hidden', !v); }

// render prayers
function renderPrayers(p){
  prayerList.innerHTML = '';
  const keys = [
    ['Subuh','Subuh','fajr'],
    ['Zohor','Zohor','dhuhr'],
    ['Asar','Asar','asr'],
    ['Maghrib','Maghrib','maghrib'],
    ['Isyak','Isyak','isha']
  ];
  keys.forEach(k=>{
    const label = k[0];
    const v = p[k[1]] ?? p[k[2]] ?? p[label] ?? '—';
    const li = document.createElement('li');
    li.textContent = `${label}: ${v}`;
    prayerList.appendChild(li);
  });
}

// fetch with fallback
async function fetchWaktuByZone(zone){
  if(!zone) return;
  setStatus('Memuatkan waktu solat…');
  showResult(false);
  showSpinner(true);
  zoneLabel.textContent = zone;
  try {
    const r = await fetch(apiBase + zone);
    const j = await r.json();
    const data = j?.prayerTime || j?.data?.prayerTime || j;
    if(!data) throw new Error('no data');
    renderPrayers(data);
    setStatus('');
  } catch(err){
    // try same endpoint again (backup attempt)
    try{
      const r2 = await fetch(apiBase + zone);
      const j2 = await r2.json();
      const data2 = j2?.prayerTime || j2?.data?.prayerTime || j2;
      if(!data2) throw new Error('no data2');
      renderPrayers(data2);
      setStatus('🔄 Data dari sumber backup');
    } catch(e){
      setStatus('❌ Gagal dapat waktu solat');
      prayerList.innerHTML = '';
    }
  } finally {
    showSpinner(false);
    showResult(true);
  }
}

// reverse geocode -> zone
async function detectZoneByCoords(lat, lon){
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    const j = await res.json();
    const negeri = j.principalSubdivision || j.locality || '';
    const matched = zonMapping.find(z => negeri && negeri.toLowerCase().includes(z.name.toLowerCase()));
    return matched ? matched.code : null;
  } catch(e){
    return null;
  }
}

// try geolocation
function tryAutoLocation(){
  setStatus('Mencuba kesan lokasi…');
  if(!navigator.geolocation){
    setStatus('Browser tidak menyokong lokasi. Sila pilih negeri manual.');
    controls.classList.remove('hidden');
    return;
  }
  navigator.geolocation.getCurrentPosition(async pos=>{
    const { latitude, longitude } = pos.coords;
    setStatus(`Lokasi dikesan: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    const zone = await detectZoneByCoords(latitude, longitude);
    if(zone){
      setStatus(`Zon dikesan: ${zone}`);
      fetchWaktuByZone(zone);
    } else {
      setStatus('Tidak dapat tentukan negeri dari lokasi — sila pilih negeri manual.');
      controls.classList.remove('hidden');
    }
  }, err=>{
    setStatus('Lokasi tidak dibenarkan / gagal. Sila pilih negeri manual.');
    controls.classList.remove('hidden');
  }, {timeout:10000, maximumAge:60000});
}

// dropdown change
zoneSelect.addEventListener('change', e=> {
  const z = e.target.value;
  if(z) fetchWaktuByZone(z);
});

// init
tryAutoLocation();
