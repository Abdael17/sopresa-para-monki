// ==========================================
// CÓDIGO ACTUALIZADO (5 NIVELES + MEJORAS)
// ==========================================

// --- CONFIGURACIÓN ---
const SPEED = 5;
const JUMP_FORCE = -16;
const GRAVITY = 0.8;
const GROUND_Y = 400;
const LEVEL_LENGTH = 1200; // ¡NIVELES MÁS LARGOS!
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
let isGameOver = false; // Nueva variable para controlar la pantalla de muerte
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

// META FINAL (Solo aparecerá en el nivel 5)
let goal = {
    x: 1000,
    y: GROUND_Y - BASE_HEIGHT,
    width: BASE_WIDTH,
    height: BASE_HEIGHT
};

// --- AMBIENTACIÓN ---
let stars = [];
for (let i = 0; i < 300; i++) { // Más estrellas para mapa más largo
    stars.push({
        x: Math.random() * (LEVEL_LENGTH + 800),
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        alpha: Math.random()
    });
}
let shootingStar = { x: 0, y: 0, active: false, speedX: 0, speedY: 0 };

// ==========================================
// SISTEMA DE 5 NIVELES
// ==========================================
let currentLevel = 0;

const levels = [
    // --- NIVEL 1: El Bosque Largo (Introducción) ---
    {
        platforms: [
            { x: 0, y: 400, w: 1200, h: 40 },   // Suelo largo
            { x: 300, y: 300, w: 200, h: 20 },
            { x: 600, y: 220, w: 200, h: 20 },
            { x: 900, y: 150, w: 150, h: 20 }
        ],
        enemies: [
            { x: 500, y: 340, w: 60, h: 60, speed: 2, startX: 500, range: 150, dir: 1 }
        ],
        hearts: [
            { x: 650, y: 170, w: 30, h: 30, collected: false }
        ]
    },
    // --- NIVEL 2: La Escalada Espaciosa ---
    {
        platforms: [
            { x: 0, y: 400, w: 200, h: 40 },
            { x: 250, y: 320, w: 250, h: 20 }, // Plataforma ancha para esquivar
            { x: 550, y: 240, w: 250, h: 20 }, // Plataforma ancha
            { x: 850, y: 160, w: 200, h: 20 },
            { x: 1100, y: 400, w: 100, h: 40 }
        ],
        enemies: [
            { x: 300, y: 260, w: 60, h: 60, speed: 2, startX: 250, range: 150, dir: 1 }, // Más espacio
            { x: 600, y: 180, w: 60, h: 60, speed: 2, startX: 550, range: 150, dir: 1 }
        ],
        hearts: [
            { x: 900, y: 110, w: 30, h: 30, collected: false }
        ]
    },
    // --- NIVEL 3: Islas Flotantes (Corregido Spawn) ---
    {
        platforms: [
            { x: 0, y: 400, w: 150, h: 40 },
            { x: 200, y: 400, w: 200, h: 20 }, 
            { x: 500, y: 300, w: 200, h: 20 }, 
            { x: 800, y: 200, w: 200, h: 20 }, 
            { x: 1100, y: 400, w: 100, h: 40 }
        ],
        enemies: [
            // Movido a x:300 para no matar al aparecer
            { x: 300, y: 340, w: 60, h: 60, speed: 3, startX: 200, range: 150, dir: 1 }, 
            { x: 850, y: 140, w: 60, h: 60, speed: 2, startX: 800, range: 150, dir: 1 }
        ],
        hearts: [
            { x: 550, y: 250, w: 30, h: 30, collected: false }
        ]
    },
    // --- NIVEL 4: El Puente Nocturno (Velocidad) ---
    {
        platforms: [
            { x: 0, y: 400, w: 100, h: 40 },
            { x: 150, y: 350, w: 400, h: 20 }, // Puente largo
            { x: 600, y: 250, w: 400, h: 20 }, // Puente largo 2
            { x: 1050, y: 400, w: 150, h: 40 }
        ],
        enemies: [
            { x: 200, y: 290, w: 60, h: 60, speed: 5, startX: 150, range: 300, dir: 1 }, // Muy rápido
            { x: 700, y: 190, w: 60, h: 60, speed: 4, startX: 600, range: 300, dir: 1 }
        ],
        hearts: [
            { x: 500, y: 200, w: 30, h: 30, collected: false },
            { x: 800, y: 100, w: 30, h: 30, collected: false }
        ]
    },
    // --- NIVEL 5: El Final (La Meta) ---
    {
        platforms: [
            { x: 0, y: 400, w: 200, h: 40 },
            { x: 250, y: 300, w: 100, h: 20 },
            { x: 400, y: 200, w: 100, h: 20 },
            { x: 550, y: 300, w: 100, h: 20 },
            { x: 700, y: 400, w: 500, h: 40 } // Plataforma final grande
        ],
        enemies: [], // Sin enemigos, solo amor
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
    if ((e.key === 'r' || e.key === 'R') && isGameOver) restartGame(); // Reiniciar con R
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
    // Si es Game Over, dibujamos la pantalla de muerte y paramos la lógica
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

    // 2. Física
    if (keys.w && player.grounded) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }
    player.dy += GRAVITY;
    player.y += player.dy;

    // 3. Colisiones
    player.grounded = false;
    
    // Caída al vacío (Muerte instantánea o daño)
    if (player.y + player.height >= GROUND_Y + 150) {
        player.y = 0; 
        player.dy = 0;
        takeDamage(); 
    }

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

    // 4. CAMBIO DE NIVEL (Ajustado para 1200px)
    if (player.x > 1150) { // Al final del mapa largo
        if (currentLevel < levels.length - 1) {
            currentLevel++;
            platforms = levels[currentLevel].platforms;
            enemies = levels[currentLevel].enemies;
            levelHearts = levels[currentLevel].hearts;
            
            player.x = 20; // Resetear posición
            console.log("¡Nivel " + (currentLevel + 1) + "!");
        }
    }

    // 5. Cámara
    let targetCamX = player.x - 200;
    cameraX += (targetCamX - cameraX) * 0.1;
    if (cameraX < 0) cameraX = 0;
    
    // DIBUJAR
    ctx.save();
    drawStaticBackground(); 
    ctx.translate(-cameraX, 0); 
    drawWorldScenery(); 

    // --- CORAZONES ---
    for (let h of levelHearts) {
        if (!h.collected) {
            ctx.fillStyle = "red";
            ctx.font = "30px Arial";
            ctx.fillText("❤️", h.x, h.y);

            // Recoger
            if (
                player.x < h.x + h.w &&
                player.x + player.width > h.x &&
                player.y < h.y + h.h &&
                player.y + player.height > h.y
            ) {
                h.collected = true;
                if (health < MAX_HEALTH) health++;
            }
        }
    }

    // --- ENEMIGOS ---
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

    // --- JUGADOR ---
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

    // --- META (NIVEL 5) ---
    if (currentLevel === levels.length - 1) {
        let finalX = 900; // Ajustado para mapa largo
        let finalY = 400 - BASE_HEIGHT;

        ctx.drawImage(imgElla, finalX, finalY, goal.width, goal.height);
        ctx.fillStyle = "#ff4d6d";
        ctx.font = "bold 20px 'VT323'";
        ctx.textAlign = "center";
        ctx.fillText("¡Amor!", finalX + goal.width/2, finalY - 15);

        if (!isDancing && player.x >= finalX - 60) {
            isDancing = true;
            player.x = finalX - 80;
            player.y = finalY;
            goal.x = finalX;
            goal.y = finalY;
        }
    }

    ctx.restore(); 
    drawUI();

    frame++;
    requestAnimationFrame(loop);
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

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

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH * 2, 500);
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH * 2, 20);

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
        isGameOver = true; // Activa la pantalla de muerte
    } else {
        setTimeout(() => { invulnerable = false; }, 1500);
    }
}

// NUEVA FUNCIÓN PARA DIBUJAR GAME OVER CONSTANTEMENTE
function drawGameOverScreen() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset cámara
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("😢 GAME OVER", canvas.width/2, canvas.height/2 - 20);
    
    ctx.fillStyle = "white";
    ctx.font = "30px 'VT323'";
    ctx.fillText("Presiona 'R' para intentar de nuevo", canvas.width/2, canvas.height/2 + 40);
}

function restartGame() {
    player.x = 50;
    player.y = GROUND_Y - BASE_HEIGHT;
    health = MAX_HEALTH;
    invulnerable = false;
    isDancing = false;
    isGameOver = false; // Quitar pantalla de muerte
    
    // REINICIO TOTAL
    currentLevel = 0;
    platforms = levels[currentLevel].platforms;
    enemies = levels[currentLevel].enemies;
    levelHearts = levels[currentLevel].hearts;

    // RESTAURAR TODOS LOS CORAZONES DE TODOS LOS NIVELES
    levels.forEach(level => {
        if(level.hearts) {
            level.hearts.forEach(h => h.collected = false);
        }
    });

    gamerRunning = true;
    // No llamamos a loop() aquí porque requestAnimationFrame sigue corriendo
}

function performDanceRoutine() {
    let targetCamX = goal.x - (canvas.width / 2) + 50;
    cameraX += (targetCamX - cameraX) * 0.1;

    ctx.save();
    drawStaticBackground();
    ctx.translate(-cameraX, 0);
    drawWorldScenery();

    let jumpOffset = Math.sin(frame * 0.15) * 20; 
    if (jumpOffset > 0) jumpOffset = 0; 
    let danceDir = Math.floor(frame / 30) % 2 === 0 ? 1 : -1;

    ctx.save();
    ctx.translate(goal.x - 80 + (player.width/2), goal.y + jumpOffset);
    ctx.scale(danceDir, 1); 
    ctx.drawImage(imgYoParado, -player.width/2, 0, player.width, player.height);
    ctx.restore();

    ctx.save();
    ctx.translate(goal.x + (goal.width/2), goal.y + jumpOffset);
    ctx.scale(danceDir * -1, 1); 
    ctx.drawImage(imgElla, -goal.width/2, 0, goal.width, goal.height);
    ctx.restore();

    ctx.restore(); 

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
// REPRODUCTOR DE MÚSICA (BARRA ARREGLADA)
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
const progressBar = document.getElementById('progress-bar'); // Seleccionamos la barra

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

// ACTUALIZAR BARRA DE PROGRESO
if(audioPlayer) {
    audioPlayer.addEventListener('timeupdate', () => {
        if(audioPlayer.duration && progressBar) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = percent + '%';
        }
    });
    audioPlayer.addEventListener('ended', nextSong);
}

// Listeners
if(playBtn) playBtn.addEventListener('click', togglePlay);
if(nextBtn) nextBtn.addEventListener('click', nextSong);
if(prevBtn) prevBtn.addEventListener('click', prevSong);

// Cargar primera canción
loadSong(playlist[currentSongIndex]);
