window.motion = window.motion || {};

window.motion.MovingBody = (function() {
  var Klass = function() {
    Object.inherit(geometry.Point);
    Object.inherit(events.EventListener);

    this.defineHook('update');

    this.acc = new geometry.Vector();
    this.vel = new geometry.Vector();

    this.update(function() {
      this.add(this.vel);
      this.vel.add(this.acc);
    });
  };
  
  return Klass;
})();
