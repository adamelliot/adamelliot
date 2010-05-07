/**
 * toy.js
 * 
 * Base toy object which provides hooks for the actual toys back to the 
 * frame and the pieces it provides.
 */
window.AdamElliot = window.AdamElliot || {};
window.AdamElliot.Toys = window.AdamElliot.Toys || {};

AdamElliot.Toy = (function() {
  var Klass = function(_frame, _fps) {
    var self = this;
    var frame = _frame, buttons;
    var fps = _fps || 24;
    if (frame && CanvasObject)
      CanvasObject.Stage.call(this, frame.getFrame().find("canvas")[0], fps);
    
    var initialize = function() {
      if (!frame) return;

      buttons = frame.setToolbarButtons({
        'play': function() { self.play(); },
        'stop': function() { self.stop(); },
        'fps': function() {}
      });

      setInterval(function() {
        buttons['fps'].text('fps: ' + self.fps());
      }, 500);
    };

    initialize.call(this);
  };

  Klass.loadCanvasObject = function(callback) {
    if (window.CanvasObject) {
      if (callback) callback();
      return;
    }

    $.getScript("/javascripts/canvas_object.min.js", function() {
      var timer = setInterval(function() {
        if (!window.CanvasObject) return;
        clearInterval(timer);
        Klass.prototype = new CanvasObject.Stage;
        if (callback) callback();
      }, 100);
    });
  };

  Klass.loadToy = function(name, frame, callback) {
    var path = '/javascripts/toys/' + name.underscore() + '.js';

    Klass.loadCanvasObject(function() {
      $.getScript(path, function() {
        var klass = name.camelize();
        var timer = setInterval(function() {
          if (!AdamElliot.Toys[klass]) return;
          clearInterval(timer);
          callback(new AdamElliot.Toys[klass](frame, 1));
        }, 100);
      });
    });
  };

  return Klass;
})();