/**
 * Application framework for adamelliot.com
 * 
 * Uses jQuery and Pure. Backend is Sinatra and Datamapper, everything thin =)
 */

window.AdamElliot = window.AdamElliot || {};

$(function() {
  // Show the application once we're loaded
  $("#application").css({display:'block'});

  // Bind basic html to routes and targets
  $("body").bindDataRoute();
  $("body").targetBlank();

  AdamElliot.router = new AdamElliot.Router;

  AdamElliot.router.resource("session", new AdamElliot.SessionController);
  AdamElliot.router.resource("post", new AdamElliot.PostsController);

  AdamElliot.frameManager = new AdamElliot.FrameManager;

  AdamElliot.menu = new AdamElliot.Menu;
  AdamElliot.dashboard = new AdamElliot.Dashboard;

  AdamElliot.router.route();

  $(window).bind('hashchange', function() {
    AdamElliot.router.route();
  });
});
