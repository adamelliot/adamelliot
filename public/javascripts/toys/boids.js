AdamElliot.Toys.Boids = (function() {
  var stage;
  const BOIDS = 40;

  var Boid = function(x, y) {
    Object.inherit(this, CanvasObject.CanvasObject);
    Object.inherit(this, CanvasObject.Geometry.Point);

    this.vector = new CanvasObject.Geometry.Vector;//(Math.random() - 0.5, Math.random() - 0.5);
    this.vector.multiply(3);

    this.x = x || this.x;
    this.y = y || this.y;

    var path = function() {
      this.fillStyle = CanvasObject.Color.randomGrey(0.8).toString();

      this.beginPath();
//      this.arc(0, 0, 25, 0, 2 * Math.PI);
      this.moveTo(0, 8);
      this.lineTo(5, -5);
      this.lineTo(-5, -5);
      this.lineTo(0, 8);
//      this.stroke();
      this.fill();
    };

    var centerVector = function(flock) {
      var vec = new CanvasObject.Geometry.Vector;
      
      for (var i = 0; i < flock.length; i++)
        if (flock[i] != this) vec.add(flock[i]);

      return vec.divide(flock.length - 1).subtract(this);
    };
    
    var pushVector = function(flock) {
      var vec = new CanvasObject.Geometry.Vector;
      
      for (var i = 0; i < flock.length; i++)
        if (flock[i] != this)
          if (CanvasObject.Geometry.Point.distance(flock[i], this) < 25)
            vec.subtract(CanvasObject.Geometry.Vector.subtract(flock[i], this));
      
      return vec;
    };
    
    var  velocityVector = function(flock) {
      var vec = new CanvasObject.Geometry.Vector;
      
      for (var i = 0; i < flock.length; i++)
        if (flock[i] != this) vec.add(flock[i].vector);

      return vec.divide(flock.length - 1).subtract(this.vector).divide(8);
    };
    
    this.adjustToFlock = function(flock) {
      if (flock.length < 2) return;

      var cv = centerVector.call(this, flock).divide(200);
      var pv = pushVector.call(this, flock).divide(32);
      var vv = velocityVector.call(this, flock);
      var vp = (new CanvasObject.Geometry.Vector(400, 225)).subtract(this).divide(1000);
      
      this.vector.add(cv);
      this.vector.add(pv);
      this.vector.add(vv);
      if (flock.length < 8)
        this.vector.add(vp);
      else
        this.vector.subtract(vp);
      
      var len = this.vector.length();
      if (len > 4) this.vector.divide(len).multiply(4);
    };
    
    /**
     * Enter Frame Event Hook
     */
    this.enterFrame(function() {
      this.add(this.vector);

      this.rotate = this.vector.angle() - Math.PI / 2;

      if (this.x >= stage.width() + 20) this.x = -20;
      else if (this.x < -20) this.x = stage.width() + 20;

      if (this.y >= stage.height() + 20) this.y = -20;
      else if (this.y < -20) this.y = stage.height() + 20;
    });

    // ---- Initializer Calls ----
    path.call(this);
  }

  var Klass = function(frame, fps) {
    Object.inherit(this, new AdamElliot.Toy(frame))
    Object.inherit(this, new CanvasObject.CanvasStage(this.getCanvas()[0], fps));
    stage = this;

    var boids = [];

    for (var i = 0; i < BOIDS; i++) {
      var boid = new Boid(stage.width() / 3, stage.height() / 2);
      var position = CanvasObject.Geometry.Vector.fromAngle(Math.PI * 2 * i / BOIDS);
      boid.x += position.x * 40;
      boid.y += position.y * 40;
      stage.addChild(boid);
      
      boids.push(boid);
    }

    this.enterFrame(function() {
      for (var i = 0; i < BOIDS; i++) {
        var flock = [];
        for (var j = 0; j < BOIDS; j++) {
          if (CanvasObject.Geometry.Point.distance(boids[i], boids[j]) < 60)
            flock.push(boids[j]);
        }

        boids[i].adjustToFlock(flock);
      }
    });
  };
  
  return Klass;  
})();
