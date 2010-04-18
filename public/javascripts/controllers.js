
/**
 * Controllers, handle each of the modes of the application.
 */
AdamElliot.PostsController = (function () {
  var Klass = function() {
    var posts = {
      1: {
        title: "First Post!",
        body: "Some text<h2>Blah</h2>test",
        date: "April 17, 2010"
      }
    };

    var loadPosts = function() {
      
    };
    
    var loadPost = function(id) {
      
    };

    var performCreate = function() {
      
    };
    
    var performDelete = function() {
      
    };
    
    var performUpdate = function() {
      
    };

    this.index = function(params) {
      
    };

    this.show = function(params) {
      var post;
      // Dig out the first post.
      if (!params["id"]) 
        for (var key in posts) {
          post = posts[key];
          break;
        }
      else post = posts[params["id"]];
      
      var block = AdamElliot.TemplatManager.post(post);
      AdamElliot.FrameManager.showFrame(block, {
        'create': function() {
          performCreate();
        },
        'prev': function() {
          console.log("Prev Clicked");
        },
        'next': function() {
          console.log("Next Clicked");
        }
      });
    };

    var performCreate = function() {
      
    };

    this.create = function(params) {
      
    };
    
    this.update = function(params) {
      
    };
    
    this.remove = function(params) {
      
    };

    // TODO: Create, Update, Delete
  };

  return Klass;
})();

/**
 * Handles general routes, all the one offs that don't need to be in a CRUD
 * pattern.
 */
AdamElliot.GeneralController = (function() {
  var Klass = function() {

    var performLogin = function() {
      console.log("Run login, check response...");
    };

    this.login = function() {
      var block = AdamElliot.TemplatManager.login();
      AdamElliot.FrameManager.showFrame(block, {
        'login': function() {
          performLogin();
        }
      });
    };

    this.bio = function() {
      var block = AdamElliot.TemplatManager.bio();
      AdamElliot.FrameManager.showFrame(block);
    };
  };

  return Klass;
})();
