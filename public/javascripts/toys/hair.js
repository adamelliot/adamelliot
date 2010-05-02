window.hair = function(canvas, fps) {
  var STRANDS = 100;
  var stage;
  
  var random = function(left, right) {
    return left + (Math.random() * (right - left));
  }
  
  var Strand = function(p1, p2) {
    Object.inherit(this, CanvasObject);
    
    var w = stage.width() / 20, h = stage.height() / 4;
    var v1 = new CanvasObject.Geometry.Point(random(-w, w), random(-h, h));
    var v2 = new CanvasObject.Geometry.Point(random(-w, w), random(-h, h));

    this.strokeStyle = Color.randomGrey(0.8).toString();
    var path = function() {
      this.clear();
      this.beginPath();
      this.moveTo(p1.x, p1.y);
      this.bezierCurveTo(
        p1.x + v1.x, p1.y + v1.y,
        p2.x + v2.x, p2.y + v2.y,
        p2.x, p2.y);
      this.stroke();
    };

    var i = Math.PI;
    this.enterFrame(function() {
      p1.x = Math.sin(i += 0.01) * stage.width() / 2;
      path.call(this);
    });
  };
  
  var Hair = function(canvas, fps) {
    Object.inherit(this, new CanvasObject.Stage(canvas, fps));
    stage = this;
    
    for (var i = 0; i < STRANDS; i++)
      this.addChild(new Strand({x:-10, y:-10}, {x:800, y:500}));
  };

  return new Hair(canvas, fps);
};