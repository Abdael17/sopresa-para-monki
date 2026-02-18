// --- CONFIGURACIÓN ---
const SPEED = 7;           
const JUMP_FORCE = -16;    
const GRAVITY = 0.8;
const GROUND_Y = 200;      
const LEVEL_LENGTH = 4000; 

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
imgYoParado.src = 'assets/Abdael_parado.png'; // ¡NUEVO!

const imgElla = new Image();
imgElla.src = 'assets/Beel_parada.png';     

const imgObstaculo = new Image();
imgObstaculo.src = 'assets/Monoconpistola.png'; 

// --- ESTADO DEL JUEGO ---
let gameRunning = false;
let gameWon = false;
let frame = 0;

// TECLAS (WASD)
const keys = {
    w: false,
    a: false,
    d: false
};

// CÁMARA
let cameraX = 0;

// JUGADOR
const CHAR_WIDTH = 120;
const CHAR_HEIGHT = 80;

let player = {
    x: 50,
    y: GROUND_Y - CHAR_HEIGHT,
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT,
    dy: 0,
    grounded: false,
    facingRight: true 
};

// META 
let goal = {
    x: LEVEL_LENGTH - 200,
    y: GROUND_Y - CHAR_HEIGHT,
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT
};

// OBSTÁCULOS
let obstacles = [
    { x: 600, y: GROUND_Y - 60, width: 60, height: 60 },
    { x: 1200, y: GROUND_Y - 60, width: 60, height: 60 },
    { x: 1800, y: GROUND_Y - 60, width: 60, height: 60 },
    { x: 2500, y: GROUND_Y - 60, width: 60, height: 60 },
    { x: 3200, y: GROUND_Y - 60, width: 60, height: 60 }
];

// --- LISTENERS ---
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

    // 1. MOVIMIENTO
    let moving = false; // Variable para saber si nos movemos
    if (keys.d) {
        player.x += SPEED;
        player.facingRight = true;
        moving = true;
    }
    if (keys.a) {
        player.x -= SPEED;
        player.facingRight = false;
        moving = true;
    }

    if (player.x < 0) player.x = 0;
    if (player.x > LEVEL_LENGTH) player.x = LEVEL_LENGTH;

    // 2. FÍSICA
    if (keys.w && player.grounded) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }

    player.dy += GRAVITY;
    player.y += player.dy;

    let sueloJugador = GROUND_Y - player.height;
    if (player.y > sueloJugador) {
        player.y = sueloJugador;
        player.dy = 0;
        player.grounded = true;
    }

    // 3. CÁMARA
    cameraX = player.x - 200; 
    if (cameraX < 0) cameraX = 0;

    // --- DIBUJAR ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-cameraX, 0);

    // SUELO
    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH + 800, canvas.height - GROUND_Y);

    // OBSTÁCULOS
    for (let obs of obstacles) {
        if (imgObstaculo.complete) {
             ctx.drawImage(imgObstaculo, obs.x, obs.y, obs.width, obs.height);
        } else {
             ctx.fillStyle = "red";
             ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }

        if (
            player.x + 40 < obs.x + obs.width &&
            player.x + player.width - 40 > obs.x &&
            player.y + 20 < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            player.x -= 20; 
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(cameraX, 0, canvas.width, canvas.height); 
        }
    }

    // META
    ctx.drawImage(imgElla, goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = "#d32f2f";
    ctx.font = "20px 'VT323'";
    ctx.fillText("¡Amor!", goal.x + 20, goal.y - 10);

    // --- DIBUJAR JUGADOR (Lógica de animación) ---
    let spriteY = player.y;
    
    // Elegimos qué imagen usar
    let imagenAUsar;
    if (moving) {
        imagenAUsar = imgYoCaminando;
        // Efecto rebote solo si camina
        if (player.grounded && Math.floor(frame / 5) % 2 === 0) {
            spriteY -= 3;
        }
    } else {
        imagenAUsar = imgYoParado; // Si no se mueve, usa la foto quieto
    }
    
    // Dibujamos con espejo si mira a la izquierda
    if (!player.facingRight) {
        ctx.save();
        ctx.translate(player.x + player.width, spriteY);
        ctx.scale(-1, 1); 
        ctx.drawImage(imagenAUsar, 0, 0, player.width, player.height);
        ctx.restore();
    } else {
        ctx.drawImage(imagenAUsar, player.x, spriteY, player.width, player.height);
    }

    ctx.restore();

    // INTERFAZ
    let progress = Math.min(player.x / (goal.x), 1);
    ctx.fillStyle = "#5a2d3c";
    ctx.fillText("Distancia a tu corazón...", 50, 30);
    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(50, 40, 200, 15);
    ctx.fillStyle = "#d32f2f";
    ctx.fillRect(50, 40, progress * 200, 15);

    // VICTORIA
    if (player.x >= goal.x - 50) {
        gameWon = true;
        displayWinMessage();
    } else {
        frame++;
        requestAnimationFrame(loop);
    }
}

function displayWinMessage() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d32f2f";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("¡Te encontré!", canvas.width/2, canvas.height/2 - 20);
    ctx.font = "30px 'VT323'";
    ctx.fillText("(Baja para leer tu carta)", canvas.width/2, canvas.height/2 + 40);
}

