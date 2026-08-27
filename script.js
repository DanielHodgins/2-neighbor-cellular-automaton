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


// ============================================================
// SETTINGS
// ============================================================

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
// CREATE EMPTY GRID
// ============================================================

function createEmptyGrid() {

    return Array.from(
        { length: rows },
        () => Array(cols).fill(0)
    );
}


// ============================================================
// CREATE RANDOM GRID
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
// COPY GRID
// ============================================================

function copyGrid(source) {

    return source.map(row => [...row]);
}


// ============================================================
// COUNT NEIGHBORS
// ============================================================

function countNeighbors(row, col) {

    let count = 0;

    for (let dr = -1; dr <= 1; dr++) {

        for (let dc = -1; dc <= 1; dc++) {

            // Don't count the cell itself
            if (dr === 0 && dc === 0) {
                continue;
            }

            const r = row + dr;
            const c = col + dc;

            // Make sure we're inside the grid
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
// CALCULATE NEXT GENERATION
// ============================================================

function nextGeneration() {

    const newGrid = createEmptyGrid();

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            const neighbors = countNeighbors(r, c);

            // =================================================
            // YOUR RULE
            //
            // Exactly 2 neighbors = ALIVE
            // Anything else = DEAD
            // =================================================

            if (neighbors === 2) {
                newGrid[r][c] = 1;
            }
        }
    }

    grid = newGrid;
}


// ============================================================
// DRAW GRID
// ============================================================

function drawGrid() {

    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    const width = rect.width;
    const height = rect.height;


    // ========================================================
    // SQUARE CELLS
    // ========================================================

    const cellSize = Math.min(
        width / cols,
        height / rows
    );

    const gridWidth = cellSize * cols;
    const gridHeight = cellSize * rows;


    // Center grid
    const offsetX =
        (width - gridWidth) / 2;

    const offsetY =
        (height - gridHeight) / 2;


    // ========================================================
    // BACKGROUND
    // ========================================================

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    ctx.fillStyle = "white";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // ========================================================
    // DRAW CELLS
    // ========================================================

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            const x =
                offsetX + c * cellSize;

            const y =
                offsetY + r * cellSize;


            // ------------------------------------------------
            // ALIVE
            // ------------------------------------------------

            if (grid[r][c] === 1) {

                ctx.fillStyle = "black";
            }


            // ------------------------------------------------
            // DEAD
            // ------------------------------------------------

            else {

                let justDied = false;

                /*
                 * history contains the previous generations.
                 *
                 * The most recent generation is:
                 *
                 * history[history.length - 1]
                 */

                if (history.length > 0) {

                    const previousGrid =
                        history[history.length - 1];

                    if (previousGrid[r][c] === 1) {

                        justDied = true;
                    }
                }


                // Just died
                if (justDied) {

                    ctx.fillStyle = "#b0b0b0";
                }

                // Already dead
                else {

                    ctx.fillStyle = "white";
                }
            }


            // Draw square
            ctx.fillRect(
                x,
                y,
                cellSize,
                cellSize
            );
        }
    }


    // ========================================================
    // GRID LINES
    // ========================================================

    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;


    // Horizontal lines

    for (let r = 0; r <= rows; r++) {

        const y =
            offsetY + r * cellSize;

        ctx.beginPath();

        ctx.moveTo(
            offsetX,
            y
        );

        ctx.lineTo(
            offsetX + gridWidth,
            y
        );

        ctx.stroke();
    }


    // Vertical lines

    for (let c = 0; c <= cols; c++) {

        const x =
            offsetX + c * cellSize;

        ctx.beginPath();

        ctx.moveTo(
            x,
            offsetY
        );

        ctx.lineTo(
            x,
            offsetY + gridHeight
        );

        ctx.stroke();
    }


    // Update information
    updateStatus();
}


// ============================================================
// UPDATE STATUS
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
// NEW RANDOM GRID
// ============================================================

function newRandomGrid() {

    pause();


    rows = Math.max(
        1,
        parseInt(rowsInput.value) || 20
    );

    cols = Math.max(
        1,
        parseInt(colsInput.value) || 30
    );

    maxSteps = Math.max(
        0,
        parseInt(stepsInput.value) || 100
    );


    // Generate random grid
    grid = createRandomGrid();


    // Save starting grid
    startingGrid = copyGrid(grid);


    // Clear history
    history = [];


    // Reset generation
    generation = 0;


    drawGrid();
}


// ============================================================
// CLEAR
// ============================================================

function clearGrid() {

    pause();

    grid = createEmptyGrid();

    history = [];

    generation = 0;

    drawGrid();
}


// ============================================================
// RESET
// ============================================================

function reset() {

    pause();

    // Restore original starting grid
    grid = copyGrid(startingGrid);

    history = [];

    generation = 0;

    drawGrid();
}


// ============================================================
// STEP FORWARD
// ============================================================

function stepForward() {

    if (generation >= maxSteps) {

        pause();

        return;
    }


    // Save current generation
    history.push(
        copyGrid(grid)
    );


    // Calculate next generation
    nextGeneration();


    generation++;


    drawGrid();
}


// ============================================================
// STEP BACKWARD
// ============================================================

function stepBackward() {

    pause();


    // Nothing to go back to
    if (history.length === 0) {

        return;
    }


    // Restore previous generation
    grid = history.pop();


    generation--;


    drawGrid();
}


// ============================================================
// START
// ============================================================

function start() {

    if (running) {

        return;
    }

    running = true;

    runSimulation();
}


// ============================================================
// RUN SIMULATION
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
// PAUSE
// ============================================================

function pause() {

    running = false;


    if (animationId !== null) {

        clearTimeout(animationId);

        animationId = null;
    }
}


// ============================================================
// CLICK CELLS
// ============================================================

canvas.addEventListener(
    "click",
    function(event) {

        const rect =
            canvas.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;


        // Same square cell calculation
        const cellSize = Math.min(
            width / cols,
            height / rows
        );


        // Size of grid
        const gridWidth =
            cellSize * cols;

        const gridHeight =
            cellSize * rows;


        // Centered grid
        const offsetX =
            (width - gridWidth) / 2;

        const offsetY =
            (height - gridHeight) / 2;


        // Mouse position
        const mouseX =
            event.clientX - rect.left;

        const mouseY =
            event.clientY - rect.top;


        // Ignore clicks outside grid
        if (
            mouseX < offsetX ||
            mouseX >= offsetX + gridWidth ||
            mouseY < offsetY ||
            mouseY >= offsetY + gridHeight
        ) {

            return;
        }


        // Determine cell
        const col = Math.floor(
            (mouseX - offsetX) / cellSize
        );

        const row = Math.floor(
            (mouseY - offsetY) / cellSize
        );


        if (
            row >= 0 &&
            row < rows &&
            col >= 0 &&
            col < cols
        ) {

            grid[row][col] =
                grid[row][col] === 1
                    ? 0
                    : 1;


            drawGrid();
        }
    }
);


// ============================================================
// BUTTONS
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
// KEYBOARD CONTROLS
// ============================================================

document.addEventListener(
    "keydown",
    function(event) {

        // Space = Start/Pause
        if (event.code === "Space") {

            event.preventDefault();

            if (running) {

                pause();

            } else {

                start();
            }
        }


        // Right Arrow = Forward
        if (event.key === "ArrowRight") {

            event.preventDefault();

            stepForward();
        }


        // Left Arrow = Back
        if (event.key === "ArrowLeft") {

            event.preventDefault();

            stepBackward();
        }
    }
);


// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
    "resize",
    drawGrid
);


// ============================================================
// START APPLICATION
// ============================================================

newRandomGrid();
