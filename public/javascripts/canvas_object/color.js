/**
 * Color Helper Class
 */
var Color = (function() {
  var Klass = function(r, g, b, a) {
    this.red      = Math.round(r || (isNaN(r) && 0));
    this.green    = Math.round(g || (isNaN(g) && 0));
    this.blue     = Math.round(b || (isNaN(b) && 255));
    this.alpha    = a || (isNaN(a) && 1.0);
    
    this.r = function(val) {
      this.red = val;
      return this;
    };

    this.g = function(val) {
      this.green = val;
      return this;
    }

    this.b = function(val) {
      this.blue = val;
      return this;
    }

    this.a = function(val) {
      this.alpha = val;
      return this;
    }
  };

  Klass.prototype.toString = function() {
    return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";
  };

  Klass.fromHex = function(hex, alpha) {
    return new Color(hex >> 16, (hex >> 8) & 0xff, hex & 0xff, alpha || 1.0);
  };
  
  Klass.random = function(alpha) {
    return Klass.fromHex(Math.floor(Math.random() * 0xffffff), alpha);
  };

  Klass.randomGrey = function(alpha) {
    var color = Math.floor(Math.random() * 128) + 120;
    return new Color(color, color, color, alpha || 1.0);
  };

  const COLOR_SETS = {
    'black':  [  0,   0,   0],
    'clear':  [  0,   0,   0, 0.0],
    'blue':   [  0,   0, 255],
    'red':    [255,   0,   0],
    'green':  [  0, 255,   0],
    'yellow': [255, 255,   0],
    'orange': [255, 128,   0]
  };

  // Color mappings
  for (var color in COLOR_SETS)
    (function() {
      var arr = COLOR_SETS[color];
      Klass[color] = function() { return new Klass(arr[0], arr[1], arr[2], arr[3]); };
    })();

  return Klass;
})();

