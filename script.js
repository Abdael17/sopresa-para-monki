// --- CONFIGURACIÓN ---
const SPEED = 7;           // Velocidad al correr
const JUMP_FORCE = -16;    // Fuerza del salto
const GRAVITY = 0.8;
const GROUND_Y = 200;      // Altura del suelo
const LEVEL_LENGTH = 4000; // Largo total del nivel (la meta está al final)

// --- ELEMENTOS HTML ---
const splashScreen = document.getElementById('splash-screen');
const mainContent = document.getElementById('main-content');
const startBtn = document.getElementById('start-btn');
const music = document.getElementById('bg-music');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- IMÁGENES ---
const imgYo = new Image();
imgYo.src = 'assets/Abdael_caminando.png'; // Tu sprite

const imgElla = new Image();
imgElla.src = 'assets/Beel_parada.png';     // Sprite de ella

const imgObstaculo = new Image();
imgObstaculo.src = 'assets/Monoconpistola.png'; // ¡EL MONO! 🐵🔫

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

// CÁMARA (Para que te siga)
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
    facingRight: true // Para saber hacia dónde mira
};

// META (Ella te espera al final del nivel)
let goal = {
    x: LEVEL_LENGTH - 200,
    y: GROUND_Y - CHAR_HEIGHT,
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT
};

// OBSTÁCULOS (Generados en posiciones fijas del mapa)
// Aquí definimos dónde están los monos. Puedes agregar más a la lista.
let obstacles = [
    { x: 600, y: GROUND_Y - 60, width: 60, height: 60 },
    { x: 1200, y: GROUND_Y - 60, width: 60, height: 60 },
    { x: 1800, y: GROUND_Y - 60, width: 60, height: 60 },
    { x: 2500, y: GROUND_Y - 60, width: 60, height: 60 },
    { x: 3200, y: GROUND_Y - 60, width: 60, height: 60 }
];

// --- LISTENERS DE TECLADO (WASD y Flechas) ---
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

    // 1. MOVIMIENTO HORIZONTAL
    if (keys.d) {
        player.x += SPEED;
        player.facingRight = true;
    }
    if (keys.a) {
        player.x -= SPEED;
        player.facingRight = false;
    }

    // Límites del mapa (No salir del inicio ni del final)
    if (player.x < 0) player.x = 0;
    if (player.x > LEVEL_LENGTH) player.x = LEVEL_LENGTH;

    // 2. SALTO (FÍSICA)
    if (keys.w && player.grounded) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }

    player.dy += GRAVITY;
    player.y += player.dy;

    // Colisión suelo
    let sueloJugador = GROUND_Y - player.height;
    if (player.y > sueloJugador) {
        player.y = sueloJugador;
        player.dy = 0;
        player.grounded = true;
    }

    // 3. CÁMARA (Sigue al jugador)
    // La cámara intenta centrar al jugador en la pantalla
    // cameraX es el punto "cero" del dibujo
    cameraX = player.x - 200; 
    // Evitar que la cámara muestre el vacío a la izquierda
    if (cameraX < 0) cameraX = 0;

    // --- DIBUJAR ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Guardar contexto para aplicar la cámara
    ctx.save();
    // Movemos "el mundo" hacia la izquierda según avance la cámara
    ctx.translate(-cameraX, 0);

    // SUELO
    ctx.fillStyle = "#6d4c41";
    // El suelo debe ser tan largo como el nivel
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH + 800, canvas.height - GROUND_Y);

    // OBSTÁCULOS (EL MONO)
    for (let obs of obstacles) {
        // Dibujar imagen del mono en lugar del cuadro rojo
        ctx.drawImage(imgObstaculo, obs.x, obs.y, obs.width, obs.height);

        // Colisión simple
        if (
            player.x + 40 < obs.x + obs.width &&
            player.x + player.width - 40 > obs.x &&
            player.y + 20 < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            // Choque: Pequeño rebote hacia atrás
            player.x -= 20; 
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(cameraX, 0, canvas.width, canvas.height); // Flash rojo
        }
    }

    // META (ELLA)
    ctx.drawImage(imgElla, goal.x, goal.y, goal.width, goal.height);
    // Texto sobre ella
    ctx.fillStyle = "#d32f2f";
    ctx.font = "20px 'VT323'";
    ctx.fillText("¡Amor!", goal.x + 20, goal.y - 10);

    // JUGADOR
    let spriteY = player.y;
    // Animación simple de rebote al caminar
    if ((keys.a || keys.d) && player.grounded && Math.floor(frame / 5) % 2 === 0) {
        spriteY -= 3;
    }
    
    // Invertir imagen si va a la izquierda
    if (!player.facingRight) {
        ctx.save();
        ctx.translate(player.x + player.width, spriteY);
        ctx.scale(-1, 1); // Espejo
        ctx.drawImage(imgYo, 0, 0, player.width, player.height);
        ctx.restore();
    } else {
        ctx.drawImage(imgYo, player.x, spriteY, player.width, player.height);
    }

    // Restaurar contexto (para dibujar la interfaz fija)
    ctx.restore();

    // --- INTERFAZ FIJA (BARRA DE PROGRESO) ---
    // Esto se dibuja SIN el desplazamiento de cámara
    let progress = Math.min(player.x / (goal.x), 1);
    
    ctx.fillStyle = "#5a2d3c";
    ctx.fillText("Distancia a tu corazón...", 50, 30);
    
    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(50, 40, 200, 15);
    
    ctx.fillStyle = "#d32f2f";
    ctx.fillRect(50, 40, progress * 200, 15);

    // --- VICTORIA ---
    if (player.x >= goal.x - 50) {
        gameWon = true;
        displayWinMessage();
    } else {
        frame++;
        requestAnimationFrame(loop);
    }
}

function displayWinMessage() {
    // Fondo semitransparente
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#d32f2f";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("¡Te encontré!", canvas.width/2, canvas.height/2 - 20);
    
    ctx.font = "30px 'VT323'";
    ctx.fillText("(Baja para leer tu carta)", canvas.width/2, canvas.height/2 + 40);
}

