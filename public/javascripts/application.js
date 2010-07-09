/**
 * Application framework for adamelliot.com
 * 
 * Uses jQuery and Pure. Backend is Sinatra and Datamapper, everything thin =)
 */

//= require "inflection"
//= require "pure_packed"
//= require "modernizr-1.5.min"
//= require "jquery.tweet"
//= require "jquery.ba-hashchange.min"

//= require "canvas_object/canvas_object.js"

//= require "framework"
//= require "menu"
//= require "toy"
//= require "pics"
//= require "controllers"

window.AdamElliot = window.AdamElliot || {};
AdamElliot.dev = true;

AdamElliot.loadScripts = function(scripts, callback) {
  if (!scripts instanceof Array) scripts = [scripts];

  $.getScript(scripts.shift(), function() {
    if (scripts.length > 1)
      AdamElliot.loadScripts(scripts, callback);
    else callback();
  });
};

$(function() {
  // Show the application once we're loaded
  $("#application").css({display:'block'});

  // Bind basic html to routes and targets
  $("body").bindDataRoute();
  $("body").targetBlank();

  AdamElliot.router = new AdamElliot.Router;

  AdamElliot.router.resource("session", new AdamElliot.SessionController);
  AdamElliot.router.resource("post", new AdamElliot.PostsController);
  AdamElliot.router.resource("toy", new AdamElliot.ToysController);

  var generalController = new AdamElliot.GeneralController;
  AdamElliot.router.map("bio", generalController);
  AdamElliot.router.map("pics", generalController);

  AdamElliot.frameManager = new AdamElliot.FrameManager;

  AdamElliot.menu = new AdamElliot.Menu;
  AdamElliot.dashboard = new AdamElliot.Dashboard;

  AdamElliot.router.route();

  $(window).bind('hashchange', function() {
    AdamElliot.router.route();
  });
});
