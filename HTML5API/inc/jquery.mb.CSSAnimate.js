/*******************************************************************************
 jquery.mb.components
 Copyright (c) 2001-2012. Matteo Bicocchi (Pupunzi); Open lab srl, Firenze - Italy
 email: mbicocchi@open-lab.com
 site: http://pupunzi.com
 blog: http://pupunzi.open-lab.com

 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html

 ******************************************************************************/

/*
 *
 * jQuery.mb.components: jquery.mb.CSSAnimate
 * version: 1.0- 04/12/11 - 18
 * © 2001 - 2011 Matteo Bicocchi (pupunzi), Open Lab
 *
 * Licences: MIT, GPL
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * email: mbicocchi@open-lab.com
 * site: http://pupunzi.com
 *
 *  params:

 @opt        -> the CSS object (ex: {top:300, left:400, ...})
 @duration   -> an int for the animation duration in milliseconds
 @ease       -> ease  ||  linear || ease-in || ease-out || ease-in-out  ||  cubic-bezier(<number>, <number>,  <number>,  <number>)
 @properties -> properties to which CSS3 transition should be applied.
 @callback   -> a callback function called once the transition end

 example:

 $(this).CSSAnimate({top: t, left:l, width:w, height:h}, 2000, "ease-out", "all", function() {el.anim();})
 */

$.fn.CSSAnimate = function(opt, duration, delay, ease, properties, callback) {
  return this.each(function() {

    var el = $(this);
    if (el.length === 0 || !opt) {return;}

    if (typeof duration == "function") {callback = duration; duration = $.fx.speeds["_default"];}
    if (typeof delay == "function") {callback = delay; delay=0}
    if (typeof ease == "function") {callback = ease; ease = "cubic-bezier(0.65,0.03,0.36,0.72)";}
    if (typeof properties == "function") {callback = properties; properties = "all";}

    if(typeof duration == "string"){
      for(var d in $.fx.speeds){
        if(duration==d){
          duration= $.fx.speeds[d];
          break;
        }else{
          duration=null;
        }
      }
    }

    //http://cssglue.com/cubic
    //  ease  |  linear | ease-in | ease-out | ease-in-out  |  cubic-bezier(<number>, <number>,  <number>,  <number>)

    if (!$.support.transition) {

      for(var o in opt){
        if (o==="transform"){
          delete opt[o];
        }
      }

      for(var o in opt){
        if (opt[o]==="auto"){
          delete opt[o];
        }
      }

      if(!callback || typeof callback==="string")
        callback ="linear";

      el.animate(opt, duration, callback);
      return;
    }

    var sfx = "";
    var transitionEnd = "transitionEnd";
    if ($.browser.webkit) {
      sfx = "-webkit-";
      transitionEnd = "webkitTransitionEnd";
    } else if ($.browser.mozilla) {
      sfx = "-moz-";
      transitionEnd = "transitionend";
    } else if ($.browser.opera) {
      sfx = "-o-";
      transitionEnd = "oTransitionEnd";
    } else if ($.browser.msie) {
      sfx = "-ms-";
      transitionEnd = "msTransitionEnd";
    }

    for(var o in opt){
      if (o==="transform"){
        opt[sfx+"transform"]=opt[o];
        delete opt[o];
      }
      if (o==="transform-origin"){
        opt[sfx+"transform-origin"]=opt[o];
        delete opt[o];
      }
    }

    if (properties === "transform")
      properties = sfx+properties;

    el.CSSAnimateStop();

    el.css(sfx + "transition-property", properties);
    el.css(sfx + "transition-duration", duration + "ms");
    el.css(sfx + "transition-delay", delay + "ms");
    el.css(sfx + "transition-timing-function", ease);
    el.css(sfx + "backface-visibility","hidden");

    setTimeout(function() {
      el.css(opt);
      el.off(transitionEnd+".cssanim");
      var endTransition = function(e) {
        el.off(transitionEnd+".cssanim");
        el.css(sfx + "transition", "");


        if (typeof callback == "function"){
          callback();
        }
        e.stopPropagation();
        return false;
      };
      el.on(transitionEnd+".cssanim", endTransition);
    }, 10);

  })
};

$.fn.CSSAnimateStop=function(){
  var sfx = "";
  var transitionEnd = "transitionEnd";
  if ($.browser.webkit) {
    sfx = "-webkit-";
    transitionEnd = "webkitTransitionEnd";
  } else if ($.browser.mozilla) {
    sfx = "-moz-";
    transitionEnd = "transitionend";
  } else if ($.browser.opera) {
    sfx = "-o-";
    transitionEnd = "oTransitionEnd";
  } else if ($.browser.msie) {
    sfx = "-ms-";
    transitionEnd = "msTransitionEnd";
  }
  $(this).css(sfx + "transition", "");
  $(this).off(transitionEnd+".cssanim");

};

// jQuery.support.transition
// to verify that CSS3 transition is supported (or any of its browser-specific implementations)
$.support.transition = (function() {
  var thisBody = document.body || document.documentElement;
  var thisStyle = thisBody.style;
  return thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
})();