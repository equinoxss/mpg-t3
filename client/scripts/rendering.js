var viewModel = {
  allowance: 10
};
var gameCanvas = document.querySelector('#game-layer'),
    gameContext = gameCanvas.getContext("2d"),
    uiCanvas = document.querySelector('#ui-layer'),
    uiContext = gameCanvas.getContext("2d"),
    pieces = {};

function initRendering() {
  pieces.X = new Image(); pieces.X.src = "images/X.png";
  pieces.O = new Image(); pieces.O.src = "images/O.png";
  pieces.C = new Image(); pieces.C.src = "images/C.png";
}

function setCanvasSize() {
  gameCanvas.width = uiCanvas.width = window.innerWidth;
  gameCanvas.height = uiCanvas.height = window.innerHeight;
};

function setBoardSize(players) {
  viewModel.players = players;
  viewModel.rows = 3 + players;
  viewModel.cols = 3 + players;
  calcGrid(true);
  eraseCanvas();

  viewModel.playables = [];
  for (var r = 1; r < viewModel.grid.length - 1; r++) {
    for (var c = 0; c <= model.playerCount; c++) {
      viewModel.playables.push(viewModel.grid[r][c]);
    }
  }

}

function calcGrid(force) {
  viewModel.width = gameCanvas.clientWidth;
  viewModel.height = gameCanvas.clientHeight;

  viewModel.cellSize = Math.min(Math.floor(viewModel.width / viewModel.cols), Math.floor(viewModel.height / viewModel.rows)) - viewModel.allowance;

  viewModel.topLeft = {
    x: (viewModel.width - (viewModel.cellSize * viewModel.cols)) / 2,
    y: (viewModel.height - (viewModel.cellSize * viewModel.rows)) / 2,
  };

  force = force || false;
  if (viewModel.grid && !force) {
    for (var r = 0; r < viewModel.rows; r++) {
      for (var c = 0; c < viewModel.cols; c++) {
        var x = viewModel.topLeft.x + (c * viewModel.cellSize),
            y = viewModel.topLeft.y + (r * viewModel.cellSize);
        cell = viewModel.grid[r][c];
        cell.x = x;
        cell.y = y;
        cell.box = new Rectangle(x, y, x + viewModel.cellSize, y + viewModel.cellSize);
      }
    }
  } else {
    viewModel.grid = [];
    for (var r = 0; r < viewModel.rows; r++) {
      viewModel.grid.push([]);
      for (var c = 0; c < viewModel.cols; c++) {
        var x = viewModel.topLeft.x + (c * viewModel.cellSize),
            y = viewModel.topLeft.y + (r * viewModel.cellSize);
        viewModel.grid[r].push({
          x: x, 
          y: y,
          box: new Rectangle(x, y, x + viewModel.cellSize, y + viewModel.cellSize)
        });
      }
    }

  }

};

function clickToCell(event) {
  for (var i=0;i<viewModel.playables.length;i++) {
    if (viewModel.playables[i].box.contains(event.x, event.y)) {
      return i;
    }
  }
  return null;
}

function drawPiece(sym, cell) {
  if (sym == "" || sym == " ") { return; }

  try {
    // var box = cell.box.clone();
    // box.inset(viewModel.cellSize * .2, viewModel.cellSize * .2);
    // gameContext.drawImage(pieces[sym], box.x, box.y, box.width(), box.width());
    // return;

    gameContext.save();
    gameContext.lineWidth = 12;
    gameContext.strokeStyle = "black";

    var r = cell.box.clone();
    r.inset(viewModel.cellSize * .2, viewModel.cellSize * .2);

    if (sym == "X") {
      gameContext.beginPath();
      gameContext.moveTo(r.x, r.y);
      gameContext.lineTo(r.x2, r.y2);
      gameContext.moveTo(r.x, r.y2);
      gameContext.lineTo(r.x2, r.y);
      gameContext.closePath();
      gameContext.stroke();
    } else if (sym == "O") {
      radius = r.width() / 2;

      gameContext.beginPath();
      gameContext.arc(r.x+radius,r.y+radius,radius,0,2*Math.PI);
      gameContext.closePath();
      gameContext.stroke();

    } else if (sym == "@") {
      r.outset(viewModel.cellSize * .05, viewModel.cellSize * .05)
      half = r.width() / 2;
      gameContext.beginPath();
      gameContext.moveTo(r.x+half, r.y);
      gameContext.lineTo(r.x+half, r.y2);
      gameContext.moveTo(r.x, r.y+half);
      gameContext.lineTo(r.x2, r.y+half);
      gameContext.closePath();
      gameContext.stroke();

      r.inset(10,10);
      radius = r.width() / 2;
      gameContext.beginPath();
      gameContext.arc(r.x+radius,r.y+radius,radius,0,2*Math.PI);
      gameContext.closePath();
      gameContext.stroke();
    } else if (sym == "*") {
      r.inset(viewModel.cellSize * .05, viewModel.cellSize * .05);
      gameContext.globalCompositeOperation = "xor";
      gameContext.beginPath();
      gameContext.moveTo(r.x, r.y);
      gameContext.lineTo(r.x2, r.y);
      gameContext.lineTo(r.x2, r.y2);
      gameContext.lineTo(r.x, r.y2);
      gameContext.lineTo(r.x, r.y);
      gameContext.lineTo(r.x2, r.y);
      gameContext.stroke();
      gameContext.closePath();

      gameContext.beginPath();
      gameContext.moveTo(r.x, r.y);
      gameContext.lineTo(r.x2, r.y2);
      gameContext.moveTo(r.x, r.y2);
      gameContext.lineTo(r.x2, r.y);
      gameContext.stroke();
      gameContext.closePath();
    }
  } catch (e) {
    // ignore
  }

  gameContext.restore();
};

function renderCell(cell) {
  gameContext.save();
  gameContext.clearRect(cell.x, cell.y, viewModel.cellSize, viewModel.cellSize);
  if (cell.status) {
    if (cell.status == "bad") gameContext.fillStyle = "red";
    else if (cell.status == "win") gameContext.fillStyle = "green";
    gameContext.fillRect(cell.x, cell.y, viewModel.cellSize, viewModel.cellSize);
  }
  gameContext.lineWidth = 5;
  gameContext.lineCap = "round";
  gameContext.strokeStyle = "black";
  gameContext.strokeRect(cell.x, cell.y, viewModel.cellSize, viewModel.cellSize);
  gameContext.restore();

  drawPiece(cell.symbol, cell);
}

function renderFrame() {
  gameContext.save();
  gameContext.globalAlpha = 0.1;
  gameContext.fillStyle = "black";
  gameContext.clearRect(viewModel.grid[0][viewModel.cols-1].x, viewModel.grid[0][viewModel.cols-1].y, viewModel.cellSize, viewModel.cellSize * viewModel.rows);
  gameContext.fillRect(viewModel.grid[0][viewModel.cols-1].x, viewModel.grid[0][viewModel.cols-1].y, viewModel.cellSize, viewModel.cellSize * viewModel.rows);
  gameContext.restore();

  for (var i=0;i<viewModel.playables.length;i++) {
    renderCell(viewModel.playables[i]);    
  }
};

function renderTrays() {
  if (model.trays == null) { return; }
  for (var r = 0; r < model.trays[model.playerNumber-1].length; r++) {
    drawPiece(model.trays[model.playerNumber-1][r] || "", viewModel.grid[r][viewModel.cols-1]);
  };
};

function renderBoard() {
  if (model.viewModel == null) { return; }
  for (var i=0;i<viewModel.playables.length;i++) {
    renderCell(viewModel.playables[i]);
  }
};

function eraseCanvas() {
  gameContext.clearRect(0,0,gameCanvas.width,gameCanvas.height);
}

function renderCanvas() {
  eraseCanvas();
  renderFrame();
  renderTrays();
  renderBoard();
};

function highlightCell(index, status, duration) {
  viewModel.playables[index].status = status;
  renderBoard();
  if (duration) {
    clearHighlight = function() {
      viewModel.playables[index].status = null;
      renderBoard();
    }
    setTimeout(clearHighlight, duration);
  }
}

window.addEventListener('resize', function (event) {
  setCanvasSize();
  calcGrid();
  renderCanvas();
})

initRendering();
setCanvasSize();
setBoardSize(2);
renderCanvas();

