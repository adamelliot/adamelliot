/**
 * Handle manipulating and moving of the menu, the actual buttons of the menu
 * are bound in the main application
 */
window.AdamElliot = window.AdamElliot || {};

$(function() {
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
      var collection = adamelliot.add(blog).add(pics).add(bio);
      
      var atTop = false;
      var windowX = 800;
      var windowY = 600;

      // Set initial placement and settings for the intro sequence
      var setup = function() {
        this.centerMenu();
        adamelliot.animate({opacity: 0}, 0);
        blog.animate({opacity: 0, left:"+=600px"}, 0);
        pics.animate({opacity: 0, left:"-=600px"}, 0);
        bio.animate({opacity: 0, top:"+=600px"}, 0);
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
      }

      // Centres the menu based on the window frame.
      this.centerMenu = function() {
        xOffset = ($(window).width() - windowX) / 2;
        yOffset = ($(window).height() - windowY) / 2;
        if (atTop) yOffset = 0;
        windowX = $(window).width();
        windowY = $(window).height();
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

      // Setup and run the intro sequence
      setup.call(this);
      introSequence.call(this);
      
    };

    $(window).resize(function() {
      AdamElliot.Menu.centerMenu();
    });

    return new Klass;
  })();
});
