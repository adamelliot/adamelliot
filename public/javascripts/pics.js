/**
 * pics.js
 * 
 * The file that handles the pics section of the site.
 */
window.AdamElliot = window.AdamElliot || {};

AdamElliot.Pics = (function() {
  var FLICKR_PATH = "http://api.flickr.com/services/feeds/photos_public.gne?id=30782515@N02&format=json&jsoncallback=?";
  var FRAME_DELAY = 317;

  var Picture = function(path) {
    var self = this;
    CanvasObject.Path.call(this);

    var SIZE = 180;
    var SUB_SIZE = 30;
    var SUB_SIZE_2 = SUB_SIZE / 2;
    var COLS = (SIZE / SUB_SIZE);
    var SECTIONS = COLS * COLS;
    var PIXEL_BORDER = 6;

    var offsetX = 0, offsetY = 0;
    var bitmap;

    var scaleStep = 0.25;
    var sectionScale = [];
    for (var i = 0; i < SECTIONS; i++) sectionScale[i] = 0;

    var targetIndex = 0;
    var order = [];
    for (var i = 0; i < SECTIONS; i++) order[i] = i;
    order.sort(function() { return Math.random() - 0.5; });

    var scaleSection = function(index) {
      if (sectionScale[index] >= 1.0) {
        targetIndex++;
        return;
      }
      sectionScale[index] += scaleStep;
      if (sectionScale[index] > 1.0) sectionScale[index] = 1.0;

      var s = SUB_SIZE * sectionScale[index], s_2 = s / 2;
      var x = (index % COLS) * SUB_SIZE + (SUB_SIZE_2 - s_2);
      var y = Math.floor(index / COLS) * SUB_SIZE + (SUB_SIZE_2 - s_2);

      var ds = Math.min(SUB_SIZE, s + PIXEL_BORDER);
      var bp = (ds - s) / 2;

      self.fillRect(x - bp, y - bp, ds, ds);
      self.drawImage(bitmap.canvas(), x + offsetX, y + offsetY, s, s, x, y, s, s);
    };

    CanvasObject.Bitmap.withImage(path, function(_bitmap) {
      bitmap = _bitmap;
      
      if (bitmap.width() > SIZE) offsetX = (bitmap.width() - SIZE) / 2;
      if (bitmap.height() > SIZE) offsetY = (bitmap.height() - SIZE) / 2;

      var func;
      self.enterFrame(func = function() {
        scaleSection(order[targetIndex]);
        if (targetIndex >= SECTIONS) self.removeHandler('enterFrame', func);
      });
    });
  };
  Picture.prototype = new CanvasObject.Path;

  var Klass = function(_frame) {
    var self = this;
    var frame = _frame, buttons;
    CanvasObject.Stage.call(this, frame.getFrame().find("canvas")[0], 30);
    
    var images = [], imageIndex = 0;
    var pictures = [], pictureIndex = 0;
    var frameDelay = FRAME_DELAY;
    var order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    order.sort(function() { return Math.random() - 0.5; });

    this.resize(550, 550);
    this.setUpdateMethod(true, false);

    var addPicture = function() {
      if (pictures[pictureIndex]) self.removeChild(pictures[pictureIndex]);

      var picture = new Picture(images[imageIndex++]);
      self.addChild(picture);

      var index = order[pictureIndex];

      picture.x = (index % 3) * 185;
      picture.y = Math.floor(index / 3) * 185;

      pictures[pictureIndex++] = picture;

      pictureIndex %= 9;
      imageIndex %= images.length;
    };

    var initialize = function() {
      if (!frame) return;

      $.getJSON(FLICKR_PATH, function(data) {
        for (var i = 0; i < data.items.length; i++) {
          images.push(data.items[i].media.m);
        }
        images.sort(function() { return Math.random() - 0.5; });

        var initialPics = 9, i = 0;
        var func;
        self.enterFrame(func = function() {
          if ((i++ % 16) === 0) {
            addPicture();
            if (initialPics-- <= 0) this.removeHandler('enterFrame', func);
          }
        });

        self.enterFrame(function() {
          if (frameDelay === 0) {
            addPicture();
            frameDelay = FRAME_DELAY;
          }
          frameDelay--;
        });
      });
    };
    
    this.clearFunc = function() {
      self.context().fillStyle = 'rgba(0, 0, 0, 0.02)';
      self.context().fillRect(0, 0, 550, 550);
    };

    initialize.call(this);
  };

  return Klass;
})();