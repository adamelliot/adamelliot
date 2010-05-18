AdamElliot.Toys.GoldenRatio = (function() {
  var WIDTH = 500;
  var HEIGHT = 700;
  var FPS = 60;

  var SIZE = 100;
  var PHI = (1.0 + Math.sqrt(5.0)) / 2.0;
  var RATIO_X = (PHI + 1) / (2.0 * PHI - 1);
  var RATIO_Y = PHI / (2.0 * PHI - 1);

  var CENTER_X = WIDTH / 2.0;
  var CENTER_Y = HEIGHT / 2.0;

  var Box = function(_scale) {
    CanvasObject.Path.call(this);
    this.scale == _scale || 1.0;
    
    var color = CanvasObject.Color.randomGrey().b(32).g(32).r(128 + Math.random() * 64);

    var path = function() {
      this.clear();
      this.fillStyle = color.toString();
      this.fillRect(SIZE * RATIO_X * -1.0, -1 * SIZE * RATIO_Y, SIZE, SIZE);
    };
    
    this.drop = function() {
      this.fadeOut(Math.random() / 50);
      
      var rate = Math.random();
      this.enterFrame(function() {
        this.y += rate + 1.0;
        this.rot += rate * Math.PI / 50.0;
      });
    }

    this.fadeOut = function(step) {
      step = step || 0.1;
      this.enterFrame(function() {
        color.alpha -= step;
        this.fillStyle = color.toString();
        if (color.alpha <= 0) this.remove();
      });
    };

    path.call(this);
  };

  var Rectangle = function() {
    var self = this;
    CanvasObject.Container.call(this);
    
    var frameLoop;
    
    var boxes = [];
    var startScale = 1.0 / PHI;
    var startRotation = 0;

    var normalizeBoxes = function() {
      this.scale *= PHI;
      startScale /= PHI;
      for (var i = 0; i < boxes.length; i++)
        boxes[i].scale /= PHI;
    };

    var removeOldest = function() {
      boxes[0].fadeOut();
      normalizeBoxes.call(this);
      boxes.shift();
    };

    var addBox = function() {
      var box = new Box();
      box.rotation = (startRotation -= Math.PI / 2.0);
      box.scale = startScale *= PHI;
      self.addChild(box);
      boxes.push(box);
      
      box.afterRemove(addBox);
    };

    for (var i = 0; i < 14; i++) addBox();

    this.defineHook('finished');

    this.drop = function() {
//      this.removeHandler('enterFrame', frameLoop);
      for (var i = 0; i < boxes.length; i++)
        boxes[i].drop();
    }

    var t = 0;
    this.enterFrame(frameLoop = function() {
      this.rotation -= 0.025;
      this.scale /= 1.0848;
      
      t += 0.01;
      this.x = 100 * Math.cos(t);
      this.y = 100 * Math.sin(t);

      if (this.scale < 0.1) removeOldest.call(this);
    });
  };

  var Klass = function(frame, fps) {
    var self = this;
    var canvas = frame.getFrame().find("canvas");
    AdamElliot.Toy.call(this, frame, FPS);
    this.resize(WIDTH, HEIGHT);
    this.setUpdateMethod(true, true);
    this.setOrigin(CENTER_X, CENTER_Y);

    var rect = new Rectangle;
    
    canvas.css("backgroundColor", "black");
    canvas.click(function() {
      rect.drop();
    });

    this.addChild(rect);
  };
  Klass.prototype = AdamElliot.Toy;
  
  return Klass;
})();
