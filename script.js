// --- CONFIGURACIÓN ---
const SPEED = 6;
const JUMP_FORCE = -15;
const GRAVITY = 0.8;
const GROUND_Y = 250; 
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
imgEnemigo.src = 'assets/Monoconpistola.jpg'; // Ojo: Mayúscula M y .jpg

// --- ESTADO DEL JUEGO ---
let gameRunning = false;
let gameWon = false;
let frame = 0;
let health = MAX_HEALTH;
let invulnerable = false; 

// TECLAS
const keys = { w: false, a: false, d: false };

// CÁMARA
let cameraX = 0;

// JUGADOR
const CHAR_WIDTH = 100; 
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

// META (Ella está alta al final)
let goal = {
    x: LEVEL_LENGTH - 150,
    y: GROUND_Y - 300, 
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT
};

// --- PLATAFORMAS (PARKOUR) ---
let platforms = [
    { x: 400, y: GROUND_Y - 60, w: 150, h: 20 },
    { x: 650, y: GROUND_Y - 140, w: 150, h: 20 },
    { x: 1000, y: GROUND_Y - 140, w: 300, h: 20 },
    { x: 1500, y: GROUND_Y - 60, w: 100, h: 20 },
    { x: 1700, y: GROUND_Y - 160, w: 100, h: 20 },
    { x: 1950, y: GROUND_Y - 220, w: 100, h: 20 },
    { x: 2300, y: GROUND_Y - 100, w: 150, h: 20 },
    { x: 2550, y: GROUND_Y - 200, w: 150, h: 20 },
    { x: 2750, y: GROUND_Y - 300, w: 200, h: 20 }
];

// --- ENEMIGOS ---
let enemies = [
    { x: 500, y: GROUND_Y - 60, w: 60, h: 60, startX: 500, range: 100, speed: 2, dir: 1 },
    { x: 1100, y: GROUND_Y - 200, w: 60, h: 60, startX: 1100, range: 150, speed: 3, dir: 1 },
    { x: 1800, y: GROUND_Y - 60, w: 60, h: 60, startX: 1800, range: 200, speed: 4, dir: 1 },
    { x: 2400, y: GROUND_Y - 60, w: 60, h: 60, startX: 2400, range: 100, speed: 2, dir: -1 }
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
    let moving = false;
    if (keys.d) { player.x += SPEED; player.facingRight = true; moving = true; }
    if (keys.a) { player.x -= SPEED; player.facingRight = false; moving = true; }

    if (player.x < 0) player.x = 0;
    if (player.x > LEVEL_LENGTH) player.x = LEVEL_LENGTH;

    // 2. FÍSICA
    if (keys.w && player.grounded) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }
    player.dy += GRAVITY;
    player.y += player.dy;

    // 3. COLISIONES
    player.grounded = false;

    // Suelo base
    if (player.y + player.height >= GROUND_Y) {
        player.y = GROUND_Y - player.height;
        player.dy = 0;
        player.grounded = true;
    }

    // Plataformas
    if (player.dy > 0) {
        for (let p of platforms) {
            if (
                player.x + 20 < p.x + p.w &&
                player.x + player.width - 20 > p.x &&
                player.y + player.height > p.y &&
                player.y + player.height < p.y + p.h + 10
            ) {
                player.y = p.y - player.height;
                player.dy = 0;
                player.grounded = true;
            }
        }
    }

    // 4. CÁMARA
    cameraX = player.x - 200;
    if (cameraX < 0) cameraX = 0;

    // --- DIBUJAR ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Fondo
    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH + 800, canvas.height - GROUND_Y);

    // Plataformas
    ctx.fillStyle = "#5d4037";
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = "#3e2723";
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    }

    // Enemigos
    for (let en of enemies) {
        en.x += en.speed * en.dir;
        if (en.x > en.startX + en.range) en.dir = -1;
        if (en.x < en.startX - en.range) en.dir = 1;

        if (imgEnemigo.complete) {
            if (en.dir === -1) {
                ctx.save();
                ctx.translate(en.x + en.w, en.y);
                ctx.scale(-1, 1);
                ctx.drawImage(imgEnemigo, 0, 0, en.w, en.h);
                ctx.restore();
            } else {
                ctx.drawImage(imgEnemigo, en.x, en.y, en.w, en.h);
            }
        } else {
            ctx.fillStyle = "red"; ctx.fillRect(en.x, en.y, en.w, en.h);
        }

        if (!invulnerable && !gameWon) {
            if (
                player.x + 30 < en.x + en.w &&
                player.x + player.width - 30 > en.x &&
                player.y + 20 < en.y + en.h &&
                player.y + player.height > en.y
            ) {
                takeDamage();
            }
        }
    }

    // Jugador
    if (gameRunning) {
        let spriteY = player.y;
        let imagenAUsar = moving ? imgYoCaminando : imgYoParado;
        
        if (!invulnerable || frame % 10 < 5) {
            if (!player.facingRight) {
                ctx.save();
                ctx.translate(player.x + player.width, spriteY);
                ctx.scale(-1, 1);
                ctx.drawImage(imagenAUsar, 0, 0, player.width, player.height);
                ctx.restore();
            } else {
                ctx.drawImage(imagenAUsar, player.x, spriteY, player.width, player.height);
            }
        }
    }

    // Meta
    ctx.drawImage(imgElla, goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = "#d32f2f";
    ctx.font = "20px 'VT323'";
    ctx.fillText("¡Amor!", goal.x + 20, goal.y - 10);

    ctx.restore();

    // UI Vida
    ctx.fillStyle = "black";
    ctx.font = "24px 'VT323'";
    ctx.fillText("VIDA:", 20, 40);
    for (let i = 0; i < health; i++) {
        ctx.fillText("❤️", 70 + (i * 30), 40);
    }

    // Victoria
    if (player.x >= goal.x - 50 && player.y < goal.y + 100) {
        gameWon = true;
        displayWinMessage();
    } else {
        frame++;
        requestAnimationFrame(loop);
    }
}

function takeDamage() {
    health--;
    invulnerable = true;
    player.dy = -10;
    player.x -= 50;
    
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    if (health <= 0) {
        gameOver();
    } else {
        setTimeout(() => { invulnerable = false; }, 1500);
    }
}

function gameOver() {
    gameRunning = false;
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "50px 'VT323'";
    ctx.fillText("¡Te atraparon los monos!", canvas.width/2, canvas.height/2);
    ctx.font = "30px 'VT323'";
    ctx.fillText("Presiona R para reintentar", canvas.width/2, canvas.height/2 + 50);

    window.addEventListener('keydown', restartGame);
}

function restartGame(e) {
    if (e.key === 'r' || e.key === 'R') {
        window.removeEventListener('keydown', restartGame);
        player.x = 50;
        player.y = GROUND_Y - CHAR_HEIGHT;
        health = MAX_HEALTH;
        invulnerable = false;
        gameRunning = true;
        loop();
    }
}

function displayWinMessage() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d32f2f";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("¡Llegaste a mi corazón!", canvas.width/2, canvas.height/2 - 20);
    ctx.font = "30px 'VT323'";
    ctx.fillText("(Baja para leer tu carta)", canvas.width/2, canvas.height/2 + 40);
}
