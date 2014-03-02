masamune = require './../masamune'
http = require 'http'
port = process.env.PORT ? 9999

server = http.createServer()
masamune.installHandlers server

masamune.onGameCreated (game) ->
  console.log "Game #{game.name} created"

  game.config
    maxPlayers: 2

  players = 0
  currentPlayer = -1
  started = false
  trays = null
  board = null

  setupGame = () ->
    trays = [ ["X","X","X","X","X","X"],
            ["O","O","O","O","O","O"] ]
    board = [" "," "," "," "," "," "," "," "," "]
    currentPlayer = -1
    started = false
    game.set 'round', 1
    game.set 'trays', trays
    game.set 'board', board

  startGame = () ->
    game.send 'game-start'
    nextTurn()

  setupGame()

  game.on 'reset-game', (player) ->
    game.send 'reset-board'
    setupGame()
    startGame()

  game.on "player-join", (player) ->
    players++

    game.sendTo player, "assign-player-number",
      value: players

    if players is game.options.maxPlayers and not started
      setTimeout startGame, 200
      started = true

  game.on "player-left", (player) ->
    game.send "game-end"
    game.end()

  nextTurn = () ->
    currentPlayer = ++currentPlayer % 2
    game.send 'player-turn', currentPlayer

  game.on 'place-piece', (message, conn) ->
    # console.log "place", currentPlayer, game.playerNumber(conn)
    # console.log "message", message
    if game.playerNumber(conn) is currentPlayer
      location = parseInt(message.payload.location)
      # console.log "location", location, ">" + board[location] + "<"
      if board[location] is " "
        piece = trays[currentPlayer].pop()
        board[location] = piece
        game.set 'trays', trays
        game.set 'board', board
        nextTurn() unless winner()
      else
        game.sendTo conn, 'invalid-move', 
          location: location
    else
      game.sendTo conn, 'not-your-turn'

  combinations = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  winner = () ->
    for possible in combinations
      three = board[possible[0]] + board[possible[1]] + board[possible[2]]
      # console.log "three:", three, possible
      switch three 
        when "XXX"
          game.send 'game-won',
            combination: possible
            player: 0
            winner: 'X'
          return true
        when "OOO"
          game.send 'game-won',
            combination: possible
            player: 1
            winner: 'O'
          return true
    if board.join("").replace(" ", '').length is 9
      game.send 'game-tie'

    false

server.listen port, '0.0.0.0'