window.geometry = {};

window.geometry.Point = (function() {
  
  var Klass = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;

    this.equals = function(other) {
      return (other.x == this.x && other.y == this.y);
    };

    this.clone = function() { return new geometry.Point(this.x, this.y); };

    this.add = function(vec) {
      this.x += vec.x;
      this.y += vec.y;
      return this;
    };
    
    this.subtract = function(vec) {
      this.x -= vec.x;
      this.y -= vec.y;
      return this;
    }

    this.distanceTo = function(pt) {
      var x = this.x - pt.x;
      var y = this.y - pt.y;
      return Math.sqrt(x * x + y * y);
    };

    this.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };
  };
  
  Klass.distance = function(p1, p2) {
    var x = p1.x - p2.x;
    var y = p1.y - p2.y;
    return Math.sqrt(x * x + y * y);
  };
  
  Klass.interpolate = function(p1, p2, weight) {
    weight = weight || 0.5;
    return new geometry.Point(p1.x * (1 - weight) + p2.x * weight,
      p1.y * (1 - weight) + p2.y * weight);
  };

  Klass.add = function(pt, vec) {
    return pt.clone().add(vec);
  };

  Klass.subtract = function(pt, vec) {
    return pt.clone().subtract(vec);
  };

  return Klass;
})();

window.geometry.Vector = (function() {
  var Klass = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;

    this.equals = function(other) {
      return (other.x == this.x && other.y == this.y);
    };

    this.clone = function() { return new geometry.Vector(this.x, this.y); };
    this.dot = function(vec) { return vec.x * this.x + vec.y * this.y; };
    
    this.multiply = function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    };
    
    this.divide = function(s) {
      this.x /= s;
      this.y /= s;
      return this;
    };

    this.add = function(vec) {
      this.x += vec.x;
      this.y += vec.y;
      return this;
    };

    this.subtract = function(vec) {
      this.x -= vec.x;
      this.y -= vec.y;
      return this;
    };

    this.angle = function() { return Math.atan2(this.y, this.x); };

    this.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    
    this.perpendicular = function() {
      return new geometry.Vector(-this.y, this.x);
    };
  };

  Klass.add = function(v1, v2) {
    return v1.clone().add(v2);
  };

  Klass.subtract = function(v1, v2) {
    return v1.clone().subtract(v2);
  };

  Klass.fromAngle = function(angle) {
    var ret = new geometry.Vector;
    ret.x = Math.cos(angle);
    ret.y = Math.sin(angle);
    return ret;
  };

  return Klass;
})();