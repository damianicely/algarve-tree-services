function _typeof(c){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(c){return typeof c}:function(c){return c&&"function"==typeof Symbol&&c.constructor===Symbol&&c!==Symbol.prototype?"symbol":typeof c})(c)}
/*!
 * imagesLoaded PACKAGED v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */
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
var _gsScope;!function(c,t){"function"==typeof define&&define.amd?define("ev-emitter/ev-emitter",t):"object"==("undefined"==typeof module?"undefined":_typeof(module))&&module.exports?module.exports=t():c.EvEmitter=t()}("undefined"!=typeof window?window:this,(function(){function c(){}var t=c.prototype;return t.on=function(c,t){if(c&&t){var e=this._events=this._events||{},l=e[c]=e[c]||[];return-1==l.indexOf(t)&&l.push(t),this}},t.once=function(c,t){if(c&&t){this.on(c,t);var e=this._onceEvents=this._onceEvents||{};return(e[c]=e[c]||{})[t]=!0,this}},t.off=function(c,t){var e=this._events&&this._events[c];if(e&&e.length){var l=e.indexOf(t);return-1!=l&&e.splice(l,1),this}},t.emitEvent=function(c,t){var e=this._events&&this._events[c];if(e&&e.length){e=e.slice(0),t=t||[];for(var l=this._onceEvents&&this._onceEvents[c],a=0;a<e.length;a++){var h=e[a];l&&l[h]&&(this.off(c,h),delete l[h]),h.apply(this,t)}return this}},t.allOff=function(){delete this._events,delete this._onceEvents},c})),
/*!
 * imagesLoaded v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */
//# sourceMappingURL=plugins.js.map