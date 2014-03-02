function Game(name) {
  this.name = name;
  this.model = {};
};

function Masamune(url, options) {
  this.options = options || {};
  this.listeners = {};

  this.sock = new SockJS(url);
  /* connecting
     connected
     disconnected
  */
  this.state = "connecting";
  this.game = null;

  this.sock.onopen = this.onOpen.bind(this);
  this.sock.onmessage = this.onMessage.bind(this);
  this.sock.onclose = this.onClose.bind(this);
};

Masamune.prototype.joinGame = function(options, callback) {
  options = options || {};
  this.send("join-game", options, (function (message, err) {
    if (err) {
      console.log("Error:", err);
    } else if (message.name) {
      this.game = new Game(message.name);

      // Sync the model automagically
      this.send("sync-model", {}, function (message) {
        this.game.model = message.model;
        console.log("Model synced", this.game.model);
      });

      // Setup auto model syncing
      this.on("model-update", (function (message) {
        this.game.model[message.key] = message.value;
      }).bind(this));

      callback(this.game);
    } else {
      console.log("Incorrect game-joined resposne", message);
    }
  }).bind(this));
};

Masamune.prototype.onOpen = function() {
  this.trigger('connected');
  this.state = "connected";
};

Masamune.prototype.onMessage = function(event) {
  var message = {};

  try {
    message = JSON.parse(event.data);
  } catch(e) {
    console.log("Error parsing JSON", event);
    message = event.data;
  }

  if (this.options.debug == true) {
    console.log("[DEBUG]", "Message received:", message);
  }

  if (message.type) {
    this.trigger(message.type, message.payload, message.error);
  }
};

Masamune.prototype.send = function(type, payload, callback) {
  this.once(type, callback);
  this.sock.send(JSON.stringify({
    type: type,
    payload: payload
  }));
};

Masamune.prototype.onClose = function() {
  this.trigger('disconnected');
  this.state = "disconnected";
};

Masamune.prototype.on = function(name, callback) {
  if (!this.listeners[name]) {
    this.listeners[name] = [];
  }

  this.listeners[name].push(callback);

  // Handle special cases
  if (name === 'connected' && this.state === "connected") {
    this.trigger('connected');
  }
};

Masamune.prototype.once = function(name, callback) {
  var func = (function () {
    callback.apply(this, arguments);
    this.off(name, func);
  }).bind(this);

  this.on(name, func);
};

Masamune.prototype.off = function(name, callback) {
  if (this.listeners[name]) {
    if (callback) {
      this.listeners[name].splice(this.listeners[name].indexOf(callback), 1);
    } else {
      this.listeners[name] = [];
    }
  }
};

Masamune.prototype.trigger = function(name, payload, error) {
  payload = payload || {};
  if (this.listeners[name]) {
    var i = 0,
        length = this.listeners[name].length;
    while(i < this.listeners[name].length) {
      this.listeners[name][i](payload, error);

      if (length != this.listeners[name].length) {
        length = this.listeners[name].length;
      } else {
        i++;
      }
    }
  }
};