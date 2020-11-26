/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 jquery.mb.components
 
 file: jquery.mb.simpleSlider.js
 last modified: 11/18/17 7:19 PM
 Version:  {{ version }}
 Build:  {{ buildnum }}
 
 Open Lab s.r.l., Florence - Italy 
 email:  matteo@open-lab.com
 blog: 	http://pupunzi.open-lab.com
 site: 	http://pupunzi.com
 	http://open-lab.com 
 
 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 
 Copyright (c) 2001-2018. Matteo Bicocchi (Pupunzi)
 :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/

(function ($) {

	$.simpleSlider = {
		defaults: {
			initialval : 0,
			maxval     : 100,
			orientation: "h",
			readonly   : false,
			callback   : false
		},

		events: {
			start: $.browser.mobile ? "touchstart" : "mousedown",
			end  : $.browser.mobile ? "touchend" : "mouseup",
			move : $.browser.mobile ? "touchmove" : "mousemove"
		},

		init: function (opt) {

			return this.each(function () {
				var el = this;
				var $el = $(el);

				$el.addClass("simpleSlider");

				el.opt = {};

				$.extend(el.opt, $.simpleSlider.defaults, opt);
				$.extend(el.opt, $el.data());

				console.debug($el.data());

				var levelClass = el.opt.orientation == "h" ? "horizontal" : "vertical";
				var level = $("<div/>").addClass("level").addClass(levelClass);

				$el.prepend(level);
				el.level = level;

				$el.css({cursor: "default"});

				if (el.opt.maxval == "auto")
					el.opt.maxval = $(el).outerWidth();

				$el.updateSliderVal();

				if (!el.opt.readonly) {

					$el.on($.simpleSlider.events.start, function (e) {

						if ($.browser.mobile)
							e = e.changedTouches[0];

						el.canSlide = true;
						$el.updateSliderVal(e);

						if (el.opt.orientation == "h")
							$el.css({cursor: "col-resize"});
						else
							$el.css({cursor: "row-resize"});

						el.lastVal = el.val;

						if (!$.browser.mobile) {
							e.preventDefault();
							e.stopPropagation();
						}
					});

					$(document).on($.simpleSlider.events.move, function (e) {

						if ($.browser.mobile)
							e = e.changedTouches[0];

						if (!el.canSlide)
							return;

						$(document).css({cursor: "default"});
						$el.updateSliderVal(e);

						if (!$.browser.mobile) {
							e.preventDefault();
							e.stopPropagation();
						}

					}).on($.simpleSlider.events.end, function () {
						$(document).css({cursor: "auto"});
						el.canSlide = false;
						$el.css({cursor: "auto"})
					});

				}
			})
		},

		updateSliderVal: function (e) {

			var $el = this;
			var el = $el.get(0);

			if (!el.opt)
				return;

			el.opt.initialval = typeof el.opt.initialval == "number" ? el.opt.initialval : el.opt.initialval(el);

			var elWidth = $(el).outerWidth();
			var elHeight = $(el).outerHeight();

			el.x = typeof e == "object" ? (e.clientX + document.body.scrollLeft) - $el.offset().left : typeof e == "number" ? (e * elWidth) / el.opt.maxval : (el.opt.initialval * elWidth) / el.opt.maxval;
			el.y = typeof e == "object" ? (e.clientY + document.body.scrollTop) - $el.offset().top : typeof e == "number" ? ((el.opt.maxval - el.opt.initialval - e) * elHeight) / el.opt.maxval : (el.opt.initialval * elHeight) / el.opt.maxval;
			el.y = $el.outerHeight() - el.y;

			el.scaleX = (el.x * el.opt.maxval) / elWidth;
			el.scaleY = (el.y * el.opt.maxval) / elHeight;

			el.outOfRangeX = el.scaleX > el.opt.maxval ? (el.scaleX - el.opt.maxval) : el.scaleX < 0 ? el.scaleX : 0;
			el.outOfRangeY = el.scaleY > el.opt.maxval ? (el.scaleY - el.opt.maxval) : el.scaleY < 0 ? el.scaleY : 0;
			el.outOfRange = el.opt.orientation == "h" ? el.outOfRangeX : el.outOfRangeY;

			if (typeof e != "undefined")
				el.value = el.opt.orientation == "h" ? (el.x >= $el.outerWidth() ? el.opt.maxval : el.x <= 0 ? 0 : el.scaleX) : (el.y >= $el.outerHeight() ? el.opt.maxval : el.y <= 0 ? 0 : el.scaleY);
			else
				el.value = el.opt.orientation == "h" ? el.scaleX : el.scaleY;

			if (el.opt.orientation == "h")
				el.level.width(getPercent(el.x, elWidth) + "%");
			else {
				el.level.height(getPercent(el.y, elHeight));
			}

			function getPercent(val, tot) {
				return Math.floor((val * 100) / tot);
			}

			if (el.lastVal === el.value && ((el.opt.orientation === "h" && (el.x >= $el.outerWidth() || el.x <= 0)) || (el.opt.orientation !== "h" && (el.y >= $el.outerHeight() || el.y <= 0))))
				return;

			if (typeof el.opt.callback === "function")
				el.opt.callback(el);

			el.lastVal = el.value;
		}
	};

	$.fn.simpleSlider = $.simpleSlider.init;
	$.fn.updateSliderVal = $.simpleSlider.updateSliderVal;

})(jQuery);
