!function(e,t){"use strict";var n=Object.create(null),a=function(){return(new Date).getTime()};n.original="click","ontouchstart"in document.documentElement?(n.start="touchstart",n.end="touchend"):(n.start="mousedown",n.end="mouseup"),e.event.special.tap={setup:function(t,i,o){var r=e(this),g={};r.off(n.original).on(n.original,!1).on(n.start+" "+n.end,(function(e){g.event=e.originalEvent.changedTouches?e.originalEvent.changedTouches[0]:e})).on(n.start,(function(e){e.which&&1!==e.which||(g.target=e.target,g.pageX=g.event.pageX,g.pageY=g.event.pageY,g.time=a())})).on(n.end,(function(e){g.target===e.target&&a()-g.time<750&&g.pageX===g.event.pageX&&g.pageY===g.event.pageY&&(e.type="tap",e.pageX=g.event.pageX,e.pageY=g.event.pageY,o.call(this,e),e.isDefaultPrevented()||r.off(n.original).trigger(n.original))}))},remove:function(){e(this).off(n.start+" "+n.end)}},e.fn.tap=function(e){return this[e?"on":"trigger"]("tap",e)}}(jQuery);
//# sourceMappingURL=jquery.tap.js.map