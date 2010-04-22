/**
 * Template manage, compiles the templates at load, and handles the binding
 * of data and how they display.
 */
AdamElliot.TemplatManager = (function() {
  var Klass = function () {

    // = = = = Template Compilation = = = = 

    this.loginForm = $("#templates .loginForm").compile();
    this.postForm = $("#templates .postForm").compile({
      'input.title@value': 'title',
      'textarea.body': 'body'
    });

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
 * Controllers, handle each of the modes of the application.
 */
AdamElliot.PostsController = (function () {
  var Klass = function() {
    var posts = [];

    // Returns the index of the post
    var locate = function(id) {
      for (var i = 0; i < posts.length; i++)
        if (id == posts[i].id) return i;

      return null;
    };

    var insert = function(data) {
      for (var i = 0; i < posts.length; i++)
        if (data.id == posts[i].id) {
          posts[i] = data;
          return;
        }
      posts.push(data);
    };

    var loadPosts = function() {
      $.ajax({
        url: '/posts.json',
        dataType: 'json',
        success: function(data) {
          for (var i = 0; i < data.length; i++) insert(data[i]);
        }
      });
    };
    loadPosts();

    var loadPost = function(id) {
      $.ajax({
        url: '/post/' + id + '.json',
        dataType: 'json',
        success: function(data) {
          console.log("Loaded post!", data);
        }
      });
    };

    var performCreate = function() {
//      $(this).disable();
      $.ajax({
        url: '/post.json',
        type: 'POST',
        dataType: 'json',
        data: $("form:visible").serialize(),
        success: function(data) {
          insert(data);
        },
        failure: function() {
          console.log("Error postinng");
        }
      });
    };

    var performDelete = function() {
      
    };

    var performUpdate = function() {
      
    };

    this.index = function(params) {
      
    };

    this.show = function(params) {
      var post;

      if (params["id"]) index = locate(params["id"]);
      else index = 0;

      post = posts[index];
      buttons = {};

      // TODO: Check admin
      if (true) buttons['new post'] = 'post/create';
      if (index > 0) buttons['prev'] = "post/" + posts[index - 1].id;
      if (posts[index + 1]) buttons['next'] = "post/" + posts[index + 1].id;

      var block = AdamElliot.TemplatManager.post(post);
      AdamElliot.FrameManager.showFrame(block, buttons);
    };

    this.create = function(params) {
      var block = AdamElliot.TemplatManager.postForm();
      AdamElliot.FrameManager.showFrame(block, {
        'post': performCreate
      });
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
//      $(this).disable();
      $.ajax({
        url: '/login.json',
        type: 'POST',
        dataType: 'json',
        data: $("form:visible").serialize(),
        success: function() {
          AdamElliot.Dashboard.toggleAdminPanel();
        },
        failure: function() {
          console.log("Error logging in");
        }
      });
    };

    this.login = function() {
      var block = AdamElliot.TemplatManager.loginForm();
      AdamElliot.FrameManager.showFrame(block, {
        'login': performLogin
      });
    };

    this.bio = function() {
      var block = AdamElliot.TemplatManager.bio();
      AdamElliot.FrameManager.showFrame(block);
    };
  };

  return Klass;
})();
