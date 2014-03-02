sockjs = require 'sockjs'
fs = require 'fs'

# Old Code - Has buffering I want to eventually do
# echo = sockjs.createServer()
# echo.on 'connection', (conn) ->
#   conn.on 'data', (message) ->
#     console.log message

#     decodeBuffer = new ArrayBuffer message.length
#     decodeView = new Uint8Array decodeBuffer

#     for i in [0..decodeView.length]
#       decodeView[i] = message.charCodeAt i

#     decodedState = new Float64Array decodeBuffer
#     console.log decodedState

#     conn.write message
#   conn.on 'close', () ->
#     console.log "Closed"

# Create sockjs server
masamune = sockjs.createServer
  jsessionid: true

router = require './lib/router'
masamune.on 'connection', (conn) ->
  router.route router.PRESENCE, conn

  conn.on 'data', (message) ->
    router.route router.MESSAGE, message, conn

  conn.on 'close', () ->
    router.route router.CLOSE, conn

exports = module.exports =
  installHandlers: (server) ->
    masamune.installHandlers server, { prefix: '/masamune' }

    # Setup handlers for static JS file
    server.on 'request', (req, res) ->
      if req.url is '/masamune.js' or req.url is '/socksjs.js'
        fs.readFile "#{__dirname}/lib/static/sockjs.js", (err, sockjs) ->
          unless err?
            fs.readFile "#{__dirname}/lib/static/masamune.js", (err, data) ->
              unless err?
                data = sockjs + data
                res.writeHead 200, {
                  'Content-Type': 'text/javascript'
                }
                res.write data
                res.end()
              else
                console.log "Error reading masamune", err
                res.writeHead 500
                res.end()
          else
            console.log "Error reading sockjs", err
            res.writeHead 500
            res.end()

  onGameCreated: (handler) ->
    router.getGameManager().registerGameHandler handler

  onMatchmaking: (handler) ->
    router.getGameManager().registerMatchmakingHandler handler
