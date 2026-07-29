"use strict";

(() => {
  const SIZE = 5;
  const levels = window.INERTIA_LEVELS;

  const board = document.getElementById("board");
  const levelTitle = document.getElementById("level-title");
  const lesson = document.getElementById("lesson");
  const levelNumber = document.getElementById("level-number");
  const moveCount = document.getElementById("move-count");
  const parCount = document.getElementById("par-count");
  const message = document.getElementById("message");
  const undoButton = document.getElementById("undo");
  const restartButton = document.getElementById("restart");
  const nextButton = document.getElementById("next-level");
  const winPanel = document.getElementById("win-panel");
  const finalMoves = document.getElementById("final-moves");
  const scoreMessage = document.getElementById("score-message");

  let levelIndex = 0;
  let level;
  let pieces = [];
  let walls = new Set();
  let goals = [];
  let history = [];
  let moves = 0;
  let solved = false;
  let locked = false;

  const directionMap = {
    U: [-1,0],
    D: [1,0],
    L: [0,-1],
    R: [0,1]
  };

  const positionKey = (r,c) => `${r},${c}`;
  const clonePieces = list => list.map(piece => ({...piece}));

  function loadLevel(index) {
    levelIndex = index;
    level = levels[index];
    pieces = clonePieces(level.pieces);
    walls = new Set(level.walls.map(([r,c]) => positionKey(r,c)));
    goals = level.goals.map(([r,c]) => ({r,c}));
    history = [];
    moves = 0;
    solved = false;
    locked = false;
    winPanel.hidden = true;

    levelTitle.textContent = level.title;
    lesson.textContent = level.lesson;
    levelNumber.textContent = `${index + 1}/${levels.length}`;
    parCount.textContent = String(level.par);
    message.textContent = index === 0
      ? "Tap right to slide the cube onto the goal."
      : "Land every cube on a gold goal.";

    buildBoard();
    renderPieces(false);
    updateControls();
  }

  function buildBoard() {
    board.innerHTML = "";

    const floor = document.createElement("div");
    floor.className = "floor-grid";

    for (let r=0; r<SIZE; r++) {
      for (let c=0; c<SIZE; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        if (walls.has(positionKey(r,c))) cell.classList.add("wall");

        if (goals.some(goal => goal.r === r && goal.c === c)) {
          const goal = document.createElement("div");
          goal.className = "goal";
          cell.appendChild(goal);
        }
        floor.appendChild(cell);
      }
    }

    const layer = document.createElement("div");
    layer.className = "piece-layer";
    layer.id = "piece-layer";

    board.append(floor, layer);
  }

  function piecePosition(r,c) {
    const gap = 7;
    return {
      left: `calc(${c} * ((100% - ${4 * gap}px) / 5 + ${gap}px))`,
      top: `calc(${r} * ((100% - ${4 * gap}px) / 5 + ${gap}px))`
    };
  }

  function renderPieces(animate = true) {
    const layer = document.getElementById("piece-layer");

    for (const piece of pieces) {
      let element = layer.querySelector(`[data-piece-id="${piece.id}"]`);

      if (!element) {
        element = document.createElement("div");
        element.className = `piece ${piece.color}`;
        element.dataset.pieceId = piece.id;
        element.innerHTML = '<div class="cube"></div>';
        if (!animate) element.style.transition = "none";
        layer.appendChild(element);
      }

      const pos = piecePosition(piece.r,piece.c);
      element.style.left = pos.left;
      element.style.top = pos.top;

      if (!animate) {
        requestAnimationFrame(() => { element.style.transition = ""; });
      }
    }

    moveCount.textContent = String(moves);
  }

  function sortPieces(direction, list) {
    return [...list].sort((a,b) => {
      if (direction === "U") return a.r - b.r;
      if (direction === "D") return b.r - a.r;
      if (direction === "L") return a.c - b.c;
      return b.c - a.c;
    });
  }

  function calculateMove(direction) {
    const [dr,dc] = directionMap[direction];
    const next = clonePieces(pieces);
    const order = sortPieces(direction,next);
    const occupied = new Set(next.map(p => positionKey(p.r,p.c)));

    for (const piece of order) {
      occupied.delete(positionKey(piece.r,piece.c));

      let r = piece.r;
      let c = piece.c;

      while (true) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
        if (walls.has(positionKey(nr,nc))) break;
        if (occupied.has(positionKey(nr,nc))) break;

        r = nr;
        c = nc;
      }

      piece.r = r;
      piece.c = c;
      occupied.add(positionKey(r,c));
    }

    return next;
  }

  function positionsMatch(a,b) {
    return a.every((piece,index) =>
      piece.r === b[index].r && piece.c === b[index].c
    );
  }

  function shiftGravity(direction) {
    if (locked || solved) return;

    const next = calculateMove(direction);

    if (positionsMatch(next,pieces)) {
      message.textContent = "Nothing can move that way.";
      return;
    }

    history.push({
      pieces: clonePieces(pieces),
      moves
    });

    pieces = next;
    moves += 1;
    locked = true;
    renderPieces(true);
    updateControls();

    window.setTimeout(() => {
      locked = false;
      updateControls();
      checkWin();
    }, 290);
  }

  function checkWin() {
    const won = pieces.every(piece =>
      goals.some(goal => goal.r === piece.r && goal.c === piece.c)
    );

    if (!won) {
      message.textContent = "Keep planning.";
      return;
    }

    solved = true;
    finalMoves.textContent = String(moves);

    if (moves < level.par) {
      scoreMessage.textContent = "You beat par.";
    } else if (moves === level.par) {
      scoreMessage.textContent = "Perfect. You matched par.";
    } else {
      scoreMessage.textContent = `${moves - level.par} move(s) over par.`;
    }

    nextButton.textContent = levelIndex === levels.length - 1
      ? "Play Again"
      : "Next Puzzle →";

    winPanel.hidden = false;
    message.textContent = "Solved.";
    updateControls();

    if (navigator.vibrate) navigator.vibrate([25,30,25,30,70]);
  }

  function undo() {
    if (!history.length || locked) return;

    const previous = history.pop();
    pieces = clonePieces(previous.pieces);
    moves = previous.moves;
    solved = false;
    winPanel.hidden = true;
    message.textContent = "Move undone.";
    renderPieces(true);
    updateControls();
  }

  function restart() {
    loadLevel(levelIndex);
  }

  function nextLevel() {
    const next = levelIndex === levels.length - 1 ? 0 : levelIndex + 1;
    loadLevel(next);
  }

  function updateControls() {
    document.querySelectorAll("[data-dir]").forEach(button => {
      button.disabled = locked || solved;
    });
    undoButton.disabled = locked || history.length === 0;
  }

  document.querySelectorAll("[data-dir]").forEach(button => {
    button.addEventListener("click", () => shiftGravity(button.dataset.dir));
  });

  undoButton.addEventListener("click", undo);
  restartButton.addEventListener("click", restart);
  nextButton.addEventListener("click", nextLevel);

  loadLevel(0);
})();
