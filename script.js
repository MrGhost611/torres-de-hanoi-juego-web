// ==== Clase Nodo y Pila tipo lista enlazada ====
class Nodo {
    constructor(valor) {
        this.valor = valor;
        this.siguiente = null;
    }
}

class Pila {
    constructor() {
        this.cima = null;
        this._tam = 0;
    }

    push(valor) {
        const nuevo = new Nodo(valor);
        nuevo.siguiente = this.cima;
        this.cima = nuevo;
        this._tam++;
    }

    pop() {
        if (this.isEmpty()) return null;
        const valor = this.cima.valor;
        this.cima = this.cima.siguiente;
        this._tam--;
        return valor;
    }

    peek() {
        return this.cima ? this.cima.valor : null;
    }

    size() {
        return this._tam;
    }

    isEmpty() {
        return this._tam === 0;
    }

    getAll() {
        const elementos = [];
        let actual = this.cima;
        while (actual) {
            elementos.push(actual.valor);
            actual = actual.siguiente;
        }
        return elementos.reverse();
    }

    clone() {
        const elementos = this.getAll();
        const nueva = new Pila();
        for (let i = elementos.length - 1; i >= 0; i--) {
            nueva.push(elementos[i]);
        }
        return nueva;
    }
}

// ==== Variables Globales ====
let isMusicPlaying = false;
let towers = [new Pila(), new Pila(), new Pila()];
let moveCounter = 0;
let timer = 0;
let timerInterval;
let gameStarted = false;
let selectedTower = null;
let isResolving = false;
let movimientos = [];
let pasoActual = 0;
const bgMusic = document.getElementById("bgMusic");
const soundBtn = document.getElementById("soundToggle");
const moveSound = new Audio('Sonidos/move.mp3');
const victorySound = new Audio('Sonidos/win.mp3');
const errorSound = new Audio('Sonidos/error.mp3');
const ancho_disco = 30;

// ==== Funciones ====
function toggleSound() {
    if (isMusicPlaying) {
        bgMusic.pause();
        soundBtn.textContent = "🔇";
    } else {
        bgMusic.play();
        soundBtn.textContent = "🔊";
    }
    isMusicPlaying = !isMusicPlaying;
}

function startGame() {
    if (isResolving) return;
    clearInterval(timerInterval);
    movimientos = [];
    pasoActual = 0;
    gameStarted = true;
    document.getElementById('diskCount').disabled = true;
    const diskCount = parseInt(document.getElementById('diskCount').value);
    const minMoves = Math.pow(2, diskCount) - 1;
    document.getElementById('minMoves').textContent = minMoves;

    if (diskCount < 3 || diskCount > 6) {
        alert('Por favor, elige un número de discos entre 3 y 6.');
        return;
    }

    towers = [new Pila(), new Pila(), new Pila()];
    moveCounter = 0;
    timer = 0;
    document.getElementById('moveCounter').textContent = moveCounter;
    document.getElementById('timer').textContent = timer;
    document.getElementById('victoryMessage').style.display = 'none';

    timerInterval = setInterval(() => {
        timer++;
        document.getElementById('timer').textContent = timer;
    }, 1000);

    const tower1 = document.getElementById('tower1');
    const tower2 = document.getElementById('tower2');
    const tower3 = document.getElementById('tower3');
    tower1.innerHTML = '';
    tower2.innerHTML = '';
    tower3.innerHTML = '';

    for (let i = diskCount; i > 0; i--) {
        towers[0].push(i);
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.style.width = `${i * ancho_disco}px`;
        disk.style.bottom = `${(diskCount - i) * 30}px`;
        disk.textContent = i;
        tower1.appendChild(disk);
    }

    selectedTower = null;
    document.querySelectorAll('.tower').forEach(t => t.classList.remove('selected'));
    document.getElementById('resolverBtn').disabled = false;
}

function moveDisk(towerIndex) {
    if (!gameStarted || isResolving) return;
    const towerElements = document.querySelectorAll('.tower');

    if (selectedTower === null) {
        if (!towers[towerIndex].isEmpty()) {
            selectedTower = towerIndex;
            towerElements[towerIndex].classList.add('selected');
        }
    } else {
        towerElements[selectedTower].classList.remove('selected');
        if (selectedTower !== towerIndex) {
            const fromTower = towers[selectedTower];
            const toTower = towers[towerIndex];
            const disco = fromTower.peek();

            if (!fromTower.isEmpty() && (toTower.isEmpty() || disco < toTower.peek())) {
                toTower.push(fromTower.pop());
                moveSound.play();
                moveCounter++;
                document.getElementById('moveCounter').textContent = moveCounter;
                updateTowers();
                setTimeout(() => checkVictory(), 10);
            } else {
                errorSound.play();
                alert('Movimiento no permitido');
            }
        }
        selectedTower = null;
    }
}

function updateTowers() {
    towers.forEach((tower, index) => {
        const towerElement = document.getElementById(`tower${index + 1}`);
        towerElement.innerHTML = '';
        const discos = tower.getAll();

        for (let i = 0; i < discos.length; i++) {
            const diskElement = document.createElement('div');
            diskElement.className = 'disk';
            diskElement.style.width = `${discos[i] * ancho_disco}px`;
            diskElement.style.bottom = `${i * 30}px`;
            diskElement.textContent = discos[i];
            towerElement.appendChild(diskElement);
        }
    });
}

function checkVictory() {
    const diskCount = parseInt(document.getElementById('diskCount').value);
    if (moveCounter > 0 && (towers[1].size() === diskCount || towers[2].size() === diskCount)) {
        clearInterval(timerInterval);
        victorySound.play();
        alert(`¡Felicidades! Has ganado en ${moveCounter} movimientos y ${timer} segundos.`);
        resetGame();
    }
}

function resetGame() {
    gameStarted = false;
    isResolving = false;
    movimientos = [];
    pasoActual = 0;

    clearInterval(timerInterval);
    towers = [new Pila(), new Pila(), new Pila()];
    moveCounter = 0;
    timer = 0;

    document.getElementById('moveCounter').textContent = moveCounter;
    document.getElementById('timer').textContent = timer;
    document.getElementById('minMoves').textContent = 0;
    document.querySelectorAll('.tower').forEach(t => {
        t.innerHTML = '';
        t.classList.remove('selected');
    });
    document.getElementById('resolverBtn').disabled = false;
    document.getElementById('diskCount').disabled = false;
}

document.querySelectorAll('.tower').forEach((tower, index) => {
    tower.addEventListener('click', () => moveDisk(index));
});

// ==== Resolver realmente desde el estado actual ====
// ==== Resolver realmente desde el estado actual ====
// ==== Resolver Juego ====
function resolver() {
    if (!gameStarted || isResolving) return;

    isResolving = true;
    document.getElementById('resolverBtn').disabled = true;

    const diskCount = parseInt(document.getElementById('diskCount').value);
    movimientos = [];

    const destino = towers[1].isEmpty() ? 2 : 1;
    const origen = 0;
    const auxiliar = [0, 1, 2].filter(i => i !== origen && i !== destino)[0];

    function hanoi(n, origen, destino, auxiliar) {
        if (n === 1) {
            movimientos.push([origen, destino]);
        } else {
            hanoi(n - 1, origen, auxiliar, destino);
            movimientos.push([origen, destino]);
            hanoi(n - 1, auxiliar, destino, origen);
        }
    }

    hanoi(diskCount, origen, destino, auxiliar);
    pasoActual = 0;

    function ejecutarPaso() {
        if (pasoActual >= movimientos.length) {
            setTimeout(() => {
                checkVictory();
                isResolving = false;
                document.getElementById('resolverBtn').disabled = false;
                document.getElementById('diskCount').disabled = false;
            }, 300);
            return;
        }

        const [from, to] = movimientos[pasoActual];
        if (!towers[from].isEmpty()) {
            const disco = towers[from].peek();
            if (towers[to].isEmpty() || disco < towers[to].peek()) {
                towers[to].push(towers[from].pop());
                moveCounter++;
                document.getElementById('moveCounter').textContent = moveCounter;
                updateTowers();
            }
        }

        pasoActual++;
        setTimeout(ejecutarPaso, 500);
    }

    ejecutarPaso();
}