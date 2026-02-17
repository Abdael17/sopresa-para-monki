// VARIABLES DEL DOM
const splashScreen = document.getElementById('splash-screen');
const mainContent = document.getElementById('main-content');
const startBtn = document.getElementById('start-btn');
const music = document.getElementById('bg-music');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ESTADO DEL JUEGO
let gameRunning = false;
let frameCount = 0;

// CARGAR IMÁGENES (SPRITES)
// Asegúrate de que los nombres coincidan con los que guardaste
const imgElla = new Image();
imgElla.src = 'assets/ella_parado.png';

const imgYo = new Image();
imgYo.src = 'assets/yo_caminando.png'; // Usaremos el sprite caminando para animar

// 1. EVENTO: INICIAR SORPRESA
startBtn.addEventListener('click', () => {
    // Desvanecer pantalla negra
    splashScreen.style.opacity = '0';
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        
        // Reproducir música (navegadores requieren interacción previa)
        music.volume = 0.5;
        music.play().catch(e => console.log("Error audio:", e));
        
        // Iniciar juego
        startGame();
    }, 1000);
});

// 2. LÓGICA BÁSICA DEL JUEGO (RENDER LOOP)
// Aquí dibujaremos a los personajes usando el Canvas
function startGame() {
    gameRunning = true;
    loop();
}

// Variables de posición
let yoX = 50; // Posición inicial tuya (izquierda)
let ellaX = 650; // Posición de ella (derecha)
let sueloY = 200; // Altura del suelo

function loop() {
    if (!gameRunning) return;

    // Limpiar pantalla (borrar frame anterior)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar suelo
    ctx.fillStyle = "#8B4513"; // Marrón
    ctx.fillRect(0, sueloY + 50, canvas.width, 10);

    // DIBUJARTE A TI (Jugador)
    // Animación simple: subir y bajar un poco para simular caminar
    let rebote = Math.sin(Date.now() / 100) * 5; 
    
    // drawImage(imagen, x, y, ancho, alto)
    // Ajustamos el tamaño a 64x64 para que se vean bien los pixeles
    ctx.drawImage(imgYo, yoX, sueloY + rebote, 64, 64);

    // DIBUJARLA A ELLA (Meta)
    ctx.drawImage(imgElla, ellaX, sueloY, 64, 64);

    // Texto flotante
    ctx.fillStyle = "black";
    ctx.font = "20px 'VT323'";
    ctx.fillText("¡Corre hacia ella!", 50, 50);

    // Loop de animación (60fps)
    requestAnimationFrame(loop);
}

// EVENTO: SALTO (Espacio o Touch)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        // Aquí programaremos la lógica del salto más adelante
        console.log("Salto!");
    }
});
