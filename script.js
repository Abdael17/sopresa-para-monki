// ==========================================
// CÓDIGO FINAL - VERSIÓN CASTILLO Y AJUSTES
// ==========================================

// --- CONFIGURACIÓN ---
const SPEED = 5;
const JUMP_FORCE = -16;
const GRAVITY = 0.8;
const GROUND_Y = 400;
const LEVEL_LENGTH = 1200; 
const MAX_HEALTH = 3;

// --- ELEMENTOS HTML ---
const splashScreen = document.getElementById('splash-screen');
const mainContent = document.getElementById('main-content');
const startBtn = document.getElementById('start-btn');
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
imgEnemigo.src = 'assets/Monoconpistola.png';

// --- ESTADO DEL JUEGO ---
let gamerRunning = false;
let isGameOver = false;
let isDancing = false;
let frame = 0;
let health = MAX_HEALTH;
let invulnerable = false;

// TECLAS
const keys = { w: false, a: false, d: false };

// CÁMARA
let cameraX = 0;
let cameraY = 0;

// JUGADOR
const BASE_WIDTH = 100;
const BASE_HEIGHT = 70;

let player = {
    x: 50,
    y: GROUND_Y - BASE_HEIGHT,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    dy: 0,
    grounded: false,
    facingRight: true
};

// META FINAL (Nivel 5)
let goal = {
    x: 1000,
    y: GROUND_Y - BASE_HEIGHT,
    width: BASE_WIDTH,
    height: BASE_HEIGHT
};

// --- AMBIENTACIÓN ---
let stars = [];
for (let i = 0; i < 300; i++) {
    stars.push({
        x: Math.random() * (LEVEL_LENGTH + 800),
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        alpha: Math.random()
    });
}
let shootingStar = { x: 0, y: 0, active: false, speedX: 0, speedY: 0 };

// ==========================================
// SISTEMA DE 5 NIVELES (AJUSTADO)
// ==========================================
let currentLevel = 0;

const levels = [
    // --- NIVEL 1: El Bosque ---
    {
        platforms: [
            { x: 0, y: 400, w: 1200, h: 40 },
            { x: 300, y: 300, w: 200, h: 20 },
            { x: 600, y: 220, w: 200, h: 20 },
            { x: 900, y: 150, w: 150, h: 20 }
        ],
        enemies: [
            // startX: 500, range: 80 (Se mueve de 420 a 580)
            { x: 500, y: 340, w: 60, h: 60, speed: 2, startX: 500, range: 80, dir: 1 }
        ],
        hearts: [
            { x: 650, y: 170, w: 30, h: 30, collected: false }
        ]
    },
    // --- NIVEL 2: La Escalada (Enemigos Centrados) ---
    {
        platforms: [
            { x: 0, y: 400, w: 200, h: 40 },
            { x: 250, y: 320, w: 250, h: 20 }, // Plat: 250 a 500
            { x: 550, y: 240, w: 250, h: 20 }, // Plat: 550 a 800
            { x: 850, y: 160, w: 200, h: 20 },
            { x: 1100, y: 400, w: 100, h: 40 }
        ],
        enemies: [
            // Rango ajustado para no caerse (Plataforma ancho 250 -> Rango 80 es seguro)
            { x: 375, y: 260, w: 60, h: 60, speed: 2, startX: 375, range: 80, dir: 1 }, 
            { x: 675, y: 180, w: 60, h: 60, speed: 2, startX: 675, range: 80, dir: 1 }
        ],
        hearts: [
            { x: 900, y: 110, w: 30, h: 30, collected: false }
        ]
    },
    // --- NIVEL 3: Islas Flotantes (Spawn Arreglado) ---
    {
        platforms: [
            { x: 0, y: 400, w: 150, h: 40 },
            { x: 200, y: 400, w: 200, h: 20 }, 
            { x: 500, y: 300, w: 200, h: 20 }, 
            { x: 800, y: 200, w: 200, h: 20 }, 
            { x: 1100, y: 400, w: 100, h: 40 }
        ],
        enemies: [
            // ¡MOVIDO! Ahora está en x:700 (lejos del spawn x:20)
            { x: 700, y: 340, w: 60, h: 60, speed: 3, startX: 600, range: 100, dir: 1 }, 
            { x: 900, y: 140, w: 60, h: 60, speed: 2, startX: 900, range: 60, dir: 1 }
        ],
        hearts: [
            { x: 550, y: 250, w: 30, h: 30, collected: false }
        ]
    },
    // --- NIVEL 4: El Puente Rápido ---
    {
        platforms: [
            { x: 0, y: 400, w: 100, h: 40 },
            { x: 150, y: 350, w: 400, h: 20 },
            { x: 600, y: 250, w: 400, h: 20 },
            { x: 1050, y: 400, w: 150, h: 40 }
        ],
        enemies: [
            // Rango 150 en plataforma de 400 (Seguro)
            { x: 350, y: 290, w: 60, h: 60, speed: 4, startX: 350, range: 150, dir: 1 }, 
            { x: 800, y: 190, w: 60, h: 60, speed: 4, startX: 800, range: 150, dir: 1 }
        ],
        hearts: [
            { x: 500, y: 200, w: 30, h: 30, collected: false },
            { x: 800, y: 100, w: 30, h: 30, collected: false }
        ]
    },
    // --- NIVEL 5: El Castillo Final (Con Enemigos) ---
    {
        platforms: [
            { x: 0, y: 400, w: 200, h: 40 },
            { x: 250, y: 300, w: 100, h: 20 },
            { x: 400, y: 200, w: 100, h: 20 },
            { x: 550, y: 300, w: 100, h: 20 },
            { x: 700, y: 400, w: 500, h: 40 } // Suelo del castillo
        ],
        enemies: [
            // Guardias del castillo
            { x: 800, y: 340, w: 60, h: 60, speed: 2, startX: 800, range: 50, dir: 1 },
            { x: 950, y: 340, w: 60, h: 60, speed: 2, startX: 950, range: 30, dir: 1 }
        ],
        hearts: []
    }
];

// Cargar datos iniciales
let platforms = levels[currentLevel].platforms;
let enemies = levels[currentLevel].enemies;
let levelHearts = levels[currentLevel].hearts;

// --- CONTROLES ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.code === 'Space') keys.w = true;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = true;
    if ((e.key === 'r' || e.key === 'R') && isGameOver) restartGame();
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.code === 'Space') keys.w = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = false;
});

// --- INICIO ---
startBtn.addEventListener('click', () => {
    splashScreen.style.opacity = '0';
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        if(audioPlayer) audioPlayer.play().catch(e => console.log(e));
        if(playBtn) playBtn.innerText = "⏸️";
        startGame();
    }, 1000);
});

function startGame() {
    gamerRunning = true;
    isGameOver = false;
    loop();
}

// ==========================================
// BUCLE PRINCIPAL (LOOP)
// ==========================================
function loop() {
    if (isGameOver) {
        drawGameOverScreen();
        requestAnimationFrame(loop);
        return;
    }

    if (!gamerRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Texto de Nivel
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Nivel: " + (currentLevel + 1) + "/5", 20, 80);

    // MODO BAILE (VICTORIA)
    if (isDancing) {
        performDanceRoutine();
        frame++;
        requestAnimationFrame(loop);
        return;
    }

    // --- LÓGICA ---

    // Movimiento
    let moving = false;
    if (keys.d) { player.x += SPEED; player.facingRight = true; moving = true; }
    if (keys.a) { player.x -= SPEED; player.facingRight = false; moving = true; }

    if (player.x < 0) player.x = 0; 

    // Física
    if (keys.w && player.grounded) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }
    player.dy += GRAVITY;
    player.y += player.dy;

    // Colisiones
    player.grounded = false;
    
    // Caída al vacío (Muerte)
    if (player.y + player.height >= GROUND_Y + 150) {
        player.y = 0; 
        player.dy = 0;
        takeDamage(); 
    }

    if (player.dy > 0) {
        for (let p of platforms) {
            if (
                player.x
