window.CanvasObject = window.CanvasObject || {};
CanvasObject.Events = CanvasObject.Events || {};

/**
 * Allows for a chain of methods to be associated and executed when a
 * specified method (or event name) is called or send to the object.
 */
CanvasObject.Events.EventListener = (function() {
  var Klass = function() {
    var events = {};

    /**
     * Merges another EventListener into this one.
     */
    this.inheritMerge = function(from) {
      events = from.events();
      for (var name in events)
        (function() {
          var n = name;
          this[n] = function(fn) { events[n].push(fn); };
        })();
    };

    /**
     * Used to create a short hand hook for setting events that objects
     * would listen to inherently.
     */
    this.defineHook = function(name) {
      // TODO: Raise warning if event name doesn't get added
      if (events[name] || this[name]) return;

      events[name] = [];
      this[name] = function(fn) { events[name].push(fn); };
    };
    this.events = function() { return events; };

    this.trigger = function(event) {
      var target = events[event];
      for (var i = 0; i < target.length; i++) target[i].apply(this, arguments);
    };

    this.bind = function(event, fn) {};
    this.unbind = function(event, fn) {};
  };

  return Klass;
})();
