// --- CONFIGURACIÓN ---
const SPEED = 6;
const JUMP_FORCE = -15;
const GRAVITY = 0.8;
const GROUND_Y = 250; // Bajamos un poco el suelo para tener espacio aéreo
const LEVEL_LENGTH = 3000;
const MAX_HEALTH = 3;

// --- ELEMENTOS HTML ---
const splashScreen = document.getElementById('splash-screen');
const mainContent = document.getElementById('main-content');
const startBtn = document.getElementById('start-btn');
const music = document.getElementById('bg-music');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- IMÁGENES ---
const imgYoCaminando = new Image();
imgYoCaminando.src = 'assets/Abdael_caminando.png';
const imgYoParado = new Image();
imgYoParado.src = 'assets/Abdael_parado.png';
const imgElla = new Image();
imgElla.src = 'assets/Beel_parada.png';
const imgEnemigo = new Image();
imgEnemigo.src = 'assets/Monoconpistola.png'; // Cuidado con la extensión .jpg

// --- ESTADO DEL JUEGO ---
let gameRunning = false;
let gameWon = false;
let frame = 0;
let health = MAX_HEALTH;
let invulnerable = false; // Para no morir al instante

// TECLAS
const keys = { w: false, a: false, d: false };

// CÁMARA
let cameraX = 0;

// JUGADOR
const CHAR_WIDTH = 100; // Un poco más pequeños para mejor parkour
const CHAR_HEIGHT = 70;

let player = {
    x: 50,
    y: GROUND_Y - CHAR_HEIGHT,
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT,
    dy: 0,
    grounded: false,
    facingRight: true
};

// META (Ahora está ALTA)
let goal = {
    x: LEVEL_LENGTH - 150,
    y: GROUND_Y - 300, // ¡Está en el aire!
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT
};

// --- DISEÑO DEL NIVEL (PLATAFORMAS) ---
// Aquí diseñamos el parkour. x, y, ancho, alto.
let platforms = [
    // Escalera inicial
    { x: 400, y: GROUND_Y - 60, w: 150, h: 20 },
    { x: 650, y: GROUND_Y - 140, w: 150, h: 20 },
    
    // Puente peligroso
    { x: 1000, y: GROUND_Y - 140, w: 300, h: 20 },
    
    // Parkour difícil
    { x: 1500, y: GROUND_Y - 60, w: 100, h: 20 },
    { x: 1700, y: GROUND_Y - 160, w: 100, h: 20 },
    { x: 1950, y: GROUND_Y - 220, w: 100, h: 20 },

    // La subida final hacia Beel
    { x: 2300, y: GROUND_Y - 100, w: 150, h: 20 },
    { x: 2550, y: GROUND_Y - 200, w: 150, h: 20 },
    { x: 2750, y: GROUND_Y - 300, w: 200, h: 20 } // Plataforma final donde está ella
];

// --- ENEMIGOS (MÓVILES) ---
// range: cuánto se mueven a los lados
let enemies = [
    { x: 500, y: GROUND_Y - 60, w: 60, h: 60, startX: 500, range: 100, speed: 2, dir: 1 },
    { x: 1100, y: GROUND_Y - 200, w: 60, h: 60, startX: 1100, range: 150, speed: 3, dir: 1 }, // Mono volador
    { x: 1800, y: GROUND_Y - 60, w: 60, h: 60, startX: 1800, range: 200, speed: 4, dir: 1 },
    { x: 2400, y: GROUND_Y - 60, w: 60, h: 60, startX: 2400, range: 100, speed: 2, dir: -1 }
];

// LISTENERS
window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.code === 'Space') keys.w = true;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.code === 'Space') keys.w = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = false;
});

// INICIAR
startBtn.addEventListener('click', () => {
    splashScreen.style.opacity = '0';
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        music.volume = 0.4;
        music.play().catch(e => console.log("Audio error:", e));
        startGame();
    }, 1000);
});

function startGame() {
    gameRunning = true;
    loop();
}

function loop() {
    if (!gameRunning) return;

    // --- 1. MOVIMIENTO JUGADOR ---
    let moving = false;
    if (keys.d) { player.x += SPEED; player.facingRight = true; moving = true; }
    if (keys.a) { player.x -= SPEED; player.facingRight = false; moving = true; }

    // Límites del mapa
    if (player.x < 0) player.x = 0;
    if (player.x > LEVEL_LENGTH) player.x = LEVEL_LENGTH;

    // --- 2. FÍSICA (GRAVEDAD Y SALTO) ---
    if (keys.w && player.grounded) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }

    player.dy += GRAVITY;
    player.y += player.dy;
