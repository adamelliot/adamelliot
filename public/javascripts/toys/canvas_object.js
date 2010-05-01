(function() {
  Object.inherit = function(target, base) {
    var klass = typeof base == 'function' ? new base : base;
    for (var prop in klass) target[prop] = klass[prop];
  };

  /**
   * Color Helper Class
   */
  var Color = (function() {

    var Base = function(r, g, b, a) {
      this.red      = r;
      this.green    = g;
      this.blue     = b;
      this.alpha    = a;
    };

    Base.prototype.toString = function() {
      return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";
    };

    var Klass = function() {
      switch (arguments.length) {
        case 0:
          return new Base(0, 0, 0, 1.0);
        case 1:
        case 2:
          return Color.fromHex(arguments[0], arguments[1]);
        default:
          return new Base(0, 0, 0, 1.0);
      }
    };

    Klass.fromHex = function(hex, alpha) {
      return new Base(hex >> 16, (hex >> 8) & 0xff, hex & 0xff, alpha || 1.0);
    };
    
    Klass.random = function(alpha) {
      return Klass.fromHex(Math.floor(Math.random() * 0xffffff), alpha);
    };

    Klass.randomGrey = function(alpha) {
      var color = Math.floor(Math.random() * 128) + 120;
      return new Base(color, color, color, alpha || 1.0);
    };

    return Klass;
  })();

  /**
   * Allows for a chain of methods to be associated and executed when a
   * specified method (or event name) is called or send to the object.
   */
  var EventChain = (function() {
    var Klass = function() {
      var events = {};

      /**
       * Used to create a short hand hook for setting events that objects
       * would listen to inherently.
       */
      this.defineHook = function(name) {
        // TODO: Damage check

        events[name] = [];
        this[name] = function(fn) { events[name].push(fn); };
      };

      this.trigger = function(event) {
        var target = events[event];
        for (var i = 0; i < target.length; i++) target[i].call(this);
      };

      this.bind = function(event, fn) {};
      this.unbind = function(event, fn) {};
    };

    return Klass;
  })();

  /**
   * Common base to allow for object heirachy maintenance, used internally.
   */
  var CanvasBase = (function() {
    var Klass = function() {
      Object.inherit(this, EventChain);
      
      var parent;

      this.defineHook('enterFrame');

      // Place holder function.
      this.draw = function() {};

      this.setParent = function(value) { parent = value; };
      this.parent = function() { return parent; };
    };

    return Klass;
  })();

  /**
   * Basic object used to contain graphics, will need to be placed in a
   * container to be used. Does all the abstraction of methods.
   */
  var CanvasObject = (function() {
    const METHODS = ['beginPath', 'endPath', 'moveTo', 'lineTo',
      'bezierCurveTo', 'quadraticCurveTo', 'arc', 'drawImage',
      'fillRect', 'strokeRect', 'fill', 'stroke'];
    const PROPS = ['fillStyle', 'strokeStyle'];

    var Klass = function() {
      var commands = [];

      Object.inherit(this, CanvasBase);
      
      // State variables
      this.x = 0;
      this.y = 0;
      this.rotate = 0;

      for (var i = 0; i < METHODS.length; i++) {
        (function() {
          var command = METHODS[i];
          this[command] = function() {
            commands.push([command, Array.prototype.slice.call(arguments)]);
          }
        }).call(this);
      }
      
      // NOTE: Make getters
      this.commands = function() { return commands; };

      /**
       * Clears the command stack
       */
      this.clear = function() { commands = []; };

      /**
       * Set the context to the relevant state for drawing this object.
       */
      this.applyState = function(context) {
        context.translate(this.x, this.y);
        context.rotate(this.rotate);
        
        for (var i = 0; i < PROPS.length; i++) 
          context[PROPS[i]] = this[PROPS[i]];
      };
    };

    return Klass;
  })();

  var CavnasObjectContainer = (function() {
    var Klass = function() {
      Object.inherit(this, CanvasBase);

      var children = [];

      this.addChild = function(child) {
        children.push(child);
        child.setParent(this);

        this.enterFrame(function() {
          child.trigger('enterFrame');
        });
      };
      // NOTE: Make a getter
      this.children = function() { return children; };
      
      /**
       * Draws this object into a specified context.
       */
      this.drawInto = function(context) {
        var child;
        for (var i = 0; i < children.length; i++) {
          context.save();
          child = children[i];
          child.applyState(context);

          commands = children[i].commands();
          for (var j = 0; j < commands.length; j++)
            context[commands[j][0]].apply(context, commands[j][1]);

          context.restore();
        }
      }
    };

    return Klass;
  })();

  var CanvasStage = (function() {
    var Klass = function(target, _fps) {
      Object.inherit(this, CavnasObjectContainer);

      var canvas = typeof target == 'string' ? document.getElementById(target) : target;
      if (!canvas.getContext) throw "Uh oh! Can't get a context.";

      var context = canvas.getContext('2d');
      if (!context) throw "Uh oh! Can't get a context.";

      var interval, fps, currentFps = 0;

      /**
       * FPS Counter
       */
      var updateFps = function() {
        var lastTime = 0, lastDiff = 0;
        var i = 0;

        updateFps = function() {
          var time = (new Date()).getTime();
          var diff = (time - lastTime);
          
          lastDiff = diff * 0.5 + lastDiff * 0.5;
          lastTime = time;
          
          currentFps = Math.round(1000 / lastDiff);
        }
      }

      /**
       * Core drawing function, pull the command list from
       */
      this.enterFrame(function() {
//        context.fillStyle = 'rgba(255, 255, 255, 0.02)';
//        context.fillRect(0, 0, canvas.width, canvas.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawInto(context);
        updateFps.call(this);
      });

      /**
       * Creates a interval that automatically redraws our objects via timer.
       */
      this.setFrameRate = function(value) {
        if (!value || interval != undefined) return;

        var ms = 1000 / (fps = value);
        var self = this;
        interval = setInterval(function() { self.trigger('enterFrame'); }, ms);
      }

      this.width = function() { return canvas.width; };
      this.height = function() { return canvas.height; };

      /**
       * Toggle the playing of the stage.
       */
      this.stop = function() { clearInterval(interval); interval = undefined; };
      this.play = function() { this.setFrameRate(fps); };
      
      this.fps = function() { return currentFps; };
      this.context = function() { return context; };

      // ---- Initializer Code ----
      this.setFrameRate(_fps);
    };

    return Klass;
  })();

  window.Color = Color;
  window.CanvasObject = CanvasObject;
  window.CavnasObjectContainer = CavnasObjectContainer;
  window.CanvasStage = CanvasStage;
})();
