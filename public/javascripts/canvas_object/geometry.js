window.CanvasObject = window.CanvasObject || {};
CanvasObject.Geometry = CanvasObject.Geometry || {};

CanvasObject.Geometry.Point = (function() {
  
  var Klass = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;

    this.equals = function(other) {
      return (other.x == this.x && other.y == this.y);
    };

    this.clone = function() { return new CanvasObject.Geometry.Point(this.x, this.y); };

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

  Klass.random = function(x, y) {
    return new Klass(Math.random() * x, Math.random() * y);
  }

  Klass.distance = function(p1, p2) {
    var x = p1.x - p2.x;
    var y = p1.y - p2.y;
    return Math.sqrt(x * x + y * y);
  };
  
  Klass.interpolate = function(p1, p2, weight) {
    weight = weight || 0.5;
    return new CanvasObject.Geometry.Point(p1.x * (1 - weight) + p2.x * weight,
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

CanvasObject.Geometry.Vector = (function() {
  var Klass = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;

    this.equals = function(other) {
      return (other.x == this.x && other.y == this.y);
    };
    this.eq = this.equals;

    this.clone = function() { return new CanvasObject.Geometry.Vector(this.x, this.y); };
    this.dot = function(vec) { return vec.x * this.x + vec.y * this.y; };
    
    this.multiply = function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    };
    this.mul = this.multiply;

    this.divide = function(s) {
      this.x /= s;
      this.y /= s;
      return this;
    };
    this.div = this.divide;

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
    this.sub = this.subtract;

    this.angle = function() { return Math.atan2(this.y, this.x); };

    this.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    
    this.perpendicular = function() {
      return new CanvasObject.Geometry.Vector(-this.y, this.x);
    };
  };

  Klass.add = function(v1, v2) {
    return v1.clone().add(v2);
  };

  Klass.subtract = function(v1, v2) {
    return v1.clone().subtract(v2);
  };
  Klass.sub = Klass.subtract;

  Klass.fromAngle = function(angle) {
    var ret = new CanvasObject.Geometry.Vector;
    ret.x = Math.cos(angle);
    ret.y = Math.sin(angle);
    return ret;
  };

  return Klass;
})();

CanvasObject.Geometry.Size = (function() {
  var Klass = function(width, height) {
    this.width = width || 0;
    this.height = height || 0;
  };

  return Klass;
})();

CanvasObject.Geometry.Matrix = (function() {
  var Klass = function() {
    var m = [[1, 0], [0, 1]];

    this.rotate = function(angle) {
      m[0][0] =  Math.cos(angle);
      m[0][1] =  Math.sin(angle);
      m[1][0] = -Math.sin(angle);
      m[1][1] =  Math.cos(angle);
    };

    /**
     * Applies this matrix to a point
     */
    this.transform = function(pt) {
      var x = pt.x * m[0][0] + pt.y * m[1][0];
      var y = pt.x * m[0][1] + pt.y * m[1][1];
      
      pt.x = x;
      pt.y = y;

      return pt;
    };
  };

  Klass.rotatePoint = function(pt, angle) {
    var mat = new Klass();
    mat.rotate(angle);
    return mat.transform(pt);
  };

  return Klass;
})();

CanvasObject.Geometry.Rectangle = (function() {
  var Klass = function(left, top, right, bottom) {
    if (arguments.length == 0) this.empty = true;
    else {
      this.empty = false;
      if (left <= right) {
        this.left = left;
        this.right = right;
      } else {
        this.left = right;
        this.right = left;
      }
      if (top <= bottom) {
        this.top = top;
        this.bottom = bottom;
      } else {
        this.top = bottom;
        this.bottom = top;
      }
    }

    this.clone = function() {
      return new Klass(this.left, this.top, this.right, this.bottom);
    };

    this.width = function() { return this.right - this.left; };
    this.height = function() { return this.bottom - this.top; };

    this.includePoint = function(pt) {
      if (this.empty) {
        this.empty = false;
        this.left = this.right = pt.x;
        this.top = this.bottom = pt.y;
        return;
      }
      if (this.left > pt.x) this.left = pt.x;
      else if (this.right < pt.x) this.right = pt.x;
      if (this.top > pt.y) this.top = pt.y;
      else if (this.bottom < pt.y) this.bottom = pt.y;
    };
  };

  Klass.fromRotated = function(rect, angle) {
    if (angle == 0) return rect.clone();
    var mat = new CanvasObject.Geometry.Matrix();
    mat.rotate(angle);

    var pt1 = mat.transform({x: rect.left, y: rect.top});
    var pt2 = mat.transform({x: rect.right, y: rect.bottom});

    var r = new Klass(pt1.x, pt1.y, pt2.x, pt2.y);

    r.includePoint(mat.transform({x: rect.right, y: rect.top}));
    r.includePoint(mat.transform({x: rect.left, y: rect.bottom}));

    return r;
  };

  return Klass;
})();
