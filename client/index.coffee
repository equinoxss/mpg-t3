http = require 'http'
url = require 'url'
path = require 'path'
fs = require 'fs'
port = process.argv[2] ? 8888

app = http.createServer (req, res) ->
  uri = url.parse(req.url).pathname
  filename = path.join(process.cwd(), uri)

  fs.exists filename, (exists) ->
    if not exists
      res.writeHead 404, { 'Content-Type': 'text/plain' }
      res.write '404 Not Found\n'
      res.end()
      return

    if fs.statSync(filename).isDirectory()
      filename += '/index.html'

    fs.readFile filename, 'binary', (err, file) ->
      if err?
        res.writeHead 500, { 'Content-Type': 'text/plain' }
        res.write err + '\n'
        res.end()
        return

      res.writeHead 200
      res.write file, 'binary'
      res.end()

app.listen parseInt(port, 10)

console.log "Server now listening on #{port}"
