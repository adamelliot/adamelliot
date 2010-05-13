AdamElliot.Toys.GoldenRatio = (function() {
  var WIDTH = 500;
  var HEIGHT = 280;

  var SIZE = 100;
  var PHI = (1.0 + Math.sqrt(5.0)) / 2.0;
  var RATIO_X = (PHI + 1) / (2.0 * PHI - 1);
  var RATIO_Y = PHI / (2.0 * PHI - 1);

  var CENTER_X = WIDTH / 2.0;
  var CENTER_Y = HEIGHT / 2.0;

  var Rectangle = function(_scale) {
    var scale = _scale || 1.0;
    CanvasObject.Path.call(this);

    var path = function() {
      this.fillStyle = CanvasObject.Color.random().toString();
      this.fillRect(SIZE * RATIO_X - SIZE, SIZE * RATIO_Y - SIZE, SIZE * scale, SIZE * scale);
    };

    path.call(this);
  };

  var Klass = function(frame, fps) {
    var self = this;
    AdamElliot.Toy.call(this, frame, 30);
    this.resize(WIDTH, HEIGHT);
    this.setUpdateMethod(true, true);

    frame.getFrame().find("canvas").css("backgroundColor", "black");

    var rect = new Rectangle();
    rect.x = CENTER_X;
    rect.y = CENTER_Y;
    this.addChild(rect);

    this.enterFrame(function() {
      rect.rotation += 0.01;
    });

  };
  Klass.prototype = AdamElliot.Toy;
  
  return Klass;
})();
