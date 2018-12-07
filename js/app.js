const state = {
  phase: 1,
  board: [],
  passes: 0
};

const getBoardCellState = (r, c) => {
  return state.board[r][c];
};

const mutateBoardCellState = (r, c, phase) => {
  state.board[r][c] = phase;
};

const mutateSetPhaseState = phase => {
  state.phase = phase;
};

const mutateTogglePhaseState = () => {
  state.phase = state.phase === 1 ? 2 : 1;
};

const hasBoardEmptyCell = () => {
  const states = [];
  state.board.forEach(row => {
    row.forEach(state => {
      if (state === 0) {
        states.push(state);
      }
    });
  });
  return states.length > 0;
};

const appendDisc = (r, c, p) => {
  mutateBoardCellState(r, c, p);
  const cell = document.querySelector(`[data-rc="${r},${c}"]`);
  cell.setAttribute(`data-state`, p);
};

const checkRow = (r, c, d) => {
  const row = [];
  if (d) {
    for (let i = c + 1; i < 8; i += 1) {
      row.push([r, i]);
    }
  } else {
    for (let i = c - 1; i > 0; i -= 1) {
      row.push([r, i]);
    }
  }
  return row;
};

const checkColumn = (r, c, d) => {
  const column = [];
  if (d) {
    for (let i = r + 1; i < 8; i += 1) {
      column.push([i, c]);
    }
  } else {
    for (let i = r - 1; i > 0; i -= 1) {
      column.push([i, c]);
    }
  }
  return column;
};

const checkSkewRightDown = (r, c, d) => {
  const skew = [];
  if (d) {
    if (r < c) {
      for (let i = r + 1; i < 8; i += 1) {
        if (c < 7) skew.push([i, (c += 1)]);
      }
    } else {
      for (let i = c + 1; i < 8; i += 1) {
        if (r < 7) skew.push([(r += 1), i]);
      }
    }
  } else {
    if (r < c) {
      for (let i = c - 1; i > 0; i -= 1) {
        if (r > 0) skew.push([(r -= 1), i]);
      }
    } else {
      for (let i = r - 1; i > 0; i -= 1) {
        if (c > 0) skew.push([i, (c -= 1)]);
      }
    }
  }
  return skew;
};

const checkSkewRightUp = (r, c, d) => {
  const skew = [];
  if (d) {
    if (r < c) {
      for (let i = c + 1; i < 8; i += 1) {
        if (r > 0) skew.push([(r -= 1), i]);
      }
    } else {
      for (let i = r - 1; i >= 0; i -= 1) {
        if (c < 7) skew.push([i, (c += 1)]);
      }
    }
  } else {
    if (r < c) {
      for (let i = r + 1; i < 8; i += 1) {
        if (c > 0) skew.push([i, (c -= 1)]);
      }
    } else {
      for (let i = c - 1; i >= 0; i -= 1) {
        if (r < 7) skew.push([(r += 1), i]);
      }
    }
  }
  return skew;
};

const checkAroundCells = (r, c) => {
  return [
    checkRow(r, c, true),
    checkRow(r, c, false),
    checkColumn(r, c, true),
    checkColumn(r, c, false),
    checkSkewRightDown(r, c, true),
    checkSkewRightDown(r, c, false),
    checkSkewRightUp(r, c, true),
    checkSkewRightUp(r, c, false)
  ];
};

const checkPuttableCells = (r, c) => {
  const ops = state.phase === 1 ? 2 : 1;
  const cellList = checkAroundCells(r, c);
  const puttableList = cellList.map(cell => {
    const stateArray = cell.map(coord => getBoardCellState(...coord));
    const phaseIndex = stateArray.indexOf(state.phase);
    if (phaseIndex > 0) {
      return stateArray.slice(0, phaseIndex).every(state => state === ops);
    }
    return false;
  });
  return puttableList.some(s => s === true);
};

const putDisc = (r, c) => {
  const ops = state.phase === 1 ? 2 : 1;
  const cellList = checkAroundCells(r, c);
  appendDisc(r, c, state.phase);
  cellList.forEach(cell => {
    const stateArray = cell.map(coord => getBoardCellState(...coord));
    const phaseIndex = stateArray.indexOf(state.phase);
    if (
      phaseIndex > 0 &&
      stateArray.slice(0, phaseIndex).every(state => state === ops)
    ) {
      cell.slice(0, phaseIndex).forEach(coord => {
        mutateBoardCellState(...coord, state.phase);
      });
    }
  });
};

const getCellFromElement = trg => {
  return trg.dataset.rc.split(",").map(s => parseInt(s));
};

const onClickCell = e => {
  const trg = e.currentTarget;
  if (trg.dataset.state !== "0") return;
  putDisc(...getCellFromElement(trg));
  updateGameState();
};

const createBoard = () => {
  const app = document.querySelector("#app");
  let cells = "";
  for (let r = 0; r <= 7; r += 1) {
    state.board[r] = [];
    for (let c = 0; c <= 7; c += 1) {
      state.board[r][c] = 0;
      cells += `<div class="cell" data-rc="${r},${c}" data-state="0"></div>`;
    }
  }
  app.innerHTML = cells;
  app.setAttribute("data-phase", state.phase);
};

const resetBoard = () => {
  for (let r = 0; r <= 7; r += 1) {
    for (let c = 0; c <= 7; c += 1) {
      mutateBoardCellState(r, c, 0);
    }
  }
};

const countDisksOnBoard = cellState => {
  return state.board
    .map(row => row.filter(s => s === cellState).length)
    .reduce((a, b) => a + b);
};

const onClickRetry = () => {
  const app = document.querySelector("#app");
  app
    .querySelector(".game-over button")
    .removeEventListener("click", onClickRetry);
  app.removeChild(app.querySelector(".game-over"));
  initGame();
};

const gameOver = () => {
  const app = document.querySelector("#app");
  const overlay = document.createElement("div");
  overlay.classList.add("game-over");
  const black = countDisksOnBoard(1);
  const white = countDisksOnBoard(2);
  let innerContents = "<p>";
  if (black > white) {
    innerContents += "Black wins.";
  } else if (white > black) {
    innerContents += "White wins.";
  } else {
    innerContents += "Draw.";
  }
  innerContents += "</p><button>Retry</button>";
  overlay.innerHTML = innerContents;
  app.appendChild(overlay);
  overlay.querySelector("button").addEventListener("click", onClickRetry);
};

async function phasePass() {
  const app = document.querySelector("#app");
  const overlay = document.createElement("div");
  overlay.classList.add("pass");
  state.passes += 1;
  if (!hasBoardEmptyCell()) {
    state.passes += 1;
  }
  if (state.passes > 1) {
    gameOver();
    return;
  }
  overlay.innerHTML =
    "石を置ける場所がありません．<br>2秒後に手番をパスします．";
  app.appendChild(overlay);
  await new Promise(resolve => setTimeout(resolve, 2000));
  mutateTogglePhaseState();
  app.setAttribute("data-phase", state.phase);
  app.removeChild(overlay);
  updateBoard();
}

const saveStateToLocalStorage = () => {
  const setjson = JSON.stringify(state);
  localStorage.setItem("reversiState", setjson);
};

const updateBoard = () => {
  const checkedCell = [];
  Array.from(document.querySelectorAll(`.cell.puttable`)).forEach(cell => {
    cell.classList.remove("puttable");
  });
  state.board.forEach((row, ri) => {
    row.forEach((state, ci) => {
      document.querySelector(
        `.cell[data-rc="${ri},${ci}"`
      ).dataset.state = state;
      if (checkPuttableCells(ri, ci)) checkedCell.push([ri, ci]);
    });
  });

  const puttableCell = [];
  checkedCell.forEach(cell => {
    if (getBoardCellState(...cell) === 0) {
      puttableCell.push(cell);
    }
  });
  if (puttableCell.length) {
    puttableCell.forEach(coord => {
      const trg = document.querySelector(
        `.cell[data-rc="${coord[0]},${coord[1]}"`
      );
      if (trg.dataset.state === "0") {
        trg.classList.add("puttable");
      }
    });
    state.passes = 0;
  } else {
    phasePass();
  }
};

const updateGameState = () => {
  mutateTogglePhaseState();
  const app = document.querySelector("#app");
  app.setAttribute("data-phase", state.phase);
  saveStateToLocalStorage();
  updateBoard();
};

const initGame = () => {
  resetBoard();
  appendDisc(3, 3, 2);
  appendDisc(3, 4, 1);
  appendDisc(4, 3, 1);
  appendDisc(4, 4, 2);
  mutateSetPhaseState(1);
  updateBoard();
};

const resumeGame = () => {
  const resumeState = JSON.parse(localStorage.getItem("reversiState"));
  state.phase = resumeState.phase;
  state.board = resumeState.board;
  state.passes = resumeState.passes;
  const app = document.querySelector("#app");
  app.setAttribute("data-phase", state.phase);
  updateBoard();
};

window.addEventListener("DOMContentLoaded", () => {
  createBoard();
  Array.from(document.querySelectorAll(".cell")).forEach(cell => {
    cell.addEventListener("click", onClickCell);
  });
  if (
    localStorage.getItem("reversiState") !== null &&
    confirm("中断されたゲームがあります．前回の続きからゲームを再開しますか？")
  ) {
    resumeGame();
    return;
  }
  localStorage.removeItem("reversiState");
  initGame();
});
