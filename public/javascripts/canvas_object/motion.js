window.CanvasObject = window.CanvasObject || {};
CanvasObject.Motion = CanvasObject.Motion || {};

CanvasObject.Motion.MovingBody = (function() {
  var Klass = function() {
    Object.inherit(CanvasObject.Geometry.Point);
    Object.inherit(events.EventListener);

    this.defineHook('update');

    this.acc = new CanvasObject.Geometry.Vector();
    this.vel = new CanvasObject.Geometry.Vector();

    this.update(function() {
      this.add(this.vel);
      this.vel.add(this.acc);
    });
  };
  
  return Klass;
})();
