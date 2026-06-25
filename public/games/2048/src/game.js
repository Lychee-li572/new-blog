const BOARD_SIZE = 4;

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function boardsAreEqual(left, right) {
  return left.every((row, rowIndex) =>
    row.every((value, colIndex) => value === right[rowIndex][colIndex])
  );
}

function getEmptyCells(board) {
  const cells = [];

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
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

  while (merged.length < row.length) {
    merged.push(0);
  }

  return { row: merged, scoreGain };
}

function reverseRows(board) {
  return board.map((row) => [...row].reverse());
}

function transpose(board) {
  return board[0].map((_, colIndex) => board.map((row) => row[colIndex]));
}

function moveBoardLeft(board) {
  const nextBoard = board.map((row) => mergeRowLeft(row));
  const mergedBoard = nextBoard.map((entry) => entry.row);

  return {
    board: mergedBoard,
    scoreGain: nextBoard.reduce((sum, entry) => sum + entry.scoreGain, 0),
    moved: !boardsAreEqual(board, mergedBoard),
  };
}

export function moveLeft(board) {
  return moveBoardLeft(cloneBoard(board));
}

export function moveRight(board) {
  const reversed = reverseRows(cloneBoard(board));
  const moved = moveBoardLeft(reversed);

  return {
    board: reverseRows(moved.board),
    scoreGain: moved.scoreGain,
    moved: moved.moved,
  };
}

export function moveUp(board) {
  const transposed = transpose(cloneBoard(board));
  const moved = moveBoardLeft(transposed);

  return {
    board: transpose(moved.board),
    scoreGain: moved.scoreGain,
    moved: moved.moved,
  };
}

export function moveDown(board) {
  const transposed = transpose(cloneBoard(board));
  const reversed = reverseRows(transposed);
  const moved = moveBoardLeft(reversed);

  return {
    board: transpose(reverseRows(moved.board)),
    scoreGain: moved.scoreGain,
    moved: moved.moved,
  };
}

export function addRandomTile(board, random = Math.random) {
  const nextBoard = cloneBoard(board);
  const emptyCells = getEmptyCells(nextBoard);

  if (emptyCells.length === 0) {
    return nextBoard;
  }

  const index = Math.floor(random() * emptyCells.length);
  const { row, col } = emptyCells[index];
  nextBoard[row][col] = random() < 0.9 ? 2 : 4;

  return nextBoard;
}

export function createInitialState(random = Math.random) {
  let board = createEmptyBoard();
  board = addRandomTile(board, random);
  board = addRandomTile(board, random);

  return {
    board,
    score: 0,
    gameOver: false,
  };
}

export function applyMove(board, direction) {
  const handlers = {
    left: moveLeft,
    right: moveRight,
    up: moveUp,
    down: moveDown,
  };

  const move = handlers[direction];
  if (!move) {
    return {
      board: cloneBoard(board),
      scoreGain: 0,
      moved: false,
    };
  }

  return move(board);
}

export function isGameOver(board) {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const value = board[row][col];

      if (value === 0) {
        return false;
      }

      if (board[row][col + 1] === value || board[row + 1]?.[col] === value) {
        return false;
      }
    }
  }

  return true;
}
