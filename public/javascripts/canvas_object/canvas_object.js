(function() {
  /**
   * Common base to allow for object heirachy maintenance, used internally.
   */
  var CanvasBase = (function() {
    var Klass = function() {
      Object.inherit(this, events.EventListener);
      Object.inherit(this, geometry.Point);
      Object.inherit(this, geometry.Rectangle);

      var parent;

      this.defineHook('enterFrame');
      this.defineHook('onRemove');

      // Place holder function.
      this.draw = function() {};
      this.drawInto = function(context) {};

      this.setParent = function(value) { parent = value; };
      this.parent = function() { return parent; };
      this.context = function() { return null; };
    };

    return Klass;
  })();

  /**
   * Represents a canvas context that has bitmap data. Bitmaps can be drawn
   * on each other to create cached graphics that are quick to draw.
   * 
   * All CanvasObjects can be converted to a bitmap.
   */
  var CanvasBitmap = (function() {
    var Klass = function(width, height) {
      Object.inherit(this, CanvasBase);
      
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      var context = canvas.getContext('2d');

      this.canvas = function() { return canvas; };
      this.context = function() { return context; };

      this.drawInto = function(context) {
        context.drawImage(this.canvas(), this.x, this.y);
      };

      this.addBitmap = function(bitmap) {
        bitmap.drawInto(context);
      };
      
      this.width = function() { return canvas.width; };
      this.height = function() { return canvas.height; };
    };

    Klass.withCanvasObject = function(canvasObject) {
      var rect = geometry.Rectangle.fromRotated(canvasObject, canvasObject.rotation);
/*
      rect.left   += -canvasObject.shadowBlur + canvasObject.shadowOffsetX;
      rect.top    += -canvasObject.shadowBlur + canvasObject.shadowOffsetY;
      rect.right  +=  canvasObject.shadowBlur + canvasObject.shadowOffsetX;
      rect.bottom +=  canvasObject.shadowBlur + canvasObject.shadowOffsetY;
*/
      var bitmap = new CanvasBitmap(rect.width(), rect.height());

      bitmap.x = rect.left + canvasObject.x;
      bitmap.y = rect.top + canvasObject.y;

      var x = canvasObject.x;
      var y = canvasObject.y;
      
      canvasObject.x = -rect.left;
      canvasObject.y = -rect.top;

      canvasObject.drawInto(bitmap.context());
      
      canvasObject.x = x;
      canvasObject.y = y;
      
      var ctx = bitmap.context();

      return bitmap;
    };
    
    return Klass;
  })();

  /**
   * Basic object used to contain graphics, will need to be placed in a
   * container to be used. Does all the abstraction of methods.
   */
  var CanvasObject = (function() {
    const METHODS = ['beginPath', 'closePath', 'moveTo', 'lineTo',
      'bezierCurveTo', 'quadraticCurveTo', 'arc', 'drawImage',
      'fillRect', 'strokeRect', 'fill', 'stroke'];
    const PROPS = ['fillStyle', 'strokeStyle', 'shadowOffsetX',
      'shadowOffsetY', 'shadowBlur', 'shadowColor'];

    var Klass = function() {
      Object.inherit(this, CanvasBase);

      var commands = [];

      // State variables
      this.x = 0;
      this.y = 0;
      this.rotation = 0;


      // Setup the mappings for the methods that get called on the context
      for (var i = 0; i < METHODS.length; i++) {
        (function() {
          var command = METHODS[i];
          this[command] = function() {
            commands.push([command, arguments]);
          }
        }).call(this);
      }

      // All properties on the context get mapped as methods so they can 
      // be loaded easily and interact with the bounding regions.

      // ----- Commands that need to update the bounding box -----

      this.moveTo = function(x, y) {
        this.includePoint({x:x, y:y});
        commands.push(['moveTo', arguments]);
      };

      this.lineTo = function(x, y) {
        this.includePoint({x:x, y:y});
        commands.push(['lineTo', arguments]);
      };

      this.bezierCurveTo = function(px1, py1, px2, py2, x, y) {
        this.includePoint({x:px1, y:py1});
        this.includePoint({x:px2, y:py2});
        this.includePoint({x:x, y:y});
        commands.push(['bezierCurveTo', arguments]);
      };

      this.quadraticCurveTo = function(px, py, x, y) {
        this.includePoint({x:px, y:py});
        this.includePoint({x:x, y:y});
        commands.push(['quadraticCurveTo', arguments]);
      };

      // ----- End Commands -----

      // NOTE: Make getters
      this.commands = function() { return commands; };

      /**
       * Clears the command stack
       */
      this.clear = function() { commands = []; };

      this.remove = function() { this.trigger('onRemove'); };

      /**
       * Returns this object drawn into a CanvasBitmap
       */
      this.toBitmap = function() { return CanvasBitmap.withCanvasObject(this); }

      /**
       * Draws this canvas object into a context
       */
      this.drawInto = function(context, boundingBox) {
        context.save();
        this.applyState(context);

        var commands = this.commands();
        for (var j = 0; j < commands.length; j++)
          context[commands[j][0]].apply(context, commands[j][1]);
/*
        context.strokeStyle = Color.red().toString();
        context.beginPath();
        context.strokeRect(
          Math.round(this.left) + 0.5,
          Math.round(this.top) + 0.5,
          Math.round(this.width()),
          Math.round(this.height()));
        context.closePath();
*/
        context.restore();
/*
        var rect = geometry.Rectangle.fromRotated(this, this.rotation);
        context.strokeStyle = Color.red().toString();
        context.beginPath();
        context.strokeRect(
          Math.round(rect.left + this.x) + 0.5,
          Math.round(rect.top + this.y) + 0.5,
          Math.round(rect.width()),
          Math.round(rect.height()));
        context.closePath();
*/
      };

      /**
       * Set the context to the relevant state for drawing this object.
       */
      this.applyState = function(context) {
        context.translate(this.x, this.y);
        context.rotate(this.rotation);

        for (var i = 0; i < PROPS.length; i++) 
          context[PROPS[i]] = this[PROPS[i]];
      };
    };

    return Klass;
  })();

  /**
   * Contains a set of canvas objects
   */
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
        for (var i = 0; i < children.length; i++)
          children[i].drawInto(context);
      }
    };

    return Klass;
  })();

  /**
   * Wrapper for the root canvas attached to the dom. Handles frame rates
   * and the like.
   */
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

      this.resize = function(width, height) {
        canvas.width = width;
        canvas.height = height;
        this.trigger('enterFrame');
      };

      /**
       * Toggle the playing of the stage.
       */
      this.stop = function() { clearInterval(interval); interval = undefined; };
      this.play = function() { this.setFrameRate(fps); };
      
      this.fps = function() { return currentFps; };
      this.context = function() { return context; };

      // ---- Initializer Code ----
      this.setFrameRate(_fps);
//      this.trigger('enterFrame');
    };

    return Klass;
  })();

  window.Color = Color;
  window.CanvasBitmap = CanvasBitmap;
  window.CanvasObject = CanvasObject;
  window.CavnasObjectContainer = CavnasObjectContainer;
  window.CanvasStage = CanvasStage;
})();
