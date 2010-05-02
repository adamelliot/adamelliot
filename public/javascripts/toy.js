/**
 * toy.js
 * 
 * Base toy object which provides hooks for the actual toys back to the 
 * frame and the pieces it provides.
 */
window.AdamElliot = window.AdamElliot || {};
window.AdamElliot.Toys = window.AdamElliot.Toys || {};

AdamElliot.Toy = (function() {
  var canvasObjectLoaded = false;
  
  var Klass = function(_frame) {
    var frame = _frame;

    this.getCanvas = function() {
      return frame.getFrame().find("canvas");
    };

    // Place holders for the Stage's methods
    this.stop = function() {};
    this.play = function() {};
  };

  Klass.loadCanvasObject = function(callback) {
    if (canvasObjectLoaded) {
      callback();
      return;
    }
    canvasObjectLoaded = true;

    $.getScript("/javascripts/canvas_object/common.js");
    $.getScript("/javascripts/canvas_object/color.js");
    $.getScript("/javascripts/canvas_object/events.js");
    $.getScript("/javascripts/canvas_object/geometry.js");
    $.getScript("/javascripts/canvas_object/motion.js");
    $.getScript("/javascripts/canvas_object/canvas_object.js", callback);
  };

  Klass.loadToy = function(name, frame, callback) {
    var path = '/javascripts/toys/' + name.underscore() + '.js';

    Klass.loadCanvasObject(function() {
      $.getScript(path, function() {
        callback(new AdamElliot.Toys[name.camelize()](frame, 24));
      });
    });
  };

  return Klass;
})();