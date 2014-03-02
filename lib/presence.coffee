class Presence
  constructor: () ->
    this.users = {}
    this.connections = []

  joined: (conn) ->
    for other in this.connections
      other.write JSON.stringify({ type: "JOINED", id: conn.id })

    this.connections.push(conn)
    this.users[conn.id] = conn

  left: (conn) ->
    this.connections.splice(this.connections.indexOf(conn), 1)
    this.users[conn.id] = null

    for other in this.connections
      other.write JSON.stringify({ type: "LEFT", id: conn.id })

exports = module.exports = new Presence()

