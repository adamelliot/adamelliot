/**
 * Template manage, compiles the templates at load, and handles the binding
 * of data and how they display.
 */
AdamElliot.TemplateManager = (function() {
  var Klass = function (_modelName) {
    var modelName = _modelName;
    var templates = {};

    this.defineTemplate = function(type, binding) {
      templates[type] = $('#templates .' + modelName + '.' + type).compile(binding);
    };
    
    this.template = function(type) {
      return templates[type];
    };

    // Renders the specified action and shows it in the frame manager
    this.render = function(action, data, toolbar, preserveBlock) {
      var block = templates[action](data);
      return AdamElliot.frameManager.showFrame(block, toolbar, preserveBlock);
    };
  };

  var sharedTemplates = {};
  Klass.sharedTemplate = function(name) {
    return sharedTemplates[name];
  };
  
  Klass.renderShared = function(name, data, toolbar) {
    var block = sharedTemplates[name](data);
    return AdamElliot.frameManager.showFrame(block, toolbar);
  };
  
  // Define the shared templates. (Needs to be done post load)
  $(function() {
    sharedTemplates.error = $("#templates .shared .error").compile({
      '.title': 'title',
      '.message': 'message'
    });
    sharedTemplates.notice = $("#templates .shared .notice").compile({
      '.title': 'title',
      '.message': 'message'
    });

    sharedTemplates.frame = $('#templates .shared .frame').compile({
      '.block': 'block'
    });
  });

  return Klass;
})();

/**
 * ResourceController controller type. Used in the resourceful situation.
 */
AdamElliot.ResourceController = (function() {
  var Klass = function(_modelName, _self) {
    var modelName = (_modelName || "").singularize();
    var self = _self || this;
    var activeBlock;
    this.templateManager = new AdamElliot.TemplateManager(modelName);

    // The chunk where model are stored.
    var data = {};
    var dataIndex = [];
    this.dataKey = 'id';
    this.dataOrderKey = 'id';

    // Data management functions

    this.orderCompare = function(o1, o2) {
      return o1[self.dataOrderKey] < o2[self.dataOrderKey];
    };

    this.getDataByIndex = function(index) {
      return data[dataIndex[index]];
    };

    this.getData = function(key) {
      return data[key];
    };

    // TODO: Resorting every time is a crappy way of doing things
    var indexData = function() {
      dataIndex = [];
      for (var key in data) dataIndex.push(key);
      dataIndex.sort(self.orderCompare);
      for (var i = 0; i < dataIndex.length; i++)
        data[dataIndex[i]]._index = i;
    };

    // Insert array of objects or single objects into the data store
    var insert = function(objects) {
      if (!objects) return null;
      if (objects instanceof Array)
        for (var i = 0; i < objects.length; i++)
          data[objects[i][self.dataKey]] = objects[i];
      else
        data[objects[self.dataKey]] = objects;

      indexData();
    };
    
    var remove = function(id) {
      delete data[id];
      dataIndex.splice(dataIndex.indexOf(id), 1);
      AdamElliot.frameManager.closeFrameByRoute(modelName + "/" + id);
    };

    var triggerOnce = function(func) {
      var triggered = false;

      return function() {
        if (!triggered) func.call(self);
        triggered = true;
      };
    };
    
    // Default event handlers
    this.afterCreate = this.afterUpdate = this.afterRemove = function() {
      AdamElliot.frameManager.closeFrame();
    };
    
    this.failedCreate = this.failedUpdate = this.failedRemove = function() {
      AdamElliot.frameManager.shakeFrame();
    };

    // Remote calls. These are the methods executed on the server.

    this.remoteIndex = function() {
      if (self.beforeData) self.beforeData();

      $.ajax({
        url: '/' + modelName.pluralize() + '.json',
        dataType: 'json',
        success: function(data) {
          insert(data);
          if (self.afterData) self.afterData(data);
        },
        error: function(a, b, c) {
          console.log("Remote Index Bad", a, b, c);
          if (self.failedData) self.failedData();
        }
      });
    };

    this.remoteShow = function(id) {
      if (self.beforeData) self.beforeData();

      $.ajax({
        url: '/' + modelName + '/' + id + '.json',
        dataType: 'json',
        success: function(data) {
          insert(data);
          if (self.afterData) self.afterData(id, data);
        },
        error: function() {
          if (self.failedData) self.failedData(id);
        }
      });
    };

    this.remoteCreate = function() {
      if (self.beforeCreate) self.beforeCreate();
      if (!activeBlock) {
        if (self.failedCreate) self.failedCreate();
        return;
      }
      var data = activeBlock.find('form').serialize();
      if (!data) {
        if (self.failedCreate) self.failedCreate();
        return;
      }

      $.ajax({
        url: '/' + modelName + '.json',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function(data) {
          insert(data);
          if (self.afterCreate) self.afterCreate(data);
        },
        error: function() {
          if (self.failedCreate) self.failedCreate();
        }
      });
    };

    this.remoteUpdate = function(id) {
      if (self.beforeUpdate) self.beforeUpdate(id);
      if (!activeBlock) {
        if (self.failedUpdate) self.failedUpdate(id);
        return;
      }
      var data = activeBlock.find('form').serialize();
      if (!data) {
        if (self.failedUpdate) self.failedUpdate(id);
        return;
      }

      $.ajax({
        url: '/' + modelName + '/' + id + '.json',
        type: 'PUT',
        dataType: 'json',
        data: data,
        success: function(data) {
          insert(data);
          if (self.afterUpdate) self.afterUpdate(id, data);
        },
        error: function() {
          if (self.failedUpdate) self.failedUpdate(id);
        }
      });
    };

    this.remoteRemove = function(id) {
      if (self.beforeRemove) self.beforeRemove(id);

      $.ajax({
        url: '/' + modelName + '/' + id + '.json',
        type: 'DELETE',
        dataType: 'json',
        success: function() {
          remove(id);
          if (self.afterRemove) self.afterRemove(id);
        },
        error: function() {
          if (self.failedRemove) self.failedRemove(id);
        }
      });
    };

    // Route helpers
    
    this.redirect = function(route) {
      location.hash = route;
    };

    // Handles the situation where show is called without an id
    this.showFirst = function(params) {
      if (dataIndex.length == 0) {
        if (!params._noFetch) {
          self.afterData = triggerOnce(function() { self.show({_noFetch:true}); });
          self.remoteIndex();
        } else
          console.log("No data to be had!");
        return null;
      }

      self.redirect(modelName + "/" + data[dataIndex[0]][self.dataKey]);
    };

    // Local routes. These are bound to resource routes.

    this.render = function(name, data, buttons, preserveBlock) {
      var block = self.templateManager.render(name, data, buttons, preserveBlock);
      activeBlock = block;
    };

    this.index = function(params) {
      self.remoteIndex();
    };

    this.show = function(params) {
      if (!params[self.dataKey]) return self.showFirst(params);
      var obj = null, id = params[self.dataKey];
      if (!(obj = data[id])) {
        self.afterData = triggerOnce(function() { self.show(params); });
        self.remoteShow(id);
        return null;
      }

      return obj;
    };

    this.create = function(params) {
      self.render('form', null, {
        'save': self.remoteCreate
      }, true);
    };
    
    this.update = function(params) {
      var id = params[self.dataKey];
      self.render('form', data[id], {
        'save': function() { self.remoteUpdate(id); }
      }, true);
    };
    
    this.remove = function(params) {
      var id = params[self.dataKey];
      AdamElliot.TemplateManager.renderShared('notice', {
        'title': "Confirm Delete",
        'message': 'Are you sure you want to delete?'
      }, {
        'yes': function() { self.remoteRemove(id); },
        'no': function() { AdamElliot.frameManager.closeFrame(); }
      });
    };

  };

  return Klass;
})();

/**
 * Resource posts controller.
 */
AdamElliot.PostsController = function() {
  var _super = new AdamElliot.ResourceController("post", this);
  $.extend(this, _super);

  this.templateManager.defineTemplate('show', {
    '.title': 'title',
    '.body': 'body',
    '.date': 'date'
  });

  this.templateManager.defineTemplate('form', {
    'input.id@value': 'id',
    'input.title@value': 'title',
    'textarea.markdown': 'markdown'
  });

  this.show = function(params) {
    var post = null;
    if (!(post = _super.show(params))) return null;

    var buttons = {};

    if (AdamElliot.session.authenticated) {
      buttons['new post'] = 'post/create';
      buttons['edit'] = 'post/update/' + post.id;
      buttons['delete'] = 'post/remove/' + post.id;
    }

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

    var setAdminOnResponse = function(data) {
      if (data && data.authenticated) {
        AdamElliot.session.authenticated = true;
        AdamElliot.dashboard.showAdminPanel();
        AdamElliot.frameManager.closeFrame();
      } else {
        AdamElliot.session.authenticated = false;
        AdamElliot.dashboard.hideAdminPanel();
        AdamElliot.frameManager.closeAllFrames();
      }
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
