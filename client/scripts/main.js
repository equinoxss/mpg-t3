// Page templates
var pages = {
  connecting: _.template(document.querySelector('#template-connecting').innerHTML, null, { variable: 'data' }),
  joinGame: _.template(document.querySelector('#template-join-game').innerHTML, null, { variable: 'data' }),
  waiting: _.template(document.querySelector('#template-waiting').innerHTML, null, { variable: 'data' }),
  results: _.template(document.querySelector('#template-results').innerHTML, null, { variable: 'data' })
};

var dialogEl = document.querySelector('#dialog');
function showDialog(name, data) {
  render = pages[name];
  text = render(data);
  requestAnimationFrame(function () {
    dialogEl.style.display = "block";
    dialogEl.querySelector('#content').innerHTML = text;
  });
};

function hideDialog() {
  dialogEl.style.display = "none";
};

var clickMap = {
  'new-game' : function(event) { joinGame(); },
  'join-game' : function(event) { joinGame(document.querySelector('#game-id').value || " "); },
  'another-game' : function(event) { gameServer.send('reset-game'); }
}

document.addEventListener('click', function (event) {
  if (event.target) {
    var id = event.target.id;
    if (clickMap[id]) {
      clickMap[id](event);
    } else if (event.target.className == "cell") {
      gameServer.send('place-piece', {location: event.target.dataset.idx}, function(){})
    } else if (state == 'playing') {
      var idx = clickToCell(event);
      if (idx !== null) {
        gameServer.send('place-piece', {location: idx}, function(){})
      }
    }
  }
});

// Show initial connecting page
showDialog('connecting');

// Connection object to Masamune server
// var host = 'http://localhost:9999/masamune'
// var host = 'http://salty-escarpment-4501.herokuapp.com/'
var host = window.location.href.contains('localhost') ? 'http://localhost:9999' : 'http://salty-escarpment-4501.herokuapp.com';
var gameServer = new Masamune(host + '/masamune', {
  debug: true
});

gameServer.on('connected', function () {
  showDialog('joinGame');
});

gameServer.on('disconnected', function () {
  showDialog('connecting');
});

// Save game view-model
var game,
    state = 'starting',
    model = {
      playerCount: 2,
      playerNumber: null,
      trays: null,
      board: [],
      round: 1
    };

gameServer.on("assign-player-number", function (message) {
  try {
    model.playerNumber = parseInt(message.value);
  } catch (e) {
    console.log("Could not parse player number:", message.value);
  }
});

gameServer.on("piece-placed", function (message) {
  model[message.player].pop();
  model.board[message.location] = message.piece;
});

gameServer.on("invalid-move", function(message) {
  highlightCell(message.location, 'bad', 1000);
});

function joinGame(name) {
  gameServer.joinGame({ name: name, numPlayers: 2 }, function (serverGame) {
    game = serverGame;
    state = 'waiting';

    // Set the game name
    model.name = game.name;
    model.round = game.model.round;

    // Show the game screen
    showDialog('waiting', model);

    gameServer.on('sync-model', function () {
      if (game.model.trays) model.trays = game.model.trays;
      if (game.model.board) model.board = game.model.board;
      if (game.model.playerCount) {
        model.playerCount = game.model.playerCount;
        setBoardSize(model.playerCount);
      }
      updateViewModel();
      renderGame();
    });

    gameServer.on('model-update', function (message) {
      // console.log("Model updated", message);
      model[message.key] = game.model[message.key];
      updateViewModel();
      renderGame();
    });

    renderGame();

  }, function (err) {
    console.log("Encountered an error...");
  });
};

gameServer.on('game-start', function () {
  state = 'playing';
  hideDialog();
  renderGame();
});

gameServer.on('game-end', function () {
  state = 'complete';
  showDialog('join-game')
});

gameServer.on("player-turn", function (message) {
  renderGame();
});

gameServer.on("game-won", function(message) {
  for (var idx in message.combination) {
    highlightCell(message.combination[idx], 'win', 0);
  }
  newGame = function () {
    showDialog('results', {winner: message.winner + "'s win"});
  }
  setTimeout(newGame, 2000);
});

gameServer.on('game-tie', function(message) {
  showDialog('results', {winner: 'Game is a draw.'});
});

// var tray1 = document.querySelector("#player1-tray").querySelectorAll(".piece"),
//     tray2 = document.querySelector("#player2-tray").querySelectorAll(".piece"),
//     board = document.querySelector("#board"),
//     cells = board.querySelectorAll(".cell");

function updateViewModel() {
  for (var i=0;i<viewModel.playables.length;i++) {
    viewModel.playables[i].symbol = model.board[i];
  }
}

function renderGame() {
  renderCanvas();
  // for (var i = 0; i < tray1.length; i++) {
  //   tray1[i].innerHTML = model.trays[0][i] || "";
  // }
  // for (var i = 0; i < tray2.length; i++) {
  //   tray2[i].innerHTML = model.trays[1][i] || "";
  // }
  // for (var i = 0; i < cells.length; i++) {
  //   cells[i].innerHTML = model.board[i];
  // }  
};

gameServer.on("reset-board", function() {
  // for (var i = 0; i < cells.length; i++) {
  //   cells[i].removeClassName("green");
  // }  
});
