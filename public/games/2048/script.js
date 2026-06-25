(function () {
  const BOARD_SIZE = 4;
  const KEYBOARD_DIRECTION_MAP = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };

  const boardElement = document.querySelector("#board");
  const scoreElement = document.querySelector("#score");
  const finalScoreElement = document.querySelector("#final-score");
  const restartButton = document.querySelector("#restart-button");
  const modalRestartButton = document.querySelector("#modal-restart-button");
  const modalElement = document.querySelector("#game-over-modal");
  const touchControlsElement = document.querySelector("#touch-controls");
  const tileElements = [];
  const mobileControls = window.Mobile2048Controls;

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
  }

  function boardsAreEqual(left, right) {
    return left.every((row, rowIndex) =>
      row.every((value, colIndex) => value === right[rowIndex][colIndex])
    );
  }

  function getEmptyCells(board) {
    const cells = [];

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (board[row][col] === 0) {
          cells.push({ row, col });
        }
      }
    }

    return cells;
  }

  function mergeRowLeft(row) {
    const values = row.filter((value) => value !== 0);
    const merged = [];
    let scoreGain = 0;

    for (let index = 0; index < values.length; index += 1) {
      if (values[index] === values[index + 1]) {
        const mergedValue = values[index] * 2;
        merged.push(mergedValue);
        scoreGain += mergedValue;
        index += 1;
      } else {
        merged.push(values[index]);
      }
    }

    while (merged.length < BOARD_SIZE) {
      merged.push(0);
    }

    return { row: merged, scoreGain };
  }

  function reverseRows(board) {
    return board.map((row) => row.slice().reverse());
  }

  function transpose(board) {
    return board[0].map((_, colIndex) => board.map((row) => row[colIndex]));
  }

  function moveBoardLeft(board) {
    const movedRows = board.map((row) => mergeRowLeft(row));
    const nextBoard = movedRows.map((entry) => entry.row);

    return {
      board: nextBoard,
      scoreGain: movedRows.reduce((sum, entry) => sum + entry.scoreGain, 0),
      moved: !boardsAreEqual(board, nextBoard),
    };
  }

  function applyMove(board, direction) {
    if (direction === "left") {
      return moveBoardLeft(cloneBoard(board));
    }

    if (direction === "right") {
      const reversed = reverseRows(cloneBoard(board));
      const moved = moveBoardLeft(reversed);
      return {
        board: reverseRows(moved.board),
        scoreGain: moved.scoreGain,
        moved: moved.moved,
      };
    }

    if (direction === "up") {
      const transposed = transpose(cloneBoard(board));
      const moved = moveBoardLeft(transposed);
      return {
        board: transpose(moved.board),
        scoreGain: moved.scoreGain,
        moved: moved.moved,
      };
    }

    if (direction === "down") {
      const transposed = transpose(cloneBoard(board));
      const reversed = reverseRows(transposed);
      const moved = moveBoardLeft(reversed);
      return {
        board: transpose(reverseRows(moved.board)),
        scoreGain: moved.scoreGain,
        moved: moved.moved,
      };
    }

    return {
      board: cloneBoard(board),
      scoreGain: 0,
      moved: false,
    };
  }

  function addRandomTile(board) {
    const nextBoard = cloneBoard(board);
    const emptyCells = getEmptyCells(nextBoard);

    if (emptyCells.length === 0) {
      return nextBoard;
    }

    const index = Math.floor(Math.random() * emptyCells.length);
    const cell = emptyCells[index];
    nextBoard[cell.row][cell.col] = Math.random() < 0.9 ? 2 : 4;

    return nextBoard;
  }

  function isGameOver(board) {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const value = board[row][col];

        if (value === 0) {
          return false;
        }

        if (board[row][col + 1] === value || (board[row + 1] && board[row + 1][col] === value)) {
          return false;
        }
      }
    }

    return true;
  }

  function createInitialState() {
    let board = createEmptyBoard();
    board = addRandomTile(board);
    board = addRandomTile(board);

    return {
      board,
      score: 0,
      gameOver: false,
    };
  }

  function getTileClassName(value) {
    if (value === 0) {
      return "tile tile-empty";
    }

    if (value > 2048) {
      return "tile tile-super";
    }

    return "tile tile-" + value;
  }

  let state = createInitialState();
  let animationLock = false;
  let pendingBoardAnimationFrame = null;
  let touchStartPoint = null;

  function initializeBoard() {
    boardElement.innerHTML = "";

    for (let index = 0; index < BOARD_SIZE * BOARD_SIZE; index += 1) {
      const tile = document.createElement("div");
      tile.className = "tile tile-empty";
      boardElement.appendChild(tile);
      tileElements.push(tile);
    }
  }

  function animateBoard(direction) {
    boardElement.classList.remove(
      "board-moving-left",
      "board-moving-right",
      "board-moving-up",
      "board-moving-down"
    );

    if (pendingBoardAnimationFrame !== null) {
      cancelAnimationFrame(pendingBoardAnimationFrame);
    }

    pendingBoardAnimationFrame = requestAnimationFrame(function () {
      boardElement.classList.add("board-moving-" + direction);
      window.setTimeout(function () {
        boardElement.classList.remove("board-moving-" + direction);
      }, 140);
    });
  }

  function syncTouchControlsVisibility() {
    if (!mobileControls) {
      touchControlsElement.classList.add("hidden");
      return;
    }

    const coarseQuery = window.matchMedia ? window.matchMedia("(any-pointer: coarse)") : null;
    const visible = mobileControls.shouldShowTouchControls({
      maxTouchPoints: navigator.maxTouchPoints || 0,
      anyPointerCoarse: coarseQuery ? coarseQuery.matches : false,
    });

    touchControlsElement.classList.toggle("hidden", !visible);
  }

  function renderBoard(previousBoard) {
    state.board.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const tileIndex = rowIndex * BOARD_SIZE + colIndex;
        const tile = tileElements[tileIndex];
        const previousValue = previousBoard ? previousBoard[rowIndex][colIndex] : null;

        tile.className = getTileClassName(value);
        tile.textContent = value === 0 ? "" : String(value);

        if (previousBoard && previousValue !== value && value !== 0) {
          tile.classList.add("tile-updated");
          window.setTimeout(function () {
            tile.classList.remove("tile-updated");
          }, 180);
        }
      });
    });
  }

  function renderScore() {
    scoreElement.textContent = String(state.score);
  }

  function showGameOver() {
    finalScoreElement.textContent = String(state.score);
    modalElement.classList.remove("hidden");

    try {
      window.parent.postMessage({ type: "game_over", gameSlug: "2048", score: state.score }, "*");
    } catch (_) {}
  }

  function hideGameOver() {
    modalElement.classList.add("hidden");
  }

  function render(previousBoard) {
    renderBoard(previousBoard);
    renderScore();
  }

  function restartGame() {
    state = createInitialState();
    hideGameOver();
    animationLock = false;
    render();
  }

  function handleMove(direction) {
    if (state.gameOver || animationLock) {
      return;
    }

    const previousBoard = cloneBoard(state.board);
    const result = applyMove(state.board, direction);
    if (!result.moved) {
      return;
    }

    const nextBoard = addRandomTile(result.board);
    const nextScore = state.score + result.scoreGain;
    const gameOver = isGameOver(nextBoard);

    state = {
      board: nextBoard,
      score: nextScore,
      gameOver,
    };

    if (gameOver) {
      showGameOver();
    }

    animationLock = true;
    animateBoard(direction);
    render(previousBoard);
    window.setTimeout(function () {
      animationLock = false;
    }, 140);
  }

  document.addEventListener("keydown", function (event) {
    const direction = KEYBOARD_DIRECTION_MAP[event.key];
    if (!direction || !modalElement.classList.contains("hidden")) {
      return;
    }

    event.preventDefault();
    handleMove(direction);
  });

  boardElement.addEventListener("touchstart", function (event) {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    touchStartPoint = {
      startX: touch.clientX,
      startY: touch.clientY,
    };
  }, { passive: true });

  boardElement.addEventListener("touchend", function (event) {
    if (!touchStartPoint || !mobileControls) {
      touchStartPoint = null;
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      touchStartPoint = null;
      return;
    }

    const direction = mobileControls.getSwipeDirection({
      startX: touchStartPoint.startX,
      startY: touchStartPoint.startY,
      endX: touch.clientX,
      endY: touch.clientY,
      threshold: 24,
    });

    touchStartPoint = null;

    if (!direction) {
      return;
    }

    event.preventDefault();
    handleMove(direction);
  });

  touchControlsElement.addEventListener("click", function (event) {
    const button = event.target.closest("[data-direction]");
    if (!button) {
      return;
    }

    handleMove(button.getAttribute("data-direction"));
  });

  restartButton.addEventListener("click", restartGame);
  modalRestartButton.addEventListener("click", restartGame);

  initializeBoard();
  syncTouchControlsVisibility();
  render();
})();
