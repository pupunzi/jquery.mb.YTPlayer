/*
 * ******************************************************************************
 *  jquery.mb.components
 *
 *  Copyright (c) 2001-2013. Matteo Bicocchi (Pupunzi); Open lab srl, Firenze - Italy
 *  email: matteo@open-lab.com
 *  site: http://pupunzi.com
 *
 *  Licences: MIT, GPL
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *  *****************************************************************************
 */

/*
 *
 * jQuery.mb.components: jquery.mb.CSSAnimate
 * version: 1.6
 * © 2001 - 2012 Matteo Bicocchi (pupunzi), Open Lab
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
 @callback   -> a callback function called once the transition end

 example:

 jQuery(this).CSSAnimate({top: t, left:l, width:w, height:h}, 2000, "ease-out", "all", function() {el.anim();})
 */



/*Browser detection patch*/
jQuery.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase());
jQuery.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
jQuery.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

jQuery.fn.CSSAnimate = function(opt, duration, delay, ease, callback) {
	return this.each(function() {

		var el = jQuery(this);

		if (el.length === 0 || !opt) {return;}

		if (typeof duration == "function") {callback = duration; duration = jQuery.fx.speeds["_default"];}
		if (typeof delay == "function") {callback = delay; delay=0}
		if (typeof ease == "function") {callback = ease; ease = "cubic-bezier(0.65,0.03,0.36,0.72)";}


		if(typeof duration == "string"){
			for(var d in jQuery.fx.speeds){
				if(duration==d){
					duration= jQuery.fx.speeds[d];
					break;
				}else{
					duration=null;
				}
			}
		}

		//http://cssglue.com/cubic
		//  ease  |  linear | ease-in | ease-out | ease-in-out  |  cubic-bezier(<number>, <number>,  <number>,  <number>)

		if (!jQuery.support.transition) {

			for(var o in opt){
				if (o==="transform"){
					delete opt[o];
				}
				if (o==="transform-origin"){
					delete opt[o];
				}
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
		if (jQuery.browser.webkit) {
			sfx = "-webkit-";
			transitionEnd = "webkitTransitionEnd";
		} else if (jQuery.browser.mozilla) {
			sfx = "-moz-";
			transitionEnd = "transitionend";
		} else if (jQuery.browser.opera) {
			sfx = "-o-";
			transitionEnd = "otransitionend";
		} else if (jQuery.browser.msie) {
			sfx = "-ms-";
			transitionEnd = "msTransitionEnd";
		}

		var prop = [];
		for(var o in opt){
			var key = o;
			if (key==="transform"){
				key = sfx+"transform";
				opt[key]=opt[o];
				delete opt[o];
			}
			if (key==="transform-origin"){
				key = sfx+"transform-origin";
				opt[key]=opt[o];
				delete opt[o];
			}
			prop.push(key);

			if(!el.css(key))
				el.css(key,0);
		}
		var properties = prop.join(",");

		el.css(sfx + "transition-property", properties);
		el.css(sfx + "transition-duration", duration + "ms");
		el.css(sfx + "transition-delay", delay + "ms");
		el.css(sfx + "transition-timing-function", ease);
		el.css(sfx + "backface-visibility","hidden");

		setTimeout(function() {
			el.css(opt);
		}, 0);

		var endTransition = function(e) {
			el.off(transitionEnd);
			el.css(sfx + "transition", "");
			e.stopPropagation();
			if (typeof callback == "function"){
				el.called =true;
				callback();
			}
			return false;
		};

		//if there's no transition than call the callback anyway
		setTimeout(function(){
			if(el.called || !callback){
				el.called = false;
				return;
			}
			callback();
		},duration+20);

		el.on(transitionEnd, endTransition);
	})
};

jQuery.fn.CSSAnimateStop=function(){
	var sfx = "";
	var transitionEnd = "transitionEnd";
	if (jQuery.browser.webkit) {
		sfx = "-webkit-";
		transitionEnd = "webkitTransitionEnd";
	} else if (jQuery.browser.mozilla) {
		sfx = "-moz-";
		transitionEnd = "transitionend";
	} else if (jQuery.browser.opera) {
		sfx = "-o-";
		transitionEnd = "otransitionend";
	} else if (jQuery.browser.msie) {
		sfx = "-ms-";
		transitionEnd = "msTransitionEnd";
	}

	jQuery(this).css(sfx + "transition", "");
	jQuery(this).off(transitionEnd);
};

// jQuery.support.transition
// to verify that CSS3 transition is supported (or any of its browser-specific implementations)
jQuery.support.transition = (function() {
	var thisBody = document.body || document.documentElement;
	var thisStyle = thisBody.style;
	return thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
})();