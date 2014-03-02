Game = require './game'

class GameManager
  constructor: () ->
    @games = {}
    @userGames = {}
    @id = 0
    @matchmakingHandler = (games, options) ->
      @defaultMatchingHandler(games, options)

  registerGameHandler: (handler) ->
    @gameHandler = handler

  registerMatchmakingHandler: (handler) ->
    @matchmakingHandler = handler

  defaultMatchingHandler: (games, options) ->
    if options.name
      if games[options.name]?
        return games[options.name]
      else
        return "Could not join game"
    else
      for game in games
        unless game.isFull()
          return game

  encode: (payload) ->
    JSON.stringify payload

  decode: (payload) ->
    try
      payload = JSON.parse payload
    catch e
      console.log "Incorrect JSON", payload
      payload = {}
    payload

  generateHash: () ->
    text = ""
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for i in [0..5]
      text += possible.charAt(Math.floor(Math.random() * possible.length))

    text

  left: (conn) ->
    game = @userGames[conn]

    if game?
      game.removePlayer conn

  handleMessage: (payload, conn) ->
    message = @decode payload

    if message.type isnt "join-game"
      # Send the message to the right game
      game = @userGames[conn]
      if game?
        game.handleMessage message, conn
    else
      game = null

      # Try to use matchmaking
      if @matchmakingHandler?
        game = @matchmakingHandler(@games, message.payload)

      unless game?
        name = @generateHash()
        game = @createGame name

        if @gameHandler?
          @gameHandler game

      if game instanceof Game
        unless game.isFull()
          game.addPlayer conn
          @userGames[conn] = game

          @sendTo conn, "join-game", game
        else
          console.log "Could not match to game", game, game.isFull()
      else
        console.log "Join game error", game
        @sendTo conn, "join-game", {}, "Could not join game"
        return false

  sendTo: (conn, type, payload, error) ->
    conn.write @encode
      type: type
      payload: payload
      error: error

  createGame: (name) ->
    game = new Game name
    @games[name] = game

    game.on "end", () =>
      @removeGame name

    game

  removeGame: (name) ->
    delete @games[name]

exports = module.exports = new GameManager()
