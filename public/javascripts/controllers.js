/**
 * Code base for adamelliot.com
 * Copyright (c) Adam Elliot 2010
 */

// TODO: Make Disqus helper object
// Make sure that disqus comments don't hash link
$("a[href*=comment-]").live('mousedown click', function() {
  $(this).attr('onclick', null);
  return false;
});

/**
 * Resource posts controller.
 */
AdamElliot.PostsController = function() {
  var self = this;
  AdamElliot.ResourceController.call(this, "post");
  var _super = $.extend({}, this);

  this.dataOrderKey = 'posted_on';
  this.descendingOrder = true;

  this.dataMangler = function(data) {
    data['posted_on'] = new Date(data['posted_on']);
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
    'input[name=id]@value': 'id',
    'input[name=title]@value': 'title',
    'textarea[name=markdown]': 'markdown',
    'input[name=tags]@value': 'tags',
    'select[name=posted_on_month]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getMonth() :
        (new Date).getMonth();
    },
    'select[name=posted_on_day]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getDate() :
        (new Date).getDate();
    },
    'select[name=posted_on_year]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getFullYear() :
        (new Date).getFullYear();
    },
    'input[name=draft]@checked': 'draft',
    'input[name=closed]@checked': 'closed'
  });

  this.index = function(params) {
    this.remoteIndex();
    
    this.afterData = this.triggerOnce(function() {
      this.render('index', {posts:this.getSortedData()});
    });
  };

  var addCommentScript = function() {
    if ($("script[src=http://adamelliot.disqus.com/embed.js]").length > 0)
      return false;

    $.getScript("http://adamelliot.disqus.com/embed.js");
    return true;
  };

  var showCommentInBlock = function(post, block) {
    var thread = block.find('.disqus_thread');

    $("#disqus_thread").remove();

    window.disqus_developer = 1;//(location.hostname != "adamelliot.com") ? 1 : 0;
    window.disqus_url = location.href.split('#')[0] + 'permalink?post=' + post['slug'];
    window.disqus_skip_auth = true;
    window.disqus_identifier = post['slug'];

    thread.attr('id', "disqus_thread");
    
    if (!addCommentScript()) return;
  };

  this.afterFrameHide = function(frame) {
    $('#disqus_thread').remove();
  };

  this.show = function(params) {
    var post = null;
    if (!(post = _super.show(params))) return null;

    var buttons = {};

    if (this.getDataByIndex(post._index + 1))
      buttons['older'] = "post/" + this.getDataByIndex(post._index + 1)[this.dataKey];
    if (post._index > 0)
      buttons['newer'] = "post/" + this.getDataByIndex(post._index - 1)[this.dataKey];

    buttons['index'] = 'posts';

    if (AdamElliot.session.authenticated) {
      buttons['edit'] = 'post/update/' + post.id;
      buttons['delete'] = 'post/remove/' + post.id;
    }

    var frame = this.render('show', post, buttons);
    frame.delegate = this;
    if (!post['closed']) showCommentInBlock(post, frame.getFrame());
  };
};
AdamElliot.PostsController.prototype = new AdamElliot.ResourceController;

/**
 * Resource toys controller.
 */
AdamElliot.ToysController = function() {
  var self = this;
  AdamElliot.ResourceController.call(this, "toys");
  var _super = $.extend({}, this);

  this.dataOrderKey = 'posted_on';
  this.descendingOrder = true;

  this.dataMangler = function(data) {
    data['posted_on'] = new Date(data['posted_on']);
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

    return result;
  };

  this.templateManager.defineTemplate('index', {
    '.row': {
      'toy<-toys': {
        '@data-route': function(arg) {
          var toy = arg.item;
          return 'toy/' + toy.id;
        },
        '.title': 'toy.title',
        '.date': function(arg) {
          return arg.item['posted_on'].toDateString();
        },
        '.description': 'toy.description'
      }
    }
  });

  this.templateManager.defineTemplate('show', {
    '.title': 'title',
    '.date': function(arg) {
      return arg.context['posted_on'].toDateString();
    },
  });

  this.templateManager.defineTemplate('form', {
    'input[name=id]@value': 'id',
    'input[name=title]@value': 'title',
    'input[name=javascript]@value': 'javascript',
    'input[name=tags]@value': 'tags',
    'textarea[name=description]': 'description',
    'select[name=posted_on_month]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getMonth() :
        (new Date).getMonth();
    },
    'select[name=posted_on_day]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getDate() :
        (new Date).getDate();
    },
    'select[name=posted_on_year]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getFullYear() :
        (new Date).getFullYear();
    },
    'input[name=draft]@checked': 'draft',
    'input[name=closed]@checked': 'closed'
  });

  this.index = function(params) {
    this.remoteIndex();

    this.afterData = this.triggerOnce(function() {
      this.render('index', {toys:this.getSortedData()});
    });
  };

  var addCommentScript = function() {
    if ($("script[src=http://adamelliot.disqus.com/embed.js]").length > 0)
      return false;

    $.getScript("http://adamelliot.disqus.com/embed.js");
    return true;
  };

  var showCommentInBlock = function(toy, block) {
    var thread = block.find('.disqus_thread');

    $("#disqus_thread").remove();

    window.disqus_developer = 1;// (location.hostname == "0.0.0.0") ? 1 : 0;
    window.disqus_url = location.href.split('#')[0] + 'permalink?toy=' + toy['slug'];
    window.disqus_skip_auth = true;
    window.disqus_identifier = toy['slug'];

    thread.attr('id', "disqus_thread");
    
    if (!addCommentScript()) return;
  };

  this.afterFrameHide = function(frame) {
    $('#disqus_thread').remove();
  };

  this.beforeFrameHide = function(frame) {
    if (frame.toy) frame.toy.stop();
  };

  this.beforeFrameDestroy = function(frame) {
    if (frame.toy) frame.toy.stop();
  };
  
  this.show = function(params) {
    if (!Modernizr.canvas) {
      AdamElliot.TemplateManager.showUnsupported();
      return;
    }


    var toy = null;
    if (!(toy = _super.show(params))) return null;

    var buttons = {};

    if (AdamElliot.session.authenticated) {
      buttons['edit'] = 'toy/update/' + toy.id;
      buttons['delete'] = 'toy/remove/' + toy.id;
    }

    buttons['index'] = 'toys';

    var frame = this.render('show', toy, buttons);
    frame.delegate = this;
    if (!toy['closed']) showCommentInBlock(toy, frame.getFrame());

    AdamElliot.Toy.loadToy(toy.javascript, frame, function(toy) {
      frame.toy = toy;
    });
  };
};
AdamElliot.ToysController.prototype = new AdamElliot.ResourceController;

/**
 * Handle logging in and out and populate the session object with the logged
 * in auth status.
 */
AdamElliot.SessionController = (function() {
  var Klass = function() {
    var self = this;
    AdamElliot.ResourceController.call(this, "session");
    var _super = $.extend({}, this);

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
  Klass.prototype = new AdamElliot.ResourceController;
  
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
    
    this.pics = function() {
      // http://api.flickr.com/services/feeds/photos_public.gne?id=30782515@N02&format=json
    }
  };

  return Klass;
})();
