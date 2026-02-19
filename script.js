// ==========================================
// CÓDIGO COMPLETO - SCRIPT.JS
// ==========================================

// --- CONFIGURACIÓN ---
const SPEED = 5;
const JUMP_FORCE = -16;
const GRAVITY = 0.8;
const GROUND_Y = 400;
const LEVEL_LENGTH = 800; // Ancho de cada pantalla
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

// META FINAL (Solo aparecerá en el último nivel)
let goal = {
    x: 700,
    y: GROUND_Y - BASE_HEIGHT,
    width: BASE_WIDTH,
    height: BASE_HEIGHT
};

// --- AMBIENTACIÓN (ESTRELLAS) ---
let stars = [];
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * (LEVEL_LENGTH + 800),
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        alpha: Math.random()
    });
}
let shootingStar = { x: 0, y: 0, active: false, speedX: 0, speedY: 0 };

// ==========================================
// SISTEMA DE NIVELES (AHORA SON 3)
// ==========================================
let currentLevel = 0;

const levels = [
    // --- NIVEL 1: El Comienzo ---
    {
        platforms: [
            { x: 0, y: 400, w: 800, h: 40 },   // Suelo
            { x: 300, y: 300, w: 150, h: 20 },
            { x: 550, y: 200, w: 150, h: 20 },
            { x: 750, y: 150, w: 50, h: 20 }   // Salida
        ],
        enemies: [
            { x: 400, y: 340, w: 60, h: 60, speed: 2, startX: 400, range: 100, dir: 1 }
        ],
        hearts: [
            { x: 350, y: 250, w: 30, h: 30, collected: false } // Corazón en plataforma media
        ]
    },
    // --- NIVEL 2: La Escalada ---
    {
        platforms: [
            { x: 0, y: 400, w: 150, h: 40 },
            { x: 200, y: 320, w: 100, h: 20 },
            { x: 400, y: 240, w: 100, h: 20 },
            { x: 600, y: 160, w: 100, h: 20 },
            { x: 750, y: 400, w: 50, h: 40 }
        ],
        enemies: [
            { x: 220, y: 260, w: 60, h: 60, speed: 2, startX: 220, range: 60, dir: 1 },
            { x: 620, y: 100, w: 60, h: 60, speed: 1, startX: 600, range: 80, dir: 1 }
        ],
        hearts: [
            { x: 430, y: 190, w: 30, h: 30, collected: false }
        ]
    },
    // --- NIVEL 3: El Cielo Peligroso ---
    {
        platforms: [
            { x: 0, y: 400, w: 100, h: 40 },
            { x: 150, y: 400, w: 100, h: 20 }, // Salto bajo
            { x: 300, y: 300, w: 80, h: 20 },  // Salto medio
            { x: 450, y: 200, w: 80, h: 20 },  // Salto alto
            { x: 650, y: 400, w: 150, h: 40 }  // Meta Final
        ],
        enemies: [
            { x: 170, y: 340, w: 60, h: 60, speed: 4, startX: 150, range: 80, dir: 1 }, // Muy rápido
            { x: 470, y: 140, w: 60, h: 60, speed: 2, startX: 450, range: 60, dir: 1 }
        ],
        hearts: [
            { x: 320, y: 250, w: 30, h: 30, collected: false },
            { x: 600, y: 350, w: 30, h: 30, collected: false } // Ayuda final
        ]
    }
];

// Cargar datos iniciales
let platforms = levels[currentLevel].platforms;
let enemies = levels[currentLevel].enemies;
let levelHearts = levels[currentLevel].hearts; // Cargar corazones

// --- CONTROLES ---
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
    loop();
}

// ==========================================
// BUCLE PRINCIPAL (LOOP)
// ==========================================
function loop() {
    if (!gamerRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Texto de Nivel
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Nivel: " + (currentLevel + 1), 20, 80);

    // MODO BAILE (VICTORIA FINAL)
    if (isDancing) {
        performDanceRoutine();
        frame++;
        requestAnimationFrame(loop);
        return;
    }

    // --- LÓGICA ---

    // 1. Movimiento
    let moving = false;
    if (keys.d) { player.x += SPEED; player.facingRight = true; moving = true; }
    if (keys.a) { player.x -= SPEED; player.facingRight = false; moving = true; }

    if (player.x < 0) player.x = 0; // Pared izquierda

    // 2. Física (Salto y Gravedad)
    if (keys.w && player.grounded) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }
    player.dy += GRAVITY;
    player.y += player.dy;

    // 3. Colisiones con Plataformas
    player.grounded = false;
    
    // Suelo base (seguridad)
    if (player.y + player.height >= GROUND_Y + 100) {
        player.y = 0; // Si cae al vacío, reaparece arriba
        player.dy = 0;
        takeDamage(); // Y pierde vida por caerse
    }

    if (player.dy > 0) { // Solo si cae
        for (let p of platforms) {
            if (
                player.x + 10 < p.x + p.w &&
                player.x + player.width - 10 > p.x &&
                player.y + player.height > p.y &&
                player.y + player.height < p.y + p.h + 15
            ) {
                player.y = p.y - player.height;
                player.dy = 0;
                player.grounded = true;
            }
        }
    }

    // 4. CAMBIO DE NIVEL
    // Si llega al borde derecho (aprox pixel 750)
    if (player.x > 750) {
        if (currentLevel < levels.length - 1) {
            // AVANZAR NIVEL
            currentLevel++;
            platforms = levels[currentLevel].platforms;
            enemies = levels[currentLevel].enemies;
            levelHearts = levels[currentLevel].hearts; // Cargar nuevos corazones
            
            player.x = 20; // Resetear posición
            console.log("¡Nivel " + (currentLevel + 1) + "!");
        } else {
            // ES EL ÚLTIMO NIVEL -> NO HACEMOS NADA AQUÍ
            // La lógica de ganar está en el dibujo de la meta abajo
        }
    }

    // 5. Cámara suave
    let targetCamX = player.x - 200;
    cameraX += (targetCamX - cameraX) * 0.1;
    if (cameraX < 0) cameraX = 0;
    
    // Dibujar
    ctx.save();
    drawStaticBackground(); // Fondo
    ctx.translate(-cameraX, 0); // Mover mundo
    drawWorldScenery(); // Plataformas y suelo

    // --- DIBUJAR Y LOGICA DE CORAZONES (NUEVO) ---
    for (let h of levelHearts) {
        if (!h.collected) {
            // Dibujar corazón
            ctx.fillStyle = "red";
            ctx.font = "30px Arial";
            ctx.fillText("❤️", h.x, h.y);

            // Detectar colisión (Recoger)
            if (
                player.x < h.x + h.w &&
                player.x + player.width > h.x &&
                player.y < h.y + h.h &&
                player.y + player.height > h.y
            ) {
                h.collected = true;
                if (health < MAX_HEALTH) {
                    health++; // Recuperar vida
                }
            }
        }
    }

    // --- ENEMIGOS ---
    for (let en of enemies) {
        // Patrullar
        en.x += en.speed * en.dir;
        if (en.x > en.startX + en.range) en.dir = -1;
        if (en.x < en.startX - en.range) en.dir = 1;

        // Dibujar Enemigo
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

        // Daño
        if (!invulnerable) {
            if (
                player.x + 20 < en.x + en.w &&
                player.x + player.width - 20 > en.x &&
                player.y + 20 < en.y + en.h &&
                player.y + player.height > en.y
            ) {
                takeDamage();
            }
        }
    }

    // --- JUGADOR ---
    let spriteY = player.y;
    let imagenAUsar = moving ? imgYoCaminando : imgYoParado;
    
    // Parpadeo si es invulnerable
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

    // --- META (SOLO EN EL ULTIMO NIVEL) ---
    if (currentLevel === levels.length - 1) {
        let finalX = 650;
        let finalY = 400 - BASE_HEIGHT; // Ajuste para que pise el suelo

        ctx.drawImage(imgElla, finalX, finalY, goal.width, goal.height);
        ctx.fillStyle = "#ff4d6d";
        ctx.font = "bold 20px 'VT323'";
        ctx.textAlign = "center";
        ctx.fillText("¡Amor!", finalX + goal.width/2, finalY - 15);

        // CONDICIÓN DE VICTORIA
        if (!isDancing && player.x >= finalX - 60) {
            isDancing = true;
            player.x = finalX - 80;
            player.y = finalY;
            goal.x = finalX; // Guardar pos para el baile
            goal.y = finalY;
        }
    }

    ctx.restore(); // Fin cámara
    drawUI();

    frame++;
    requestAnimationFrame(loop);
}

// ==========================================
// FUNCIONES VISUALES
// ==========================================

function drawStaticBackground() {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Luna
    ctx.fillStyle = "#fdf4dc";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 100, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawWorldScenery() {
    // Estrellas
    ctx.fillStyle = "white";
    for (let s of stars) {
        ctx.globalAlpha = Math.abs(Math.sin(frame * 0.05 + s.x));
        ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1.0;

    // Suelo
    ctx.fillStyle = "#1e293b";
    // Dibujamos suelo largo por si acaso
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH * 2, 500);
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH * 2, 20);

    // Plataformas
    ctx.fillStyle = "#334155";
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = "#94a3b8";
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    }
}

function drawUI() {
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.font = "24px 'VT323'";
    ctx.fillText("VIDA:", 20, 40);
    for (let i = 0; i < health; i++) {
        ctx.fillText("❤️", 70 + (i * 30), 40);
    }
}

function takeDamage() {
    health--;
    invulnerable = true;
    player.dy = -8;
    player.x -= 40;
    
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    if (health <= 0) {
        gameOver();
    } else {
        setTimeout(() => { invulnerable = false; }, 1500);
    }
}

function gameOver() {
    gamerRunning = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("😢 GAME OVER", canvas.width/2, canvas.height/2 - 20);
    
    ctx.fillStyle = "white";
    ctx.font = "30px 'VT323'";
    ctx.fillText("Presiona 'R' para intentar de nuevo", canvas.width/2, canvas.height/2 + 40);
    
    window.addEventListener('keydown', restartGame);
}

function restartGame(e) {
    if (e.key === 'r' || e.key === 'R') {
        window.removeEventListener('keydown', restartGame);
        player.x = 50;
        player.y = GROUND_Y - BASE_HEIGHT;
        health = MAX_HEALTH;
        invulnerable = false;
        isDancing = false;
        
        // Reiniciar al Nivel 1
        currentLevel = 0;
        platforms = levels[currentLevel].platforms;
        enemies = levels[currentLevel].enemies;
        levelHearts = levels[currentLevel].hearts;

        gamerRunning = true;
        loop();
    }
}

function performDanceRoutine() {
    // Zoom y centrado
    let targetCamX = goal.x - (canvas.width / 2) + 50;
    cameraX += (targetCamX - cameraX) * 0.1;

    ctx.save();
    drawStaticBackground();
    ctx.translate(-cameraX, 0);
    drawWorldScenery();

    // Animación salto
    let jumpOffset = Math.sin(frame * 0.15) * 20; 
    if (jumpOffset > 0) jumpOffset = 0; 
    let danceDir = Math.floor(frame / 30) % 2 === 0 ? 1 : -1;

    // JUGADOR
    ctx.save();
    ctx.translate(goal.x - 80 + (player.width/2), goal.y + jumpOffset);
    ctx.scale(danceDir, 1); 
    ctx.drawImage(imgYoParado, -player.width/2, 0, player.width, player.height);
    ctx.restore();

    // ELLA
    ctx.save();
    ctx.translate(goal.x + (goal.width/2), goal.y + jumpOffset);
    ctx.scale(danceDir * -1, 1); 
    ctx.drawImage(imgElla, -goal.width/2, 0, goal.width, goal.height);
    ctx.restore();

    ctx.restore(); 

    // Mensaje Final
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 100, canvas.width, 150);

    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("❤️ ¡TE ENCONTRÉ! ❤️", canvas.width/2, 180);
    
    ctx.fillStyle = "white";
    ctx.font = "30px 'VT323'";
    ctx.fillText("Baja para leer tu carta...", canvas.width/2, 230);
}

// ==========================================
// REPRODUCTOR DE MÚSICA (FIXED)
// ==========================================

const playlist = [
    { title: "Yellow", artist: "Coldplay", src: "assets/Canción.mp3", cover: "assets/Cover.jpg" },
    { title: "Those eyes", artist: "New west", src: "assets/Canción1.mp3", cover: "assets/Cover1.jpg" },
    { title: "My kind of woman", artist: "Mac Demarco", src: "assets/Canción2.mp3", cover: "assets/Cover2.jpg" },
    { title: "The Scientist", artist: "Coldplay", src: "assets/Canción3.mp3", cover: "assets/Cover3.jpg" },
    { title: "Something about you", artist: "Eyedress", src: "assets/Canción4.mp3", cover: "assets/Cover4.jpg" },
    { title: "Compass", artist: "The Neighbourhood", src: "assets/Canción5.mp3", cover: "assets/Cover5.jpg" },
    { title: "Just The Way You Are", artist: "Bruno Mars", src: "assets/Canción6.mp3", cover: "assets/Cover6.jpg" }
];

let currentSongIndex = 0;

const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const coverImg = document.getElementById('cover-img');

function loadSong(song) {
    if(!songTitle) return;
    songTitle.innerText = song.title;
    songArtist.innerText = song.artist;
    audioPlayer.src = song.src;
    coverImg.src = song.cover;
}

function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playBtn.innerText = "⏸️";
        coverImg.style.transform = "rotate(3deg) scale(1.1)";
    } else {
        audioPlayer.pause();
        playBtn.innerText = "▶️";
        coverImg.style.transform = "rotate(0deg) scale(1)";
    }
}

function nextSong() {
    currentSongIndex++;
    if (currentSongIndex > playlist.length - 1) currentSongIndex = 0;
    loadSong(playlist[currentSongIndex]);
    audioPlayer.play();
    playBtn.innerText = "⏸️";
}

function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) currentSongIndex = playlist.length - 1;
    loadSong(playlist[currentSongIndex]);
    audioPlayer.play();
    playBtn.innerText = "⏸️";
}

// Listeners
if(playBtn) playBtn.addEventListener('click', togglePlay);
if(nextBtn) nextBtn.addEventListener('click', nextSong);
if(prevBtn) prevBtn.addEventListener('click', prevSong);
if(audioPlayer) audioPlayer.addEventListener('ended', nextSong);

// --- ¡IMPORTANTE! CARGAR LA PRIMERA CANCIÓN AL INICIO ---
// Esto arregla el mensaje de "Cargando..."
loadSong(playlist[currentSongIndex]);
