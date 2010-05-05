/**
 * Handle manipulating and moving of the menu, the actual buttons of the menu
 * are bound in the main application
 */
window.AdamElliot = window.AdamElliot || {};

/**
 * This object is used to handle the menu items and moving everything when
 * the window resizes or windows push things out of the way
 */
AdamElliot.Menu = (function() {
  var Klass = function () {
    // Load our players.
    var adamelliot = $("#adamelliot");
    var blog = $("#blog");
    var pics = $("#pics");
    var bio = $("#bio");
    var toyz = $("#toyz")
    var collection = adamelliot.add(blog).add(pics).add(bio).add(toyz);
    
    var atTop = false;
    // Set initial placement and settings for the intro sequence
    var setup = function() {
      this.centerMenu();
      adamelliot.css({opacity: 0.0});
      blog.css({opacity: 0.0, left:blog.offset().left + 600});
      pics.css({opacity: 0.0, left:pics.offset().left - 600});
      bio.css({opacity: 0.0, top:bio.offset().top + 600});
      toyz.css({opacity: 0.0, top:toyz.offset().top - 600});
    };

    // Run the intro sequence
    var introSequence = function() {
      adamelliot.animate({opacity: 1}, 1000);
      setTimeout(function() {
        blog.animate({opacity: 1, left:"-=600px"}, 300);
      }, 500);
      setTimeout(function() {
        pics.animate({opacity: 1, left:"+=600px"}, 300);
      }, 700);
      setTimeout(function() {
        bio.animate({opacity: 1, top:"-=600px"}, 300);
      }, 900);
      setTimeout(function() {
        toyz.animate({opacity: 1, top:"+=600px"}, 300);
      }, 1100);
    }

    // Centres the menu based on the window frame.
    this.centerMenu = function() {
      var pos = adamelliot.offset();
      xOffset = ($(window).width() - adamelliot.width()) / 2 - pos.left;
      yOffset = ($(window).height() - adamelliot.height()) / 2 - pos.top;
      if (atTop) yOffset = 0;
      this.moveBy({
        x: xOffset,
        y: yOffset});
    };

    // Moves the menu to a point
    this.moveBy = function(pt) {
      collection.animate({
        left: "+=" + pt.x,
        top: "+=" + pt.y
      }, 0);
    };

    this.moveToTop = function() {
      if (atTop) return;
      atTop = true;
      var h = ($(window).height() - 190) / 2;
      collection.animate({
        top: "-=" + h
      }, 250);
    };
    
    this.moveToCenter = function() {
      if (!atTop) return;
      atTop = false;
      var h = ($(window).height() - 190) / 2;
      collection.animate({
        top: "+=" + h
      }, 250);
    };

    // Setup and run the intro sequence, intro breaks in IE don't run it
    if (location.href.indexOf("#") == -1 && $.support.opacity) {
      setup.call(this);
      introSequence.call(this);
    } else
      this.centerMenu();
  };

  $(window).resize(function() {
    AdamElliot.menu.centerMenu();
  });

  return Klass;
})();

/**
 * Base elements that show up underneath everything that provide information
 * but are fairly static on the site.
 */
AdamElliot.Dashboard = (function() {
  var Klass = function() {
    // Use a collection of elements as fixed positioning doesn't work well
    // with container styling.
    var tweet = $("#tweet");
    var admin = $("#admin");
    var social = $("#social");
    var dashboard = tweet.add(admin).add(social);

    var loadDashboard = function() {
      dashboard.css({opacity:0});
      // Hook up twitter to it's block
      if (navigator.userAgent.indexOf('iPad') == -1)
        tweet.tweet({
          username: "adam_elliot",
          count: 2,
          loading_text: "loading tweets..."
        });
    };

    var showDashboard = function() {
      setTimeout(function() { 
        dashboard.animate({opacity:1}, 1500);
      }, 2500);
    };

    var showingAdminPanel = false;
    var toggleAdminPanel = function() {
      $("#admin").animate({top:"-=100px"}, 300, function() {
        $("#admin .button").toggleClass("hidden");
        $(this).animate({top:"+=100px"}, 300);
      });
    };

    this.showAdminPanel = function() {
      if (showingAdminPanel) return;
      showingAdminPanel = true;
      toggleAdminPanel();
    };
    
    this.hideAdminPanel = function() {
      if (!showingAdminPanel) return;
      showingAdminPanel = false;
      toggleAdminPanel();
    };

    loadDashboard.call(this);
    showDashboard.call(this);
  };

  return Klass;
})();
