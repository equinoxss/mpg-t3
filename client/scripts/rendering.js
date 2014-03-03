var board = {
  allowance: 10
};
var canvas = document.querySelector('#canvas');
var context = canvas.getContext("2d")
var pieces = {};

function initRendering() {
  pieces.X = new Image(); pieces.X.src = "images/X.png";
  pieces.O = new Image(); pieces.O.src = "images/O.png";
  pieces.C = new Image(); pieces.C.src = "images/C.png";
}

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

function setBoardSize(players) {
  board.players = players;
  board.rows = 3 + players;
  board.cols = 5 + players;
}

function calcGrid() {
  board.width = canvas.clientWidth;
  board.height = canvas.clientHeight;

  board.cellSize = Math.min(Math.floor(board.width / board.cols), Math.floor(board.height / board.rows)) - board.allowance;

  board.topLeft = {
    x: (board.width - (board.cellSize * board.cols)) / 2,
    y: (board.height - (board.cellSize * board.rows)) / 2,
  }

  board.grid = [];
  for (var r = 0; r < board.rows; r++) {
    board.grid.push([]);
    for (var c = 0; c < board.cols; c++) {
      var x = board.topLeft.x + (c * board.cellSize),
          y = board.topLeft.y + (r * board.cellSize);
      board.grid[r].push({
        x: x, 
        y: y,
        box: new Rectangle(x, y, x + board.cellSize, y + board.cellSize)
      });
    }
  }

  console.log(board);
};

function renderFrame() {
  context.save();
  context.globalAlpha = 0.1;
  context.fillStyle = "black";
  context.clearRect(board.grid[0][0].x, board.grid[0][0].y, board.cellSize, board.cellSize * board.rows);
  context.fillRect(board.grid[0][0].x, board.grid[0][0].y, board.cellSize, board.cellSize * board.rows);
  context.clearRect(board.grid[0][6].x, board.grid[0][6].y, board.cellSize, board.cellSize * board.rows);
  context.fillRect(board.grid[0][6].x, board.grid[0][6].y, board.cellSize, board.cellSize * board.rows);
  context.restore();

  context.save();
  context.lineWidth = 5;
  context.lineCap = "round";
  context.strokeStyle = "black";

  for (var r = 1; r < board.grid.length - 1; r++) {
    for (var c = 2; c < board.grid.length; c++) {
      context.strokeRect(board.grid[r][c].x, board.grid[r][c].y, board.cellSize, board.cellSize);
    }
  }

  context.restore();
};

function drawPiece(sym, r, c) {
  if (sym == "") { return; }

  try {
    var box = board.grid[r][c].box.clone();
    box.inset(board.cellSize * .2, board.cellSize * .2);
    context.drawImage(pieces[sym], box.x, box.y, box.width(), box.width());
    return;

    if (sym == "X") {
      // r = board.grid[r][c].box;
      // r.inset(board.cellSize * .2, board.cellSize * .2);
      // context.beginPath();
      // context.moveTo(r.x, r.y);
      // context.lineTo(r.x2, r.y2);
      // context.moveTo(r.x, r.y2);
      // context.lineTo(r.x2, r.y);
      // context.closePath();
      // context.stroke();
    } else if (sym == "O") {
      r = board.grid[r][c].box;
      r.inset(board.cellSize * .2, board.cellSize * .2);

    } else if (sym == "+") {
      
    } else if (sym == "-") {
      
    }
  } catch (e) {
    // ignore
  }
};

function renderTrays() {
  if (model.trays == null) { return; }
  for (var r = 0; r < tray1.length; r++) {
    drawPiece(model.trays[0][r] || "", r, 0);
  };
  for (var r = 0; r < tray1.length; r++) {
    drawPiece(model.trays[1][r] || "", r, 6);
  };
};

function renderBoard() {
  if (model.board == null) { return; }
  for (var i = 0; i < cells.length; i++) {
    var r = Math.floor(i / (board.players + 1)),
        c = i % (board.players + 1);
    drawPiece(model.board[i], r + 1, c + 2);
  }  
};

function renderCanvas() {
  renderFrame();
  renderTrays();

  context.save();
  context.lineWidth = 3.5;
  context.strokeStyle = "black";
  renderBoard();
  context.restore();

};

window.addEventListener('resize', function (event) {
  setCanvasSize();
  calcGrid();
  renderGame();
})

initRendering();
setCanvasSize();
setBoardSize(2);
calcGrid();
renderCanvas();

