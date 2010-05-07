/**
 * pics.js
 * 
 * The file that handles the pics section of the site.
 */
window.AdamElliot = window.AdamElliot || {};

AdamElliot.Pics = (function() {
  var FLICKR_PATH = "http://api.flickr.com/services/feeds/photos_public.gne?id=30782515@N02&format=json&jsoncallback=?";
  var FRAME_RATE = 20;
  var FRAME_DELAY = Math.floor(FRAME_RATE * 9.6);
  var SIZE = 180;

  var Picture = function(path) {
    var self = this;
    CanvasObject.Path.call(this);

    var SUB_SIZE = [20, 30, 36, 45][Math.floor(Math.random() * 4)];
    var SUB_SIZE_2 = SUB_SIZE / 2;
    var COLS = (SIZE / SUB_SIZE);
    var SECTIONS = COLS * COLS;
    var PIXEL_BORDER = 6;
    var MAX_SCALES = 1 + Math.round(SECTIONS / 5);
    var SCALE_FRAME_OFFSET = 1;
    var DURATION = 2.7;

    var offsetX = 0, offsetY = 0;
    var bitmap;

    var scaleStep = (SECTIONS / (MAX_SCALES >> 1)) / DURATION / FRAME_RATE;
    var sectionScale = [];
    for (var i = 0; i < SECTIONS; i++) sectionScale[i] = 0;

    var startTargetIndex = 0, endTargetIndex = 0;
    var order = [];
    for (var i = 0; i < SECTIONS; i++) order[i] = i;
    order.sort(function() { return Math.random() - 0.5; });

    this.fillStyle = 'black';

    this.defineHook('finshedDisplay');

    var scaleSection = function(index) {
      if (sectionScale[index] >= 1.0)
        return false;
      sectionScale[index] += scaleStep;
      if (sectionScale[index] > 1.0) sectionScale[index] = 1.0;

      var s = SUB_SIZE * sectionScale[index], s_2 = s / 2;
      var x = (index % COLS) * SUB_SIZE + (SUB_SIZE_2 - s_2);
      var y = Math.floor(index / COLS) * SUB_SIZE + (SUB_SIZE_2 - s_2);

      var ds = Math.min(SUB_SIZE, s + PIXEL_BORDER);
      var bp = (ds - s) / 2;

      self.fillRectAt((index << 1) + 1, x - bp, y - bp, ds, ds);
      self.drawImageAt((index << 1) + 2, bitmap.canvas(), x + offsetX, y + offsetY, s, s, x, y, s, s);

      return true;
    };

    CanvasObject.Bitmap.withImage(path, function(_bitmap) {
      bitmap = _bitmap;
      
      if (bitmap.width() > SIZE) offsetX = (bitmap.width() - SIZE) / 2;
      if (bitmap.height() > SIZE) offsetY = (bitmap.height() - SIZE) / 2;

      var func, count = 0;
      var fade = 0.0;
      self.enterFrame(func = function() {
        fade += 0.005;
        self.fillStyle = 'rgba(0,0,0,' + fade + ')'; 
        self.fillRectAt(0, 0, 0, SIZE, SIZE);

//        self.context().fillStyle = 'rgba(0, 0, 0, 0.02)';
//        self.context().fillRect(self.x, self.y, SIZE, SIZE);

        var moveForward = !scaleSection(order[startTargetIndex]);
        for (var i = startTargetIndex + 1; i < endTargetIndex; i++)
          scaleSection(order[i]);

        if (moveForward) {
          startTargetIndex++;
          endTargetIndex++;
          endTargetIndex = Math.min(endTargetIndex, SECTIONS - 1);
        }

        if (count++ % SCALE_FRAME_OFFSET == 0 &&
          (endTargetIndex - startTargetIndex) < MAX_SCALES) {
          endTargetIndex++;
          endTargetIndex = Math.min(endTargetIndex, SECTIONS - 1);
        }

        if (startTargetIndex >= SECTIONS) {
          self.removeHandler('enterFrame', func);
          self.trigger('finshedDisplay');
        }
      });
    });
  };

  var Klass = function(_frame) {
    var self = this;
    var frame = _frame, buttons;
    var canvas = frame.getFrame().find("canvas");
    CanvasObject.Stage.call(this, canvas[0], FRAME_RATE);
    
    var images, imageIndex = 0;
    var pictures = [], pictureIndex = 0;
    var frameDelay = FRAME_DELAY;
    var order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    order.sort(function() { return Math.random() - 0.5; });

    this.resize(550, 550);
    this.setUpdateMethod(false, false);

    canvas.click(function(event) {
      var x = Math.floor(event.layerX / 184);
      var y = Math.floor(event.layerY / 184);
      var index = x + y * 3;

      if (pictures[order.indexOf(index)])
        window.open(pictures[order.indexOf(index)].url, "_blank");
    });

    var addPicture = function() {
      if (pictures[pictureIndex]) self.removeChild(pictures[pictureIndex]);

      var picture = new Picture(images[imageIndex].media.m);
      picture.url = images[imageIndex].link;
      self.addChild(picture);
      
      imageIndex++;

      var index = order[pictureIndex];

      picture.x = (index % 3) * (SIZE + 5);
      picture.y = Math.floor(index / 3) * (SIZE + 5);

      pictures[pictureIndex++] = picture;
      
      picture.finshedDisplay(function() {
        self.removeChild(picture);
      });

      pictureIndex %= 9;
      imageIndex %= images.length;
    };

    var initialize = function() {
      if (!frame) return;

      $.getJSON(FLICKR_PATH, function(data) {
        images = data.items;
        images.sort(function() { return Math.random() - 0.5; });

        var initialPics = 9, i = 0;
        var func;
        self.enterFrame(func = function() {
          if ((i++ % FRAME_RATE) === 0) {
            addPicture();
            if (--initialPics <= 0) this.removeHandler('enterFrame', func);
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