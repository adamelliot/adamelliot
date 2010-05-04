AdamElliot.Toys.Julia = (function() {
  var Klass = function(frame, fps) {
    AdamElliot.Toy.call(this, frame);

    this.resize(244, 150);
    frame.getFrame().find("canvas").css({width: 488, height: 300, backgroundColor:'black'});

    var width = this.width();
    var height = this.height();

    var ctx = this.context();
    var imageData = ctx.getImageData(0, 0, width, height);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    for (var i = 0; i < imageData.data.length - 3; i += 4) {
      imageData.data[i + 0] = 0x0c;
      imageData.data[i + 1] = 0x10;
      imageData.data[i + 2] = 0x18;
      imageData.data[i + 3] = 0xff;
    }

    const RANGE_X = 2.0;
    const RANGE_Y = 2.0;

    var a = 0.5 - Math.random(), b = 0.5 - Math.random();
    var aStep = 0.011, bStep = 0.009;

    var colors = [];
    for (var i = 0;  i < 16; i++) colors[i] = 0x0c + i * 14;
    for (var i = 16; i < 32; i++) colors[i] = Math.min(0x10 + ((i - 16) * (i - 16) / 4) * 10, 0xff);


    var buffer = new Array(imageData.data.length);
    var step = Math.min((RANGE_X * 2.0) / width, (RANGE_Y * 2.0) / height);
    var i, c = 0, x, y, cx, cy;

    var rangeX = step * width / 2;
    var rangeY = step * height / 2;
    var total = imageData.data.length - 3;

    this.enterFrame(function() {
      if ((a += aStep) < -1 || a > 1) aStep *= -1;
      if ((b += bStep) < -1 || b > 1) bStep *= -1;

      x = -rangeX;
      y = -rangeY;
      c = 0;

      for (i = 0; i < total; i += 4, x += step) {
        if (x >= rangeX) {
          y += step;
          x = -rangeX;
        }

        cx = x; cy = y;
        for (c = 0; c <= 12; c++) {
          x_ = cx * cx - cy * cy + a;
          y_ = 2.0 * cx * cy + b;

          if ((x_ * x_ + y_ * y_) >= 4) break;

          cx = x_;
          cy = y_;
        }

        imageData.data[i + 0] = colors[c];
        imageData.data[i + 1] = colors[c + 16];
      }
      ctx.putImageData(imageData, 0, 0);
    });
  };
  Klass.prototype = new AdamElliot.Toy;

  return Klass;
})();