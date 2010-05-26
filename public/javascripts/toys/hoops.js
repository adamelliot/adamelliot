AdamElliot.Toys.Hoops = (function() {
  var WIDTH = 500;
  var HEIGHT = 700;
  var FPS = 60;

  var CENTER_X = WIDTH / 2.0;
  var CENTER_Y = HEIGHT / 2.0;

  var Hoop = function() {
    
  };

  var Klass = function(frame, fps) {
    var self = this;
    var canvas = frame.getFrame().find("canvas");
    AdamElliot.Toy.call(this, frame, FPS);
    this.resize(WIDTH, HEIGHT);
    this.setUpdateMethod(true, true);
    this.setOrigin(CENTER_X, CENTER_Y);

    canvas.css("backgroundColor", "black");
    canvas.click(function() {
    });
    
    
  };
  Klass.prototype = AdamElliot.Toy;
  
  return Klass;
})();
