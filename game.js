// Configuración del canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Variables del juego
let score = 0;
let gameRunning = false;
let objects = [];

// Elementos del DOM
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');

// Clase para objetos voladores
class FlyingObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.velocityX = (Math.random() - 0.5) * 8;
        this.velocityY = -15 - Math.random() * 5;
        this.gravity = 0.5;
        this.color = this.getRandomColor();
        this.sliced = false;
    }

    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.velocityY += this.gravity;
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    isOffScreen() {
        return this.y > canvas.height + this.size;
    }

    isClicked(mouseX, mouseY) {
        const distance = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
        return distance < this.size;
    }
}

// Iniciar el juego
function startGame() {
    score = 0;
    objects = [];
    gameRunning = true;
    scoreElement.textContent = score;
    startBtn.textContent = 'Juego en Curso...';
    startBtn.disabled = true;
    gameLoop();
    spawnObjects();
}

// Generar objetos
function spawnObjects() {
    if (!gameRunning) return;

    const x = Math.random() * canvas.width;
    objects.push(new FlyingObject(x, canvas.height));

    setTimeout(spawnObjects, 1000 + Math.random() * 1000);
}

// Loop principal del juego
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar y dibujar objetos
    objects = objects.filter(obj => {
        if (obj.isOffScreen()) {
            if (!obj.sliced) {
                // Perdiste si no cortaste el objeto
                endGame();
            }
            return false;
        }
        obj.update();
        obj.draw();
        return true;
    });

    requestAnimationFrame(gameLoop);
}

// Manejar clics/toques
canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    objects.forEach(obj => {
        if (!obj.sliced && obj.isClicked(mouseX, mouseY)) {
            obj.sliced = true;
            score += 10;
            scoreElement.textContent = score;
            createSliceEffect(mouseX, mouseY);
        }
    });
});

// Efecto visual al cortar
function createSliceEffect(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Finalizar el juego
function endGame() {
    gameRunning = false;
    startBtn.textContent = 'Reiniciar Juego';
    startBtn.disabled = false;
    alert(`¡Juego terminado! Tu puntuación final: ${score}`);
}

// Event listener del botón
startBtn.addEventListener('click', startGame);

