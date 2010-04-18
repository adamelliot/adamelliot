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
 * Template manage, compiles the templates at load, and handles the binding
 * of data and how they display.
 */
AdamElliot.TemplatManager = (function() {
  var Klass = function () {

    // = = = = Template Compilation = = = = 

    this.login = $("#templates .login").compile();
    this.bio = $("#templates .bio").compile();

    this.frame = $('#templates .frame').compile({
      '.block': 'block'
    });

    this.post = $('#templates .post').compile({
      '.title': 'title',
      '.body': 'body',
      '.date': 'date'
    });
  };

  return Klass;
})();

/**
 * Handles blocks returned from the TemplatManager
 */
AdamElliot.FrameManager = (function() {
  var Klass = function() {
    var currentFrame;
    var collection;

    var addButtonsToFrame = function(frame, buttons) {
      if (!buttons) return;
      var toolbar = frame.find(".toolbar");

      for (var key in buttons) {
        var button = $("<div class='button'>" + key + "</div>");
        button.click(buttons[key]);
        toolbar.append(button);
      }
    };

    // TODO: Frame queuing and dismissal
    this.showFrame = function(block, buttons) {
      AdamElliot.Menu.moveToTop();
      var frame = $(AdamElliot.TemplatManager.frame({block:block}));
      addButtonsToFrame(frame, buttons);
      $("body").append(frame);

      var self = this;
      frame.find(".close").click(function() {
        location.href = location.href.split("#")[0] + "#";
        self.closeFrame(function() {
          AdamElliot.Menu.moveToCenter();
        });
      });

      var h = $(window).height();
      var x = ($(window).width() - frame.width()) / 2;
      frame.css({top:h, left:x});
      if (currentFrame) {
        this.closeFrame(function() {
          frame.animate({top:160}, 300);
        });
      } else
        frame.animate({top:160}, 300);

      currentFrame = frame;
    };

    var dir = 1;
    this.closeFrame = function(callback) {
      dir *= -1;
      var w = $(window).width() / 4 * dir;
      currentFrame.animate({left:"+=" + w, opacity:0}, 300, function() {
        $(this).remove();
        if (callback) callback();
      });
      currentFrame = null;
    };

    $(window).resize(function() {
      if (!currentFrame) return;
      var w = ($(window).width() - currentFrame.width()) / 2;
      var h = $(window).height() - 200;
      currentFrame.css("left", w);
      currentFrame.css("maxHeight", h);
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
