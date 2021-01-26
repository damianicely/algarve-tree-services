function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
 * imagesLoaded PACKAGED v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

/**
 * EvEmitter v1.1.0
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */
(function (global, factory) {
  // universal module definition

  /* jshint strict: false */

  /* globals define, module, window */
  if (typeof define == 'function' && define.amd) {
    // AMD - RequireJS
    define('ev-emitter/ev-emitter', factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) == 'object' && module.exports) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }
})(typeof window != 'undefined' ? window : this, function () {
  function EvEmitter() {}

  var proto = EvEmitter.prototype;

  proto.on = function (eventName, listener) {
    if (!eventName || !listener) {
      return;
    } // set events hash


    var events = this._events = this._events || {}; // set listeners array

    var listeners = events[eventName] = events[eventName] || []; // only add once

    if (listeners.indexOf(listener) == -1) {
      listeners.push(listener);
    }

    return this;
  };

  proto.once = function (eventName, listener) {
    if (!eventName || !listener) {
      return;
    } // add event


    this.on(eventName, listener); // set once flag
    // set onceEvents hash

    var onceEvents = this._onceEvents = this._onceEvents || {}; // set onceListeners object

    var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {}; // set flag

    onceListeners[listener] = true;
    return this;
  };

  proto.off = function (eventName, listener) {
    var listeners = this._events && this._events[eventName];

    if (!listeners || !listeners.length) {
      return;
    }

    var index = listeners.indexOf(listener);

    if (index != -1) {
      listeners.splice(index, 1);
    }

    return this;
  };

  proto.emitEvent = function (eventName, args) {
    var listeners = this._events && this._events[eventName];

    if (!listeners || !listeners.length) {
      return;
    } // copy over to avoid interference if .off() in listener


    listeners = listeners.slice(0);
    args = args || []; // once stuff

    var onceListeners = this._onceEvents && this._onceEvents[eventName];

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      var isOnce = onceListeners && onceListeners[listener];

      if (isOnce) {
        // remove listener
        // remove before trigger to prevent recursion
        this.off(eventName, listener); // unset once flag

        delete onceListeners[listener];
      } // trigger listener


      listener.apply(this, args);
    }

    return this;
  };

  proto.allOff = function () {
    delete this._events;
    delete this._onceEvents;
  };

  return EvEmitter;
});
/*!
 * imagesLoaded v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */


(function (window, factory) {
  'use strict'; // universal module definition

  /*global define: false, module: false, require: false */

  if (typeof define == 'function' && define.amd) {
    // AMD
    define(['ev-emitter/ev-emitter'], function (EvEmitter) {
      return factory(window, EvEmitter);
    });
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) == 'object' && module.exports) {
    // CommonJS
    module.exports = factory(window, require('ev-emitter'));
  } else {
    // browser global
    window.imagesLoaded = factory(window, window.EvEmitter);
  }
})(typeof window !== 'undefined' ? window : this, // --------------------------  factory -------------------------- //
function factory(window, EvEmitter) {
  var $ = window.jQuery;
  var console = window.console; // -------------------------- helpers -------------------------- //
  // extend objects

  function extend(a, b) {
    for (var prop in b) {
      a[prop] = b[prop];
    }

    return a;
  }

  var arraySlice = Array.prototype.slice; // turn element or nodeList into an array

  function makeArray(obj) {
    if (Array.isArray(obj)) {
      // use object if already an array
      return obj;
    }

    var isArrayLike = _typeof(obj) == 'object' && typeof obj.length == 'number';

    if (isArrayLike) {
      // convert nodeList to array
      return arraySlice.call(obj);
    } // array of single index


    return [obj];
  } // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */


  function ImagesLoaded(elem, options, onAlways) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if (!(this instanceof ImagesLoaded)) {
      return new ImagesLoaded(elem, options, onAlways);
    } // use elem as selector string


    var queryElem = elem;

    if (typeof elem == 'string') {
      queryElem = document.querySelectorAll(elem);
    } // bail if bad element


    if (!queryElem) {
      console.error('Bad element for imagesLoaded ' + (queryElem || elem));
      return;
    }

    this.elements = makeArray(queryElem);
    this.options = extend({}, this.options); // shift arguments if no options set

    if (typeof options == 'function') {
      onAlways = options;
    } else {
      extend(this.options, options);
    }

    if (onAlways) {
      this.on('always', onAlways);
    }

    this.getImages();

    if ($) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    } // HACK check async to allow time to bind listeners


    setTimeout(this.check.bind(this));
  }

  ImagesLoaded.prototype = Object.create(EvEmitter.prototype);
  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function () {
    this.images = []; // filter & find items if we have an item selector

    this.elements.forEach(this.addElementImages, this);
  };
  /**
   * @param {Node} element
   */


  ImagesLoaded.prototype.addElementImages = function (elem) {
    // filter siblings
    if (elem.nodeName == 'IMG') {
      this.addImage(elem);
    } // get background image on element


    if (this.options.background === true) {
      this.addElementBackgroundImages(elem);
    } // find children
    // no non-element nodes, #143


    var nodeType = elem.nodeType;

    if (!nodeType || !elementNodeTypes[nodeType]) {
      return;
    }

    var childImgs = elem.querySelectorAll('img'); // concat childElems to filterFound array

    for (var i = 0; i < childImgs.length; i++) {
      var img = childImgs[i];
      this.addImage(img);
    } // get child background images


    if (typeof this.options.background == 'string') {
      var children = elem.querySelectorAll(this.options.background);

      for (i = 0; i < children.length; i++) {
        var child = children[i];
        this.addElementBackgroundImages(child);
      }
    }
  };

  var elementNodeTypes = {
    1: true,
    9: true,
    11: true
  };

  ImagesLoaded.prototype.addElementBackgroundImages = function (elem) {
    var style = getComputedStyle(elem);

    if (!style) {
      // Firefox returns null if in a hidden iframe https://bugzil.la/548397
      return;
    } // get url inside url("...")


    var reURL = /url\((['"])?(.*?)\1\)/gi;
    var matches = reURL.exec(style.backgroundImage);

    while (matches !== null) {
      var url = matches && matches[2];

      if (url) {
        this.addBackground(url, elem);
      }

      matches = reURL.exec(style.backgroundImage);
    }
  };
  /**
   * @param {Image} img
   */


  ImagesLoaded.prototype.addImage = function (img) {
    var loadingImage = new LoadingImage(img);
    this.images.push(loadingImage);
  };

  ImagesLoaded.prototype.addBackground = function (url, elem) {
    var background = new Background(url, elem);
    this.images.push(background);
  };

  ImagesLoaded.prototype.check = function () {
    var _this = this;

    this.progressedCount = 0;
    this.hasAnyBroken = false; // complete if no images

    if (!this.images.length) {
      this.complete();
      return;
    }

    function onProgress(image, elem, message) {
      // HACK - Chrome triggers event before object properties have changed. #83
      setTimeout(function () {
        _this.progress(image, elem, message);
      });
    }

    this.images.forEach(function (loadingImage) {
      loadingImage.once('progress', onProgress);
      loadingImage.check();
    });
  };

  ImagesLoaded.prototype.progress = function (image, elem, message) {
    this.progressedCount++;
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded; // progress event

    this.emitEvent('progress', [this, image, elem]);

    if (this.jqDeferred && this.jqDeferred.notify) {
      this.jqDeferred.notify(this, image);
    } // check if completed


    if (this.progressedCount == this.images.length) {
      this.complete();
    }

    if (this.options.debug && console) {
      console.log('progress: ' + message, image, elem);
    }
  };

  ImagesLoaded.prototype.complete = function () {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    this.emitEvent(eventName, [this]);
    this.emitEvent('always', [this]);

    if (this.jqDeferred) {
      var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
      this.jqDeferred[jqMethod](this);
    }
  }; // --------------------------  -------------------------- //


  function LoadingImage(img) {
    this.img = img;
  }

  LoadingImage.prototype = Object.create(EvEmitter.prototype);

  LoadingImage.prototype.check = function () {
    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    var isComplete = this.getIsImageComplete();

    if (isComplete) {
      // report based on naturalWidth
      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
      return;
    } // If none of the checks above matched, simulate loading on detached element.


    this.proxyImage = new Image();
    this.proxyImage.addEventListener('load', this);
    this.proxyImage.addEventListener('error', this); // bind to image as well for Firefox. #191

    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    this.proxyImage.src = this.img.src;
  };

  LoadingImage.prototype.getIsImageComplete = function () {
    // check for non-zero, non-undefined naturalWidth
    // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
    return this.img.complete && this.img.naturalWidth;
  };

  LoadingImage.prototype.confirm = function (isLoaded, message) {
    this.isLoaded = isLoaded;
    this.emitEvent('progress', [this, this.img, message]);
  }; // ----- events ----- //
  // trigger specified handler for event type


  LoadingImage.prototype.handleEvent = function (event) {
    var method = 'on' + event.type;

    if (this[method]) {
      this[method](event);
    }
  };

  LoadingImage.prototype.onload = function () {
    this.confirm(true, 'onload');
    this.unbindEvents();
  };

  LoadingImage.prototype.onerror = function () {
    this.confirm(false, 'onerror');
    this.unbindEvents();
  };

  LoadingImage.prototype.unbindEvents = function () {
    this.proxyImage.removeEventListener('load', this);
    this.proxyImage.removeEventListener('error', this);
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);
  }; // -------------------------- Background -------------------------- //


  function Background(url, element) {
    this.url = url;
    this.element = element;
    this.img = new Image();
  } // inherit LoadingImage prototype


  Background.prototype = Object.create(LoadingImage.prototype);

  Background.prototype.check = function () {
    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    this.img.src = this.url; // check if image is already complete

    var isComplete = this.getIsImageComplete();

    if (isComplete) {
      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
      this.unbindEvents();
    }
  };

  Background.prototype.unbindEvents = function () {
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);
  };

  Background.prototype.confirm = function (isLoaded, message) {
    this.isLoaded = isLoaded;
    this.emitEvent('progress', [this, this.element, message]);
  }; // -------------------------- jQuery -------------------------- //


  ImagesLoaded.makeJQueryPlugin = function (jQuery) {
    jQuery = jQuery || window.jQuery;

    if (!jQuery) {
      return;
    } // set local variable


    $ = jQuery; // $().imagesLoaded()

    $.fn.imagesLoaded = function (options, callback) {
      var instance = new ImagesLoaded(this, options, callback);
      return instance.jqDeferred.promise($(this));
    };
  }; // try making plugin


  ImagesLoaded.makeJQueryPlugin(); // --------------------------  -------------------------- //

  return ImagesLoaded;
});
/*!
 * VERSION: 2.1.3
 * DATE: 2019-05-17
 * UPDATES AND DOCS AT: http://greensock.com
 * 
 * Includes all of the following: TweenLite, TweenMax, TimelineLite, TimelineMax, EasePack, CSSPlugin, RoundPropsPlugin, BezierPlugin, AttrPlugin, DirectionalRotationPlugin
 *
 * @license Copyright (c) 2008-2019, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/


var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;

(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
  "use strict";

  _gsScope._gsDefine("TweenMax", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function (a, b, c) {
    var d = function d(a) {
      var b,
          c = [],
          d = a.length;

      for (b = 0; b !== d; c.push(a[b++])) {
        ;
      }

      return c;
    },
        e = function e(a, b, c) {
      var d,
          e,
          f = a.cycle;

      for (d in f) {
        e = f[d], a[d] = "function" == typeof e ? e(c, b[c], b) : e[c % e.length];
      }

      delete a.cycle;
    },
        f = function f(a) {
      if ("function" == typeof a) return a;
      var b = "object" == _typeof(a) ? a : {
        each: a
      },
          c = b.ease,
          d = b.from || 0,
          e = b.base || 0,
          f = {},
          g = isNaN(d),
          h = b.axis,
          i = {
        center: .5,
        end: 1
      }[d] || 0;
      return function (a, j, k) {
        var l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            t,
            u = (k || b).length,
            v = f[u];

        if (!v) {
          if (t = "auto" === b.grid ? 0 : (b.grid || [1 / 0])[0], !t) {
            for (r = -(1 / 0); r < (r = k[t++].getBoundingClientRect().left) && u > t;) {
              ;
            }

            t--;
          }

          for (v = f[u] = [], l = g ? Math.min(t, u) * i - .5 : d % t, m = g ? u * i / t - .5 : d / t | 0, r = 0, s = 1 / 0, q = 0; u > q; q++) {
            n = q % t - l, o = m - (q / t | 0), v[q] = p = h ? Math.abs("y" === h ? o : n) : Math.sqrt(n * n + o * o), p > r && (r = p), s > p && (s = p);
          }

          v.max = r - s, v.min = s, v.v = u = b.amount || b.each * (t > u ? u - 1 : h ? "y" === h ? u / t : t : Math.max(t, u / t)) || 0, v.b = 0 > u ? e - u : e;
        }

        return u = (v[a] - v.min) / v.max, v.b + (c ? c.getRatio(u) : u) * v.v;
      };
    },
        g = function g(a, b, d) {
      c.call(this, a, b, d), this._cycle = 0, this._yoyo = this.vars.yoyo === !0 || !!this.vars.yoyoEase, this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._repeat && this._uncache(!0), this.render = g.prototype.render;
    },
        h = 1e-8,
        i = c._internals,
        j = i.isSelector,
        k = i.isArray,
        l = g.prototype = c.to({}, .1, {}),
        m = [];

    g.version = "2.1.3", l.constructor = g, l.kill()._gc = !1, g.killTweensOf = g.killDelayedCallsTo = c.killTweensOf, g.getTweensOf = c.getTweensOf, g.lagSmoothing = c.lagSmoothing, g.ticker = c.ticker, g.render = c.render, g.distribute = f, l.invalidate = function () {
      return this._yoyo = this.vars.yoyo === !0 || !!this.vars.yoyoEase, this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._yoyoEase = null, this._uncache(!0), c.prototype.invalidate.call(this);
    }, l.updateTo = function (a, b) {
      var d,
          e = this,
          f = e.ratio,
          g = e.vars.immediateRender || a.immediateRender;
      b && e._startTime < e._timeline._time && (e._startTime = e._timeline._time, e._uncache(!1), e._gc ? e._enabled(!0, !1) : e._timeline.insert(e, e._startTime - e._delay));

      for (d in a) {
        e.vars[d] = a[d];
      }

      if (e._initted || g) if (b) e._initted = !1, g && e.render(0, !0, !0);else if (e._gc && e._enabled(!0, !1), e._notifyPluginsOfEnabled && e._firstPT && c._onPluginEvent("_onDisable", e), e._time / e._duration > .998) {
        var h = e._totalTime;
        e.render(0, !0, !1), e._initted = !1, e.render(h, !0, !1);
      } else if (e._initted = !1, e._init(), e._time > 0 || g) for (var i, j = 1 / (1 - f), k = e._firstPT; k;) {
        i = k.s + k.c, k.c *= j, k.s = i - k.c, k = k._next;
      }
      return e;
    }, l.render = function (a, b, d) {
      this._initted || 0 === this._duration && this.vars.repeat && this.invalidate();
      var e,
          f,
          g,
          j,
          k,
          l,
          m,
          n,
          o,
          p = this,
          q = p._dirty ? p.totalDuration() : p._totalDuration,
          r = p._time,
          s = p._totalTime,
          t = p._cycle,
          u = p._duration,
          v = p._rawPrevTime;
      if (a >= q - h && a >= 0 ? (p._totalTime = q, p._cycle = p._repeat, p._yoyo && 0 !== (1 & p._cycle) ? (p._time = 0, p.ratio = p._ease._calcEnd ? p._ease.getRatio(0) : 0) : (p._time = u, p.ratio = p._ease._calcEnd ? p._ease.getRatio(1) : 1), p._reversed || (e = !0, f = "onComplete", d = d || p._timeline.autoRemoveChildren), 0 === u && (p._initted || !p.vars.lazy || d) && (p._startTime === p._timeline._duration && (a = 0), (0 > v || 0 >= a && a >= -h || v === h && "isPause" !== p.data) && v !== a && (d = !0, v > h && (f = "onReverseComplete")), p._rawPrevTime = n = !b || a || v === a ? a : h)) : h > a ? (p._totalTime = p._time = p._cycle = 0, p.ratio = p._ease._calcEnd ? p._ease.getRatio(0) : 0, (0 !== s || 0 === u && v > 0) && (f = "onReverseComplete", e = p._reversed), a > -h ? a = 0 : 0 > a && (p._active = !1, 0 === u && (p._initted || !p.vars.lazy || d) && (v >= 0 && (d = !0), p._rawPrevTime = n = !b || a || v === a ? a : h)), p._initted || (d = !0)) : (p._totalTime = p._time = a, 0 !== p._repeat && (j = u + p._repeatDelay, p._cycle = p._totalTime / j >> 0, 0 !== p._cycle && p._cycle === p._totalTime / j && a >= s && p._cycle--, p._time = p._totalTime - p._cycle * j, p._yoyo && 0 !== (1 & p._cycle) && (p._time = u - p._time, o = p._yoyoEase || p.vars.yoyoEase, o && (p._yoyoEase || (o !== !0 || p._initted ? p._yoyoEase = o = o === !0 ? p._ease : o instanceof Ease ? o : Ease.map[o] : (o = p.vars.ease, p._yoyoEase = o = o ? o instanceof Ease ? o : "function" == typeof o ? new Ease(o, p.vars.easeParams) : Ease.map[o] || c.defaultEase : c.defaultEase)), p.ratio = o ? 1 - o.getRatio((u - p._time) / u) : 0)), p._time > u ? p._time = u : p._time < 0 && (p._time = 0)), p._easeType && !o ? (k = p._time / u, l = p._easeType, m = p._easePower, (1 === l || 3 === l && k >= .5) && (k = 1 - k), 3 === l && (k *= 2), 1 === m ? k *= k : 2 === m ? k *= k * k : 3 === m ? k *= k * k * k : 4 === m && (k *= k * k * k * k), p.ratio = 1 === l ? 1 - k : 2 === l ? k : p._time / u < .5 ? k / 2 : 1 - k / 2) : o || (p.ratio = p._ease.getRatio(p._time / u))), r === p._time && !d && t === p._cycle) return void (s !== p._totalTime && p._onUpdate && (b || p._callback("onUpdate")));

      if (!p._initted) {
        if (p._init(), !p._initted || p._gc) return;
        if (!d && p._firstPT && (p.vars.lazy !== !1 && p._duration || p.vars.lazy && !p._duration)) return p._time = r, p._totalTime = s, p._rawPrevTime = v, p._cycle = t, i.lazyTweens.push(p), void (p._lazy = [a, b]);
        !p._time || e || o ? e && this._ease._calcEnd && !o && (p.ratio = p._ease.getRatio(0 === p._time ? 0 : 1)) : p.ratio = p._ease.getRatio(p._time / u);
      }

      for (p._lazy !== !1 && (p._lazy = !1), p._active || !p._paused && p._time !== r && a >= 0 && (p._active = !0), 0 === s && (2 === p._initted && a > 0 && p._init(), p._startAt && (a >= 0 ? p._startAt.render(a, !0, d) : f || (f = "_dummyGS")), p.vars.onStart && (0 !== p._totalTime || 0 === u) && (b || p._callback("onStart"))), g = p._firstPT; g;) {
        g.f ? g.t[g.p](g.c * p.ratio + g.s) : g.t[g.p] = g.c * p.ratio + g.s, g = g._next;
      }

      p._onUpdate && (0 > a && p._startAt && p._startTime && p._startAt.render(a, !0, d), b || (p._totalTime !== s || f) && p._callback("onUpdate")), p._cycle !== t && (b || p._gc || p.vars.onRepeat && p._callback("onRepeat")), f && (!p._gc || d) && (0 > a && p._startAt && !p._onUpdate && p._startTime && p._startAt.render(a, !0, d), e && (p._timeline.autoRemoveChildren && p._enabled(!1, !1), p._active = !1), !b && p.vars[f] && p._callback(f), 0 === u && p._rawPrevTime === h && n !== h && (p._rawPrevTime = 0));
    }, g.to = function (a, b, c) {
      return new g(a, b, c);
    }, g.from = function (a, b, c) {
      return c.runBackwards = !0, c.immediateRender = 0 != c.immediateRender, new g(a, b, c);
    }, g.fromTo = function (a, b, c, d) {
      return d.startAt = c, d.immediateRender = 0 != d.immediateRender && 0 != c.immediateRender, new g(a, b, d);
    }, g.staggerTo = g.allTo = function (a, b, h, i, l, n, o) {
      var p,
          q,
          r,
          s,
          t = [],
          u = f(h.stagger || i),
          v = h.cycle,
          w = (h.startAt || m).cycle;

      for (k(a) || ("string" == typeof a && (a = c.selector(a) || a), j(a) && (a = d(a))), a = a || [], p = a.length - 1, r = 0; p >= r; r++) {
        q = {};

        for (s in h) {
          q[s] = h[s];
        }

        if (v && (e(q, a, r), null != q.duration && (b = q.duration, delete q.duration)), w) {
          w = q.startAt = {};

          for (s in h.startAt) {
            w[s] = h.startAt[s];
          }

          e(q.startAt, a, r);
        }

        q.delay = u(r, a[r], a) + (q.delay || 0), r === p && l && (q.onComplete = function () {
          h.onComplete && h.onComplete.apply(h.onCompleteScope || this, arguments), l.apply(o || h.callbackScope || this, n || m);
        }), t[r] = new g(a[r], b, q);
      }

      return t;
    }, g.staggerFrom = g.allFrom = function (a, b, c, d, e, f, h) {
      return c.runBackwards = !0, c.immediateRender = 0 != c.immediateRender, g.staggerTo(a, b, c, d, e, f, h);
    }, g.staggerFromTo = g.allFromTo = function (a, b, c, d, e, f, h, i) {
      return d.startAt = c, d.immediateRender = 0 != d.immediateRender && 0 != c.immediateRender, g.staggerTo(a, b, d, e, f, h, i);
    }, g.delayedCall = function (a, b, c, d, e) {
      return new g(b, 0, {
        delay: a,
        onComplete: b,
        onCompleteParams: c,
        callbackScope: d,
        onReverseComplete: b,
        onReverseCompleteParams: c,
        immediateRender: !1,
        useFrames: e,
        overwrite: 0
      });
    }, g.set = function (a, b) {
      return new g(a, 0, b);
    }, g.isTweening = function (a) {
      return c.getTweensOf(a, !0).length > 0;
    };

    var n = function n(a, b) {
      for (var d = [], e = 0, f = a._first; f;) {
        f instanceof c ? d[e++] = f : (b && (d[e++] = f), d = d.concat(n(f, b)), e = d.length), f = f._next;
      }

      return d;
    },
        o = g.getAllTweens = function (b) {
      return n(a._rootTimeline, b).concat(n(a._rootFramesTimeline, b));
    };

    g.killAll = function (a, c, d, e) {
      null == c && (c = !0), null == d && (d = !0);
      var f,
          g,
          h,
          i = o(0 != e),
          j = i.length,
          k = c && d && e;

      for (h = 0; j > h; h++) {
        g = i[h], (k || g instanceof b || (f = g.target === g.vars.onComplete) && d || c && !f) && (a ? g.totalTime(g._reversed ? 0 : g.totalDuration()) : g._enabled(!1, !1));
      }
    }, g.killChildTweensOf = function (a, b) {
      if (null != a) {
        var e,
            f,
            h,
            l,
            m,
            n = i.tweenLookup;
        if ("string" == typeof a && (a = c.selector(a) || a), j(a) && (a = d(a)), k(a)) for (l = a.length; --l > -1;) {
          g.killChildTweensOf(a[l], b);
        } else {
          e = [];

          for (h in n) {
            for (f = n[h].target.parentNode; f;) {
              f === a && (e = e.concat(n[h].tweens)), f = f.parentNode;
            }
          }

          for (m = e.length, l = 0; m > l; l++) {
            b && e[l].totalTime(e[l].totalDuration()), e[l]._enabled(!1, !1);
          }
        }
      }
    };

    var p = function p(a, c, d, e) {
      c = c !== !1, d = d !== !1, e = e !== !1;

      for (var f, g, h = o(e), i = c && d && e, j = h.length; --j > -1;) {
        g = h[j], (i || g instanceof b || (f = g.target === g.vars.onComplete) && d || c && !f) && g.paused(a);
      }
    };

    return g.pauseAll = function (a, b, c) {
      p(!0, a, b, c);
    }, g.resumeAll = function (a, b, c) {
      p(!1, a, b, c);
    }, g.globalTimeScale = function (b) {
      var d = a._rootTimeline,
          e = c.ticker.time;
      return arguments.length ? (b = b || h, d._startTime = e - (e - d._startTime) * d._timeScale / b, d = a._rootFramesTimeline, e = c.ticker.frame, d._startTime = e - (e - d._startTime) * d._timeScale / b, d._timeScale = a._rootTimeline._timeScale = b, b) : d._timeScale;
    }, l.progress = function (a, b) {
      return arguments.length ? this.totalTime(this.duration() * (this._yoyo && 0 !== (1 & this._cycle) ? 1 - a : a) + this._cycle * (this._duration + this._repeatDelay), b) : this.duration() ? this._time / this._duration : this.ratio;
    }, l.totalProgress = function (a, b) {
      return arguments.length ? this.totalTime(this.totalDuration() * a, b) : this._totalTime / this.totalDuration();
    }, l.time = function (a, b) {
      if (!arguments.length) return this._time;
      this._dirty && this.totalDuration();
      var c = this._duration,
          d = this._cycle,
          e = d * (c + this._repeatDelay);
      return a > c && (a = c), this.totalTime(this._yoyo && 1 & d ? c - a + e : this._repeat ? a + e : a, b);
    }, l.duration = function (b) {
      return arguments.length ? a.prototype.duration.call(this, b) : this._duration;
    }, l.totalDuration = function (a) {
      return arguments.length ? -1 === this._repeat ? this : this.duration((a - this._repeat * this._repeatDelay) / (this._repeat + 1)) : (this._dirty && (this._totalDuration = -1 === this._repeat ? 999999999999 : this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat, this._dirty = !1), this._totalDuration);
    }, l.repeat = function (a) {
      return arguments.length ? (this._repeat = a, this._uncache(!0)) : this._repeat;
    }, l.repeatDelay = function (a) {
      return arguments.length ? (this._repeatDelay = a, this._uncache(!0)) : this._repeatDelay;
    }, l.yoyo = function (a) {
      return arguments.length ? (this._yoyo = a, this) : this._yoyo;
    }, g;
  }, !0), _gsScope._gsDefine("TimelineLite", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function (a, b, c) {
    var d = function d(a) {
      b.call(this, a);
      var c,
          d,
          e = this,
          f = e.vars;
      e._labels = {}, e.autoRemoveChildren = !!f.autoRemoveChildren, e.smoothChildTiming = !!f.smoothChildTiming, e._sortChildren = !0, e._onUpdate = f.onUpdate;

      for (d in f) {
        c = f[d], i(c) && -1 !== c.join("").indexOf("{self}") && (f[d] = e._swapSelfInParams(c));
      }

      i(f.tweens) && e.add(f.tweens, 0, f.align, f.stagger);
    },
        e = 1e-8,
        f = c._internals,
        g = d._internals = {},
        h = f.isSelector,
        i = f.isArray,
        j = f.lazyTweens,
        k = f.lazyRender,
        l = _gsScope._gsDefine.globals,
        m = function m(a) {
      var b,
          c = {};

      for (b in a) {
        c[b] = a[b];
      }

      return c;
    },
        n = function n(a, b, c) {
      var d,
          e,
          f = a.cycle;

      for (d in f) {
        e = f[d], a[d] = "function" == typeof e ? e(c, b[c], b) : e[c % e.length];
      }

      delete a.cycle;
    },
        o = g.pauseCallback = function () {},
        p = function p(a) {
      var b,
          c = [],
          d = a.length;

      for (b = 0; b !== d; c.push(a[b++])) {
        ;
      }

      return c;
    },
        q = function q(a, b, c, d) {
      var e = "immediateRender";
      return e in b || (b[e] = !(c && c[e] === !1 || d)), b;
    },
        r = function r(a) {
      if ("function" == typeof a) return a;
      var b = "object" == _typeof(a) ? a : {
        each: a
      },
          c = b.ease,
          d = b.from || 0,
          e = b.base || 0,
          f = {},
          g = isNaN(d),
          h = b.axis,
          i = {
        center: .5,
        end: 1
      }[d] || 0;
      return function (a, j, k) {
        var l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            t,
            u = (k || b).length,
            v = f[u];

        if (!v) {
          if (t = "auto" === b.grid ? 0 : (b.grid || [1 / 0])[0], !t) {
            for (r = -(1 / 0); r < (r = k[t++].getBoundingClientRect().left) && u > t;) {
              ;
            }

            t--;
          }

          for (v = f[u] = [], l = g ? Math.min(t, u) * i - .5 : d % t, m = g ? u * i / t - .5 : d / t | 0, r = 0, s = 1 / 0, q = 0; u > q; q++) {
            n = q % t - l, o = m - (q / t | 0), v[q] = p = h ? Math.abs("y" === h ? o : n) : Math.sqrt(n * n + o * o), p > r && (r = p), s > p && (s = p);
          }

          v.max = r - s, v.min = s, v.v = u = b.amount || b.each * (t > u ? u - 1 : h ? "y" === h ? u / t : t : Math.max(t, u / t)) || 0, v.b = 0 > u ? e - u : e;
        }

        return u = (v[a] - v.min) / v.max, v.b + (c ? c.getRatio(u) : u) * v.v;
      };
    },
        s = d.prototype = new b();

    return d.version = "2.1.3", d.distribute = r, s.constructor = d, s.kill()._gc = s._forcingPlayhead = s._hasPause = !1, s.to = function (a, b, d, e) {
      var f = d.repeat && l.TweenMax || c;
      return b ? this.add(new f(a, b, d), e) : this.set(a, d, e);
    }, s.from = function (a, b, d, e) {
      return this.add((d.repeat && l.TweenMax || c).from(a, b, q(this, d)), e);
    }, s.fromTo = function (a, b, d, e, f) {
      var g = e.repeat && l.TweenMax || c;
      return e = q(this, e, d), b ? this.add(g.fromTo(a, b, d, e), f) : this.set(a, e, f);
    }, s.staggerTo = function (a, b, e, f, g, i, j, k) {
      var l,
          o,
          q = new d({
        onComplete: i,
        onCompleteParams: j,
        callbackScope: k,
        smoothChildTiming: this.smoothChildTiming
      }),
          s = r(e.stagger || f),
          t = e.startAt,
          u = e.cycle;

      for ("string" == typeof a && (a = c.selector(a) || a), a = a || [], h(a) && (a = p(a)), o = 0; o < a.length; o++) {
        l = m(e), t && (l.startAt = m(t), t.cycle && n(l.startAt, a, o)), u && (n(l, a, o), null != l.duration && (b = l.duration, delete l.duration)), q.to(a[o], b, l, s(o, a[o], a));
      }

      return this.add(q, g);
    }, s.staggerFrom = function (a, b, c, d, e, f, g, h) {
      return c.runBackwards = !0, this.staggerTo(a, b, q(this, c), d, e, f, g, h);
    }, s.staggerFromTo = function (a, b, c, d, e, f, g, h, i) {
      return d.startAt = c, this.staggerTo(a, b, q(this, d, c), e, f, g, h, i);
    }, s.call = function (a, b, d, e) {
      return this.add(c.delayedCall(0, a, b, d), e);
    }, s.set = function (a, b, d) {
      return this.add(new c(a, 0, q(this, b, null, !0)), d);
    }, d.exportRoot = function (a, b) {
      a = a || {}, null == a.smoothChildTiming && (a.smoothChildTiming = !0);
      var e,
          f,
          g,
          h,
          i = new d(a),
          j = i._timeline;

      for (null == b && (b = !0), j._remove(i, !0), i._startTime = 0, i._rawPrevTime = i._time = i._totalTime = j._time, g = j._first; g;) {
        h = g._next, b && g instanceof c && g.target === g.vars.onComplete || (f = g._startTime - g._delay, 0 > f && (e = 1), i.add(g, f)), g = h;
      }

      return j.add(i, 0), e && i.totalDuration(), i;
    }, s.add = function (e, f, g, h) {
      var j,
          k,
          l,
          m,
          n,
          o,
          p = this;

      if ("number" != typeof f && (f = p._parseTimeOrLabel(f, 0, !0, e)), !(e instanceof a)) {
        if (e instanceof Array || e && e.push && i(e)) {
          for (g = g || "normal", h = h || 0, j = f, k = e.length, l = 0; k > l; l++) {
            i(m = e[l]) && (m = new d({
              tweens: m
            })), p.add(m, j), "string" != typeof m && "function" != typeof m && ("sequence" === g ? j = m._startTime + m.totalDuration() / m._timeScale : "start" === g && (m._startTime -= m.delay())), j += h;
          }

          return p._uncache(!0);
        }

        if ("string" == typeof e) return p.addLabel(e, f);
        if ("function" != typeof e) throw "Cannot add " + e + " into the timeline; it is not a tween, timeline, function, or string.";
        e = c.delayedCall(0, e);
      }

      if (b.prototype.add.call(p, e, f), (e._time || !e._duration && e._initted) && (j = (p.rawTime() - e._startTime) * e._timeScale, (!e._duration || Math.abs(Math.max(0, Math.min(e.totalDuration(), j))) - e._totalTime > 1e-5) && e.render(j, !1, !1)), (p._gc || p._time === p._duration) && !p._paused && p._duration < p.duration()) for (n = p, o = n.rawTime() > e._startTime; n._timeline;) {
        o && n._timeline.smoothChildTiming ? n.totalTime(n._totalTime, !0) : n._gc && n._enabled(!0, !1), n = n._timeline;
      }
      return p;
    }, s.remove = function (b) {
      if (b instanceof a) {
        this._remove(b, !1);

        var c = b._timeline = b.vars.useFrames ? a._rootFramesTimeline : a._rootTimeline;
        return b._startTime = (b._paused ? b._pauseTime : c._time) - (b._reversed ? b.totalDuration() - b._totalTime : b._totalTime) / b._timeScale, this;
      }

      if (b instanceof Array || b && b.push && i(b)) {
        for (var d = b.length; --d > -1;) {
          this.remove(b[d]);
        }

        return this;
      }

      return "string" == typeof b ? this.removeLabel(b) : this.kill(null, b);
    }, s._remove = function (a, c) {
      b.prototype._remove.call(this, a, c);

      var d = this._last;
      return d ? this._time > this.duration() && (this._time = this._duration, this._totalTime = this._totalDuration) : this._time = this._totalTime = this._duration = this._totalDuration = 0, this;
    }, s.append = function (a, b) {
      return this.add(a, this._parseTimeOrLabel(null, b, !0, a));
    }, s.insert = s.insertMultiple = function (a, b, c, d) {
      return this.add(a, b || 0, c, d);
    }, s.appendMultiple = function (a, b, c, d) {
      return this.add(a, this._parseTimeOrLabel(null, b, !0, a), c, d);
    }, s.addLabel = function (a, b) {
      return this._labels[a] = this._parseTimeOrLabel(b), this;
    }, s.addPause = function (a, b, d, e) {
      var f = c.delayedCall(0, o, d, e || this);
      return f.vars.onComplete = f.vars.onReverseComplete = b, f.data = "isPause", this._hasPause = !0, this.add(f, a);
    }, s.removeLabel = function (a) {
      return delete this._labels[a], this;
    }, s.getLabelTime = function (a) {
      return null != this._labels[a] ? this._labels[a] : -1;
    }, s._parseTimeOrLabel = function (b, c, d, e) {
      var f, g;
      if (e instanceof a && e.timeline === this) this.remove(e);else if (e && (e instanceof Array || e.push && i(e))) for (g = e.length; --g > -1;) {
        e[g] instanceof a && e[g].timeline === this && this.remove(e[g]);
      }
      if (f = "number" != typeof b || c ? this.duration() > 99999999999 ? this.recent().endTime(!1) : this._duration : 0, "string" == typeof c) return this._parseTimeOrLabel(c, d && "number" == typeof b && null == this._labels[c] ? b - f : 0, d);
      if (c = c || 0, "string" != typeof b || !isNaN(b) && null == this._labels[b]) null == b && (b = f);else {
        if (g = b.indexOf("="), -1 === g) return null == this._labels[b] ? d ? this._labels[b] = f + c : c : this._labels[b] + c;
        c = parseInt(b.charAt(g - 1) + "1", 10) * Number(b.substr(g + 1)), b = g > 1 ? this._parseTimeOrLabel(b.substr(0, g - 1), 0, d) : f;
      }
      return Number(b) + c;
    }, s.seek = function (a, b) {
      return this.totalTime("number" == typeof a ? a : this._parseTimeOrLabel(a), b !== !1);
    }, s.stop = function () {
      return this.paused(!0);
    }, s.gotoAndPlay = function (a, b) {
      return this.play(a, b);
    }, s.gotoAndStop = function (a, b) {
      return this.pause(a, b);
    }, s.render = function (a, b, c) {
      this._gc && this._enabled(!0, !1);
      var d,
          f,
          g,
          h,
          i,
          l,
          m,
          n,
          o = this,
          p = o._time,
          q = o._dirty ? o.totalDuration() : o._totalDuration,
          r = o._startTime,
          s = o._timeScale,
          t = o._paused;

      if (p !== o._time && (a += o._time - p), o._hasPause && !o._forcingPlayhead && !b) {
        if (a > p) for (d = o._first; d && d._startTime <= a && !l;) {
          d._duration || "isPause" !== d.data || d.ratio || 0 === d._startTime && 0 === o._rawPrevTime || (l = d), d = d._next;
        } else for (d = o._last; d && d._startTime >= a && !l;) {
          d._duration || "isPause" === d.data && d._rawPrevTime > 0 && (l = d), d = d._prev;
        }
        l && (o._time = o._totalTime = a = l._startTime, n = o._startTime + (o._reversed ? o._duration - a : a) / o._timeScale);
      }

      if (a >= q - e && a >= 0) o._totalTime = o._time = q, o._reversed || o._hasPausedChild() || (f = !0, h = "onComplete", i = !!o._timeline.autoRemoveChildren, 0 === o._duration && (0 >= a && a >= -e || o._rawPrevTime < 0 || o._rawPrevTime === e) && o._rawPrevTime !== a && o._first && (i = !0, o._rawPrevTime > e && (h = "onReverseComplete"))), o._rawPrevTime = o._duration || !b || a || o._rawPrevTime === a ? a : e, a = q + 1e-4;else if (e > a) {
        if (o._totalTime = o._time = 0, a > -e && (a = 0), (0 !== p || 0 === o._duration && o._rawPrevTime !== e && (o._rawPrevTime > 0 || 0 > a && o._rawPrevTime >= 0)) && (h = "onReverseComplete", f = o._reversed), 0 > a) o._active = !1, o._timeline.autoRemoveChildren && o._reversed ? (i = f = !0, h = "onReverseComplete") : o._rawPrevTime >= 0 && o._first && (i = !0), o._rawPrevTime = a;else {
          if (o._rawPrevTime = o._duration || !b || a || o._rawPrevTime === a ? a : e, 0 === a && f) for (d = o._first; d && 0 === d._startTime;) {
            d._duration || (f = !1), d = d._next;
          }
          a = 0, o._initted || (i = !0);
        }
      } else o._totalTime = o._time = o._rawPrevTime = a;

      if (o._time !== p && o._first || c || i || l) {
        if (o._initted || (o._initted = !0), o._active || !o._paused && o._time !== p && a > 0 && (o._active = !0), 0 === p && o.vars.onStart && (0 === o._time && o._duration || b || o._callback("onStart")), m = o._time, m >= p) for (d = o._first; d && (g = d._next, m === o._time && (!o._paused || t));) {
          (d._active || d._startTime <= m && !d._paused && !d._gc) && (l === d && (o.pause(), o._pauseTime = n), d._reversed ? d.render((d._dirty ? d.totalDuration() : d._totalDuration) - (a - d._startTime) * d._timeScale, b, c) : d.render((a - d._startTime) * d._timeScale, b, c)), d = g;
        } else for (d = o._last; d && (g = d._prev, m === o._time && (!o._paused || t));) {
          if (d._active || d._startTime <= p && !d._paused && !d._gc) {
            if (l === d) {
              for (l = d._prev; l && l.endTime() > o._time;) {
                l.render(l._reversed ? l.totalDuration() - (a - l._startTime) * l._timeScale : (a - l._startTime) * l._timeScale, b, c), l = l._prev;
              }

              l = null, o.pause(), o._pauseTime = n;
            }

            d._reversed ? d.render((d._dirty ? d.totalDuration() : d._totalDuration) - (a - d._startTime) * d._timeScale, b, c) : d.render((a - d._startTime) * d._timeScale, b, c);
          }

          d = g;
        }
        o._onUpdate && (b || (j.length && k(), o._callback("onUpdate"))), h && (o._gc || (r === o._startTime || s !== o._timeScale) && (0 === o._time || q >= o.totalDuration()) && (f && (j.length && k(), o._timeline.autoRemoveChildren && o._enabled(!1, !1), o._active = !1), !b && o.vars[h] && o._callback(h)));
      }
    }, s._hasPausedChild = function () {
      for (var a = this._first; a;) {
        if (a._paused || a instanceof d && a._hasPausedChild()) return !0;
        a = a._next;
      }

      return !1;
    }, s.getChildren = function (a, b, d, e) {
      e = e || -9999999999;

      for (var f = [], g = this._first, h = 0; g;) {
        g._startTime < e || (g instanceof c ? b !== !1 && (f[h++] = g) : (d !== !1 && (f[h++] = g), a !== !1 && (f = f.concat(g.getChildren(!0, b, d)), h = f.length))), g = g._next;
      }

      return f;
    }, s.getTweensOf = function (a, b) {
      var d,
          e,
          f = this._gc,
          g = [],
          h = 0;

      for (f && this._enabled(!0, !0), d = c.getTweensOf(a), e = d.length; --e > -1;) {
        (d[e].timeline === this || b && this._contains(d[e])) && (g[h++] = d[e]);
      }

      return f && this._enabled(!1, !0), g;
    }, s.recent = function () {
      return this._recent;
    }, s._contains = function (a) {
      for (var b = a.timeline; b;) {
        if (b === this) return !0;
        b = b.timeline;
      }

      return !1;
    }, s.shiftChildren = function (a, b, c) {
      c = c || 0;

      for (var d, e = this._first, f = this._labels; e;) {
        e._startTime >= c && (e._startTime += a), e = e._next;
      }

      if (b) for (d in f) {
        f[d] >= c && (f[d] += a);
      }
      return this._uncache(!0);
    }, s._kill = function (a, b) {
      if (!a && !b) return this._enabled(!1, !1);

      for (var c = b ? this.getTweensOf(b) : this.getChildren(!0, !0, !1), d = c.length, e = !1; --d > -1;) {
        c[d]._kill(a, b) && (e = !0);
      }

      return e;
    }, s.clear = function (a) {
      var b = this.getChildren(!1, !0, !0),
          c = b.length;

      for (this._time = this._totalTime = 0; --c > -1;) {
        b[c]._enabled(!1, !1);
      }

      return a !== !1 && (this._labels = {}), this._uncache(!0);
    }, s.invalidate = function () {
      for (var b = this._first; b;) {
        b.invalidate(), b = b._next;
      }

      return a.prototype.invalidate.call(this);
    }, s._enabled = function (a, c) {
      if (a === this._gc) for (var d = this._first; d;) {
        d._enabled(a, !0), d = d._next;
      }
      return b.prototype._enabled.call(this, a, c);
    }, s.totalTime = function (b, c, d) {
      this._forcingPlayhead = !0;
      var e = a.prototype.totalTime.apply(this, arguments);
      return this._forcingPlayhead = !1, e;
    }, s.duration = function (a) {
      return arguments.length ? (0 !== this.duration() && 0 !== a && this.timeScale(this._duration / a), this) : (this._dirty && this.totalDuration(), this._duration);
    }, s.totalDuration = function (a) {
      if (!arguments.length) {
        if (this._dirty) {
          for (var b, c, d = 0, e = this, f = e._last, g = 999999999999; f;) {
            b = f._prev, f._dirty && f.totalDuration(), f._startTime > g && e._sortChildren && !f._paused && !e._calculatingDuration ? (e._calculatingDuration = 1, e.add(f, f._startTime - f._delay), e._calculatingDuration = 0) : g = f._startTime, f._startTime < 0 && !f._paused && (d -= f._startTime, e._timeline.smoothChildTiming && (e._startTime += f._startTime / e._timeScale, e._time -= f._startTime, e._totalTime -= f._startTime, e._rawPrevTime -= f._startTime), e.shiftChildren(-f._startTime, !1, -9999999999), g = 0), c = f._startTime + f._totalDuration / f._timeScale, c > d && (d = c), f = b;
          }

          e._duration = e._totalDuration = d, e._dirty = !1;
        }

        return this._totalDuration;
      }

      return a && this.totalDuration() ? this.timeScale(this._totalDuration / a) : this;
    }, s.paused = function (b) {
      if (b === !1 && this._paused) for (var c = this._first; c;) {
        c._startTime === this._time && "isPause" === c.data && (c._rawPrevTime = 0), c = c._next;
      }
      return a.prototype.paused.apply(this, arguments);
    }, s.usesFrames = function () {
      for (var b = this._timeline; b._timeline;) {
        b = b._timeline;
      }

      return b === a._rootFramesTimeline;
    }, s.rawTime = function (a) {
      return a && (this._paused || this._repeat && this.time() > 0 && this.totalProgress() < 1) ? this._totalTime % (this._duration + this._repeatDelay) : this._paused ? this._totalTime : (this._timeline.rawTime(a) - this._startTime) * this._timeScale;
    }, d;
  }, !0), _gsScope._gsDefine("TimelineMax", ["TimelineLite", "TweenLite", "easing.Ease"], function (a, b, c) {
    var d = function d(b) {
      a.call(this, b), this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._cycle = 0, this._yoyo = !!this.vars.yoyo, this._dirty = !0;
    },
        e = 1e-8,
        f = b._internals,
        g = f.lazyTweens,
        h = f.lazyRender,
        i = _gsScope._gsDefine.globals,
        j = new c(null, null, 1, 0),
        k = d.prototype = new a();

    return k.constructor = d, k.kill()._gc = !1, d.version = "2.1.3", k.invalidate = function () {
      return this._yoyo = !!this.vars.yoyo, this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._uncache(!0), a.prototype.invalidate.call(this);
    }, k.addCallback = function (a, c, d, e) {
      return this.add(b.delayedCall(0, a, d, e), c);
    }, k.removeCallback = function (a, b) {
      if (a) if (null == b) this._kill(null, a);else for (var c = this.getTweensOf(a, !1), d = c.length, e = this._parseTimeOrLabel(b); --d > -1;) {
        c[d]._startTime === e && c[d]._enabled(!1, !1);
      }
      return this;
    }, k.removePause = function (b) {
      return this.removeCallback(a._internals.pauseCallback, b);
    }, k.tweenTo = function (a, c) {
      c = c || {};
      var d,
          e,
          f,
          g = {
        ease: j,
        useFrames: this.usesFrames(),
        immediateRender: !1,
        lazy: !1
      },
          h = c.repeat && i.TweenMax || b;

      for (e in c) {
        g[e] = c[e];
      }

      return g.time = this._parseTimeOrLabel(a), d = Math.abs(Number(g.time) - this._time) / this._timeScale || .001, f = new h(this, d, g), g.onStart = function () {
        f.target.paused(!0), f.vars.time === f.target.time() || d !== f.duration() || f.isFromTo || f.duration(Math.abs(f.vars.time - f.target.time()) / f.target._timeScale).render(f.time(), !0, !0), c.onStart && c.onStart.apply(c.onStartScope || c.callbackScope || f, c.onStartParams || []);
      }, f;
    }, k.tweenFromTo = function (a, b, c) {
      c = c || {}, a = this._parseTimeOrLabel(a), c.startAt = {
        onComplete: this.seek,
        onCompleteParams: [a],
        callbackScope: this
      }, c.immediateRender = c.immediateRender !== !1;
      var d = this.tweenTo(b, c);
      return d.isFromTo = 1, d.duration(Math.abs(d.vars.time - a) / this._timeScale || .001);
    }, k.render = function (a, b, c) {
      this._gc && this._enabled(!0, !1);
      var d,
          f,
          i,
          j,
          k,
          l,
          m,
          n,
          o,
          p = this,
          q = p._time,
          r = p._dirty ? p.totalDuration() : p._totalDuration,
          s = p._duration,
          t = p._totalTime,
          u = p._startTime,
          v = p._timeScale,
          w = p._rawPrevTime,
          x = p._paused,
          y = p._cycle;
      if (q !== p._time && (a += p._time - q), a >= r - e && a >= 0) p._locked || (p._totalTime = r, p._cycle = p._repeat), p._reversed || p._hasPausedChild() || (f = !0, j = "onComplete", k = !!p._timeline.autoRemoveChildren, 0 === p._duration && (0 >= a && a >= -e || 0 > w || w === e) && w !== a && p._first && (k = !0, w > e && (j = "onReverseComplete"))), p._rawPrevTime = p._duration || !b || a || p._rawPrevTime === a ? a : e, p._yoyo && 1 & p._cycle ? p._time = a = 0 : (p._time = s, a = s + 1e-4);else if (e > a) {
        if (p._locked || (p._totalTime = p._cycle = 0), p._time = 0, a > -e && (a = 0), (0 !== q || 0 === s && w !== e && (w > 0 || 0 > a && w >= 0) && !p._locked) && (j = "onReverseComplete", f = p._reversed), 0 > a) p._active = !1, p._timeline.autoRemoveChildren && p._reversed ? (k = f = !0, j = "onReverseComplete") : w >= 0 && p._first && (k = !0), p._rawPrevTime = a;else {
          if (p._rawPrevTime = s || !b || a || p._rawPrevTime === a ? a : e, 0 === a && f) for (d = p._first; d && 0 === d._startTime;) {
            d._duration || (f = !1), d = d._next;
          }
          a = 0, p._initted || (k = !0);
        }
      } else 0 === s && 0 > w && (k = !0), p._time = p._rawPrevTime = a, p._locked || (p._totalTime = a, 0 !== p._repeat && (l = s + p._repeatDelay, p._cycle = p._totalTime / l >> 0, p._cycle && p._cycle === p._totalTime / l && a >= t && p._cycle--, p._time = p._totalTime - p._cycle * l, p._yoyo && 1 & p._cycle && (p._time = s - p._time), p._time > s ? (p._time = s, a = s + 1e-4) : p._time < 0 ? p._time = a = 0 : a = p._time));

      if (p._hasPause && !p._forcingPlayhead && !b) {
        if (a = p._time, a > q || p._repeat && y !== p._cycle) for (d = p._first; d && d._startTime <= a && !m;) {
          d._duration || "isPause" !== d.data || d.ratio || 0 === d._startTime && 0 === p._rawPrevTime || (m = d), d = d._next;
        } else for (d = p._last; d && d._startTime >= a && !m;) {
          d._duration || "isPause" === d.data && d._rawPrevTime > 0 && (m = d), d = d._prev;
        }
        m && (o = p._startTime + (p._reversed ? p._duration - m._startTime : m._startTime) / p._timeScale, m._startTime < s && (p._time = p._rawPrevTime = a = m._startTime, p._totalTime = a + p._cycle * (p._totalDuration + p._repeatDelay)));
      }

      if (p._cycle !== y && !p._locked) {
        var z = p._yoyo && 0 !== (1 & y),
            A = z === (p._yoyo && 0 !== (1 & p._cycle)),
            B = p._totalTime,
            C = p._cycle,
            D = p._rawPrevTime,
            E = p._time;
        if (p._totalTime = y * s, p._cycle < y ? z = !z : p._totalTime += s, p._time = q, p._rawPrevTime = 0 === s ? w - 1e-4 : w, p._cycle = y, p._locked = !0, q = z ? 0 : s, p.render(q, b, 0 === s), b || p._gc || p.vars.onRepeat && (p._cycle = C, p._locked = !1, p._callback("onRepeat")), q !== p._time) return;
        if (A && (p._cycle = y, p._locked = !0, q = z ? s + 1e-4 : -1e-4, p.render(q, !0, !1)), p._locked = !1, p._paused && !x) return;
        p._time = E, p._totalTime = B, p._cycle = C, p._rawPrevTime = D;
      }

      if (!(p._time !== q && p._first || c || k || m)) return void (t !== p._totalTime && p._onUpdate && (b || p._callback("onUpdate")));
      if (p._initted || (p._initted = !0), p._active || !p._paused && p._totalTime !== t && a > 0 && (p._active = !0), 0 === t && p.vars.onStart && (0 === p._totalTime && p._totalDuration || b || p._callback("onStart")), n = p._time, n >= q) for (d = p._first; d && (i = d._next, n === p._time && (!p._paused || x));) {
        (d._active || d._startTime <= p._time && !d._paused && !d._gc) && (m === d && (p.pause(), p._pauseTime = o), d._reversed ? d.render((d._dirty ? d.totalDuration() : d._totalDuration) - (a - d._startTime) * d._timeScale, b, c) : d.render((a - d._startTime) * d._timeScale, b, c)), d = i;
      } else for (d = p._last; d && (i = d._prev, n === p._time && (!p._paused || x));) {
        if (d._active || d._startTime <= q && !d._paused && !d._gc) {
          if (m === d) {
            for (m = d._prev; m && m.endTime() > p._time;) {
              m.render(m._reversed ? m.totalDuration() - (a - m._startTime) * m._timeScale : (a - m._startTime) * m._timeScale, b, c), m = m._prev;
            }

            m = null, p.pause(), p._pauseTime = o;
          }

          d._reversed ? d.render((d._dirty ? d.totalDuration() : d._totalDuration) - (a - d._startTime) * d._timeScale, b, c) : d.render((a - d._startTime) * d._timeScale, b, c);
        }

        d = i;
      }
      p._onUpdate && (b || (g.length && h(), p._callback("onUpdate"))), j && (p._locked || p._gc || (u === p._startTime || v !== p._timeScale) && (0 === p._time || r >= p.totalDuration()) && (f && (g.length && h(), p._timeline.autoRemoveChildren && p._enabled(!1, !1), p._active = !1), !b && p.vars[j] && p._callback(j)));
    }, k.getActive = function (a, b, c) {
      var d,
          e,
          f = [],
          g = this.getChildren(a || null == a, b || null == a, !!c),
          h = 0,
          i = g.length;

      for (d = 0; i > d; d++) {
        e = g[d], e.isActive() && (f[h++] = e);
      }

      return f;
    }, k.getLabelAfter = function (a) {
      a || 0 !== a && (a = this._time);
      var b,
          c = this.getLabelsArray(),
          d = c.length;

      for (b = 0; d > b; b++) {
        if (c[b].time > a) return c[b].name;
      }

      return null;
    }, k.getLabelBefore = function (a) {
      null == a && (a = this._time);

      for (var b = this.getLabelsArray(), c = b.length; --c > -1;) {
        if (b[c].time < a) return b[c].name;
      }

      return null;
    }, k.getLabelsArray = function () {
      var a,
          b = [],
          c = 0;

      for (a in this._labels) {
        b[c++] = {
          time: this._labels[a],
          name: a
        };
      }

      return b.sort(function (a, b) {
        return a.time - b.time;
      }), b;
    }, k.invalidate = function () {
      return this._locked = !1, a.prototype.invalidate.call(this);
    }, k.progress = function (a, b) {
      return arguments.length ? this.totalTime(this.duration() * (this._yoyo && 0 !== (1 & this._cycle) ? 1 - a : a) + this._cycle * (this._duration + this._repeatDelay), b) : this._time / this.duration() || 0;
    }, k.totalProgress = function (a, b) {
      return arguments.length ? this.totalTime(this.totalDuration() * a, b) : this._totalTime / this.totalDuration() || 0;
    }, k.totalDuration = function (b) {
      return arguments.length ? -1 !== this._repeat && b ? this.timeScale(this.totalDuration() / b) : this : (this._dirty && (a.prototype.totalDuration.call(this), this._totalDuration = -1 === this._repeat ? 999999999999 : this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat), this._totalDuration);
    }, k.time = function (a, b) {
      if (!arguments.length) return this._time;
      this._dirty && this.totalDuration();
      var c = this._duration,
          d = this._cycle,
          e = d * (c + this._repeatDelay);
      return a > c && (a = c), this.totalTime(this._yoyo && 1 & d ? c - a + e : this._repeat ? a + e : a, b);
    }, k.repeat = function (a) {
      return arguments.length ? (this._repeat = a, this._uncache(!0)) : this._repeat;
    }, k.repeatDelay = function (a) {
      return arguments.length ? (this._repeatDelay = a, this._uncache(!0)) : this._repeatDelay;
    }, k.yoyo = function (a) {
      return arguments.length ? (this._yoyo = a, this) : this._yoyo;
    }, k.currentLabel = function (a) {
      return arguments.length ? this.seek(a, !0) : this.getLabelBefore(this._time + e);
    }, d;
  }, !0), function () {
    var a = 180 / Math.PI,
        b = [],
        c = [],
        d = [],
        e = {},
        f = _gsScope._gsDefine.globals,
        g = function g(a, b, c, d) {
      c === d && (c = d - (d - b) / 1e6), a === b && (b = a + (c - a) / 1e6), this.a = a, this.b = b, this.c = c, this.d = d, this.da = d - a, this.ca = c - a, this.ba = b - a;
    },
        h = ",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",
        i = function i(a, b, c, d) {
      var e = {
        a: a
      },
          f = {},
          g = {},
          h = {
        c: d
      },
          i = (a + b) / 2,
          j = (b + c) / 2,
          k = (c + d) / 2,
          l = (i + j) / 2,
          m = (j + k) / 2,
          n = (m - l) / 8;
      return e.b = i + (a - i) / 4, f.b = l + n, e.c = f.a = (e.b + f.b) / 2, f.c = g.a = (l + m) / 2, g.b = m - n, h.b = k + (d - k) / 4, g.c = h.a = (g.b + h.b) / 2, [e, f, g, h];
    },
        j = function j(a, e, f, g, h) {
      var j,
          k,
          l,
          m,
          n,
          o,
          p,
          q,
          r,
          s,
          t,
          u,
          v,
          w = a.length - 1,
          x = 0,
          y = a[0].a;

      for (j = 0; w > j; j++) {
        n = a[x], k = n.a, l = n.d, m = a[x + 1].d, h ? (t = b[j], u = c[j], v = (u + t) * e * .25 / (g ? .5 : d[j] || .5), o = l - (l - k) * (g ? .5 * e : 0 !== t ? v / t : 0), p = l + (m - l) * (g ? .5 * e : 0 !== u ? v / u : 0), q = l - (o + ((p - o) * (3 * t / (t + u) + .5) / 4 || 0))) : (o = l - (l - k) * e * .5, p = l + (m - l) * e * .5, q = l - (o + p) / 2), o += q, p += q, n.c = r = o, 0 !== j ? n.b = y : n.b = y = n.a + .6 * (n.c - n.a), n.da = l - k, n.ca = r - k, n.ba = y - k, f ? (s = i(k, y, r, l), a.splice(x, 1, s[0], s[1], s[2], s[3]), x += 4) : x++, y = p;
      }

      n = a[x], n.b = y, n.c = y + .4 * (n.d - y), n.da = n.d - n.a, n.ca = n.c - n.a, n.ba = y - n.a, f && (s = i(n.a, y, n.c, n.d), a.splice(x, 1, s[0], s[1], s[2], s[3]));
    },
        k = function k(a, d, e, f) {
      var h,
          i,
          j,
          k,
          l,
          m,
          n = [];
      if (f) for (a = [f].concat(a), i = a.length; --i > -1;) {
        "string" == typeof (m = a[i][d]) && "=" === m.charAt(1) && (a[i][d] = f[d] + Number(m.charAt(0) + m.substr(2)));
      }
      if (h = a.length - 2, 0 > h) return n[0] = new g(a[0][d], 0, 0, a[0][d]), n;

      for (i = 0; h > i; i++) {
        j = a[i][d], k = a[i + 1][d], n[i] = new g(j, 0, 0, k), e && (l = a[i + 2][d], b[i] = (b[i] || 0) + (k - j) * (k - j), c[i] = (c[i] || 0) + (l - k) * (l - k));
      }

      return n[i] = new g(a[i][d], 0, 0, a[i + 1][d]), n;
    },
        l = function l(a, f, g, i, _l2, m) {
      var n,
          o,
          p,
          q,
          r,
          s,
          t,
          u,
          v = {},
          w = [],
          x = m || a[0];
      _l2 = "string" == typeof _l2 ? "," + _l2 + "," : h, null == f && (f = 1);

      for (o in a[0]) {
        w.push(o);
      }

      if (a.length > 1) {
        for (u = a[a.length - 1], t = !0, n = w.length; --n > -1;) {
          if (o = w[n], Math.abs(x[o] - u[o]) > .05) {
            t = !1;
            break;
          }
        }

        t && (a = a.concat(), m && a.unshift(m), a.push(a[1]), m = a[a.length - 3]);
      }

      for (b.length = c.length = d.length = 0, n = w.length; --n > -1;) {
        o = w[n], e[o] = -1 !== _l2.indexOf("," + o + ","), v[o] = k(a, o, e[o], m);
      }

      for (n = b.length; --n > -1;) {
        b[n] = Math.sqrt(b[n]), c[n] = Math.sqrt(c[n]);
      }

      if (!i) {
        for (n = w.length; --n > -1;) {
          if (e[o]) for (p = v[w[n]], s = p.length - 1, q = 0; s > q; q++) {
            r = p[q + 1].da / c[q] + p[q].da / b[q] || 0, d[q] = (d[q] || 0) + r * r;
          }
        }

        for (n = d.length; --n > -1;) {
          d[n] = Math.sqrt(d[n]);
        }
      }

      for (n = w.length, q = g ? 4 : 1; --n > -1;) {
        o = w[n], p = v[o], j(p, f, g, i, e[o]), t && (p.splice(0, q), p.splice(p.length - q, q));
      }

      return v;
    },
        m = function m(a, b, c) {
      b = b || "soft";
      var d,
          e,
          f,
          h,
          i,
          j,
          k,
          l,
          m,
          n,
          o,
          p = {},
          q = "cubic" === b ? 3 : 2,
          r = "soft" === b,
          s = [];
      if (r && c && (a = [c].concat(a)), null == a || a.length < q + 1) throw "invalid Bezier data";

      for (m in a[0]) {
        s.push(m);
      }

      for (j = s.length; --j > -1;) {
        for (m = s[j], p[m] = i = [], n = 0, l = a.length, k = 0; l > k; k++) {
          d = null == c ? a[k][m] : "string" == typeof (o = a[k][m]) && "=" === o.charAt(1) ? c[m] + Number(o.charAt(0) + o.substr(2)) : Number(o), r && k > 1 && l - 1 > k && (i[n++] = (d + i[n - 2]) / 2), i[n++] = d;
        }

        for (l = n - q + 1, n = 0, k = 0; l > k; k += q) {
          d = i[k], e = i[k + 1], f = i[k + 2], h = 2 === q ? 0 : i[k + 3], i[n++] = o = 3 === q ? new g(d, e, f, h) : new g(d, (2 * e + d) / 3, (2 * e + f) / 3, f);
        }

        i.length = n;
      }

      return p;
    },
        n = function n(a, b, c) {
      for (var d, e, f, g, h, i, j, k, l, m, n, o = 1 / c, p = a.length; --p > -1;) {
        for (m = a[p], f = m.a, g = m.d - f, h = m.c - f, i = m.b - f, d = e = 0, k = 1; c >= k; k++) {
          j = o * k, l = 1 - j, d = e - (e = (j * j * g + 3 * l * (j * h + l * i)) * j), n = p * c + k - 1, b[n] = (b[n] || 0) + d * d;
        }
      }
    },
        o = function o(a, b) {
      b = b >> 0 || 6;
      var c,
          d,
          e,
          f,
          g = [],
          h = [],
          i = 0,
          j = 0,
          k = b - 1,
          l = [],
          m = [];

      for (c in a) {
        n(a[c], g, b);
      }

      for (e = g.length, d = 0; e > d; d++) {
        i += Math.sqrt(g[d]), f = d % b, m[f] = i, f === k && (j += i, f = d / b >> 0, l[f] = m, h[f] = j, i = 0, m = []);
      }

      return {
        length: j,
        lengths: h,
        segments: l
      };
    },
        p = _gsScope._gsDefine.plugin({
      propName: "bezier",
      priority: -1,
      version: "1.3.9",
      API: 2,
      global: !0,
      init: function init(a, b, c) {
        this._target = a, b instanceof Array && (b = {
          values: b
        }), this._func = {}, this._mod = {}, this._props = [], this._timeRes = null == b.timeResolution ? 6 : parseInt(b.timeResolution, 10);
        var d,
            e,
            f,
            g,
            h,
            i = b.values || [],
            j = {},
            k = i[0],
            n = b.autoRotate || c.vars.orientToBezier;
        this._autoRotate = n ? n instanceof Array ? n : [["x", "y", "rotation", n === !0 ? 0 : Number(n) || 0]] : null;

        for (d in k) {
          this._props.push(d);
        }

        for (f = this._props.length; --f > -1;) {
          d = this._props[f], this._overwriteProps.push(d), e = this._func[d] = "function" == typeof a[d], j[d] = e ? a[d.indexOf("set") || "function" != typeof a["get" + d.substr(3)] ? d : "get" + d.substr(3)]() : parseFloat(a[d]), h || j[d] !== i[0][d] && (h = j);
        }

        if (this._beziers = "cubic" !== b.type && "quadratic" !== b.type && "soft" !== b.type ? l(i, isNaN(b.curviness) ? 1 : b.curviness, !1, "thruBasic" === b.type, b.correlate, h) : m(i, b.type, j), this._segCount = this._beziers[d].length, this._timeRes) {
          var p = o(this._beziers, this._timeRes);
          this._length = p.length, this._lengths = p.lengths, this._segments = p.segments, this._l1 = this._li = this._s1 = this._si = 0, this._l2 = this._lengths[0], this._curSeg = this._segments[0], this._s2 = this._curSeg[0], this._prec = 1 / this._curSeg.length;
        }

        if (n = this._autoRotate) for (this._initialRotations = [], n[0] instanceof Array || (this._autoRotate = n = [n]), f = n.length; --f > -1;) {
          for (g = 0; 3 > g; g++) {
            d = n[f][g], this._func[d] = "function" == typeof a[d] ? a[d.indexOf("set") || "function" != typeof a["get" + d.substr(3)] ? d : "get" + d.substr(3)] : !1;
          }

          d = n[f][2], this._initialRotations[f] = (this._func[d] ? this._func[d].call(this._target) : this._target[d]) || 0, this._overwriteProps.push(d);
        }
        return this._startRatio = c.vars.runBackwards ? 1 : 0, !0;
      },
      set: function set(b) {
        var c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n = this._segCount,
            o = this._func,
            p = this._target,
            q = b !== this._startRatio;

        if (this._timeRes) {
          if (k = this._lengths, l = this._curSeg, m = b * this._length, e = this._li, m > this._l2 && n - 1 > e) {
            for (j = n - 1; j > e && (this._l2 = k[++e]) <= m;) {
              ;
            }

            this._l1 = k[e - 1], this._li = e, this._curSeg = l = this._segments[e], this._s2 = l[this._s1 = this._si = 0];
          } else if (m < this._l1 && e > 0) {
            for (; e > 0 && (this._l1 = k[--e]) >= m;) {
              ;
            }

            0 === e && m < this._l1 ? this._l1 = 0 : e++, this._l2 = k[e], this._li = e, this._curSeg = l = this._segments[e], this._s1 = l[(this._si = l.length - 1) - 1] || 0, this._s2 = l[this._si];
          }

          if (c = e, m -= this._l1, e = this._si, m > this._s2 && e < l.length - 1) {
            for (j = l.length - 1; j > e && (this._s2 = l[++e]) <= m;) {
              ;
            }

            this._s1 = l[e - 1], this._si = e;
          } else if (m < this._s1 && e > 0) {
            for (; e > 0 && (this._s1 = l[--e]) >= m;) {
              ;
            }

            0 === e && m < this._s1 ? this._s1 = 0 : e++, this._s2 = l[e], this._si = e;
          }

          h = 1 === b ? 1 : (e + (m - this._s1) / (this._s2 - this._s1)) * this._prec || 0;
        } else c = 0 > b ? 0 : b >= 1 ? n - 1 : n * b >> 0, h = (b - c * (1 / n)) * n;

        for (d = 1 - h, e = this._props.length; --e > -1;) {
          f = this._props[e], g = this._beziers[f][c], i = (h * h * g.da + 3 * d * (h * g.ca + d * g.ba)) * h + g.a, this._mod[f] && (i = this._mod[f](i, p)), o[f] ? p[f](i) : p[f] = i;
        }

        if (this._autoRotate) {
          var r,
              s,
              t,
              u,
              v,
              w,
              x,
              y = this._autoRotate;

          for (e = y.length; --e > -1;) {
            f = y[e][2], w = y[e][3] || 0, x = y[e][4] === !0 ? 1 : a, g = this._beziers[y[e][0]], r = this._beziers[y[e][1]], g && r && (g = g[c], r = r[c], s = g.a + (g.b - g.a) * h, u = g.b + (g.c - g.b) * h, s += (u - s) * h, u += (g.c + (g.d - g.c) * h - u) * h, t = r.a + (r.b - r.a) * h, v = r.b + (r.c - r.b) * h, t += (v - t) * h, v += (r.c + (r.d - r.c) * h - v) * h, i = q ? Math.atan2(v - t, u - s) * x + w : this._initialRotations[e], this._mod[f] && (i = this._mod[f](i, p)), o[f] ? p[f](i) : p[f] = i);
          }
        }
      }
    }),
        q = p.prototype;

    p.bezierThrough = l, p.cubicToQuadratic = i, p._autoCSS = !0, p.quadraticToCubic = function (a, b, c) {
      return new g(a, (2 * b + a) / 3, (2 * b + c) / 3, c);
    }, p._cssRegister = function () {
      var a = f.CSSPlugin;

      if (a) {
        var b = a._internals,
            c = b._parseToProxy,
            d = b._setPluginRatio,
            e = b.CSSPropTween;

        b._registerComplexSpecialProp("bezier", {
          parser: function parser(a, b, f, g, h, i) {
            b instanceof Array && (b = {
              values: b
            }), i = new p();
            var j,
                k,
                l,
                m = b.values,
                n = m.length - 1,
                o = [],
                q = {};
            if (0 > n) return h;

            for (j = 0; n >= j; j++) {
              l = c(a, m[j], g, h, i, n !== j), o[j] = l.end;
            }

            for (k in b) {
              q[k] = b[k];
            }

            return q.values = o, h = new e(a, "bezier", 0, 0, l.pt, 2), h.data = l, h.plugin = i, h.setRatio = d, 0 === q.autoRotate && (q.autoRotate = !0), !q.autoRotate || q.autoRotate instanceof Array || (j = q.autoRotate === !0 ? 0 : Number(q.autoRotate), q.autoRotate = null != l.end.left ? [["left", "top", "rotation", j, !1]] : null != l.end.x ? [["x", "y", "rotation", j, !1]] : !1), q.autoRotate && (g._transform || g._enableTransforms(!1), l.autoRotate = g._target._gsTransform, l.proxy.rotation = l.autoRotate.rotation || 0, g._overwriteProps.push("rotation")), i._onInitTween(l.proxy, q, g._tween), h;
          }
        });
      }
    }, q._mod = function (a) {
      for (var b, c = this._overwriteProps, d = c.length; --d > -1;) {
        b = a[c[d]], b && "function" == typeof b && (this._mod[c[d]] = b);
      }
    }, q._kill = function (a) {
      var b,
          c,
          d = this._props;

      for (b in this._beziers) {
        if (b in a) for (delete this._beziers[b], delete this._func[b], c = d.length; --c > -1;) {
          d[c] === b && d.splice(c, 1);
        }
      }

      if (d = this._autoRotate) for (c = d.length; --c > -1;) {
        a[d[c][2]] && d.splice(c, 1);
      }
      return this._super._kill.call(this, a);
    };
  }(), _gsScope._gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin", "TweenLite"], function (a, b) {
    var c,
        d,
        e,
        f,
        g = function g() {
      a.call(this, "css"), this._overwriteProps.length = 0, this.setRatio = g.prototype.setRatio;
    },
        h = _gsScope._gsDefine.globals,
        i = {},
        j = g.prototype = new a("css");

    j.constructor = g, g.version = "2.1.3", g.API = 2, g.defaultTransformPerspective = 0, g.defaultSkewType = "compensated", g.defaultSmoothOrigin = !0, j = "px", g.suffixMap = {
      top: j,
      right: j,
      bottom: j,
      left: j,
      width: j,
      height: j,
      fontSize: j,
      padding: j,
      margin: j,
      perspective: j,
      lineHeight: ""
    };

    var k,
        l,
        m,
        n,
        o,
        p,
        q,
        r,
        s = /(?:\-|\.|\b)(\d|\.|e\-)+/g,
        t = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
        u = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,
        v = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b),?/gi,
        w = /(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,
        x = /(?:\d|\-|\+|=|#|\.)*/g,
        y = /opacity *= *([^)]*)/i,
        z = /opacity:([^;]*)/i,
        A = /alpha\(opacity *=.+?\)/i,
        B = /^(rgb|hsl)/,
        C = /([A-Z])/g,
        D = /-([a-z])/gi,
        E = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,
        F = function F(a, b) {
      return b.toUpperCase();
    },
        G = /(?:Left|Right|Width)/i,
        H = /(M11|M12|M21|M22)=[\d\-\.e]+/gi,
        I = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
        J = /,(?=[^\)]*(?:\(|$))/gi,
        K = /[\s,\(]/i,
        L = Math.PI / 180,
        M = 180 / Math.PI,
        N = {},
        O = {
      style: {}
    },
        P = _gsScope.document || {
      createElement: function createElement() {
        return O;
      }
    },
        Q = function Q(a, b) {
      var c = P.createElementNS ? P.createElementNS(b || "http://www.w3.org/1999/xhtml", a) : P.createElement(a);
      return c.style ? c : P.createElement(a);
    },
        R = Q("div"),
        S = Q("img"),
        T = g._internals = {
      _specialProps: i
    },
        U = (_gsScope.navigator || {}).userAgent || "",
        V = function () {
      var a = U.indexOf("Android"),
          b = Q("a");
      return m = -1 !== U.indexOf("Safari") && -1 === U.indexOf("Chrome") && (-1 === a || parseFloat(U.substr(a + 8, 2)) > 3), o = m && parseFloat(U.substr(U.indexOf("Version/") + 8, 2)) < 6, n = -1 !== U.indexOf("Firefox"), (/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(U) || /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(U)) && (p = parseFloat(RegExp.$1)), b ? (b.style.cssText = "top:1px;opacity:.55;", /^0.55/.test(b.style.opacity)) : !1;
    }(),
        W = function W(a) {
      return y.test("string" == typeof a ? a : (a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? parseFloat(RegExp.$1) / 100 : 1;
    },
        X = function X(a) {
      _gsScope.console && console.log(a);
    },
        Y = "",
        Z = "",
        $ = function $(a, b) {
      b = b || R;
      var c,
          d,
          e = b.style;
      if (void 0 !== e[a]) return a;

      for (a = a.charAt(0).toUpperCase() + a.substr(1), c = ["O", "Moz", "ms", "Ms", "Webkit"], d = 5; --d > -1 && void 0 === e[c[d] + a];) {
        ;
      }

      return d >= 0 ? (Z = 3 === d ? "ms" : c[d], Y = "-" + Z.toLowerCase() + "-", Z + a) : null;
    },
        _ = "undefined" != typeof window ? window : P.defaultView || {
      getComputedStyle: function getComputedStyle() {}
    },
        aa = function aa(a) {
      return _.getComputedStyle(a);
    },
        ba = g.getStyle = function (a, b, c, d, e) {
      var f;
      return V || "opacity" !== b ? (!d && a.style[b] ? f = a.style[b] : (c = c || aa(a)) ? f = c[b] || c.getPropertyValue(b) || c.getPropertyValue(b.replace(C, "-$1").toLowerCase()) : a.currentStyle && (f = a.currentStyle[b]), null == e || f && "none" !== f && "auto" !== f && "auto auto" !== f ? f : e) : W(a);
    },
        ca = T.convertToPixels = function (a, c, d, e, f) {
      if ("px" === e || !e && "lineHeight" !== c) return d;
      if ("auto" === e || !d) return 0;
      var h,
          i,
          j,
          k = G.test(c),
          l = a,
          m = R.style,
          n = 0 > d,
          o = 1 === d;
      if (n && (d = -d), o && (d *= 100), "lineHeight" !== c || e) {
        if ("%" === e && -1 !== c.indexOf("border")) h = d / 100 * (k ? a.clientWidth : a.clientHeight);else {
          if (m.cssText = "border:0 solid red;position:" + ba(a, "position") + ";line-height:0;", "%" !== e && l.appendChild && "v" !== e.charAt(0) && "rem" !== e) m[k ? "borderLeftWidth" : "borderTopWidth"] = d + e;else {
            if (l = a.parentNode || P.body, -1 !== ba(l, "display").indexOf("flex") && (m.position = "absolute"), i = l._gsCache, j = b.ticker.frame, i && k && i.time === j) return i.width * d / 100;
            m[k ? "width" : "height"] = d + e;
          }
          l.appendChild(R), h = parseFloat(R[k ? "offsetWidth" : "offsetHeight"]), l.removeChild(R), k && "%" === e && g.cacheWidths !== !1 && (i = l._gsCache = l._gsCache || {}, i.time = j, i.width = h / d * 100), 0 !== h || f || (h = ca(a, c, d, e, !0));
        }
      } else i = aa(a).lineHeight, a.style.lineHeight = d, h = parseFloat(aa(a).lineHeight), a.style.lineHeight = i;
      return o && (h /= 100), n ? -h : h;
    },
        da = T.calculateOffset = function (a, b, c) {
      if ("absolute" !== ba(a, "position", c)) return 0;
      var d = "left" === b ? "Left" : "Top",
          e = ba(a, "margin" + d, c);
      return a["offset" + d] - (ca(a, b, parseFloat(e), e.replace(x, "")) || 0);
    },
        ea = function ea(a, b) {
      var c,
          d,
          e,
          f = {};
      if (b = b || aa(a, null)) {
        if (c = b.length) for (; --c > -1;) {
          e = b[c], (-1 === e.indexOf("-transform") || Fa === e) && (f[e.replace(D, F)] = b.getPropertyValue(e));
        } else for (c in b) {
          (-1 === c.indexOf("Transform") || Ea === c) && (f[c] = b[c]);
        }
      } else if (b = a.currentStyle || a.style) for (c in b) {
        "string" == typeof c && void 0 === f[c] && (f[c.replace(D, F)] = b[c]);
      }
      return V || (f.opacity = W(a)), d = Ta(a, b, !1), f.rotation = d.rotation, f.skewX = d.skewX, f.scaleX = d.scaleX, f.scaleY = d.scaleY, f.x = d.x, f.y = d.y, Ha && (f.z = d.z, f.rotationX = d.rotationX, f.rotationY = d.rotationY, f.scaleZ = d.scaleZ), f.filters && delete f.filters, f;
    },
        fa = function fa(a, b, c, d, e) {
      var f,
          g,
          h,
          i = {},
          j = a.style;

      for (g in c) {
        "cssText" !== g && "length" !== g && isNaN(g) && (b[g] !== (f = c[g]) || e && e[g]) && -1 === g.indexOf("Origin") && ("number" == typeof f || "string" == typeof f) && (i[g] = "auto" !== f || "left" !== g && "top" !== g ? "" !== f && "auto" !== f && "none" !== f || "string" != typeof b[g] || "" === b[g].replace(w, "") ? f : 0 : da(a, g), void 0 !== j[g] && (h = new ua(j, g, j[g], h)));
      }

      if (d) for (g in d) {
        "className" !== g && (i[g] = d[g]);
      }
      return {
        difs: i,
        firstMPT: h
      };
    },
        ga = {
      width: ["Left", "Right"],
      height: ["Top", "Bottom"]
    },
        ha = ["marginLeft", "marginRight", "marginTop", "marginBottom"],
        ia = function ia(a, b, c) {
      if ("svg" === (a.nodeName + "").toLowerCase()) return (c || aa(a))[b] || 0;
      if (a.getCTM && Qa(a)) return a.getBBox()[b] || 0;
      var d = parseFloat("width" === b ? a.offsetWidth : a.offsetHeight),
          e = ga[b],
          f = e.length;

      for (c = c || aa(a, null); --f > -1;) {
        d -= parseFloat(ba(a, "padding" + e[f], c, !0)) || 0, d -= parseFloat(ba(a, "border" + e[f] + "Width", c, !0)) || 0;
      }

      return d;
    },
        ja = function ja(a, b) {
      if ("contain" === a || "auto" === a || "auto auto" === a) return a + " ";
      (null == a || "" === a) && (a = "0 0");
      var c,
          d = a.split(" "),
          e = -1 !== a.indexOf("left") ? "0%" : -1 !== a.indexOf("right") ? "100%" : d[0],
          f = -1 !== a.indexOf("top") ? "0%" : -1 !== a.indexOf("bottom") ? "100%" : d[1];

      if (d.length > 3 && !b) {
        for (d = a.split(", ").join(",").split(","), a = [], c = 0; c < d.length; c++) {
          a.push(ja(d[c]));
        }

        return a.join(",");
      }

      return null == f ? f = "center" === e ? "50%" : "0" : "center" === f && (f = "50%"), ("center" === e || isNaN(parseFloat(e)) && -1 === (e + "").indexOf("=")) && (e = "50%"), a = e + " " + f + (d.length > 2 ? " " + d[2] : ""), b && (b.oxp = -1 !== e.indexOf("%"), b.oyp = -1 !== f.indexOf("%"), b.oxr = "=" === e.charAt(1), b.oyr = "=" === f.charAt(1), b.ox = parseFloat(e.replace(w, "")), b.oy = parseFloat(f.replace(w, "")), b.v = a), b || a;
    },
        ka = function ka(a, b) {
      return "function" == typeof a && (a = a(r, q)), "string" == typeof a && "=" === a.charAt(1) ? parseInt(a.charAt(0) + "1", 10) * parseFloat(a.substr(2)) : parseFloat(a) - parseFloat(b) || 0;
    },
        la = function la(a, b) {
      "function" == typeof a && (a = a(r, q));
      var c = "string" == typeof a && "=" === a.charAt(1);
      return "string" == typeof a && "v" === a.charAt(a.length - 2) && (a = (c ? a.substr(0, 2) : 0) + window["inner" + ("vh" === a.substr(-2) ? "Height" : "Width")] * (parseFloat(c ? a.substr(2) : a) / 100)), null == a ? b : c ? parseInt(a.charAt(0) + "1", 10) * parseFloat(a.substr(2)) + b : parseFloat(a) || 0;
    },
        ma = function ma(a, b, c, d) {
      var e,
          f,
          g,
          h,
          i,
          j = 1e-6;
      return "function" == typeof a && (a = a(r, q)), null == a ? h = b : "number" == typeof a ? h = a : (e = 360, f = a.split("_"), i = "=" === a.charAt(1), g = (i ? parseInt(a.charAt(0) + "1", 10) * parseFloat(f[0].substr(2)) : parseFloat(f[0])) * (-1 === a.indexOf("rad") ? 1 : M) - (i ? 0 : b), f.length && (d && (d[c] = b + g), -1 !== a.indexOf("short") && (g %= e, g !== g % (e / 2) && (g = 0 > g ? g + e : g - e)), -1 !== a.indexOf("_cw") && 0 > g ? g = (g + 9999999999 * e) % e - (g / e | 0) * e : -1 !== a.indexOf("ccw") && g > 0 && (g = (g - 9999999999 * e) % e - (g / e | 0) * e)), h = b + g), j > h && h > -j && (h = 0), h;
    },
        na = {
      aqua: [0, 255, 255],
      lime: [0, 255, 0],
      silver: [192, 192, 192],
      black: [0, 0, 0],
      maroon: [128, 0, 0],
      teal: [0, 128, 128],
      blue: [0, 0, 255],
      navy: [0, 0, 128],
      white: [255, 255, 255],
      fuchsia: [255, 0, 255],
      olive: [128, 128, 0],
      yellow: [255, 255, 0],
      orange: [255, 165, 0],
      gray: [128, 128, 128],
      purple: [128, 0, 128],
      green: [0, 128, 0],
      red: [255, 0, 0],
      pink: [255, 192, 203],
      cyan: [0, 255, 255],
      transparent: [255, 255, 255, 0]
    },
        oa = function oa(a, b, c) {
      return a = 0 > a ? a + 1 : a > 1 ? a - 1 : a, 255 * (1 > 6 * a ? b + (c - b) * a * 6 : .5 > a ? c : 2 > 3 * a ? b + (c - b) * (2 / 3 - a) * 6 : b) + .5 | 0;
    },
        pa = g.parseColor = function (a, b) {
      var c, d, e, f, g, h, i, j, k, l, m;
      if (a) {
        if ("number" == typeof a) c = [a >> 16, a >> 8 & 255, 255 & a];else {
          if ("," === a.charAt(a.length - 1) && (a = a.substr(0, a.length - 1)), na[a]) c = na[a];else if ("#" === a.charAt(0)) 4 === a.length && (d = a.charAt(1), e = a.charAt(2), f = a.charAt(3), a = "#" + d + d + e + e + f + f), a = parseInt(a.substr(1), 16), c = [a >> 16, a >> 8 & 255, 255 & a];else if ("hsl" === a.substr(0, 3)) {
            if (c = m = a.match(s), b) {
              if (-1 !== a.indexOf("=")) return a.match(t);
            } else g = Number(c[0]) % 360 / 360, h = Number(c[1]) / 100, i = Number(c[2]) / 100, e = .5 >= i ? i * (h + 1) : i + h - i * h, d = 2 * i - e, c.length > 3 && (c[3] = Number(c[3])), c[0] = oa(g + 1 / 3, d, e), c[1] = oa(g, d, e), c[2] = oa(g - 1 / 3, d, e);
          } else c = a.match(s) || na.transparent;
          c[0] = Number(c[0]), c[1] = Number(c[1]), c[2] = Number(c[2]), c.length > 3 && (c[3] = Number(c[3]));
        }
      } else c = na.black;
      return b && !m && (d = c[0] / 255, e = c[1] / 255, f = c[2] / 255, j = Math.max(d, e, f), k = Math.min(d, e, f), i = (j + k) / 2, j === k ? g = h = 0 : (l = j - k, h = i > .5 ? l / (2 - j - k) : l / (j + k), g = j === d ? (e - f) / l + (f > e ? 6 : 0) : j === e ? (f - d) / l + 2 : (d - e) / l + 4, g *= 60), c[0] = g + .5 | 0, c[1] = 100 * h + .5 | 0, c[2] = 100 * i + .5 | 0), c;
    },
        qa = function qa(a, b) {
      var c,
          d,
          e,
          f = a.match(ra) || [],
          g = 0,
          h = "";
      if (!f.length) return a;

      for (c = 0; c < f.length; c++) {
        d = f[c], e = a.substr(g, a.indexOf(d, g) - g), g += e.length + d.length, d = pa(d, b), 3 === d.length && d.push(1), h += e + (b ? "hsla(" + d[0] + "," + d[1] + "%," + d[2] + "%," + d[3] : "rgba(" + d.join(",")) + ")";
      }

      return h + a.substr(g);
    },
        ra = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b";

    for (j in na) {
      ra += "|" + j + "\\b";
    }

    ra = new RegExp(ra + ")", "gi"), g.colorStringFilter = function (a) {
      var b,
          c = a[0] + " " + a[1];
      ra.test(c) && (b = -1 !== c.indexOf("hsl(") || -1 !== c.indexOf("hsla("), a[0] = qa(a[0], b), a[1] = qa(a[1], b)), ra.lastIndex = 0;
    }, b.defaultStringFilter || (b.defaultStringFilter = g.colorStringFilter);

    var sa = function sa(a, b, c, d) {
      if (null == a) return function (a) {
        return a;
      };
      var e,
          f = b ? (a.match(ra) || [""])[0] : "",
          g = a.split(f).join("").match(u) || [],
          h = a.substr(0, a.indexOf(g[0])),
          i = ")" === a.charAt(a.length - 1) ? ")" : "",
          j = -1 !== a.indexOf(" ") ? " " : ",",
          k = g.length,
          l = k > 0 ? g[0].replace(s, "") : "";
      return k ? e = b ? function (a) {
        var b, m, n, o;
        if ("number" == typeof a) a += l;else if (d && J.test(a)) {
          for (o = a.replace(J, "|").split("|"), n = 0; n < o.length; n++) {
            o[n] = e(o[n]);
          }

          return o.join(",");
        }
        if (b = (a.match(ra) || [f])[0], m = a.split(b).join("").match(u) || [], n = m.length, k > n--) for (; ++n < k;) {
          m[n] = c ? m[(n - 1) / 2 | 0] : g[n];
        }
        return h + m.join(j) + j + b + i + (-1 !== a.indexOf("inset") ? " inset" : "");
      } : function (a) {
        var b, f, m;
        if ("number" == typeof a) a += l;else if (d && J.test(a)) {
          for (f = a.replace(J, "|").split("|"), m = 0; m < f.length; m++) {
            f[m] = e(f[m]);
          }

          return f.join(",");
        }
        if (b = a.match("," === j ? u : v) || [], m = b.length, k > m--) for (; ++m < k;) {
          b[m] = c ? b[(m - 1) / 2 | 0] : g[m];
        }
        return (h && "none" !== a ? a.substr(0, a.indexOf(b[0])) || h : h) + b.join(j) + i;
      } : function (a) {
        return a;
      };
    },
        ta = function ta(a) {
      return a = a.split(","), function (b, c, d, e, f, g, h) {
        var i,
            j = (c + "").split(" ");

        for (h = {}, i = 0; 4 > i; i++) {
          h[a[i]] = j[i] = j[i] || j[(i - 1) / 2 >> 0];
        }

        return e.parse(b, h, f, g);
      };
    },
        ua = (T._setPluginRatio = function (a) {
      this.plugin.setRatio(a);

      for (var b, c, d, e, f, g = this.data, h = g.proxy, i = g.firstMPT, j = 1e-6; i;) {
        b = h[i.v], i.r ? b = i.r(b) : j > b && b > -j && (b = 0), i.t[i.p] = b, i = i._next;
      }

      if (g.autoRotate && (g.autoRotate.rotation = g.mod ? g.mod.call(this._tween, h.rotation, this.t, this._tween) : h.rotation), 1 === a || 0 === a) for (i = g.firstMPT, f = 1 === a ? "e" : "b"; i;) {
        if (c = i.t, c.type) {
          if (1 === c.type) {
            for (e = c.xs0 + c.s + c.xs1, d = 1; d < c.l; d++) {
              e += c["xn" + d] + c["xs" + (d + 1)];
            }

            c[f] = e;
          }
        } else c[f] = c.s + c.xs0;

        i = i._next;
      }
    }, function (a, b, c, d, e) {
      this.t = a, this.p = b, this.v = c, this.r = e, d && (d._prev = this, this._next = d);
    }),
        va = (T._parseToProxy = function (a, b, c, d, e, f) {
      var g,
          h,
          i,
          j,
          k,
          l = d,
          m = {},
          n = {},
          o = c._transform,
          p = N;

      for (c._transform = null, N = b, d = k = c.parse(a, b, d, e), N = p, f && (c._transform = o, l && (l._prev = null, l._prev && (l._prev._next = null))); d && d !== l;) {
        if (d.type <= 1 && (h = d.p, n[h] = d.s + d.c, m[h] = d.s, f || (j = new ua(d, "s", h, j, d.r), d.c = 0), 1 === d.type)) for (g = d.l; --g > 0;) {
          i = "xn" + g, h = d.p + "_" + i, n[h] = d.data[i], m[h] = d[i], f || (j = new ua(d, i, h, j, d.rxp[i]));
        }
        d = d._next;
      }

      return {
        proxy: m,
        end: n,
        firstMPT: j,
        pt: k
      };
    }, T.CSSPropTween = function (a, b, d, e, g, h, i, j, k, l, m) {
      this.t = a, this.p = b, this.s = d, this.c = e, this.n = i || b, a instanceof va || f.push(this.n), this.r = j ? "function" == typeof j ? j : Math.round : j, this.type = h || 0, k && (this.pr = k, c = !0), this.b = void 0 === l ? d : l, this.e = void 0 === m ? d + e : m, g && (this._next = g, g._prev = this);
    }),
        wa = function wa(a, b, c, d, e, f) {
      var g = new va(a, b, c, d - c, e, -1, f);
      return g.b = c, g.e = g.xs0 = d, g;
    },
        xa = g.parseComplex = function (a, b, c, d, e, f, h, i, j, l) {
      c = c || f || "", "function" == typeof d && (d = d(r, q)), h = new va(a, b, 0, 0, h, l ? 2 : 1, null, !1, i, c, d), d += "", e && ra.test(d + c) && (d = [c, d], g.colorStringFilter(d), c = d[0], d = d[1]);
      var m,
          n,
          o,
          p,
          u,
          v,
          w,
          x,
          y,
          z,
          A,
          B,
          C,
          D = c.split(", ").join(",").split(" "),
          E = d.split(", ").join(",").split(" "),
          F = D.length,
          G = k !== !1;

      for ((-1 !== d.indexOf(",") || -1 !== c.indexOf(",")) && (-1 !== (d + c).indexOf("rgb") || -1 !== (d + c).indexOf("hsl") ? (D = D.join(" ").replace(J, ", ").split(" "), E = E.join(" ").replace(J, ", ").split(" ")) : (D = D.join(" ").split(",").join(", ").split(" "), E = E.join(" ").split(",").join(", ").split(" ")), F = D.length), F !== E.length && (D = (f || "").split(" "), F = D.length), h.plugin = j, h.setRatio = l, ra.lastIndex = 0, m = 0; F > m; m++) {
        if (p = D[m], u = E[m] + "", x = parseFloat(p), x || 0 === x) h.appendXtra("", x, ka(u, x), u.replace(t, ""), G && -1 !== u.indexOf("px") ? Math.round : !1, !0);else if (e && ra.test(p)) B = u.indexOf(")") + 1, B = ")" + (B ? u.substr(B) : ""), C = -1 !== u.indexOf("hsl") && V, z = u, p = pa(p, C), u = pa(u, C), y = p.length + u.length > 6, y && !V && 0 === u[3] ? (h["xs" + h.l] += h.l ? " transparent" : "transparent", h.e = h.e.split(E[m]).join("transparent")) : (V || (y = !1), C ? h.appendXtra(z.substr(0, z.indexOf("hsl")) + (y ? "hsla(" : "hsl("), p[0], ka(u[0], p[0]), ",", !1, !0).appendXtra("", p[1], ka(u[1], p[1]), "%,", !1).appendXtra("", p[2], ka(u[2], p[2]), y ? "%," : "%" + B, !1) : h.appendXtra(z.substr(0, z.indexOf("rgb")) + (y ? "rgba(" : "rgb("), p[0], u[0] - p[0], ",", Math.round, !0).appendXtra("", p[1], u[1] - p[1], ",", Math.round).appendXtra("", p[2], u[2] - p[2], y ? "," : B, Math.round), y && (p = p.length < 4 ? 1 : p[3], h.appendXtra("", p, (u.length < 4 ? 1 : u[3]) - p, B, !1))), ra.lastIndex = 0;else if (v = p.match(s)) {
          if (w = u.match(t), !w || w.length !== v.length) return h;

          for (o = 0, n = 0; n < v.length; n++) {
            A = v[n], z = p.indexOf(A, o), h.appendXtra(p.substr(o, z - o), Number(A), ka(w[n], A), "", G && "px" === p.substr(z + A.length, 2) ? Math.round : !1, 0 === n), o = z + A.length;
          }

          h["xs" + h.l] += p.substr(o);
        } else h["xs" + h.l] += h.l || h["xs" + h.l] ? " " + u : u;
      }

      if (-1 !== d.indexOf("=") && h.data) {
        for (B = h.xs0 + h.data.s, m = 1; m < h.l; m++) {
          B += h["xs" + m] + h.data["xn" + m];
        }

        h.e = B + h["xs" + m];
      }

      return h.l || (h.type = -1, h.xs0 = h.e), h.xfirst || h;
    },
        ya = 9;

    for (j = va.prototype, j.l = j.pr = 0; --ya > 0;) {
      j["xn" + ya] = 0, j["xs" + ya] = "";
    }

    j.xs0 = "", j._next = j._prev = j.xfirst = j.data = j.plugin = j.setRatio = j.rxp = null, j.appendXtra = function (a, b, c, d, e, f) {
      var g = this,
          h = g.l;
      return g["xs" + h] += f && (h || g["xs" + h]) ? " " + a : a || "", c || 0 === h || g.plugin ? (g.l++, g.type = g.setRatio ? 2 : 1, g["xs" + g.l] = d || "", h > 0 ? (g.data["xn" + h] = b + c, g.rxp["xn" + h] = e, g["xn" + h] = b, g.plugin || (g.xfirst = new va(g, "xn" + h, b, c, g.xfirst || g, 0, g.n, e, g.pr), g.xfirst.xs0 = 0), g) : (g.data = {
        s: b + c
      }, g.rxp = {}, g.s = b, g.c = c, g.r = e, g)) : (g["xs" + h] += b + (d || ""), g);
    };

    var za = function za(a, b) {
      b = b || {}, this.p = b.prefix ? $(a) || a : a, i[a] = i[this.p] = this, this.format = b.formatter || sa(b.defaultValue, b.color, b.collapsible, b.multi), b.parser && (this.parse = b.parser), this.clrs = b.color, this.multi = b.multi, this.keyword = b.keyword, this.dflt = b.defaultValue, this.allowFunc = b.allowFunc, this.pr = b.priority || 0;
    },
        Aa = T._registerComplexSpecialProp = function (a, b, c) {
      "object" != _typeof(b) && (b = {
        parser: c
      });
      var d,
          e,
          f = a.split(","),
          g = b.defaultValue;

      for (c = c || [g], d = 0; d < f.length; d++) {
        b.prefix = 0 === d && b.prefix, b.defaultValue = c[d] || g, e = new za(f[d], b);
      }
    },
        Ba = T._registerPluginProp = function (a) {
      if (!i[a]) {
        var b = a.charAt(0).toUpperCase() + a.substr(1) + "Plugin";
        Aa(a, {
          parser: function parser(a, c, d, e, f, g, j) {
            var k = h.com.greensock.plugins[b];
            return k ? (k._cssRegister(), i[d].parse(a, c, d, e, f, g, j)) : (X("Error: " + b + " js file not loaded."), f);
          }
        });
      }
    };

    j = za.prototype, j.parseComplex = function (a, b, c, d, e, f) {
      var g,
          h,
          i,
          j,
          k,
          l,
          m = this.keyword;

      if (this.multi && (J.test(c) || J.test(b) ? (h = b.replace(J, "|").split("|"), i = c.replace(J, "|").split("|")) : m && (h = [b], i = [c])), i) {
        for (j = i.length > h.length ? i.length : h.length, g = 0; j > g; g++) {
          b = h[g] = h[g] || this.dflt, c = i[g] = i[g] || this.dflt, m && (k = b.indexOf(m), l = c.indexOf(m), k !== l && (-1 === l ? h[g] = h[g].split(m).join("") : -1 === k && (h[g] += " " + m)));
        }

        b = h.join(", "), c = i.join(", ");
      }

      return xa(a, this.p, b, c, this.clrs, this.dflt, d, this.pr, e, f);
    }, j.parse = function (a, b, c, d, f, g, h) {
      return this.parseComplex(a.style, this.format(ba(a, this.p, e, !1, this.dflt)), this.format(b), f, g);
    }, g.registerSpecialProp = function (a, b, c) {
      Aa(a, {
        parser: function parser(a, d, e, f, g, h, i) {
          var j = new va(a, e, 0, 0, g, 2, e, !1, c);
          return j.plugin = h, j.setRatio = b(a, d, f._tween, e), j;
        },
        priority: c
      });
    }, g.useSVGTransformAttr = !0;

    var Ca,
        Da = "scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),
        Ea = $("transform"),
        Fa = Y + "transform",
        Ga = $("transformOrigin"),
        Ha = null !== $("perspective"),
        Ia = T.Transform = function () {
      this.perspective = parseFloat(g.defaultTransformPerspective) || 0, this.force3D = g.defaultForce3D !== !1 && Ha ? g.defaultForce3D || "auto" : !1;
    },
        Ja = _gsScope.SVGElement,
        Ka = function Ka(a, b, c) {
      var d,
          e = P.createElementNS("http://www.w3.org/2000/svg", a),
          f = /([a-z])([A-Z])/g;

      for (d in c) {
        e.setAttributeNS(null, d.replace(f, "$1-$2").toLowerCase(), c[d]);
      }

      return b.appendChild(e), e;
    },
        La = P.documentElement || {},
        Ma = function () {
      var a,
          b,
          c,
          d = p || /Android/i.test(U) && !_gsScope.chrome;
      return P.createElementNS && La.appendChild && !d && (a = Ka("svg", La), b = Ka("rect", a, {
        width: 100,
        height: 50,
        x: 100
      }), c = b.getBoundingClientRect().width, b.style[Ga] = "50% 50%", b.style[Ea] = "scaleX(0.5)", d = c === b.getBoundingClientRect().width && !(n && Ha), La.removeChild(a)), d;
    }(),
        Na = function Na(a, b, c, d, e, f) {
      var h,
          i,
          j,
          k,
          l,
          m,
          n,
          o,
          p,
          q,
          r,
          s,
          t,
          u,
          v = a._gsTransform,
          w = Sa(a, !0);
      v && (t = v.xOrigin, u = v.yOrigin), (!d || (h = d.split(" ")).length < 2) && (n = a.getBBox(), 0 === n.x && 0 === n.y && n.width + n.height === 0 && (n = {
        x: parseFloat(a.hasAttribute("x") ? a.getAttribute("x") : a.hasAttribute("cx") ? a.getAttribute("cx") : 0) || 0,
        y: parseFloat(a.hasAttribute("y") ? a.getAttribute("y") : a.hasAttribute("cy") ? a.getAttribute("cy") : 0) || 0,
        width: 0,
        height: 0
      }), b = ja(b).split(" "), h = [(-1 !== b[0].indexOf("%") ? parseFloat(b[0]) / 100 * n.width : parseFloat(b[0])) + n.x, (-1 !== b[1].indexOf("%") ? parseFloat(b[1]) / 100 * n.height : parseFloat(b[1])) + n.y]), c.xOrigin = k = parseFloat(h[0]), c.yOrigin = l = parseFloat(h[1]), d && w !== Ra && (m = w[0], n = w[1], o = w[2], p = w[3], q = w[4], r = w[5], s = m * p - n * o, s && (i = k * (p / s) + l * (-o / s) + (o * r - p * q) / s, j = k * (-n / s) + l * (m / s) - (m * r - n * q) / s, k = c.xOrigin = h[0] = i, l = c.yOrigin = h[1] = j)), v && (f && (c.xOffset = v.xOffset, c.yOffset = v.yOffset, v = c), e || e !== !1 && g.defaultSmoothOrigin !== !1 ? (i = k - t, j = l - u, v.xOffset += i * w[0] + j * w[2] - i, v.yOffset += i * w[1] + j * w[3] - j) : v.xOffset = v.yOffset = 0), f || a.setAttribute("data-svg-origin", h.join(" "));
    },
        Oa = function Oa(a) {
      var b,
          c = Q("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
          d = this.parentNode,
          e = this.nextSibling,
          f = this.style.cssText;
      if (La.appendChild(c), c.appendChild(this), this.style.display = "block", a) try {
        b = this.getBBox(), this._originalGetBBox = this.getBBox, this.getBBox = Oa;
      } catch (g) {} else this._originalGetBBox && (b = this._originalGetBBox());
      return e ? d.insertBefore(this, e) : d.appendChild(this), La.removeChild(c), this.style.cssText = f, b;
    },
        Pa = function Pa(a) {
      try {
        return a.getBBox();
      } catch (b) {
        return Oa.call(a, !0);
      }
    },
        Qa = function Qa(a) {
      return !(!Ja || !a.getCTM || a.parentNode && !a.ownerSVGElement || !Pa(a));
    },
        Ra = [1, 0, 0, 1, 0, 0],
        Sa = function Sa(a, b) {
      var c,
          d,
          e,
          f,
          g,
          h,
          i,
          j = a._gsTransform || new Ia(),
          k = 1e5,
          l = a.style;
      if (Ea ? d = ba(a, Fa, null, !0) : a.currentStyle && (d = a.currentStyle.filter.match(H), d = d && 4 === d.length ? [d[0].substr(4), Number(d[2].substr(4)), Number(d[1].substr(4)), d[3].substr(4), j.x || 0, j.y || 0].join(",") : ""), c = !d || "none" === d || "matrix(1, 0, 0, 1, 0, 0)" === d, Ea && c && !a.offsetParent && a !== La && (f = l.display, l.display = "block", i = a.parentNode, i && a.offsetParent || (g = 1, h = a.nextSibling, La.appendChild(a)), d = ba(a, Fa, null, !0), c = !d || "none" === d || "matrix(1, 0, 0, 1, 0, 0)" === d, f ? l.display = f : Xa(l, "display"), g && (h ? i.insertBefore(a, h) : i ? i.appendChild(a) : La.removeChild(a))), (j.svg || a.getCTM && Qa(a)) && (c && -1 !== (l[Ea] + "").indexOf("matrix") && (d = l[Ea], c = 0), e = a.getAttribute("transform"), c && e && (e = a.transform.baseVal.consolidate().matrix, d = "matrix(" + e.a + "," + e.b + "," + e.c + "," + e.d + "," + e.e + "," + e.f + ")", c = 0)), c) return Ra;

      for (e = (d || "").match(s) || [], ya = e.length; --ya > -1;) {
        f = Number(e[ya]), e[ya] = (g = f - (f |= 0)) ? (g * k + (0 > g ? -.5 : .5) | 0) / k + f : f;
      }

      return b && e.length > 6 ? [e[0], e[1], e[4], e[5], e[12], e[13]] : e;
    },
        Ta = T.getTransform = function (a, c, d, e) {
      if (a._gsTransform && d && !e) return a._gsTransform;
      var f,
          h,
          i,
          j,
          k,
          l,
          m = d ? a._gsTransform || new Ia() : new Ia(),
          n = m.scaleX < 0,
          o = 2e-5,
          p = 1e5,
          q = Ha ? parseFloat(ba(a, Ga, c, !1, "0 0 0").split(" ")[2]) || m.zOrigin || 0 : 0,
          r = parseFloat(g.defaultTransformPerspective) || 0;

      if (m.svg = !(!a.getCTM || !Qa(a)), m.svg && (Na(a, ba(a, Ga, c, !1, "50% 50%") + "", m, a.getAttribute("data-svg-origin")), Ca = g.useSVGTransformAttr || Ma), f = Sa(a), f !== Ra) {
        if (16 === f.length) {
          var s,
              t,
              u,
              v,
              w,
              x = f[0],
              y = f[1],
              z = f[2],
              A = f[3],
              B = f[4],
              C = f[5],
              D = f[6],
              E = f[7],
              F = f[8],
              G = f[9],
              H = f[10],
              I = f[12],
              J = f[13],
              K = f[14],
              L = f[11],
              N = Math.atan2(D, H);
          m.zOrigin && (K = -m.zOrigin, I = F * K - f[12], J = G * K - f[13], K = H * K + m.zOrigin - f[14]), m.rotationX = N * M, N && (v = Math.cos(-N), w = Math.sin(-N), s = B * v + F * w, t = C * v + G * w, u = D * v + H * w, F = B * -w + F * v, G = C * -w + G * v, H = D * -w + H * v, L = E * -w + L * v, B = s, C = t, D = u), N = Math.atan2(-z, H), m.rotationY = N * M, N && (v = Math.cos(-N), w = Math.sin(-N), s = x * v - F * w, t = y * v - G * w, u = z * v - H * w, G = y * w + G * v, H = z * w + H * v, L = A * w + L * v, x = s, y = t, z = u), N = Math.atan2(y, x), m.rotation = N * M, N && (v = Math.cos(N), w = Math.sin(N), s = x * v + y * w, t = B * v + C * w, u = F * v + G * w, y = y * v - x * w, C = C * v - B * w, G = G * v - F * w, x = s, B = t, F = u), m.rotationX && Math.abs(m.rotationX) + Math.abs(m.rotation) > 359.9 && (m.rotationX = m.rotation = 0, m.rotationY = 180 - m.rotationY), N = Math.atan2(B, C), m.scaleX = (Math.sqrt(x * x + y * y + z * z) * p + .5 | 0) / p, m.scaleY = (Math.sqrt(C * C + D * D) * p + .5 | 0) / p, m.scaleZ = (Math.sqrt(F * F + G * G + H * H) * p + .5 | 0) / p, x /= m.scaleX, B /= m.scaleY, y /= m.scaleX, C /= m.scaleY, Math.abs(N) > o ? (m.skewX = N * M, B = 0, "simple" !== m.skewType && (m.scaleY *= 1 / Math.cos(N))) : m.skewX = 0, m.perspective = L ? 1 / (0 > L ? -L : L) : 0, m.x = I, m.y = J, m.z = K, m.svg && (m.x -= m.xOrigin - (m.xOrigin * x - m.yOrigin * B), m.y -= m.yOrigin - (m.yOrigin * y - m.xOrigin * C));
        } else if (!Ha || e || !f.length || m.x !== f[4] || m.y !== f[5] || !m.rotationX && !m.rotationY) {
          var O = f.length >= 6,
              P = O ? f[0] : 1,
              Q = f[1] || 0,
              R = f[2] || 0,
              S = O ? f[3] : 1;
          m.x = f[4] || 0, m.y = f[5] || 0, i = Math.sqrt(P * P + Q * Q), j = Math.sqrt(S * S + R * R), k = P || Q ? Math.atan2(Q, P) * M : m.rotation || 0, l = R || S ? Math.atan2(R, S) * M + k : m.skewX || 0, m.scaleX = i, m.scaleY = j, m.rotation = k, m.skewX = l, Ha && (m.rotationX = m.rotationY = m.z = 0, m.perspective = r, m.scaleZ = 1), m.svg && (m.x -= m.xOrigin - (m.xOrigin * P + m.yOrigin * R), m.y -= m.yOrigin - (m.xOrigin * Q + m.yOrigin * S));
        }

        Math.abs(m.skewX) > 90 && Math.abs(m.skewX) < 270 && (n ? (m.scaleX *= -1, m.skewX += m.rotation <= 0 ? 180 : -180, m.rotation += m.rotation <= 0 ? 180 : -180) : (m.scaleY *= -1, m.skewX += m.skewX <= 0 ? 180 : -180)), m.zOrigin = q;

        for (h in m) {
          m[h] < o && m[h] > -o && (m[h] = 0);
        }
      }

      return d && (a._gsTransform = m, m.svg && (Ca && a.style[Ea] ? b.delayedCall(.001, function () {
        Xa(a.style, Ea);
      }) : !Ca && a.getAttribute("transform") && b.delayedCall(.001, function () {
        a.removeAttribute("transform");
      }))), m;
    },
        Ua = function Ua(a) {
      var b,
          c,
          d = this.data,
          e = -d.rotation * L,
          f = e + d.skewX * L,
          g = 1e5,
          h = (Math.cos(e) * d.scaleX * g | 0) / g,
          i = (Math.sin(e) * d.scaleX * g | 0) / g,
          j = (Math.sin(f) * -d.scaleY * g | 0) / g,
          k = (Math.cos(f) * d.scaleY * g | 0) / g,
          l = this.t.style,
          m = this.t.currentStyle;

      if (m) {
        c = i, i = -j, j = -c, b = m.filter, l.filter = "";
        var n,
            o,
            q = this.t.offsetWidth,
            r = this.t.offsetHeight,
            s = "absolute" !== m.position,
            t = "progid:DXImageTransform.Microsoft.Matrix(M11=" + h + ", M12=" + i + ", M21=" + j + ", M22=" + k,
            u = d.x + q * d.xPercent / 100,
            v = d.y + r * d.yPercent / 100;

        if (null != d.ox && (n = (d.oxp ? q * d.ox * .01 : d.ox) - q / 2, o = (d.oyp ? r * d.oy * .01 : d.oy) - r / 2, u += n - (n * h + o * i), v += o - (n * j + o * k)), s ? (n = q / 2, o = r / 2, t += ", Dx=" + (n - (n * h + o * i) + u) + ", Dy=" + (o - (n * j + o * k) + v) + ")") : t += ", sizingMethod='auto expand')", -1 !== b.indexOf("DXImageTransform.Microsoft.Matrix(") ? l.filter = b.replace(I, t) : l.filter = t + " " + b, (0 === a || 1 === a) && 1 === h && 0 === i && 0 === j && 1 === k && (s && -1 === t.indexOf("Dx=0, Dy=0") || y.test(b) && 100 !== parseFloat(RegExp.$1) || -1 === b.indexOf(b.indexOf("Alpha")) && l.removeAttribute("filter")), !s) {
          var w,
              z,
              A,
              B = 8 > p ? 1 : -1;

          for (n = d.ieOffsetX || 0, o = d.ieOffsetY || 0, d.ieOffsetX = Math.round((q - ((0 > h ? -h : h) * q + (0 > i ? -i : i) * r)) / 2 + u), d.ieOffsetY = Math.round((r - ((0 > k ? -k : k) * r + (0 > j ? -j : j) * q)) / 2 + v), ya = 0; 4 > ya; ya++) {
            z = ha[ya], w = m[z], c = -1 !== w.indexOf("px") ? parseFloat(w) : ca(this.t, z, parseFloat(w), w.replace(x, "")) || 0, A = c !== d[z] ? 2 > ya ? -d.ieOffsetX : -d.ieOffsetY : 2 > ya ? n - d.ieOffsetX : o - d.ieOffsetY, l[z] = (d[z] = Math.round(c - A * (0 === ya || 2 === ya ? 1 : B))) + "px";
          }
        }
      }
    },
        Va = T.set3DTransformRatio = T.setTransformRatio = function (a) {
      var b,
          c,
          d,
          e,
          f,
          g,
          h,
          i,
          j,
          k,
          l,
          m,
          o,
          p,
          q,
          r,
          s,
          t,
          u,
          v,
          w,
          x,
          y,
          z = this.data,
          A = this.t.style,
          B = z.rotation,
          C = z.rotationX,
          D = z.rotationY,
          E = z.scaleX,
          F = z.scaleY,
          G = z.scaleZ,
          H = z.x,
          I = z.y,
          J = z.z,
          K = z.svg,
          M = z.perspective,
          N = z.force3D,
          O = z.skewY,
          P = z.skewX;
      if (O && (P += O, B += O), ((1 === a || 0 === a) && "auto" === N && (this.tween._totalTime === this.tween._totalDuration || !this.tween._totalTime) || !N) && !J && !M && !D && !C && 1 === G || Ca && K || !Ha) return void (B || P || K ? (B *= L, x = P * L, y = 1e5, c = Math.cos(B) * E, f = Math.sin(B) * E, d = Math.sin(B - x) * -F, g = Math.cos(B - x) * F, x && "simple" === z.skewType && (b = Math.tan(x - O * L), b = Math.sqrt(1 + b * b), d *= b, g *= b, O && (b = Math.tan(O * L), b = Math.sqrt(1 + b * b), c *= b, f *= b)), K && (H += z.xOrigin - (z.xOrigin * c + z.yOrigin * d) + z.xOffset, I += z.yOrigin - (z.xOrigin * f + z.yOrigin * g) + z.yOffset, Ca && (z.xPercent || z.yPercent) && (q = this.t.getBBox(), H += .01 * z.xPercent * q.width, I += .01 * z.yPercent * q.height), q = 1e-6, q > H && H > -q && (H = 0), q > I && I > -q && (I = 0)), u = (c * y | 0) / y + "," + (f * y | 0) / y + "," + (d * y | 0) / y + "," + (g * y | 0) / y + "," + H + "," + I + ")", K && Ca ? this.t.setAttribute("transform", "matrix(" + u) : A[Ea] = (z.xPercent || z.yPercent ? "translate(" + z.xPercent + "%," + z.yPercent + "%) matrix(" : "matrix(") + u) : A[Ea] = (z.xPercent || z.yPercent ? "translate(" + z.xPercent + "%," + z.yPercent + "%) matrix(" : "matrix(") + E + ",0,0," + F + "," + H + "," + I + ")");
      if (n && (q = 1e-4, q > E && E > -q && (E = G = 2e-5), q > F && F > -q && (F = G = 2e-5), !M || z.z || z.rotationX || z.rotationY || (M = 0)), B || P) B *= L, r = c = Math.cos(B), s = f = Math.sin(B), P && (B -= P * L, r = Math.cos(B), s = Math.sin(B), "simple" === z.skewType && (b = Math.tan((P - O) * L), b = Math.sqrt(1 + b * b), r *= b, s *= b, z.skewY && (b = Math.tan(O * L), b = Math.sqrt(1 + b * b), c *= b, f *= b))), d = -s, g = r;else {
        if (!(D || C || 1 !== G || M || K)) return void (A[Ea] = (z.xPercent || z.yPercent ? "translate(" + z.xPercent + "%," + z.yPercent + "%) translate3d(" : "translate3d(") + H + "px," + I + "px," + J + "px)" + (1 !== E || 1 !== F ? " scale(" + E + "," + F + ")" : ""));
        c = g = 1, d = f = 0;
      }
      k = 1, e = h = i = j = l = m = 0, o = M ? -1 / M : 0, p = z.zOrigin, q = 1e-6, v = ",", w = "0", B = D * L, B && (r = Math.cos(B), s = Math.sin(B), i = -s, l = o * -s, e = c * s, h = f * s, k = r, o *= r, c *= r, f *= r), B = C * L, B && (r = Math.cos(B), s = Math.sin(B), b = d * r + e * s, t = g * r + h * s, j = k * s, m = o * s, e = d * -s + e * r, h = g * -s + h * r, k *= r, o *= r, d = b, g = t), 1 !== G && (e *= G, h *= G, k *= G, o *= G), 1 !== F && (d *= F, g *= F, j *= F, m *= F), 1 !== E && (c *= E, f *= E, i *= E, l *= E), (p || K) && (p && (H += e * -p, I += h * -p, J += k * -p + p), K && (H += z.xOrigin - (z.xOrigin * c + z.yOrigin * d) + z.xOffset, I += z.yOrigin - (z.xOrigin * f + z.yOrigin * g) + z.yOffset), q > H && H > -q && (H = w), q > I && I > -q && (I = w), q > J && J > -q && (J = 0)), u = z.xPercent || z.yPercent ? "translate(" + z.xPercent + "%," + z.yPercent + "%) matrix3d(" : "matrix3d(", u += (q > c && c > -q ? w : c) + v + (q > f && f > -q ? w : f) + v + (q > i && i > -q ? w : i), u += v + (q > l && l > -q ? w : l) + v + (q > d && d > -q ? w : d) + v + (q > g && g > -q ? w : g), C || D || 1 !== G ? (u += v + (q > j && j > -q ? w : j) + v + (q > m && m > -q ? w : m) + v + (q > e && e > -q ? w : e), u += v + (q > h && h > -q ? w : h) + v + (q > k && k > -q ? w : k) + v + (q > o && o > -q ? w : o) + v) : u += ",0,0,0,0,1,0,", u += H + v + I + v + J + v + (M ? 1 + -J / M : 1) + ")", A[Ea] = u;
    };

    j = Ia.prototype, j.x = j.y = j.z = j.skewX = j.skewY = j.rotation = j.rotationX = j.rotationY = j.zOrigin = j.xPercent = j.yPercent = j.xOffset = j.yOffset = 0, j.scaleX = j.scaleY = j.scaleZ = 1, Aa("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin", {
      parser: function parser(a, b, c, d, f, h, i) {
        if (d._lastParsedTransform === i) return f;
        d._lastParsedTransform = i;
        var j = i.scale && "function" == typeof i.scale ? i.scale : 0;
        j && (i.scale = j(r, a));
        var k,
            l,
            m,
            n,
            o,
            p,
            s,
            t,
            u,
            v = a._gsTransform,
            w = a.style,
            x = 1e-6,
            y = Da.length,
            z = i,
            A = {},
            B = "transformOrigin",
            C = Ta(a, e, !0, z.parseTransform),
            D = z.transform && ("function" == typeof z.transform ? z.transform(r, q) : z.transform);
        if (C.skewType = z.skewType || C.skewType || g.defaultSkewType, d._transform = C, "rotationZ" in z && (z.rotation = z.rotationZ), D && "string" == typeof D && Ea) l = R.style, l[Ea] = D, l.display = "block", l.position = "absolute", -1 !== D.indexOf("%") && (l.width = ba(a, "width"), l.height = ba(a, "height")), P.body.appendChild(R), k = Ta(R, null, !1), "simple" === C.skewType && (k.scaleY *= Math.cos(k.skewX * L)), C.svg && (p = C.xOrigin, s = C.yOrigin, k.x -= C.xOffset, k.y -= C.yOffset, (z.transformOrigin || z.svgOrigin) && (D = {}, Na(a, ja(z.transformOrigin), D, z.svgOrigin, z.smoothOrigin, !0), p = D.xOrigin, s = D.yOrigin, k.x -= D.xOffset - C.xOffset, k.y -= D.yOffset - C.yOffset), (p || s) && (t = Sa(R, !0), k.x -= p - (p * t[0] + s * t[2]), k.y -= s - (p * t[1] + s * t[3]))), P.body.removeChild(R), k.perspective || (k.perspective = C.perspective), null != z.xPercent && (k.xPercent = la(z.xPercent, C.xPercent)), null != z.yPercent && (k.yPercent = la(z.yPercent, C.yPercent));else if ("object" == _typeof(z)) {
          if (k = {
            scaleX: la(null != z.scaleX ? z.scaleX : z.scale, C.scaleX),
            scaleY: la(null != z.scaleY ? z.scaleY : z.scale, C.scaleY),
            scaleZ: la(z.scaleZ, C.scaleZ),
            x: la(z.x, C.x),
            y: la(z.y, C.y),
            z: la(z.z, C.z),
            xPercent: la(z.xPercent, C.xPercent),
            yPercent: la(z.yPercent, C.yPercent),
            perspective: la(z.transformPerspective, C.perspective)
          }, o = z.directionalRotation, null != o) if ("object" == _typeof(o)) for (l in o) {
            z[l] = o[l];
          } else z.rotation = o;
          "string" == typeof z.x && -1 !== z.x.indexOf("%") && (k.x = 0, k.xPercent = la(z.x, C.xPercent)), "string" == typeof z.y && -1 !== z.y.indexOf("%") && (k.y = 0, k.yPercent = la(z.y, C.yPercent)), k.rotation = ma("rotation" in z ? z.rotation : "shortRotation" in z ? z.shortRotation + "_short" : C.rotation, C.rotation, "rotation", A), Ha && (k.rotationX = ma("rotationX" in z ? z.rotationX : "shortRotationX" in z ? z.shortRotationX + "_short" : C.rotationX || 0, C.rotationX, "rotationX", A), k.rotationY = ma("rotationY" in z ? z.rotationY : "shortRotationY" in z ? z.shortRotationY + "_short" : C.rotationY || 0, C.rotationY, "rotationY", A)), k.skewX = ma(z.skewX, C.skewX), k.skewY = ma(z.skewY, C.skewY);
        }

        for (Ha && null != z.force3D && (C.force3D = z.force3D, n = !0), m = C.force3D || C.z || C.rotationX || C.rotationY || k.z || k.rotationX || k.rotationY || k.perspective, m || null == z.scale || (k.scaleZ = 1); --y > -1;) {
          u = Da[y], D = k[u] - C[u], (D > x || -x > D || null != z[u] || null != N[u]) && (n = !0, f = new va(C, u, C[u], D, f), u in A && (f.e = A[u]), f.xs0 = 0, f.plugin = h, d._overwriteProps.push(f.n));
        }

        return D = "function" == typeof z.transformOrigin ? z.transformOrigin(r, q) : z.transformOrigin, C.svg && (D || z.svgOrigin) && (p = C.xOffset, s = C.yOffset, Na(a, ja(D), k, z.svgOrigin, z.smoothOrigin), f = wa(C, "xOrigin", (v ? C : k).xOrigin, k.xOrigin, f, B), f = wa(C, "yOrigin", (v ? C : k).yOrigin, k.yOrigin, f, B), (p !== C.xOffset || s !== C.yOffset) && (f = wa(C, "xOffset", v ? p : C.xOffset, C.xOffset, f, B), f = wa(C, "yOffset", v ? s : C.yOffset, C.yOffset, f, B)), D = "0px 0px"), (D || Ha && m && C.zOrigin) && (Ea ? (n = !0, u = Ga, D || (D = (ba(a, u, e, !1, "50% 50%") + "").split(" "), D = D[0] + " " + D[1] + " " + C.zOrigin + "px"), D += "", f = new va(w, u, 0, 0, f, -1, B), f.b = w[u], f.plugin = h, Ha ? (l = C.zOrigin, D = D.split(" "), C.zOrigin = (D.length > 2 ? parseFloat(D[2]) : l) || 0, f.xs0 = f.e = D[0] + " " + (D[1] || "50%") + " 0px", f = new va(C, "zOrigin", 0, 0, f, -1, f.n), f.b = l, f.xs0 = f.e = C.zOrigin) : f.xs0 = f.e = D) : ja(D + "", C)), n && (d._transformType = C.svg && Ca || !m && 3 !== this._transformType ? 2 : 3), j && (i.scale = j), f;
      },
      allowFunc: !0,
      prefix: !0
    }), Aa("boxShadow", {
      defaultValue: "0px 0px 0px 0px #999",
      prefix: !0,
      color: !0,
      multi: !0,
      keyword: "inset"
    }), Aa("clipPath", {
      defaultValue: "inset(0%)",
      prefix: !0,
      multi: !0,
      formatter: sa("inset(0% 0% 0% 0%)", !1, !0)
    }), Aa("borderRadius", {
      defaultValue: "0px",
      parser: function parser(a, b, c, f, g, h) {
        b = this.format(b);
        var i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            t,
            u,
            v,
            w,
            x,
            y = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"],
            z = a.style;

        for (q = parseFloat(a.offsetWidth), r = parseFloat(a.offsetHeight), i = b.split(" "), j = 0; j < y.length; j++) {
          this.p.indexOf("border") && (y[j] = $(y[j])), m = l = ba(a, y[j], e, !1, "0px"), -1 !== m.indexOf(" ") && (l = m.split(" "), m = l[0], l = l[1]), n = k = i[j], o = parseFloat(m), t = m.substr((o + "").length), u = "=" === n.charAt(1), u ? (p = parseInt(n.charAt(0) + "1", 10), n = n.substr(2), p *= parseFloat(n), s = n.substr((p + "").length - (0 > p ? 1 : 0)) || "") : (p = parseFloat(n), s = n.substr((p + "").length)), "" === s && (s = d[c] || t), s !== t && (v = ca(a, "borderLeft", o, t), w = ca(a, "borderTop", o, t), "%" === s ? (m = v / q * 100 + "%", l = w / r * 100 + "%") : "em" === s ? (x = ca(a, "borderLeft", 1, "em"), m = v / x + "em", l = w / x + "em") : (m = v + "px", l = w + "px"), u && (n = parseFloat(m) + p + s, k = parseFloat(l) + p + s)), g = xa(z, y[j], m + " " + l, n + " " + k, !1, "0px", g);
        }

        return g;
      },
      prefix: !0,
      formatter: sa("0px 0px 0px 0px", !1, !0)
    }), Aa("borderBottomLeftRadius,borderBottomRightRadius,borderTopLeftRadius,borderTopRightRadius", {
      defaultValue: "0px",
      parser: function parser(a, b, c, d, f, g) {
        return xa(a.style, c, this.format(ba(a, c, e, !1, "0px 0px")), this.format(b), !1, "0px", f);
      },
      prefix: !0,
      formatter: sa("0px 0px", !1, !0)
    }), Aa("backgroundPosition", {
      defaultValue: "0 0",
      parser: function parser(a, b, c, d, f, g) {
        var h,
            i,
            j,
            k,
            l,
            m,
            n = "background-position",
            o = e || aa(a, null),
            q = this.format((o ? p ? o.getPropertyValue(n + "-x") + " " + o.getPropertyValue(n + "-y") : o.getPropertyValue(n) : a.currentStyle.backgroundPositionX + " " + a.currentStyle.backgroundPositionY) || "0 0"),
            r = this.format(b);

        if (-1 !== q.indexOf("%") != (-1 !== r.indexOf("%")) && r.split(",").length < 2 && (m = ba(a, "backgroundImage").replace(E, ""), m && "none" !== m)) {
          for (h = q.split(" "), i = r.split(" "), S.setAttribute("src", m), j = 2; --j > -1;) {
            q = h[j], k = -1 !== q.indexOf("%"), k !== (-1 !== i[j].indexOf("%")) && (l = 0 === j ? a.offsetWidth - S.width : a.offsetHeight - S.height, h[j] = k ? parseFloat(q) / 100 * l + "px" : parseFloat(q) / l * 100 + "%");
          }

          q = h.join(" ");
        }

        return this.parseComplex(a.style, q, r, f, g);
      },
      formatter: ja
    }), Aa("backgroundSize", {
      defaultValue: "0 0",
      formatter: function formatter(a) {
        return a += "", "co" === a.substr(0, 2) ? a : ja(-1 === a.indexOf(" ") ? a + " " + a : a);
      }
    }), Aa("perspective", {
      defaultValue: "0px",
      prefix: !0
    }), Aa("perspectiveOrigin", {
      defaultValue: "50% 50%",
      prefix: !0
    }), Aa("transformStyle", {
      prefix: !0
    }), Aa("backfaceVisibility", {
      prefix: !0
    }), Aa("userSelect", {
      prefix: !0
    }), Aa("margin", {
      parser: ta("marginTop,marginRight,marginBottom,marginLeft")
    }), Aa("padding", {
      parser: ta("paddingTop,paddingRight,paddingBottom,paddingLeft")
    }), Aa("clip", {
      defaultValue: "rect(0px,0px,0px,0px)",
      parser: function parser(a, b, c, d, f, g) {
        var h, i, j;
        return 9 > p ? (i = a.currentStyle, j = 8 > p ? " " : ",", h = "rect(" + i.clipTop + j + i.clipRight + j + i.clipBottom + j + i.clipLeft + ")", b = this.format(b).split(",").join(j)) : (h = this.format(ba(a, this.p, e, !1, this.dflt)), b = this.format(b)), this.parseComplex(a.style, h, b, f, g);
      }
    }), Aa("textShadow", {
      defaultValue: "0px 0px 0px #999",
      color: !0,
      multi: !0
    }), Aa("autoRound,strictUnits", {
      parser: function parser(a, b, c, d, e) {
        return e;
      }
    }), Aa("border", {
      defaultValue: "0px solid #000",
      parser: function parser(a, b, c, d, f, g) {
        var h = ba(a, "borderTopWidth", e, !1, "0px"),
            i = this.format(b).split(" "),
            j = i[0].replace(x, "");
        return "px" !== j && (h = parseFloat(h) / ca(a, "borderTopWidth", 1, j) + j), this.parseComplex(a.style, this.format(h + " " + ba(a, "borderTopStyle", e, !1, "solid") + " " + ba(a, "borderTopColor", e, !1, "#000")), i.join(" "), f, g);
      },
      color: !0,
      formatter: function formatter(a) {
        var b = a.split(" ");
        return b[0] + " " + (b[1] || "solid") + " " + (a.match(ra) || ["#000"])[0];
      }
    }), Aa("borderWidth", {
      parser: ta("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")
    }), Aa("float,cssFloat,styleFloat", {
      parser: function parser(a, b, c, d, e, f) {
        var g = a.style,
            h = "cssFloat" in g ? "cssFloat" : "styleFloat";
        return new va(g, h, 0, 0, e, -1, c, !1, 0, g[h], b);
      }
    });

    var Wa = function Wa(a) {
      var b,
          c = this.t,
          d = c.filter || ba(this.data, "filter") || "",
          e = this.s + this.c * a | 0;
      100 === e && (-1 === d.indexOf("atrix(") && -1 === d.indexOf("radient(") && -1 === d.indexOf("oader(") ? (c.removeAttribute("filter"), b = !ba(this.data, "filter")) : (c.filter = d.replace(A, ""), b = !0)), b || (this.xn1 && (c.filter = d = d || "alpha(opacity=" + e + ")"), -1 === d.indexOf("pacity") ? 0 === e && this.xn1 || (c.filter = d + " alpha(opacity=" + e + ")") : c.filter = d.replace(y, "opacity=" + e));
    };

    Aa("opacity,alpha,autoAlpha", {
      defaultValue: "1",
      parser: function parser(a, b, c, d, f, g) {
        var h = parseFloat(ba(a, "opacity", e, !1, "1")),
            i = a.style,
            j = "autoAlpha" === c;
        return "string" == typeof b && "=" === b.charAt(1) && (b = ("-" === b.charAt(0) ? -1 : 1) * parseFloat(b.substr(2)) + h), j && 1 === h && "hidden" === ba(a, "visibility", e) && 0 !== b && (h = 0), V ? f = new va(i, "opacity", h, b - h, f) : (f = new va(i, "opacity", 100 * h, 100 * (b - h), f), f.xn1 = j ? 1 : 0, i.zoom = 1, f.type = 2, f.b = "alpha(opacity=" + f.s + ")", f.e = "alpha(opacity=" + (f.s + f.c) + ")", f.data = a, f.plugin = g, f.setRatio = Wa), j && (f = new va(i, "visibility", 0, 0, f, -1, null, !1, 0, 0 !== h ? "inherit" : "hidden", 0 === b ? "hidden" : "inherit"), f.xs0 = "inherit", d._overwriteProps.push(f.n), d._overwriteProps.push(c)), f;
      }
    });

    var Xa = function Xa(a, b) {
      b && (a.removeProperty ? (("ms" === b.substr(0, 2) || "webkit" === b.substr(0, 6)) && (b = "-" + b), a.removeProperty(b.replace(C, "-$1").toLowerCase())) : a.removeAttribute(b));
    },
        Ya = function Ya(a) {
      if (this.t._gsClassPT = this, 1 === a || 0 === a) {
        this.t.setAttribute("class", 0 === a ? this.b : this.e);

        for (var b = this.data, c = this.t.style; b;) {
          b.v ? c[b.p] = b.v : Xa(c, b.p), b = b._next;
        }

        1 === a && this.t._gsClassPT === this && (this.t._gsClassPT = null);
      } else this.t.getAttribute("class") !== this.e && this.t.setAttribute("class", this.e);
    };

    Aa("className", {
      parser: function parser(a, b, d, f, g, h, i) {
        var j,
            k,
            l,
            m,
            n,
            o = a.getAttribute("class") || "",
            p = a.style.cssText;

        if (g = f._classNamePT = new va(a, d, 0, 0, g, 2), g.setRatio = Ya, g.pr = -11, c = !0, g.b = o, k = ea(a, e), l = a._gsClassPT) {
          for (m = {}, n = l.data; n;) {
            m[n.p] = 1, n = n._next;
          }

          l.setRatio(1);
        }

        return a._gsClassPT = g, g.e = "=" !== b.charAt(1) ? b : o.replace(new RegExp("(?:\\s|^)" + b.substr(2) + "(?![\\w-])"), "") + ("+" === b.charAt(0) ? " " + b.substr(2) : ""), a.setAttribute("class", g.e), j = fa(a, k, ea(a), i, m), a.setAttribute("class", o), g.data = j.firstMPT, a.style.cssText !== p && (a.style.cssText = p), g = g.xfirst = f.parse(a, j.difs, g, h);
      }
    });

    var Za = function Za(a) {
      if ((1 === a || 0 === a) && this.data._totalTime === this.data._totalDuration && "isFromStart" !== this.data.data) {
        var b,
            c,
            d,
            e,
            f,
            g = this.t.style,
            h = i.transform.parse;
        if ("all" === this.e) g.cssText = "", e = !0;else for (b = this.e.split(" ").join("").split(","), d = b.length; --d > -1;) {
          c = b[d], i[c] && (i[c].parse === h ? e = !0 : c = "transformOrigin" === c ? Ga : i[c].p), Xa(g, c);
        }
        e && (Xa(g, Ea), f = this.t._gsTransform, f && (f.svg && (this.t.removeAttribute("data-svg-origin"), this.t.removeAttribute("transform")), delete this.t._gsTransform));
      }
    };

    for (Aa("clearProps", {
      parser: function parser(a, b, d, e, f) {
        return f = new va(a, d, 0, 0, f, 2), f.setRatio = Za, f.e = b, f.pr = -10, f.data = e._tween, c = !0, f;
      }
    }), j = "bezier,throwProps,physicsProps,physics2D".split(","), ya = j.length; ya--;) {
      Ba(j[ya]);
    }

    j = g.prototype, j._firstPT = j._lastParsedTransform = j._transform = null, j._onInitTween = function (a, b, h, j) {
      if (!a.nodeType) return !1;
      this._target = q = a, this._tween = h, this._vars = b, r = j, k = b.autoRound, c = !1, d = b.suffixMap || g.suffixMap, e = aa(a, ""), f = this._overwriteProps;
      var n,
          p,
          s,
          t,
          u,
          v,
          w,
          x,
          y,
          A = a.style;

      if (l && "" === A.zIndex && (n = ba(a, "zIndex", e), ("auto" === n || "" === n) && this._addLazySet(A, "zIndex", 0)), "string" == typeof b && (t = A.cssText, n = ea(a, e), A.cssText = t + ";" + b, n = fa(a, n, ea(a)).difs, !V && z.test(b) && (n.opacity = parseFloat(RegExp.$1)), b = n, A.cssText = t), b.className ? this._firstPT = p = i.className.parse(a, b.className, "className", this, null, null, b) : this._firstPT = p = this.parse(a, b, null), this._transformType) {
        for (y = 3 === this._transformType, Ea ? m && (l = !0, "" === A.zIndex && (w = ba(a, "zIndex", e), ("auto" === w || "" === w) && this._addLazySet(A, "zIndex", 0)), o && this._addLazySet(A, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (y ? "visible" : "hidden"))) : A.zoom = 1, s = p; s && s._next;) {
          s = s._next;
        }

        x = new va(a, "transform", 0, 0, null, 2), this._linkCSSP(x, null, s), x.setRatio = Ea ? Va : Ua, x.data = this._transform || Ta(a, e, !0), x.tween = h, x.pr = -1, f.pop();
      }

      if (c) {
        for (; p;) {
          for (v = p._next, s = t; s && s.pr > p.pr;) {
            s = s._next;
          }

          (p._prev = s ? s._prev : u) ? p._prev._next = p : t = p, (p._next = s) ? s._prev = p : u = p, p = v;
        }

        this._firstPT = t;
      }

      return !0;
    }, j.parse = function (a, b, c, f) {
      var g,
          h,
          j,
          l,
          m,
          n,
          o,
          p,
          s,
          t,
          u = a.style;

      for (g in b) {
        if (n = b[g], h = i[g], "function" != typeof n || h && h.allowFunc || (n = n(r, q)), h) c = h.parse(a, n, g, this, c, f, b);else {
          if ("--" === g.substr(0, 2)) {
            this._tween._propLookup[g] = this._addTween.call(this._tween, a.style, "setProperty", aa(a).getPropertyValue(g) + "", n + "", g, !1, g);
            continue;
          }

          m = ba(a, g, e) + "", s = "string" == typeof n, "color" === g || "fill" === g || "stroke" === g || -1 !== g.indexOf("Color") || s && B.test(n) ? (s || (n = pa(n), n = (n.length > 3 ? "rgba(" : "rgb(") + n.join(",") + ")"), c = xa(u, g, m, n, !0, "transparent", c, 0, f)) : s && K.test(n) ? c = xa(u, g, m, n, !0, null, c, 0, f) : (j = parseFloat(m), o = j || 0 === j ? m.substr((j + "").length) : "", ("" === m || "auto" === m) && ("width" === g || "height" === g ? (j = ia(a, g, e), o = "px") : "left" === g || "top" === g ? (j = da(a, g, e), o = "px") : (j = "opacity" !== g ? 0 : 1, o = "")), t = s && "=" === n.charAt(1), t ? (l = parseInt(n.charAt(0) + "1", 10), n = n.substr(2), l *= parseFloat(n), p = n.replace(x, "")) : (l = parseFloat(n), p = s ? n.replace(x, "") : ""), "" === p && (p = g in d ? d[g] : o), n = l || 0 === l ? (t ? l + j : l) + p : b[g], o !== p && ("" !== p || "lineHeight" === g) && (l || 0 === l) && j && (j = ca(a, g, j, o), "%" === p ? (j /= ca(a, g, 100, "%") / 100, b.strictUnits !== !0 && (m = j + "%")) : "em" === p || "rem" === p || "vw" === p || "vh" === p ? j /= ca(a, g, 1, p) : "px" !== p && (l = ca(a, g, l, p), p = "px"), t && (l || 0 === l) && (n = l + j + p)), t && (l += j), !j && 0 !== j || !l && 0 !== l ? void 0 !== u[g] && (n || n + "" != "NaN" && null != n) ? (c = new va(u, g, l || j || 0, 0, c, -1, g, !1, 0, m, n), c.xs0 = "none" !== n || "display" !== g && -1 === g.indexOf("Style") ? n : m) : X("invalid " + g + " tween value: " + b[g]) : (c = new va(u, g, j, l - j, c, 0, g, k !== !1 && ("px" === p || "zIndex" === g), 0, m, n), c.xs0 = p));
        }
        f && c && !c.plugin && (c.plugin = f);
      }

      return c;
    }, j.setRatio = function (a) {
      var b,
          c,
          d,
          e = this._firstPT,
          f = 1e-6;
      if (1 !== a || this._tween._time !== this._tween._duration && 0 !== this._tween._time) {
        if (a || this._tween._time !== this._tween._duration && 0 !== this._tween._time || this._tween._rawPrevTime === -1e-6) for (; e;) {
          if (b = e.c * a + e.s, e.r ? b = e.r(b) : f > b && b > -f && (b = 0), e.type) {
            if (1 === e.type) {
              if (d = e.l, 2 === d) e.t[e.p] = e.xs0 + b + e.xs1 + e.xn1 + e.xs2;else if (3 === d) e.t[e.p] = e.xs0 + b + e.xs1 + e.xn1 + e.xs2 + e.xn2 + e.xs3;else if (4 === d) e.t[e.p] = e.xs0 + b + e.xs1 + e.xn1 + e.xs2 + e.xn2 + e.xs3 + e.xn3 + e.xs4;else if (5 === d) e.t[e.p] = e.xs0 + b + e.xs1 + e.xn1 + e.xs2 + e.xn2 + e.xs3 + e.xn3 + e.xs4 + e.xn4 + e.xs5;else {
                for (c = e.xs0 + b + e.xs1, d = 1; d < e.l; d++) {
                  c += e["xn" + d] + e["xs" + (d + 1)];
                }

                e.t[e.p] = c;
              }
            } else -1 === e.type ? e.t[e.p] = e.xs0 : e.setRatio && e.setRatio(a);
          } else e.t[e.p] = b + e.xs0;
          e = e._next;
        } else for (; e;) {
          2 !== e.type ? e.t[e.p] = e.b : e.setRatio(a), e = e._next;
        }
      } else for (; e;) {
        if (2 !== e.type) {
          if (e.r && -1 !== e.type) {
            if (b = e.r(e.s + e.c), e.type) {
              if (1 === e.type) {
                for (d = e.l, c = e.xs0 + b + e.xs1, d = 1; d < e.l; d++) {
                  c += e["xn" + d] + e["xs" + (d + 1)];
                }

                e.t[e.p] = c;
              }
            } else e.t[e.p] = b + e.xs0;
          } else e.t[e.p] = e.e;
        } else e.setRatio(a);
        e = e._next;
      }
    }, j._enableTransforms = function (a) {
      this._transform = this._transform || Ta(this._target, e, !0), this._transformType = this._transform.svg && Ca || !a && 3 !== this._transformType ? 2 : 3;
    };

    var $a = function $a(a) {
      this.t[this.p] = this.e, this.data._linkCSSP(this, this._next, null, !0);
    };

    j._addLazySet = function (a, b, c) {
      var d = this._firstPT = new va(a, b, 0, 0, this._firstPT, 2);
      d.e = c, d.setRatio = $a, d.data = this;
    }, j._linkCSSP = function (a, b, c, d) {
      return a && (b && (b._prev = a), a._next && (a._next._prev = a._prev), a._prev ? a._prev._next = a._next : this._firstPT === a && (this._firstPT = a._next, d = !0), c ? c._next = a : d || null !== this._firstPT || (this._firstPT = a), a._next = b, a._prev = c), a;
    }, j._mod = function (a) {
      for (var b = this._firstPT; b;) {
        "function" == typeof a[b.p] && (b.r = a[b.p]), b = b._next;
      }
    }, j._kill = function (b) {
      var c,
          d,
          e,
          f = b;

      if (b.autoAlpha || b.alpha) {
        f = {};

        for (d in b) {
          f[d] = b[d];
        }

        f.opacity = 1, f.autoAlpha && (f.visibility = 1);
      }

      for (b.className && (c = this._classNamePT) && (e = c.xfirst, e && e._prev ? this._linkCSSP(e._prev, c._next, e._prev._prev) : e === this._firstPT && (this._firstPT = c._next), c._next && this._linkCSSP(c._next, c._next._next, e._prev), this._classNamePT = null), c = this._firstPT; c;) {
        c.plugin && c.plugin !== d && c.plugin._kill && (c.plugin._kill(b), d = c.plugin), c = c._next;
      }

      return a.prototype._kill.call(this, f);
    };

    var _a = function _a(a, b, c) {
      var d, e, f, g;
      if (a.slice) for (e = a.length; --e > -1;) {
        _a(a[e], b, c);
      } else for (d = a.childNodes, e = d.length; --e > -1;) {
        f = d[e], g = f.type, f.style && (b.push(ea(f)), c && c.push(f)), 1 !== g && 9 !== g && 11 !== g || !f.childNodes.length || _a(f, b, c);
      }
    };

    return g.cascadeTo = function (a, c, d) {
      var e,
          f,
          g,
          h,
          i = b.to(a, c, d),
          j = [i],
          k = [],
          l = [],
          m = [],
          n = b._internals.reservedProps;

      for (a = i._targets || i.target, _a(a, k, m), i.render(c, !0, !0), _a(a, l), i.render(0, !0, !0), i._enabled(!0), e = m.length; --e > -1;) {
        if (f = fa(m[e], k[e], l[e]), f.firstMPT) {
          f = f.difs;

          for (g in d) {
            n[g] && (f[g] = d[g]);
          }

          h = {};

          for (g in f) {
            h[g] = k[e][g];
          }

          j.push(b.fromTo(m[e], c, h, f));
        }
      }

      return j;
    }, a.activate([g]), g;
  }, !0), function () {
    var a = _gsScope._gsDefine.plugin({
      propName: "roundProps",
      version: "1.7.0",
      priority: -1,
      API: 2,
      init: function init(a, b, c) {
        return this._tween = c, !0;
      }
    }),
        b = function b(a) {
      var b = 1 > a ? Math.pow(10, (a + "").length - 2) : 1;
      return function (c) {
        return (Math.round(c / a) * a * b | 0) / b;
      };
    },
        c = function c(a, b) {
      for (; a;) {
        a.f || a.blob || (a.m = b || Math.round), a = a._next;
      }
    },
        d = a.prototype;

    d._onInitAllProps = function () {
      var a,
          d,
          e,
          f,
          g = this._tween,
          h = g.vars.roundProps,
          i = {},
          j = g._propLookup.roundProps;
      if ("object" != _typeof(h) || h.push) for ("string" == typeof h && (h = h.split(",")), e = h.length; --e > -1;) {
        i[h[e]] = Math.round;
      } else for (f in h) {
        i[f] = b(h[f]);
      }

      for (f in i) {
        for (a = g._firstPT; a;) {
          d = a._next, a.pg ? a.t._mod(i) : a.n === f && (2 === a.f && a.t ? c(a.t._firstPT, i[f]) : (this._add(a.t, f, a.s, a.c, i[f]), d && (d._prev = a._prev), a._prev ? a._prev._next = d : g._firstPT === a && (g._firstPT = d), a._next = a._prev = null, g._propLookup[f] = j)), a = d;
        }
      }

      return !1;
    }, d._add = function (a, b, c, d, e) {
      this._addTween(a, b, c, c + d, b, e || Math.round), this._overwriteProps.push(b);
    };
  }(), function () {
    _gsScope._gsDefine.plugin({
      propName: "attr",
      API: 2,
      version: "0.6.1",
      init: function init(a, b, c, d) {
        var e, f;
        if ("function" != typeof a.setAttribute) return !1;

        for (e in b) {
          f = b[e], "function" == typeof f && (f = f(d, a)), this._addTween(a, "setAttribute", a.getAttribute(e) + "", f + "", e, !1, e), this._overwriteProps.push(e);
        }

        return !0;
      }
    });
  }(), _gsScope._gsDefine.plugin({
    propName: "directionalRotation",
    version: "0.3.1",
    API: 2,
    init: function init(a, b, c, d) {
      "object" != _typeof(b) && (b = {
        rotation: b
      }), this.finals = {};
      var e,
          f,
          g,
          h,
          i,
          j,
          k = b.useRadians === !0 ? 2 * Math.PI : 360,
          l = 1e-6;

      for (e in b) {
        "useRadians" !== e && (h = b[e], "function" == typeof h && (h = h(d, a)), j = (h + "").split("_"), f = j[0], g = parseFloat("function" != typeof a[e] ? a[e] : a[e.indexOf("set") || "function" != typeof a["get" + e.substr(3)] ? e : "get" + e.substr(3)]()), h = this.finals[e] = "string" == typeof f && "=" === f.charAt(1) ? g + parseInt(f.charAt(0) + "1", 10) * Number(f.substr(2)) : Number(f) || 0, i = h - g, j.length && (f = j.join("_"), -1 !== f.indexOf("short") && (i %= k, i !== i % (k / 2) && (i = 0 > i ? i + k : i - k)), -1 !== f.indexOf("_cw") && 0 > i ? i = (i + 9999999999 * k) % k - (i / k | 0) * k : -1 !== f.indexOf("ccw") && i > 0 && (i = (i - 9999999999 * k) % k - (i / k | 0) * k)), (i > l || -l > i) && (this._addTween(a, e, g, g + i, e), this._overwriteProps.push(e)));
      }

      return !0;
    },
    set: function set(a) {
      var b;
      if (1 !== a) this._super.setRatio.call(this, a);else for (b = this._firstPT; b;) {
        b.f ? b.t[b.p](this.finals[b.p]) : b.t[b.p] = this.finals[b.p], b = b._next;
      }
    }
  })._autoCSS = !0, _gsScope._gsDefine("easing.Back", ["easing.Ease"], function (a) {
    var b,
        c,
        d,
        e,
        f = _gsScope.GreenSockGlobals || _gsScope,
        g = f.com.greensock,
        h = 2 * Math.PI,
        i = Math.PI / 2,
        j = g._class,
        k = function k(b, c) {
      var d = j("easing." + b, function () {}, !0),
          e = d.prototype = new a();
      return e.constructor = d, e.getRatio = c, d;
    },
        l = a.register || function () {},
        m = function m(a, b, c, d, e) {
      var f = j("easing." + a, {
        easeOut: new b(),
        easeIn: new c(),
        easeInOut: new d()
      }, !0);
      return l(f, a), f;
    },
        n = function n(a, b, c) {
      this.t = a, this.v = b, c && (this.next = c, c.prev = this, this.c = c.v - b, this.gap = c.t - a);
    },
        o = function o(b, c) {
      var d = j("easing." + b, function (a) {
        this._p1 = a || 0 === a ? a : 1.70158, this._p2 = 1.525 * this._p1;
      }, !0),
          e = d.prototype = new a();
      return e.constructor = d, e.getRatio = c, e.config = function (a) {
        return new d(a);
      }, d;
    },
        p = m("Back", o("BackOut", function (a) {
      return (a -= 1) * a * ((this._p1 + 1) * a + this._p1) + 1;
    }), o("BackIn", function (a) {
      return a * a * ((this._p1 + 1) * a - this._p1);
    }), o("BackInOut", function (a) {
      return (a *= 2) < 1 ? .5 * a * a * ((this._p2 + 1) * a - this._p2) : .5 * ((a -= 2) * a * ((this._p2 + 1) * a + this._p2) + 2);
    })),
        q = j("easing.SlowMo", function (a, b, c) {
      b = b || 0 === b ? b : .7, null == a ? a = .7 : a > 1 && (a = 1), this._p = 1 !== a ? b : 0, this._p1 = (1 - a) / 2, this._p2 = a, this._p3 = this._p1 + this._p2, this._calcEnd = c === !0;
    }, !0),
        r = q.prototype = new a();

    return r.constructor = q, r.getRatio = function (a) {
      var b = a + (.5 - a) * this._p;
      return a < this._p1 ? this._calcEnd ? 1 - (a = 1 - a / this._p1) * a : b - (a = 1 - a / this._p1) * a * a * a * b : a > this._p3 ? this._calcEnd ? 1 === a ? 0 : 1 - (a = (a - this._p3) / this._p1) * a : b + (a - b) * (a = (a - this._p3) / this._p1) * a * a * a : this._calcEnd ? 1 : b;
    }, q.ease = new q(.7, .7), r.config = q.config = function (a, b, c) {
      return new q(a, b, c);
    }, b = j("easing.SteppedEase", function (a, b) {
      a = a || 1, this._p1 = 1 / a, this._p2 = a + (b ? 0 : 1), this._p3 = b ? 1 : 0;
    }, !0), r = b.prototype = new a(), r.constructor = b, r.getRatio = function (a) {
      return 0 > a ? a = 0 : a >= 1 && (a = .999999999), ((this._p2 * a | 0) + this._p3) * this._p1;
    }, r.config = b.config = function (a, c) {
      return new b(a, c);
    }, c = j("easing.ExpoScaleEase", function (a, b, c) {
      this._p1 = Math.log(b / a), this._p2 = b - a, this._p3 = a, this._ease = c;
    }, !0), r = c.prototype = new a(), r.constructor = c, r.getRatio = function (a) {
      return this._ease && (a = this._ease.getRatio(a)), (this._p3 * Math.exp(this._p1 * a) - this._p3) / this._p2;
    }, r.config = c.config = function (a, b, d) {
      return new c(a, b, d);
    }, d = j("easing.RoughEase", function (b) {
      b = b || {};

      for (var c, d, e, f, g, h, i = b.taper || "none", j = [], k = 0, l = 0 | (b.points || 20), m = l, o = b.randomize !== !1, p = b.clamp === !0, q = b.template instanceof a ? b.template : null, r = "number" == typeof b.strength ? .4 * b.strength : .4; --m > -1;) {
        c = o ? Math.random() : 1 / l * m, d = q ? q.getRatio(c) : c, "none" === i ? e = r : "out" === i ? (f = 1 - c, e = f * f * r) : "in" === i ? e = c * c * r : .5 > c ? (f = 2 * c, e = f * f * .5 * r) : (f = 2 * (1 - c), e = f * f * .5 * r), o ? d += Math.random() * e - .5 * e : m % 2 ? d += .5 * e : d -= .5 * e, p && (d > 1 ? d = 1 : 0 > d && (d = 0)), j[k++] = {
          x: c,
          y: d
        };
      }

      for (j.sort(function (a, b) {
        return a.x - b.x;
      }), h = new n(1, 1, null), m = l; --m > -1;) {
        g = j[m], h = new n(g.x, g.y, h);
      }

      this._prev = new n(0, 0, 0 !== h.t ? h : h.next);
    }, !0), r = d.prototype = new a(), r.constructor = d, r.getRatio = function (a) {
      var b = this._prev;

      if (a > b.t) {
        for (; b.next && a >= b.t;) {
          b = b.next;
        }

        b = b.prev;
      } else for (; b.prev && a <= b.t;) {
        b = b.prev;
      }

      return this._prev = b, b.v + (a - b.t) / b.gap * b.c;
    }, r.config = function (a) {
      return new d(a);
    }, d.ease = new d(), m("Bounce", k("BounceOut", function (a) {
      return 1 / 2.75 > a ? 7.5625 * a * a : 2 / 2.75 > a ? 7.5625 * (a -= 1.5 / 2.75) * a + .75 : 2.5 / 2.75 > a ? 7.5625 * (a -= 2.25 / 2.75) * a + .9375 : 7.5625 * (a -= 2.625 / 2.75) * a + .984375;
    }), k("BounceIn", function (a) {
      return (a = 1 - a) < 1 / 2.75 ? 1 - 7.5625 * a * a : 2 / 2.75 > a ? 1 - (7.5625 * (a -= 1.5 / 2.75) * a + .75) : 2.5 / 2.75 > a ? 1 - (7.5625 * (a -= 2.25 / 2.75) * a + .9375) : 1 - (7.5625 * (a -= 2.625 / 2.75) * a + .984375);
    }), k("BounceInOut", function (a) {
      var b = .5 > a;
      return a = b ? 1 - 2 * a : 2 * a - 1, a = 1 / 2.75 > a ? 7.5625 * a * a : 2 / 2.75 > a ? 7.5625 * (a -= 1.5 / 2.75) * a + .75 : 2.5 / 2.75 > a ? 7.5625 * (a -= 2.25 / 2.75) * a + .9375 : 7.5625 * (a -= 2.625 / 2.75) * a + .984375, b ? .5 * (1 - a) : .5 * a + .5;
    })), m("Circ", k("CircOut", function (a) {
      return Math.sqrt(1 - (a -= 1) * a);
    }), k("CircIn", function (a) {
      return -(Math.sqrt(1 - a * a) - 1);
    }), k("CircInOut", function (a) {
      return (a *= 2) < 1 ? -.5 * (Math.sqrt(1 - a * a) - 1) : .5 * (Math.sqrt(1 - (a -= 2) * a) + 1);
    })), e = function e(b, c, d) {
      var e = j("easing." + b, function (a, b) {
        this._p1 = a >= 1 ? a : 1, this._p2 = (b || d) / (1 > a ? a : 1), this._p3 = this._p2 / h * (Math.asin(1 / this._p1) || 0), this._p2 = h / this._p2;
      }, !0),
          f = e.prototype = new a();
      return f.constructor = e, f.getRatio = c, f.config = function (a, b) {
        return new e(a, b);
      }, e;
    }, m("Elastic", e("ElasticOut", function (a) {
      return this._p1 * Math.pow(2, -10 * a) * Math.sin((a - this._p3) * this._p2) + 1;
    }, .3), e("ElasticIn", function (a) {
      return -(this._p1 * Math.pow(2, 10 * (a -= 1)) * Math.sin((a - this._p3) * this._p2));
    }, .3), e("ElasticInOut", function (a) {
      return (a *= 2) < 1 ? -.5 * (this._p1 * Math.pow(2, 10 * (a -= 1)) * Math.sin((a - this._p3) * this._p2)) : this._p1 * Math.pow(2, -10 * (a -= 1)) * Math.sin((a - this._p3) * this._p2) * .5 + 1;
    }, .45)), m("Expo", k("ExpoOut", function (a) {
      return 1 - Math.pow(2, -10 * a);
    }), k("ExpoIn", function (a) {
      return Math.pow(2, 10 * (a - 1)) - .001;
    }), k("ExpoInOut", function (a) {
      return (a *= 2) < 1 ? .5 * Math.pow(2, 10 * (a - 1)) : .5 * (2 - Math.pow(2, -10 * (a - 1)));
    })), m("Sine", k("SineOut", function (a) {
      return Math.sin(a * i);
    }), k("SineIn", function (a) {
      return -Math.cos(a * i) + 1;
    }), k("SineInOut", function (a) {
      return -.5 * (Math.cos(Math.PI * a) - 1);
    })), j("easing.EaseLookup", {
      find: function find(b) {
        return a.map[b];
      }
    }, !0), l(f.SlowMo, "SlowMo", "ease,"), l(d, "RoughEase", "ease,"), l(b, "SteppedEase", "ease,"), p;
  }, !0);
}), _gsScope._gsDefine && _gsScope._gsQueue.pop()(), function (a, b) {
  "use strict";

  var c = {},
      d = a.document,
      e = a.GreenSockGlobals = a.GreenSockGlobals || a,
      f = e[b];
  if (f) return "undefined" != typeof module && module.exports && (module.exports = f), f;

  var g,
      h,
      i,
      j,
      k,
      l = function l(a) {
    var b,
        c = a.split("."),
        d = e;

    for (b = 0; b < c.length; b++) {
      d[c[b]] = d = d[c[b]] || {};
    }

    return d;
  },
      m = l("com.greensock"),
      n = 1e-8,
      o = function o(a) {
    var b,
        c = [],
        d = a.length;

    for (b = 0; b !== d; c.push(a[b++])) {
      ;
    }

    return c;
  },
      p = function p() {},
      q = function () {
    var a = Object.prototype.toString,
        b = a.call([]);
    return function (c) {
      return null != c && (c instanceof Array || "object" == _typeof(c) && !!c.push && a.call(c) === b);
    };
  }(),
      r = {},
      s = function s(d, f, g, h) {
    this.sc = r[d] ? r[d].sc : [], r[d] = this, this.gsClass = null, this.func = g;
    var i = [];
    this.check = function (j) {
      for (var k, m, n, o, p = f.length, q = p; --p > -1;) {
        (k = r[f[p]] || new s(f[p], [])).gsClass ? (i[p] = k.gsClass, q--) : j && k.sc.push(this);
      }

      if (0 === q && g) {
        if (m = ("com.greensock." + d).split("."), n = m.pop(), o = l(m.join("."))[n] = this.gsClass = g.apply(g, i), h) if (e[n] = c[n] = o, "undefined" != typeof module && module.exports) {
          if (d === b) {
            module.exports = c[b] = o;

            for (p in c) {
              o[p] = c[p];
            }
          } else c[b] && (c[b][n] = o);
        } else "function" == typeof define && define.amd && define((a.GreenSockAMDPath ? a.GreenSockAMDPath + "/" : "") + d.split(".").pop(), [], function () {
          return o;
        });

        for (p = 0; p < this.sc.length; p++) {
          this.sc[p].check();
        }
      }
    }, this.check(!0);
  },
      t = a._gsDefine = function (a, b, c, d) {
    return new s(a, b, c, d);
  },
      u = m._class = function (a, b, c) {
    return b = b || function () {}, t(a, [], function () {
      return b;
    }, c), b;
  };

  t.globals = e;

  var v = [0, 0, 1, 1],
      w = u("easing.Ease", function (a, b, c, d) {
    this._func = a, this._type = c || 0, this._power = d || 0, this._params = b ? v.concat(b) : v;
  }, !0),
      x = w.map = {},
      y = w.register = function (a, b, c, d) {
    for (var e, f, g, h, i = b.split(","), j = i.length, k = (c || "easeIn,easeOut,easeInOut").split(","); --j > -1;) {
      for (f = i[j], e = d ? u("easing." + f, null, !0) : m.easing[f] || {}, g = k.length; --g > -1;) {
        h = k[g], x[f + "." + h] = x[h + f] = e[h] = a.getRatio ? a : a[h] || new a();
      }
    }
  };

  for (i = w.prototype, i._calcEnd = !1, i.getRatio = function (a) {
    if (this._func) return this._params[0] = a, this._func.apply(null, this._params);
    var b = this._type,
        c = this._power,
        d = 1 === b ? 1 - a : 2 === b ? a : .5 > a ? 2 * a : 2 * (1 - a);
    return 1 === c ? d *= d : 2 === c ? d *= d * d : 3 === c ? d *= d * d * d : 4 === c && (d *= d * d * d * d), 1 === b ? 1 - d : 2 === b ? d : .5 > a ? d / 2 : 1 - d / 2;
  }, g = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"], h = g.length; --h > -1;) {
    i = g[h] + ",Power" + h, y(new w(null, null, 1, h), i, "easeOut", !0), y(new w(null, null, 2, h), i, "easeIn" + (0 === h ? ",easeNone" : "")), y(new w(null, null, 3, h), i, "easeInOut");
  }

  x.linear = m.easing.Linear.easeIn, x.swing = m.easing.Quad.easeInOut;
  var z = u("events.EventDispatcher", function (a) {
    this._listeners = {}, this._eventTarget = a || this;
  });
  i = z.prototype, i.addEventListener = function (a, b, c, d, e) {
    e = e || 0;
    var f,
        g,
        h = this._listeners[a],
        i = 0;

    for (this !== j || k || j.wake(), null == h && (this._listeners[a] = h = []), g = h.length; --g > -1;) {
      f = h[g], f.c === b && f.s === c ? h.splice(g, 1) : 0 === i && f.pr < e && (i = g + 1);
    }

    h.splice(i, 0, {
      c: b,
      s: c,
      up: d,
      pr: e
    });
  }, i.removeEventListener = function (a, b) {
    var c,
        d = this._listeners[a];
    if (d) for (c = d.length; --c > -1;) {
      if (d[c].c === b) return void d.splice(c, 1);
    }
  }, i.dispatchEvent = function (a) {
    var b,
        c,
        d,
        e = this._listeners[a];
    if (e) for (b = e.length, b > 1 && (e = e.slice(0)), c = this._eventTarget; --b > -1;) {
      d = e[b], d && (d.up ? d.c.call(d.s || c, {
        type: a,
        target: c
      }) : d.c.call(d.s || c));
    }
  };

  var A = a.requestAnimationFrame,
      B = a.cancelAnimationFrame,
      C = Date.now || function () {
    return new Date().getTime();
  },
      D = C();

  for (g = ["ms", "moz", "webkit", "o"], h = g.length; --h > -1 && !A;) {
    A = a[g[h] + "RequestAnimationFrame"], B = a[g[h] + "CancelAnimationFrame"] || a[g[h] + "CancelRequestAnimationFrame"];
  }

  u("Ticker", function (a, b) {
    var c,
        e,
        f,
        g,
        h,
        i = this,
        l = C(),
        m = b !== !1 && A ? "auto" : !1,
        o = 500,
        q = 33,
        r = "tick",
        s = function s(a) {
      var b,
          d,
          j = C() - D;
      j > o && (l += j - q), D += j, i.time = (D - l) / 1e3, b = i.time - h, (!c || b > 0 || a === !0) && (i.frame++, h += b + (b >= g ? .004 : g - b), d = !0), a !== !0 && (f = e(s)), d && i.dispatchEvent(r);
    };

    z.call(i), i.time = i.frame = 0, i.tick = function () {
      s(!0);
    }, i.lagSmoothing = function (a, b) {
      return arguments.length ? (o = a || 1 / n, void (q = Math.min(b, o, 0))) : 1 / n > o;
    }, i.sleep = function () {
      null != f && (m && B ? B(f) : clearTimeout(f), e = p, f = null, i === j && (k = !1));
    }, i.wake = function (a) {
      null !== f ? i.sleep() : a ? l += -D + (D = C()) : i.frame > 10 && (D = C() - o + 5), e = 0 === c ? p : m && A ? A : function (a) {
        return setTimeout(a, 1e3 * (h - i.time) + 1 | 0);
      }, i === j && (k = !0), s(2);
    }, i.fps = function (a) {
      return arguments.length ? (c = a, g = 1 / (c || 60), h = this.time + g, void i.wake()) : c;
    }, i.useRAF = function (a) {
      return arguments.length ? (i.sleep(), m = a, void i.fps(c)) : m;
    }, i.fps(a), setTimeout(function () {
      "auto" === m && i.frame < 5 && "hidden" !== (d || {}).visibilityState && i.useRAF(!1);
    }, 1500);
  }), i = m.Ticker.prototype = new m.events.EventDispatcher(), i.constructor = m.Ticker;
  var E = u("core.Animation", function (a, b) {
    if (this.vars = b = b || {}, this._duration = this._totalDuration = a || 0, this._delay = Number(b.delay) || 0, this._timeScale = 1, this._active = !!b.immediateRender, this.data = b.data, this._reversed = !!b.reversed, Z) {
      k || j.wake();
      var c = this.vars.useFrames ? Y : Z;
      c.add(this, c._time), this.vars.paused && this.paused(!0);
    }
  });
  j = E.ticker = new m.Ticker(), i = E.prototype, i._dirty = i._gc = i._initted = i._paused = !1, i._totalTime = i._time = 0, i._rawPrevTime = -1, i._next = i._last = i._onUpdate = i._timeline = i.timeline = null, i._paused = !1;

  var F = function F() {
    k && C() - D > 2e3 && ("hidden" !== (d || {}).visibilityState || !j.lagSmoothing()) && j.wake();
    var a = setTimeout(F, 2e3);
    a.unref && a.unref();
  };

  F(), i.play = function (a, b) {
    return null != a && this.seek(a, b), this.reversed(!1).paused(!1);
  }, i.pause = function (a, b) {
    return null != a && this.seek(a, b), this.paused(!0);
  }, i.resume = function (a, b) {
    return null != a && this.seek(a, b), this.paused(!1);
  }, i.seek = function (a, b) {
    return this.totalTime(Number(a), b !== !1);
  }, i.restart = function (a, b) {
    return this.reversed(!1).paused(!1).totalTime(a ? -this._delay : 0, b !== !1, !0);
  }, i.reverse = function (a, b) {
    return null != a && this.seek(a || this.totalDuration(), b), this.reversed(!0).paused(!1);
  }, i.render = function (a, b, c) {}, i.invalidate = function () {
    return this._time = this._totalTime = 0, this._initted = this._gc = !1, this._rawPrevTime = -1, (this._gc || !this.timeline) && this._enabled(!0), this;
  }, i.isActive = function () {
    var a,
        b = this._timeline,
        c = this._startTime;
    return !b || !this._gc && !this._paused && b.isActive() && (a = b.rawTime(!0)) >= c && a < c + this.totalDuration() / this._timeScale - n;
  }, i._enabled = function (a, b) {
    return k || j.wake(), this._gc = !a, this._active = this.isActive(), b !== !0 && (a && !this.timeline ? this._timeline.add(this, this._startTime - this._delay) : !a && this.timeline && this._timeline._remove(this, !0)), !1;
  }, i._kill = function (a, b) {
    return this._enabled(!1, !1);
  }, i.kill = function (a, b) {
    return this._kill(a, b), this;
  }, i._uncache = function (a) {
    for (var b = a ? this : this.timeline; b;) {
      b._dirty = !0, b = b.timeline;
    }

    return this;
  }, i._swapSelfInParams = function (a) {
    for (var b = a.length, c = a.concat(); --b > -1;) {
      "{self}" === a[b] && (c[b] = this);
    }

    return c;
  }, i._callback = function (a) {
    var b = this.vars,
        c = b[a],
        d = b[a + "Params"],
        e = b[a + "Scope"] || b.callbackScope || this,
        f = d ? d.length : 0;

    switch (f) {
      case 0:
        c.call(e);
        break;

      case 1:
        c.call(e, d[0]);
        break;

      case 2:
        c.call(e, d[0], d[1]);
        break;

      default:
        c.apply(e, d);
    }
  }, i.eventCallback = function (a, b, c, d) {
    if ("on" === (a || "").substr(0, 2)) {
      var e = this.vars;
      if (1 === arguments.length) return e[a];
      null == b ? delete e[a] : (e[a] = b, e[a + "Params"] = q(c) && -1 !== c.join("").indexOf("{self}") ? this._swapSelfInParams(c) : c, e[a + "Scope"] = d), "onUpdate" === a && (this._onUpdate = b);
    }

    return this;
  }, i.delay = function (a) {
    return arguments.length ? (this._timeline.smoothChildTiming && this.startTime(this._startTime + a - this._delay), this._delay = a, this) : this._delay;
  }, i.duration = function (a) {
    return arguments.length ? (this._duration = this._totalDuration = a, this._uncache(!0), this._timeline.smoothChildTiming && this._time > 0 && this._time < this._duration && 0 !== a && this.totalTime(this._totalTime * (a / this._duration), !0), this) : (this._dirty = !1, this._duration);
  }, i.totalDuration = function (a) {
    return this._dirty = !1, arguments.length ? this.duration(a) : this._totalDuration;
  }, i.time = function (a, b) {
    return arguments.length ? (this._dirty && this.totalDuration(), this.totalTime(a > this._duration ? this._duration : a, b)) : this._time;
  }, i.totalTime = function (a, b, c) {
    if (k || j.wake(), !arguments.length) return this._totalTime;

    if (this._timeline) {
      if (0 > a && !c && (a += this.totalDuration()), this._timeline.smoothChildTiming) {
        this._dirty && this.totalDuration();
        var d = this._totalDuration,
            e = this._timeline;
        if (a > d && !c && (a = d), this._startTime = (this._paused ? this._pauseTime : e._time) - (this._reversed ? d - a : a) / this._timeScale, e._dirty || this._uncache(!1), e._timeline) for (; e._timeline;) {
          e._timeline._time !== (e._startTime + e._totalTime) / e._timeScale && e.totalTime(e._totalTime, !0), e = e._timeline;
        }
      }

      this._gc && this._enabled(!0, !1), (this._totalTime !== a || 0 === this._duration) && (K.length && _(), this.render(a, b, !1), K.length && _());
    }

    return this;
  }, i.progress = i.totalProgress = function (a, b) {
    var c = this.duration();
    return arguments.length ? this.totalTime(c * a, b) : c ? this._time / c : this.ratio;
  }, i.startTime = function (a) {
    return arguments.length ? (a !== this._startTime && (this._startTime = a, this.timeline && this.timeline._sortChildren && this.timeline.add(this, a - this._delay)), this) : this._startTime;
  }, i.endTime = function (a) {
    return this._startTime + (0 != a ? this.totalDuration() : this.duration()) / this._timeScale;
  }, i.timeScale = function (a) {
    if (!arguments.length) return this._timeScale;
    var b, c;

    for (a = a || n, this._timeline && this._timeline.smoothChildTiming && (b = this._pauseTime, c = b || 0 === b ? b : this._timeline.totalTime(), this._startTime = c - (c - this._startTime) * this._timeScale / a), this._timeScale = a, c = this.timeline; c && c.timeline;) {
      c._dirty = !0, c.totalDuration(), c = c.timeline;
    }

    return this;
  }, i.reversed = function (a) {
    return arguments.length ? (a != this._reversed && (this._reversed = a, this.totalTime(this._timeline && !this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime : this._totalTime, !0)), this) : this._reversed;
  }, i.paused = function (a) {
    if (!arguments.length) return this._paused;
    var b,
        c,
        d = this._timeline;
    return a != this._paused && d && (k || a || j.wake(), b = d.rawTime(), c = b - this._pauseTime, !a && d.smoothChildTiming && (this._startTime += c, this._uncache(!1)), this._pauseTime = a ? b : null, this._paused = a, this._active = this.isActive(), !a && 0 !== c && this._initted && this.duration() && (b = d.smoothChildTiming ? this._totalTime : (b - this._startTime) / this._timeScale, this.render(b, b === this._totalTime, !0))), this._gc && !a && this._enabled(!0, !1), this;
  };
  var G = u("core.SimpleTimeline", function (a) {
    E.call(this, 0, a), this.autoRemoveChildren = this.smoothChildTiming = !0;
  });
  i = G.prototype = new E(), i.constructor = G, i.kill()._gc = !1, i._first = i._last = i._recent = null, i._sortChildren = !1, i.add = i.insert = function (a, b, c, d) {
    var e, f;
    if (a._startTime = Number(b || 0) + a._delay, a._paused && this !== a._timeline && (a._pauseTime = this.rawTime() - (a._timeline.rawTime() - a._pauseTime)), a.timeline && a.timeline._remove(a, !0), a.timeline = a._timeline = this, a._gc && a._enabled(!0, !0), e = this._last, this._sortChildren) for (f = a._startTime; e && e._startTime > f;) {
      e = e._prev;
    }
    return e ? (a._next = e._next, e._next = a) : (a._next = this._first, this._first = a), a._next ? a._next._prev = a : this._last = a, a._prev = e, this._recent = a, this._timeline && this._uncache(!0), this;
  }, i._remove = function (a, b) {
    return a.timeline === this && (b || a._enabled(!1, !0), a._prev ? a._prev._next = a._next : this._first === a && (this._first = a._next), a._next ? a._next._prev = a._prev : this._last === a && (this._last = a._prev), a._next = a._prev = a.timeline = null, a === this._recent && (this._recent = this._last), this._timeline && this._uncache(!0)), this;
  }, i.render = function (a, b, c) {
    var d,
        e = this._first;

    for (this._totalTime = this._time = this._rawPrevTime = a; e;) {
      d = e._next, (e._active || a >= e._startTime && !e._paused && !e._gc) && (e._reversed ? e.render((e._dirty ? e.totalDuration() : e._totalDuration) - (a - e._startTime) * e._timeScale, b, c) : e.render((a - e._startTime) * e._timeScale, b, c)), e = d;
    }
  }, i.rawTime = function () {
    return k || j.wake(), this._totalTime;
  };

  var H = u("TweenLite", function (b, c, d) {
    if (E.call(this, c, d), this.render = H.prototype.render, null == b) throw "Cannot tween a null target.";
    this.target = b = "string" != typeof b ? b : H.selector(b) || b;
    var e,
        f,
        g,
        h = b.jquery || b.length && b !== a && b[0] && (b[0] === a || b[0].nodeType && b[0].style && !b.nodeType),
        i = this.vars.overwrite;
    if (this._overwrite = i = null == i ? X[H.defaultOverwrite] : "number" == typeof i ? i >> 0 : X[i], (h || b instanceof Array || b.push && q(b)) && "number" != typeof b[0]) for (this._targets = g = o(b), this._propLookup = [], this._siblings = [], e = 0; e < g.length; e++) {
      f = g[e], f ? "string" != typeof f ? f.length && f !== a && f[0] && (f[0] === a || f[0].nodeType && f[0].style && !f.nodeType) ? (g.splice(e--, 1), this._targets = g = g.concat(o(f))) : (this._siblings[e] = aa(f, this, !1), 1 === i && this._siblings[e].length > 1 && ca(f, this, null, 1, this._siblings[e])) : (f = g[e--] = H.selector(f), "string" == typeof f && g.splice(e + 1, 1)) : g.splice(e--, 1);
    } else this._propLookup = {}, this._siblings = aa(b, this, !1), 1 === i && this._siblings.length > 1 && ca(b, this, null, 1, this._siblings);
    (this.vars.immediateRender || 0 === c && 0 === this._delay && this.vars.immediateRender !== !1) && (this._time = -n, this.render(Math.min(0, -this._delay)));
  }, !0),
      I = function I(b) {
    return b && b.length && b !== a && b[0] && (b[0] === a || b[0].nodeType && b[0].style && !b.nodeType);
  },
      J = function J(a, b) {
    var c,
        d = {};

    for (c in a) {
      W[c] || c in b && "transform" !== c && "x" !== c && "y" !== c && "width" !== c && "height" !== c && "className" !== c && "border" !== c || !(!T[c] || T[c] && T[c]._autoCSS) || (d[c] = a[c], delete a[c]);
    }

    a.css = d;
  };

  i = H.prototype = new E(), i.constructor = H, i.kill()._gc = !1, i.ratio = 0, i._firstPT = i._targets = i._overwrittenProps = i._startAt = null, i._notifyPluginsOfEnabled = i._lazy = !1, H.version = "2.1.3", H.defaultEase = i._ease = new w(null, null, 1, 1), H.defaultOverwrite = "auto", H.ticker = j, H.autoSleep = 120, H.lagSmoothing = function (a, b) {
    j.lagSmoothing(a, b);
  }, H.selector = a.$ || a.jQuery || function (b) {
    var c = a.$ || a.jQuery;
    return c ? (H.selector = c, c(b)) : (d || (d = a.document), d ? d.querySelectorAll ? d.querySelectorAll(b) : d.getElementById("#" === b.charAt(0) ? b.substr(1) : b) : b);
  };

  var K = [],
      L = {},
      M = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,
      N = /[\+-]=-?[\.\d]/,
      O = function O(a) {
    for (var b, c = this._firstPT, d = 1e-6; c;) {
      b = c.blob ? 1 === a && null != this.end ? this.end : a ? this.join("") : this.start : c.c * a + c.s, c.m ? b = c.m.call(this._tween, b, this._target || c.t, this._tween) : d > b && b > -d && !c.blob && (b = 0), c.f ? c.fp ? c.t[c.p](c.fp, b) : c.t[c.p](b) : c.t[c.p] = b, c = c._next;
    }
  },
      P = function P(a) {
    return (1e3 * a | 0) / 1e3 + "";
  },
      Q = function Q(a, b, c, d) {
    var e,
        f,
        g,
        h,
        i,
        j,
        k,
        l = [],
        m = 0,
        n = "",
        o = 0;

    for (l.start = a, l.end = b, a = l[0] = a + "", b = l[1] = b + "", c && (c(l), a = l[0], b = l[1]), l.length = 0, e = a.match(M) || [], f = b.match(M) || [], d && (d._next = null, d.blob = 1, l._firstPT = l._applyPT = d), i = f.length, h = 0; i > h; h++) {
      k = f[h], j = b.substr(m, b.indexOf(k, m) - m), n += j || !h ? j : ",", m += j.length, o ? o = (o + 1) % 5 : "rgba(" === j.substr(-5) && (o = 1), k === e[h] || e.length <= h ? n += k : (n && (l.push(n), n = ""), g = parseFloat(e[h]), l.push(g), l._firstPT = {
        _next: l._firstPT,
        t: l,
        p: l.length - 1,
        s: g,
        c: ("=" === k.charAt(1) ? parseInt(k.charAt(0) + "1", 10) * parseFloat(k.substr(2)) : parseFloat(k) - g) || 0,
        f: 0,
        m: o && 4 > o ? Math.round : P
      }), m += k.length;
    }

    return n += b.substr(m), n && l.push(n), l.setRatio = O, N.test(b) && (l.end = null), l;
  },
      R = function R(a, b, c, d, e, f, g, h, i) {
    "function" == typeof d && (d = d(i || 0, a));

    var j,
        k = _typeof(a[b]),
        l = "function" !== k ? "" : b.indexOf("set") || "function" != typeof a["get" + b.substr(3)] ? b : "get" + b.substr(3),
        m = "get" !== c ? c : l ? g ? a[l](g) : a[l]() : a[b],
        n = "string" == typeof d && "=" === d.charAt(1),
        o = {
      t: a,
      p: b,
      s: m,
      f: "function" === k,
      pg: 0,
      n: e || b,
      m: f ? "function" == typeof f ? f : Math.round : 0,
      pr: 0,
      c: n ? parseInt(d.charAt(0) + "1", 10) * parseFloat(d.substr(2)) : parseFloat(d) - m || 0
    };

    return ("number" != typeof m || "number" != typeof d && !n) && (g || isNaN(m) || !n && isNaN(d) || "boolean" == typeof m || "boolean" == typeof d ? (o.fp = g, j = Q(m, n ? parseFloat(o.s) + o.c + (o.s + "").replace(/[0-9\-\.]/g, "") : d, h || H.defaultStringFilter, o), o = {
      t: j,
      p: "setRatio",
      s: 0,
      c: 1,
      f: 2,
      pg: 0,
      n: e || b,
      pr: 0,
      m: 0
    }) : (o.s = parseFloat(m), n || (o.c = parseFloat(d) - o.s || 0))), o.c ? ((o._next = this._firstPT) && (o._next._prev = o), this._firstPT = o, o) : void 0;
  },
      S = H._internals = {
    isArray: q,
    isSelector: I,
    lazyTweens: K,
    blobDif: Q
  },
      T = H._plugins = {},
      U = S.tweenLookup = {},
      V = 0,
      W = S.reservedProps = {
    ease: 1,
    delay: 1,
    overwrite: 1,
    onComplete: 1,
    onCompleteParams: 1,
    onCompleteScope: 1,
    useFrames: 1,
    runBackwards: 1,
    startAt: 1,
    onUpdate: 1,
    onUpdateParams: 1,
    onUpdateScope: 1,
    onStart: 1,
    onStartParams: 1,
    onStartScope: 1,
    onReverseComplete: 1,
    onReverseCompleteParams: 1,
    onReverseCompleteScope: 1,
    onRepeat: 1,
    onRepeatParams: 1,
    onRepeatScope: 1,
    easeParams: 1,
    yoyo: 1,
    immediateRender: 1,
    repeat: 1,
    repeatDelay: 1,
    data: 1,
    paused: 1,
    reversed: 1,
    autoCSS: 1,
    lazy: 1,
    onOverwrite: 1,
    callbackScope: 1,
    stringFilter: 1,
    id: 1,
    yoyoEase: 1,
    stagger: 1
  },
      X = {
    none: 0,
    all: 1,
    auto: 2,
    concurrent: 3,
    allOnStart: 4,
    preexisting: 5,
    "true": 1,
    "false": 0
  },
      Y = E._rootFramesTimeline = new G(),
      Z = E._rootTimeline = new G(),
      $ = 30,
      _ = S.lazyRender = function () {
    var a,
        b,
        c = K.length;

    for (L = {}, a = 0; c > a; a++) {
      b = K[a], b && b._lazy !== !1 && (b.render(b._lazy[0], b._lazy[1], !0), b._lazy = !1);
    }

    K.length = 0;
  };

  Z._startTime = j.time, Y._startTime = j.frame, Z._active = Y._active = !0, setTimeout(_, 1), E._updateRoot = H.render = function () {
    var a, b, c;

    if (K.length && _(), Z.render((j.time - Z._startTime) * Z._timeScale, !1, !1), Y.render((j.frame - Y._startTime) * Y._timeScale, !1, !1), K.length && _(), j.frame >= $) {
      $ = j.frame + (parseInt(H.autoSleep, 10) || 120);

      for (c in U) {
        for (b = U[c].tweens, a = b.length; --a > -1;) {
          b[a]._gc && b.splice(a, 1);
        }

        0 === b.length && delete U[c];
      }

      if (c = Z._first, (!c || c._paused) && H.autoSleep && !Y._first && 1 === j._listeners.tick.length) {
        for (; c && c._paused;) {
          c = c._next;
        }

        c || j.sleep();
      }
    }
  }, j.addEventListener("tick", E._updateRoot);

  var aa = function aa(a, b, c) {
    var d,
        e,
        f = a._gsTweenID;
    if (U[f || (a._gsTweenID = f = "t" + V++)] || (U[f] = {
      target: a,
      tweens: []
    }), b && (d = U[f].tweens, d[e = d.length] = b, c)) for (; --e > -1;) {
      d[e] === b && d.splice(e, 1);
    }
    return U[f].tweens;
  },
      ba = function ba(a, b, c, d) {
    var e,
        f,
        g = a.vars.onOverwrite;
    return g && (e = g(a, b, c, d)), g = H.onOverwrite, g && (f = g(a, b, c, d)), e !== !1 && f !== !1;
  },
      ca = function ca(a, b, c, d, e) {
    var f, g, h, i;

    if (1 === d || d >= 4) {
      for (i = e.length, f = 0; i > f; f++) {
        if ((h = e[f]) !== b) h._gc || h._kill(null, a, b) && (g = !0);else if (5 === d) break;
      }

      return g;
    }

    var j,
        k = b._startTime + n,
        l = [],
        m = 0,
        o = 0 === b._duration;

    for (f = e.length; --f > -1;) {
      (h = e[f]) === b || h._gc || h._paused || (h._timeline !== b._timeline ? (j = j || da(b, 0, o), 0 === da(h, j, o) && (l[m++] = h)) : h._startTime <= k && h._startTime + h.totalDuration() / h._timeScale > k && ((o || !h._initted) && k - h._startTime <= 2 * n || (l[m++] = h)));
    }

    for (f = m; --f > -1;) {
      if (h = l[f], i = h._firstPT, 2 === d && h._kill(c, a, b) && (g = !0), 2 !== d || !h._firstPT && h._initted && i) {
        if (2 !== d && !ba(h, b)) continue;
        h._enabled(!1, !1) && (g = !0);
      }
    }

    return g;
  },
      da = function da(a, b, c) {
    for (var d = a._timeline, e = d._timeScale, f = a._startTime; d._timeline;) {
      if (f += d._startTime, e *= d._timeScale, d._paused) return -100;
      d = d._timeline;
    }

    return f /= e, f > b ? f - b : c && f === b || !a._initted && 2 * n > f - b ? n : (f += a.totalDuration() / a._timeScale / e) > b + n ? 0 : f - b - n;
  };

  i._init = function () {
    var a,
        b,
        c,
        d,
        e,
        f,
        g = this.vars,
        h = this._overwrittenProps,
        i = this._duration,
        j = !!g.immediateRender,
        k = g.ease,
        l = this._startAt;

    if (g.startAt) {
      l && (l.render(-1, !0), l.kill()), e = {};

      for (d in g.startAt) {
        e[d] = g.startAt[d];
      }

      if (e.data = "isStart", e.overwrite = !1, e.immediateRender = !0, e.lazy = j && g.lazy !== !1, e.startAt = e.delay = null, e.onUpdate = g.onUpdate, e.onUpdateParams = g.onUpdateParams, e.onUpdateScope = g.onUpdateScope || g.callbackScope || this, this._startAt = H.to(this.target || {}, 0, e), j) if (this._time > 0) this._startAt = null;else if (0 !== i) return;
    } else if (g.runBackwards && 0 !== i) if (l) l.render(-1, !0), l.kill(), this._startAt = null;else {
      0 !== this._time && (j = !1), c = {};

      for (d in g) {
        W[d] && "autoCSS" !== d || (c[d] = g[d]);
      }

      if (c.overwrite = 0, c.data = "isFromStart", c.lazy = j && g.lazy !== !1, c.immediateRender = j, this._startAt = H.to(this.target, 0, c), j) {
        if (0 === this._time) return;
      } else this._startAt._init(), this._startAt._enabled(!1), this.vars.immediateRender && (this._startAt = null);
    }

    if (this._ease = k = k ? k instanceof w ? k : "function" == typeof k ? new w(k, g.easeParams) : x[k] || H.defaultEase : H.defaultEase, g.easeParams instanceof Array && k.config && (this._ease = k.config.apply(k, g.easeParams)), this._easeType = this._ease._type, this._easePower = this._ease._power, this._firstPT = null, this._targets) for (f = this._targets.length, a = 0; f > a; a++) {
      this._initProps(this._targets[a], this._propLookup[a] = {}, this._siblings[a], h ? h[a] : null, a) && (b = !0);
    } else b = this._initProps(this.target, this._propLookup, this._siblings, h, 0);
    if (b && H._onPluginEvent("_onInitAllProps", this), h && (this._firstPT || "function" != typeof this.target && this._enabled(!1, !1)), g.runBackwards) for (c = this._firstPT; c;) {
      c.s += c.c, c.c = -c.c, c = c._next;
    }
    this._onUpdate = g.onUpdate, this._initted = !0;
  }, i._initProps = function (b, c, d, e, f) {
    var g, h, i, j, k, l;
    if (null == b) return !1;
    L[b._gsTweenID] && _(), this.vars.css || b.style && b !== a && b.nodeType && T.css && this.vars.autoCSS !== !1 && J(this.vars, b);

    for (g in this.vars) {
      if (l = this.vars[g], W[g]) l && (l instanceof Array || l.push && q(l)) && -1 !== l.join("").indexOf("{self}") && (this.vars[g] = l = this._swapSelfInParams(l, this));else if (T[g] && (j = new T[g]())._onInitTween(b, this.vars[g], this, f)) {
        for (this._firstPT = k = {
          _next: this._firstPT,
          t: j,
          p: "setRatio",
          s: 0,
          c: 1,
          f: 1,
          n: g,
          pg: 1,
          pr: j._priority,
          m: 0
        }, h = j._overwriteProps.length; --h > -1;) {
          c[j._overwriteProps[h]] = this._firstPT;
        }

        (j._priority || j._onInitAllProps) && (i = !0), (j._onDisable || j._onEnable) && (this._notifyPluginsOfEnabled = !0), k._next && (k._next._prev = k);
      } else c[g] = R.call(this, b, g, "get", l, g, 0, null, this.vars.stringFilter, f);
    }

    return e && this._kill(e, b) ? this._initProps(b, c, d, e, f) : this._overwrite > 1 && this._firstPT && d.length > 1 && ca(b, this, c, this._overwrite, d) ? (this._kill(c, b), this._initProps(b, c, d, e, f)) : (this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration) && (L[b._gsTweenID] = !0), i);
  }, i.render = function (a, b, c) {
    var d,
        e,
        f,
        g,
        h = this,
        i = h._time,
        j = h._duration,
        k = h._rawPrevTime;
    if (a >= j - n && a >= 0) h._totalTime = h._time = j, h.ratio = h._ease._calcEnd ? h._ease.getRatio(1) : 1, h._reversed || (d = !0, e = "onComplete", c = c || h._timeline.autoRemoveChildren), 0 === j && (h._initted || !h.vars.lazy || c) && (h._startTime === h._timeline._duration && (a = 0), (0 > k || 0 >= a && a >= -n || k === n && "isPause" !== h.data) && k !== a && (c = !0, k > n && (e = "onReverseComplete")), h._rawPrevTime = g = !b || a || k === a ? a : n);else if (n > a) h._totalTime = h._time = 0, h.ratio = h._ease._calcEnd ? h._ease.getRatio(0) : 0, (0 !== i || 0 === j && k > 0) && (e = "onReverseComplete", d = h._reversed), a > -n ? a = 0 : 0 > a && (h._active = !1, 0 === j && (h._initted || !h.vars.lazy || c) && (k >= 0 && (k !== n || "isPause" !== h.data) && (c = !0), h._rawPrevTime = g = !b || a || k === a ? a : n)), (!h._initted || h._startAt && h._startAt.progress()) && (c = !0);else if (h._totalTime = h._time = a, h._easeType) {
      var l = a / j,
          m = h._easeType,
          o = h._easePower;
      (1 === m || 3 === m && l >= .5) && (l = 1 - l), 3 === m && (l *= 2), 1 === o ? l *= l : 2 === o ? l *= l * l : 3 === o ? l *= l * l * l : 4 === o && (l *= l * l * l * l), h.ratio = 1 === m ? 1 - l : 2 === m ? l : .5 > a / j ? l / 2 : 1 - l / 2;
    } else h.ratio = h._ease.getRatio(a / j);

    if (h._time !== i || c) {
      if (!h._initted) {
        if (h._init(), !h._initted || h._gc) return;
        if (!c && h._firstPT && (h.vars.lazy !== !1 && h._duration || h.vars.lazy && !h._duration)) return h._time = h._totalTime = i, h._rawPrevTime = k, K.push(h), void (h._lazy = [a, b]);
        h._time && !d ? h.ratio = h._ease.getRatio(h._time / j) : d && h._ease._calcEnd && (h.ratio = h._ease.getRatio(0 === h._time ? 0 : 1));
      }

      for (h._lazy !== !1 && (h._lazy = !1), h._active || !h._paused && h._time !== i && a >= 0 && (h._active = !0), 0 === i && (h._startAt && (a >= 0 ? h._startAt.render(a, !0, c) : e || (e = "_dummyGS")), h.vars.onStart && (0 !== h._time || 0 === j) && (b || h._callback("onStart"))), f = h._firstPT; f;) {
        f.f ? f.t[f.p](f.c * h.ratio + f.s) : f.t[f.p] = f.c * h.ratio + f.s, f = f._next;
      }

      h._onUpdate && (0 > a && h._startAt && a !== -1e-4 && h._startAt.render(a, !0, c), b || (h._time !== i || d || c) && h._callback("onUpdate")), e && (!h._gc || c) && (0 > a && h._startAt && !h._onUpdate && a !== -1e-4 && h._startAt.render(a, !0, c), d && (h._timeline.autoRemoveChildren && h._enabled(!1, !1), h._active = !1), !b && h.vars[e] && h._callback(e), 0 === j && h._rawPrevTime === n && g !== n && (h._rawPrevTime = 0));
    }
  }, i._kill = function (a, b, c) {
    if ("all" === a && (a = null), null == a && (null == b || b === this.target)) return this._lazy = !1, this._enabled(!1, !1);
    b = "string" != typeof b ? b || this._targets || this.target : H.selector(b) || b;
    var d,
        e,
        f,
        g,
        h,
        i,
        j,
        k,
        l,
        m = c && this._time && c._startTime === this._startTime && this._timeline === c._timeline,
        n = this._firstPT;
    if ((q(b) || I(b)) && "number" != typeof b[0]) for (d = b.length; --d > -1;) {
      this._kill(a, b[d], c) && (i = !0);
    } else {
      if (this._targets) {
        for (d = this._targets.length; --d > -1;) {
          if (b === this._targets[d]) {
            h = this._propLookup[d] || {}, this._overwrittenProps = this._overwrittenProps || [], e = this._overwrittenProps[d] = a ? this._overwrittenProps[d] || {} : "all";
            break;
          }
        }
      } else {
        if (b !== this.target) return !1;
        h = this._propLookup, e = this._overwrittenProps = a ? this._overwrittenProps || {} : "all";
      }

      if (h) {
        if (j = a || h, k = a !== e && "all" !== e && a !== h && ("object" != _typeof(a) || !a._tempKill), c && (H.onOverwrite || this.vars.onOverwrite)) {
          for (f in j) {
            h[f] && (l || (l = []), l.push(f));
          }

          if ((l || !a) && !ba(this, c, b, l)) return !1;
        }

        for (f in j) {
          (g = h[f]) && (m && (g.f ? g.t[g.p](g.s) : g.t[g.p] = g.s, i = !0), g.pg && g.t._kill(j) && (i = !0), g.pg && 0 !== g.t._overwriteProps.length || (g._prev ? g._prev._next = g._next : g === this._firstPT && (this._firstPT = g._next), g._next && (g._next._prev = g._prev), g._next = g._prev = null), delete h[f]), k && (e[f] = 1);
        }

        !this._firstPT && this._initted && n && this._enabled(!1, !1);
      }
    }
    return i;
  }, i.invalidate = function () {
    this._notifyPluginsOfEnabled && H._onPluginEvent("_onDisable", this);
    var a = this._time;
    return this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null, this._notifyPluginsOfEnabled = this._active = this._lazy = !1, this._propLookup = this._targets ? {} : [], E.prototype.invalidate.call(this), this.vars.immediateRender && (this._time = -n, this.render(a, !1, this.vars.lazy !== !1)), this;
  }, i._enabled = function (a, b) {
    if (k || j.wake(), a && this._gc) {
      var c,
          d = this._targets;
      if (d) for (c = d.length; --c > -1;) {
        this._siblings[c] = aa(d[c], this, !0);
      } else this._siblings = aa(this.target, this, !0);
    }

    return E.prototype._enabled.call(this, a, b), this._notifyPluginsOfEnabled && this._firstPT ? H._onPluginEvent(a ? "_onEnable" : "_onDisable", this) : !1;
  }, H.to = function (a, b, c) {
    return new H(a, b, c);
  }, H.from = function (a, b, c) {
    return c.runBackwards = !0, c.immediateRender = 0 != c.immediateRender, new H(a, b, c);
  }, H.fromTo = function (a, b, c, d) {
    return d.startAt = c, d.immediateRender = 0 != d.immediateRender && 0 != c.immediateRender, new H(a, b, d);
  }, H.delayedCall = function (a, b, c, d, e) {
    return new H(b, 0, {
      delay: a,
      onComplete: b,
      onCompleteParams: c,
      callbackScope: d,
      onReverseComplete: b,
      onReverseCompleteParams: c,
      immediateRender: !1,
      lazy: !1,
      useFrames: e,
      overwrite: 0
    });
  }, H.set = function (a, b) {
    return new H(a, 0, b);
  }, H.getTweensOf = function (a, b) {
    if (null == a) return [];
    a = "string" != typeof a ? a : H.selector(a) || a;
    var c, d, e, f;

    if ((q(a) || I(a)) && "number" != typeof a[0]) {
      for (c = a.length, d = []; --c > -1;) {
        d = d.concat(H.getTweensOf(a[c], b));
      }

      for (c = d.length; --c > -1;) {
        for (f = d[c], e = c; --e > -1;) {
          f === d[e] && d.splice(c, 1);
        }
      }
    } else if (a._gsTweenID) for (d = aa(a).concat(), c = d.length; --c > -1;) {
      (d[c]._gc || b && !d[c].isActive()) && d.splice(c, 1);
    }

    return d || [];
  }, H.killTweensOf = H.killDelayedCallsTo = function (a, b, c) {
    "object" == _typeof(b) && (c = b, b = !1);

    for (var d = H.getTweensOf(a, b), e = d.length; --e > -1;) {
      d[e]._kill(c, a);
    }
  };
  var ea = u("plugins.TweenPlugin", function (a, b) {
    this._overwriteProps = (a || "").split(","), this._propName = this._overwriteProps[0], this._priority = b || 0, this._super = ea.prototype;
  }, !0);

  if (i = ea.prototype, ea.version = "1.19.0", ea.API = 2, i._firstPT = null, i._addTween = R, i.setRatio = O, i._kill = function (a) {
    var b,
        c = this._overwriteProps,
        d = this._firstPT;
    if (null != a[this._propName]) this._overwriteProps = [];else for (b = c.length; --b > -1;) {
      null != a[c[b]] && c.splice(b, 1);
    }

    for (; d;) {
      null != a[d.n] && (d._next && (d._next._prev = d._prev), d._prev ? (d._prev._next = d._next, d._prev = null) : this._firstPT === d && (this._firstPT = d._next)), d = d._next;
    }

    return !1;
  }, i._mod = i._roundProps = function (a) {
    for (var b, c = this._firstPT; c;) {
      b = a[this._propName] || null != c.n && a[c.n.split(this._propName + "_").join("")], b && "function" == typeof b && (2 === c.f ? c.t._applyPT.m = b : c.m = b), c = c._next;
    }
  }, H._onPluginEvent = function (a, b) {
    var c,
        d,
        e,
        f,
        g,
        h = b._firstPT;

    if ("_onInitAllProps" === a) {
      for (; h;) {
        for (g = h._next, d = e; d && d.pr > h.pr;) {
          d = d._next;
        }

        (h._prev = d ? d._prev : f) ? h._prev._next = h : e = h, (h._next = d) ? d._prev = h : f = h, h = g;
      }

      h = b._firstPT = e;
    }

    for (; h;) {
      h.pg && "function" == typeof h.t[a] && h.t[a]() && (c = !0), h = h._next;
    }

    return c;
  }, ea.activate = function (a) {
    for (var b = a.length; --b > -1;) {
      a[b].API === ea.API && (T[new a[b]()._propName] = a[b]);
    }

    return !0;
  }, t.plugin = function (a) {
    if (!(a && a.propName && a.init && a.API)) throw "illegal plugin definition.";
    var b,
        c = a.propName,
        d = a.priority || 0,
        e = a.overwriteProps,
        f = {
      init: "_onInitTween",
      set: "setRatio",
      kill: "_kill",
      round: "_mod",
      mod: "_mod",
      initAll: "_onInitAllProps"
    },
        g = u("plugins." + c.charAt(0).toUpperCase() + c.substr(1) + "Plugin", function () {
      ea.call(this, c, d), this._overwriteProps = e || [];
    }, a.global === !0),
        h = g.prototype = new ea(c);
    h.constructor = g, g.API = a.API;

    for (b in f) {
      "function" == typeof a[b] && (h[f[b]] = a[b]);
    }

    return g.version = a.version, ea.activate([g]), g;
  }, g = a._gsQueue) {
    for (h = 0; h < g.length; h++) {
      g[h]();
    }

    for (i in r) {
      r[i].func || a.console.log("GSAP encountered missing dependency: " + i);
    }
  }

  k = !1;
}("undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window, "TweenMax");
/*!
 * VERSION: 1.9.2
 * DATE: 2019-02-07
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2019, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/

var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;

(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
  "use strict";

  var a = (_gsScope.document || {}).documentElement,
      b = _gsScope,
      c = function c(_c2, d) {
    var e = "x" === d ? "Width" : "Height",
        f = "scroll" + e,
        g = "client" + e,
        h = document.body;
    return _c2 === b || _c2 === a || _c2 === h ? Math.max(a[f], h[f]) - (b["inner" + e] || a[g] || h[g]) : _c2[f] - _c2["offset" + e];
  },
      d = function d(a) {
    return "string" == typeof a && (a = TweenLite.selector(a)), a.length && a !== b && a[0] && a[0].style && !a.nodeType && (a = a[0]), a === b || a.nodeType && a.style ? a : null;
  },
      e = function e(c, d) {
    var e = "scroll" + ("x" === d ? "Left" : "Top");
    return c === b && (null != c.pageXOffset ? e = "page" + d.toUpperCase() + "Offset" : c = null != a[e] ? a : document.body), function () {
      return c[e];
    };
  },
      f = function f(c, _f) {
    var g = d(c).getBoundingClientRect(),
        h = document.body,
        i = !_f || _f === b || _f === h,
        j = i ? {
      top: a.clientTop - (window.pageYOffset || a.scrollTop || h.scrollTop || 0),
      left: a.clientLeft - (window.pageXOffset || a.scrollLeft || h.scrollLeft || 0)
    } : _f.getBoundingClientRect(),
        k = {
      x: g.left - j.left,
      y: g.top - j.top
    };
    return !i && _f && (k.x += e(_f, "x")(), k.y += e(_f, "y")()), k;
  },
      g = function g(a, b, d, e) {
    var g = _typeof(a);

    return isNaN(a) ? "string" === g && "=" === a.charAt(1) ? parseInt(a.charAt(0) + "1", 10) * parseFloat(a.substr(2)) + e : "max" === a ? c(b, d) : Math.min(c(b, d), f(a, b)[d]) : parseFloat(a);
  },
      h = _gsScope._gsDefine.plugin({
    propName: "scrollTo",
    API: 2,
    global: !0,
    version: "1.9.2",
    init: function init(a, c, d) {
      return this._wdw = a === b, this._target = a, this._tween = d, "object" != _typeof(c) ? (c = {
        y: c
      }, "string" == typeof c.y && "max" !== c.y && "=" !== c.y.charAt(1) && (c.x = c.y)) : c.nodeType && (c = {
        y: c,
        x: c
      }), this.vars = c, this._autoKill = c.autoKill !== !1, this.getX = e(a, "x"), this.getY = e(a, "y"), this.x = this.xPrev = this.getX(), this.y = this.yPrev = this.getY(), null != c.x ? (this._addTween(this, "x", this.x, g(c.x, a, "x", this.x) - (c.offsetX || 0), "scrollTo_x", !0), this._overwriteProps.push("scrollTo_x")) : this.skipX = !0, null != c.y ? (this._addTween(this, "y", this.y, g(c.y, a, "y", this.y) - (c.offsetY || 0), "scrollTo_y", !0), this._overwriteProps.push("scrollTo_y")) : this.skipY = !0, !0;
    },
    set: function set(a) {
      this._super.setRatio.call(this, a);

      var d = this._wdw || !this.skipX ? this.getX() : this.xPrev,
          e = this._wdw || !this.skipY ? this.getY() : this.yPrev,
          f = e - this.yPrev,
          g = d - this.xPrev,
          i = h.autoKillThreshold;
      this.x < 0 && (this.x = 0), this.y < 0 && (this.y = 0), this._autoKill && (!this.skipX && (g > i || -i > g) && d < c(this._target, "x") && (this.skipX = !0), !this.skipY && (f > i || -i > f) && e < c(this._target, "y") && (this.skipY = !0), this.skipX && this.skipY && (this._tween.kill(), this.vars.onAutoKill && this.vars.onAutoKill.apply(this.vars.onAutoKillScope || this._tween, this.vars.onAutoKillParams || []))), this._wdw ? b.scrollTo(this.skipX ? d : this.x, this.skipY ? e : this.y) : (this.skipY || (this._target.scrollTop = this.y), this.skipX || (this._target.scrollLeft = this.x)), this.xPrev = this.x, this.yPrev = this.y;
    }
  }),
      i = h.prototype;

  h.max = c, h.getOffset = f, h.buildGetter = e, h.autoKillThreshold = 7, i._kill = function (a) {
    return a.scrollTo_x && (this.skipX = !0), a.scrollTo_y && (this.skipY = !0), this._super._kill.call(this, a);
  };
}), _gsScope._gsDefine && _gsScope._gsQueue.pop()(), function (a) {
  "use strict";

  var b = function b() {
    return (_gsScope.GreenSockGlobals || _gsScope)[a];
  };

  "undefined" != typeof module && module.exports ? (require("../TweenLite.min.js"), module.exports = b()) : "function" == typeof define && define.amd && define(["TweenLite"], b);
}("ScrollToPlugin");
/*!
 * VERSION: 0.2.2
 * DATE: 2018-02-15
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2019, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 *
 * @author: Jack Doyle, jack@greensock.com
 **/

var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;

(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
  "use strict";

  _gsScope._gsDefine("easing.CustomEase", ["easing.Ease"], function (a) {
    var b = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,
        c = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,
        d = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/gi,
        e = /[cLlsS]/g,
        f = "CustomEase only accepts Cubic Bezier data.",
        g = function g(a, b, c, d, e, f, h, i, j, k, l) {
      var m,
          n = (a + c) / 2,
          o = (b + d) / 2,
          p = (c + e) / 2,
          q = (d + f) / 2,
          r = (e + h) / 2,
          s = (f + i) / 2,
          t = (n + p) / 2,
          u = (o + q) / 2,
          v = (p + r) / 2,
          w = (q + s) / 2,
          x = (t + v) / 2,
          y = (u + w) / 2,
          z = h - a,
          A = i - b,
          B = Math.abs((c - h) * A - (d - i) * z),
          C = Math.abs((e - h) * A - (f - i) * z);
      return k || (k = [{
        x: a,
        y: b
      }, {
        x: h,
        y: i
      }], l = 1), k.splice(l || k.length - 1, 0, {
        x: x,
        y: y
      }), (B + C) * (B + C) > j * (z * z + A * A) && (m = k.length, g(a, b, n, o, t, u, x, y, j, k, l), g(x, y, v, w, r, s, h, i, j, k, l + 1 + (k.length - m))), k;
    },
        h = function h(a) {
      var b,
          e,
          g,
          h,
          i,
          j,
          k,
          l,
          m,
          n,
          o,
          p = (a + "").replace(d, function (a) {
        var b = +a;
        return 1e-4 > b && b > -1e-4 ? 0 : b;
      }).match(c) || [],
          q = [],
          r = 0,
          s = 0,
          t = p.length,
          u = 2;

      for (b = 0; t > b; b++) {
        if (m = h, isNaN(p[b]) ? (h = p[b].toUpperCase(), i = h !== p[b]) : b--, e = +p[b + 1], g = +p[b + 2], i && (e += r, g += s), b || (k = e, l = g), "M" === h) j && j.length < 8 && (q.length -= 1, u = 0), r = k = e, s = l = g, j = [e, g], u = 2, q.push(j), b += 2, h = "L";else if ("C" === h) j || (j = [0, 0]), j[u++] = e, j[u++] = g, i || (r = s = 0), j[u++] = r + 1 * p[b + 3], j[u++] = s + 1 * p[b + 4], j[u++] = r += 1 * p[b + 5], j[u++] = s += 1 * p[b + 6], b += 6;else if ("S" === h) "C" === m || "S" === m ? (n = r - j[u - 4], o = s - j[u - 3], j[u++] = r + n, j[u++] = s + o) : (j[u++] = r, j[u++] = s), j[u++] = e, j[u++] = g, i || (r = s = 0), j[u++] = r += 1 * p[b + 3], j[u++] = s += 1 * p[b + 4], b += 4;else {
          if ("L" !== h && "Z" !== h) throw f;
          "Z" === h && (e = k, g = l, j.closed = !0), ("L" === h || Math.abs(r - e) > .5 || Math.abs(s - g) > .5) && (j[u++] = r + (e - r) / 3, j[u++] = s + (g - s) / 3, j[u++] = r + 2 * (e - r) / 3, j[u++] = s + 2 * (g - s) / 3, j[u++] = e, j[u++] = g, "L" === h && (b += 2)), r = e, s = g;
        }
      }

      return q[0];
    },
        i = function i(a) {
      var b,
          c = a.length,
          d = 999999999999;

      for (b = 1; c > b; b += 6) {
        +a[b] < d && (d = +a[b]);
      }

      return d;
    },
        j = function j(a, b, c) {
      c || 0 === c || (c = Math.max(+a[a.length - 1], +a[1]));
      var d,
          e = -1 * +a[0],
          f = -c,
          g = a.length,
          h = 1 / (+a[g - 2] + e),
          j = -b || (Math.abs(+a[g - 1] - +a[1]) < .01 * (+a[g - 2] - +a[0]) ? i(a) + f : +a[g - 1] + f);

      for (j = j ? 1 / j : -h, d = 0; g > d; d += 2) {
        a[d] = (+a[d] + e) * h, a[d + 1] = (+a[d + 1] + f) * j;
      }
    },
        k = function k(a) {
      var b = this.lookup[a * this.l | 0] || this.lookup[this.l - 1];
      return b.nx < a && (b = b.n), b.y + (a - b.x) / b.cx * b.cy;
    },
        l = function l(b, c, d) {
      this._calcEnd = !0, this.id = b, b && (a.map[b] = this), this.getRatio = k, this.setData(c, d);
    },
        m = l.prototype = new a();

    return m.constructor = l, m.setData = function (a, c) {
      a = a || "0,0,1,1";
      var d,
          i,
          k,
          l,
          m,
          n,
          o,
          p,
          q,
          r,
          s = a.match(b),
          t = 1,
          u = [];
      if (c = c || {}, r = c.precision || 1, this.data = a, this.lookup = [], this.points = u, this.fast = 1 >= r, (e.test(a) || -1 !== a.indexOf("M") && -1 === a.indexOf("C")) && (s = h(a)), d = s.length, 4 === d) s.unshift(0, 0), s.push(1, 1), d = 8;else if ((d - 2) % 6) throw f;

      for ((0 !== +s[0] || 1 !== +s[d - 2]) && j(s, c.height, c.originY), this.rawBezier = s, l = 2; d > l; l += 6) {
        i = {
          x: +s[l - 2],
          y: +s[l - 1]
        }, k = {
          x: +s[l + 4],
          y: +s[l + 5]
        }, u.push(i, k), g(i.x, i.y, +s[l], +s[l + 1], +s[l + 2], +s[l + 3], k.x, k.y, 1 / (2e5 * r), u, u.length - 1);
      }

      for (d = u.length, l = 0; d > l; l++) {
        o = u[l], p = u[l - 1] || o, o.x > p.x || p.y !== o.y && p.x === o.x || o === p ? (p.cx = o.x - p.x, p.cy = o.y - p.y, p.n = o, p.nx = o.x, this.fast && l > 1 && Math.abs(p.cy / p.cx - u[l - 2].cy / u[l - 2].cx) > 2 && (this.fast = !1), p.cx < t && (p.cx ? t = p.cx : (p.cx = .001, l === d - 1 && (p.x -= .001, t = Math.min(t, .001), this.fast = !1)))) : (u.splice(l--, 1), d--);
      }

      if (d = 1 / t + 1 | 0, this.l = d, m = 1 / d, n = 0, o = u[0], this.fast) {
        for (l = 0; d > l; l++) {
          q = l * m, o.nx < q && (o = u[++n]), i = o.y + (q - o.x) / o.cx * o.cy, this.lookup[l] = {
            x: q,
            cx: m,
            y: i,
            cy: 0,
            nx: 9
          }, l && (this.lookup[l - 1].cy = i - this.lookup[l - 1].y);
        }

        this.lookup[d - 1].cy = u[u.length - 1].y - i;
      } else {
        for (l = 0; d > l; l++) {
          o.nx < l * m && (o = u[++n]), this.lookup[l] = o;
        }

        n < u.length - 1 && (this.lookup[l - 1] = u[u.length - 2]);
      }

      return this._calcEnd = 1 !== u[u.length - 1].y || 0 !== u[0].y, this;
    }, m.getRatio = k, m.getSVGData = function (a) {
      return l.getSVGData(this, a);
    }, l.create = function (a, b, c) {
      return new l(a, b, c);
    }, l.version = "0.2.2", l.bezierToPoints = g, l.get = function (b) {
      return a.map[b];
    }, l.getSVGData = function (b, c) {
      c = c || {};
      var d,
          e,
          f,
          g,
          h,
          i,
          j,
          k,
          l,
          m,
          n = 1e3,
          o = c.width || 100,
          p = c.height || 100,
          q = c.x || 0,
          r = (c.y || 0) + p,
          s = c.path;

      if (c.invert && (p = -p, r = 0), b = b.getRatio ? b : a.map[b] || console.log("No ease found: ", b), b.rawBezier) {
        for (d = [], j = b.rawBezier.length, f = 0; j > f; f += 2) {
          d.push(((q + b.rawBezier[f] * o) * n | 0) / n + "," + ((r + b.rawBezier[f + 1] * -p) * n | 0) / n);
        }

        d[0] = "M" + d[0], d[1] = "C" + d[1];
      } else for (d = ["M" + q + "," + r], j = Math.max(5, 200 * (c.precision || 1)), g = 1 / j, j += 2, k = 5 / j, l = ((q + g * o) * n | 0) / n, m = ((r + b.getRatio(g) * -p) * n | 0) / n, e = (m - r) / (l - q), f = 2; j > f; f++) {
        h = ((q + f * g * o) * n | 0) / n, i = ((r + b.getRatio(f * g) * -p) * n | 0) / n, (Math.abs((i - m) / (h - l) - e) > k || f === j - 1) && (d.push(l + "," + m), e = (i - m) / (h - l)), l = h, m = i;
      }

      return s && ("string" == typeof s ? document.querySelector(s) : s).setAttribute("d", d.join(" ")), d.join(" ");
    }, l;
  }, !0);
}), _gsScope._gsDefine && _gsScope._gsQueue.pop()(), function (a) {
  "use strict";

  var b = function b() {
    return (_gsScope.GreenSockGlobals || _gsScope)[a];
  };

  "undefined" != typeof module && module.exports ? (require("../TweenLite.min.js"), module.exports = b()) : "function" == typeof define && define.amd && define(["TweenLite"], b);
}("CustomEase");
/*!
 * VERSION: 0.2.1
 * DATE: 2019-02-07
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2019, GreenSock. All rights reserved.
 * DrawSVGPlugin is a Club GreenSock membership benefit; You must have a valid membership to use
 * this code without violating the terms of use. Visit http://greensock.com/club/ to sign up or get more details.
 * This work is subject to the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */

var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;

(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
  "use strict";

  function a(a, b, c, d, e, f) {
    return c = (parseFloat(c || 0) - parseFloat(a || 0)) * e, d = (parseFloat(d || 0) - parseFloat(b || 0)) * f, Math.sqrt(c * c + d * d);
  }

  function b(a) {
    return "string" != typeof a && a.nodeType || (a = _gsScope.TweenLite.selector(a), a.length && (a = a[0])), a;
  }

  function c(a, b, c) {
    var d,
        e,
        f = a.indexOf(" ");
    return -1 === f ? (d = void 0 !== c ? c + "" : a, e = a) : (d = a.substr(0, f), e = a.substr(f + 1)), d = -1 !== d.indexOf("%") ? parseFloat(d) / 100 * b : parseFloat(d), e = -1 !== e.indexOf("%") ? parseFloat(e) / 100 * b : parseFloat(e), d > e ? [e, d] : [d, e];
  }

  function d(c) {
    if (!c) return 0;
    c = b(c);
    var d,
        e,
        f,
        g,
        h,
        i,
        k,
        m = c.tagName.toLowerCase(),
        n = 1,
        o = 1;
    "non-scaling-stroke" === c.getAttribute("vector-effect") && (o = c.getScreenCTM(), n = Math.sqrt(o.a * o.a + o.b * o.b), o = Math.sqrt(o.d * o.d + o.c * o.c));

    try {
      e = c.getBBox();
    } catch (p) {
      console.log("Error: Some browsers like Firefox won't report measurements of invisible elements (like display:none or masks inside defs).");
    }

    if (e && (e.width || e.height) || !l[m] || (e = {
      width: parseFloat(c.getAttribute(l[m][0])),
      height: parseFloat(c.getAttribute(l[m][1]))
    }, "rect" !== m && "line" !== m && (e.width *= 2, e.height *= 2), "line" === m && (e.x = parseFloat(c.getAttribute("x1")), e.y = parseFloat(c.getAttribute("y1")), e.width = Math.abs(e.width - e.x), e.height = Math.abs(e.height - e.y))), "path" === m) g = c.style.strokeDasharray, c.style.strokeDasharray = "none", d = c.getTotalLength() || 0, n !== o && console.log("Warning: <path> length cannot be measured accurately when vector-effect is non-scaling-stroke and the element isn't proportionally scaled."), d *= (n + o) / 2, c.style.strokeDasharray = g;else if ("rect" === m) d = 2 * e.width * n + 2 * e.height * o;else if ("line" === m) d = a(e.x, e.y, e.x + e.width, e.y + e.height, n, o);else if ("polyline" === m || "polygon" === m) for (f = c.getAttribute("points").match(j) || [], "polygon" === m && f.push(f[0], f[1]), d = 0, h = 2; h < f.length; h += 2) {
      d += a(f[h - 2], f[h - 1], f[h], f[h + 1], n, o) || 0;
    } else ("circle" === m || "ellipse" === m) && (i = e.width / 2 * n, k = e.height / 2 * o, d = Math.PI * (3 * (i + k) - Math.sqrt((3 * i + k) * (i + 3 * k))));
    return d || 0;
  }

  function e(a, c) {
    if (!a) return [0, 0];
    a = b(a), c = c || d(a) + 1;
    var e = i(a),
        f = e.strokeDasharray || "",
        g = parseFloat(e.strokeDashoffset),
        h = f.indexOf(",");
    return 0 > h && (h = f.indexOf(" ")), f = 0 > h ? c : parseFloat(f.substr(0, h)) || 1e-5, f > c && (f = c), [Math.max(0, -g), Math.max(0, f - g)];
  }

  var f,
      g = _gsScope.document,
      h = "undefined" != typeof window ? window : g.defaultView || {
    getComputedStyle: function getComputedStyle() {}
  },
      i = function i(a) {
    return h.getComputedStyle(a);
  },
      j = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,
      k = -1 !== ((_gsScope.navigator || {}).userAgent || "").indexOf("Edge"),
      l = {
    rect: ["width", "height"],
    circle: ["r", "r"],
    ellipse: ["rx", "ry"],
    line: ["x2", "y2"]
  };

  f = _gsScope._gsDefine.plugin({
    propName: "drawSVG",
    API: 2,
    version: "0.2.1",
    global: !0,
    overwriteProps: ["drawSVG"],
    init: function init(a, b, f, g) {
      if (!a.getBBox) return !1;
      var h,
          j,
          l,
          m,
          n = d(a) + 1;
      return this._style = a.style, this._target = a, "function" == typeof b && (b = b(g, a)), b === !0 || "true" === b ? b = "0 100%" : b ? -1 === (b + "").indexOf(" ") && (b = "0 " + b) : b = "0 0", h = e(a, n), j = c(b, n, h[0]), this._length = n + 10, 0 === h[0] && 0 === j[0] ? (l = Math.max(1e-5, j[1] - n), this._dash = n + l, this._offset = n - h[1] + l, this._offsetPT = this._addTween(this, "_offset", this._offset, n - j[1] + l, "drawSVG")) : (this._dash = h[1] - h[0] || 1e-6, this._offset = -h[0], this._dashPT = this._addTween(this, "_dash", this._dash, j[1] - j[0] || 1e-5, "drawSVG"), this._offsetPT = this._addTween(this, "_offset", this._offset, -j[0], "drawSVG")), k && (m = i(a), m.strokeLinecap !== m.strokeLinejoin && (j = parseFloat(m.strokeMiterlimit), this._addTween(a.style, "strokeMiterlimit", j, j + 1e-4, "strokeMiterlimit"))), this._live = "non-scaling-stroke" === a.getAttribute("vector-effect") || -1 !== (b + "").indexOf("live"), !0;
    },
    set: function set(a) {
      if (this._firstPT) {
        if (this._live) {
          var b,
              c = d(this._target) + 11;
          c !== this._length && (b = c / this._length, this._length = c, this._offsetPT.s *= b, this._offsetPT.c *= b, this._dashPT ? (this._dashPT.s *= b, this._dashPT.c *= b) : this._dash *= b);
        }

        this._super.setRatio.call(this, a), this._style.strokeDashoffset = this._offset, 1 === a || 0 === a ? this._style.strokeDasharray = this._offset < .001 && this._length - this._dash <= 10 ? "none" : this._offset === this._dash ? "0px, 999999px" : this._dash + "px," + this._length + "px" : this._style.strokeDasharray = this._dash + "px," + this._length + "px";
      }
    }
  }), f.getLength = d, f.getPosition = e;
}), _gsScope._gsDefine && _gsScope._gsQueue.pop()(), function (a) {
  "use strict";

  var b = function b() {
    return (_gsScope.GreenSockGlobals || _gsScope)[a];
  };

  "undefined" != typeof module && module.exports ? (require("../TweenLite.min.js"), module.exports = b()) : "function" == typeof define && define.amd && define(["TweenLite"], b);
}("DrawSVGPlugin");
/*!
 * Font Awesome Free 5.13.0 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 */

!function () {
  "use strict";

  var c = {},
      l = {};

  try {
    "undefined" != typeof window && (c = window), "undefined" != typeof document && (l = document);
  } catch (c) {}

  var h = (c.navigator || {}).userAgent,
      z = void 0 === h ? "" : h,
      v = c,
      a = l,
      m = (v.document, !!a.documentElement && !!a.head && "function" == typeof a.addEventListener && a.createElement, ~z.indexOf("MSIE") || z.indexOf("Trident/"), "___FONT_AWESOME___"),
      s = function () {
    try {
      return !0;
    } catch (c) {
      return !1;
    }
  }();

  var e = v || {};
  e[m] || (e[m] = {}), e[m].styles || (e[m].styles = {}), e[m].hooks || (e[m].hooks = {}), e[m].shims || (e[m].shims = []);
  var t = e[m];

  function M(c, z) {
    var l = (2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {}).skipHooks,
        h = void 0 !== l && l,
        v = Object.keys(z).reduce(function (c, l) {
      var h = z[l];
      return !!h.icon ? c[h.iconName] = h.icon : c[l] = h, c;
    }, {});
    "function" != typeof t.hooks.addPack || h ? t.styles[c] = function (v) {
      for (var c = 1; c < arguments.length; c++) {
        var a = null != arguments[c] ? arguments[c] : {},
            l = Object.keys(a);
        "function" == typeof Object.getOwnPropertySymbols && (l = l.concat(Object.getOwnPropertySymbols(a).filter(function (c) {
          return Object.getOwnPropertyDescriptor(a, c).enumerable;
        }))), l.forEach(function (c) {
          var l, h, z;
          l = v, z = a[h = c], h in l ? Object.defineProperty(l, h, {
            value: z,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : l[h] = z;
        });
      }

      return v;
    }({}, t.styles[c] || {}, v) : t.hooks.addPack(c, v), "fas" === c && M("fa", z);
  }

  var f = {
    facebook: [512, 512, [], "f09a", "M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"],
    "facebook-f": [320, 512, [], "f39e", "M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"],
    "facebook-messenger": [512, 512, [], "f39f", "M256.55 8C116.52 8 8 110.34 8 248.57c0 72.3 29.71 134.78 78.07 177.94 8.35 7.51 6.63 11.86 8.05 58.23A19.92 19.92 0 0 0 122 502.31c52.91-23.3 53.59-25.14 62.56-22.7C337.85 521.8 504 423.7 504 248.57 504 110.34 396.59 8 256.55 8zm149.24 185.13l-73 115.57a37.37 37.37 0 0 1-53.91 9.93l-58.08-43.47a15 15 0 0 0-18 0l-78.37 59.44c-10.46 7.93-24.16-4.6-17.11-15.67l73-115.57a37.36 37.36 0 0 1 53.91-9.93l58.06 43.46a15 15 0 0 0 18 0l78.41-59.38c10.44-7.98 24.14 4.54 17.09 15.62z"],
    "facebook-square": [448, 512, [], "f082", "M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z"]
  };
  !function (c) {
    try {
      c();
    } catch (c) {
      if (!s) throw c;
    }
  }(function () {
    M("fab", f);
  });
}(), function () {
  "use strict";

  var c = {},
      l = {};

  try {
    "undefined" != typeof window && (c = window), "undefined" != typeof document && (l = document);
  } catch (c) {}

  var h = (c.navigator || {}).userAgent,
      z = void 0 === h ? "" : h,
      v = c,
      a = l,
      m = (v.document, !!a.documentElement && !!a.head && "function" == typeof a.addEventListener && a.createElement, ~z.indexOf("MSIE") || z.indexOf("Trident/"), "___FONT_AWESOME___"),
      s = function () {
    try {
      return !0;
    } catch (c) {
      return !1;
    }
  }();

  var e = v || {};
  e[m] || (e[m] = {}), e[m].styles || (e[m].styles = {}), e[m].hooks || (e[m].hooks = {}), e[m].shims || (e[m].shims = []);
  var t = e[m];

  function M(c, z) {
    var l = (2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {}).skipHooks,
        h = void 0 !== l && l,
        v = Object.keys(z).reduce(function (c, l) {
      var h = z[l];
      return !!h.icon ? c[h.iconName] = h.icon : c[l] = h, c;
    }, {});
    "function" != typeof t.hooks.addPack || h ? t.styles[c] = function (v) {
      for (var c = 1; c < arguments.length; c++) {
        var a = null != arguments[c] ? arguments[c] : {},
            l = Object.keys(a);
        "function" == typeof Object.getOwnPropertySymbols && (l = l.concat(Object.getOwnPropertySymbols(a).filter(function (c) {
          return Object.getOwnPropertyDescriptor(a, c).enumerable;
        }))), l.forEach(function (c) {
          var l, h, z;
          l = v, z = a[h = c], h in l ? Object.defineProperty(l, h, {
            value: z,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : l[h] = z;
        });
      }

      return v;
    }({}, t.styles[c] || {}, v) : t.hooks.addPack(c, v), "fas" === c && M("fa", z);
  }

  var f = {
    heart: [512, 512, [], "f004", "M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z"]
  };
  !function (c) {
    try {
      c();
    } catch (c) {
      if (!s) throw c;
    }
  }(function () {
    M("far", f);
  });
}(), function () {
  "use strict";

  var c = {},
      l = {};

  try {
    "undefined" != typeof window && (c = window), "undefined" != typeof document && (l = document);
  } catch (c) {}

  var h = (c.navigator || {}).userAgent,
      z = void 0 === h ? "" : h,
      v = c,
      a = l,
      m = (v.document, !!a.documentElement && !!a.head && "function" == typeof a.addEventListener && a.createElement, ~z.indexOf("MSIE") || z.indexOf("Trident/"), "___FONT_AWESOME___"),
      s = function () {
    try {
      return !0;
    } catch (c) {
      return !1;
    }
  }();

  var e = v || {};
  e[m] || (e[m] = {}), e[m].styles || (e[m].styles = {}), e[m].hooks || (e[m].hooks = {}), e[m].shims || (e[m].shims = []);
  var t = e[m];

  function M(c, z) {
    var l = (2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {}).skipHooks,
        h = void 0 !== l && l,
        v = Object.keys(z).reduce(function (c, l) {
      var h = z[l];
      return !!h.icon ? c[h.iconName] = h.icon : c[l] = h, c;
    }, {});
    "function" != typeof t.hooks.addPack || h ? t.styles[c] = function (v) {
      for (var c = 1; c < arguments.length; c++) {
        var a = null != arguments[c] ? arguments[c] : {},
            l = Object.keys(a);
        "function" == typeof Object.getOwnPropertySymbols && (l = l.concat(Object.getOwnPropertySymbols(a).filter(function (c) {
          return Object.getOwnPropertyDescriptor(a, c).enumerable;
        }))), l.forEach(function (c) {
          var l, h, z;
          l = v, z = a[h = c], h in l ? Object.defineProperty(l, h, {
            value: z,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : l[h] = z;
        });
      }

      return v;
    }({}, t.styles[c] || {}, v) : t.hooks.addPack(c, v), "fas" === c && M("fa", z);
  }

  var f = {
    "angle-down": [320, 512, [], "f107", "M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"],
    "angle-left": [256, 512, [], "f104", "M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"],
    "angle-right": [256, 512, [], "f105", "M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"],
    "angle-up": [320, 512, [], "f106", "M177 159.7l136 136c9.4 9.4 9.4 24.6 0 33.9l-22.6 22.6c-9.4 9.4-24.6 9.4-33.9 0L160 255.9l-96.4 96.4c-9.4 9.4-24.6 9.4-33.9 0L7 329.7c-9.4-9.4-9.4-24.6 0-33.9l136-136c9.4-9.5 24.6-9.5 34-.1z"],
    heart: [512, 512, [], "f004", "M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"]
  };
  !function (c) {
    try {
      c();
    } catch (c) {
      if (!s) throw c;
    }
  }(function () {
    M("fas", f);
  });
}(), function () {
  "use strict";

  function a(c) {
    return (a = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (c) {
      return _typeof(c);
    } : function (c) {
      return c && "function" == typeof Symbol && c.constructor === Symbol && c !== Symbol.prototype ? "symbol" : _typeof(c);
    })(c);
  }

  function v(c, l) {
    for (var h = 0; h < l.length; h++) {
      var z = l[h];
      z.enumerable = z.enumerable || !1, z.configurable = !0, "value" in z && (z.writable = !0), Object.defineProperty(c, z.key, z);
    }
  }

  function G(v) {
    for (var c = 1; c < arguments.length; c++) {
      var a = null != arguments[c] ? arguments[c] : {},
          l = Object.keys(a);
      "function" == typeof Object.getOwnPropertySymbols && (l = l.concat(Object.getOwnPropertySymbols(a).filter(function (c) {
        return Object.getOwnPropertyDescriptor(a, c).enumerable;
      }))), l.forEach(function (c) {
        var l, h, z;
        l = v, z = a[h = c], h in l ? Object.defineProperty(l, h, {
          value: z,
          enumerable: !0,
          configurable: !0,
          writable: !0
        }) : l[h] = z;
      });
    }

    return v;
  }

  function n(c, l) {
    return function (c) {
      if (Array.isArray(c)) return c;
    }(c) || function (c, l) {
      var h = [],
          z = !0,
          v = !1,
          a = void 0;

      try {
        for (var m, s = c[Symbol.iterator](); !(z = (m = s.next()).done) && (h.push(m.value), !l || h.length !== l); z = !0) {
          ;
        }
      } catch (c) {
        v = !0, a = c;
      } finally {
        try {
          z || null == s.return || s.return();
        } finally {
          if (v) throw a;
        }
      }

      return h;
    }(c, l) || function () {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }();
  }

  function r(c) {
    return function (c) {
      if (Array.isArray(c)) {
        for (var l = 0, h = new Array(c.length); l < c.length; l++) {
          h[l] = c[l];
        }

        return h;
      }
    }(c) || function (c) {
      if (Symbol.iterator in Object(c) || "[object Arguments]" === Object.prototype.toString.call(c)) return Array.from(c);
    }(c) || function () {
      throw new TypeError("Invalid attempt to spread non-iterable instance");
    }();
  }

  var c = function c() {},
      l = {},
      h = {},
      z = null,
      m = {
    mark: c,
    measure: c
  };

  try {
    "undefined" != typeof window && (l = window), "undefined" != typeof document && (h = document), "undefined" != typeof MutationObserver && (z = MutationObserver), "undefined" != typeof performance && (m = performance);
  } catch (c) {}

  var s = (l.navigator || {}).userAgent,
      e = void 0 === s ? "" : s,
      V = l,
      o = h,
      t = z,
      M = m,
      f = !!V.document,
      H = !!o.documentElement && !!o.head && "function" == typeof o.addEventListener && "function" == typeof o.createElement,
      p = ~e.indexOf("MSIE") || ~e.indexOf("Trident/"),
      i = "___FONT_AWESOME___",
      b = 16,
      C = "fa",
      L = "svg-inline--fa",
      J = "data-fa-i2svg",
      d = "data-fa-pseudo-element",
      u = "data-fa-pseudo-element-pending",
      g = "data-prefix",
      A = "data-icon",
      S = "fontawesome-i2svg",
      y = "async",
      w = ["HTML", "HEAD", "STYLE", "SCRIPT"],
      k = function () {
    try {
      return !0;
    } catch (c) {
      return !1;
    }
  }(),
      Z = {
    fas: "solid",
    far: "regular",
    fal: "light",
    fad: "duotone",
    fab: "brands",
    fa: "solid"
  },
      x = {
    solid: "fas",
    regular: "far",
    light: "fal",
    duotone: "fad",
    brands: "fab"
  },
      q = "fa-layers-text",
      O = /Font Awesome 5 (Solid|Regular|Light|Duotone|Brands|Free|Pro)/,
      j = {
    900: "fas",
    400: "far",
    normal: "far",
    300: "fal"
  },
      P = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      E = P.concat([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
      N = ["class", "data-prefix", "data-icon", "data-fa-transform", "data-fa-mask"],
      _ = {
    GROUP: "group",
    SWAP_OPACITY: "swap-opacity",
    PRIMARY: "primary",
    SECONDARY: "secondary"
  },
      T = ["xs", "sm", "lg", "fw", "ul", "li", "border", "pull-left", "pull-right", "spin", "pulse", "rotate-90", "rotate-180", "rotate-270", "flip-horizontal", "flip-vertical", "flip-both", "stack", "stack-1x", "stack-2x", "inverse", "layers", "layers-text", "layers-counter", _.GROUP, _.SWAP_OPACITY, _.PRIMARY, _.SECONDARY].concat(P.map(function (c) {
    return "".concat(c, "x");
  })).concat(E.map(function (c) {
    return "w-".concat(c);
  })),
      I = V.FontAwesomeConfig || {};

  if (o && "function" == typeof o.querySelector) {
    [["data-family-prefix", "familyPrefix"], ["data-replacement-class", "replacementClass"], ["data-auto-replace-svg", "autoReplaceSvg"], ["data-auto-add-css", "autoAddCss"], ["data-auto-a11y", "autoA11y"], ["data-search-pseudo-elements", "searchPseudoElements"], ["data-observe-mutations", "observeMutations"], ["data-mutate-approach", "mutateApproach"], ["data-keep-original-source", "keepOriginalSource"], ["data-measure-performance", "measurePerformance"], ["data-show-missing-icons", "showMissingIcons"]].forEach(function (c) {
      var l,
          h = n(c, 2),
          z = h[0],
          v = h[1],
          a = "" === (l = function (c) {
        var l = o.querySelector("script[" + c + "]");
        if (l) return l.getAttribute(c);
      }(z)) || "false" !== l && ("true" === l || l);

      null != a && (I[v] = a);
    });
  }

  var R = G({}, {
    familyPrefix: C,
    replacementClass: L,
    autoReplaceSvg: !0,
    autoAddCss: !0,
    autoA11y: !0,
    searchPseudoElements: !1,
    observeMutations: !0,
    mutateApproach: "async",
    keepOriginalSource: !0,
    measurePerformance: !1,
    showMissingIcons: !0
  }, I);
  R.autoReplaceSvg || (R.observeMutations = !1);
  var $ = G({}, R);
  V.FontAwesomeConfig = $;
  var F = V || {};
  F[i] || (F[i] = {}), F[i].styles || (F[i].styles = {}), F[i].hooks || (F[i].hooks = {}), F[i].shims || (F[i].shims = []);
  var Y = F[i],
      D = [],
      W = !1;

  function U(c) {
    H && (W ? setTimeout(c, 0) : D.push(c));
  }

  H && ((W = (o.documentElement.doScroll ? /^loaded|^c/ : /^loaded|^i|^c/).test(o.readyState)) || o.addEventListener("DOMContentLoaded", function c() {
    o.removeEventListener("DOMContentLoaded", c), W = 1, D.map(function (c) {
      return c();
    });
  }));

  var Q,
      X = "pending",
      B = "settled",
      K = "fulfilled",
      cc = "rejected",
      lc = function lc() {},
      hc = "undefined" != typeof global && void 0 !== global.process && "function" == typeof global.process.emit,
      zc = "undefined" == typeof setImmediate ? setTimeout : setImmediate,
      vc = [];

  function ac() {
    for (var c = 0; c < vc.length; c++) {
      vc[c][0](vc[c][1]);
    }

    Q = !(vc = []);
  }

  function mc(c, l) {
    vc.push([c, l]), Q || (Q = !0, zc(ac, 0));
  }

  function sc(c) {
    var l = c.owner,
        h = l._state,
        z = l._data,
        v = c[h],
        a = c.then;

    if ("function" == typeof v) {
      h = K;

      try {
        z = v(z);
      } catch (c) {
        fc(a, c);
      }
    }

    ec(a, z) || (h === K && tc(a, z), h === cc && fc(a, z));
  }

  function ec(l, h) {
    var z;

    try {
      if (l === h) throw new TypeError("A promises callback cannot return that same promise.");

      if (h && ("function" == typeof h || "object" === a(h))) {
        var c = h.then;
        if ("function" == typeof c) return c.call(h, function (c) {
          z || (z = !0, h === c ? Mc(l, c) : tc(l, c));
        }, function (c) {
          z || (z = !0, fc(l, c));
        }), !0;
      }
    } catch (c) {
      return z || fc(l, c), !0;
    }

    return !1;
  }

  function tc(c, l) {
    c !== l && ec(c, l) || Mc(c, l);
  }

  function Mc(c, l) {
    c._state === X && (c._state = B, c._data = l, mc(Hc, c));
  }

  function fc(c, l) {
    c._state === X && (c._state = B, c._data = l, mc(nc, c));
  }

  function rc(c) {
    c._then = c._then.forEach(sc);
  }

  function Hc(c) {
    c._state = K, rc(c);
  }

  function nc(c) {
    c._state = cc, rc(c), !c._handled && hc && global.process.emit("unhandledRejection", c._data, c);
  }

  function ic(c) {
    global.process.emit("rejectionHandled", c);
  }

  function Vc(c) {
    if ("function" != typeof c) throw new TypeError("Promise resolver " + c + " is not a function");
    if (this instanceof Vc == !1) throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    this._then = [], function (c, l) {
      function h(c) {
        fc(l, c);
      }

      try {
        c(function (c) {
          tc(l, c);
        }, h);
      } catch (c) {
        h(c);
      }
    }(c, this);
  }

  Vc.prototype = {
    constructor: Vc,
    _state: X,
    _then: null,
    _data: void 0,
    _handled: !1,
    then: function then(c, l) {
      var h = {
        owner: this,
        then: new this.constructor(lc),
        fulfilled: c,
        rejected: l
      };
      return !l && !c || this._handled || (this._handled = !0, this._state === cc && hc && mc(ic, this)), this._state === K || this._state === cc ? mc(sc, h) : this._then.push(h), h.then;
    },
    catch: function _catch(c) {
      return this.then(null, c);
    }
  }, Vc.all = function (s) {
    if (!Array.isArray(s)) throw new TypeError("You must pass an array to Promise.all().");
    return new Vc(function (h, c) {
      var z = [],
          v = 0;

      function l(l) {
        return v++, function (c) {
          z[l] = c, --v || h(z);
        };
      }

      for (var a, m = 0; m < s.length; m++) {
        (a = s[m]) && "function" == typeof a.then ? a.then(l(m), c) : z[m] = a;
      }

      v || h(z);
    });
  }, Vc.race = function (v) {
    if (!Array.isArray(v)) throw new TypeError("You must pass an array to Promise.race().");
    return new Vc(function (c, l) {
      for (var h, z = 0; z < v.length; z++) {
        (h = v[z]) && "function" == typeof h.then ? h.then(c, l) : c(h);
      }
    });
  }, Vc.resolve = function (l) {
    return l && "object" === a(l) && l.constructor === Vc ? l : new Vc(function (c) {
      c(l);
    });
  }, Vc.reject = function (h) {
    return new Vc(function (c, l) {
      l(h);
    });
  };
  var oc = "function" == typeof Promise ? Promise : Vc,
      Cc = b,
      Lc = {
    size: 16,
    x: 0,
    y: 0,
    rotate: 0,
    flipX: !1,
    flipY: !1
  };

  function dc(c) {
    if (c && H) {
      var l = o.createElement("style");
      l.setAttribute("type", "text/css"), l.innerHTML = c;

      for (var h = o.head.childNodes, z = null, v = h.length - 1; -1 < v; v--) {
        var a = h[v],
            m = (a.tagName || "").toUpperCase();
        -1 < ["STYLE", "LINK"].indexOf(m) && (z = a);
      }

      return o.head.insertBefore(l, z), c;
    }
  }

  var uc = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function pc() {
    for (var c = 12, l = ""; 0 < c--;) {
      l += uc[62 * Math.random() | 0];
    }

    return l;
  }

  function bc(c) {
    for (var l = [], h = (c || []).length >>> 0; h--;) {
      l[h] = c[h];
    }

    return l;
  }

  function gc(c) {
    return c.classList ? bc(c.classList) : (c.getAttribute("class") || "").split(" ").filter(function (c) {
      return c;
    });
  }

  function Ac(c, l) {
    var h,
        z = l.split("-"),
        v = z[0],
        a = z.slice(1).join("-");
    return v !== c || "" === a || (h = a, ~T.indexOf(h)) ? null : a;
  }

  function Sc(c) {
    return "".concat(c).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function yc(h) {
    return Object.keys(h || {}).reduce(function (c, l) {
      return c + "".concat(l, ": ").concat(h[l], ";");
    }, "");
  }

  function wc(c) {
    return c.size !== Lc.size || c.x !== Lc.x || c.y !== Lc.y || c.rotate !== Lc.rotate || c.flipX || c.flipY;
  }

  function kc(c) {
    var l = c.transform,
        h = c.containerWidth,
        z = c.iconWidth,
        v = {
      transform: "translate(".concat(h / 2, " 256)")
    },
        a = "translate(".concat(32 * l.x, ", ").concat(32 * l.y, ") "),
        m = "scale(".concat(l.size / 16 * (l.flipX ? -1 : 1), ", ").concat(l.size / 16 * (l.flipY ? -1 : 1), ") "),
        s = "rotate(".concat(l.rotate, " 0 0)");
    return {
      outer: v,
      inner: {
        transform: "".concat(a, " ").concat(m, " ").concat(s)
      },
      path: {
        transform: "translate(".concat(z / 2 * -1, " -256)")
      }
    };
  }

  var Zc = {
    x: 0,
    y: 0,
    width: "100%",
    height: "100%"
  };

  function xc(c) {
    var l = !(1 < arguments.length && void 0 !== arguments[1]) || arguments[1];
    return c.attributes && (c.attributes.fill || l) && (c.attributes.fill = "black"), c;
  }

  function qc(c) {
    var l = c.icons,
        h = l.main,
        z = l.mask,
        v = c.prefix,
        a = c.iconName,
        m = c.transform,
        s = c.symbol,
        e = c.title,
        t = c.maskId,
        M = c.titleId,
        f = c.extra,
        r = c.watchable,
        H = void 0 !== r && r,
        n = z.found ? z : h,
        i = n.width,
        V = n.height,
        o = "fa-w-".concat(Math.ceil(i / V * 16)),
        C = [$.replacementClass, a ? "".concat($.familyPrefix, "-").concat(a) : "", o].filter(function (c) {
      return -1 === f.classes.indexOf(c);
    }).concat(f.classes).join(" "),
        L = {
      children: [],
      attributes: G({}, f.attributes, {
        "data-prefix": v,
        "data-icon": a,
        class: C,
        role: f.attributes.role || "img",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 ".concat(i, " ").concat(V)
      })
    };
    H && (L.attributes[J] = ""), e && L.children.push({
      tag: "title",
      attributes: {
        id: L.attributes["aria-labelledby"] || "title-".concat(M || pc())
      },
      children: [e]
    });

    var d,
        u,
        p,
        b,
        g,
        A,
        S,
        y,
        w,
        k,
        Z,
        x,
        q,
        O,
        j,
        P,
        E,
        N,
        _,
        T,
        I,
        R,
        F,
        Y,
        D,
        W,
        U,
        Q = G({}, L, {
      prefix: v,
      iconName: a,
      main: h,
      mask: z,
      maskId: t,
      transform: m,
      symbol: s,
      styles: f.styles
    }),
        X = z.found && h.found ? (p = (d = Q).children, b = d.attributes, g = d.main, A = d.mask, S = d.maskId, y = d.transform, w = g.width, k = g.icon, Z = A.width, x = A.icon, q = kc({
      transform: y,
      containerWidth: Z,
      iconWidth: w
    }), O = {
      tag: "rect",
      attributes: G({}, Zc, {
        fill: "white"
      })
    }, j = k.children ? {
      children: k.children.map(xc)
    } : {}, P = {
      tag: "g",
      attributes: G({}, q.inner),
      children: [xc(G({
        tag: k.tag,
        attributes: G({}, k.attributes, q.path)
      }, j))]
    }, E = {
      tag: "g",
      attributes: G({}, q.outer),
      children: [P]
    }, N = "mask-".concat(S || pc()), _ = "clip-".concat(S || pc()), T = {
      tag: "mask",
      attributes: G({}, Zc, {
        id: N,
        maskUnits: "userSpaceOnUse",
        maskContentUnits: "userSpaceOnUse"
      }),
      children: [O, E]
    }, I = {
      tag: "defs",
      children: [{
        tag: "clipPath",
        attributes: {
          id: _
        },
        children: (u = x, "g" === u.tag ? u.children : [u])
      }, T]
    }, p.push(I, {
      tag: "rect",
      attributes: G({
        fill: "currentColor",
        "clip-path": "url(#".concat(_, ")"),
        mask: "url(#".concat(N, ")")
      }, Zc)
    }), {
      children: p,
      attributes: b
    }) : function (c) {
      var l = c.children,
          h = c.attributes,
          z = c.main,
          v = c.transform,
          a = yc(c.styles);

      if (0 < a.length && (h.style = a), wc(v)) {
        var m = kc({
          transform: v,
          containerWidth: z.width,
          iconWidth: z.width
        });
        l.push({
          tag: "g",
          attributes: G({}, m.outer),
          children: [{
            tag: "g",
            attributes: G({}, m.inner),
            children: [{
              tag: z.icon.tag,
              children: z.icon.children,
              attributes: G({}, z.icon.attributes, m.path)
            }]
          }]
        });
      } else l.push(z.icon);

      return {
        children: l,
        attributes: h
      };
    }(Q),
        B = X.children,
        K = X.attributes;

    return Q.children = B, Q.attributes = K, s ? (F = (R = Q).prefix, Y = R.iconName, D = R.children, W = R.attributes, U = R.symbol, [{
      tag: "svg",
      attributes: {
        style: "display: none;"
      },
      children: [{
        tag: "symbol",
        attributes: G({}, W, {
          id: !0 === U ? "".concat(F, "-").concat($.familyPrefix, "-").concat(Y) : U
        }),
        children: D
      }]
    }]) : function (c) {
      var l = c.children,
          h = c.main,
          z = c.mask,
          v = c.attributes,
          a = c.styles,
          m = c.transform;

      if (wc(m) && h.found && !z.found) {
        var s = h.width / h.height / 2,
            e = 0.5;
        v.style = yc(G({}, a, {
          "transform-origin": "".concat(s + m.x / 16, "em ").concat(e + m.y / 16, "em")
        }));
      }

      return [{
        tag: "svg",
        attributes: v,
        children: l
      }];
    }(Q);
  }

  function Oc(c) {
    var l = c.content,
        h = c.width,
        z = c.height,
        v = c.transform,
        a = c.title,
        m = c.extra,
        s = c.watchable,
        e = void 0 !== s && s,
        t = G({}, m.attributes, a ? {
      title: a
    } : {}, {
      class: m.classes.join(" ")
    });
    e && (t[J] = "");
    var M,
        f,
        r,
        H,
        n,
        i,
        V,
        o,
        C,
        L = G({}, m.styles);
    wc(v) && (L.transform = (f = (M = {
      transform: v,
      startCentered: !0,
      width: h,
      height: z
    }).transform, r = M.width, H = void 0 === r ? b : r, n = M.height, i = void 0 === n ? b : n, V = M.startCentered, C = "", C += (o = void 0 !== V && V) && p ? "translate(".concat(f.x / Cc - H / 2, "em, ").concat(f.y / Cc - i / 2, "em) ") : o ? "translate(calc(-50% + ".concat(f.x / Cc, "em), calc(-50% + ").concat(f.y / Cc, "em)) ") : "translate(".concat(f.x / Cc, "em, ").concat(f.y / Cc, "em) "), C += "scale(".concat(f.size / Cc * (f.flipX ? -1 : 1), ", ").concat(f.size / Cc * (f.flipY ? -1 : 1), ") "), C += "rotate(".concat(f.rotate, "deg) ")), L["-webkit-transform"] = L.transform);
    var d = yc(L);
    0 < d.length && (t.style = d);
    var u = [];
    return u.push({
      tag: "span",
      attributes: t,
      children: [l]
    }), a && u.push({
      tag: "span",
      attributes: {
        class: "sr-only"
      },
      children: [a]
    }), u;
  }

  var jc = function jc() {},
      Pc = $.measurePerformance && M && M.mark && M.measure ? M : {
    mark: jc,
    measure: jc
  },
      Ec = 'FA "5.13.0"',
      Nc = function Nc(c) {
    Pc.mark("".concat(Ec, " ").concat(c, " ends")), Pc.measure("".concat(Ec, " ").concat(c), "".concat(Ec, " ").concat(c, " begins"), "".concat(Ec, " ").concat(c, " ends"));
  },
      _c = {
    begin: function begin(c) {
      return Pc.mark("".concat(Ec, " ").concat(c, " begins")), function () {
        return Nc(c);
      };
    },
    end: Nc
  },
      Tc = function Tc(c, l, h, z) {
    var v,
        a,
        m,
        s,
        e,
        t = Object.keys(c),
        M = t.length,
        f = void 0 !== z ? (s = l, e = z, function (c, l, h, z) {
      return s.call(e, c, l, h, z);
    }) : l;

    for (m = void 0 === h ? (v = 1, c[t[0]]) : (v = 0, h); v < M; v++) {
      m = f(m, c[a = t[v]], a, c);
    }

    return m;
  };

  function Ic(c) {
    for (var l = "", h = 0; h < c.length; h++) {
      l += ("000" + c.charCodeAt(h).toString(16)).slice(-4);
    }

    return l;
  }

  var Rc = Y.styles,
      Fc = Y.shims,
      Yc = {},
      Dc = {},
      Wc = {},
      Uc = function Uc() {
    var c = function c(z) {
      return Tc(Rc, function (c, l, h) {
        return c[h] = Tc(l, z, {}), c;
      }, {});
    };

    Yc = c(function (c, l, h) {
      return l[3] && (c[l[3]] = h), c;
    }), Dc = c(function (l, c, h) {
      var z = c[2];
      return l[h] = h, z.forEach(function (c) {
        l[c] = h;
      }), l;
    });
    var a = ("far" in Rc);
    Wc = Tc(Fc, function (c, l) {
      var h = l[0],
          z = l[1],
          v = l[2];
      return "far" !== z || a || (z = "fas"), c[h] = {
        prefix: z,
        iconName: v
      }, c;
    }, {});
  };

  function Qc(c, l) {
    return (Yc[c] || {})[l];
  }

  Uc();

  var Xc = Y.styles,
      Bc = function Bc() {
    return {
      prefix: null,
      iconName: null,
      rest: []
    };
  };

  function Kc(c) {
    return c.reduce(function (c, l) {
      var h = Ac($.familyPrefix, l);
      if (Xc[l]) c.prefix = l;else if ($.autoFetchSvg && -1 < ["fas", "far", "fal", "fad", "fab", "fa"].indexOf(l)) c.prefix = l;else if (h) {
        var z = "fa" === c.prefix ? Wc[h] || {
          prefix: null,
          iconName: null
        } : {};
        c.iconName = z.iconName || h, c.prefix = z.prefix || c.prefix;
      } else l !== $.replacementClass && 0 !== l.indexOf("fa-w-") && c.rest.push(l);
      return c;
    }, Bc());
  }

  function Gc(c, l, h) {
    if (c && c[l] && c[l][h]) return {
      prefix: l,
      iconName: h,
      icon: c[l][h]
    };
  }

  function Jc(c) {
    var h,
        l = c.tag,
        z = c.attributes,
        v = void 0 === z ? {} : z,
        a = c.children,
        m = void 0 === a ? [] : a;
    return "string" == typeof c ? Sc(c) : "<".concat(l, " ").concat((h = v, Object.keys(h || {}).reduce(function (c, l) {
      return c + "".concat(l, '="').concat(Sc(h[l]), '" ');
    }, "").trim()), ">").concat(m.map(Jc).join(""), "</").concat(l, ">");
  }

  var $c = function $c() {};

  function cl(c) {
    return "string" == typeof (c.getAttribute ? c.getAttribute(J) : null);
  }

  var ll = {
    replace: function replace(c) {
      var l = c[0],
          h = c[1].map(function (c) {
        return Jc(c);
      }).join("\n");
      if (l.parentNode && l.outerHTML) l.outerHTML = h + ($.keepOriginalSource && "svg" !== l.tagName.toLowerCase() ? "\x3c!-- ".concat(l.outerHTML, " --\x3e") : "");else if (l.parentNode) {
        var z = document.createElement("span");
        l.parentNode.replaceChild(z, l), z.outerHTML = h;
      }
    },
    nest: function nest(c) {
      var l = c[0],
          h = c[1];
      if (~gc(l).indexOf($.replacementClass)) return ll.replace(c);
      var z = new RegExp("".concat($.familyPrefix, "-.*"));
      delete h[0].attributes.style, delete h[0].attributes.id;
      var v = h[0].attributes.class.split(" ").reduce(function (c, l) {
        return l === $.replacementClass || l.match(z) ? c.toSvg.push(l) : c.toNode.push(l), c;
      }, {
        toNode: [],
        toSvg: []
      });
      h[0].attributes.class = v.toSvg.join(" ");
      var a = h.map(function (c) {
        return Jc(c);
      }).join("\n");
      l.setAttribute("class", v.toNode.join(" ")), l.setAttribute(J, ""), l.innerHTML = a;
    }
  };

  function hl(c) {
    c();
  }

  function zl(h, c) {
    var z = "function" == typeof c ? c : $c;
    if (0 === h.length) z();else {
      var l = hl;
      $.mutateApproach === y && (l = V.requestAnimationFrame || hl), l(function () {
        var c = !0 === $.autoReplaceSvg ? ll.replace : ll[$.autoReplaceSvg] || ll.replace,
            l = _c.begin("mutate");

        h.map(c), l(), z();
      });
    }
  }

  var vl = !1;

  function al() {
    vl = !1;
  }

  var ml = null;

  function sl(c) {
    if (t && $.observeMutations) {
      var v = c.treeCallback,
          a = c.nodeCallback,
          m = c.pseudoElementsCallback,
          l = c.observeMutationsRoot,
          h = void 0 === l ? o : l;
      ml = new t(function (c) {
        vl || bc(c).forEach(function (c) {
          if ("childList" === c.type && 0 < c.addedNodes.length && !cl(c.addedNodes[0]) && ($.searchPseudoElements && m(c.target), v(c.target)), "attributes" === c.type && c.target.parentNode && $.searchPseudoElements && m(c.target.parentNode), "attributes" === c.type && cl(c.target) && ~N.indexOf(c.attributeName)) if ("class" === c.attributeName) {
            var l = Kc(gc(c.target)),
                h = l.prefix,
                z = l.iconName;
            h && c.target.setAttribute("data-prefix", h), z && c.target.setAttribute("data-icon", z);
          } else a(c.target);
        });
      }), H && ml.observe(h, {
        childList: !0,
        attributes: !0,
        characterData: !0,
        subtree: !0
      });
    }
  }

  function el(c) {
    var l,
        h,
        z = c.getAttribute("data-prefix"),
        v = c.getAttribute("data-icon"),
        a = void 0 !== c.innerText ? c.innerText.trim() : "",
        m = Kc(gc(c));
    return z && v && (m.prefix = z, m.iconName = v), m.prefix && 1 < a.length ? m.iconName = (l = m.prefix, h = c.innerText, (Dc[l] || {})[h]) : m.prefix && 1 === a.length && (m.iconName = Qc(m.prefix, Ic(c.innerText))), m;
  }

  var tl = function tl(c) {
    var l = {
      size: 16,
      x: 0,
      y: 0,
      flipX: !1,
      flipY: !1,
      rotate: 0
    };
    return c ? c.toLowerCase().split(" ").reduce(function (c, l) {
      var h = l.toLowerCase().split("-"),
          z = h[0],
          v = h.slice(1).join("-");
      if (z && "h" === v) return c.flipX = !0, c;
      if (z && "v" === v) return c.flipY = !0, c;
      if (v = parseFloat(v), isNaN(v)) return c;

      switch (z) {
        case "grow":
          c.size = c.size + v;
          break;

        case "shrink":
          c.size = c.size - v;
          break;

        case "left":
          c.x = c.x - v;
          break;

        case "right":
          c.x = c.x + v;
          break;

        case "up":
          c.y = c.y - v;
          break;

        case "down":
          c.y = c.y + v;
          break;

        case "rotate":
          c.rotate = c.rotate + v;
      }

      return c;
    }, l) : l;
  };

  function Ml(c) {
    var l,
        h,
        z,
        v,
        a,
        m,
        s,
        e,
        t = el(c),
        M = t.iconName,
        f = t.prefix,
        r = t.rest,
        H = (l = c.getAttribute("style"), h = [], l && (h = l.split(";").reduce(function (c, l) {
      var h = l.split(":"),
          z = h[0],
          v = h.slice(1);
      return z && 0 < v.length && (c[z] = v.join(":").trim()), c;
    }, {})), h),
        n = tl(c.getAttribute("data-fa-transform")),
        i = null !== (z = c.getAttribute("data-fa-symbol")) && ("" === z || z),
        V = (a = bc((v = c).attributes).reduce(function (c, l) {
      return "class" !== c.name && "style" !== c.name && (c[l.name] = l.value), c;
    }, {}), m = v.getAttribute("title"), s = v.getAttribute("data-fa-title-id"), $.autoA11y && (m ? a["aria-labelledby"] = "".concat($.replacementClass, "-title-").concat(s || pc()) : (a["aria-hidden"] = "true", a.focusable = "false")), a),
        o = (e = c.getAttribute("data-fa-mask")) ? Kc(e.split(" ").map(function (c) {
      return c.trim();
    })) : Bc();
    return {
      iconName: M,
      title: c.getAttribute("title"),
      titleId: c.getAttribute("data-fa-title-id"),
      prefix: f,
      transform: n,
      symbol: i,
      mask: o,
      maskId: c.getAttribute("data-fa-mask-id"),
      extra: {
        classes: r,
        styles: H,
        attributes: V
      }
    };
  }

  function fl(c) {
    this.name = "MissingIcon", this.message = c || "Icon unavailable", this.stack = new Error().stack;
  }

  (fl.prototype = Object.create(Error.prototype)).constructor = fl;
  var rl = {
    fill: "currentColor"
  },
      Hl = {
    attributeType: "XML",
    repeatCount: "indefinite",
    dur: "2s"
  },
      nl = {
    tag: "path",
    attributes: G({}, rl, {
      d: "M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"
    })
  },
      il = G({}, Hl, {
    attributeName: "opacity"
  }),
      Vl = {
    tag: "g",
    children: [nl, {
      tag: "circle",
      attributes: G({}, rl, {
        cx: "256",
        cy: "364",
        r: "28"
      }),
      children: [{
        tag: "animate",
        attributes: G({}, Hl, {
          attributeName: "r",
          values: "28;14;28;28;14;28;"
        })
      }, {
        tag: "animate",
        attributes: G({}, il, {
          values: "1;0;1;1;0;1;"
        })
      }]
    }, {
      tag: "path",
      attributes: G({}, rl, {
        opacity: "1",
        d: "M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"
      }),
      children: [{
        tag: "animate",
        attributes: G({}, il, {
          values: "1;0;0;0;0;1;"
        })
      }]
    }, {
      tag: "path",
      attributes: G({}, rl, {
        opacity: "0",
        d: "M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"
      }),
      children: [{
        tag: "animate",
        attributes: G({}, il, {
          values: "0;0;1;1;0;0;"
        })
      }]
    }]
  },
      ol = Y.styles;

  function Cl(c) {
    var l = c[0],
        h = c[1],
        z = n(c.slice(4), 1)[0];
    return {
      found: !0,
      width: l,
      height: h,
      icon: Array.isArray(z) ? {
        tag: "g",
        attributes: {
          class: "".concat($.familyPrefix, "-").concat(_.GROUP)
        },
        children: [{
          tag: "path",
          attributes: {
            class: "".concat($.familyPrefix, "-").concat(_.SECONDARY),
            fill: "currentColor",
            d: z[0]
          }
        }, {
          tag: "path",
          attributes: {
            class: "".concat($.familyPrefix, "-").concat(_.PRIMARY),
            fill: "currentColor",
            d: z[1]
          }
        }]
      } : {
        tag: "path",
        attributes: {
          fill: "currentColor",
          d: z
        }
      }
    };
  }

  function Ll(z, v) {
    return new oc(function (c, l) {
      var h = {
        found: !1,
        width: 512,
        height: 512,
        icon: Vl
      };
      if (z && v && ol[v] && ol[v][z]) return c(Cl(ol[v][z]));
      "object" === a(V.FontAwesomeKitConfig) && "string" == typeof window.FontAwesomeKitConfig.token && V.FontAwesomeKitConfig.token, z && v && !$.showMissingIcons ? l(new fl("Icon is missing for prefix ".concat(v, " with icon name ").concat(z))) : c(h);
    });
  }

  var dl = Y.styles;

  function ul(c) {
    var a,
        l,
        m,
        s,
        e,
        t,
        M,
        f,
        h,
        r,
        H,
        z = Ml(c);
    return ~z.extra.classes.indexOf(q) ? function (c, l) {
      var h = l.title,
          z = l.transform,
          v = l.extra,
          a = null,
          m = null;

      if (p) {
        var s = parseInt(getComputedStyle(c).fontSize, 10),
            e = c.getBoundingClientRect();
        a = e.width / s, m = e.height / s;
      }

      return $.autoA11y && !h && (v.attributes["aria-hidden"] = "true"), oc.resolve([c, Oc({
        content: c.innerHTML,
        width: a,
        height: m,
        transform: z,
        title: h,
        extra: v,
        watchable: !0
      })]);
    }(c, z) : (a = c, m = (l = z).iconName, s = l.title, e = l.titleId, t = l.prefix, M = l.transform, f = l.symbol, h = l.mask, r = l.maskId, H = l.extra, new oc(function (v, c) {
      oc.all([Ll(m, t), Ll(h.iconName, h.prefix)]).then(function (c) {
        var l = n(c, 2),
            h = l[0],
            z = l[1];
        v([a, qc({
          icons: {
            main: h,
            mask: z
          },
          prefix: t,
          iconName: m,
          transform: M,
          symbol: f,
          mask: z,
          maskId: r,
          title: s,
          titleId: e,
          extra: H,
          watchable: !0
        })]);
      });
    }));
  }

  function pl(c) {
    var h = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null;

    if (H) {
      var l = o.documentElement.classList,
          z = function z(c) {
        return l.add("".concat(S, "-").concat(c));
      },
          v = function v(c) {
        return l.remove("".concat(S, "-").concat(c));
      },
          a = $.autoFetchSvg ? Object.keys(Z) : Object.keys(dl),
          m = [".".concat(q, ":not([").concat(J, "])")].concat(a.map(function (c) {
        return ".".concat(c, ":not([").concat(J, "])");
      })).join(", ");

      if (0 !== m.length) {
        var s = [];

        try {
          s = bc(c.querySelectorAll(m));
        } catch (c) {}

        if (0 < s.length) {
          z("pending"), v("complete");

          var e = _c.begin("onTree"),
              t = s.reduce(function (c, l) {
            try {
              var h = ul(l);
              h && c.push(h);
            } catch (c) {
              k || c instanceof fl && console.error(c);
            }

            return c;
          }, []);

          return new oc(function (l, c) {
            oc.all(t).then(function (c) {
              zl(c, function () {
                z("active"), z("complete"), v("pending"), "function" == typeof h && h(), e(), l();
              });
            }).catch(function () {
              e(), c();
            });
          });
        }
      }
    }
  }

  function bl(c) {
    var l = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null;
    ul(c).then(function (c) {
      c && zl([c], l);
    });
  }

  function gl(H, n) {
    var i = "".concat(u).concat(n.replace(":", "-"));
    return new oc(function (z, c) {
      if (null !== H.getAttribute(i)) return z();
      var l = bc(H.children).filter(function (c) {
        return c.getAttribute(d) === n;
      })[0],
          h = V.getComputedStyle(H, n),
          v = h.getPropertyValue("font-family").match(O),
          a = h.getPropertyValue("font-weight"),
          m = h.getPropertyValue("content");
      if (l && !v) return H.removeChild(l), z();

      if (v && "none" !== m && "" !== m) {
        var s = ~["Solid", "Regular", "Light", "Duotone", "Brands"].indexOf(v[1]) ? x[v[1].toLowerCase()] : j[a],
            e = Ic(3 === m.length ? m.substr(1, 1) : m),
            t = Qc(s, e),
            M = t;
        if (!t || l && l.getAttribute(g) === s && l.getAttribute(A) === M) z();else {
          H.setAttribute(i, M), l && H.removeChild(l);
          var f = {
            iconName: null,
            title: null,
            titleId: null,
            prefix: null,
            transform: Lc,
            symbol: !1,
            mask: null,
            maskId: null,
            extra: {
              classes: [],
              styles: {},
              attributes: {}
            }
          },
              r = f.extra;
          r.attributes[d] = n, Ll(t, s).then(function (c) {
            var l = qc(G({}, f, {
              icons: {
                main: c,
                mask: Bc()
              },
              prefix: s,
              iconName: M,
              extra: r,
              watchable: !0
            })),
                h = o.createElement("svg");
            ":before" === n ? H.insertBefore(h, H.firstChild) : H.appendChild(h), h.outerHTML = l.map(function (c) {
              return Jc(c);
            }).join("\n"), H.removeAttribute(i), z();
          }).catch(c);
        }
      } else z();
    });
  }

  function Al(c) {
    return oc.all([gl(c, ":before"), gl(c, ":after")]);
  }

  function Sl(c) {
    return !(c.parentNode === document.head || ~w.indexOf(c.tagName.toUpperCase()) || c.getAttribute(d) || c.parentNode && "svg" === c.parentNode.tagName);
  }

  function yl(v) {
    if (H) return new oc(function (c, l) {
      var h = bc(v.querySelectorAll("*")).filter(Sl).map(Al),
          z = _c.begin("searchPseudoElements");

      vl = !0, oc.all(h).then(function () {
        z(), al(), c();
      }).catch(function () {
        z(), al(), l();
      });
    });
  }

  var wl = "svg:not(:root).svg-inline--fa{overflow:visible}.svg-inline--fa{display:inline-block;font-size:inherit;height:1em;overflow:visible;vertical-align:-.125em}.svg-inline--fa.fa-lg{vertical-align:-.225em}.svg-inline--fa.fa-w-1{width:.0625em}.svg-inline--fa.fa-w-2{width:.125em}.svg-inline--fa.fa-w-3{width:.1875em}.svg-inline--fa.fa-w-4{width:.25em}.svg-inline--fa.fa-w-5{width:.3125em}.svg-inline--fa.fa-w-6{width:.375em}.svg-inline--fa.fa-w-7{width:.4375em}.svg-inline--fa.fa-w-8{width:.5em}.svg-inline--fa.fa-w-9{width:.5625em}.svg-inline--fa.fa-w-10{width:.625em}.svg-inline--fa.fa-w-11{width:.6875em}.svg-inline--fa.fa-w-12{width:.75em}.svg-inline--fa.fa-w-13{width:.8125em}.svg-inline--fa.fa-w-14{width:.875em}.svg-inline--fa.fa-w-15{width:.9375em}.svg-inline--fa.fa-w-16{width:1em}.svg-inline--fa.fa-w-17{width:1.0625em}.svg-inline--fa.fa-w-18{width:1.125em}.svg-inline--fa.fa-w-19{width:1.1875em}.svg-inline--fa.fa-w-20{width:1.25em}.svg-inline--fa.fa-pull-left{margin-right:.3em;width:auto}.svg-inline--fa.fa-pull-right{margin-left:.3em;width:auto}.svg-inline--fa.fa-border{height:1.5em}.svg-inline--fa.fa-li{width:2em}.svg-inline--fa.fa-fw{width:1.25em}.fa-layers svg.svg-inline--fa{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0}.fa-layers{display:inline-block;height:1em;position:relative;text-align:center;vertical-align:-.125em;width:1em}.fa-layers svg.svg-inline--fa{-webkit-transform-origin:center center;transform-origin:center center}.fa-layers-counter,.fa-layers-text{display:inline-block;position:absolute;text-align:center}.fa-layers-text{left:50%;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);-webkit-transform-origin:center center;transform-origin:center center}.fa-layers-counter{background-color:#ff253a;border-radius:1em;-webkit-box-sizing:border-box;box-sizing:border-box;color:#fff;height:1.5em;line-height:1;max-width:5em;min-width:1.5em;overflow:hidden;padding:.25em;right:0;text-overflow:ellipsis;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top right;transform-origin:top right}.fa-layers-bottom-right{bottom:0;right:0;top:auto;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:bottom right;transform-origin:bottom right}.fa-layers-bottom-left{bottom:0;left:0;right:auto;top:auto;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:bottom left;transform-origin:bottom left}.fa-layers-top-right{right:0;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top right;transform-origin:top right}.fa-layers-top-left{left:0;right:auto;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top left;transform-origin:top left}.fa-lg{font-size:1.3333333333em;line-height:.75em;vertical-align:-.0667em}.fa-xs{font-size:.75em}.fa-sm{font-size:.875em}.fa-1x{font-size:1em}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-6x{font-size:6em}.fa-7x{font-size:7em}.fa-8x{font-size:8em}.fa-9x{font-size:9em}.fa-10x{font-size:10em}.fa-fw{text-align:center;width:1.25em}.fa-ul{list-style-type:none;margin-left:2.5em;padding-left:0}.fa-ul>li{position:relative}.fa-li{left:-2em;position:absolute;text-align:center;width:2em;line-height:inherit}.fa-border{border:solid .08em #eee;border-radius:.1em;padding:.2em .25em .15em}.fa-pull-left{float:left}.fa-pull-right{float:right}.fa.fa-pull-left,.fab.fa-pull-left,.fal.fa-pull-left,.far.fa-pull-left,.fas.fa-pull-left{margin-right:.3em}.fa.fa-pull-right,.fab.fa-pull-right,.fal.fa-pull-right,.far.fa-pull-right,.fas.fa-pull-right{margin-left:.3em}.fa-spin{-webkit-animation:fa-spin 2s infinite linear;animation:fa-spin 2s infinite linear}.fa-pulse{-webkit-animation:fa-spin 1s infinite steps(8);animation:fa-spin 1s infinite steps(8)}@-webkit-keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.fa-rotate-90{-webkit-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{-webkit-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{-webkit-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{-webkit-transform:scale(-1,1);transform:scale(-1,1)}.fa-flip-vertical{-webkit-transform:scale(1,-1);transform:scale(1,-1)}.fa-flip-both,.fa-flip-horizontal.fa-flip-vertical{-webkit-transform:scale(-1,-1);transform:scale(-1,-1)}:root .fa-flip-both,:root .fa-flip-horizontal,:root .fa-flip-vertical,:root .fa-rotate-180,:root .fa-rotate-270,:root .fa-rotate-90{-webkit-filter:none;filter:none}.fa-stack{display:inline-block;height:2em;position:relative;width:2.5em}.fa-stack-1x,.fa-stack-2x{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0}.svg-inline--fa.fa-stack-1x{height:1em;width:1.25em}.svg-inline--fa.fa-stack-2x{height:2em;width:2.5em}.fa-inverse{color:#fff}.sr-only{border:0;clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.sr-only-focusable:active,.sr-only-focusable:focus{clip:auto;height:auto;margin:0;overflow:visible;position:static;width:auto}.svg-inline--fa .fa-primary{fill:var(--fa-primary-color,currentColor);opacity:1;opacity:var(--fa-primary-opacity,1)}.svg-inline--fa .fa-secondary{fill:var(--fa-secondary-color,currentColor);opacity:.4;opacity:var(--fa-secondary-opacity,.4)}.svg-inline--fa.fa-swap-opacity .fa-primary{opacity:.4;opacity:var(--fa-secondary-opacity,.4)}.svg-inline--fa.fa-swap-opacity .fa-secondary{opacity:1;opacity:var(--fa-primary-opacity,1)}.svg-inline--fa mask .fa-primary,.svg-inline--fa mask .fa-secondary{fill:#000}.fad.fa-inverse{color:#fff}";

  function kl() {
    var c = C,
        l = L,
        h = $.familyPrefix,
        z = $.replacementClass,
        v = wl;

    if (h !== c || z !== l) {
      var a = new RegExp("\\.".concat(c, "\\-"), "g"),
          m = new RegExp("\\--".concat(c, "\\-"), "g"),
          s = new RegExp("\\.".concat(l), "g");
      v = v.replace(a, ".".concat(h, "-")).replace(m, "--".concat(h, "-")).replace(s, ".".concat(z));
    }

    return v;
  }

  function Zl() {
    $.autoAddCss && !Pl && (dc(kl()), Pl = !0);
  }

  function xl(l, c) {
    return Object.defineProperty(l, "abstract", {
      get: c
    }), Object.defineProperty(l, "html", {
      get: function get() {
        return l.abstract.map(function (c) {
          return Jc(c);
        });
      }
    }), Object.defineProperty(l, "node", {
      get: function get() {
        if (H) {
          var c = o.createElement("div");
          return c.innerHTML = l.html, c.children;
        }
      }
    }), l;
  }

  function ql(c) {
    var l = c.prefix,
        h = void 0 === l ? "fa" : l,
        z = c.iconName;
    if (z) return Gc(jl.definitions, h, z) || Gc(Y.styles, h, z);
  }

  var Ol,
      jl = new (function () {
    function c() {
      !function (c, l) {
        if (!(c instanceof l)) throw new TypeError("Cannot call a class as a function");
      }(this, c), this.definitions = {};
    }

    var l, h, z;
    return l = c, (h = [{
      key: "add",
      value: function value() {
        for (var l = this, c = arguments.length, h = new Array(c), z = 0; z < c; z++) {
          h[z] = arguments[z];
        }

        var v = h.reduce(this._pullDefinitions, {});
        Object.keys(v).forEach(function (c) {
          l.definitions[c] = G({}, l.definitions[c] || {}, v[c]), function c(l, z) {
            var h = (2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {}).skipHooks,
                v = void 0 !== h && h,
                a = Object.keys(z).reduce(function (c, l) {
              var h = z[l];
              return h.icon ? c[h.iconName] = h.icon : c[l] = h, c;
            }, {});
            "function" != typeof Y.hooks.addPack || v ? Y.styles[l] = G({}, Y.styles[l] || {}, a) : Y.hooks.addPack(l, a), "fas" === l && c("fa", z);
          }(c, v[c]), Uc();
        });
      }
    }, {
      key: "reset",
      value: function value() {
        this.definitions = {};
      }
    }, {
      key: "_pullDefinitions",
      value: function value(a, c) {
        var m = c.prefix && c.iconName && c.icon ? {
          0: c
        } : c;
        return Object.keys(m).map(function (c) {
          var l = m[c],
              h = l.prefix,
              z = l.iconName,
              v = l.icon;
          a[h] || (a[h] = {}), a[h][z] = v;
        }), a;
      }
    }]) && v(l.prototype, h), z && v(l, z), c;
  }())(),
      Pl = !1,
      El = {
    i2svg: function i2svg() {
      var c = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};

      if (H) {
        Zl();
        var l = c.node,
            h = void 0 === l ? o : l,
            z = c.callback,
            v = void 0 === z ? function () {} : z;
        return $.searchPseudoElements && yl(h), pl(h, v);
      }

      return oc.reject("Operation requires a DOM of some kind.");
    },
    css: kl,
    insertCss: function insertCss() {
      Pl || (dc(kl()), Pl = !0);
    },
    watch: function watch() {
      var c = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {},
          l = c.autoReplaceSvgRoot,
          h = c.observeMutationsRoot;
      !1 === $.autoReplaceSvg && ($.autoReplaceSvg = !0), $.observeMutations = !0, U(function () {
        Tl({
          autoReplaceSvgRoot: l
        }), sl({
          treeCallback: pl,
          nodeCallback: bl,
          pseudoElementsCallback: yl,
          observeMutationsRoot: h
        });
      });
    }
  },
      Nl = (Ol = function Ol(c) {
    var l = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {},
        h = l.transform,
        z = void 0 === h ? Lc : h,
        v = l.symbol,
        a = void 0 !== v && v,
        m = l.mask,
        s = void 0 === m ? null : m,
        e = l.maskId,
        t = void 0 === e ? null : e,
        M = l.title,
        f = void 0 === M ? null : M,
        r = l.titleId,
        H = void 0 === r ? null : r,
        n = l.classes,
        i = void 0 === n ? [] : n,
        V = l.attributes,
        o = void 0 === V ? {} : V,
        C = l.styles,
        L = void 0 === C ? {} : C;

    if (c) {
      var d = c.prefix,
          u = c.iconName,
          p = c.icon;
      return xl(G({
        type: "icon"
      }, c), function () {
        return Zl(), $.autoA11y && (f ? o["aria-labelledby"] = "".concat($.replacementClass, "-title-").concat(H || pc()) : (o["aria-hidden"] = "true", o.focusable = "false")), qc({
          icons: {
            main: Cl(p),
            mask: s ? Cl(s.icon) : {
              found: !1,
              width: null,
              height: null,
              icon: {}
            }
          },
          prefix: d,
          iconName: u,
          transform: G({}, Lc, z),
          symbol: a,
          title: f,
          maskId: t,
          titleId: H,
          extra: {
            attributes: o,
            styles: L,
            classes: i
          }
        });
      });
    }
  }, function (c) {
    var l = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {},
        h = (c || {}).icon ? c : ql(c || {}),
        z = l.mask;
    return z && (z = (z || {}).icon ? z : ql(z || {})), Ol(h, G({}, l, {
      mask: z
    }));
  }),
      _l = {
    noAuto: function noAuto() {
      $.autoReplaceSvg = !1, $.observeMutations = !1, ml && ml.disconnect();
    },
    config: $,
    dom: El,
    library: jl,
    parse: {
      transform: function transform(c) {
        return tl(c);
      }
    },
    findIconDefinition: ql,
    icon: Nl,
    text: function text(c) {
      var l = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {},
          h = l.transform,
          z = void 0 === h ? Lc : h,
          v = l.title,
          a = void 0 === v ? null : v,
          m = l.classes,
          s = void 0 === m ? [] : m,
          e = l.attributes,
          t = void 0 === e ? {} : e,
          M = l.styles,
          f = void 0 === M ? {} : M;
      return xl({
        type: "text",
        content: c
      }, function () {
        return Zl(), Oc({
          content: c,
          transform: G({}, Lc, z),
          title: a,
          extra: {
            attributes: t,
            styles: f,
            classes: ["".concat($.familyPrefix, "-layers-text")].concat(r(s))
          }
        });
      });
    },
    counter: function counter(c) {
      var l = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {},
          h = l.title,
          z = void 0 === h ? null : h,
          v = l.classes,
          a = void 0 === v ? [] : v,
          m = l.attributes,
          s = void 0 === m ? {} : m,
          e = l.styles,
          t = void 0 === e ? {} : e;
      return xl({
        type: "counter",
        content: c
      }, function () {
        return Zl(), function (c) {
          var l = c.content,
              h = c.title,
              z = c.extra,
              v = G({}, z.attributes, h ? {
            title: h
          } : {}, {
            class: z.classes.join(" ")
          }),
              a = yc(z.styles);
          0 < a.length && (v.style = a);
          var m = [];
          return m.push({
            tag: "span",
            attributes: v,
            children: [l]
          }), h && m.push({
            tag: "span",
            attributes: {
              class: "sr-only"
            },
            children: [h]
          }), m;
        }({
          content: c.toString(),
          title: z,
          extra: {
            attributes: s,
            styles: t,
            classes: ["".concat($.familyPrefix, "-layers-counter")].concat(r(a))
          }
        });
      });
    },
    layer: function layer(c) {
      var l = (1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {}).classes,
          h = void 0 === l ? [] : l;
      return xl({
        type: "layer"
      }, function () {
        Zl();
        var l = [];
        return c(function (c) {
          Array.isArray(c) ? c.map(function (c) {
            l = l.concat(c.abstract);
          }) : l = l.concat(c.abstract);
        }), [{
          tag: "span",
          attributes: {
            class: ["".concat($.familyPrefix, "-layers")].concat(r(h)).join(" ")
          },
          children: l
        }];
      });
    },
    toHtml: Jc
  },
      Tl = function Tl() {
    var c = (0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}).autoReplaceSvgRoot,
        l = void 0 === c ? o : c;
    (0 < Object.keys(Y.styles).length || $.autoFetchSvg) && H && $.autoReplaceSvg && _l.dom.i2svg({
      node: l
    });
  };

  !function (c) {
    try {
      c();
    } catch (c) {
      if (!k) throw c;
    }
  }(function () {
    f && (V.FontAwesome || (V.FontAwesome = _l), U(function () {
      Tl(), sl({
        treeCallback: pl,
        nodeCallback: bl,
        pseudoElementsCallback: yl
      });
    })), Y.hooks = G({}, Y.hooks, {
      addPack: function addPack(c, l) {
        Y.styles[c] = G({}, Y.styles[c] || {}, l), Uc(), Tl();
      },
      addShims: function addShims(c) {
        var l;
        (l = Y.shims).push.apply(l, r(c)), Uc(), Tl();
      }
    });
  });
}();