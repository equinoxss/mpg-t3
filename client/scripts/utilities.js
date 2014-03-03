if (!String.prototype.contains) {
  String.prototype.contains = function (str) {
    return this.indexOf(str) != -1;
  };
}

Element.prototype.hasClassName = function(name) {
  return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};

Element.prototype.addClassName = function(name) {
  if (!this.hasClassName(name)) {
    this.className = this.className ? [this.className, name].join(' ') : name;
  }
};

Element.prototype.removeClassName = function(name) {
  if (this.hasClassName(name)) {
    var c = this.className;
    this.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
  }
};

Rectangle = (function() {
  function Rectangle(x, y, x2, y2) {
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
  }

  Rectangle.prototype.clone = function() {
    return new Rectangle(this.x, this.y, this.x2, this.y2);
  };

  Rectangle.prototype.reset = function(x, y, x2, y2) {
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
  };

  Rectangle.prototype._checkPt = function(tx, ty) {
    return (tx >= this.x && tx <= this.x2) && (ty >= this.y && ty <= this.y2);
  };

  Rectangle.prototype.contains = function(pt) {
    return this._checkPt(pt.x, pt.y);
  };

  Rectangle.prototype.intersects = function(rect) {
    if (this.x2 < rect.x || this.y2 < rect.y || this.x > rect.x2 || this.y > rect.y2) {
      return false;
    }
    return true;
  };

  Rectangle.prototype.translate = function(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  };

  Rectangle.prototype.width = function() {
    return this.x2 - this.x;
  };

  Rectangle.prototype.height = function() {
    return this.y2 - this.y;
  };

  Rectangle.prototype.outset = function(dx, dy) {
    this.x -= dx;
    this.x2 += dx;
    this.y -= dy;
    this.y2 += dy;
    return this;
  };

  Rectangle.prototype.inset = function(dx, dy) {
    this.outset(-dx, -dy);
    return this;
  };

  return Rectangle;

})();
