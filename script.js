const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
const stepsInput = document.getElementById("steps");

const randomBtn = document.getElementById("randomBtn");
const clearBtn = document.getElementById("clearBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");

const generationLabel = document.getElementById("generation");
const populationLabel = document.getElementById("population");

let rows = 20;
let cols = 30;
let maxSteps = 100;

let grid = [];
let startingGrid = [];

let history = [];

let generation = 0;
let running = false;

let animationId = null;

const SPEED = 100;


// ============================================================
// Create empty grid
// ============================================================

function createEmptyGrid() {

    return Array.from(
        { length: rows },
        () => Array(cols).fill(0)
    );
}


// ============================================================
// Create random grid
// ============================================================

function createRandomGrid() {

    return Array.from(
        { length: rows },
        () =>
            Array.from(
                { length: cols },
                () => Math.random() < 0.5 ? 1 : 0
            )
    );
}


// ============================================================
// Copy grid
// ============================================================

function copyGrid(source) {

    return source.map(row => [...row]);
}


// ============================================================
// Count neighbors
// ============================================================

function countNeighbors(row, col) {

    let count = 0;

    for (let dr = -1; dr <= 1; dr++) {

        for (let dc = -1; dc <= 1; dc++) {

            if (dr === 0 && dc === 0) {
                continue;
            }

            const r = row + dr;
            const c = col + dc;

            if (
                r >= 0 &&
                r < rows &&
                c >= 0 &&
                c < cols
            ) {
                count += grid[r][c];
            }
        }
    }

    return count;
}


// ============================================================
// Calculate next generation
// ============================================================

function nextGeneration() {

    const newGrid = createEmptyGrid();

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            const neighbors = countNeighbors(r, c);

            // ================================================
            // YOUR RULE
            //
            // Exactly 2 neighbors = ALIVE
            // Anything else = DEAD
            // ================================================

            if (neighbors === 2) {
                newGrid[r][c] = 1;
            }
        }
    }

    grid = newGrid;
}


// ============================================================
// Draw grid
// ============================================================

function drawGrid() {

    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;

    const cellWidth = width / cols;
    const cellHeight = height / rows;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    // Cells
    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (grid[r][c] === 1) {

                ctx.fillStyle = "black";

                ctx.fillRect(
                    c * cellWidth,
                    r * cellHeight,
                    cellWidth,
                    cellHeight
                );
            }
        }
    }

    // Grid lines
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;

    for (let r = 0; r <= rows; r++) {

        const y = r * cellHeight;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    for (let c = 0; c <= cols; c++) {

        const x = c * cellWidth;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    updateStatus();
}


// ============================================================
// Update status
// ============================================================

function updateStatus() {

    let alive = 0;

    for (const row of grid) {

        for (const cell of row) {

            alive += cell;
        }
    }

    generationLabel.textContent =
        `Generation: ${generation} / ${maxSteps}`;

    populationLabel.textContent =
        `Alive: ${alive}`;
}


// ============================================================
// New random grid
// ============================================================

function newRandomGrid() {

    pause();

    rows = Math.max(1, parseInt(rowsInput.value) || 20);
    cols = Math.max(1, parseInt(colsInput.value) || 30);
    maxSteps = Math.max(0, parseInt(stepsInput.value) || 100);

    grid = createRandomGrid();

    startingGrid = copyGrid(grid);

    history = [];

    generation = 0;

    drawGrid();
}


// ============================================================
// Clear
// ============================================================

function clearGrid() {

    pause();

    grid = createEmptyGrid();

    history = [];

    generation = 0;

    drawGrid();
}


// ============================================================
// Reset
// ============================================================

function reset() {

    pause();

    grid = copyGrid(startingGrid);

    history = [];

    generation = 0;

    drawGrid();
}


// ============================================================
// Step forward
// ============================================================

function stepForward() {

    if (generation >= maxSteps) {
        pause();
        return;
    }

    // Save current generation
    history.push(copyGrid(grid));

    nextGeneration();

    generation++;

    drawGrid();
}


// ============================================================
// Step backward
// ============================================================

function stepBackward() {

    pause();

    if (history.length === 0) {
        return;
    }

    grid = history.pop();

    generation--;

    drawGrid();
}


// ============================================================
// Start
// ============================================================

function start() {

    if (running) {
        return;
    }

    running = true;

    runSimulation();
}


// ============================================================
// Simulation loop
// ============================================================

function runSimulation() {

    if (!running) {
        return;
    }

    if (generation >= maxSteps) {

        pause();

        return;
    }

    stepForward();

    animationId = setTimeout(
        runSimulation,
        SPEED
    );
}


// ============================================================
// Pause
// ============================================================

function pause() {

    running = false;

    if (animationId !== null) {

        clearTimeout(animationId);

        animationId = null;
    }
}


// ============================================================
// Click canvas
// ============================================================

canvas.addEventListener("click", function(event) {

    const rect = canvas.getBoundingClientRect();

    const cellWidth = rect.width / cols;
    const cellHeight = rect.height / rows;

    const col = Math.floor(
        (event.clientX - rect.left) / cellWidth
    );

    const row = Math.floor(
        (event.clientY - rect.top) / cellHeight
    );

    if (
        row >= 0 &&
        row < rows &&
        col >= 0 &&
        col < cols
    ) {

        grid[row][col] =
            grid[row][col] === 1 ? 0 : 1;

        drawGrid();
    }
});


// ============================================================
// Button events
// ============================================================

randomBtn.addEventListener(
    "click",
    newRandomGrid
);

clearBtn.addEventListener(
    "click",
    clearGrid
);

startBtn.addEventListener(
    "click",
    start
);

pauseBtn.addEventListener(
    "click",
    pause
);

stepBtn.addEventListener(
    "click",
    stepForward
);

backBtn.addEventListener(
    "click",
    stepBackward
);

resetBtn.addEventListener(
    "click",
    reset
);


// ============================================================
// Keyboard controls
// ============================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.code === "Space") {

            event.preventDefault();

            if (running) {
                pause();
            } else {
                start();
            }
        }

        if (event.key === "ArrowRight") {

            event.preventDefault();

            stepForward();
        }

        if (event.key === "ArrowLeft") {

            event.preventDefault();

            stepBackward();
        }
    }
);


// ============================================================
// Resize
// ============================================================

window.addEventListener(
    "resize",
    drawGrid
);


// ============================================================
// Start
// ============================================================

newRandomGrid();
