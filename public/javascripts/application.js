/**
 * Application framework for adamelliot.com
 * 
 * Uses jQuery and Pure. Backend is Sinatra and Datamapper, everything thin =)
 */

window.AdamElliot = window.AdamElliot || {};


/**
 * Template manage, compiles the templates at load, and handles the binding
 * of data and how they display.
 */
AdamElliot.TemplatManager = (function() {
  var Klass = function () {

    // = = = = Template Compilation = = = = 

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
    
    // TODO: Frame queuing and dismissal
    this.showFrame = function(block, toolbar, bindings) {
      AdamElliot.Menu.moveToTop();
      var frame = $(AdamElliot.TemplatManager.frame({block:block}));
      $("body").append(frame);

      var self = this;
      frame.find(".close").click(function() {
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
      var w = $(window).width() / 2 * dir;
      currentFrame.animate({left:w, opacity:0}, 300, function() {
        $(this).remove();
        if (callback) callback();
      });
      currentFrame = null;
    };
  };
  
  return Klass;
})();

/**
 * Main Application, the application controller
 */
AdamElliot.Application = (function() {
  var Klass = function() {
    
    // Blog posts, should be ordered by time
    var posts = [{
      title: "First Post!",
      body: "Some text<h2>Blah</h2>test",
      date: "April 17, 2010"
    }];
    var postIndex = 0;

    /**
     * Handles blog clicks 
     */
    this.showBlog = function() {
      var postBlock = AdamElliot.TemplatManager.post(posts[postIndex]);
      AdamElliot.FrameManager.showFrame(postBlock, null, {
        '.next': function() {
          console.log("Next Clicked");
        }
      });
    };
    
    var hookUpMenuButtons = function() {
      var self = this;
      $("#blog").click(function() { self.showBlog(); });
    };

    hookUpMenuButtons.call(this);
  };
  
  return Klass;
})();

$(function() {
  AdamElliot.TemplatManager = new AdamElliot.TemplatManager;
  AdamElliot.FrameManager = new AdamElliot.FrameManager;
  var app = new AdamElliot.Application;

/*  setTimeout(function() {
    app.showBlog();
  }, 2000);*/
});
