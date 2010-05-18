window.CanvasObject = window.CanvasObject || {};

/**
 * Common base to allow for object heirachy maintenance, used internally.
 */
CanvasObject.Base = (function() {
  var Klass = function() {
    CanvasObject.Events.EventListener.call(this);
    CanvasObject.Geometry.Point.call(this);
    CanvasObject.Geometry.Rectangle.call(this);

    var parent;
    // State variables
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.scale = 1.0;

    this.defineHook('enterFrame');
    this.defineHook('afterRemove');

    // Place holder function.
    this.draw = function() {};
    this.drawInto = function(context) {};

    this.setParent = function(value) { parent = value; };
    this.parent = function() { return parent; };
    this.context = function() { return null; };
    
    this.remove = function() {
      if (parent) {
        parent.removeChild(this);
        this.trigger('afterRemove');
      }
    };
    
    this.applyTransform = function(context) {
      context.translate(this.x, this.y);
      context.rotate(this.rotation);
      context.scale(this.scale, this.scale);
    };
  };
  Klass.prototype = new CanvasObject.Events.EventListener;

  return Klass;
})();

/**
 * Represents a canvas context that has bitmap data. Bitmaps can be drawn
 * on each other to create cached graphics that are quick to draw.
 * 
 * All CanvasObjects can be converted to a bitmap.
 */
CanvasObject.Bitmap = (function() {
  var Klass = function(width, height) {
    CanvasObject.Base.call(this);
    
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
  Klass.prototype = new CanvasObject.Base;

  Klass.withImage = function(path, callback) {
    var image = new Image;
    image.onload = function() {
      var bitmap = new Klass(image.width, image.height);
      bitmap.context().drawImage(image, 0, 0);
      callback(bitmap);
    }
    image.src = path;
  };

  Klass.withCanvasObject = function(canvasObject) {
    var rect = CanvasObject.Geometry.Rectangle.fromRotated(canvasObject, canvasObject.rotation);
/*
    rect.left   += -canvasObject.shadowBlur + canvasObject.shadowOffsetX;
    rect.top    += -canvasObject.shadowBlur + canvasObject.shadowOffsetY;
    rect.right  +=  canvasObject.shadowBlur + canvasObject.shadowOffsetX;
    rect.bottom +=  canvasObject.shadowBlur + canvasObject.shadowOffsetY;
*/
    var bitmap = new CanvasObject.Bitmap(rect.width(), rect.height());

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
CanvasObject.Path = (function() {
  var METHODS = ['beginPath', 'closePath', 'moveTo', 'lineTo',
    'bezierCurveTo', 'quadraticCurveTo', 'arc', 'drawImage',
    'fillRect', 'strokeRect', 'fill', 'stroke'];
  var PROPS = ['fillStyle', 'strokeStyle', 'shadowOffsetX',
    'shadowOffsetY', 'shadowBlur', 'shadowColor'];

  var Klass = function() {
    CanvasObject.Base.call(this);

    var commands = [];

    // Setup the mappings for the methods that get called on the context
    for (var i = 0; i < METHODS.length; i++) {
      (function() {
        var command = METHODS[i];
        this[command] = function() {
          commands.push([command, arguments]);
          return commands.length - 1;
        };
        this[command + 'At'] = function() {
          // TODO: Creating a new array here maybe slow
          var arr = Array.prototype.slice.call(arguments);
          commands[arr.shift()] = [command, arr];
          return commands.length - 1;
        };
      }).call(this);
    }

    // All properties on the context get mapped as methods so they can 
    // be loaded easily and interact with the bounding regions.

    // ----- Commands that need to update the bounding box -----
    // TODO: Add the "At" commands to the bounding fixes

    this.moveTo = function(x, y) {
      this.includePoint({x:x, y:y});
      commands.push(['moveTo', arguments]);
      return commands.length - 1;
    };

    this.lineTo = function(x, y) {
      this.includePoint({x:x, y:y});
      commands.push(['lineTo', arguments]);
      return commands.length - 1;
    };

    this.bezierCurveTo = function(px1, py1, px2, py2, x, y) {
      this.includePoint({x:px1, y:py1});
      this.includePoint({x:px2, y:py2});
      this.includePoint({x:x, y:y});
      commands.push(['bezierCurveTo', arguments]);
      return commands.length - 1;
    };

    this.quadraticCurveTo = function(px, py, x, y) {
      this.includePoint({x:px, y:py});
      this.includePoint({x:x, y:y});
      commands.push(['quadraticCurveTo', arguments]);
      return commands.length - 1;
    };

    // ----- End Commands -----

    // NOTE: Make getters
    this.commands = function() { return commands; };
    // TODO: Need to add compressing commands that are now gone.
    this.removeCommandAt = function(index) { commands[index] = null; };

    /**
     * Clears the command stack
     */
    this.clear = function() { commands = []; };

    /**
     * Returns this object drawn into a Bitmap
     */
    this.toBitmap = function() {
      return CanvasObject.Bitmap.withCanvasObject(this);
    };

    /**
     * Draws this canvas object into a context
     */
    this.drawInto = function(context, boundingBox) {
      context.save();
      this.applyState(context);

      var commands = this.commands();
      for (var j = 0; j < commands.length; j++)
        if (commands[j])
          context[commands[j][0]].apply(context, commands[j][1]);

      context.restore();
    };

    /**
     * Set the context to the relevant state for drawing this object.
     */
    this.applyState = function(context) {
      this.applyTransform(context);

      for (var i = 0; i < PROPS.length; i++) {
        if (this[PROPS[i]])
          context[PROPS[i]] = this[PROPS[i]];
      }
    };
  };
  Klass.prototype = new CanvasObject.Base;

  return Klass;
})();

/**
 * Contains a set of canvas objects
 */
CanvasObject.Container = (function() {
  var Klass = function() {
    CanvasObject.Base.call(this);

    var children = [];

    this.addChild = function(child) {
      children.push(child);
      child.setParent(this);

      // TODO: Place this more carefully
      child._enterFrame = function() {
        child.trigger('enterFrame');
      }

      this.enterFrame(child._enterFrame);
    };
    // NOTE: Make a getter
    this.children = function() { return children; };
    
    this.removeChild = function(child) {
      for (var i = 0; i < children.length; i++)
        if (children[i] == child) break;
      
      if (i == children.length) return;
      children.splice(i, 1);

      this.removeHandler('enterFrame', child._enterFrame);
    };
    
    /**
     * Draws this object into a specified context.
     */
    this.drawInto = function(context) {
      context.save();
      this.applyTransform(context);
      for (var i = 0; i < children.length; i++)
        children[i].drawInto(context);
      context.restore();
    }
  };
  Klass.prototype = new CanvasObject.Base;

  return Klass;
})();

/**
 * Wrapper for the root canvas attached to the dom. Handles frame rates
 * and the like.
 */
CanvasObject.Stage = (function() {
  var Klass = function(target, _fps) {
    var self = this;
    var origin = new CanvasObject.Geometry.Point(0, 0);
    CanvasObject.Container.call(this);

    var interval, fps, currentFps = 0, canvas, context;
    var noClearDraw, clearDraw, updateFps, drawFunc;

    var initialize = function() {
      if (!target) return;

      canvas = typeof target == 'string' ? document.getElementById(target) : target;
      if (!canvas.getContext) throw "Uh oh! Can't get a context.";

      context = canvas.getContext('2d');
      if (!context) throw "Uh oh! Can't get a context.";

      drawFunc = clearDraw;
      this.enterFrame(drawFunc);
      this.setFrameRate(_fps);
    };
    
    noClearDraw = function() {
      self.drawInto(context);
    };

    this.clearFunc = function() {
      context.clearRect(-origin.x, -origin.y, canvas.width, canvas.height);
    };

    clearDraw = function() {
      self.clearFunc();
      self.drawInto(context);
    };

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
      };
    };
    updateFps();

    this.setUpdateMethod = function(clear, calcFps) {
      this.removeHandler('enterFrame', drawFunc);
      this.removeHandler('enterFrame', updateFps);

      if (clear) this.enterFrame(drawFunc = clearDraw);
      else this.enterFrame(drawFunc = noClearDraw);

      if (calcFps) this.enterFrame(updateFps);
    };
    
    /**
     * Sets the center point for this stage. Default is top left.
     */
    this.setOrigin = function(_origin) {
      if (typeof _origin == 'number')
        _origin = new CanvasObject.Geometry.Point(arguments[0], arguments[1]);

      origin = _origin;
      context.translate(origin.x, origin.y);
    };

    /**
     * Creates a interval that automatically redraws our objects via timer.
     */
    this.setFrameRate = function(value) {
      if (!value || interval != undefined) return;

      var ms = 1000 / (fps = value);
      interval = setInterval(function() { self.trigger('enterFrame'); }, ms);
    };

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
    initialize.call(this);
  };
  Klass.prototype = new CanvasObject.Container;

  return Klass;
})();
