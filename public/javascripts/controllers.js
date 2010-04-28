/**
 * Resource posts controller.
 */
AdamElliot.PostsController = function() {
  var _super = new AdamElliot.ResourceController("post", this);
  $.extend(this, _super);

  this.dataOrderKey = 'posted_on';
  this.descendingOrder = true;

  this.dataMangler = function(data) {
    // TODO: Check this cross timezone.
    // NOTE: This is kinda smelly
    var date = data['posted_on'].split('-');
    data['posted_on'] = new Date(date[0], date[1] - 1, date[2]);
    return data;
  };

  this.formHandler = function(data) {
    var date = new Date;
    var result = [];

    for (var i = 0; i < data.length; i++) {
      switch(data[i].name) {
        case 'posted_on_day':
          date.setDate(data[i].value);
          break;
        case 'posted_on_month':
          date.setMonth(data[i].value - 1);
          break;
        case 'posted_on_year':
          date.setYear(data[i].value);
          break;
        default:
          result.push(data[i]);
      }
    }

    result.push({name:'posted_on', value:date});
    
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
        '.date': function(arg) {
          return arg.item['posted_on'].toDateString();
        },
        '.description': function(arg) {
          var post = arg.item;
          var firstChunk = post.body.match(/>([^<]*)</)[1];
          var firstWords = firstChunk.match(/([^\s]+\s){0,34}[^\s]+/)[0];
          return firstWords + (firstWords == firstChunk ? "" : "...");
        }
      }
    }
  });

  this.templateManager.defineTemplate('show', {
    '.title': 'title',
    '.body': 'body',
    '.date': function(arg) {
      return arg.context['posted_on'].toDateString();
    },
  });

  this.templateManager.defineTemplate('form', {
    'input.id@value': 'id',
    'input.title@value': 'title',
    'textarea.markdown': 'markdown'
  });

  this.index = function(params) {
    this.remoteIndex();
    this.afterData = (function() {
      this.render('index', {posts:this.getSortedData()});
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
      buttons['next'] = "post/" + this.getDataByIndex(post._index - 1)[this.dataKey];
    if (this.getDataByIndex(post._index + 1))
      buttons['prev'] = "post/" + this.getDataByIndex(post._index + 1)[this.dataKey];

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
      AdamElliot.dashboard.showAdminPanel();
      if (AdamElliot.session.authenticated) return;
      AdamElliot.session.authenticated = true;
      AdamElliot.frameManager.closeFrame();
    };
    
    var disableAdmin = function() {
      AdamElliot.dashboard.hideAdminPanel();
      if (!AdamElliot.session.authenticated) return;
      AdamElliot.session.authenticated = false;
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
  
  AdamElliot.session = {
    authenticated: document.cookie.indexOf('authenticated=true') > -1
  };

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
