window.valentine = window.valentine || {};

valentine.Hearts = (function() {
  var random = function(lo, hi) {
    if (!hi) return Math.random() * (lo || 1);
    return Math.random() * (hi - lo) + lo;
  };

  var Heart = function(alpha) {
    alpha = alpha || 1.0;
    
//    Object.inherit(this, motion.MovingBody);
    Object.inherit(this, CanvasObject);
    
    var drawHeart = function(scale) {
      scale = scale || 100;
      
      var s = scale * random(0.4, 1.1);
      var grey = random(0, 128);
      this.fillStyle = (new Color(random(grey + 64, 255), grey, grey, alpha).toString)();

      this.shadowOffsetY = 0;
      this.shadowOffsetX = 0;
      this.shadowBlur = random(8, 16);
      this.shadowColor = Color.black().a(random(0.2, 0.6)).toString();


      this.rotation = random(0, 2 * Math.PI);
      this.beginPath();
      
      this.moveTo(0, -0.375 * s);
      this.bezierCurveTo(0.25 * s, -0.625 * s, s, -0.375 * s, 0, 0.375 * s);
      this.bezierCurveTo(-s, -0.375 * s, -0.25 * s, -0.625 * s, 0, -0.375 * s);

      if (random() > 0.35) {
        s = random(s * 0.5, s * 0.80);

        this.moveTo(0, -0.375 * s);
        this.bezierCurveTo(-0.25 * s, -0.625 * s, -s, -0.375 * s, 0, 0.375 * s);
        this.bezierCurveTo(s, -0.375 * s, 0.25 * s, -0.625 * s, 0, -0.375 * s);
      }

      this.fill();
    };

    var t = random(0, Math.PI * 2);
    var r = random(-0.04, 0.04);
    var f = random(0.8, 2.8)
    this.enterFrame(function() {
      this.rotation += 0.02;
      this.y += f;
      this.x += Math.sin(t += 0.02) * 1;
      
      if (this.y > window.innerHeight + 200) {
        this.y = -200;
      }
    });

    drawHeart.call(this);
  };

  var Klass = function(canvas, fps) {
    Object.inherit(this, new CanvasStage(canvas, fps));

    var topHearts = new CanvasBitmap(750, 400);
    var bottomHearts = new CanvasBitmap(750, 400);
    
    var top = new CanvasStage('hearts_top');
    var bottom = new CanvasStage('hearts_bottom');

    var hearts = 70;
    while (hearts--) {
      var r;
      var heart = new Heart(0.05);
      r = Math.random();
      r *= r;
      r *= 680;
      heart.x = r;

      r = Math.random();
      r *= r * r;
      r *= 330;
      heart.y = r;

      topHearts.addBitmap(CanvasBitmap.withCanvasObject(heart));
    }
    
    var hearts = 70;
    while (hearts--) {
      var heart = new Heart(0.05);
      r = Math.random();
      r *= r;
      r *= 680;
      heart.x = r;

      r = Math.random();
      r *= r * r;
      r *= 330;
      heart.y = 400 - r;

      bottomHearts.addBitmap(CanvasBitmap.withCanvasObject(heart));
    }
    
    top.addChild(topHearts);
    top.trigger('enterFrame');
    
    bottom.addChild(bottomHearts);
    bottom.trigger('enterFrame');

    var self = this;
    this.hearts = [];
    function addHeart() {
      var heart = new Heart;
      heart.x = random(0, 280);
      heart.y = random(-200, -80);
      
      self.hearts.push(heart);

      heart.onRemove(function() {
        addHeart();
      });

      self.addChild(heart);
    }
    
    var hearts = 15;
    while (hearts--) {
      addHeart.call(this);
    }
    setTimeout(function() {
      var hearts = 10;
      while(hearts--) {
        addHeart.call(self);
      }
    }, 3000);

    var self = this;
    $(window).resize(function() {
      self.resize(450, window.innerHeight);
    });
    this.resize(450, window.innerHeight);
    
    this.enterFrame(function() {
//      baseHearts.x = (this.width() - baseHearts.width()) / 2;
//      baseHearts.y = (this.height() - baseHearts.height()) / 2;
    });
  };

  return Klass;
})();