var halfCell = null,
      titleBox = null,
      titlePos = null,
      buttonBox = null,
      codeBox = null;

function eraseTitleBackground() {
  uiContext.clearRect(titleBox.x, titleBox.y, titleBox.width(), titleBox.height());
};

function eraseButtonBackground() {
  uiContext.clearRect(buttonBox.x, buttonBox.y, buttonBox.width(), buttonBox.height());
};

function drawTitleBackground() {
  eraseTitleBackground();
  uiContext.save();
  uiContext.fillStyle = "purple";
  uiContext.globalAlpha = 0.8;
  uiContext.fillRect(titleBox.x, titleBox.y, titleBox.width(), titleBox.height());
  uiContext.restore();
};

function drawTitle() {
  uiContext.save();
  uiContext.font = (viewModel.cellSize * 0.4).toString() + "px sans-serif";
  uiContext.strokeStyle = "black";
  uiContext.fillStyle = "gold";
  uiContext.textAlign = "center";
  uiContext.fillText("Noughts & Crosses", titlePos.x, titlePos.y);
  uiContext.restore();
};

function drawButtonBackground() {
  eraseButtonBackground();
  uiContext.save();
  uiContext.fillStyle = "#C11B17";
  uiContext.globalAlpha = 0.8;
  uiContext.fillRect(buttonBox.x, buttonBox.y, buttonBox.width(), buttonBox.height());
  uiContext.restore();
};

function drawGameCode() {
  uiContext.clearRect(codeBox.x, codeBox.y, codeBox.width(), codeBox.height());
  uiContext.save();
  uiContext.fillStyle = "#C11B17";
  uiContext.globalAlpha = 0.8;
  uiContext.fillRect(codeBox.x, codeBox.y, codeBox.width(), codeBox.height());
  uiContext.strokeRect(codeBox.x, codeBox.y, codeBox.width(), codeBox.height());
  if (viewModel.enteredGameId) {
    var size = codeBox.height() * .98;
    uiContext.fillStyle = "black";
    uiContext.font = size + "px sans-serif";
    uiContext.fillText(viewModel.enteredGameId, codeBox.x + (size * .1), codeBox.y + codeBox.height() - (codeBox.height() * 0.1));
  }
  uiContext.restore();
}

function showGameStart() {

  halfCell = viewModel.cellSize / 2;
  titleBox = new Rectangle(-gameCanvas.width, viewModel.grid[0][0].y, 0, viewModel.grid[0][0].y + halfCell);
  titlePos = { x: -gameCanvas.width, y: viewModel.grid[0][0].y + viewModel.cellSize / 2.5 };
  buttonBox = new Rectangle(viewModel.grid[0][viewModel.cols-1].x - halfCell, viewModel.grid[0][0].y + halfCell,
                                viewModel.grid[0][viewModel.cols-1].x + viewModel.cellSize, viewModel.grid[0][0].y + halfCell);
  var increment = gameCanvas.width / 8,
      titleStop = gameCanvas.width / 2,
      buttonBoxStop = gameCanvas.height - viewModel.grid[0][0].y + halfCell,
      buttonInc = buttonBoxStop / 16,
      start = 0,
      stage = 1
      maxStage = 4;

  var animate = function(dt) {

    if (stage == 1) {
      if (titleBox.x != 0) {
        var distance = ((dt - start) / 1000) * increment;

        titleBox.translate(distance, 0);
        if (titleBox.x > 0) titleBox.translate(-titleBox.x, 0);

        drawTitleBackground();
      } else {
        start = dt;
        stage++;
      }

    } else if (stage == 2) {
      if (titlePos.x != titleStop && buttonBox.height() != buttonBoxStop) {
        var distance = ((dt - start) / 1000) * increment;

        titlePos.x += distance;
        if (titlePos.x > titleStop) titlePos.x = titleStop;

        distance = ((dt - start) / 1000) * buttonInc;
        buttonBox.y2 += distance;
        if (buttonBox.height() > buttonBoxStop) buttonBox.y2 = buttonBox.y + buttonBoxStop;

        drawTitleBackground();
        drawButtonBackground();
        drawTitle();
      } else {
        start = dt;
        stage++;
      }
    } else if (stage == 3) {
      var cell1 = viewModel.grid[1][viewModel.cols-1],
          cell2 = viewModel.grid[2][viewModel.cols-1],
          left = cell1.x - (halfCell/2),
          box1 = new Rectangle(left, cell1.y, left + viewModel.cellSize, cell1.y + viewModel.cellSize),
          box2 = new Rectangle(left, cell2.y, left + viewModel.cellSize, cell2.y + viewModel.cellSize),
          inset = viewModel.cellSize * .15;

      box1.inset(0, inset);
      box2.inset(0, inset);
      uiContext.save();
      uiContext.textAlign = "center";
      uiContext.font = (box1.height() * 0.25).toString() + "px sans-serif";
      uiContext.lineWidth = 3;
      // uiContext.fillStyle = "#C11B17";
      uiContext.strokeStyle = "black";
      // uiContext.fillRect(box1.x, box1.y, box1.width(), box1.height());
      uiContext.strokeRect(box1.x, box1.y, box1.width(), box1.height());
      uiContext.fillText("New Game", box1.x + (box1.width() / 2), box1.y + box1.height() * .6);
      // uiContext.fillRect(box2.x, box2.y, box2.width(), box2.height());
      uiContext.strokeRect(box2.x, box2.y, box2.width(), box2.height());
      uiContext.fillText("Join Game", box2.x + (box2.width() / 2), box2.y + box2.height() * .6);
      uiContext.restore();

      viewModel.clickables = [];
      viewModel.clickables.push({box: box1, id: "new-game"});
      viewModel.clickables.push({box: box2, id: "what-game"});

      stage++;
    }

    if (stage < maxStage) drawingSync(animate);
  }

  drawingSync(animate);
};

function howManyPlayers() {
  eraseButtonBackground();
  drawButtonBackground();

  var cell1 = viewModel.grid[1][viewModel.cols-1],
      // cell2 = viewModel.grid[2][viewModel.cols-1],
      left = cell1.x - (halfCell/2),
      box = new Rectangle(left, cell1.y, left + viewModel.cellSize, cell1.y + viewModel.cellSize),
      // box2 = new Rectangle(left, cell2.y, left + viewModel.cellSize, cell2.y + viewModel.cellSize),
      inset = viewModel.cellSize * .15;

  box.inset(0, inset);
  uiContext.save();
  uiContext.textAlign = "center";
  uiContext.font = (box.height() * 0.25).toString() + "px sans-serif";
  uiContext.lineWidth = 3;
  uiContext.strokeStyle = "black";

  viewModel.clickables = [];
  for (var i = 2; i < 5; i++) {
    uiContext.strokeRect(box.x, box.y, box.width(), box.height());
    uiContext.fillText(i + "-Player", box.x + (box.width() / 2), box.y + box.height() * .6);
    viewModel.clickables.push({box: box.clone(), id: i + "p-game"});
    box.translate(0, viewModel.cellSize);
  }

  uiContext.restore();
}

function joinWhichGame() {
  eraseButtonBackground();
  drawButtonBackground();

  viewModel.enteredGameId = "";
  viewModel.clickables = [];

  for (var i=0;i<viewModel.playables.length;i++) {
    viewModel.playables[i].symbol = "ABCDEDFGH"[i];
    renderCell(viewModel.playables[i]);
    viewModel.clickables.push({box: viewModel.playables[i].box, id: "click-letter"});    
  }

  var fontSize = (viewModel.cellSize * 0.2),
      topLeft = { x: viewModel.grid[1][viewModel.cols-1].x - (viewModel.cellSize / 3),
                  y: viewModel.grid[1][viewModel.cols-1].y + fontSize * 1.1};

  uiContext.font = fontSize + "px sans-serif";
  uiContext.fillText("Join A Game", topLeft.x, topLeft.y);

  topLeft.y += 2*fontSize;
  uiContext.font = (viewModel.cellSize * 0.12) + "px sans-serif";
  uiContext.fillText("Enter a game code", topLeft.x, topLeft.y);

  codeBox = new Rectangle(topLeft.x, topLeft.y + fontSize, topLeft.x + (viewModel.cellSize * 1.17) , topLeft.y + (2 * fontSize * 1.15));
  drawGameCode();
}

function clickLetter(event) {
  if (viewModel.clickables) {
    if (viewModel.enteredGameId.length == 6) return;
    for (var i=0;i<viewModel.clickables.length;i++) {
      if (viewModel.clickables[i].box.contains(event.x, event.y)) {
        viewModel.enteredGameId += viewModel.playables[i].symbol;
        break;
      }
    }
  }
  drawGameCode();
}

function clickToButton() {
  if (viewModel.clickables) {
    for (var i=0;i<viewModel.clickables.length;i++) {
      if (viewModel.clickables[i].box.contains(event.x, event.y)) {
        return viewModel.clickables[i].id;
      }
    }
  }
  return null;
}
