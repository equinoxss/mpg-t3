class Game
  constructor: (@name) ->
    @players = []
    @listeners = {}
    @model = {}
    @options =
      maxPlayers: 4

  config: (options) ->
    for key of options
      @options[key] = options[key]

  isFull: () ->
    @options.maxPlayers is @players.length

  end: () ->
    @trigger "end"

  addPlayer: (conn) ->
    @send "player-join", conn.id
    @players.push(conn)
    @trigger "player-join", conn

  removePlayer: (conn) ->
    @players.splice @players.indexOf(conn), 1
    @trigger "player-left", conn
    @send "player-left", conn.id

  playerNumber: (conn) ->
    @players.indexOf(conn)

  set: (key, value) ->
    @model[key] = value

    @send "model-update",
      key: key
      value: value

  get: (key) ->
    @model[key]

  handleMessage: (message, conn) ->
    if message.type
      if message.type is "sync-model"
        conn.write JSON.stringify
          type: "sync-model"
          payload:
            model: @model
      else
        @trigger message.type, message, conn

  trigger: (name, payload, conn) ->
    if @listeners[name]?
      for listener in @listeners[name]
        listener(payload, conn)

  on: (name, callback) ->
    if not @listeners[name]?
      @listeners[name] = []
    @listeners[name].push callback

  off: (name, callback) ->
    if @listeners[name]?
      @listeners[name].splice @listeners[name].indexOf(callback), 1

  sendTo: (conn, type, payload) ->
    conn.write JSON.stringify
      type: type
      payload: payload

  send: (type, payload) ->
    for player in @players
      player.write JSON.stringify
        type: type
        payload: payload

  toJSON: () ->
    return {
      id: @id
      name: @name
    }

exports = module.exports = Game