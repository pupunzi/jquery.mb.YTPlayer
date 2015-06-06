/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.YTPlayer.src.js                                                                                                                  _
 _ last modified: 29/05/15 23.33                                                                                                                    _
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
 _ Copyright (c) 2001-2015. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/
var ytp = ytp || {};

function onYouTubeIframeAPIReady() {
		if( ytp.YTAPIReady ) return;
		ytp.YTAPIReady = true;
		jQuery( document ).trigger( "YTAPIReady" );
}
( function( jQuery, ytp ) {
		var getYTPVideoID = function( url ) {
				var videoID, playlistID;
				if( url.indexOf( "youtu.be" ) > 0 ) {
						videoID = url.substr( url.lastIndexOf( "/" ) + 1, url.length );
						playlistID = videoID.indexOf( "?list=" ) > 0 ? videoID.substr( videoID.lastIndexOf( "=" ), videoID.length ) : null;
						videoID = playlistID ? videoID.substr( 0, videoID.lastIndexOf( "?" ) ) : videoID;
				} else if( url.indexOf( "http" ) > -1 ) {
						videoID = url.match( /[\\?&]v=([^&#]*)/ )[ 1 ];
						playlistID = url.indexOf( "list=" ) > 0 ? url.match( /[\\?&]list=([^&#]*)/ )[ 1 ] : null;
				} else {
						videoID = url.length > 15 ? null : url;
						playlistID = videoID ? null : url;
				}
				return {
						videoID: videoID,
						playlistID: playlistID
				};
		};
		/* todo: setPlaybackRate() playlist */
		jQuery.mbYTPlayer = {
				name: "jquery.mb.YTPlayer",
				version: "{{ version }}",
				build: "{{ build }}",
				author: "Matteo Bicocchi",
				apiKey: "",
				defaults: {
						containment: "body",
						ratio: "auto", // "auto", "16/9", "4/3"
						videoURL: null,
						playlistURL: null,
						startAt: 0,
						stopAt: 0,
						autoPlay: true,
						vol: 50, // 1 to 100
						addRaster: false,
						opacity: 1,
						quality: "default", //or “small”, “medium”, “large”, “hd720”, “hd1080”, “highres”
						mute: false,
						loop: true,
						showControls: true,
						showAnnotations: false,
						showYTLogo: true,
						stopMovieOnBlur: true,
						realfullscreen: true,
						gaTrack: true,
						optimizeDisplay: true,
						onReady: function( player ) {}
				},
				/* @fontface icons */
				controls: {
						play: "P",
						pause: "p",
						mute: "M",
						unmute: "A",
						onlyYT: "O",
						showSite: "R",
						ytLogo: "Y"
				},
				locationProtocol: "https:",
				/**
				 *
				 * @param options
				 * @returns [players]
				 */
				buildPlayer: function( options ) {
						return this.each( function() {
								var YTPlayer = this;
								var $YTPlayer = jQuery( YTPlayer );
								YTPlayer.loop = 0;
								YTPlayer.opt = {};
								YTPlayer.state = {};
								YTPlayer.filtersEnabled = true;
								YTPlayer.filters = {
										grayscale: {
												value: 0,
												unit: "%"
										},
										hue_rotate: {
												value: 0,
												unit: "deg"
										},
										invert: {
												value: 0,
												unit: "%"
										},
										opacity: {
												value: 0,
												unit: "%"
										},
										saturate: {
												value: 0,
												unit: "%"
										},
										sepia: {
												value: 0,
												unit: "%"
										},
										brightness: {
												value: 0,
												unit: "%"
										},
										contrast: {
												value: 0,
												unit: "%"
										},
										blur: {
												value: 0,
												unit: "px"
										}
								};
								$YTPlayer.addClass( "mb_YTPlayer" );
								var property = $YTPlayer.data( "property" ) && typeof $YTPlayer.data( "property" ) == "string" ? eval( '(' + $YTPlayer.data( "property" ) + ')' ) : $YTPlayer.data( "property" );
								if( typeof property != "undefined" && typeof property.vol != "undefined" ) property.vol = property.vol === 0 ? property.vol = 1 : property.vol;
								jQuery.extend( YTPlayer.opt, jQuery.mbYTPlayer.defaults, options, property );
								if( !YTPlayer.hasChanged ) {
										YTPlayer.defaultOpt = {};
										jQuery.extend( YTPlayer.defaultOpt, jQuery.mbYTPlayer.defaults, options, property );
								}
								YTPlayer.isRetina = ( window.retina || window.devicePixelRatio > 1 );
								var isIframe = function() {
										var isIfr = false;
										try {
												if( self.location.href != top.location.href ) isIfr = true;
										} catch( e ) {
												isIfr = true;
										}
										return isIfr;
								};
								YTPlayer.canGoFullScreen = !( jQuery.browser.msie || jQuery.browser.opera || isIframe() );
								if( !YTPlayer.canGoFullScreen ) YTPlayer.opt.realfullscreen = false;
								if( !$YTPlayer.attr( "id" ) ) $YTPlayer.attr( "id", "video_" + new Date().getTime() );
								var playerID = "mbYTP_" + YTPlayer.id;
								YTPlayer.isAlone = false;
								YTPlayer.hasFocus = true;
								var videoID = this.opt.videoURL ? getYTPVideoID( this.opt.videoURL ).videoID : $YTPlayer.attr( "href" ) ? getYTPVideoID( $YTPlayer.attr( "href" ) ).videoID : false;
								var playlistID = this.opt.videoURL ? getYTPVideoID( this.opt.videoURL ).playlistID : $YTPlayer.attr( "href" ) ? getYTPVideoID( $YTPlayer.attr( "href" ) ).playlistID : false;
								YTPlayer.videoID = videoID;
								YTPlayer.playlistID = playlistID;
								YTPlayer.opt.showAnnotations = ( YTPlayer.opt.showAnnotations ) ? '0' : '3';
								var playerVars = {
										'autoplay': 0,
										'modestbranding': 1,
										'controls': 0,
										'showinfo': 0,
										'rel': 0,
										'enablejsapi': 1,
										'version': 3,
										'playerapiid': playerID,
										'origin': '*',
										'allowfullscreen': true,
										'wmode': 'transparent',
										'iv_load_policy': YTPlayer.opt.showAnnotations
								};
								if( document.createElement( 'video' ).canPlayType ) jQuery.extend( playerVars, {
										'html5': 1
								} );
								if( jQuery.browser.msie && jQuery.browser.version < 9 ) this.opt.opacity = 1;
								var playerBox = jQuery( "<div/>" ).attr( "id", playerID ).addClass( "playerBox" );
								var overlay = jQuery( "<div/>" ).css( {
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: "100%"
								} ).addClass( "YTPOverlay" );
								YTPlayer.isSelf = YTPlayer.opt.containment == "self";
								YTPlayer.defaultOpt.containment = YTPlayer.opt.containment = YTPlayer.opt.containment == "self" ? jQuery( this ) : jQuery( YTPlayer.opt.containment );
								YTPlayer.isBackground = YTPlayer.opt.containment.get( 0 ).tagName.toLowerCase() == "body";
								if( YTPlayer.isBackground && ytp.backgroundIsInited ) return;
								var isPlayer = YTPlayer.opt.containment.is( jQuery( this ) );
								YTPlayer.canPlayOnMobile = isPlayer && jQuery( this ).children().length === 0;
								if( !isPlayer ) {
										$YTPlayer.hide();
								} else {
										YTPlayer.isPlayer = true;
								}
								if( jQuery.browser.mobile && !YTPlayer.canPlayOnMobile ) {
										$YTPlayer.remove();
										return;
								}
								var wrapper = jQuery( "<div/>" ).addClass( "mbYTP_wrapper" ).attr( "id", "wrapper_" + playerID );
								wrapper.css( {
										position: "absolute",
										zIndex: 0,
										minWidth: "100%",
										minHeight: "100%",
										left: 0,
										top: 0,
										overflow: "hidden",
										opacity: 0
								} );
								playerBox.css( {
										position: "absolute",
										zIndex: 0,
										width: "100%",
										height: "100%",
										top: 0,
										left: 0,
										overflow: "hidden"
								} );
								wrapper.append( playerBox );
								YTPlayer.opt.containment.children().not( "script, style" ).each( function() {
										if( jQuery( this ).css( "position" ) == "static" ) jQuery( this ).css( "position", "relative" );
								} );
								if( YTPlayer.isBackground ) {
										jQuery( "body" ).css( {
												boxSizing: "border-box"
										} );
										wrapper.css( {
												position: "fixed",
												top: 0,
												left: 0,
												zIndex: 0
										} );
										$YTPlayer.hide();
								} else if( YTPlayer.opt.containment.css( "position" ) == "static" ) YTPlayer.opt.containment.css( {
										position: "relative"
								} );
								YTPlayer.opt.containment.prepend( wrapper );
								YTPlayer.wrapper = wrapper;
								playerBox.css( {
										opacity: 1
								} );
								if( !jQuery.browser.mobile ) {
										playerBox.after( overlay );
										YTPlayer.overlay = overlay;
								}
								if( !YTPlayer.isBackground ) {
										overlay.on( "mouseenter", function() {
												if( YTPlayer.controlBar ) YTPlayer.controlBar.addClass( "visible" );
										} ).on( "mouseleave", function() {
												if( YTPlayer.controlBar ) YTPlayer.controlBar.removeClass( "visible" );
										} )
								}
								if( !ytp.YTAPIReady ) {
										jQuery( "#YTAPI" ).remove();
										var tag = jQuery( "<script></script>" ).attr( {
												"src": jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/iframe_api?v=" + jQuery.mbYTPlayer.version,
												"id": "YTAPI"
										} );
										jQuery( "head" ).prepend( tag );
								} else {
										setTimeout( function() {
												jQuery( document ).trigger( "YTAPIReady" );
										}, 100 )
								}
								jQuery( document ).on( "YTAPIReady", function() {
										if( ( YTPlayer.isBackground && ytp.backgroundIsInited ) || YTPlayer.isInit ) return;
										if( YTPlayer.isBackground ) {
												ytp.backgroundIsInited = true;
										}
										YTPlayer.opt.autoPlay = typeof YTPlayer.opt.autoPlay == "undefined" ? ( YTPlayer.isBackground ? true : false ) : YTPlayer.opt.autoPlay;
										YTPlayer.opt.vol = YTPlayer.opt.vol ? YTPlayer.opt.vol : 100;
										jQuery.mbYTPlayer.getDataFromAPI( YTPlayer );
										jQuery( YTPlayer ).on( "YTPChanged", function() {
												if( YTPlayer.isInit ) return;
												YTPlayer.isInit = true;
												//if is mobile && isPlayer fallback to the default YT player
												if( jQuery.browser.mobile && YTPlayer.canPlayOnMobile ) {
														// Try to adjust the player dimention
														if( YTPlayer.opt.containment.outerWidth() > jQuery( window ).width() ) {
																YTPlayer.opt.containment.css( {
																		maxWidth: "100%"
																} );
																var h = YTPlayer.opt.containment.outerWidth() * .6;
																YTPlayer.opt.containment.css( {
																		maxHeight: h
																} );
														}
														new YT.Player( playerID, {
																videoId: YTPlayer.videoID.toString(),
																height: '100%',
																width: '100%',
																events: {
																		'onReady': function( event ) {
																				YTPlayer.player = event.target;
																				playerBox.css( {
																						opacity: 1
																				} );
																				YTPlayer.wrapper.css( {
																						opacity: 1
																				} );
																		}
																}
														} );
														return;
												}
												new YT.Player( playerID, {
														videoId: YTPlayer.videoID.toString(),
														playerVars: playerVars,
														events: {
																'onReady': function( event ) {
																		YTPlayer.player = event.target;
																		if( YTPlayer.isReady ) return;
																		YTPlayer.isReady = YTPlayer.isPlayer && !YTPlayer.opt.autoPlay ? false : true;
																		YTPlayer.playerEl = YTPlayer.player.getIframe();
																		$YTPlayer.optimizeDisplay();
																		YTPlayer.videoID = videoID;
																		jQuery( window ).on( "resize.YTP", function() {
																				$YTPlayer.optimizeDisplay();
																		} );
																		jQuery.mbYTPlayer.checkForState( YTPlayer );
																		// Trigger state events
																		var YTPEvent = jQuery.Event( "YTPUnstarted" );
																		YTPEvent.time = YTPlayer.player.time;
																		if( YTPlayer.canTrigger ) jQuery( YTPlayer ).trigger( YTPEvent );
																},
																/**
																 *
																 * @param event
																 *
																 * -1 (unstarted)
																 * 0 (ended)
																 * 1 (playing)
																 * 2 (paused)
																 * 3 (buffering)
																 * 5 (video cued).
																 *
																 *
																 */
																'onStateChange': function( event ) {
																		if( typeof event.target.getPlayerState != "function" ) return;
																		var state = event.target.getPlayerState();
																		if( YTPlayer.state == state ) return;
																		YTPlayer.state = state;
																		var eventType;
																		switch( state ) {
																				case -1: //------------------------------------------------ unstarted
																						eventType = "YTPUnstarted";
																						break;
																				case 0: //------------------------------------------------ ended
																						eventType = "YTPEnd";
																						break;
																				case 1: //------------------------------------------------ play
																						eventType = "YTPStart";
																						if( YTPlayer.controlBar ) YTPlayer.controlBar.find( ".mb_YTPPlaypause" ).html( jQuery.mbYTPlayer.controls.pause );
																						if( typeof _gaq != "undefined" && eval( YTPlayer.opt.gaTrack ) ) _gaq.push( [ '_trackEvent', 'YTPlayer', 'Play', ( YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString() ) ] );
																						if( typeof ga != "undefined" && eval( YTPlayer.opt.gaTrack ) ) ga( 'send', 'event', 'YTPlayer', 'play', ( YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString() ) );
																						break;
																				case 2: //------------------------------------------------ pause
																						eventType = "YTPPause";
																						if( YTPlayer.controlBar ) YTPlayer.controlBar.find( ".mb_YTPPlaypause" ).html( jQuery.mbYTPlayer.controls.play );
																						break;
																				case 3: //------------------------------------------------ buffer
																						YTPlayer.player.setPlaybackQuality( YTPlayer.opt.quality );
																						eventType = "YTPBuffering";
																						if( YTPlayer.controlBar ) YTPlayer.controlBar.find( ".mb_YTPPlaypause" ).html( jQuery.mbYTPlayer.controls.play );
																						break;
																				case 5: //------------------------------------------------ cued
																						eventType = "YTPCued";
																						break;
																				default:
																						break;
																		}
																		// Trigger state events
																		var YTPEvent = jQuery.Event( eventType );
																		YTPEvent.time = YTPlayer.player.time;
																		if( YTPlayer.canTrigger ) jQuery( YTPlayer ).trigger( YTPEvent );
																},
																/**
																 *
																 * @param e
																 */
																'onPlaybackQualityChange': function( e ) {
																		var quality = e.target.getPlaybackQuality();
																		var YTPQualityChange = jQuery.Event( "YTPQualityChange" );
																		YTPQualityChange.quality = quality;
																		jQuery( YTPlayer ).trigger( YTPQualityChange );
																},
																/**
																 *
																 * @param err
																 */
																'onError': function( err ) {
																		if( err.data == 150 ) {
																				console.log( "Embedding this video is restricted by Youtube." );
																				if( YTPlayer.isPlayList ) jQuery( YTPlayer ).playNext();
																		}
																		if( err.data == 2 && YTPlayer.isPlayList ) jQuery( YTPlayer ).playNext();
																		if( typeof YTPlayer.opt.onError == "function" ) YTPlayer.opt.onError( $YTPlayer, err );
																}
														}
												} );
										} );
								} )
						} );
				},
				/**
				 *
				 * @param YTPlayer
				 */
				getDataFromAPI: function( YTPlayer ) {
						YTPlayer.videoData = jQuery.mbStorage.get( "YYTPlayer_data_" + YTPlayer.videoID );
						if( YTPlayer.videoData ) {
								setTimeout( function() {
										YTPlayer.opt.ratio = YTPlayer.opt.ratio == "auto" ? "16/9" : YTPlayer.opt.ratio;
										YTPlayer.dataReceived = true;
										jQuery( YTPlayer ).trigger( "YTPChanged" );
										var YTPData = jQuery.Event( "YTPData" );
										YTPData.prop = {};
										for( var x in YTPlayer.videoData ) YTPData.prop[ x ] = YTPlayer.videoData[ x ];
										jQuery( YTPlayer ).trigger( YTPData );
								}, 500 );
								YTPlayer.hasData = true;
						} else if( jQuery.mbYTPlayer.apiKey ) {
								// Get video info from API3 (needs api key)
								// snippet,player,contentDetails,statistics,status
								jQuery.getJSON( "https://www.googleapis.com/youtube/v3/videos?id=" + YTPlayer.videoID + "&key=" + jQuery.mbYTPlayer.apiKey + "&part=snippet", function( data ) {
										YTPlayer.dataReceived = true;
										jQuery( YTPlayer ).trigger( "YTPChanged" );

										function parseYTPlayer_data( data ) {
												YTPlayer.videoData = {};
												YTPlayer.videoData.id = YTPlayer.videoID;
												YTPlayer.videoData.channelTitle = data.channelTitle;
												YTPlayer.videoData.title = data.title;
												YTPlayer.videoData.description = data.description.length < 400 ? data.description : data.description.substring( 0, 400 ) + " ...";
												YTPlayer.videoData.aspectratio = YTPlayer.opt.ratio == "auto" ? "16/9" : YTPlayer.opt.ratio;
												YTPlayer.opt.ratio = YTPlayer.videoData.aspectratio;
												YTPlayer.videoData.thumb_max = data.thumbnails.maxres ? data.thumbnails.maxres.url : null;
												YTPlayer.videoData.thumb_high = data.thumbnails.high ? data.thumbnails.high.url : null;
												YTPlayer.videoData.thumb_medium = data.thumbnails.medium ? data.thumbnails.medium.url : null;
												jQuery.mbStorage.set( "YYTPlayer_data_" + YTPlayer.videoID, YTPlayer.videoData );
										}
										parseYTPlayer_data( data.items[ 0 ].snippet );
										YTPlayer.hasData = true;
										var YTPData = jQuery.Event( "YTPData" );
										YTPData.prop = {};
										for( var x in YTPlayer.videoData ) YTPData.prop[ x ] = YTPlayer.videoData[ x ];
										jQuery( YTPlayer ).trigger( YTPData );
								} );
						} else {
								setTimeout( function() {
										jQuery( YTPlayer ).trigger( "YTPChanged" );
								}, 50 );
								if( YTPlayer.isPlayer && !YTPlayer.opt.autoPlay ) {
										var bgndURL = "https://i.ytimg.com/vi/" + YTPlayer.videoID + "/hqdefault.jpg";
										YTPlayer.opt.containment.css( {
												background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center",
												backgroundSize: "cover"
										} );
										YTPlayer.opt.backgroundUrl = bgndURL;
								}
								YTPlayer.videoData = null;
								YTPlayer.opt.ratio = YTPlayer.opt.ratio == "auto" ? "16/9" : YTPlayer.opt.ratio;
						}
						jQuery( YTPlayer ).off( "YTPData.YTPlayer" ).on( "YTPData.YTPlayer", function() {
								if( !YTPlayer.hasData ) {
										YTPlayer.hasData = true;
										if( YTPlayer.isPlayer && !YTPlayer.opt.autoPlay ) {
												var bgndURL = YTPlayer.videoData.thumb_max || YTPlayer.videoData.thumb_high || YTPlayer.videoData.thumb_medium;
												YTPlayer.opt.containment.css( {
														background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center",
														backgroundSize: "cover"
												} );
												YTPlayer.opt.backgroundUrl = bgndURL;
										}
								}
						} );
						if( YTPlayer.isPlayer && !YTPlayer.opt.autoPlay ) {
								YTPlayer.loading = jQuery( "<div/>" ).addClass( "loading" ).html( "Loading" ).hide();
								jQuery( YTPlayer ).append( YTPlayer.loading );
								YTPlayer.loading.fadeIn();
						}
				},
				/**
				 *
				 */
				removeStoredData: function() {
						jQuery.mbStorage.remove();
				},
				/**
				 *
				 * @returns {*|YTPlayer.videoData}
				 */
				getVideoData: function() {
						var YTPlayer = this.get( 0 );
						return YTPlayer.videoData;
				},
				/**
				 *
				 * @returns {*|YTPlayer.videoID|boolean}
				 */
				getVideoID: function() {
						var YTPlayer = this.get( 0 );
						return YTPlayer.videoID || false;
				},
				/**
				 *
				 * @param quality
				 */
				setVideoQuality: function( quality ) {
						var YTPlayer = this.get( 0 );
						if( !jQuery.browser.chrome ) YTPlayer.player.setPlaybackQuality( quality );
				},
				/**
				 * @param videos
				 * @param shuffle
				 * @param callback
				 * @returns {jQuery.mbYTPlayer}
				 */
				playlist: function( videos, shuffle, callback ) {
						var $YTPlayer = this;
						var YTPlayer = $YTPlayer.get( 0 );
						YTPlayer.isPlayList = true;
						if( shuffle ) videos = jQuery.shuffle( videos );
						if( !YTPlayer.videoID ) {
								YTPlayer.videos = videos;
								YTPlayer.videoCounter = 0;
								YTPlayer.videoLength = videos.length;
								jQuery( YTPlayer ).data( "property", videos[ 0 ] );
								jQuery( YTPlayer ).mb_YTPlayer();
						}
						if( typeof callback == "function" ) jQuery( YTPlayer ).on( "YTPChanged", function() {
								callback( YTPlayer );
						} );
						jQuery( YTPlayer ).on( "YTPEnd", function() {
								jQuery( YTPlayer ).playNext();
						} );
						return $YTPlayer;
				},
				/**
				 *
				 * @returns {jQuery.mbYTPlayer}
				 */
				playNext: function() {
						var YTPlayer = this.get( 0 );
						YTPlayer.videoCounter++;
						if( YTPlayer.videoCounter >= YTPlayer.videoLength ) YTPlayer.videoCounter = 0;
						jQuery( YTPlayer ).changeMovie( YTPlayer.videos[ YTPlayer.videoCounter ] );
						return this;
				},
				/**
				 *
				 * @returns {jQuery.mbYTPlayer}
				 */
				playPrev: function() {
						var YTPlayer = this.get( 0 );
						YTPlayer.videoCounter--;
						if( YTPlayer.videoCounter < 0 ) YTPlayer.videoCounter = YTPlayer.videoLength - 1;
						jQuery( YTPlayer ).changeMovie( YTPlayer.videos[ YTPlayer.videoCounter ] );
						return this;
				},
				/**
				 *
				 * @param opt
				 */
				changeMovie: function( opt ) {
						var YTPlayer = this.get( 0 );
						YTPlayer.opt.startAt = 0;
						YTPlayer.opt.stopAt = 0;
						YTPlayer.opt.mute = true;
						YTPlayer.hasData = false;
						YTPlayer.hasChanged = true;
						if( opt ) jQuery.extend( YTPlayer.opt, YTPlayer.defaultOpt, opt );
						YTPlayer.videoID = getYTPVideoID( YTPlayer.opt.videoURL ).videoID;
						jQuery( YTPlayer.playerEl ).CSSAnimate( {
								opacity: 0
						}, 200, function() {
								jQuery( YTPlayer ).YTPGetPlayer().cueVideoByUrl( encodeURI( jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/v/" + YTPlayer.videoID ), 1, YTPlayer.opt.quality );
								jQuery.mbYTPlayer.checkForState( YTPlayer );
								jQuery( YTPlayer ).optimizeDisplay();
								jQuery.mbYTPlayer.getDataFromAPI( YTPlayer );
								return this;
						} );
				},
				/**
				 *
				 * @returns {player}
				 */
				getPlayer: function() {
						return jQuery( this ).get( 0 ).player;
				},
				playerDestroy: function() {
						var YTPlayer = this.get( 0 );
						ytp.YTAPIReady = false;
						ytp.backgroundIsInited = false;
						YTPlayer.isInit = false;
						YTPlayer.videoID = null;
						var playerBox = YTPlayer.wrapper;
						playerBox.remove();
						jQuery( "#controlBar_" + YTPlayer.id ).remove();
						clearInterval( YTPlayer.checkForStartAt );
						clearInterval( YTPlayer.getState );
						return this;
				},
				/**
				 *
				 * @param real
				 * @returns {jQuery.mbYTPlayer}
				 */
				fullscreen: function( real ) {
						var YTPlayer = this.get( 0 );
						if( typeof real == "undefined" ) real = YTPlayer.opt.realfullscreen;
						real = eval( real );
						var controls = jQuery( "#controlBar_" + YTPlayer.id );
						var fullScreenBtn = controls.find( ".mb_OnlyYT" );
						var videoWrapper = YTPlayer.isSelf ? YTPlayer.opt.containment : YTPlayer.wrapper;
						//var videoWrapper = YTPlayer.wrapper;
						if( real ) {
								var fullscreenchange = jQuery.browser.mozilla ? "mozfullscreenchange" : jQuery.browser.webkit ? "webkitfullscreenchange" : "fullscreenchange";
								jQuery( document ).off( fullscreenchange ).on( fullscreenchange, function() {
										var isFullScreen = RunPrefixMethod( document, "IsFullScreen" ) || RunPrefixMethod( document, "FullScreen" );
										if( !isFullScreen ) {
												YTPlayer.isAlone = false;
												fullScreenBtn.html( jQuery.mbYTPlayer.controls.onlyYT );
												jQuery( YTPlayer ).YTPSetVideoQuality( YTPlayer.opt.quality );
												videoWrapper.removeClass( "fullscreen" );
												videoWrapper.CSSAnimate( {
														opacity: YTPlayer.opt.opacity
												}, 500 );
												videoWrapper.css( {
														zIndex: 0
												} );
												if( YTPlayer.isBackground ) {
														jQuery( "body" ).after( controls );
												} else {
														YTPlayer.wrapper.before( controls );
												}
												jQuery( window ).resize();
												jQuery( YTPlayer ).trigger( "YTPFullScreenEnd" );
										} else {
												jQuery( YTPlayer ).YTPSetVideoQuality( "default" );
												jQuery( YTPlayer ).trigger( "YTPFullScreenStart" );
										}
								} );
						}
						if( !YTPlayer.isAlone ) {
								function hideMouse() {
										YTPlayer.overlay.css( {
												cursor: "none"
										} );
								}
								jQuery( document ).on( "mousemove.YTPlayer", function( e ) {
										YTPlayer.overlay.css( {
												cursor: "auto"
										} );
										clearTimeout( YTPlayer.hideCursor );
										if( !jQuery( e.target ).parents().is( ".mb_YTPBar" ) ) YTPlayer.hideCursor = setTimeout( hideMouse, 3000 );
								} );
								hideMouse();
								if( real ) {
										videoWrapper.css( {
												opacity: 0
										} );
										videoWrapper.addClass( "fullscreen" );
										launchFullscreen( videoWrapper.get( 0 ) );
										setTimeout( function() {
												videoWrapper.CSSAnimate( {
														opacity: 1
												}, 1000 );
												YTPlayer.wrapper.append( controls );
												jQuery( YTPlayer ).optimizeDisplay();
												YTPlayer.player.seekTo( YTPlayer.player.getCurrentTime() + .1, true );
										}, 500 )
								} else videoWrapper.css( {
										zIndex: 10000
								} ).CSSAnimate( {
										opacity: 1
								}, 1000 );
								fullScreenBtn.html( jQuery.mbYTPlayer.controls.showSite );
								YTPlayer.isAlone = true;
						} else {
								jQuery( document ).off( "mousemove.YTPlayer" );
								YTPlayer.overlay.css( {
										cursor: "auto"
								} );
								if( real ) {
										cancelFullscreen();
								} else {
										videoWrapper.CSSAnimate( {
												opacity: YTPlayer.opt.opacity
										}, 500 );
										videoWrapper.css( {
												zIndex: 0
										} );
								}
								fullScreenBtn.html( jQuery.mbYTPlayer.controls.onlyYT );
								YTPlayer.isAlone = false;
						}

						function RunPrefixMethod( obj, method ) {
								var pfx = [ "webkit", "moz", "ms", "o", "" ];
								var p = 0,
										m, t;
								while( p < pfx.length && !obj[ m ] ) {
										m = method;
										if( pfx[ p ] == "" ) {
												m = m.substr( 0, 1 ).toLowerCase() + m.substr( 1 );
										}
										m = pfx[ p ] + m;
										t = typeof obj[ m ];
										if( t != "undefined" ) {
												pfx = [ pfx[ p ] ];
												return( t == "function" ? obj[ m ]() : obj[ m ] );
										}
										p++;
								}
						}

						function launchFullscreen( element ) {
								RunPrefixMethod( element, "RequestFullScreen" );
						}

						function cancelFullscreen() {
								if( RunPrefixMethod( document, "FullScreen" ) || RunPrefixMethod( document, "IsFullScreen" ) ) {
										RunPrefixMethod( document, "CancelFullScreen" );
								}
						}
						return this;
				},
				/**
				 *
				 * @returns {jQuery.mbYTPlayer}
				 */
				toggleLoops: function() {
						var YTPlayer = this.get( 0 );
						var data = YTPlayer.opt;
						if( data.loop == 1 ) {
								data.loop = 0;
						} else {
								if( data.startAt ) {
										YTPlayer.player.seekTo( data.startAt );
								} else {
										YTPlayer.player.playVideo();
								}
								data.loop = 1;
						}
						return this;
				},
				/**
				 *
				 * @returns {jQuery.mbYTPlayer}
				 */
				play: function() {
						var YTPlayer = this.get( 0 );
						if( !YTPlayer.isReady ) return;
						var controls = jQuery( "#controlBar_" + YTPlayer.id );
						var playBtn = controls.find( ".mb_YTPPlaypause" );
						playBtn.html( jQuery.mbYTPlayer.controls.pause );
						YTPlayer.player.playVideo();
						YTPlayer.wrapper.CSSAnimate( {
								opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
						}, 2000 );
						jQuery( YTPlayer.playerEl ).CSSAnimate( {
								opacity: 1
						}, 1000 );
						jQuery( YTPlayer ).css( "background-image", "none" );
						return this;
				},
				/**
				 *
				 * @param callback
				 * @returns {jQuery.mbYTPlayer}
				 */
				togglePlay: function( callback ) {
						var YTPlayer = this.get( 0 );
						if( YTPlayer.state == 1 ) this.YTPPause();
						else this.YTPPlay();
						if( typeof callback == "function" ) {
								callback( YTPlayer.state );
						}
						return this;
				},
				/**
				 *
				 * @returns {jQuery.mbYTPlayer}
				 */
				stop: function() {
						var YTPlayer = this.get( 0 );
						var controls = jQuery( "#controlBar_" + YTPlayer.id );
						var playBtn = controls.find( ".mb_YTPPlaypause" );
						playBtn.html( jQuery.mbYTPlayer.controls.play );
						YTPlayer.player.stopVideo();
						return this;
				},
				/**
				 *
				 * @returns {jQuery.mbYTPlayer}
				 */
				pause: function() {
						var YTPlayer = this.get( 0 );
						var controls = jQuery( "#controlBar_" + YTPlayer.id );
						var playBtn = controls.find( ".mb_YTPPlaypause" );
						playBtn.html( jQuery.mbYTPlayer.controls.play );
						YTPlayer.player.pauseVideo();
						return this;
				},
				/**
				 *
				 * @param val
				 * @returns {jQuery.mbYTPlayer}
				 */
				seekTo: function( val ) {
						var YTPlayer = this.get( 0 );
						YTPlayer.player.seekTo( val, true );
						return this;
				},
				/**
				 *
				 * @param val
				 * @returns {jQuery.mbYTPlayer}
				 */
				setVolume: function( val ) {
						var YTPlayer = this.get( 0 );
						if( !val && !YTPlayer.opt.vol && YTPlayer.player.getVolume() == 0 ) jQuery( YTPlayer ).YTPUnmute();
						else if( ( !val && YTPlayer.player.getVolume() > 0 ) || ( val && YTPlayer.opt.vol == val ) ) {
								if( !YTPlayer.isMute ) jQuery( YTPlayer ).YTPMute();
								else jQuery( YTPlayer ).YTPUnmute();
						} else {
								YTPlayer.opt.vol = val;
								YTPlayer.player.setVolume( YTPlayer.opt.vol );
								if( YTPlayer.volumeBar && YTPlayer.volumeBar.length ) YTPlayer.volumeBar.updateSliderVal( val )
						}
						return this;
				},
				/**
				 *
				 * @returns {jQuery.mbYTPlayer}
				 */
				mute: function() {
						var YTPlayer = this.get( 0 );
						if( YTPlayer.isMute ) return;
						YTPlayer.player.mute();
						YTPlayer.isMute = true;
						YTPlayer.player.setVolume( 0 );
						if( YTPlayer.volumeBar && YTPlayer.volumeBar.length && YTPlayer.volumeBar.width() > 10 ) {
								YTPlayer.volumeBar.updateSliderVal( 0 );
						}
						var controls = jQuery( "#controlBar_" + YTPlayer.id );
						var muteBtn = controls.find( ".mb_YTPMuteUnmute" );
						muteBtn.html( jQuery.mbYTPlayer.controls.unmute );
						jQuery( YTPlayer ).addClass( "isMuted" );
						if( YTPlayer.volumeBar && YTPlayer.volumeBar.length ) YTPlayer.volumeBar.addClass( "muted" );
						var YTPEvent = jQuery.Event( "YTPMuted" );
						YTPEvent.time = YTPlayer.player.time;
						if( YTPlayer.canTrigger ) jQuery( YTPlayer ).trigger( YTPEvent );
						return this;
				},
				/**
				 *
				 * @returns {jQuery.mbYTPlayer}
				 */
				unmute: function() {
						var YTPlayer = this.get( 0 );
						if( !YTPlayer.isMute ) return;
						YTPlayer.player.unMute();
						YTPlayer.isMute = false;
						YTPlayer.player.setVolume( YTPlayer.opt.vol );
						if( YTPlayer.volumeBar && YTPlayer.volumeBar.length ) YTPlayer.volumeBar.updateSliderVal( YTPlayer.opt.vol > 10 ? YTPlayer.opt.vol : 10 );
						var controls = jQuery( "#controlBar_" + YTPlayer.id );
						var muteBtn = controls.find( ".mb_YTPMuteUnmute" );
						muteBtn.html( jQuery.mbYTPlayer.controls.mute );
						jQuery( YTPlayer ).removeClass( "isMuted" );
						if( YTPlayer.volumeBar && YTPlayer.volumeBar.length ) YTPlayer.volumeBar.removeClass( "muted" );
						var YTPEvent = jQuery.Event( "YTPUnmuted" );
						YTPEvent.time = YTPlayer.player.time;
						if( YTPlayer.canTrigger ) jQuery( YTPlayer ).trigger( YTPEvent );
						return this;
				},
				/**
				 *
				 * @param filter
				 * @param value
				 * @returns {jQuery.mbYTPlayer}
				 */
				applyFilter: function( filter, value ) {
						var YTPlayer = this.get( 0 );
						YTPlayer.filters[ filter ].value = value;
						if( YTPlayer.filtersEnabled ) this.YTPEnableFilters();
						return this;
				},
				/**
				 *
				 * @param filters
				 * @returns {jQuery.mbYTPlayer}
				 */
				applyFilters: function( filters ) {
						var YTPlayer = this.get( 0 );
						this.on( "YTPReady", function() {
								for( var key in filters ) {
										YTPlayer.filters[ key ].value = filters[ key ];
										jQuery( YTPlayer ).YTPApplyFilter( key, filters[ key ] );
								}
								jQuery( YTPlayer ).trigger( "YTPFiltersApplied" );
						} );
						return this;
				},
				/**
				 *
				 * @param filter
				 * @param value
				 * @returns {*}
				 */
				toggleFilter: function( filter, value ) {
						return this.each( function() {
								var YTPlayer = this;
								if( !YTPlayer.filters[ filter ].value ) YTPlayer.filters[ filter ].value = value;
								else YTPlayer.filters[ filter ].value = 0;
								if( YTPlayer.filtersEnabled ) jQuery( this ).YTPEnableFilters();
						} )
						return this;
				},
				/**
				 *
				 * @param callback
				 * @returns {*}
				 */
				toggleFilters: function( callback ) {
						return this.each( function() {
								var YTPlayer = this;
								if( YTPlayer.filtersEnabled ) {
										jQuery( YTPlayer ).trigger( "YTPDisableFilters" );
										jQuery( YTPlayer ).YTPDisableFilters();
								} else {
										jQuery( YTPlayer ).YTPEnableFilters();
										jQuery( YTPlayer ).trigger( "YTPEnableFilters" );
								}
								if( typeof callback == "function" ) callback( YTPlayer.filtersEnabled );
						} )
				},
				/**
				 *
				 * @returns {*}
				 */
				disableFilters: function() {
						return this.each( function() {
								var YTPlayer = this;
								var iframe = jQuery( YTPlayer.playerEl );
								iframe.css( "-webkit-filter", "" );
								iframe.css( "filter", "" );
								YTPlayer.filtersEnabled = false;
						} )
				},
				/**
				 *
				 * @returns {*}
				 */
				enableFilters: function() {
						return this.each( function() {
								var YTPlayer = this;
								var iframe = jQuery( YTPlayer.playerEl );
								var filterStyle = "";
								for( var key in YTPlayer.filters ) {
										if( YTPlayer.filters[ key ].value ) filterStyle += key.replace( "_", "-" ) + "(" + YTPlayer.filters[ key ].value + YTPlayer.filters[ key ].unit + ") ";
								}
								iframe.css( "-webkit-filter", filterStyle );
								iframe.css( "filter", filterStyle );
								YTPlayer.filtersEnabled = true;
						} )
						return this;
				},
				/**
				 *
				 * @param filter
				 * @param callback
				 * @returns {*}
				 */
				removeFilter: function( filter, callback ) {
						return this.each( function() {
								if( typeof filter == "function" ) {
										callback = filter;
										filter = null;
								}
								var YTPlayer = this;
								if( !filter )
										for( var key in YTPlayer.filters ) {
												jQuery( this ).YTPApplyFilter( key, 0 );
												if( typeof callback == "function" ) callback( key );
										} else {
												jQuery( this ).YTPApplyFilter( filter, 0 );
												if( typeof callback == "function" ) callback( filter );
										}
						} );
						return this;
				},
				/**
				 *
				 * @returns {{totalTime: number, currentTime: number}}
				 */
				manageProgress: function() {
						var YTPlayer = this.get( 0 );
						var controls = jQuery( "#controlBar_" + YTPlayer.id );
						var progressBar = controls.find( ".mb_YTPProgress" );
						var loadedBar = controls.find( ".mb_YTPLoaded" );
						var timeBar = controls.find( ".mb_YTPseekbar" );
						var totW = progressBar.outerWidth();
						var currentTime = Math.floor( YTPlayer.player.getCurrentTime() );
						var totalTime = Math.floor( YTPlayer.player.getDuration() );
						var timeW = ( currentTime * totW ) / totalTime;
						var startLeft = 0;
						var loadedW = YTPlayer.player.getVideoLoadedFraction() * 100;
						loadedBar.css( {
								left: startLeft,
								width: loadedW + "%"
						} );
						timeBar.css( {
								left: 0,
								width: timeW
						} );
						return {
								totalTime: totalTime,
								currentTime: currentTime
						};
				},
				/**
				 *
				 * @param YTPlayer
				 */
				buildControls: function( YTPlayer ) {
						var data = YTPlayer.opt;
						// @data.printUrl: is deprecated; use data.showYTLogo
						data.showYTLogo = data.showYTLogo || data.printUrl;
						if( jQuery( "#controlBar_" + YTPlayer.id ).length ) return;
						YTPlayer.controlBar = jQuery( "<span/>" ).attr( "id", "controlBar_" + YTPlayer.id ).addClass( "mb_YTPBar" ).css( {
								whiteSpace: "noWrap",
								position: YTPlayer.isBackground ? "fixed" : "absolute",
								zIndex: YTPlayer.isBackground ? 10000 : 1000
						} ).hide();
						var buttonBar = jQuery( "<div/>" ).addClass( "buttonBar" );
						/* play/pause button*/
						var playpause = jQuery( "<span>" + jQuery.mbYTPlayer.controls.play + "</span>" ).addClass( "mb_YTPPlaypause ytpicon" ).click( function() {
								if( YTPlayer.player.getPlayerState() == 1 ) jQuery( YTPlayer ).YTPPause();
								else jQuery( YTPlayer ).YTPPlay();
						} );
						/* mute/unmute button*/
						var MuteUnmute = jQuery( "<span>" + jQuery.mbYTPlayer.controls.mute + "</span>" ).addClass( "mb_YTPMuteUnmute ytpicon" ).click( function() {
								if( YTPlayer.player.getVolume() == 0 ) {
										jQuery( YTPlayer ).YTPUnmute();
								} else {
										jQuery( YTPlayer ).YTPMute();
								}
						} );
						/* volume bar*/
						var volumeBar = jQuery( "<div/>" ).addClass( "mb_YTPVolumeBar" ).css( {
								display: "inline-block"
						} );
						YTPlayer.volumeBar = volumeBar;
						/* time elapsed */
						var idx = jQuery( "<span/>" ).addClass( "mb_YTPTime" );
						var vURL = data.videoURL ? data.videoURL : "";
						if( vURL.indexOf( "http" ) < 0 ) vURL = jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/watch?v=" + data.videoURL;
						var movieUrl = jQuery( "<span/>" ).html( jQuery.mbYTPlayer.controls.ytLogo ).addClass( "mb_YTPUrl ytpicon" ).attr( "title", "view on YouTube" ).on( "click", function() {
								window.open( vURL, "viewOnYT" )
						} );
						var onlyVideo = jQuery( "<span/>" ).html( jQuery.mbYTPlayer.controls.onlyYT ).addClass( "mb_OnlyYT ytpicon" ).on( "click", function() {
								jQuery( YTPlayer ).YTPFullscreen( data.realfullscreen );
						} );
						var progressBar = jQuery( "<div/>" ).addClass( "mb_YTPProgress" ).css( "position", "absolute" ).click( function( e ) {
								timeBar.css( {
										width: ( e.clientX - timeBar.offset().left )
								} );
								YTPlayer.timeW = e.clientX - timeBar.offset().left;
								YTPlayer.controlBar.find( ".mb_YTPLoaded" ).css( {
										width: 0
								} );
								var totalTime = Math.floor( YTPlayer.player.getDuration() );
								YTPlayer.goto = ( timeBar.outerWidth() * totalTime ) / progressBar.outerWidth();
								YTPlayer.player.seekTo( parseFloat( YTPlayer.goto ), true );
								YTPlayer.controlBar.find( ".mb_YTPLoaded" ).css( {
										width: 0
								} );
						} );
						var loadedBar = jQuery( "<div/>" ).addClass( "mb_YTPLoaded" ).css( "position", "absolute" );
						var timeBar = jQuery( "<div/>" ).addClass( "mb_YTPseekbar" ).css( "position", "absolute" );
						progressBar.append( loadedBar ).append( timeBar );
						buttonBar.append( playpause ).append( MuteUnmute ).append( volumeBar ).append( idx );
						if( data.showYTLogo ) {
								buttonBar.append( movieUrl );
						}
						if( YTPlayer.isBackground || ( eval( YTPlayer.opt.realfullscreen ) && !YTPlayer.isBackground ) ) buttonBar.append( onlyVideo );
						YTPlayer.controlBar.append( buttonBar ).append( progressBar );
						if( !YTPlayer.isBackground ) {
								YTPlayer.controlBar.addClass( "inlinePlayer" );
								YTPlayer.wrapper.before( YTPlayer.controlBar );
						} else {
								jQuery( "body" ).after( YTPlayer.controlBar );
						}
						volumeBar.simpleSlider( {
								initialval: YTPlayer.opt.vol,
								scale: 100,
								orientation: "h",
								callback: function( el ) {
										if( el.value == 0 ) {
												jQuery( YTPlayer ).YTPMute();
										} else {
												jQuery( YTPlayer ).YTPUnmute();
										}
										YTPlayer.player.setVolume( el.value );
										if( !YTPlayer.isMute ) YTPlayer.opt.vol = el.value;
								}
						} );
				},
				/**
				 *
				 *
				 * */
				checkForState: function( YTPlayer ) {
						var interval = YTPlayer.opt.showControls ? 100 : 1000;
						clearInterval( YTPlayer.getState );
						//Checking if player has been removed from scene
						if( !jQuery.contains( document, YTPlayer ) ) {
								jQuery( YTPlayer ).YTPPlayerDestroy();
								clearInterval( YTPlayer.getState );
								clearInterval( YTPlayer.checkForStartAt );
								return;
						}
						jQuery.mbYTPlayer.checkForStart( YTPlayer );
						YTPlayer.getState = setInterval( function() {
								var prog = jQuery( YTPlayer ).YTPManageProgress();
								var $YTPlayer = jQuery( YTPlayer );
								var data = YTPlayer.opt;
								var startAt = YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 0;
								var stopAt = YTPlayer.opt.stopAt > YTPlayer.opt.startAt ? YTPlayer.opt.stopAt : 0;
								stopAt = stopAt < YTPlayer.player.getDuration() ? stopAt : 0;
								if( YTPlayer.player.time != prog.currentTime ) {
										var YTPEvent = jQuery.Event( "YTPTime" );
										YTPEvent.time = YTPlayer.player.time;
										jQuery( YTPlayer ).trigger( YTPEvent );
								}
								YTPlayer.player.time = prog.currentTime;
								if( YTPlayer.player.getVolume() == 0 ) $YTPlayer.addClass( "isMuted" );
								else $YTPlayer.removeClass( "isMuted" );
								if( YTPlayer.opt.showControls )
										if( prog.totalTime ) {
												YTPlayer.controlBar.find( ".mb_YTPTime" ).html( jQuery.mbYTPlayer.formatTime( prog.currentTime ) + " / " + jQuery.mbYTPlayer.formatTime( prog.totalTime ) );
										} else {
												YTPlayer.controlBar.find( ".mb_YTPTime" ).html( "-- : -- / -- : --" );
										}
								if( eval( YTPlayer.opt.stopMovieOnBlur ) )
										if( !document.hasFocus() ) {
												if( YTPlayer.state == 1 ) {
														YTPlayer.hasFocus = false;
														$YTPlayer.YTPPause();
												}
										} else if( document.hasFocus() && !YTPlayer.hasFocus && !( YTPlayer.state == -1 || YTPlayer.state == 0 ) ) {
										YTPlayer.hasFocus = true;
										$YTPlayer.YTPPlay();
								}
								if( YTPlayer.controlBar && YTPlayer.controlBar.outerWidth() <= 400 && !YTPlayer.isCompact ) {
										YTPlayer.controlBar.addClass( "compact" );
										YTPlayer.isCompact = true;
										if( !YTPlayer.isMute && YTPlayer.volumeBar ) YTPlayer.volumeBar.updateSliderVal( YTPlayer.opt.vol );
								} else if( YTPlayer.controlBar && YTPlayer.controlBar.outerWidth() > 400 && YTPlayer.isCompact ) {
										YTPlayer.controlBar.removeClass( "compact" );
										YTPlayer.isCompact = false;
										if( !YTPlayer.isMute && YTPlayer.volumeBar ) YTPlayer.volumeBar.updateSliderVal( YTPlayer.opt.vol );
								}
								if( YTPlayer.player.getPlayerState() == 1 && ( parseFloat( YTPlayer.player.getDuration() - 3 ) < YTPlayer.player.getCurrentTime() || ( stopAt > 0 && parseFloat( YTPlayer.player.getCurrentTime() ) > stopAt ) ) ) {
										if( YTPlayer.isEnded ) return;
										YTPlayer.isEnded = true;
										setTimeout( function() {
												YTPlayer.isEnded = false
										}, 2000 );
										if( YTPlayer.isPlayList ) {
												clearInterval( YTPlayer.getState );
												var YTPEnd = jQuery.Event( "YTPEnd" );
												YTPEnd.time = YTPlayer.player.time;
												jQuery( YTPlayer ).trigger( YTPEnd );
												return;
										} else if( !data.loop ) {
												YTPlayer.player.pauseVideo();
												YTPlayer.wrapper.CSSAnimate( {
														opacity: 0
												}, 1000, function() {
														var YTPEnd = jQuery.Event( "YTPEnd" );
														YTPEnd.time = YTPlayer.player.time;
														jQuery( YTPlayer ).trigger( YTPEnd );
														YTPlayer.player.seekTo( startAt, true );
														if( !YTPlayer.isBackground ) {
																YTPlayer.opt.containment.css( {
																		background: "rgba(0,0,0,0.5) url(" + YTPlayer.opt.backgroundUrl + ") center center",
																		backgroundSize: "cover"
																} );
														}
												} );
										} else YTPlayer.player.seekTo( startAt, true );
								}
						}, interval );
				},
				/**
				 *
				 * */
				checkForStart: function( YTPlayer ) {
						var $YTPlayer = jQuery( YTPlayer );
						//Checking if player has been removed from scene
						if( !jQuery.contains( document, YTPlayer ) ) {
								jQuery( YTPlayer ).YTPPlayerDestroy();
								return
						}
						if( jQuery.browser.chrome ) YTPlayer.opt.quality = "default";
						YTPlayer.player.pauseVideo();
						jQuery( YTPlayer ).muteYTPVolume();
						jQuery( "#controlBar_" + YTPlayer.id ).remove();
						if( YTPlayer.opt.showControls ) jQuery.mbYTPlayer.buildControls( YTPlayer );
						if( YTPlayer.opt.addRaster ) {
								var classN = YTPlayer.opt.addRaster == "dot" ? "raster-dot" : "raster";
								YTPlayer.overlay.addClass( YTPlayer.isRetina ? classN + " retina" : classN );
						} else {
								YTPlayer.overlay.removeClass( function( index, classNames ) {
										// change the list into an array
										var current_classes = classNames.split( " " ),
												// array of classes which are to be removed
												classes_to_remove = [];
										jQuery.each( current_classes, function( index, class_name ) {
												// if the classname begins with bg add it to the classes_to_remove array
												if( /raster.*/.test( class_name ) ) {
														classes_to_remove.push( class_name );
												}
										} );
										classes_to_remove.push( "retina" );
										// turn the array back into a string
										return classes_to_remove.join( " " );
								} )
						}
						YTPlayer.checkForStartAt = setInterval( function() {
								jQuery( YTPlayer ).YTPMute();
								var startAt = YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;
								var canPlayVideo = ( YTPlayer.player.getVideoLoadedFraction() > startAt / YTPlayer.player.getDuration() );
								if( YTPlayer.player.getDuration() > 0 && YTPlayer.player.getCurrentTime() >= startAt && canPlayVideo ) {
										clearInterval( YTPlayer.checkForStartAt );
										YTPlayer.isReady = true;
										if( typeof YTPlayer.opt.onReady == "function" ) YTPlayer.opt.onReady( YTPlayer );
										var YTPready = jQuery.Event( "YTPReady" );
										jQuery( YTPlayer ).trigger( YTPready );
										YTPlayer.player.pauseVideo();
										if( !YTPlayer.opt.mute ) jQuery( YTPlayer ).YTPUnmute();
										YTPlayer.canTrigger = true;
										if( YTPlayer.opt.autoPlay ) {
												$YTPlayer.YTPPlay();
												$YTPlayer.css( "background-image", "none" );
												jQuery( YTPlayer.playerEl ).CSSAnimate( {
														opacity: 1
												}, 1000 );
												YTPlayer.wrapper.CSSAnimate( {
														opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
												}, 1000 );
										} else {
												YTPlayer.player.pauseVideo();
												if( !YTPlayer.isPlayer ) {
														jQuery( YTPlayer.playerEl ).CSSAnimate( {
																opacity: 1
														}, 1000 );
														YTPlayer.wrapper.CSSAnimate( {
																opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
														}, 1000 );
												}
										}
										if( YTPlayer.isPlayer && !YTPlayer.opt.autoPlay ) {
												YTPlayer.loading.html( "Ready" );
												setTimeout( function() {
														YTPlayer.loading.fadeOut();
												}, 100 )
										}
										if( YTPlayer.controlBar ) YTPlayer.controlBar.slideDown( 1000 );
								} else {
										//YTPlayer.player.playVideo();
										if( startAt >= 0 ) YTPlayer.player.seekTo( startAt, true );
								}
						}, 1000 );
				},
				/**
				 *
				 * @param s
				 * @returns {string}
				 */
				formatTime: function( s ) {
						var min = Math.floor( s / 60 );
						var sec = Math.floor( s - ( 60 * min ) );
						return( min <= 9 ? "0" + min : min ) + " : " + ( sec <= 9 ? "0" + sec : sec );
				}
		};
		/**
		 *
		 * @returns {boolean}
		 */
		jQuery.fn.toggleVolume = function() {
				var YTPlayer = this.get( 0 );
				if( !YTPlayer ) return;
				if( YTPlayer.player.isMuted() ) {
						jQuery( YTPlayer ).YTPUnmute();
						return true;
				} else {
						jQuery( YTPlayer ).YTPMute();
						return false;
				}
		};
		/**
		 *
		 */
		jQuery.fn.optimizeDisplay = function() {
				var YTPlayer = this.get( 0 );
				var data = YTPlayer.opt;
				var playerBox = jQuery( YTPlayer.playerEl );
				var win = {};
				var el = YTPlayer.wrapper;
				win.width = el.outerWidth();
				win.height = el.outerHeight();
				var margin = 24;
				var overprint = 100;
				var vid = {};
				if( data.optimizeDisplay ) {
						vid.width = win.width + ( ( win.width * margin ) / 100 );
						vid.height = data.ratio == "16/9" ? Math.ceil( ( 9 * win.width ) / 16 ) : Math.ceil( ( 3 * win.width ) / 4 );
						vid.marginTop = -( ( vid.height - win.height ) / 2 );
						vid.marginLeft = -( ( win.width * ( margin / 2 ) ) / 100 );
						if( vid.height < win.height ) {
								vid.height = win.height + ( ( win.height * margin ) / 100 );
								vid.width = data.ratio == "16/9" ? Math.floor( ( 16 * win.height ) / 9 ) : Math.floor( ( 4 * win.height ) / 3 );
								vid.marginTop = -( ( win.height * ( margin / 2 ) ) / 100 );
								vid.marginLeft = -( ( vid.width - win.width ) / 2 );
						}
						vid.width += overprint;
						vid.height += overprint;
						vid.marginTop -= overprint / 2;
						vid.marginLeft -= overprint / 2;
				} else {
						vid.width = "100%";
						vid.height = "100%";
						vid.marginTop = 0;
						vid.marginLeft = 0;
				}
				playerBox.css( {
						width: vid.width,
						height: vid.height,
						marginTop: vid.marginTop,
						marginLeft: vid.marginLeft
				} );
		};
		/**
		 *
		 * @param arr
		 * @returns {Array|string|Blob|*}
		 *
		 */
		jQuery.shuffle = function( arr ) {
				var newArray = arr.slice();
				var len = newArray.length;
				var i = len;
				while( i-- ) {
						var p = parseInt( Math.random() * len );
						var t = newArray[ i ];
						newArray[ i ] = newArray[ p ];
						newArray[ p ] = t;
				}
				return newArray;
		};
		/* Exposed public method */
		jQuery.fn.YTPlayer = jQuery.mbYTPlayer.buildPlayer;
		jQuery.fn.YTPlaylist = jQuery.mbYTPlayer.playlist;
		jQuery.fn.YTPPlayNext = jQuery.mbYTPlayer.playNext;
		jQuery.fn.YTPPlayPrev = jQuery.mbYTPlayer.playPrev;
		jQuery.fn.YTPChangeMovie = jQuery.mbYTPlayer.changeMovie;
		jQuery.fn.YTPGetVideoID = jQuery.mbYTPlayer.getVideoID;
		jQuery.fn.YTPGetPlayer = jQuery.mbYTPlayer.getPlayer;
		jQuery.fn.YTPPlayerDestroy = jQuery.mbYTPlayer.playerDestroy;
		jQuery.fn.YTPFullscreen = jQuery.mbYTPlayer.fullscreen;
		jQuery.fn.YTPPlay = jQuery.mbYTPlayer.play;
		jQuery.fn.YTPTogglePlay = jQuery.mbYTPlayer.togglePlay;
		jQuery.fn.YTPToggleLoops = jQuery.mbYTPlayer.toggleLoops;
		jQuery.fn.YTPStop = jQuery.mbYTPlayer.stop;
		jQuery.fn.YTPPause = jQuery.mbYTPlayer.pause;
		jQuery.fn.YTPSeekTo = jQuery.mbYTPlayer.seekTo;
		jQuery.fn.YTPMute = jQuery.mbYTPlayer.mute;
		jQuery.fn.YTPUnmute = jQuery.mbYTPlayer.unmute;
		jQuery.fn.YTPToggleVolume = jQuery.mbYTPlayer.toggleVolume;
		jQuery.fn.YTPSetVolume = jQuery.mbYTPlayer.setVolume;
		jQuery.fn.YTPSetVideoQuality = jQuery.mbYTPlayer.setVideoQuality;
		jQuery.fn.YTPManageProgress = jQuery.mbYTPlayer.manageProgress;
		jQuery.fn.YTPGetVideoData = jQuery.mbYTPlayer.getVideoData;
		jQuery.fn.YTPApplyFilter = jQuery.mbYTPlayer.applyFilter;
		jQuery.fn.YTPApplyFilters = jQuery.mbYTPlayer.applyFilters;
		jQuery.fn.YTPToggleFilter = jQuery.mbYTPlayer.toggleFilter;
		jQuery.fn.YTPToggleFilters = jQuery.mbYTPlayer.toggleFilters;
		jQuery.fn.YTPRemoveFilter = jQuery.mbYTPlayer.removeFilter;
		jQuery.fn.YTPDisableFilters = jQuery.mbYTPlayer.disableFilters;
		jQuery.fn.YTPEnableFilters = jQuery.mbYTPlayer.enableFilters;
		/**
		 *
		 * @deprecated
		 *
		 **/
		jQuery.fn.mb_YTPlayer = jQuery.mbYTPlayer.buildPlayer;
		jQuery.fn.playNext = jQuery.mbYTPlayer.playNext;
		jQuery.fn.playPrev = jQuery.mbYTPlayer.playPrev;
		jQuery.fn.changeMovie = jQuery.mbYTPlayer.changeMovie;
		jQuery.fn.getVideoID = jQuery.mbYTPlayer.getVideoID;
		jQuery.fn.getPlayer = jQuery.mbYTPlayer.getPlayer;
		jQuery.fn.playerDestroy = jQuery.mbYTPlayer.playerDestroy;
		jQuery.fn.fullscreen = jQuery.mbYTPlayer.fullscreen;
		jQuery.fn.buildYTPControls = jQuery.mbYTPlayer.buildControls;
		jQuery.fn.playYTP = jQuery.mbYTPlayer.play;
		jQuery.fn.toggleLoops = jQuery.mbYTPlayer.toggleLoops;
		jQuery.fn.stopYTP = jQuery.mbYTPlayer.stop;
		jQuery.fn.pauseYTP = jQuery.mbYTPlayer.pause;
		jQuery.fn.seekToYTP = jQuery.mbYTPlayer.seekTo;
		jQuery.fn.muteYTPVolume = jQuery.mbYTPlayer.mute;
		jQuery.fn.unmuteYTPVolume = jQuery.mbYTPlayer.unmute;
		jQuery.fn.setYTPVolume = jQuery.mbYTPlayer.setVolume;
		jQuery.fn.setVideoQuality = jQuery.mbYTPlayer.setVideoQuality;
		jQuery.fn.manageYTPProgress = jQuery.mbYTPlayer.manageProgress;
		jQuery.fn.YTPGetDataFromFeed = jQuery.mbYTPlayer.getVideoData;
} )( jQuery, ytp );
