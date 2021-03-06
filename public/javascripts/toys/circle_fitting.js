AdamElliot.Toys.CircleFitting = (function() {
  var IMAGES = [
    '/images/circle_image_1.jpg',
    '/images/circle_image_2.jpg',
    '/images/circle_image_3.jpg'];
  var WIDTH = 490;
  var HEIGHT = 640;
  var STARTING_CIRCLES = 6;
  var MAX_CIRCLES = 2000;

  var Circle = function(x, y, color) {
    CanvasObject.Path.call(this);

    this.radius = 1;
    this.x = x || this.x;
    this.y = y || this.y;

    var path = function() {
      this.clear();
      this.fillStyle = color;
      this.beginPath();
      this.arc(0, 0, this.radius, 0, Math.PI * 2, true);
      this.fill();
    };

    this.intersectsWith = function(circle) {
      var d = (this.radius + circle.radius - 0.8);
      if (d < Math.abs(this.x - circle.x) || d < Math.abs(this.y - circle.y))
        return false;
      return Math.floor(this.distanceTo(circle)) < (this.radius + circle.radius - 0.8);
    };

    var enterFrame;
    this.enterFrame(enterFrame = function() {
      path.call(this);
      this.radius++;
    });

    this.stopGrowing = function() {
      this.removeHandler('enterFrame', enterFrame);
    }
  };

  var Klass = function(frame, fps) {
    var self = this;
    AdamElliot.Toy.call(this, frame, 30);
    this.resize(WIDTH, HEIGHT);
    this.setUpdateMethod(false, true);
    
    var canvas = frame.getFrame().find("canvas");

    canvas.click(function(event) {
      addCircle.call(self, new CanvasObject.Geometry.Point(event.offsetX, event.offsetY));
    });

    var image, imageData;
    var circles = [];
    var activeCircles = [];

    canvas.css("backgroundColor", "black");

    var circleCollides = function(circle) {
      for (var i = 0; i < circles.length; i++)
        if (circles[i] != circle && circles[i].intersectsWith(circle))
          return true;
      return false;
    };

    var alpha = Math.random() >= 0.35;
    var chooseAlpha = function() {
      if (!alpha) return 1;
      return Math.random();
    };

    var addCircle = function(_pt) {
      var pt = _pt || CanvasObject.Geometry.Point.random(WIDTH, HEIGHT);
      var maxTries = 30;
      while (circleCollides(pt) && maxTries-- > 0) {
        pt = CanvasObject.Geometry.Point.random(WIDTH, HEIGHT);
        pt.radius = 0.5;
      }
      if (maxTries == 0) return;
      if (circles.length >= MAX_CIRCLES) {
        this.stop();
        return;
      }

      var xRatio = image.width() / WIDTH, yRatio = image.height() / HEIGHT;
      var offset = (Math.floor(pt.x * xRatio) + Math.floor(pt.y * yRatio) * image.width()) * 4;
      var color = new CanvasObject.Color(
        imageData.data[offset + 0],
        imageData.data[offset + 1],
        imageData.data[offset + 2],
        1.0//chooseAlpha()
      ).toString();

      var circle = new Circle(pt.x, pt.y, color);
      circles.push(circle);
      activeCircles.push(circle);
      this.addChild(circle);
    };

    var index = Math.floor(Math.random() * IMAGES.length);
    CanvasObject.Bitmap.withImage(IMAGES[index], function(bitmap) {
      image = bitmap;
      imageData = image.context().getImageData(0, 0, bitmap.width(), bitmap.height());
      for (var i = 0; i < STARTING_CIRCLES; i++) addCircle.call(self);
    });

    this.enterFrame(function() {
      for (var i = 0; i < activeCircles.length; i++)
        if (circleCollides(activeCircles[i])) {
          this.removeChild(activeCircles[i]);
          activeCircles[i].stopGrowing();
          activeCircles.splice(i--, 1);
          if (activeCircles.length < STARTING_CIRCLES)
            addCircle.call(this);
        }
    });

  };
  Klass.prototype = AdamElliot.Toy;
  
  return Klass;
})();
