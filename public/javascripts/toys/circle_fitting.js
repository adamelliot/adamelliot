AdamElliot.Toys.CircleFitting = (function() {
  const IMAGES = [
    '/images/circle_image_1.jpg',
    '/images/circle_image_2.jpg'];
  const WIDTH = 480;
  const HEIGHT = 640;
  const STARTING_CIRCLES = 6;
  const MAX_CIRCLES = 1800;

  var Circle = function(x, y, color) {
    CanvasObject.Path.call(this);

    this.radius = 1;
    this.x = x || this.x;
    this.y = y || this.y;

    var path = function() {
      this.clear();
      this.fillStyle = color;
      this.beginPath();
      this.arc(0, 0, this.radius, 0, Math.PI * 2);
      this.fill();
    };

    this.intersectsWith = function(circle) {
      return Math.floor(this.distanceTo(circle)) < (this.radius + circle.radius - 1.5);
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
    AdamElliot.Toy.call(this, frame);
    this.resize(WIDTH, HEIGHT);
    var image, imageData;
    var circles = [];
    var activeCircles = [];

    var circleCollides = function(circle) {
      for (var i = 0; i < circles.length; i++)
        if (circles[i] != circle && circles[i].intersectsWith(circle))
          return true;
      return false;
    };

    var addCircle = function() {
      var pt;
      var maxTries = 30;
      do {
        pt = CanvasObject.Geometry.Point.random(WIDTH, HEIGHT);
        pt.radius = 0;
      } while (circleCollides(pt) && maxTries-- > 0);
      if (maxTries == 0) return;
      if (circles.length >= MAX_CIRCLES) {
        this.stop();
        return;
      }

      var xRatio = image.width() / WIDTH, yRatio = image.height() / HEIGHT;
      var offset = Math.round(pt.x * xRatio + pt.y * yRatio * image.width()) * 4;
      var color = new CanvasObject.Color(
        imageData.data[offset + 0],
        imageData.data[offset + 1],
        imageData.data[offset + 2],
        imageData.data[offset + 3]
      ).toString();
//      var color = CanvasObject.Color.randomGrey(1.0).toString();

      var circle = new Circle(pt.x, pt.y, color);
      circles.push(circle);
      activeCircles.push(circle);
      this.addChild(circle);
    };

    var index = Math.round(Math.random() * (IMAGES.length - 1));
    CanvasObject.Bitmap.withImage(IMAGES[index], function(bitmap) {
      image = bitmap;
      imageData = image.context().getImageData(0, 0, bitmap.width(), bitmap.height());
      for (var i = 0; i < STARTING_CIRCLES; i++) addCircle.call(self);
    });

    this.enterFrame(function() {
      for (var i = 0; i < activeCircles.length; i++)
        if (circleCollides(activeCircles[i])) {
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