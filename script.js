// --- CONFIGURACIÓN ---
const MOVEMENT_SPEED = 5;
const JUMP_FORCE = -12;
const GRAVITY = 0.6;
const GAME_DURATION = 1500; // Cuánto "camino" recorre antes de llegar a ella (aprox 20-30 seg)

// --- ELEMENTOS DEL DOM ---
const splashScreen = document.getElementById('splash-screen');
const mainContent = document.getElementById('main-content');
const startBtn = document.getElementById('start-btn');
const music = document.getElementById('bg-music');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- IMÁGENES ---
// ¡IMPORTANTE! Asegúrate de que los nombres en tu carpeta assets sean IGUALES a estos:
const imgYo = new Image();
imgYo.src = 'assets/yo_caminando.png'; 
const imgElla = new Image();
imgElla.src = 'assets/ella_parado.png';

// --- ESTADO DEL JUEGO ---
let gameRunning = false;
let gameWon = false;
let frame = 0;
let distance = 0; // Distancia recorrida

// JUGADOR (TÚ)
let player = {
    x: 50,
    y: 200, // Altura del suelo
    width: 50, // Ajusta según tus sprites
    height: 50,
    dy: 0, // Velocidad vertical
    grounded: false
};

// META (ELLA) - Inicialmente fuera de pantalla
let goal = {
    x: canvas.width + 100, // Empieza lejos
    y: 200,
    width: 50,
    height: 50
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

// CONTROLES (Salto)
function jump() {
    if (player.grounded && gameRunning && !gameWon) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }
}
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') jump();
});
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Evitar scroll
    jump();
});
canvas.addEventListener('click', jump);


// 2. BUCLE PRINCIPAL DEL JUEGO
function startGame() {
    gameRunning = true;
    loop();
}

function loop() {
    if (!gameRunning) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- LÓGICA DE FÍSICA ---
    
    // Gravedad
    player.dy += GRAVITY;
    player.y += player.dy;

    // Colisión con el suelo
    if (player.y > 200) { // 200 es la altura del piso
        player.y = 200;
        player.dy = 0;
        player.grounded = true;
    }

    // Aumentar distancia
    if (!gameWon) distance++;

    // --- OBSTÁCULOS ---
    // Generar obstáculo cada 150 frames (aprox 2.5 seg)
    if (frame % 150 === 0 && distance < GAME_DURATION && !gameWon) {
        obstacles.push({ x: canvas.width, y: 210, width: 30, height: 30, type: 'heart' });
    }

    // Mover y dibujar obstáculos
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= MOVEMENT_SPEED;

        // Dibujar obstáculo (Corazón roto o bloque)
        ctx.fillStyle = "#ff4d6d";
        ctx.font = "30px Arial";
        ctx.fillText("💔", obs.x, obs.y + 20); 

        // Colisión (Perder)
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            // Si choca, solo rebotamos un poco (no queremos que pierda y se frustre en su sorpresa jaja)
            // O puedes hacer que pierda puntos. Por ahora, solo visual:
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.fillRect(0,0,canvas.width, canvas.height);
        }
    }

    // --- DIBUJAR JUGADOR ---
    // Pequeño efecto de "caminar" saltando frames
    let spriteY = player.y;
    if (player.grounded && frame % 10 < 5) {
        spriteY -= 2; // Rebote al caminar
    }
    ctx.drawImage(imgYo, player.x, spriteY, player.width, player.height);

    // --- CONDICIÓN DE VICTORIA ---
    if (distance >= GAME_DURATION) {
        // Acercar a la novia
        if (goal.x > player.x + 60) {
            goal.x -= 2; // Ella entra en escena
        } else {
            // LLEGASTE!
            gameWon = true;
            displayWinMessage();
        }
        ctx.drawImage(imgElla, goal.x, goal.y, goal.width, goal.height);
    } else {
        // Barra de progreso
        ctx.fillStyle = "#5a2d3c";
        ctx.fillRect(50, 20, 200, 10);
        ctx.fillStyle = "#ff4d6d";
        ctx.fillRect(50, 20, (distance / GAME_DURATION) * 200, 10);
        ctx.fillText("Distancia hacia ti...", 50, 15);
    }

    frame++;
    requestAnimationFrame(loop);
}

function displayWinMessage() {
    // Dibujar corazón gigante
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(50, 50, 700, 200);
    
    ctx.fillStyle = "#ff002f";
    ctx.font = "40px 'VT323'";
    ctx.textAlign = "center";
    ctx.fillText("¡Te encontré!", canvas.width/2, canvas.height/2);
    ctx.font = "20px 'VT323'";
    ctx.fillText("(Baja para leer tu carta)", canvas.width/2, canvas.height/2 + 40);
    
    // Detener loop
    gameRunning = false;
}
