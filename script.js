// --- CONFIGURACIÓN ---
const SPEED = 5;
const JUMP_FORCE = -16;
const GRAVITY = 0.8;
const GROUND_Y = 400;
const LEVEL_LENGTH = 3000;
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
let gamerRunning = false; // CORREGIDO: Usaremos este nombre en todo el código
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

// META (BEEL)
let goal = {
    x: LEVEL_LENGTH - 150,
    y: (GROUND_Y - 450) - BASE_HEIGHT,
    width: BASE_WIDTH,
    height: BASE_HEIGHT
};

// --- AMBIENTACIÓN NOCTURNA (ESTRELLAS) ---
let stars = [];
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * (LEVEL_LENGTH + 800),
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        alpha: Math.random()
    });
}

// Estrella Fugaz
let shootingStar = {
    x: 0,
    y: 0,
    active: false,
    speedX: 0,
    speedY: 0
};

// --- SISTEMA DE NIVELES Y ENEMIGOS ---
let currentLevel = 0;

const levels = [
    // --- NIVEL 1 ---
    {
        platforms: [
            { x: 0, y: 400, w: 800, h: 40 },   // Suelo
            { x: 250, y: 300, w: 150, h: 20 }, // Plataforma 1
            { x: 500, y: 220, w: 150, h: 20 }, // Plataforma 2
            { x: 700, y: 150, w: 100, h: 20 }  // Salida
        ],
        enemies: [
            { x: 400, y: 340, w: 60, h: 60, speed: 2, startX: 400, range: 100, dir: 1 },
            { x: 280, y: 240, w: 50, h: 50, speed: 2, startX: 280, range: 50, dir: 1 }
        ]
    },
    // --- NIVEL 2 ---
    {
        platforms: [
            { x: 0, y: 400, w: 150, h: 40 },    // Inicio
            { x: 200, y: 300, w: 100, h: 20 },
            { x: 400, y: 200, w: 100, h: 20 },
            { x: 600, y: 300, w: 150, h: 20 },
            { x: 750, y: 400, w: 50, h: 40 }    // Meta final
        ],
        enemies: [
            { x: 220, y: 240, w: 60, h: 60, speed: 3, startX: 220, range: 80, dir: 1 },
            { x: 650, y: 240, w: 60, h: 60, speed: 1, startX: 650, range: 40, dir: 1 }
        ]
    }
];

// INICIALIZAR NIVELES
let platforms = levels[currentLevel].platforms;
let enemies = levels[currentLevel].enemies;

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
        // Intentamos reproducir audio, si falla no importa
        if(audioPlayer) audioPlayer.play().catch(e => console.log(e));
        if(playBtn) playBtn.innerText = "⏸️";
        startGame();
    }, 1000);
});

function startGame() {
    gamerRunning = true; // CORREGIDO
    loop();
}

// ==========================================
// BUCLE PRINCIPAL (LOOP)
// ==========================================
function loop() {
    if (!gamerRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- GPS DE DEBUG ---
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("X: " + Math.floor(player.x) + " | NV: " + (currentLevel+1), 20, 80);

    // MODO BAILE (VICTORIA)
    if (isDancing) {
        performDanceRoutine();
        frame++;
        requestAnimationFrame(loop);
        return;
    }

    // --- LÓGICA DEL JUEGO ---

    // 1. MOVIMIENTO
    let moving = false;
    if (keys.d) { player.x += SPEED; player.facingRight = true; moving = true; }
    if (keys.a) { player.x -= SPEED; player.facingRight = false; moving = true; }

    // Límites básicos del mapa
    if (player.x < 0) player.x = 0;
    // Quitamos el límite derecho estricto para permitir el cambio de nivel
    
    // 2. FÍSICA
    if (keys.w && player.grounded) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }
    player.dy += GRAVITY;
    player.y += player.dy;

    // 3. COLISIONES
    player.grounded = false;

    // Suelo Base
    if (player.y + player.height >= GROUND_Y) {
        player.y = GROUND_Y - player.height;
        player.dy = 0;
        player.grounded = true;
    }

    // Plataformas
    if (player.dy > 0) { 
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

    // 4. DETECTOR DE CAMBIO DE NIVEL (¡AHORA DENTRO DEL LOOP!)
    // Detectamos si llega al final del tramo actual (aprox pixel 650-700)
    if (player.x > 700) {
        
        // Verificamos si quedan niveles
        if (currentLevel < levels.length - 1) {
            currentLevel++; // Subir nivel
            
            // CARGAR TODO LO NUEVO
            platforms = levels[currentLevel].platforms;
            enemies = levels[currentLevel].enemies;
            
            player.x = 50; // Regresar al jugador a la izquierda
            
            console.log("¡Nivel " + (currentLevel + 1) + " Cargado!");
            
        } else {
            // LLEGÓ AL FINAL DEL JUEGO -> IR A BEEL
            // Aquí dejamos que siga avanzando hacia la meta final
        }
    }

    // 5. CÁMARA
    cameraX = player.x - 200;
    if (cameraX < 0) cameraX = 0;
    cameraY = player.y - (canvas.height / 2) + 100;
    if (cameraY > GROUND_Y - canvas.height + 50) {
        cameraY = GROUND_Y - canvas.height + 50;
    }

    // --- DIBUJAR ---
    ctx.save();
    
    // Fondo Estático
    drawStaticBackground();
    
    // Mundo
    ctx.translate(-cameraX, -cameraY);
    drawWorldScenery();

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

    // Jugador
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

    // DIBUJAR META (BEEL) SOLO SI ES EL ÚLTIMO NIVEL
    if (currentLevel === levels.length - 1) {
        // Ajustamos la meta para que esté al final de este nivel
        let finalX = 750; // Posición de la meta en nivel 2
        let finalY = 400 - BASE_HEIGHT;
        
        ctx.drawImage(imgElla, finalX, finalY, goal.width, goal.height);
        ctx.fillStyle = "#ff4d6d";
        ctx.font = "bold 20px 'VT323'";
        ctx.textAlign = "center";
        ctx.fillText("¡Amor!", finalX + goal.width/2, finalY - 15);

        // CHECK VICTORIA
        if (!isDancing && player.x >= finalX - 60) {
            isDancing = true;       
            player.x = finalX - 80; 
            player.y = finalY;  
            // Actualizamos goal.x/y para la animación de baile
            goal.x = finalX;
            goal.y = finalY;
        }
    }

    ctx.restore(); // Fin cámara

    drawUI();

    // Siguiente frame
    frame++;
    requestAnimationFrame(loop);
}

// ==========================================
// FUNCIÓN DE BAILE 🎶
// ==========================================
function performDanceRoutine() {
    let targetCamX = goal.x - (canvas.width / 2) + 50;
    let targetCamY = goal.y - (canvas.height / 2);
    
    cameraX += (targetCamX - cameraX) * 0.1;
    cameraY += (targetCamY - cameraY) * 0.1;

    ctx.save();
    drawStaticBackground();
    ctx.translate(-cameraX, -cameraY);
    drawWorldScenery();

    let jumpOffset = Math.sin(frame * 0.15) * 20; 
    if (jumpOffset > 0) jumpOffset = 0; 
    let danceDir = Math.floor(frame / 30) % 2 === 0 ? 1 : -1;

    // TÚ
    ctx.save();
    let myDrawX = goal.x - 80; 
    let myDrawY = goal.y + jumpOffset;
    ctx.translate(myDrawX + (player.width/2), myDrawY);
    ctx.scale(danceDir, 1); 
    ctx.drawImage(imgYoParado, -player.width/2, 0, player.width, player.height);
    ctx.restore();

    // ELLA
    ctx.save();
    let ellaDrawX = goal.x;
    let ellaDrawY = goal.y + jumpOffset;
    ctx.translate(ellaDrawX + (goal.width/2), ellaDrawY);
    ctx.scale(danceDir * -1, 1); 
    ctx.drawImage(imgElla, -goal.width/2, 0, goal.width, goal.height);
    ctx.restore();

    ctx.restore(); 

    // UI FINAL
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 100, canvas.width, 150);

    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("❤️ ¡TE ENCONTRÉ! ❤️", canvas.width/2, 180);
    
    ctx.fillStyle = "white";
    ctx.font = "30px 'VT323'";
    ctx.fillText("(Baja para leer tu carta)", canvas.width/2, 230);
}

// --- UTILIDADES DE DIBUJO ---
function drawStaticBackground() {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fdf4dc";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 100, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawWorldScenery() {
    ctx.fillStyle = "white";
    for (let s of stars) {
        ctx.globalAlpha = Math.abs(Math.sin(frame * 0.05 + s.x));
        ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1.0;
    drawShootingStar();

    // Suelo
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH + 800, 1000);
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH + 800, 20);

    // Plataformas
    ctx.fillStyle = "#334155";
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = "#94a3b8";
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    }
}

function drawShootingStar() {
    if (!shootingStar.active) {
        if (Math.random() < 0.005) {
            shootingStar.active = true;
            shootingStar.x = cameraX + Math.random() * canvas.width;
            shootingStar.y = Math.random() * 200;
            shootingStar.speedX = -8;
            shootingStar.speedY = 4;
        }
    } else {
        shootingStar.x += shootingStar.speedX;
        shootingStar.y += shootingStar.speedY;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x + 40, shootingStar.y - 20);
        ctx.stroke();
        if (shootingStar.y > GROUND_Y) shootingStar.active = false;
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
    
    // Efecto visual daño
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    if (health <= 0) {
        gameOver();
    } else {
        setTimeout(() => { invulnerable = false; }, 1500);
    }
}

function gameOver() {
    gamerRunning = false; // CORREGIDO
    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("PERDISTE MI MONITA 😿", canvas.width/2, canvas.height/2 - 20);
    ctx.fillStyle = "white";
    ctx.font = "30px 'VT323'";
    ctx.fillText("¡No te rindas! Quiero encontrar mi monki", canvas.width/2, canvas.height/2 + 30);
    ctx.fillStyle = "#ffff00";
    ctx.fillText("[ Presiona 'R' para Reintentar ]", canvas.width/2, canvas.height/2 + 80);
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
        
        // Reiniciar niveles
        currentLevel = 0;
        platforms = levels[currentLevel].platforms;
        enemies = levels[currentLevel].enemies;

        gamerRunning = true; // CORREGIDO
        loop();
    }
}

// ==========================================
// REPRODUCTOR DE MÚSICA (CORREGIDO Y COMPLETADO)
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

// Referencias HTML audio
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
    if(!audioPlayer) return;
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
    if (currentSongIndex > playlist.length - 1) {
        currentSongIndex = 0;
    }
    loadSong(playlist[currentSongIndex]);
    audioPlayer.play();
    playBtn.innerText = "⏸️";
}

function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = playlist.length - 1;
    }
    loadSong(playlist[currentSongIndex]);
    audioPlayer.play();
    playBtn.innerText = "⏸️";
}

// Listeners Música
if(playBtn) playBtn.addEventListener('click', togglePlay);
if(nextBtn) nextBtn.addEventListener('click', nextSong);
if(prevBtn) prevBtn.addEventListener('click', prevSong);
if(audioPlayer) audioPlayer.addEventListener('ended', nextSong); // Auto siguiente
