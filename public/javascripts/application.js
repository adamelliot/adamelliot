/**
 * Application framework for adamelliot.com
 * 
 * Uses jQuery and Pure. Backend is Sinatra and Datamapper, everything thin =)
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
      var base = location.href.split("#")[0];
//      var current = location.href.split("#")[1];
//      if (route == current) return false;

      location.href = base + "#" + route;
      AdamElliot.Router.route();
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
     */
    this.route = function() {
      var route = location.href.split("#")[1];
      if (!route) return false;

      var params = getParams(route);
      route = route.split("?")[0];

      // First check static mappings, if nothing matches, then check resources
      var target = mappings[route];
      if (target) {
        // Short cut for static routes to templates
        if (!target.action) return false;

        target.action.call(target.controller);
        return true;
      }

      var parts = route.split("/");
      var controller = parts[0].singularize();
      var action = parts[1]; // May be the id
      var id;

      var resource = resources[controller];
      if (!resource) return false;

      if (parts[0] == controller.pluralize())
        action = "index";
      else switch (action) {
        case "update":
        case "delete":
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

      return true;
    }
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
    var collection = $();
    var dir = 1;
    // Frames start at 100 and keep moving up on show to keep them forward
    var zIndex = 100;

    var getCurrentRoute = function() { return location.href.split("#")[1]; };
    var setRoute = function(path) {
      location.href = location.href.split("#")[0] + "#" + path;
    }
    var clearRoute = function() { setRoute(""); };

    var addButtonsToFrame = function(frame, buttons) {
      if (!buttons) return;
      var toolbar = frame.find(".toolbar");

      for (var key in buttons) {
        var button = $("<div class='button'>" + key + "</div>");
        
        if (typeof buttons[key] == "string")
          button.linkTo(buttons[key]);
        else button.click(buttons[key]);
        toolbar.append(button);
      }
    };

    var pushFrame = function(callback) {
      if (!currentFrame) return callback();

      dir *= -1;
      var w = $(window).width() / 4 * dir;
      currentFrame.animate({left:"+=" + w, opacity:0}, 300, function() {
        if (callback) callback();
      });
      currentFrame = null;
    };

    var dequeueFrame = function(route) {
      if (!frames[route]) return null;

      var frame = frames[route];

      if (frameStack[frameStack.length - 1] != route) {
        var w = $(window).width() / 4 * dir;
        var left = (($(window).width() - frame.width()) / 2) - w;
        frame.css({left:left, opacity:0});
      } else currentFrame = null; // FIXME: Prevent push from doing anything (HACK)
      
      for (var i = 0; i < frameStack.length; i++)
        if (frameStack[i] == route) {
          frameStack.splice(i, 1);
          i--;
        }

      return frame;
    };

    var popFrame = function(callback) {
      if (currentFrame) console.error("Frame in way, poping anyway.");

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

      dir *= -1;
      var w = $(window).width() / 4 * dir;
      var left = (($(window).width() - frame.width()) / 2) - w;
      currentFrame.css({left:left, opacity:0});
      currentFrame.animate({left:"+=" + w, opacity:1}, 300, function() {
        if (callback) callback();
      });

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

      currentFrame.animate({top:"+=60", opacity:0}, 300, function() {
        $(this).remove();
        if (callback) callback();
      });
      currentFrame = null;
    };

    // Shake the current frame a bit
    this.shakeFrame = function() {
      
    };

    this.showFrame = function(block, buttons) {
      AdamElliot.Menu.moveToTop();

      var route = getCurrentRoute();
      var frame = dequeueFrame(route);
      var left;

      if (!frame) {
        var frame = $(AdamElliot.TemplatManager.frame({block:block}));
        collection.add(frame);
        addButtonsToFrame(frame, buttons);

        $("body").append(frame);
        frame.find(".close").click(function() {
          AdamElliot.FrameManager.closeFrame();
        });

        var h = $(window).height();
        left = ($(window).width() - frame.width()) / 2;
        frame.css({top:h, left:left});
      } else {
        frame.find('.block').empty().append(block);
        left = ($(window).width() - frame.width()) / 2;
      }

      // Any forms added should not obey submit policy
      frame.find("form").submit(function(e) { return false; });
      frame.css("zIndex", zIndex++);

      frames[route] = frame;
      frameStack.push(route);

      pushFrame(function() {
        frame.animate({top:160, left:left, opacity:1}, 300);
      });

      currentFrame = frame;
    };

    this.closeFrame = function(callback) {
      destroyFrame(function() {
        if (!popFrame(callback)) {
          clearRoute();
          AdamElliot.Menu.moveToCenter();
        }
      });
    };

    $(window).resize(function() {
      if (!currentFrame) return;
      var w = ($(window).width() - currentFrame.width()) / 2;
      var h = $(window).height() - 200;
      currentFrame.css("left", w);
      currentFrame.find(".block").css("maxHeight", h);
    });

  };
  
  return Klass;
})();

/**
 * Main Application, the application controller
 */
AdamElliot.Application = (function() {
  var Klass = function() {
  };
  
  return Klass;
})();

$(function() {
  AdamElliot.PostsController = new AdamElliot.PostsController;
  AdamElliot.GeneralController = new AdamElliot.GeneralController;

  AdamElliot.Router = new AdamElliot.Router;

  AdamElliot.Router.map("login", AdamElliot.GeneralController, AdamElliot.GeneralController.login);
  AdamElliot.Router.resource("post");

  AdamElliot.TemplatManager = new AdamElliot.TemplatManager;
  AdamElliot.FrameManager = new AdamElliot.FrameManager;

  AdamElliot.Menu = new AdamElliot.Menu;
  AdamElliot.Dashboard = new AdamElliot.Dashboard;

  AdamElliot.Router.route();


/*  setTimeout(function() {
    app.showBlog();
  }, 2000);*/
});
