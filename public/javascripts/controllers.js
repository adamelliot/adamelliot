/**
 * Resource posts controller.
 */
AdamElliot.PostsController = function() {
  var _super = new AdamElliot.ResourceController("post", this);
  $.extend(this, _super);
  
  this.dataOrderKey = 'posted_on';
  
  this.formHandler = function(data) {
    var date = new Date;
    var result = [];

    for (var i = 0; i < data.length; i++) {
      switch(data[i].name) {
        case 'posted_on_day':
          date.setDate(data[i].value);
          break;
        case 'posted_on_month':
          date.setMonth(data[i].value);
          break;
        case 'posted_on_year':
          date.setYear(data[i].value);
          break;
        default:
          result.push(data[i]);
      }
    }

    result.push({name:'posted_on', value:date});

    console.log("Submitting", result);
    
    return result;
  };

  this.templateManager.defineTemplate('index', {
    '.row': {
      'post<-posts': {
        '@data-route': function(arg) {
          var post = arg.item;
          return 'post/' + post.id;
        },
        '.title': 'post.title',
        '.date': 'post.posted_on',
        '.description': function(arg) {
          var post = arg.item;
          var firstChunk = post.body.match(/>([^<]*)</)[1];
          var firstWords = firstChunk.match(/([^\s]+\s){0,34}[^\s]+/)[0];
          return firstWords + "...";
        }
      }
    }
  });

  this.templateManager.defineTemplate('show', {
    '.title': 'title',
    '.body': 'body',
    '.date': 'posted_on'
  });

  this.templateManager.defineTemplate('form', {
    'input.id@value': 'id',
    'input.title@value': 'title',
    'textarea.markdown': 'markdown'
  });

  this.index = function(params) {
    this.remoteIndex();
    this.afterData = (function(data) {
      this.render('index', {'title':'Post Listing', posts:data});
    });
  };

  this.show = function(params) {
    var post = null;
    if (!(post = _super.show(params))) return null;

    var buttons = {};

    if (AdamElliot.session.authenticated) {
      buttons['edit'] = 'post/update/' + post.id;
      buttons['delete'] = 'post/remove/' + post.id;
    }

    buttons['index'] = 'posts';

    if (post._index > 0)
      buttons['prev'] = "post/" + this.getDataByIndex(post._index - 1)[this.dataKey];
    if (this.getDataByIndex(post._index + 1))
      buttons['next'] = "post/" + this.getDataByIndex(post._index + 1)[this.dataKey];

    this.render('show', post, buttons);
  };
};

/**
 * Handle logging in and out and populate the session object with the logged
 * in auth status.
 */
AdamElliot.SessionController = (function() {
  var Klass = function() {
    var _super = new AdamElliot.ResourceController("session", this);
    $.extend(this, _super);

    this.dataKey = 'username';

    this.templateManager.defineTemplate('form');

    var enableAdmin = function() {
      if (AdamElliot.session.authenticated) return;
      AdamElliot.session.authenticated = true;
      AdamElliot.dashboard.showAdminPanel();
      AdamElliot.frameManager.closeFrame();
    };
    
    var disableAdmin = function() {
      if (!AdamElliot.session.authenticated) return;
      AdamElliot.session.authenticated = false;
      AdamElliot.dashboard.hideAdminPanel();
      AdamElliot.frameManager.closeAllFrames();
    };

    var setAdminOnResponse = function(data) {
      if (data && data.authenticated) enableAdmin();
      else disableAdmin();
    };

    this.afterRemove = this.afterData = this.afterCreate = setAdminOnResponse;

    this.remove = function(params) {
      this.remoteRemove();
    };

    this.index();
  };
  
  AdamElliot.session = {authenticated:false};

  return Klass;
})();

/**
 * Handles general routes, all the one offs that don't need to be in a CRUD
 * pattern.
 */
AdamElliot.GeneralController = (function() {
  var Klass = function() {
    this.bio = function() {
    };
  };

  return Klass;
})();
