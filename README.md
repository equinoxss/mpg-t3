Multiplayer server nodejs library.

## Getting Started
Run the client in a local static site
```
cd client
python -m SimpleHTTPServer
```

Then run the server
```
cd server
coffee index.coffee
```

The client should be able to connect to the server which gives presence events for everyone else connected. You can then create a game and join it.

When you load masamune into nodejs using require you can then provide a proxy for game creation. This will allow you to take the game object created and joined by the clients and manage the game logic. It should have `on` and `write` methods for talking back and forth through events with the clients.

More to come!
