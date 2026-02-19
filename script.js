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
let gameRunning = false;
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
// Generamos las estrellas una sola vez
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * (LEVEL_LENGTH + 800), // Repartidas por todo el nivel
        y: Math.random() * 600, // Altura aleatoria
        size: Math.random() * 2 + 1, // Tamaño variado
        alpha: Math.random() // Brillo variado
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

// Definimos los niveles (Plataformas + Enemigos juntos)
// --- SISTEMA DE NIVELES Y ENEMIGOS (CORREGIDO) ---
// --- SISTEMA DE NIVELES Y ENEMIGOS (MEJORADO) ---
const levels = [
    // --- NIVEL 1: El Inicio (Ahora con 3 saltos) ---
    {
        platforms: [
            { x: 0, y: 400, w: 800, h: 40 },   // Suelo
            { x: 250, y: 300, w: 150, h: 20 }, // Plataforma 1
            { x: 500, y: 220, w: 150, h: 20 }, // Plataforma 2
            { x: 700, y: 150, w: 100, h: 20 }  // Plataforma Salida (Meta)
        ],
        enemies: [
            // Enemigos más grandes (60x60) y ajustados al suelo
            { x: 400, y: 340, w: 60, h: 60, speed: 2, startX: 400, range: 100, dir: 1 }, 
            { x: 280, y: 240, w: 50, h: 50, speed: 2, startX: 280, range: 50, dir: 1 }   
        ]
    },

    // --- NIVEL 2: El Desafío ---
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

// INICIALIZAR EL JUEGO CON EL NIVEL 0
let platforms = levels[currentLevel].platforms;
let enemies = levels[currentLevel].enemies; // ¡Importante! Cargamos los enemigos del nivel
// --- DETECTOR DE FINAL DE NIVEL ---
    
// --- DETECTOR DE FINAL DE NIVEL (MEJORADO) ---
    
    // CAMBIO: Ahora detecta si pasas el pixel 750 (antes de llegar al borde negro)
    if (player.x > 650) {
        
        // Verificamos si quedan niveles
        if (currentLevel < levels.length - 1) {
            currentLevel++; // Subir nivel
            
            // CARGAR TODO LO NUEVO
            platforms = levels[currentLevel].platforms; 
            enemies = levels[currentLevel].enemies;     
            
            player.x = 20; // Regresar al jugador a la izquierda
            
            console.log("¡Nivel " + (currentLevel + 1) + " Cargado!");
            
        } else {
            // FIN DEL JUEGO
            gamerRunning = false;
            // Un pequeño delay para que no sea tan brusco
            setTimeout(() => {
                alert("¡TE AMO! ❤️ Has completado nuestra aventura.");
                location.reload(); // Reinicia el juego
            }, 100);
        }
    }

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
        audioPlayer.play().catch(error => console.log("Error de reproducción:", error));
        playBtn.innerText = "⏸️"; 
        startGame();
    }, 1000);
});
function startGame() {
    gameRunning = true;
    loop();
}

function loop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ==========================================
    // MODO BAILE (VICTORIA)
    // ==========================================
    if (isDancing) {
        performDanceRoutine(); 
        frame++;
        requestAnimationFrame(loop);
        return; 
    }

    // ==========================================
    // MODO JUEGO NORMAL
    // ==========================================

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

    // Suelo
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

    // 4. CÁMARA
    cameraX = player.x - 200;
    if (cameraX < 0) cameraX = 0;
    cameraY = player.y - (canvas.height / 2) + 100;
    if (cameraY > GROUND_Y - canvas.height + 50) {
        cameraY = GROUND_Y - canvas.height + 50;
    }

    // --- DIBUJAR ---
    ctx.save();
    
    // Primero dibujamos el fondo ESTÁTICO (La Luna siempre te sigue)
    drawStaticBackground();
    
    // Luego movemos el mundo
    ctx.translate(-cameraX, -cameraY);

    // Dibujamos el escenario (Suelo, Estrellas que se mueven, Plataformas)
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

    // Meta (Beel)
    ctx.drawImage(imgElla, goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = "#ff4d6d"; // Color rosado para el texto
    ctx.font = "bold 20px 'VT323'";
    ctx.textAlign = "center";
    ctx.fillText("¡Amor!", goal.x + goal.width/2, goal.y - 15);

    ctx.restore(); // Fin cámara

    // UI Vida
    drawUI();

    // --- CHECK VICTORIA ---
    if (!isDancing && player.x >= goal.x - 60 && player.y < goal.y + 100) {
        isDancing = true;       
        player.x = goal.x - 80; 
        player.y = goal.y;      
    }

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
    
    // Fondo Estático (Luna)
    drawStaticBackground();
    
    // Mundo
    ctx.translate(-cameraX, -cameraY);
    drawWorldScenery(); // Estrellas y plataformas

    // Cálculos del Baile
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
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Fondo oscuro semitransparente
    ctx.fillRect(0, 100, canvas.width, 150);

    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("❤️ ¡TE ENCONTRÉ! ❤️", canvas.width/2, 180);
    
    ctx.fillStyle = "white";
    ctx.font = "30px 'VT323'";
    ctx.fillText("(Baja para leer tu carta)", canvas.width/2, 230);
}

// --- DIBUJA EL FONDO QUE NO SE MUEVE (CIELO + LUNA) ---
function drawStaticBackground() {
    // 1. Cielo de noche
    ctx.fillStyle = "#0f172a"; // Azul oscuro profundo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. La Luna (Siempre visible en la esquina)
    ctx.fillStyle = "#fdf4dc"; // Blanco amarillento
    ctx.shadowBlur = 20; // Resplandor
    ctx.shadowColor = "white";
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 100, 40, 0, Math.PI * 2); // Luna llena
    ctx.fill();
    ctx.shadowBlur = 0; // Quitar resplandor para lo demás
}

// --- DIBUJA LO QUE ES PARTE DEL MUNDO (Estrellas, Suelo, Plataformas) ---
function drawWorldScenery() {
    // 1. Estrellas (Detrás de todo)
    ctx.fillStyle = "white";
    for (let s of stars) {
        ctx.globalAlpha = Math.abs(Math.sin(frame * 0.05 + s.x)); // Titilar
        ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1.0;

    // 2. Estrella Fugaz
    drawShootingStar();

    // 3. Suelo
    ctx.fillStyle = "#1e293b"; // Suelo oscuro azulado
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH + 800, 1000);
    // Borde de pasto nocturno
    ctx.fillStyle = "#064e3b"; // Verde oscuro
    ctx.fillRect(0, GROUND_Y, LEVEL_LENGTH + 800, 20);

    // 4. Plataformas
    ctx.fillStyle = "#334155"; // Piedra oscura
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = "#94a3b8"; // Borde claro (luz de luna)
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    }
}

function drawShootingStar() {
    // Lógica para iniciar una estrella fugaz aleatoria
    if (!shootingStar.active) {
        if (Math.random() < 0.005) { // 0.5% de probabilidad por frame
            shootingStar.active = true;
            shootingStar.x = cameraX + Math.random() * canvas.width; // En pantalla
            shootingStar.y = Math.random() * 200;
            shootingStar.speedX = -8;
            shootingStar.speedY = 4;
        }
    } else {
        // Mover
        shootingStar.x += shootingStar.speedX;
        shootingStar.y += shootingStar.speedY;
        
        // Dibujar cola
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x + 40, shootingStar.y - 20); // Cola larga
        ctx.stroke();

        // Desactivar si sale de pantalla o muy abajo
        if (shootingStar.y > GROUND_Y) shootingStar.active = false;
    }
}

function drawUI() {
    ctx.textAlign = "left";
    ctx.fillStyle = "white"; // Texto blanco para que se vea en la noche
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
    let scaleFactor = 0.5 + (0.5 * (health / MAX_HEALTH));
    player.width = BASE_WIDTH * scaleFactor;
    player.height = BASE_HEIGHT * scaleFactor;
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
    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.font = "60px 'VT323'";
    ctx.fillText("PERDISTE MI MONITA 😿", canvas.width/2, canvas.height/2 - 20);
    ctx.fillStyle = "white";
    ctx.font = "30px 'VT323'";
    ctx.fillText("¡No te rindas! Quiero encontra mi monki", canvas.width/2, canvas.height/2 + 30);
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
        player.width = BASE_WIDTH;
        player.height = BASE_HEIGHT;
        invulnerable = false;
        isDancing = false; 
        gameRunning = true;
        loop();
    }
}

// ==========================================
// REPRODUCTOR DE MÚSICA (LISTA DE 7)
// ==========================================

const playlist = [
    {
        title: "Yellow", // Cambia este texto si quieres
        artist: "Coldplay",
        src: "assets/Canción.mp3",  // OJO: Tiene tilde
        cover: "assets/Cover.jpg"
    },
    {
        title: "Those eyes",
        artist: "New west",
        src: "assets/Canción1.mp3",
        cover: "assets/Cover1.jpg"
    },
    {
        title: "My kind of woman",
        artist: "Mac Demarco",
        src: "assets/Canción2.mp3",
        cover: "assets/Cover2.jpg"
    },
    {
        title: "The Scientist",
        artist: "Coldplay",
        src: "assets/Canción3.mp3",
        cover: "assets/Cover3.jpg"
    },
    {
        title: "Something about you",
        artist: "Eyedress",
        src: "assets/Canción4.mp3",
        cover: "assets/Cover4.jpg"
    },
    {
        title: "Compass",
        artist: "The Neighbourhood",
        src: "assets/Canción5.mp3",
        cover: "assets/Cover5.jpg"
    },
    {
        title: "Just The Way You Are",
        artist: "Bruno Mars",
        src: "assets/Canción6.mp3",
        cover: "assets/Cover6.jpg"
    }
];

let currentSongIndex = 0;

// Referencias al HTML
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const coverImg = document.getElementById('cover-img');

// 1. Función Cargar Canción
function loadSong(song) {
    songTitle.innerText = song.title;
    songArtist.innerText = song.artist;
    audioPlayer.src = song.src;
    coverImg.src = song.cover;
}

// 2. Función Play/Pausa
function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playBtn.innerText = "⏸️"; // Icono Pausa
        // Animación de giro en la foto (Opcional)
        coverImg.style.transform = "rotate(3deg) scale(1.1)";
    } else {
        audioPlayer.pause();
        playBtn.innerText = "▶️"; // Icono Play
        coverImg.style.transform = "rotate(0deg) scale(1)";
    }
}

// 3. Siguiente Canción
function nextSong() {
    currentSongIndex++;
    if (currentSongIndex > playlist.length - 1) {
        currentSongIndex = 0; // Vuelve a la primera
    }
    loadSong(playlist[currentSongIndex]);
    audioPlayer.play();
    playBtn.innerText = "⏸️";
}

// 4. Canción Anterior
function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = playlist.length - 1; // Va a la última
    }
    loadSong(playlist[currentSongIndex]);
    audioPlayer.play();
    playBtn.innerText = "⏸️";
}

// 5. Barra de Progreso
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.value = progressPercent;
    }
}

// 6. Mover la barra (Adelantar/Retroceder)
progressBar.addEventListener('input', () => {
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (progressBar.value / 100) * duration;
});

// Event Listeners
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', nextSong); // Cuando acaba una, sigue la otra

// Cargar la primera canción al iniciar (sin reproducir aún)
loadSong(playlist[currentSongIndex]);
audioPlayer.volume = 0.5; // Volumen al 50%















