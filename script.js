// Fungsi tukar section
function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// --- Fruit Slice Game ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const resetButton = document.getElementById("resetGame");

let fruits = [];
let score = 0;
let sliceSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_896b8b71f1.mp3?filename=slice-1.mp3");

// Fungsi hasilkan buah rawak
function randomFruit() {
  const radius = 20 + Math.random() * 15;
  return {
    x: Math.random() * (canvas.width - radius * 2) + radius,
    y: canvas.height + radius,
    radius,
    speedY: 2 + Math.random() * 3,
    color: `hsl(${Math.random() * 360}, 80%, 60%)`
  };
}

// Tambah buah baru
function spawnFruit() {
  fruits.push(randomFruit());
}

// Update & lukis game
function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fruits.forEach(fruit => {
    fruit.y -= fruit.speedY;
    ctx.beginPath();
    ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
    ctx.fillStyle = fruit.color;
    ctx.fill();
  });
  fruits = fruits.filter(f => f.y + f.radius > 0);
  requestAnimationFrame(updateGame);
}

// Bila klik potong buah
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  fruits.forEach((fruit, i) => {
    const dx = x - fruit.x;
    const dy = y - fruit.y;
    if (Math.sqrt(dx * dx + dy * dy) < fruit.radius) {
      fruits.splice(i, 1);
      sliceSound.currentTime = 0;
      sliceSound.play();
      score++;
      scoreDisplay.textContent = score;
    }
  });
});

// Butang reset game
resetButton.addEventListener("click", () => {
  fruits = [];
  score = 0;
  scoreDisplay.textContent = score;
});

// Mula game
setInterval(spawnFruit, 1000);
updateGame();
showSection('waktuSolat');
