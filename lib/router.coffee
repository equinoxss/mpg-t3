presence = require './presence'
game_manager = require './game_manager'

class Router
  constructor: () ->
    @PRESENCE = 0
    @MESSAGE = 1
    @CLOSE = 2

  route: (id, payload, conn) ->
    if id is @PRESENCE
      presence.joined payload
    else if id is @MESSAGE
      game_manager.handleMessage payload, conn
    else if id is @CLOSE
      presence.left payload
      game_manager.left payload

  getGameManager: () ->
    game_manager

exports = module.exports = new Router()

