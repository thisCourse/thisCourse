var BaseRouter, ContentView, HomeView, LectureListView, LectureRouterView, LectureView, PageRouterView, RootView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

window.BaseView = (function() {

  __extends(BaseView, Backbone.View);

  function BaseView(options) {
    this.add_subview = __bind(this.add_subview, this);
    this.navigate = __bind(this.navigate, this);
    this.hide = __bind(this.hide, this);
    this.show = __bind(this.show, this);
    var visible;
    this.subviews = {};
    visible = true;
    if (options != null ? options.url : void 0) this.url = options.url;
    BaseView.__super__.constructor.apply(this, arguments);
  }

  BaseView.prototype.show = function() {
    if (!this.visible) {
      this.visible = true;
      return this.$el.show();
    }
  };

  BaseView.prototype.hide = function() {
    if (this.visible) {
      this.visible = false;
      return this.$el.hide();
    }
  };

  BaseView.prototype.navigate = function(fragment) {
    var name, subview, _ref;
    console.log("further navigating down into: '" + fragment + "'");
    this.fragment = fragment;
    _ref = this.subviews;
    for (name in _ref) {
      subview = _ref[name];
      if (subview.navigate(this.fragment)) return true;
    }
    return false;
  };

  BaseView.prototype.add_subview = function(name, view, element) {
    if (name in this.subviews) this.subviews[name].close();
    view.parent = this;
    view.url || (view.url = this.url);
    this.subviews[name] = view;
    if (this.visible || true) this.navigate(this.fragment);
    if (element) $(element).append(view.el);
    return view;
  };

  return BaseView;

})();

window.RouterView = (function() {

  __extends(RouterView, BaseView);

  function RouterView() {
    this.navigate = __bind(this.navigate, this);
    this.route = __bind(this.route, this);
    this.initialize = __bind(this.initialize, this);
    RouterView.__super__.constructor.apply(this, arguments);
  }

  RouterView.prototype._routeToRegExp = Backbone.Router.prototype._routeToRegExp;

  RouterView.prototype.initialize = function() {
    var callback, route, _ref;
    this.handlers = [];
    this.subviews = {};
    _ref = this.routes;
    for (route in _ref) {
      callback = _ref[route];
      this.route(route, callback);
    }
    return RouterView.__super__.initialize.apply(this, arguments);
  };

  RouterView.prototype.route = function(route, callback) {
    if (_.isString(callback)) callback = this[callback];
    if (!_.isRegExp(route)) route = this._routeToRegExp(route);
    route = new RegExp("(" + route.source.replace("$", "") + ")(.*)$", "i");
    return this.handlers.unshift({
      route: route,
      callback: function(fragment) {
        return callback.apply(null, route.exec(fragment).slice(2, -1));
      },
      get_match: function(fragment) {
        return route.exec(fragment)[1];
      },
      get_splat: function(fragment) {
        return route.exec(fragment).slice(-1)[0];
      }
    });
  };

  RouterView.prototype.navigate = function(fragment) {
    var handler, match, route, splat, subview, view, _i, _len, _ref, _ref2;
    console.log("navigating to", fragment, "in", this);
    _ref = this.handlers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      handler = _ref[_i];
      if (handler.route.test(fragment)) {
        match = handler.get_match(fragment);
        subview = this.subviews[match];
        splat = handler.get_splat(fragment);
        this.fragment = match + splat;
        if (!subview) {
          subview = handler.callback(fragment);
          subview.url = this.url + match;
          subview.render();
          this.add_subview(match, subview, this.$el);
        }
        subview.navigate(splat);
        _ref2 = this.subviews;
        for (route in _ref2) {
          view = _ref2[route];
          if (!(view === subview)) view.hide();
        }
        subview.show();
        return true;
      }
    }
    return false;
  };

  return RouterView;

})();

LectureRouterView = (function() {

  __extends(LectureRouterView, RouterView);

  function LectureRouterView() {
    this.create_lecture_view = __bind(this.create_lecture_view, this);
    this.create_lecture_list_view = __bind(this.create_lecture_list_view, this);
    this.render = __bind(this.render, this);
    LectureRouterView.__super__.constructor.apply(this, arguments);
  }

  LectureRouterView.prototype.render = function() {};

  LectureRouterView.prototype.routes = {
    "lecture/": "create_lecture_list_view",
    "lecture/:lecture_id/": "create_lecture_view"
  };

  LectureRouterView.prototype.create_lecture_list_view = function() {
    console.log("create_lecture_list_view");
    return new LectureListView;
  };

  LectureRouterView.prototype.create_lecture_view = function(lecture_id) {
    console.log("create_lecture_view " + lecture_id);
    return new LectureView({
      id: lecture_id
    });
  };

  return LectureRouterView;

})();

LectureListView = (function() {

  __extends(LectureListView, BaseView);

  function LectureListView() {
    this.render = __bind(this.render, this);
    LectureListView.__super__.constructor.apply(this, arguments);
  }

  LectureListView.prototype.render = function() {
    return this.$el.text("This is the lecture list.");
  };

  return LectureListView;

})();

LectureView = (function() {

  __extends(LectureView, BaseView);

  function LectureView() {
    this.actually_render = __bind(this.actually_render, this);
    this.render = __bind(this.render, this);
    LectureView.__super__.constructor.apply(this, arguments);
  }

  LectureView.prototype.render = function() {
    console.log("rendering lecture view:", this.options.id);
    this.$el.text("Loading lecture...");
    return setTimeout(this.actually_render, 500);
  };

  LectureView.prototype.actually_render = function() {
    this.$el.text("This is lecture #" + this.options.id);
    this.add_subview("pageview", new PageRouterView);
    return this.$el.append(this.subviews.pageview.el);
  };

  return LectureView;

})();

PageRouterView = (function() {

  __extends(PageRouterView, RouterView);

  function PageRouterView() {
    this.create_content_view = __bind(this.create_content_view, this);
    PageRouterView.__super__.constructor.apply(this, arguments);
  }

  PageRouterView.prototype.routes = {
    "page/:id/": "create_content_view"
  };

  PageRouterView.prototype.create_content_view = function(content_id) {
    console.log("creating content view!!!");
    return new ContentView({
      id: content_id
    });
  };

  return PageRouterView;

})();

ContentView = (function() {

  __extends(ContentView, BaseView);

  function ContentView() {
    this.actually_render = __bind(this.actually_render, this);
    this.render = __bind(this.render, this);
    ContentView.__super__.constructor.apply(this, arguments);
  }

  ContentView.prototype.render = function() {
    console.log("rendering page view:", this.options.id);
    this.$el.text("Loading subpage...");
    return setTimeout(this.actually_render, 500);
  };

  ContentView.prototype.actually_render = function() {
    return this.$el.text("This is subpage #" + this.options.id);
  };

  return ContentView;

})();

HomeView = (function() {

  __extends(HomeView, BaseView);

  function HomeView() {
    this.render = __bind(this.render, this);
    HomeView.__super__.constructor.apply(this, arguments);
  }

  HomeView.prototype.render = function() {
    return this.$el.html("<a href='/coffeetest/lecture/'>Lecture list</a> " + this.url);
  };

  return HomeView;

})();

window.CourseView = (function() {
  var _this = this;

  __extends(CourseView, RouterView);

  function CourseView() {
    CourseView.__super__.constructor.apply(this, arguments);
  }

  CourseView.prototype.routes = {
    "": function() {
      return new HomeView;
    },
    "lecture": function() {
      return new LectureRouterView;
    }
  };

  return CourseView;

}).call(this);

RootView = (function() {

  __extends(RootView, BaseView);

  function RootView() {
    this.render = __bind(this.render, this);
    RootView.__super__.constructor.apply(this, arguments);
  }

  RootView.prototype.el = $("body");

  RootView.prototype.render = function() {
    this.$el.html("<div class='tabs'></div><div class='contents'></div>");
    return this.add_subview("courseview", new CourseView, this.$("contents"));
  };

  return RootView;

})();

BaseRouter = (function() {

  __extends(BaseRouter, Backbone.Router);

  function BaseRouter() {
    this.initialize = __bind(this.initialize, this);
    BaseRouter.__super__.constructor.apply(this, arguments);
  }

  BaseRouter.prototype.initialize = function(options) {
    var _this = this;
    this.subviews = {};
    this.rootview = new RootView({
      url: options.root_url
    });
    return this.route(options.root_url + "*splat", "delegate_navigation", function(splat) {
      if (splat.slice(-1) !== "/") {
        return navigate(options.root_url + splat);
      } else {
        return _this.rootview.navigate(splat);
      }
    });
  };

  return BaseRouter;

})();

window.router = new BaseRouter({
  root_url: "coffeetest/"
});

window.navigate = function(url) {
  if (url.slice(-1) !== "/") url += "/";
  return router.navigate(url, true);
};

Backbone.history.start({
  pushState: true
});
