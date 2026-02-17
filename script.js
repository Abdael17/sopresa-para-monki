// --- CONFIGURACIÓN ---
const MOVEMENT_SPEED = 5;
const JUMP_FORCE = -14;
const GRAVITY = 0.6;
const GAME_DURATION = 1500;
const GROUND_Y = 200; // La línea invisible donde pisan

// --- ELEMENTOS DEL DOM ---
const splashScreen = document.getElementById('splash-screen');
const mainContent = document.getElementById('main-content');
const startBtn = document.getElementById('start-btn');
const music = document.getElementById('bg-music');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- IMÁGENES ---
const imgYo = new Image();
// IMPORTANTE: Mantén los nombres que SÍ te funcionaron
imgYo.src = 'assets/Abdael_caminando.png'; 

const imgElla = new Image();
imgElla.src = 'assets/Beel_parada.png';

// --- ESTADO DEL JUEGO ---
let gameRunning = false;
let gameWon = false;
let frame = 0;
let distance = 0;

// --- TAMAÑO (Proporción 1.5 : 1) ---
const CHAR_HEIGHT = 80;        
const CHAR_WIDTH = 120; 

// JUGADOR (Abdael)
let player = {
    x: 50,
    y: GROUND_Y - CHAR_HEIGHT, // Pies justo en la línea
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT,
    dy: 0,
    grounded: false
};

// META (Beel)
let goal = {
    x: canvas.width + 100,
    y: GROUND_Y - CHAR_HEIGHT,
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT
};

// OBSTÁCULOS
let obstacles = [];

// 1. INICIAR
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

// CONTROLES
function jump() {
    if (player.grounded && gameRunning && !gameWon) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }
}
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') jump();
});
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
canvas.addEventListener('click', jump);

// 2. BUCLE PRINCIPAL
function startGame() {
    gameRunning = true;
    loop();
}

function loop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- DIBUJAR SUELO (La parte que faltaba) ---
    ctx.fillStyle = "#6d4c41"; // Marrón estilo tierra
    // Dibuja un rectángulo desde la línea del suelo hacia abajo
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);


    // --- FÍSICA ---
    player.dy += GRAVITY;
    player.y += player.dy;

    // Colisión con el suelo
    let sueloJugador = GROUND_Y - player.height;
    if (player.y > sueloJugador) {
        player.y = sueloJugador;
        player.dy = 0;
        player.grounded = true;
    }

    if (!gameWon) distance++;

    // --- OBSTÁCULOS ---
    // Generamos un bloque cuadrado
    if (frame % 150 === 0 && distance < GAME_DURATION && !gameWon) {
        obstacles.push({ x: canvas.width, y: GROUND_Y - 40, width: 40, height: 40 });
    }

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= MOVEMENT_SPEED;

        // --- DIBUJAR OBSTÁCULO (BLOQUE) ---
        ctx.fillStyle = "#d32f2f"; // Rojo intenso
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Borde blanco para que resalte
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);


        // Colisión (Hitbox ajustada para el bloque)
        if (
            player.x + 30 < obs.x + obs.width && 
            player.x + player.width - 30 > obs.x && 
            player.y + 10 < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            // Efecto de choque (pantalla roja momentánea)
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.fillRect(0,0,canvas.width, canvas.height);
        }
    }

    // --- DIBUJAR JUGADOR ---
    let spriteY = player.y;
    if (player.grounded && frame % 10 < 5) {
        spriteY -= 2; // Rebote al caminar
    }
    ctx.drawImage(imgYo, player.x, spriteY, player.width, player.height);

    // --- VICTORIA ---
    if (distance >= GAME_DURATION) {
        if (goal.x > player.x + player.width - 40) { 
            goal.x -= 2;
        } else {
            gameWon = true;
            displayWinMessage();
        }
        ctx.drawImage(imgElla, goal.x, goal.y, goal.width, goal.height);
    } else {
        // Barra de progreso
        ctx.fillStyle = "#6d4c41"; // Fondo barra
        ctx.fillRect(50, 20, 200, 15);
        ctx.fillStyle = "#d32f2f"; // Relleno barra
        ctx.fillRect(50, 20, (distance / GAME_DURATION) * 200, 15);
    }

    frame++;
    requestAnimationFrame(loop);
}

function displayWinMessage() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(40, 40, 720, 220);
    
    ctx.fillStyle = "#d32f2f";
    ctx.font = "60px 'VT323'";
    ctx.textAlign = "center";
    ctx.fillText("¡Te encontré!", canvas.width/2, canvas.height/2 - 10);
    ctx.font = "30px 'VT323'";
    ctx.fillText("(Baja para leer tu carta)", canvas.width/2, canvas.height/2 + 50);
    
    gameRunning = false;
}
