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
  
  var Klass = function() {
    
  };

  Klass.loadCanvasObject = function() {
    if (canvasObjectLoaded) return;
    canvasObjectLoaded = true;
  };

  Klass.loadToy = function(name) {
    
  };

  return Klass;
})();