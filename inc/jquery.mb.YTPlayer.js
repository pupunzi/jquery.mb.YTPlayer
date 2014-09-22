/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.YTPlayer.js                                                                                                                      _
 _ last modified: 19/08/14 20.13                                                                                                                    _
 _                                                                                                                                                  _
 _ Open Lab s.r.l., Florence - Italy                                                                                                                _
 _                                                                                                                                                  _
 _ email: matteo@open-lab.com                                                                                                                       _
 _ site: http://pupunzi.com                                                                                                                         _
 _       http://open-lab.com                                                                                                                        _
 _ blog: http://pupunzi.open-lab.com                                                                                                                _
 _ Q&A:  http://jquery.pupunzi.com                                                                                                                  _
 _                                                                                                                                                  _
 _ Licences: MIT, GPL                                                                                                                               _
 _    http://www.opensource.org/licenses/mit-license.php                                                                                            _
 _    http://www.gnu.org/licenses/gpl.html                                                                                                          _
 _                                                                                                                                                  _
 _ Copyright (c) 2001-2014. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/

var ytp = ytp || {};

function onYouTubePlayerAPIReady() {
	if(ytp.YTAPIReady)
		return;

	ytp.YTAPIReady=true;
	jQuery(document).trigger("YTAPIReady");
}

(function ($, ytp) {

	/*Browser detection patch*/
	var nAgt = navigator.userAgent;
	if (!$.browser) {
		$.browser = {};
		$.browser.mozilla = !1;
		$.browser.webkit = !1;
		$.browser.opera = !1;
		$.browser.safari = !1;
		$.browser.chrome = !1;
		$.browser.msie = !1;
		$.browser.ua = nAgt;
		$.browser.name = navigator.appName;
		$.browser.fullVersion = "" + parseFloat(navigator.appVersion);
		$.browser.majorVersion = parseInt(navigator.appVersion, 10);
		var nameOffset, verOffset, ix;
		if (-1 != (verOffset = nAgt.indexOf("Opera")))$.browser.opera = !0, $.browser.name = "Opera", $.browser.fullVersion = nAgt.substring(verOffset + 6), -1 != (verOffset = nAgt.indexOf("Version")) && ($.browser.fullVersion = nAgt.substring(verOffset + 8)); else if (-1 != (verOffset = nAgt.indexOf("MSIE")))$.browser.msie = !0, $.browser.name = "Microsoft Internet Explorer", $.browser.fullVersion = nAgt.substring(verOffset + 5); else if (-1 != nAgt.indexOf("Trident")) {
			$.browser.msie = !0;
			$.browser.name = "Microsoft Internet Explorer";
			var start = nAgt.indexOf("rv:") + 3, end = start + 4;
			$.browser.fullVersion = nAgt.substring(start, end)
		} else-1 != (verOffset = nAgt.indexOf("Chrome")) ? ($.browser.webkit = !0, $.browser.chrome = !0, $.browser.name = "Chrome", $.browser.fullVersion = nAgt.substring(verOffset + 7)) : -1 != (verOffset = nAgt.indexOf("Safari")) ? ($.browser.webkit = !0, $.browser.safari = !0, $.browser.name = "Safari", $.browser.fullVersion = nAgt.substring(verOffset + 7), -1 != (verOffset = nAgt.indexOf("Version")) && ($.browser.fullVersion = nAgt.substring(verOffset + 8))) : -1 != (verOffset = nAgt.indexOf("AppleWebkit")) ? ($.browser.webkit = !0, $.browser.name = "Safari", $.browser.fullVersion = nAgt.substring(verOffset + 7), -1 != (verOffset = nAgt.indexOf("Version")) && ($.browser.fullVersion = nAgt.substring(verOffset + 8))) : -1 != (verOffset = nAgt.indexOf("Firefox")) ? ($.browser.mozilla = !0, $.browser.name = "Firefox", $.browser.fullVersion = nAgt.substring(verOffset + 8)) : (nameOffset = nAgt.lastIndexOf(" ") + 1) < (verOffset = nAgt.lastIndexOf("/")) && ($.browser.name = nAgt.substring(nameOffset, verOffset), $.browser.fullVersion = nAgt.substring(verOffset + 1), $.browser.name.toLowerCase() == $.browser.name.toUpperCase() && ($.browser.name = navigator.appName));
		-1 != (ix = $.browser.fullVersion.indexOf(";")) && ($.browser.fullVersion = $.browser.fullVersion.substring(0, ix));
		-1 != (ix = $.browser.fullVersion.indexOf(" ")) && ($.browser.fullVersion = $.browser.fullVersion.substring(0, ix));
		$.browser.majorVersion = parseInt("" + $.browser.fullVersion, 10);
		isNaN($.browser.majorVersion) && ($.browser.fullVersion = "" + parseFloat(navigator.appVersion), $.browser.majorVersion = parseInt(navigator.appVersion, 10));
		$.browser.version = $.browser.majorVersion
	}
	$.browser.android = /Android/i.test(nAgt);
	$.browser.blackberry = /BlackBerry/i.test(nAgt);
	$.browser.ios = /iPhone|iPad|iPod/i.test(nAgt);
	$.browser.operaMobile = /Opera Mini/i.test(nAgt);
	$.browser.windowsMobile = /IEMobile/i.test(nAgt);
	$.browser.mobile = $.browser.android || $.browser.blackberry || $.browser.ios || $.browser.windowsMobile || $.browser.operaMobile;

	ytp.isDevice = $.browser.mobile;

	/*******************************************************************************
	 * $.mb.components: jquery.mb.CSSAnimate
	 ******************************************************************************/

	$.fn.CSSAnimate=function(a,g,p,m,h){function r(a){return a.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()})}function f(a,f){return"string"!==typeof a||a.match(/^[\-0-9\.]+$/)?""+a+f:a}$.support.CSStransition=function(){var a=(document.body||document.documentElement).style;return void 0!==a.transition||void 0!==a.WebkitTransition||void 0!==a.MozTransition||void 0!==a.MsTransition||void 0!==a.OTransition}();return this.each(function(){var e=this,k=$(this);e.id=e.id||"CSSA_"+ (new Date).getTime();var l=l||{type:"noEvent"};if(e.CSSAIsRunning&&e.eventType==l.type)e.CSSqueue=function(){k.CSSAnimate(a,g,p,m,h)};else if(e.CSSqueue=null,e.eventType=l.type,0!==k.length&&a){e.CSSAIsRunning=!0;"function"==typeof g&&(h=g,g=$.fx.speeds._default);"function"==typeof p&&(h=p,p=0);"function"==typeof m&&(h=m,m="cubic-bezier(0.65,0.03,0.36,0.72)");if("string"==typeof g)for(var b in $.fx.speeds)if(g==b){g=$.fx.speeds[b];break}else g=$.fx.speeds._default;g||(g=$.fx.speeds._default); if($.support.CSStransition){l={"default":"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)", easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)", easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};l[m]&&(m=l[m]);var d="",q="transitionEnd";$.browser.webkit?(d="-webkit-",q="webkitTransitionEnd"):$.browser.mozilla?(d="-moz-",q="transitionend"):$.browser.opera?(d="-o-",q="otransitionend"):$.browser.msie&&(d="-ms-",q="msTransitionEnd");l=[];for(c in a){b=c;"transform"===b&&(b=d+"transform",a[b]=a[c],delete a[c]);"filter"===b&&(b=d+"filter",a[b]=a[c],delete a[c]);if("transform-origin"=== b||"origin"===b)b=d+"transform-origin",a[b]=a[c],delete a[c];"x"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" translateX("+f(a[c],"px")+")",delete a[c]);"y"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" translateY("+f(a[c],"px")+")",delete a[c]);"z"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" translateZ("+f(a[c],"px")+")",delete a[c]);"rotate"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" rotate("+f(a[c],"deg")+")",delete a[c]);"rotateX"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" rotateX("+f(a[c],"deg")+ ")",delete a[c]);"rotateY"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" rotateY("+f(a[c],"deg")+")",delete a[c]);"rotateZ"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" rotateZ("+f(a[c],"deg")+")",delete a[c]);"scale"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" scale("+f(a[c],"")+")",delete a[c]);"scaleX"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" scaleX("+f(a[c],"")+")",delete a[c]);"scaleY"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" scaleY("+f(a[c],"")+")",delete a[c]);"scaleZ"===b&&(b=d+"transform", a[b]=a[b]||"",a[b]+=" scaleZ("+f(a[c],"")+")",delete a[c]);"skew"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" skew("+f(a[c],"deg")+")",delete a[c]);"skewX"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" skewX("+f(a[c],"deg")+")",delete a[c]);"skewY"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" skewY("+f(a[c],"deg")+")",delete a[c]);"perspective"===b&&(b=d+"transform",a[b]=a[b]||"",a[b]+=" perspective("+f(a[c],"px")+")",delete a[c]);0>l.indexOf(b)&&l.push(r(b))}var c=l.join(","),s=function(){k.off(q+"."+ e.id);clearTimeout(e.timeout);k.css(d+"transition","");"function"==typeof h&&h(k);e.called=!0;e.CSSAIsRunning=!1;"function"==typeof e.CSSqueue&&(e.CSSqueue(),e.CSSqueue=null)},n={};$.extend(n,a);n[d+"transition-property"]=c;n[d+"transition-duration"]=g+"ms";n[d+"transition-delay"]=p+"ms";n[d+"transition-style"]="preserve-3d";n[d+"transition-timing-function"]=m;setTimeout(function(){k.one(q+"."+e.id,s);k.css(n)},1);e.timeout=setTimeout(function(){k.called||!h?(k.called=!1,e.CSSAIsRunning=!1):(k.css(d+ "transition",""),h(k),e.CSSAIsRunning=!1,"function"==typeof e.CSSqueue&&(e.CSSqueue(),e.CSSqueue=null))},g+p+100)}else{for(var c in a)"transform"===c&&delete a[c],"filter"===c&&delete a[c],"transform-origin"===c&&delete a[c],"auto"===a[c]&&delete a[c];h&&"string"!==typeof h||(h="linear");k.animate(a,g,h)}}})};

	/******************************************************************************/

        var getYTPVideoID=function(url) {
                var movieURL;
                if(url.substr(0,16)=="http://youtu.be/"){
                        movieURL= url.replace("http://youtu.be/","");
                }else if(url.substr(0,17)=="https://youtu.be/"){
                        movieURL= url.replace("https://youtu.be/","");
                }else if(url.indexOf("http")>-1){
                        movieURL = url.match(/[\\?&]v=([^&#]*)/)[1];
                }else{
                        movieURL = url
                }
                return movieURL;
        };


	$.mbYTPlayer = {
		name            : "jquery.mb.YTPlayer",
		version         : "2.7.2",
		author          : "Matteo Bicocchi",
		defaults        : {
			containment            : "body",
			ratio                  : "16/9",
			videoURL               : null,
			startAt                : 0,
			stopAt                 : 0,
			autoPlay               : true,
			vol                    : 100, // 1 to 100
			addRaster              : false,
			opacity                : 1,
			quality                : "default", //or “small”, “medium”, “large”, “hd720”, “hd1080”, “highres”
			mute                   : false,
			loop                   : true,
			showControls           : true,
			showAnnotations        : false,
			showYTLogo             : true,
			stopMovieOnClick       : false,
			realfullscreen         : true,
			gaTrack                : true,
			onReady                : function (player) {},
			onStateChange          : function (player) {},
			onPlaybackQualityChange: function (player) {},
			onError                : function (player) {}
		},

		/*@fontface icons*/
		controls        : {
			play    : "P",
			pause   : "p",
			mute    : "M",
			unmute  : "A",
			onlyYT  : "O",
			showSite: "R",
			ytLogo  : "Y"
		},
		rasterImg       : "images/raster.png",
		rasterImgRetina : "images/raster@2x.png",
		locationProtocol: "https:",

		buildPlayer: function (options) {
			return this.each(function () {
				var YTPlayer = this;
				var $YTPlayer = $(YTPlayer);

				YTPlayer.loop = 0;
				YTPlayer.opt = {};

				$YTPlayer.addClass("mb_YTVPlayer");

				var property = $YTPlayer.data("property") && typeof $YTPlayer.data("property") == "string" ? eval('(' + $YTPlayer.data("property") + ')') : $YTPlayer.data("property");

				if(typeof property!="undefined" && typeof property.vol != "undefined")
					property.vol = property.vol == 0 ? property.vol = 1: property.vol;

				$.extend(YTPlayer.opt, $.mbYTPlayer.defaults, options, property);

				var canGoFullscreen = !($.browser.msie || $.browser.opera || self.location.href != top.location.href);

				if (!canGoFullscreen)
					YTPlayer.opt.realfullscreen = false;

				if (!$YTPlayer.attr("id"))
					$YTPlayer.attr("id", "YTP_" + new Date().getTime());

				YTPlayer.opt.id = YTPlayer.id;
				YTPlayer.isAlone = false;

				var playerID = "mbYTP_" + YTPlayer.id;
				var videoID = this.opt.videoURL ? getYTPVideoID(this.opt.videoURL) : $YTPlayer.attr("href") ? getYTPVideoID($YTPlayer.attr("href")) : false;
				YTPlayer.videoID = videoID;

				YTPlayer.opt.showAnnotations = (YTPlayer.opt.showAnnotations) ? '0' : '3';
				var playerVars = { 'autoplay': 0, 'modestbranding': 1, 'controls': 0, 'showinfo': 0, 'rel': 0, 'enablejsapi': 1, 'version': 3, 'playerapiid': playerID, 'origin': '*', 'allowfullscreen': true, 'wmode': 'transparent', 'iv_load_policy': YTPlayer.opt.showAnnotations};

				var canPlayHTML5 = false;
				var v = document.createElement('video');
				if (v.canPlayType) {
					canPlayHTML5 = true;
				}

				if (canPlayHTML5)
					$.extend(playerVars, {'html5': 1});

				if ($.browser.msie && $.browser.version < 9) {
					this.opt.opacity = 1;
				}

				var playerBox = $("<div/>").attr("id", playerID).addClass("playerBox");
				var overlay = $("<div/>").css({position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}).addClass("YTPOverlay"); //YTPlayer.isBackground ? "fixed" :

				YTPlayer.isSelf = YTPlayer.opt.containment == "self";
				YTPlayer.opt.containment = YTPlayer.opt.containment == "self" ? $(this) : $(YTPlayer.opt.containment);
				YTPlayer.isBackground = YTPlayer.opt.containment.get(0).tagName.toLowerCase() == "body";

				if (YTPlayer.isBackground && ytp.backgroundIsInited)
					return;

				if (!YTPlayer.opt.containment.is($(this))) {
					$YTPlayer.hide();
				} else {
					YTPlayer.isPlayer = true;
				}

				if (ytp.isDevice && YTPlayer.isBackground) {
					$YTPlayer.remove();
					return;
				}

				if (YTPlayer.opt.addRaster) {
					var classN = YTPlayer.opt.addRaster == "dot" ? "raster-dot" : "raster";

					var retina = (window.retina || window.devicePixelRatio > 1);
					overlay.addClass(retina ? classN + " retina" : classN);
				} else {

					overlay.removeClass(function (index, classNames) {
						var current_classes = classNames.split(" "), // change the list into an array
								classes_to_remove = []; // array of classes which are to be removed

						$.each(current_classes, function (index, class_name) {
							// if the classname begins with bg add it to the classes_to_remove array
							if (/raster-.*/.test(class_name)) {
								classes_to_remove.push(class_name);
							}
						});
						classes_to_remove.push("retina");
						// turn the array back into a string
						return classes_to_remove.join(" ");
					})
				}

				var wrapper = $("<div/>").addClass("mbYTP_wrapper").attr("id", "wrapper_" + playerID);
				wrapper.css({position: "absolute", zIndex: 0, minWidth: "100%", minHeight: "100%", left: 0, top: 0, overflow: "hidden", opacity: 0});
				playerBox.css({position: "absolute", zIndex: 0, width: "100%", height: "100%", top: 0, left: 0, overflow: "hidden", opacity: this.opt.opacity});
				wrapper.append(playerBox);


				YTPlayer.opt.containment.children().not("script, style").each(function () {
					if ($(this).css("position") == "static")
						$(this).css("position", "relative");
				});

				if (YTPlayer.isBackground) {
					$("body").css({position: "relative", minWidth: "100%", minHeight: "100%", zIndex: 1, boxSizing: "border-box"});
					wrapper.css({position: "fixed", top: 0, left: 0, zIndex: 0, webkitTransform: "translateZ(0)"});
					$YTPlayer.hide();
				} else if (YTPlayer.opt.containment.css("position") == "static")
					YTPlayer.opt.containment.css({position: "relative"});


				YTPlayer.opt.containment.prepend(wrapper);
				YTPlayer.wrapper = wrapper;

				playerBox.css({opacity: 1});

				if (!ytp.isDevice) {
					playerBox.after(overlay);
					YTPlayer.overlay = overlay;
				}

				if (!YTPlayer.isBackground) {
					overlay.on("mouseenter", function () {
						$YTPlayer.find(".mb_YTVPBar").addClass("visible");
					}).on("mouseleave", function () {
								$YTPlayer.find(".mb_YTVPBar").removeClass("visible");
							})
				}

				if (!ytp.YTAPIReady) {

					$("#YTAPI").remove();
					var tag = $("<script></script>").attr({"src": $.mbYTPlayer.locationProtocol + "//www.youtube.com/player_api?v=" + $.mbYTPlayer.version, "id": "YTAPI"});
					$("head title").after(tag);

				} else {

					setTimeout(function () {
						$(document).trigger("YTAPIReady");
					}, 100)

				}

				$(document).on("YTAPIReady", function () {

					if ((YTPlayer.isBackground && ytp.backgroundIsInited) || YTPlayer.isInit)
						return;

					if (YTPlayer.isBackground && YTPlayer.opt.stopMovieOnClick)
						$(document).off("mousedown.ytplayer").on("mousedown,.ytplayer", function (e) {
							var target = $(e.target);
							if (target.is("a") || target.parents().is("a")) {
								$YTPlayer.pauseYTP();
							}
						});

					if (YTPlayer.isBackground){
						ytp.backgroundIsInited = true;
					}

					YTPlayer.opt.autoPlay = typeof YTPlayer.opt.autoPlay == "undefined" ? (YTPlayer.isBackground ? true : false) : YTPlayer.opt.autoPlay;

					YTPlayer.opt.vol = YTPlayer.opt.vol ? YTPlayer.opt.vol : 100;

					$.mbYTPlayer.getDataFromFeed(YTPlayer.videoID, YTPlayer);

					$(YTPlayer).on("YTPChanged", function () {

						if (YTPlayer.isInit)
							return;

						YTPlayer.isInit = true;

						if (ytp.isDevice && !YTPlayer.isBackground) {
							new YT.Player(playerID, {
								videoId: YTPlayer.videoID.toString(),
								height : '100%',
								width  : '100%',
								videoId: YTPlayer.videoID,
								events : {
									'onReady'      : function (event) {
										YTPlayer.player = event.target;
										playerBox.css({opacity: 1});
										YTPlayer.wrapper.css({opacity: YTPlayer.opt.opacity});
										$YTPlayer.optimizeDisplay();
									},
									'onStateChange': function () {}
								}
							});
							return;
						}

						new YT.Player(playerID, {
							videoId   : YTPlayer.videoID.toString(),
							playerVars: playerVars,
							events    : {
								'onReady': function (event) {

									YTPlayer.player = event.target;

									if (YTPlayer.isReady)
										return;

									YTPlayer.isReady = true;

									YTPlayer.playerEl = YTPlayer.player.getIframe();
									$YTPlayer.optimizeDisplay();

									YTPlayer.videoID = videoID;

									$(window).on("resize.YTP", function () {
										$YTPlayer.optimizeDisplay();
									});

									if (YTPlayer.opt.showControls)
										$(YTPlayer).buildYTPControls();

									var startAt = YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;

									YTPlayer.player.setVolume(0);
									$(YTPlayer).muteYTPVolume();

									$.mbYTPlayer.checkForState(YTPlayer);

									YTPlayer.checkForStartAt = setInterval(function () {

										var canPlayVideo = (YTPlayer.player.getVideoLoadedFraction() > startAt/YTPlayer.player.getDuration());

										if (YTPlayer.player.getDuration() > 0 && YTPlayer.player.getCurrentTime() >= startAt &&  canPlayVideo) {

											clearInterval(YTPlayer.checkForStartAt);

											YTPlayer.player.setVolume(0);
											$(YTPlayer).muteYTPVolume();

											if (typeof YTPlayer.opt.onReady == "function")
												YTPlayer.opt.onReady($YTPlayer);

											if (!YTPlayer.opt.mute)
												$(YTPlayer).unmuteYTPVolume();

											$.mbYTPlayer.checkForState(YTPlayer);

											YTPlayer.player.pauseVideo();

											setTimeout(function(){
												if (YTPlayer.opt.autoPlay){
													$YTPlayer.playYTP();
													$YTPlayer.css("background-image", "none");
												} else  {
													YTPlayer.player.pauseVideo();
												}
												YTPlayer.wrapper.CSSAnimate({opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity}, 2000);
											},100)

										}else{
											YTPlayer.player.playVideo();
											YTPlayer.player.seekTo(startAt, true);
										}
									}, $.browser.chrome ? 1000 : 1);
								},

								'onStateChange'          : function (event) {

									/*
									 -1 (unstarted)
									 0 (ended)
									 1 (playing)
									 2 (paused)
									 3 (buffering)
									 5 (video cued).
									 */

									if (typeof event.target.getPlayerState != "function")
										return;
									var state = event.target.getPlayerState();

									if (typeof YTPlayer.opt.onStateChange == "function")
										YTPlayer.opt.onStateChange($YTPlayer, state);

									var controls = $("#controlBar_" + YTPlayer.id);

									var data = YTPlayer.opt;
//------------------------------------------------------------------ ended
									if (state == 0) {
										if (YTPlayer.state == state)
											return;

										YTPlayer.state = state;
										YTPlayer.player.pauseVideo();
										var startAt = YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;

										if (data.loop) {
											YTPlayer.wrapper.css({opacity: 0});
											$YTPlayer.playYTP();
											YTPlayer.player.seekTo(startAt, true);

										} else if (!YTPlayer.isBackground) {
											YTPlayer.player.seekTo(startAt, true);
											$YTPlayer.playYTP();
											setTimeout(function () {
												$YTPlayer.pauseYTP();
											}, 10);
										}

										if (!data.loop && YTPlayer.isBackground)
											YTPlayer.wrapper.CSSAnimate({opacity: 0}, 2000);
										else if (data.loop) {
											YTPlayer.wrapper.css({opacity: 0});
											YTPlayer.loop++;
										}

										controls.find(".mb_YTVPPlaypause").html($.mbYTPlayer.controls.play);
										$(YTPlayer).trigger("YTPEnd");
									}
//------------------------------------------------------------------ buffering
									if (state == 3) {
										if (YTPlayer.state == state)
											return;

										YTPlayer.state = state;

										if(!$.browser.chrome)
											YTPlayer.player.setPlaybackQuality(YTPlayer.opt.quality);

										controls.find(".mb_YTVPPlaypause").html($.mbYTPlayer.controls.play);
										$(YTPlayer).trigger("YTPBuffering");
									}
//------------------------------------------------------------------ unstarted
									if (state == -1) {
										if (YTPlayer.state == state)
											return;
										YTPlayer.state = state;
										$(YTPlayer).trigger("YTPUnstarted");
									}
//------------------------------------------------------------------ playing
									if (state == 1) {
										if (YTPlayer.state == state)
											return;
										YTPlayer.state = state;

										if(!$.browser.chrome)
											YTPlayer.player.setPlaybackQuality(YTPlayer.opt.quality);

										controls.find(".mb_YTVPPlaypause").html($.mbYTPlayer.controls.pause);

										$(YTPlayer).trigger("YTPStart");

										if (typeof _gaq != "undefined" && eval(YTPlayer.opt.gaTrack))
											_gaq.push(['_trackEvent', 'YTPlayer', 'Play', (YTPlayer.title || YTPlayer.videoID.toString())]);

										if (typeof ga != "undefined" && eval(YTPlayer.opt.gaTrack))
											ga('send', 'event', 'YTPlayer', 'play', (YTPlayer.title || YTPlayer.videoID.toString()));
									}
//------------------------------------------------------------------ paused
									if (state == 2) {
										if (YTPlayer.state == state)
											return;
										YTPlayer.state = state;
										controls.find(".mb_YTVPPlaypause").html($.mbYTPlayer.controls.play);
										$(YTPlayer).trigger("YTPPause");
									}

								},
								'onPlaybackQualityChange': function (e) {
									if (typeof YTPlayer.opt.onPlaybackQualityChange == "function")
										YTPlayer.opt.onPlaybackQualityChange($YTPlayer);
								},
								'onError'                : function (err) {

									if (err.data == 150)
									{
										console.log("Embedding this video is restricted by Youtube.");
										if (YTPlayer.isPlayList)
											$(YTPlayer).playNext();
									}

									if (err.data == 2 && YTPlayer.isPlayList)
										$(YTPlayer).playNext();

									if (typeof YTPlayer.opt.onError == "function")
										YTPlayer.opt.onError($YTPlayer, err);
								}
							}
						});
					});
				})
			});
		},

		getDataFromFeed: function (videoID, YTPlayer) {
			//Get video info from FEEDS API

			YTPlayer.videoID = videoID;
			if (!$.browser.msie) {

				$.getJSON($.mbYTPlayer.locationProtocol + '//gdata.youtube.com/feeds/api/videos/' + videoID + '?v=2&alt=jsonc', function (data, status, xhr) {

					YTPlayer.dataReceived = true;

					var videoData = data.data;

					YTPlayer.title = videoData.title;
					YTPlayer.videoData = videoData;

					if (YTPlayer.opt.ratio == "auto")
						if (videoData.aspectRatio && videoData.aspectRatio === "widescreen")
							YTPlayer.opt.ratio = "16/9";
						else
							YTPlayer.opt.ratio = "4/3";

					if (!YTPlayer.hasData) {
						YTPlayer.hasData = true;

						if (YTPlayer.isPlayer) {
							var bgndURL = YTPlayer.videoData.thumbnail.hqDefault;
							YTPlayer.opt.containment.css({background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center", backgroundSize: "cover"});
						}
					}
					$(YTPlayer).trigger("YTPChanged");

				});

				setTimeout(function () {
					if (!YTPlayer.dataReceived && !YTPlayer.hasData) {
						YTPlayer.hasData = true;
						$(YTPlayer).trigger("YTPChanged");
					}
				}, 1500)

			} else {
				YTPlayer.opt.ratio == "auto" ? YTPlayer.opt.ratio = "16/9" : YTPlayer.opt.ratio;

				if (!YTPlayer.hasData) {
					YTPlayer.hasData = true;
					setTimeout(function () {
						$(YTPlayer).trigger("YTPChanged");
					}, 100)
				}
			}
		},

		getVideoID: function () {
			var YTPlayer = this.get(0);
			return YTPlayer.videoID || false;
		},

		setVideoQuality: function (quality) {
			var YTPlayer = this.get(0);

			if(!$.browser.chrome)
				YTPlayer.player.setPlaybackQuality(quality);
		},

		YTPlaylist: function (videos, shuffle, callback) {
			var YTPlayer = this.get(0);

			YTPlayer.isPlayList = true;

			if (shuffle)
				videos = $.shuffle(videos);

			if (!YTPlayer.videoID) {
				YTPlayer.videos = videos;
				YTPlayer.videoCounter = 0;
				YTPlayer.videoLength = videos.length;

				$(YTPlayer).data("property", videos[0]);
				$(YTPlayer).mb_YTPlayer();
			}

			if (typeof callback == "function")
				$(YTPlayer).on("YTPChanged", function () {
					callback(YTPlayer);
				});

			$(YTPlayer).on("YTPEnd", function () {
				$(YTPlayer).playNext();
			});
		},

		playNext: function () {
			var YTPlayer = this.get(0);
			YTPlayer.videoCounter++;
			if (YTPlayer.videoCounter >= YTPlayer.videoLength)
				YTPlayer.videoCounter = 0;
			$(YTPlayer.playerEl).css({opacity: 0});
			$(YTPlayer).changeMovie(YTPlayer.videos[YTPlayer.videoCounter]);
		},

		playPrev: function () {
			var YTPlayer = this.get(0);
			YTPlayer.videoCounter--;
			if (YTPlayer.videoCounter < 0)
				YTPlayer.videoCounter = YTPlayer.videoLength - 1;
			$(YTPlayer.playerEl).css({opacity: 0});
			$(YTPlayer).changeMovie(YTPlayer.videos[YTPlayer.videoCounter]);
		},

		changeMovie: function (opt) {
			var YTPlayer = this.get(0);

			YTPlayer.opt.startAt = 0;
			YTPlayer.opt.stopAt = 0;
			YTPlayer.opt.mute = true;

			if (opt) {
				$.extend(YTPlayer.opt, opt);
			}

			YTPlayer.videoID = getYTPVideoID(YTPlayer.opt.videoURL);

			$(YTPlayer).pauseYTP();
			var timer = $.browser.msie ? 1000 : 0;
			$(YTPlayer.playerEl).CSSAnimate({opacity: 0}, timer);


			setTimeout(function () {
				var quality = !$.browser.chrome ? YTPlayer.opt.quality : "default";

				$(YTPlayer).getPlayer().cueVideoByUrl(encodeURI($.mbYTPlayer.locationProtocol + "//www.youtube.com/v/" + YTPlayer.videoID), 1, quality);

				$(YTPlayer).playYTP();


				$(YTPlayer).one("YTPStart", function () {
					YTPlayer.wrapper.CSSAnimate({opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity}, 1000);
					$(YTPlayer.playerEl).CSSAnimate({opacity: 1}, timer);

					if (YTPlayer.opt.startAt) {
						YTPlayer.player.seekTo(YTPlayer.opt.startAt);
					}
					$.mbYTPlayer.checkForState(YTPlayer);

					if(!YTPlayer.opt.autoPlay)
						$(YTPlayer).pauseYTP();

				});



				if (YTPlayer.opt.mute) {
					$(YTPlayer).muteYTPVolume();
				} else {
					$(YTPlayer).unmuteYTPVolume();
				}

			}, timer);

			if (YTPlayer.opt.addRaster) {
				var retina = (window.retina || window.devicePixelRatio > 1);
				YTPlayer.overlay.addClass(retina ? "raster retina" : "raster");
			} else {
				YTPlayer.overlay.removeClass("raster");
				YTPlayer.overlay.removeClass("retina");
			}

			$("#controlBar_" + YTPlayer.id).remove();

			if (YTPlayer.opt.showControls)
				$(YTPlayer).buildYTPControls();

			$.mbYTPlayer.getDataFromFeed(YTPlayer.videoID, YTPlayer);
			$(YTPlayer).optimizeDisplay();
		},

		getPlayer: function () {
			return $(this).get(0).player;
		},

		playerDestroy: function () {
			var YTPlayer = this.get(0);
			ytp.YTAPIReady = false;
			ytp.backgroundIsInited = false;
			YTPlayer.isInit = false;
			YTPlayer.videoID = null;

			var playerBox = YTPlayer.wrapper;
			playerBox.remove();
			$("#controlBar_" + YTPlayer.id).remove();
		},

		fullscreen: function (real) {

			var YTPlayer = this.get(0);

			if (typeof real == "undefined")
				real = YTPlayer.opt.realfullscreen;

			real = eval(real);

			var controls = $("#controlBar_" + YTPlayer.id);
			var fullScreenBtn = controls.find(".mb_OnlyYT");
			var videoWrapper = YTPlayer.isSelf ? YTPlayer.opt.containment : YTPlayer.wrapper;
			//var videoWrapper = YTPlayer.wrapper;

			if (real) {
				var fullscreenchange = $.browser.mozilla ? "mozfullscreenchange" : $.browser.webkit ? "webkitfullscreenchange" : "fullscreenchange";
				$(document).off(fullscreenchange).on(fullscreenchange, function () {
					var isFullScreen = RunPrefixMethod(document, "IsFullScreen") || RunPrefixMethod(document, "FullScreen");

					if (!isFullScreen) {
						YTPlayer.isAlone = false;
						fullScreenBtn.html($.mbYTPlayer.controls.onlyYT);
						$(YTPlayer).setVideoQuality(YTPlayer.opt.quality);
						videoWrapper.removeClass("fullscreen");

						videoWrapper.CSSAnimate({opacity: YTPlayer.opt.opacity}, 500);
						videoWrapper.css({zIndex: 0});

						if (YTPlayer.isBackground) {
							$("body").after(controls);
						} else {
							YTPlayer.wrapper.before(controls);
						}
						$(window).resize();
						$(YTPlayer).trigger("YTPFullScreenEnd");

					} else {
						$(YTPlayer).setVideoQuality("default");
						$(YTPlayer).trigger("YTPFullScreenStart");
					}
				});
			}

			if (!YTPlayer.isAlone) {

				if (real) {

					var playerState = YTPlayer.player.getPlayerState();
					videoWrapper.css({opacity: 0});
					videoWrapper.addClass("fullscreen");
					launchFullscreen(videoWrapper.get(0));
					setTimeout(function () {
						videoWrapper.CSSAnimate({opacity: 1}, 1000);
						YTPlayer.wrapper.append(controls);
						$(YTPlayer).optimizeDisplay();

						YTPlayer.player.seekTo(YTPlayer.player.getCurrentTime() + .1, true);
					}, 500)
				} else
					videoWrapper.css({zIndex: 10000}).CSSAnimate({opacity: 1}, 1000);


				fullScreenBtn.html($.mbYTPlayer.controls.showSite);
				YTPlayer.isAlone = true;

			} else {

				if (real) {
					cancelFullscreen();
				} else {
					videoWrapper.CSSAnimate({opacity: YTPlayer.opt.opacity}, 500);
					videoWrapper.css({zIndex: 0});
				}


				fullScreenBtn.html($.mbYTPlayer.controls.onlyYT)
				YTPlayer.isAlone = false;
			}

			function RunPrefixMethod(obj, method) {
				var pfx = ["webkit", "moz", "ms", "o", ""];
				var p = 0, m, t;
				while (p < pfx.length && !obj[m]) {
					m = method;
					if (pfx[p] == "") {
						m = m.substr(0, 1).toLowerCase() + m.substr(1);
					}
					m = pfx[p] + m;
					t = typeof obj[m];
					if (t != "undefined") {
						pfx = [pfx[p]];
						return (t == "function" ? obj[m]() : obj[m]);
					}
					p++;
				}
			}

			function launchFullscreen(element) {
				RunPrefixMethod(element, "RequestFullScreen");
			}

			function cancelFullscreen() {
				if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
					RunPrefixMethod(document, "CancelFullScreen");
				}
			}
		},

		playYTP: function () {
			var YTPlayer = this.get(0);

			if (typeof YTPlayer.player === "undefined")
				return;

			var controls = $("#controlBar_" + YTPlayer.id);
			var playBtn = controls.find(".mb_YTVPPlaypause");
			playBtn.html($.mbYTPlayer.controls.pause);
			YTPlayer.player.playVideo();

			YTPlayer.wrapper.CSSAnimate({opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity}, 2000);
			$(YTPlayer).on("YTPStart", function () {
				$(YTPlayer).css("background-image", "none");
			})
		},

		toggleLoops: function () {
			var YTPlayer = this.get(0);
			var data = YTPlayer.opt;
			if (data.loop == 1) {
				data.loop = 0;
			} else {
				if (data.startAt) {
					YTPlayer.player.seekTo(data.startAt);
				} else {
					YTPlayer.player.playVideo();
				}
				data.loop = 1;
			}
		},

		stopYTP: function () {
			var YTPlayer = this.get(0);
			var controls = $("#controlBar_" + YTPlayer.id);
			var playBtn = controls.find(".mb_YTVPPlaypause");
			playBtn.html($.mbYTPlayer.controls.play);
			YTPlayer.player.stopVideo();
		},

		pauseYTP: function () {
			var YTPlayer = this.get(0);
			var data = YTPlayer.opt;
			var controls = $("#controlBar_" + YTPlayer.id);
			var playBtn = controls.find(".mb_YTVPPlaypause");
			playBtn.html($.mbYTPlayer.controls.play);
			YTPlayer.player.pauseVideo();
		},

		seekToYTP: function (val) {
			var YTPlayer = this.get(0);
			YTPlayer.player.seekTo(val, true);
		},

		setYTPVolume: function (val) {
			var YTPlayer = this.get(0);
			if (!val && !YTPlayer.opt.vol && YTPlayer.player.getVolume() == 0)
				$(YTPlayer).unmuteYTPVolume();
			else if ((!val && YTPlayer.player.getVolume() > 0) || (val && YTPlayer.player.getVolume() == val))
				$(YTPlayer).muteYTPVolume();
			else
				YTPlayer.opt.vol = val;
			YTPlayer.player.setVolume(YTPlayer.opt.vol);
		},

		muteYTPVolume: function () {
			var YTPlayer = this.get(0);
			YTPlayer.player.mute();
			YTPlayer.player.setVolume(0);

			var controls = $("#controlBar_" + YTPlayer.id);
			var muteBtn = controls.find(".mb_YTVPMuteUnmute");
			muteBtn.html($.mbYTPlayer.controls.unmute);
			$(YTPlayer).addClass("isMuted");
			$(YTPlayer).trigger("YTPMuted");
		},

		unmuteYTPVolume: function () {
			var YTPlayer = this.get(0);

			YTPlayer.player.unMute();
			YTPlayer.player.setVolume(YTPlayer.opt.vol);

			var controls = $("#controlBar_" + YTPlayer.id);
			var muteBtn = controls.find(".mb_YTVPMuteUnmute");
			muteBtn.html($.mbYTPlayer.controls.mute);

			$(YTPlayer).removeClass("isMuted");
			$(YTPlayer).trigger("YTPUnmuted");

		},

		manageYTPProgress: function () {

			var YTPlayer = this.get(0);
			var controls = $("#controlBar_" + YTPlayer.id);
			var progressBar = controls.find(".mb_YTVPProgress");
			var loadedBar = controls.find(".mb_YTVPLoaded");
			var timeBar = controls.find(".mb_YTVTime");
			var totW = progressBar.outerWidth();

			var currentTime = Math.floor(YTPlayer.player.getCurrentTime());
			var totalTime = Math.floor(YTPlayer.player.getDuration());
			var timeW = (currentTime * totW) / totalTime;
			var startLeft = 0;

			var loadedW = YTPlayer.player.getVideoLoadedFraction() * 100;

			loadedBar.css({left: startLeft, width: loadedW + "%"});
			timeBar.css({left: 0, width: timeW});
			return {totalTime: totalTime, currentTime: currentTime};
		},

		buildYTPControls: function () {
			var YTPlayer = this.get(0);
			var data = YTPlayer.opt;

			/** @data.printUrl is deprecated; use data.showYTLogo */
			data.showYTLogo = data.showYTLogo || data.printUrl;

			if ($("#controlBar_" + YTPlayer.id).length)
				return;

			var controlBar = $("<span/>").attr("id", "controlBar_" + YTPlayer.id).addClass("mb_YTVPBar").css({whiteSpace: "noWrap", position: YTPlayer.isBackground ? "fixed" : "absolute", zIndex: YTPlayer.isBackground ? 10000 : 1000}).hide();
			var buttonBar = $("<div/>").addClass("buttonBar");

			var playpause = $("<span>" + $.mbYTPlayer.controls.play + "</span>").addClass("mb_YTVPPlaypause ytpicon").click(function () {
				if (YTPlayer.player.getPlayerState() == 1)
					$(YTPlayer).pauseYTP();
				else
					$(YTPlayer).playYTP();
			});

			var MuteUnmute = $("<span>" + $.mbYTPlayer.controls.mute + "</span>").addClass("mb_YTVPMuteUnmute ytpicon").click(function () {
				if (YTPlayer.player.getVolume() == 0) {
					$(YTPlayer).unmuteYTPVolume();
				} else {
					$(YTPlayer).muteYTPVolume();
				}
			});

			var idx = $("<span/>").addClass("mb_YTVPTime");

			var vURL = data.videoURL ? data.videoURL : "";

			if (vURL.indexOf("http") < 0)
				vURL = $.mbYTPlayer.locationProtocol + "//www.youtube.com/watch?v=" + data.videoURL;
			var movieUrl = $("<span/>").html($.mbYTPlayer.controls.ytLogo).addClass("mb_YTVPUrl ytpicon").attr("title", "view on YouTube").on("click", function () {window.open(vURL, "viewOnYT")});
			var onlyVideo = $("<span/>").html($.mbYTPlayer.controls.onlyYT).addClass("mb_OnlyYT ytpicon").on("click", function () {$(YTPlayer).fullscreen(data.realfullscreen);});

			var progressBar = $("<div/>").addClass("mb_YTVPProgress").css("position", "absolute").click(function (e) {
				timeBar.css({width: (e.clientX - timeBar.offset().left)});
				YTPlayer.timeW = e.clientX - timeBar.offset().left;
				controlBar.find(".mb_YTVPLoaded").css({width: 0});
				var totalTime = Math.floor(YTPlayer.player.getDuration());
				YTPlayer.goto = (timeBar.outerWidth() * totalTime) / progressBar.outerWidth();

				YTPlayer.player.seekTo(parseFloat(YTPlayer.goto), true);
				controlBar.find(".mb_YTVPLoaded").css({width: 0});
			});

			var loadedBar = $("<div/>").addClass("mb_YTVPLoaded").css("position", "absolute");
			var timeBar = $("<div/>").addClass("mb_YTVTime").css("position", "absolute");

			progressBar.append(loadedBar).append(timeBar);
			buttonBar.append(playpause).append(MuteUnmute).append(idx);

			if (data.showYTLogo) {
				buttonBar.append(movieUrl);
			}

			if (YTPlayer.isBackground || (eval(YTPlayer.opt.realfullscreen) && !YTPlayer.isBackground))
				buttonBar.append(onlyVideo);

			controlBar.append(buttonBar).append(progressBar);

			if (!YTPlayer.isBackground) {
				controlBar.addClass("inlinePlayer");
				YTPlayer.wrapper.before(controlBar);
			} else {
				$("body").after(controlBar);
			}
			controlBar.fadeIn();
		},

		checkForState: function (YTPlayer) {
			clearInterval(YTPlayer.getState);
			YTPlayer.getState = setInterval(function () {
				var prog = $(YTPlayer).manageYTPProgress();
				var $YTPlayer = $(YTPlayer);
				var controlBar = $("#controlBar_" + YTPlayer.id);
				var data = YTPlayer.opt;
				var startAt = YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;
				var stopAt = YTPlayer.opt.stopAt > YTPlayer.opt.startAt ? YTPlayer.opt.stopAt : 0;
				stopAt = stopAt < YTPlayer.player.getDuration() ? stopAt : 0;

				if (YTPlayer.player.getVolume() == 0)
					$YTPlayer.addClass("isMuted");
				else
					$YTPlayer.removeClass("isMuted");

				if (prog.totalTime) {
					controlBar.find(".mb_YTVPTime").html($.mbYTPlayer.formatTime(prog.currentTime) + " / " + $.mbYTPlayer.formatTime(prog.totalTime));
				} else {
//					clearInterval(YTPlayer.getState);
					controlBar.find(".mb_YTVPTime").html("-- : -- / -- : --");
				}

				if (YTPlayer.player.getPlayerState() == 1 && (parseFloat(YTPlayer.player.getDuration() - 3) < YTPlayer.player.getCurrentTime() || (stopAt > 0 && parseFloat(YTPlayer.player.getCurrentTime()) > stopAt))) {

					if(YTPlayer.isEnded)
						return;

					YTPlayer.isEnded = true;
					setTimeout(function(){YTPlayer.isEnded = false},2000);

					if (YTPlayer.isPlayList) {
						clearInterval(YTPlayer.getState);
						$(YTPlayer).trigger("YTPEnd");
						return;
					} else if (!data.loop) {
						YTPlayer.player.pauseVideo();
						YTPlayer.wrapper.CSSAnimate({opacity: 0}, 1000, function () {
							$(YTPlayer).trigger("YTPEnd");
							YTPlayer.player.seekTo(startAt, true);

							if (!YTPlayer.isBackground) {
								var bgndURL = YTPlayer.videoData.thumbnail.hqDefault;
								$(YTPlayer).css({background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center", backgroundSize: "cover"});
							}

						});
					} else
						YTPlayer.player.seekTo(startAt, true);
				}
			}, 1);
		},

		formatTime: function (s) {
			var min = Math.floor(s / 60);
			var sec = Math.floor(s - (60 * min));
			return (min <= 9 ? "0" + min : min) + " : " + (sec <= 9 ? "0" + sec : sec);
		}
	};

	$.fn.toggleVolume = function () {
		var YTPlayer = this.get(0);
		if (!YTPlayer)
			return;

		if (YTPlayer.player.isMuted()) {
			$(YTPlayer).unmuteYTPVolume();
			return true;
		} else {
			$(YTPlayer).muteYTPVolume();
			return false;
		}
	};

	$.fn.optimizeDisplay = function () {

		var YTPlayer = this.get(0);
		var data = YTPlayer.opt;
		var playerBox = $(YTPlayer.playerEl);
		var win = {};
		var el = YTPlayer.wrapper;

		win.width = el.outerWidth();
		win.height = el.outerHeight();

		var margin = 24;
		var overprint = 100;
		var vid = {};
		vid.width = win.width + ((win.width * margin) / 100);
		vid.height = data.ratio == "16/9" ? Math.ceil((9 * win.width) / 16) : Math.ceil((3 * win.width) / 4);
		vid.marginTop = -((vid.height - win.height) / 2);
		vid.marginLeft = -((win.width * (margin / 2)) / 100);

		if (vid.height < win.height) {
			vid.height = win.height + ((win.height * margin) / 100);
			vid.width = data.ratio == "16/9" ? Math.floor((16 * win.height) / 9) : Math.floor((4 * win.height) / 3);
			vid.marginTop = -((win.height * (margin / 2)) / 100);
			vid.marginLeft = -((vid.width - win.width) / 2);
		}

		vid.width += overprint;
		vid.height += overprint;
		vid.marginTop -= overprint / 2;
		vid.marginLeft -= overprint / 2;

		playerBox.css({width: vid.width, height: vid.height, marginTop: vid.marginTop, marginLeft: vid.marginLeft});
	};

	$.shuffle = function (arr) {
		var newArray = arr.slice();
		var len = newArray.length;
		var i = len;
		while (i--) {
			var p = parseInt(Math.random() * len);
			var t = newArray[i];
			newArray[i] = newArray[p];
			newArray[p] = t;
		}
		return newArray;
	};

	/*Exposed method for external use*/
	$.fn.mb_YTPlayer = $.mbYTPlayer.buildPlayer;
	$.fn.YTPlaylist = $.mbYTPlayer.YTPlaylist;
	$.fn.playNext = $.mbYTPlayer.playNext;
	$.fn.playPrev = $.mbYTPlayer.playPrev;
	$.fn.changeMovie = $.mbYTPlayer.changeMovie;
	$.fn.getVideoID = $.mbYTPlayer.getVideoID;
	$.fn.getPlayer = $.mbYTPlayer.getPlayer;
	$.fn.playerDestroy = $.mbYTPlayer.playerDestroy;
	$.fn.fullscreen = $.mbYTPlayer.fullscreen;
	$.fn.buildYTPControls = $.mbYTPlayer.buildYTPControls;
	$.fn.playYTP = $.mbYTPlayer.playYTP;
	$.fn.toggleLoops = $.mbYTPlayer.toggleLoops;
	$.fn.stopYTP = $.mbYTPlayer.stopYTP;
	$.fn.pauseYTP = $.mbYTPlayer.pauseYTP;
	$.fn.seekToYTP = $.mbYTPlayer.seekToYTP;
	$.fn.muteYTPVolume = $.mbYTPlayer.muteYTPVolume;
	$.fn.unmuteYTPVolume = $.mbYTPlayer.unmuteYTPVolume;
	$.fn.setYTPVolume = $.mbYTPlayer.setYTPVolume;
	$.fn.setVideoQuality = $.mbYTPlayer.setVideoQuality;
	$.fn.manageYTPProgress = $.mbYTPlayer.manageYTPProgress;

})(jQuery, ytp);
