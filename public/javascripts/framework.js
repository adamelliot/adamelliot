/**
 * Code base for adamelliot.com
 * Copyright (c) Adam Elliot 2010
 */

window.AdamElliot = window.AdamElliot || {};
 
/**
 * Map any element into the router to create browser history and map into
 * the desired controller.
 * 
 * Assumes AdamElliot.Router statically points to the router.
 */
(function($) {
  $.fn.linkTo = function(route) {
    this.click(function() {
      location.hash = route;
    });
  };

  $.fn.targetBlank = function() {
    $(this).find("a").each(function() {
      $(this).attr('target', '_blank');
    });
  };
  
  $.fn.bindDataRoute = function() {
    $(this).find("[data-route]").each(function() {
      $(this).linkTo($(this).attr('data-route'));
    });
  };

})(jQuery);

/**
 * Operates similar to other routers on ruby backends, maps url paths after
 * the hash into controllers.
 * 
 * Route matching is very basic, there's static matching and resource style
 * matching. That's all I need right now.
 */
AdamElliot.Router = (function() {
  var Klass = function() {
    var mappings = {};
    var resources = {};

    /**
     * Pull out the params in the path into an object.
     */
    var getParams = function(route) {
      var p = route.split("?").pop();
      var pairs = p.split("&");
      var params = {};
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split("=");
        params[pair[0]] = pair[1];
      }
      return params;
    };

    // Creates static mappings.
    this.map = function(path, controller, action) {
      mappings[path] = {controller:controller, action:action};
    };
    
    // Maps basic routes
    this.resource = function(path, controller) {
      var target = path.pluralize().capitalize() + "Controller";
      resources[path] = controller || AdamElliot[target];
    };

    /**
     * Causes the router to read the path and execute the route if one a
     * route exists. If routed returns true, otherwise returns false.
     * 
     * TODO: Refactor this into smaller parts
     */
    this.route = function() {
      var route = location.hash.split("#")[1];
      if (!route) {
        AdamElliot.frameManager.hideFrame();
        return false;
      }

      var params = getParams(route);
      route = route.split("?")[0];

      // Check static mappings, if nothing matches, then check resources
      var target = mappings[route];
      if (target) {
        // Short cut for static routes to templates
        if (!target.action) {
          AdamElliot.frameManager.hideFrame();
          return false;
        }

        target.action.call(target.controller);
        return true;
      }

      var parts = route.split("/");
      var controller = parts[0].singularize();
      var action = parts[1]; // May be the id
      var id;

      var resource = resources[controller];
      if (!resource) {
        AdamElliot.frameManager.hideFrame();
        return false;
      }

      if (parts[0] == controller.pluralize())
        action = "index";
      else switch (action) {
        case "update":
        case "remove":
          id = parts[2];
        case "create":
          break;
        default:
          action = 'show';
          id = parts[1];
          break;
      }

      if (id) params["id"] = id;
      action = resource[action];
      if (action) action.call(resource, params);
      else AdamElliot.frameManager.hideFrame();

      return true;
    }
  };
  
  return Klass;
})();

/**
 * Represents a frame object on the screen. Is used to attach callbacks
 * once instantiated.
 */
AdamElliot.Frame = (function() {
  var dir = 1;
  var zIndex = 100;

  var Klass = function(block) {
    var self = this;
    // jQuery object for the frame on the page.
    var frame = $(AdamElliot.TemplateManager.sharedTemplate('frame')({block:block}));
    var visible = false;

    var adjustContent = function() {
      // Any forms added should not obey submit policy
      frame.find("form").submit(function(e) { return false; });
      // Any selecte fiels with value attr set get translated to the option
      // TODO: Fix this in a better way (dates are complicated...)
      frame.find("select[value]").each(function() {
        if (this.getAttribute('value'))
          $(this).val(this.getAttribute('value'));
      });

      frame.bindDataRoute();
      frame.targetBlank();

      if ($.browser.mozilla && parseFloat($.browser.version.substr(0,3)) < 1.9) {
        // FF2 fix: Set the toolbar and nav bar's width to the same as the content
        var w = frame.find('.block').innerWidth() - 44;
        frame.find('.toolbar').css('width', w);
        frame.find('.navbar').css('width', w);
      }
    };

    var init = function() {
      $("#frames").append(frame);
      
      frame.find(".close").click(function() {
        AdamElliot.frameManager.closeFrame();
      });
      
      if ($.browser.msie ||
        ($.browser.mozilla && parseFloat($.browser.version.substr(0,3))))
        frame.css({paddingBottom: "120px"});

      var h = $(window).height();
      left = ($(window).width() - frame.width()) / 2;
      frame.css({
        display: "block",
        "zIndex": zIndex++,
        top: h,
        left: left
      });

      adjustContent();
    };

    // This is the delegate that recieves messages this frame posts
    this.delegate = null;

    this.setContent = function(block) {
      frame.find('.block').empty().append(block);
      
      adjustContent();
    }

    this.scrollTop = function() {
      $('body').animate({scrollTop:0}, 80, function() {
        frame.css('position', 'fixed');
      });
    };

    this.setToolbarButtons = function(buttons) {
      if (!buttons) return;
      var toolbar = frame.find(".toolbar > .buttons");
      toolbar.find(".button").remove();

      var buttonElements = {};
      for (var key in buttons) {
        var button = $("<div class='button'>" + key + "</div>");
        buttonElements[key] = button;
        
        if (typeof buttons[key] == "string")
          button.linkTo(buttons[key]);
        else button.click(buttons[key]);
        toolbar.append(button);
      }
      
      return buttonElements;
    };

    this.setButtons = function(buttons) {
      if (!buttons) return;
      var navbar = frame.find(".navbar");
      navbar.find(".button").remove();

      var buttonElements = {};
      for (var key in buttons) {
        var button = $("<div class='button'>" + key + "</div>");
        buttonElements[key] = button;

        if (typeof buttons[key] == "string")
          button.linkTo(buttons[key]);
        else button.click(buttons[key]);
        navbar.append(button);
      }

      return buttonElements;
    };

    this.center = function() {
      var w = ($(window).width() - frame.width()) / 2;
      frame.css("left", w);
    }

    // Shake the frame left and right
    this.shake = function(callback) {
      var right, left, times = 2;
      right = function() {
        frame.animate({left:"+=30"}, 100, left);
      };
      left = function() {
        if (times-- > 0)
          frame.animate({left:"-=30"}, 100, right);
        else
          frame.animate({left:"-=15"}, 50, callback);
      };

      frame.animate({left:"+=15"}, 50, left);
    };

    this.hide = function(callback) {
      if (!visible) {
        if (callback) callback();
        return;
      }

      if (self.delegate && self.delegate.beforeFrameHide)
        self.delegate.beforeFrameHide(self);

      dir *= -1;
      var w = $(window).width() / 4 * dir;
      frame.animate({left:"+=" + w, opacity:0}, 300, function() {
        if (self.delegate && self.delegate.afterFrameHide)
          self.delegate.afterFrameHide(self);

        visible = false;
        $(this).hide();
        if (callback) callback();
      });
    };

    this.show = function(callback) {
      if (visible) {
        if (callback) callback();
        return;
      }

      var left = ($(window).width() - frame.width()) / 2;
      frame.animate({left:left, top:0, opacity:1}, 300, function() {
        visible = true;
        frame.css('position', 'absolute');
        $(this).show();
        if (callback) callback();
      });
    };

    // Place the frame where it should be to slide in
    this.prepairToShow = function() {
      var w = $(window).width() / 4 * dir;
      var left = (($(window).width() - frame.width()) / 2) - w;
      frame.css({display:'block', left:left, opacity:0});
    };

    this.destroy = function(callback) {
      if (self.delegate && self.delegate.beforeFrameDestroy)
        self.delegate.beforeFrameDestroy(self);

//      frame.css({position: 'fixed'});
      frame.animate({top:"+=60", opacity:0}, 300, function() {
        if (self.delegate && self.delegate.afterFrameDestroy)
          self.delegate.afterFrameDestroy(self);

        if (callback) callback();
        // Do the remove second as it can be slow, this may create
        // an interface bug, so watch for it.
        $(this).remove();
      });
    };

    // Return the jQuery frame object;
    // TODO: Name this better
    this.getFrame = function() { return frame; };

    init.call(this);
  };
  
  return Klass;
})();

/**
 * Handles blocks returned from the TemplatManager
 */
AdamElliot.FrameManager = (function() {
  var Klass = function() {

    var frames = {};
    var frameStack = [];

    var currentFrame;
    var dir = 1;
    // Frames start at 100 and keep moving up on show to keep them forward
    var zIndex = 100;

    var getCurrentRoute = function() { return location.hash.split("#")[1]; };
    var setRoute = function(path) {
      location.hash = path || "";
    }
    var clearRoute = function() { setRoute(""); };

    var pushFrame = function(callback) {
      if (!currentFrame) {
        if (callback) callback();
        return;
      }

      currentFrame.scrollTop();
      currentFrame.hide(callback);
      currentFrame = null;
    };

    var dequeueFrame = function(route) {
      if (!frames[route]) return null;

      var frame = frames[route];

      if (frameStack[frameStack.length - 1] != route)
        frame.prepairToShow();
      else currentFrame = null;

      for (var i = 0; i < frameStack.length; i++)
        if (frameStack[i] == route) {
          frameStack.splice(i, 1);
          i--;
        }

      return frame;
    };

    var popFrame = function(callback) {
      if (currentFrame) console.error("Frame in way, popping anyway.");

      if (frameStack.length <= 0) {
        if (callback) callback();
        return false;
      }
      var route = frameStack[frameStack.length - 1];
      var frame = frames[route];

      if (!frame) {
        if (callback) callback();
        return false;
      }
      currentFrame = frame;

      currentFrame.prepairToShow();
      currentFrame.show(callback);

      setRoute(route);

      return true;
    };

    var destroyFrame = function(callback) {
      if (!currentFrame) return callback();

      var route = getCurrentRoute();
      for (var i = 0; i < frameStack.length; i++)
        if (frameStack[i] == route) {
          frameStack.splice(i, 1);
          i--;
        }
      delete frames[route];

      currentFrame.destroy(callback);
      currentFrame = null;
    };

    // Shake the current frame a bit
    this.shakeFrame = function() {
      if (currentFrame) currentFrame.shake();
    };

    this.showFrame = function(block, buttons, preserveBlock) {
      AdamElliot.menu.moveToTop();

      var route = getCurrentRoute();
      var frame = dequeueFrame(route);

      if (!frame)
        frame = new AdamElliot.Frame(block);
      else if (!preserveBlock)
        frame.setContent(block);

      frame.setButtons(buttons);
      frames[route] = frame;
      frameStack.push(route);

      pushFrame(function() {
        frame.show();
      });

      return currentFrame = frame;
    };

    this.closeFrameByRoute = function(route, callback) {
      var frame = frames[route];

      if (!frame) return;
      if (frame == currentFrame) {
        this.closeFrame();
        return;
      }

      frame.destroy(callback);
      delete frames[route];
      for (var i = 0; i < frameStack.length; i++)
        if (frameStack[i] == route) {
          frameStack.splice(i, 1);
          break;
        }
    };

    this.closeFrame = function(callback) {
      if (!currentFrame) return;
      destroyFrame(function() {
        if (!popFrame(callback)) {
          clearRoute();
          AdamElliot.menu.moveToCenter();
        }
      });
    };

    this.hideFrame = function(callback) {
      if (!currentFrame) return;
      pushFrame(function() {
        AdamElliot.menu.moveToCenter();
      });
    };

    this.closeAllFrames = function(callback) {
      for (var i = 0; i < frameStack.length; i++) {
        var route = frameStack[i]
        var frame = frames[route];
        if (currentFrame != frame) frame.remove();
      }
      frames = {};
      frameStack = [];
      this.closeFrame();
    };

    $(window).resize(function() {
      if (currentFrame) currentFrame.center();
    });

  };
  
  return Klass;
})();

/**
 * Template manage, compiles the templates at load, and handles the binding
 * of data and how they display.
 */
AdamElliot.TemplateManager = (function() {
  var Klass = function (_controllerName) {
    var controllerName = _controllerName.singularize();
    var templates = {};

    this.defineTemplate = function(type, binding) {
      templates[type] = $('#templates .' + controllerName + '.' + type).compile(binding);
    };
    
    this.template = function(type) {
      return templates[type];
    };

    // Renders the specified action and shows it in the frame manager
    this.render = function(action, data, navbar, preserveBlock) {
      var block = templates[action](data);
      return AdamElliot.frameManager.showFrame(block, navbar, preserveBlock);
    };
  };

  var sharedTemplates = {};
  Klass.sharedTemplate = function(name) {
    return sharedTemplates[name];
  };
  
  Klass.renderShared = function(name, data, navbar) {
    var block = sharedTemplates[name](data);
    return AdamElliot.frameManager.showFrame(block, navbar);
  };

  var showBox = function(type, title, message, buttons) {
    if (!buttons) buttons = {
      'ok': function() { AdamElliot.frameManager.closeFrame(); }
    };

    AdamElliot.TemplateManager.renderShared(type, {
      'title': title,
      'message': message
    }, buttons);
  };

  Klass.showNotice = function(title, message, buttons) {
    showBox('notice', title, message, buttons);
  };

  Klass.showError = function(title, message, buttons) {
    showBox('error', title, message, buttons);
  };

  Klass.showUnsupported = function() {
    AdamElliot.TemplateManager.renderShared('unsupported', {}, {
      'ok': function() { AdamElliot.frameManager.closeFrame(); }
    });
  };

  // Define the shared templates. (Needs to be done post load)
  $(function() {
    sharedTemplates.error = $("#templates .shared .error").compile({
      '.title': 'title',
      '.message': 'message'
    });
    sharedTemplates.notice = $("#templates .shared .notice").compile({
      '.title': 'title',
      '.message': 'message'
    });

    sharedTemplates.frame = $('#templates .shared .frame').compile({
      '.block': 'block'
    });

    sharedTemplates.unsupported = $("#templates .shared .unsupported").compile();
  });

  return Klass;
})();

/**
 * Basic controller object.
 */
AdamElliot.Controller = (function() {
  var Klass = function(_controllerName) {
    var modelName = (_controllerName || "").singularize();
    var activeBlock;

    this.templateManager = new AdamElliot.TemplateManager(modelName);
    this.activeBlock = function() { return activeBlock; };

    this.triggerOnce = function(func) {
      var triggered = false;

      return function() {
        if (!triggered) {
          var args = Array.prototype.slice.call(arguments);
          args.shift();
          func.apply(this, args);
        }
        triggered = true;
      };
    };
    
    this.render = function(name, data, buttons, preserveBlock) {
      var frame = this.templateManager.render(name, data, buttons, preserveBlock);
      activeBlock = frame.getFrame();
      return frame;
    };

    this.redirect = function(route) {
      location.hash = route;
    };
  };
  
  return Klass;
})();

/**
 * ResourceController controller type. Used in the resourceful situation.
 */
AdamElliot.ResourceController = (function() {
  var Klass = function(_controllerName) {
    var modelName = (_controllerName || "").singularize();
    var self = this;
    AdamElliot.Controller.call(this, modelName);

    // The chunk where model are stored.
    var data = {};
    var dataIndex = [];
    this.dataKey = 'id';
    this.dataOrderKey = 'id';
    this.descendingOrder = false;

    // Data management functions

    this.orderCompare = function(o1, o2) {
      return (data[o1][self.dataOrderKey] - data[o2][self.dataOrderKey]) *
        (self.descendingOrder ? -1 : 1);
    };

    this.getSortedData = function() {
      var result = [];
      for (var i = 0; i < dataIndex.length; i++)
        result.push(data[dataIndex[i]]);
      return result;
    };

    this.getDataByIndex = function(index) {
      return data[dataIndex[index]];
    };

    this.getData = function(key) {
      return data[key];
    };

    this.formHandler = function(data) { return data; };
    this.dataMangler = function(data) { return data; };

    // TODO: Resorting every time is a crappy way of doing things
    var indexData = function() {
      dataIndex = [];
      for (var key in data) dataIndex.push(key);
      dataIndex.sort(self.orderCompare);
      for (var i = 0; i < dataIndex.length; i++)
        data[dataIndex[i]]._index = i;
    };

    // Insert array of objects or single objects into the data store
    var insert = function(objects) {
      if (!objects) return null;
      if (objects instanceof Array)
        for (var i = 0; i < objects.length; i++)
          data[objects[i][self.dataKey]] = self.dataMangler(objects[i]);
      else
        data[objects[self.dataKey]] = self.dataMangler(objects);

      indexData();
    };

    var remove = function(id) {
      delete data[id];
      dataIndex.splice(dataIndex.indexOf(id), 1);
      AdamElliot.frameManager.closeFrameByRoute(modelName + "/" + id);
    };

    // Default event handlers
    this.afterCreate = this.afterUpdate = this.afterRemove = function() {
      AdamElliot.frameManager.closeFrame();
    };
    
    this.failedCreate = this.failedUpdate = this.failedRemove = function() {
      AdamElliot.frameManager.shakeFrame();
    };

    // Remote calls. These are the methods executed on the server.

    this.remoteIndex = function() {
      if (self.beforeData) self.beforeData();

      $.ajax({
        url: '/' + modelName.pluralize() + '.json',
        dataType: 'json',
        success: function(data) {
          insert(data);
          if (self.afterData) self.afterData(data);
        },
        error: function(a, b, c) {
          console.log("Remote Index Bad", a, b, c);
          if (self.failedData) self.failedData();
        }
      });
    };

    this.remoteShow = function(id) {
      if (self.beforeData) self.beforeData();

      $.ajax({
        url: '/' + modelName + '/' + id + '.json',
        dataType: 'json',
        success: function(data) {
          insert(data);
          if (self.afterData) self.afterData(id, data);
        },
        error: function() {
          if (self.failedData) self.failedData(id);
        }
      });
    };

    this.remoteCreate = function() {
      if (self.beforeCreate) self.beforeCreate();
      if (!self.activeBlock()) {
        if (self.failedCreate) self.failedCreate();
        return;
      }
      var data = self.activeBlock().find('form').serializeArray();
      if (!data) {
        if (self.failedCreate) self.failedCreate();
        return;
      }
      
      data = self.formHandler(data);

      $.ajax({
        url: '/' + modelName + '.json',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function(data) {
          insert(data);
          if (self.afterCreate) self.afterCreate(data);
        },
        error: function() {
          if (self.failedCreate) self.failedCreate();
        }
      });
    };

    this.remoteUpdate = function(id) {
      if (self.beforeUpdate) self.beforeUpdate(id);
      if (!self.activeBlock()) {
        if (self.failedUpdate) self.failedUpdate(id);
        return;
      }
      var data = self.activeBlock().find('form').serializeArray();
      if (!data) {
        if (self.failedUpdate) self.failedUpdate(id);
        return;
      }

      data = self.formHandler(data);

      $.ajax({
        url: '/' + modelName + '/' + id + '.json',
        type: 'PUT',
        dataType: 'json',
        data: data,
        success: function(data) {
          insert(data);
          if (self.afterUpdate) self.afterUpdate(id, data);
        },
        error: function() {
          if (self.failedUpdate) self.failedUpdate(id);
        }
      });
    };

    this.remoteRemove = function(id) {
      if (self.beforeRemove) self.beforeRemove(id);

      $.ajax({
        url: '/' + modelName + '/' + id + '.json',
        type: 'DELETE',
        dataType: 'json',
        success: function() {
          remove(id);
          if (self.afterRemove) self.afterRemove(id);
        },
        error: function() {
          if (self.failedRemove) self.failedRemove(id);
        }
      });
    };

    // Handles the situation where show is called without an id
    this.showFirst = function(params) {
      if (dataIndex.length == 0) {
        if (!params._noFetch) {
          self.afterData = self.triggerOnce(function() { self.show({_noFetch:true}); });
          self.remoteIndex();
        } else
          console.log("No data to be had!");
        return null;
      }

      self.redirect(modelName + "/" + data[dataIndex[0]][self.dataKey]);
    };

    // Local routes. These are bound to resource routes.

    this.index = function(params) {
      self.remoteIndex();
    };

    this.show = function(params) {
      if (!params[self.dataKey]) return self.showFirst(params);
      var obj = null, id = params[self.dataKey];
      if (!(obj = data[id])) {
        if (!params._noFetch) {
          params._noFetch = true;
          self.afterData = this.triggerOnce(function() { self.show(params); });
        }
        self.remoteShow(id);
        return null;
      }

      return obj;
    };

    this.create = function(params) {
      self.render('form', null, {
        'save': self.remoteCreate
      }, true);
    };
    
    this.update = function(params) {
      var id = params[self.dataKey];
      self.render('form', data[id], {
        'save': function() { self.remoteUpdate(id); }
      }, true);
    };
    
    this.remove = function(params) {
      var id = params[self.dataKey];
      AdamElliot.TemplateManager.showNotice("Confirm Delete",
        'Are you sure you want to delete?', {
        'no': function() { AdamElliot.frameManager.closeFrame(); },
        'yes': function() { self.remoteRemove(id); }
      });
    };
  };
  Klass.prototype = new AdamElliot.Controller;

  return Klass;
})();
