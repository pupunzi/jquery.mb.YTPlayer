/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 jquery.mb.components
 
 file: jquery.mb.YTPlayer.es6.js
 last modified: 10/25/18 8:00 PM
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

/* src-block */
alert("This is the 'jquery.mb.vimeo_player.src.js' javascript file and can't be included. Use the one you find in the 'dist' folder!");
/* end-src-block */


const ytp = {};

function onYouTubeIframeAPIReady() {
  if (ytp.YTAPIReady) return;
  ytp.YTAPIReady = true;
  jQuery(document).trigger("YTAPIReady");
}

const getYTPVideoID = url => {
  let videoID;
  let playlistID;
  if (url.indexOf("youtu.be") > 0) {
    videoID = url.substr(url.lastIndexOf("/") + 1, url.length);
    playlistID = videoID.indexOf("?list=") > 0 ? videoID.substr(videoID.lastIndexOf("="), videoID.length) : null;
    videoID = playlistID ? videoID.substr(0, videoID.lastIndexOf("?")) : videoID;
  } else if (url.includes("http")) {
    //videoID = url.match( /([\/&]v\/([^&#]*))|([\\?&]v=([^&#]*))/ )[ 1 ];
    videoID = url.match(/[\\?&]v=([^&#]*)/)[1];
    playlistID = url.indexOf("list=") > 0 ? url.match(/[\\?&]list=([^&#]*)/)[1] : null;
  } else {
    videoID = url.length > 15 ? null : url;
    playlistID = videoID ? null : url;
  }
  return {
    videoID,
    playlistID
  };
};

(((jQuery, ytp) => {

  jQuery.mbYTPlayer = {
    name: "jquery.mb.YTPlayer",
    version: "{{ version }}",
    build: "{{ buildnum }}",
    author: "Matteo Bicocchi (pupunzi)",
    apiKey: "",

    /**
     * Default options for the player
     */
    defaults: {
      containment: "body", /* default containment for the player */
      ratio: "auto", /* "auto", "16/9", "4/3" or number: 4/3, 16/9 */
      videoURL: null,
      startAt: 0,
      stopAt: 0,
      autoPlay: true,
      vol: 50, /* 1 to 100 */
      addRaster: false,
      mask: false, /* Ex: mask:{ 0:'assets/mask-1.png', 5:'assets/mask-2.png', 30: false, 50:'assets/mask-3.png'}*/
      opacity: 1,
      quality: "default", /* or “small”, “medium”, “large”, “hd720”, “hd1080”, “highres” */
      mute: false,
      loop: true,
      fadeOnStartTime: 1500, /* fade in timing at video start */
      showControls: true,
      showAnnotations: false,
      cc_load_policy: false,
      showYTLogo: true,
      stopMovieOnBlur: true,
      realfullscreen: true,
      abundance: 0.2,
      coverImage: false,

      useOnMobile: true,
      mobileFallbackImage: null,

      gaTrack: true,
      optimizeDisplay: true,
      remember_last_time: false,
      playOnlyIfVisible: false,
      anchor: "center,center", /* top,bottom,left,right combined in pair */
      addFilters: null,

      onReady(player) {
      },
      onError(player, err) {
      }
    },
    /**
     *  @fontface icons
     *  */
    controls: {
      play: "P",
      pause: "p",
      mute: "M",
      unmute: "A",
      onlyYT: "O",
      showSite: "R",
      ytLogo: "Y"
    },
    controlBar: null,
    locationProtocol: "https:",

    /**
     * Applicable filters
     */
    defaultFilters: {
      grayscale: {value: 0, unit: "%"},
      hue_rotate: {value: 0, unit: "deg"},
      invert: {value: 0, unit: "%"},
      opacity: {value: 0, unit: "%"},
      saturate: {value: 0, unit: "%"},
      sepia: {value: 0, unit: "%"},
      brightness: {value: 0, unit: "%"},
      contrast: {value: 0, unit: "%"},
      blur: {value: 0, unit: "px"}
    },

    /**
     * build the player
     * @param options
     * @returns [players]
     */
    buildPlayer(options) {

      if (!ytp.YTAPIReady && typeof window.YT === 'undefined') {
        jQuery("#YTAPI").remove();
        const tag = jQuery("<script></script>").attr({
          "src": `${jQuery.mbYTPlayer.locationProtocol}//www.youtube.com/iframe_api?v=${jQuery.mbYTPlayer.version}`,
          "id": "YTAPI"
        });
        jQuery("head").prepend(tag);
      } else {
        setTimeout(() => {
          jQuery(document).trigger("YTAPIReady");
          ytp.YTAPIReady = true;
        }, 100);
      }

      function isIframe() {
        let isIfr = false;
        try {
          if (self.location.href != top.location.href) isIfr = true;
        } catch (e) {
          isIfr = true;
        }
        return isIfr;
      };

      //console.time( "YTPlayerInit" );

      return this.each(function () {
        const YTPlayer = this;
        const $YTPlayer = jQuery(YTPlayer);
        $YTPlayer.hide();
        YTPlayer.loop = 0;
        YTPlayer.state = 0;
        YTPlayer.filters = jQuery.extend(true, {}, jQuery.mbYTPlayer.defaultFilters);
        YTPlayer.filtersEnabled = true;
        YTPlayer.id = YTPlayer.id || `YTP_${new Date().getTime()}`;
        $YTPlayer.addClass("mb_YTPlayer");

        /* Set properties */
        let property = $YTPlayer.data("property") && typeof $YTPlayer.data("property") == "string" ?
            eval(`(${$YTPlayer.data("property")})`) :
            $YTPlayer.data("property");
        if (typeof property !== "object") {
          property = {};
        }
        YTPlayer.opt = jQuery.mbYTPlayer.defaults;
        jQuery.extend(YTPlayer.opt, options, property);
        YTPlayer.opt.elementId = YTPlayer.id;
        if (YTPlayer.opt.vol === 0) {
          YTPlayer.opt.vol = 1;
          YTPlayer.opt.mute = true;
        }
        if (YTPlayer.opt.loop && typeof YTPlayer.opt.loop === "boolean") {
          YTPlayer.opt.loop = 9999;
        }
        /* Disable fullScreen if is in an iframe */
        YTPlayer.opt.realfullscreen = isIframe() ? false : YTPlayer.opt.realfullscreen;
        /* Manage annotations */
        YTPlayer.opt.showAnnotations = YTPlayer.opt.showAnnotations ? '1' : '3';
        /* Manage show subtitle and caption */
        YTPlayer.opt.cc_load_policy = YTPlayer.opt.cc_load_policy ? '1' : '0';
        /* Manage cover image */
        YTPlayer.opt.coverImage = YTPlayer.opt.coverImage || YTPlayer.opt.backgroundImage;
        /* Manage Opacity */
        if (jQuery.mbBrowser.msie && jQuery.mbBrowser.version < 9) {
          YTPlayer.opt.opacity = 1;
        }
        YTPlayer.opt.containment = YTPlayer.opt.containment === "self" ? $YTPlayer : jQuery(YTPlayer.opt.containment);
        YTPlayer.isRetina = (window.retina || window.devicePixelRatio > 1);

        if (!$YTPlayer.attr("id"))
          $YTPlayer.attr("id", `ytp_${new Date().getTime()}`);

        YTPlayer.playerID = `iframe_${YTPlayer.id}`;

        YTPlayer.isAlone = false;
        YTPlayer.hasFocus = true;
        YTPlayer.videoID = YTPlayer.opt.videoURL ?
            getYTPVideoID(YTPlayer.opt.videoURL).videoID : $YTPlayer.attr("href") ?
                getYTPVideoID($YTPlayer.attr("href")).videoID :
                false;

        /* Check if it is a video list */
        YTPlayer.playlistID = YTPlayer.opt.videoURL ?
            getYTPVideoID(YTPlayer.opt.videoURL).playlistID : $YTPlayer.attr("href") ?
                getYTPVideoID($YTPlayer.attr("href")).playlistID :
                false;

        let start_from_last = 0;
        if (jQuery.mbCookie.get(`YTPlayer_start_from${YTPlayer.videoID}`))
          start_from_last = parseFloat(jQuery.mbCookie.get(`YTPlayer_start_from${YTPlayer.videoID}`));
        if (YTPlayer.opt.remember_last_time && start_from_last) {
          YTPlayer.start_from_last = start_from_last;
          jQuery.mbCookie.remove(`YTPlayer_start_from${YTPlayer.videoID}`);
        }

        YTPlayer.isPlayer = $YTPlayer.is(YTPlayer.opt.containment);
        YTPlayer.isBackground = YTPlayer.opt.containment.is("body");

        if (YTPlayer.isBackground && ytp.backgroundIsInited)
          return;

        /* Hide the placeholder if it's not the target of the player */
        if (YTPlayer.isPlayer)
          $YTPlayer.show();

        /* create the overlay */
        YTPlayer.overlay = jQuery("<div/>").css({
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }).addClass("YTPOverlay");

        /* If is a inline player toggle play if the overlay is clicked*/
        if (YTPlayer.isPlayer) {
          YTPlayer.overlay.on("click", () => {
            $YTPlayer.YTPTogglePlay();
          })
        }

        /* create the wrapper */
        YTPlayer.wrapper = jQuery("<div/>").addClass("mbYTP_wrapper").attr("id", `wrapper_${YTPlayer.id}`);

        YTPlayer.wrapper.css({
          position: "absolute",
          zIndex: 0,
          minWidth: "100%",
          minHeight: "100%",
          left: 0,
          top: 0,
          overflow: "hidden",
          opacity: 0
        });

        /* create the playerBox where the YT iframe will be placed */
        const playerBox = jQuery("<div/>").attr("id", YTPlayer.playerID).addClass("playerBox");
        playerBox.css({
          position: "absolute",
          zIndex: 0,
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          overflow: "hidden",
          opacity: 1
        });

        YTPlayer.wrapper.append(playerBox);
        playerBox.after(YTPlayer.overlay);

        if (YTPlayer.isPlayer) {
          YTPlayer.inlineWrapper = jQuery("<div/>").addClass("inline-YTPlayer");

          YTPlayer.inlineWrapper.css({
            position: "relative",
            maxWidth: YTPlayer.opt.containment.css("width")
          });

          YTPlayer.opt.containment.css({
            position: "relative",
            paddingBottom: "56.25%",
            overflow: "hidden",
            height: 0
          });
          YTPlayer.opt.containment.wrap(YTPlayer.inlineWrapper);
        }

        /* Loop all the elements inside the container and check if their position is not "static"*/
        YTPlayer.opt.containment.children().not("script, style").each(function () {
          if (jQuery(this).css("position") == "static")
            jQuery(this).css("position", "relative");
        });

        if (YTPlayer.isBackground) {
          jQuery("body").css({
            boxSizing: "border-box"
          });

          YTPlayer.wrapper.css({
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 0
          });

        } else if (YTPlayer.opt.containment.css("position") == "static") {

          YTPlayer.opt.containment.css({
            position: "relative"
          });
          $YTPlayer.show();
        }
        YTPlayer.opt.containment.prepend(YTPlayer.wrapper);

        if (!YTPlayer.isBackground) {
          YTPlayer.overlay.on("mouseenter", () => {
            if (YTPlayer.controlBar && YTPlayer.controlBar.length)
              YTPlayer.controlBar.addClass("visible");
          }).on("mouseleave", () => {
            if (YTPlayer.controlBar && YTPlayer.controlBar.length)
              YTPlayer.controlBar.removeClass("visible");
          });
        }

        if (jQuery.mbBrowser.mobile && !YTPlayer.opt.useOnMobile) {
          if (YTPlayer.opt.mobileFallbackImage) {
            YTPlayer.wrapper.css({
              backgroundImage: `url(${YTPlayer.opt.mobileFallbackImage})`,
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              opacity: 1
            });
            YTPlayer.wrapper.css({opacity: 1})
          }
          return $YTPlayer;
        }

        /* If is on device start playing on first touch */
        if (jQuery.mbBrowser.mobile && YTPlayer.opt.autoPlay && YTPlayer.opt.useOnMobile)
          jQuery("body").one("touchstart", () => {
            YTPlayer.player.playVideo();
          });

        jQuery(document).one("YTAPIReady", () => {
          $YTPlayer.trigger(`YTAPIReady_${YTPlayer.id}`);
          ytp.YTAPIReady = true;
        });

        YTPlayer.isOnScreen = jQuery.mbYTPlayer.isOnScreen(YTPlayer);

        $YTPlayer.one(`YTAPIReady_${YTPlayer.id}`, function () {

          const YTPlayer = this;
          const $YTPlayer = jQuery(YTPlayer);

          if ((YTPlayer.isBackground && ytp.backgroundIsInited) || YTPlayer.isInit)
            return;

          if (YTPlayer.isBackground)
            ytp.backgroundIsInited = true;

          YTPlayer.opt.autoPlay = typeof YTPlayer.opt.autoPlay == "undefined" ? (YTPlayer.isBackground ? true : false) : YTPlayer.opt.autoPlay;
          YTPlayer.opt.vol = YTPlayer.opt.vol ? YTPlayer.opt.vol : 100;

          jQuery.mbYTPlayer.getDataFromAPI(YTPlayer);

          jQuery(YTPlayer).on("YTPChanged", e => {

            if (YTPlayer.isInit)
              return;

            YTPlayer.isInit = true;

            /** Initialize the YT player ------------------------------------
             * Youtube player variables
             * @type {{modestbranding: number, autoplay: number, controls: number, showinfo: number, rel: number, enablejsapi: number, version: number, playerapiid: string, origin: string, allowfullscreen: boolean, iv_load_policy: (string|*|jQuery.mbYTPlayer.opt.showAnnotations), playsinline: number}}
             */
            const playerVars = {
              'modestbranding': 1,
              'autoplay': 0,
              'controls': 0,
              'showinfo': 0,
              'rel': 0,
              'enablejsapi': 1,
              'version': 3,
              'playerapiid': YTPlayer.playerID,
              'origin': '*',
              'allowfullscreen': true,
              'wmode': 'transparent',
              'iv_load_policy': YTPlayer.opt.showAnnotations,
              'cc_load_policy': YTPlayer.opt.cc_load_policy,
              'playsinline': jQuery.browser.mobile ? 1 : 0,

              /* Check if the browser can play HTML5 videos */
              'html5': document.createElement('video').canPlayType ? 1 : 0
            };

            new YT.Player(YTPlayer.playerID, {
              //videoId: YTPlayer.videoID.toString(),
              playerVars,
              events: {
                'onReady': function ({target}) {

                  YTPlayer.player = target;
                  //todo: make playlist works
                  /* if (YTPlayer.playlistID && YTPlayer.apiKey) {
                      YTPlayer.isList = true;
                      YTPlayer.videos = [];
                      YTPlayer.player.cuePlaylist({
                        listType: 'playlist',
                        list: YTPlayer.playlistID.toString(),
                        startSeconds: YTPlayer.opt.startAt,
                        endSeconds: YTPlayer.opt.stopAt,
                        suggestedQuality: YTPlayer.opt.quality
                      });
                    }
                     else { */

                  YTPlayer.player.loadVideoById({
                    videoId: YTPlayer.videoID.toString(),
                    // startSeconds: YTPlayer.start_from_last || YTPlayer.opt.startAt,
                    // endSeconds: YTPlayer.opt.stopAt,
                    suggestedQuality: YTPlayer.opt.quality
                  });

                  /*}*/

                  $YTPlayer.trigger(`YTPlayerIsReady_${YTPlayer.id}`);
                },
                /**
                 * on State Change
                 * @param event
                 *
                 * -1 (unstarted)
                 * 0 (ended)
                 * 1 (playing)
                 * 2 (paused)
                 * 3 (buffering)
                 * 5 (video cued)
                 */
                'onStateChange': function ({target}) {

                  if (typeof target.getPlayerState != "function")
                    return;

                  const state = target.getPlayerState();

                  if (YTPlayer.preventTrigger) {
                    YTPlayer.preventTrigger = false;
                    return
                  }

                  YTPlayer.state = state;

                  let eventType;
                  switch (state) {
                    case -1: //----------------------------------------------- unstarted
                      eventType = "YTPUnstarted";
                      break;
                    case 0: //------------------------------------------------ ended
                      eventType = "YTPRealEnd";
                      break;
                    case 1: //------------------------------------------------ play
                      eventType = "YTPPlay";
                      if (YTPlayer.controlBar.length)
                        YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.pause);
                      break;
                    case 2: //------------------------------------------------ pause
                      eventType = "YTPPause";
                      if (YTPlayer.controlBar.length)
                        YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
                      break;
                    case 3: //------------------------------------------------ buffer
                      YTPlayer.player.setPlaybackQuality(YTPlayer.opt.quality);
                      eventType = "YTPBuffering";
                      if (YTPlayer.controlBar.length)
                        YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
                      break;
                    case 5: //------------------------------------------------ cued
                      eventType = "YTPCued";

                      /* If it is a playlist */
                      /* todo: make the playlist works
                      if(YTPlayer.playlistID){
                        var playListIDs = YTPlayer.player.getPlaylist();

                        if(playListIDs && playListIDs.length) {
                          YTPlayer.isList = true;
                          playListIDs = playListIDs.reverse();

                          for (var i = 0; i < playListIDs.length; i++ ) {
                            var videoObj = jQuery.extend(true, {}, YTPlayer.opt);
                            videoObj.videoURL = playListIDs[i];
                            YTPlayer.videos.push(videoObj);
                          }
                        }
                      }
                    */
                      break;

                    default:
                      break;
                  }

                  /* Trigger state events */
                  const YTPEvent = jQuery.Event(eventType);
                  YTPEvent.time = YTPlayer.currentTime;

                  if (!YTPlayer.preventTrigger)
                    jQuery(YTPlayer).trigger(YTPEvent);
                },
                /**
                 * onPlaybackQualityChange
                 * @param e
                 */
                'onPlaybackQualityChange': function ({target}) {
                  const quality = target.getPlaybackQuality();
                  const YTPQualityChange = jQuery.Event("YTPQualityChange");
                  YTPQualityChange.quality = quality;
                  jQuery(YTPlayer).trigger(YTPQualityChange);
                },
                /**
                 * onError
                 * @param err
                 *
                 2 – The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
                 5 – The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
                 100 – The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.
                 101 – The owner of the requested video does not allow it to be played in embedded players.
                 150 – This error is the same as 101. It's just a 101 error in disguise!
                 */
                'onError': function (err) {

                  if (typeof YTPlayer.opt.onError == "function")
                    YTPlayer.opt.onError($YTPlayer, err);

                  switch (err.data) {
                    case 2:
                      console.error(`video ID:: ${YTPlayer.videoID}: The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.`);
                      break;
                    case 5:
                      console.error(`video ID:: ${YTPlayer.videoID}: The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.`);
                      break;
                    case 100:
                      console.error(`video ID:: ${YTPlayer.videoID}: The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.`);
                      break;
                    case 101:
                    case 150:
                      console.error(`video ID:: ${YTPlayer.videoID}: The owner of the requested video does not allow it to be played in embedded players.`);
                      break;
                  }

                  if (YTPlayer.isList)
                    jQuery(YTPlayer).YTPPlayNext();

                }
              }
            });

            $YTPlayer.on(`YTPlayerIsReady_${YTPlayer.id}`, function () {

              if (YTPlayer.isReady)
                return this;

              YTPlayer.playerEl = YTPlayer.player.getIframe();
              jQuery(YTPlayer.playerEl).unselectable();
              $YTPlayer.optimizeDisplay();

              /**
               * Optimize display on resize
               */
              jQuery(window).off(`resize.YTP_${YTPlayer.id}`).on(`resize.YTP_${YTPlayer.id}`, () => {
                $YTPlayer.optimizeDisplay();
              });

              /**
               * Set the time of the last visit progress
               */
              if (YTPlayer.opt.remember_last_time) {
                jQuery(window).on(`unload.YTP_${YTPlayer.id}`, () => {
                  const current_time = YTPlayer.player.getCurrentTime();
                  jQuery.mbCookie.set(`YTPlayer_start_from${YTPlayer.videoID}`, current_time, 0);
                });
              }

              $YTPlayer.YTPCheckForState();

            });
          });
        });

        $YTPlayer.off("YTPTime.mask");
        jQuery.mbYTPlayer.applyMask(YTPlayer);

        // console.timeEnd( "YTPlayerInit" );
      });
    },

    /**
     * isOnScreen
     * Check if the YTPlayer is on screen
     * @param YTPlayer
     * @returns {boolean}
     */
    isOnScreen({wrapper}) {

      const playerBox = wrapper;
      const winTop = jQuery(window).scrollTop();
      const winBottom = winTop + jQuery(window).height();
      const elTop = playerBox.offset().top + (playerBox.height() / 1.2);
      const elBottom = playerBox.offset().top + (playerBox.height() / 2.8);

      /*
            console.debug("-----------------------------", YTPlayer.id);
            console.debug("EL:: bottom:: ", elBottom, "top:: ",  elTop);
            console.debug("WIN:: bottom:: ", winBottom, "top:: ", winTop);
      */

      return ((elBottom <= winBottom) && (elTop >= winTop));

    },

    /**
     * getDataFromAPI
     * @param YTPlayer
     */
    getDataFromAPI(YTPlayer) {

      //console.debug("getDataFromAPI", YTPlayer.id, YTPlayer.videoID)

      YTPlayer.videoData = jQuery.mbStorage.get(`YTPlayer_data_${YTPlayer.videoID}`);
      jQuery(YTPlayer).off("YTPData.YTPlayer").on("YTPData.YTPlayer", () => {
        if (YTPlayer.hasData) {

          if (YTPlayer.isPlayer && !YTPlayer.opt.autoPlay) {
            const bgndURL = YTPlayer.opt.coverImage != "false" ? YTPlayer.opt.coverImage : (YTPlayer.videoData.thumb_max || YTPlayer.videoData.thumb_high || YTPlayer.videoData.thumb_medium);

            YTPlayer.opt.containment.css({
              background: `rgba(0,0,0,0.5) url(${bgndURL}) center center`,
              backgroundSize: "cover"
            });

          }
        }
      });

      if (YTPlayer.videoData) {

        setTimeout(() => {
          YTPlayer.opt.ratio = YTPlayer.opt.ratio == "auto" ? 16 / 9 : YTPlayer.opt.ratio;
          YTPlayer.dataReceived = true;

          const YTPChanged = jQuery.Event("YTPChanged");
          YTPChanged.time = YTPlayer.currentTime;
          YTPChanged.videoId = YTPlayer.videoID;
          YTPChanged.opt = YTPlayer.opt;
          jQuery(YTPlayer).trigger(YTPChanged);

          const YTPData = jQuery.Event("YTPData");
          YTPData.prop = {};
          for (const x in YTPlayer.videoData)
            YTPData.prop[x] = YTPlayer.videoData[x];
          jQuery(YTPlayer).trigger(YTPData);

        }, YTPlayer.opt.fadeOnStartTime);

        YTPlayer.hasData = true;
      } else if (jQuery.mbYTPlayer.apiKey) {

        /**
         * Get video info from API3 (needs api key)
         * snippet,player,contentDetails,statistics,status
         */
        jQuery.getJSON(`${jQuery.mbYTPlayer.locationProtocol}//www.googleapis.com/youtube/v3/videos?id=${YTPlayer.videoID}&key=${jQuery.mbYTPlayer.apiKey}&part=snippet`, ({items}) => {
          YTPlayer.dataReceived = true;

          const YTPChanged = jQuery.Event("YTPChanged");
          YTPChanged.time = YTPlayer.currentTime;
          YTPChanged.videoId = YTPlayer.videoID;
          jQuery(YTPlayer).trigger(YTPChanged);

          function parseYTPlayer_data({channelTitle, title, description, thumbnails}) {
            YTPlayer.videoData = {};
            YTPlayer.videoData.id = YTPlayer.videoID;
            YTPlayer.videoData.channelTitle = channelTitle;
            YTPlayer.videoData.title = title;
            YTPlayer.videoData.description = description.length < 400 ? description : `${description.substring(0, 400)} ...`;
            YTPlayer.videoData.aspectratio = YTPlayer.opt.ratio == "auto" ? 16 / 9 : YTPlayer.opt.ratio;
            YTPlayer.opt.ratio = YTPlayer.videoData.aspectratio;
            YTPlayer.videoData.thumb_max = thumbnails.maxres ? thumbnails.maxres.url : null;
            YTPlayer.videoData.thumb_high = thumbnails.high ? thumbnails.high.url : null;
            YTPlayer.videoData.thumb_medium = thumbnails.medium ? thumbnails.medium.url : null;
            jQuery.mbStorage.set(`YTPlayer_data_${YTPlayer.videoID}`, YTPlayer.videoData);
          }

          if (!items[0]) {
            YTPlayer.videoData = {};
            YTPlayer.hasData = false;

          } else {

            parseYTPlayer_data(items[0].snippet);
            YTPlayer.hasData = true;
          }

          const YTPData = jQuery.Event("YTPData");
          YTPData.prop = {};
          for (const x in YTPlayer.videoData) YTPData.prop[x] = YTPlayer.videoData[x];
          jQuery(YTPlayer).trigger(YTPData);
        });

      } else {

        setTimeout(() => {
          const YTPChanged = jQuery.Event("YTPChanged");
          YTPChanged.time = YTPlayer.currentTime;
          YTPChanged.videoId = YTPlayer.videoID;
          jQuery(YTPlayer).trigger(YTPChanged);
        }, 50);

        if (!YTPlayer.opt.autoPlay) {
          // if (YTPlayer.isPlayer && !YTPlayer.opt.autoPlay) {
          const bgndURL = YTPlayer.opt.coverImage != "false" ? YTPlayer.opt.coverImage : `${jQuery.mbYTPlayer.locationProtocol}//i.ytimg.com/vi/${YTPlayer.videoID}/maxresdefault.jpg`;

          if (bgndURL)
            YTPlayer.opt.containment.css({
              background: `rgba(0,0,0,0.5) url(${bgndURL}) center center`,
              backgroundSize: "cover"
            });
        }

        YTPlayer.videoData = null;
        YTPlayer.opt.ratio = YTPlayer.opt.ratio == "auto" ? "16/9" : YTPlayer.opt.ratio;

      }

      if (YTPlayer.isPlayer && !YTPlayer.opt.autoPlay) { //&& ( !jQuery.mbBrowser.mobile && !jQuery.isTablet )
        YTPlayer.loading = jQuery("<div/>").addClass("loading").html("Loading").hide();
        jQuery(YTPlayer).append(YTPlayer.loading);
        YTPlayer.loading.fadeIn();
      }
    },

    /**
     * removeStoredData
     */
    removeStoredData() {
      jQuery.mbStorage.remove();
    },

    /**
     * getVideoData
     * @returns {*|YTPlayer.videoData}
     */
    getVideoData() {
      const YTPlayer = this.get(0);
      return YTPlayer.videoData;
    },

    /**
     * getVideoID
     * @returns {*|YTPlayer.videoID|boolean}
     */
    getVideoID() {
      const YTPlayer = this.get(0);
      return YTPlayer.videoID || false;
    },

    /**
     * getPlaylistID
     * @returns {*|YTPlayer.videoID|boolean}
     */
    getPlaylistID() {
      const YTPlayer = this.get(0);
      return YTPlayer.playlistID || false;
    },
    /**
     * setVideoQuality
     * @param quality
     * @returns {jQuery.mbYTPlayer}
     */
    setVideoQuality(quality) {
      const YTPlayer = this.get(0);
      YTPlayer.player.setPlaybackQuality(quality);
      return this;
    },

    /**
     * playlist
     * @param videos -> Array or String (videoList ID)
     * @param shuffle
     * @param callback
     * @returns {jQuery.mbYTPlayer}
     *
     * To retrieve a Youtube playlist the Youtube API key is required:
     * https://console.developers.google.com/
     * jQuery.mbYTPlayer.apiKey
     */
    playlist(videos, shuffle, callback) {

      const $YTPlayer = this;
      const YTPlayer = $YTPlayer.get(0);

      //get the video list from the Youtube playlist passing the ID
      if (typeof videos == "String" && jQuery.mbYTPlayer.apiKey != "") {

        /**
         * @param playListID
         * @param page
         */
        function getVideoListFromYoutube(playListID, page = '') {
          const youtubeAPI = "https://www.googleapis.com/youtube/v3/playlistItems";
          jQuery.getJSON(youtubeAPI, {
            part: "snippet,contentDetails",
            playlistId: playListID, //You have to enter the PlaylistID
            maxResults: 50,
            pageToken: page,
            key: jQuery.mbYTPlayer.apiKey //You have to enter your own YoutubeAPIKey
          }).done(response => {
            CreateVideosArray(response);
            if (response.nextPageToken) {
              page = response.nextPageToken;
              getVideoListFromYoutube(plID, page, videos);
            } else {
              $YTPlayer.YTPlaylist(YTPlayer.videos, shuffle, callback)
            }
            ;
          });
        };

        /**
         * @param response
         * @constructor
         */
        function CreateVideosArray({items}) {
          const k = items.length;
          for (let i = 0; i < k; i++) {
            YTPlayer.videos.push({
              "videoURL": items[i].contentDetails.videoId
            });
          }
          ;
        };

        getVideoListFromYoutube(videos);
        return this;

      }

      YTPlayer.isList = true;

      if (shuffle)
        videos = jQuery.shuffle(videos);

      if (!YTPlayer.videoID) {
        YTPlayer.videos = videos;
        YTPlayer.videoCounter = 1;
        YTPlayer.videoLength = videos.length;
        jQuery(YTPlayer).data("property", videos[0]);
        jQuery(YTPlayer).YTPlayer();
      }

      if (typeof callback == "function")
        jQuery(YTPlayer).one("YTPChanged", () => {
          callback(YTPlayer);
        });

      jQuery(YTPlayer).on("YTPEnd", () => {
        jQuery(YTPlayer).YTPPlayNext();
      });
      return this;
    },

    /**
     * playNext
     * @returns {jQuery.mbYTPlayer}
     */
    playNext() {
      const YTPlayer = this.get(0);
      YTPlayer.videoCounter++;
      if (YTPlayer.videoCounter > YTPlayer.videoLength)
        YTPlayer.videoCounter = 1;
      jQuery(YTPlayer).YTPPlayIndex(YTPlayer.videoCounter);
      return this;
    },

    /**
     * playPrev
     * @returns {jQuery.mbYTPlayer}
     */
    playPrev() {
      const YTPlayer = this.get(0);
      YTPlayer.videoCounter--;
      if (YTPlayer.videoCounter <= 0)
        YTPlayer.videoCounter = YTPlayer.videoLength;
      jQuery(YTPlayer).YTPPlayIndex(YTPlayer.videoCounter);
      return this;
    },

    /**
     *
     * @param idx
     * @returns {jQuery.mbYTPlayer}
     */
    playIndex(idx) {
      const YTPlayer = this.get(0);
      if (YTPlayer.checkForStartAt) {
        clearInterval(YTPlayer.checkForStartAt);
        clearInterval(YTPlayer.getState);
      }
      YTPlayer.videoCounter = idx;

      if (YTPlayer.videoCounter >= YTPlayer.videoLength)
        YTPlayer.videoCounter = YTPlayer.videoLength;

      const video = YTPlayer.videos[YTPlayer.videoCounter - 1];
      jQuery(YTPlayer).YTPChangeVideo(video);
      return this;
    },

    /**
     *
     * @param opt
     * @returns {jQuery.mbYTPlayer}
     */
    changeVideo(opt) {
      const $YTPlayer = this;
      const YTPlayer = $YTPlayer.get(0);

      YTPlayer.opt.startAt = 0;
      YTPlayer.opt.stopAt = 0;
      YTPlayer.opt.mask = false;
      YTPlayer.opt.mute = true;
      YTPlayer.opt.autoPlay = true;
      YTPlayer.opt.addFilters = false;
      YTPlayer.opt.coverImage = false;

      YTPlayer.hasData = false;
      YTPlayer.hasChanged = true;

      YTPlayer.player.loopTime = undefined;

      if (opt)
        jQuery.extend(YTPlayer.opt, opt);

      YTPlayer.videoID = getYTPVideoID(YTPlayer.opt.videoURL).videoID;

      if (YTPlayer.opt.loop && typeof YTPlayer.opt.loop == "boolean")
        YTPlayer.opt.loop = 9999;

      YTPlayer.wrapper.css({
        background: "none"
      });

      jQuery(YTPlayer.playerEl).CSSAnimate({
        opacity: 0
      }, YTPlayer.opt.fadeOnStartTime, () => {

        jQuery.mbYTPlayer.getDataFromAPI(YTPlayer);

        $YTPlayer.YTPGetPlayer().loadVideoById({
          videoId: YTPlayer.videoID,
          // startSeconds: YTPlayer.opt.startAt,
          // endSeconds: YTPlayer.opt.stopAt,
          suggestedQuality: YTPlayer.opt.quality
        });
        $YTPlayer.YTPPause();
        $YTPlayer.optimizeDisplay();

        $YTPlayer.YTPCheckForState();
      });

      const YTPChangeVideo = jQuery.Event("YTPChangeVideo");
      YTPChangeVideo.time = YTPlayer.currentTime;
      jQuery(YTPlayer).trigger(YTPChangeVideo);

      jQuery.mbYTPlayer.applyMask(YTPlayer);

      return this;
    },

    /**
     * getPlayer
     * @returns {player}
     */
    getPlayer() {
      return jQuery(this).get(0).player;
    },

    /**
     * playerDestroy
     * @returns {jQuery.mbYTPlayer}
     */
    playerDestroy() {
      const YTPlayer = this.get(0);
      ytp.YTAPIReady = true;
      ytp.backgroundIsInited = false;
      YTPlayer.isInit = false;
      YTPlayer.videoID = null;
      YTPlayer.isReady = false;
      YTPlayer.wrapper.remove();
      jQuery(`#controlBar_${YTPlayer.id}`).remove();
      clearInterval(YTPlayer.checkForStartAt);
      clearInterval(YTPlayer.getState);
      return this;
    },

    /**
     * fullscreen
     * @param real
     * @returns {jQuery.mbYTPlayer}
     */
    fullscreen(real) {
      const YTPlayer = this.get(0);
      if (typeof real == "undefined") real = YTPlayer.opt.realfullscreen;
      real = eval(real);
      const controls = jQuery(`#controlBar_${YTPlayer.id}`);
      const fullScreenBtn = controls.find(".mb_OnlyYT");
      const videoWrapper = YTPlayer.isPlayer ? YTPlayer.opt.containment : YTPlayer.wrapper;

      if (real) {
        const fullscreenchange = jQuery.mbBrowser.mozilla ? "mozfullscreenchange" : jQuery.mbBrowser.webkit ? "webkitfullscreenchange" : "fullscreenchange";
        jQuery(document).off(fullscreenchange).on(fullscreenchange, () => {
          const isFullScreen = RunPrefixMethod(document, "IsFullScreen") || RunPrefixMethod(document, "FullScreen");
          if (!isFullScreen) {
            YTPlayer.isAlone = false;
            fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT);
            jQuery(YTPlayer).YTPSetVideoQuality(YTPlayer.opt.quality);
            videoWrapper.removeClass("YTPFullscreen");

            videoWrapper.CSSAnimate({
              opacity: YTPlayer.opt.opacity
            }, YTPlayer.opt.fadeOnStartTime);

            videoWrapper.css({
              zIndex: 0
            });

            if (YTPlayer.isBackground) {
              jQuery("body").after(controls);
            } else {
              YTPlayer.wrapper.before(controls);
            }
            jQuery(window).resize();
            jQuery(YTPlayer).trigger("YTPFullScreenEnd");
          } else {
            jQuery(YTPlayer).YTPSetVideoQuality("default");
            jQuery(YTPlayer).trigger("YTPFullScreenStart");
          }
        });
      }
      if (!YTPlayer.isAlone) {
        function hideMouse() {
          YTPlayer.overlay.css({
            cursor: "none"
          });
        }

        jQuery(document).on("mousemove.YTPlayer", ({target}) => {
          YTPlayer.overlay.css({
            cursor: "auto"
          });
          clearTimeout(YTPlayer.hideCursor);
          if (!jQuery(target).parents().is(".mb_YTPBar")) YTPlayer.hideCursor = setTimeout(hideMouse, 3000);
        });

        hideMouse();

        if (real) {
          videoWrapper.css({
            opacity: 0
          });
          videoWrapper.addClass("YTPFullscreen");
          launchFullscreen(videoWrapper.get(0));

          setTimeout(() => {
            videoWrapper.CSSAnimate({
              opacity: 1
            }, YTPlayer.opt.fadeOnStartTime * 2);

            videoWrapper.append(controls);
            jQuery(YTPlayer).optimizeDisplay();
            YTPlayer.player.seekTo(YTPlayer.player.getCurrentTime() + .1, true);

          }, YTPlayer.opt.fadeOnStartTime)
        } else
          videoWrapper.css({
            zIndex: 10000
          }).CSSAnimate({
            opacity: 1
          }, YTPlayer.opt.fadeOnStartTime * 2);
        fullScreenBtn.html(jQuery.mbYTPlayer.controls.showSite);
        YTPlayer.isAlone = true;
      } else {
        jQuery(document).off("mousemove.YTPlayer");
        clearTimeout(YTPlayer.hideCursor);
        YTPlayer.overlay.css({
          cursor: "auto"
        });
        if (real) {
          cancelFullscreen();
        } else {
          videoWrapper.CSSAnimate({
            opacity: YTPlayer.opt.opacity
          }, YTPlayer.opt.fadeOnStartTime);
          videoWrapper.css({
            zIndex: 0
          });
        }
        fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT);
        YTPlayer.isAlone = false;
      }

      function RunPrefixMethod(obj, method) {
        let pfx = ["webkit", "moz", "ms", "o", ""];
        let p = 0;
        let m;
        let t;
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

      return this;
    },

    /**
     * toggleLoops
     * @returns {jQuery.mbYTPlayer}
     */
    toggleLoops() {
      const YTPlayer = this.get(0);
      const data = YTPlayer.opt;
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
      return this;
    },

    /**
     * play
     * @returns {jQuery.mbYTPlayer}
     */
    play() {
      const YTPlayer = this.get(0);

      if (!YTPlayer.isReady)
        return this;

      YTPlayer.player.playVideo();

      jQuery(YTPlayer.playerEl).css({
        opacity: 1
      });

      YTPlayer.wrapper.css({
        backgroundImage: "none"
      });

      YTPlayer.wrapper.CSSAnimate({
        opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
      }, YTPlayer.opt.fadeOnStartTime);

      const controls = jQuery(`#controlBar_${YTPlayer.id}`);
      const playBtn = controls.find(".mb_YTPPlaypause");
      playBtn.html(jQuery.mbYTPlayer.controls.pause);
      YTPlayer.state = 1;
      YTPlayer.orig_background = jQuery(YTPlayer).css("background-image");

      return this;
    },

    /**
     * togglePlay
     * @param callback
     * @returns {jQuery.mbYTPlayer}
     */
    togglePlay(callback) {
      const YTPlayer = this.get(0);
      if (YTPlayer.state == 1)
        this.YTPPause();
      else
        this.YTPPlay();

      if (typeof callback == "function")
        callback(YTPlayer.state);

      return this;
    },

    /**
     * stop
     * @returns {jQuery.mbYTPlayer}
     */
    stop() {
      const YTPlayer = this.get(0);
      const controls = jQuery(`#controlBar_${YTPlayer.id}`);
      const playBtn = controls.find(".mb_YTPPlaypause");
      playBtn.html(jQuery.mbYTPlayer.controls.play);
      YTPlayer.player.stopVideo();
      return this;
    },

    /**
     * pause
     * @returns {jQuery.mbYTPlayer}
     */
    pause() {
      const YTPlayer = this.get(0);
      YTPlayer.player.pauseVideo();
      YTPlayer.state = 2;
      return this;
    },

    /**
     * seekTo
     * @param sec
     * @returns {jQuery.mbYTPlayer}
     */
    seekTo(sec) {
      const YTPlayer = this.get(0);
      YTPlayer.player.seekTo(sec, true);
      return this;
    },

    /**
     * setVolume
     * @param val
     * @returns {jQuery.mbYTPlayer}
     */
    setVolume(val) {
      const YTPlayer = this.get(0);

      if (!val && !YTPlayer.opt.vol && YTPlayer.player.getVolume() == 0)
        jQuery(YTPlayer).YTPUnmute();
      else if ((!val && YTPlayer.player.getVolume() > 0) || (val && YTPlayer.opt.vol == val)) {
        if (!YTPlayer.isMute)
          jQuery(YTPlayer).YTPMute();
        else
          jQuery(YTPlayer).YTPUnmute();
      } else {
        YTPlayer.opt.vol = val;
        YTPlayer.player.setVolume(YTPlayer.opt.vol);
        if (YTPlayer.volumeBar && YTPlayer.volumeBar.length) YTPlayer.volumeBar.updateSliderVal(val)
      }
      return this;
    },
    /**
     * Get volume
     */
    getVolume() {
      const YTPlayer = this.get(0);
      return YTPlayer.player.getVolume();
    },

    /**
     * toggleVolume
     * @returns {jQuery.mbYTPlayer}
     */
    toggleVolume() {
      const YTPlayer = this.get(0);
      if (!YTPlayer) return this;
      if (YTPlayer.player.isMuted()) {
        jQuery(YTPlayer).YTPUnmute();
      } else {
        jQuery(YTPlayer).YTPMute();
      }
      return this;
    },

    /**
     * mute
     * @returns {jQuery.mbYTPlayer}
     */
    mute() {
      const YTPlayer = this.get(0);
      if (YTPlayer.isMute)
        return this;
      YTPlayer.player.mute();
      YTPlayer.isMute = true;
      YTPlayer.player.setVolume(0);
      if (YTPlayer.volumeBar && YTPlayer.volumeBar.length && YTPlayer.volumeBar.width() > 10) {
        YTPlayer.volumeBar.updateSliderVal(0);
      }
      const controls = jQuery(`#controlBar_${YTPlayer.id}`);
      const muteBtn = controls.find(".mb_YTPMuteUnmute");
      muteBtn.html(jQuery.mbYTPlayer.controls.unmute);
      jQuery(YTPlayer).addClass("isMuted");
      if (YTPlayer.volumeBar && YTPlayer.volumeBar.length) YTPlayer.volumeBar.addClass("muted");
      const YTPEvent = jQuery.Event("YTPMuted");
      YTPEvent.time = YTPlayer.currentTime;

      if (!YTPlayer.preventTrigger)
        jQuery(YTPlayer).trigger(YTPEvent);

      return this;
    },

    /**
     * unmute
     * @returns {jQuery.mbYTPlayer}
     */
    unmute() {
      const YTPlayer = this.get(0);
      if (!YTPlayer.isMute)
        return this;
      YTPlayer.player.unMute();
      YTPlayer.isMute = false;
      YTPlayer.player.setVolume(YTPlayer.opt.vol);
      if (YTPlayer.volumeBar && YTPlayer.volumeBar.length) YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol > 10 ? YTPlayer.opt.vol : 10);
      const controls = jQuery(`#controlBar_${YTPlayer.id}`);
      const muteBtn = controls.find(".mb_YTPMuteUnmute");
      muteBtn.html(jQuery.mbYTPlayer.controls.mute);
      jQuery(YTPlayer).removeClass("isMuted");
      if (YTPlayer.volumeBar && YTPlayer.volumeBar.length) YTPlayer.volumeBar.removeClass("muted");
      const YTPEvent = jQuery.Event("YTPUnmuted");
      YTPEvent.time = YTPlayer.currentTime;

      if (!YTPlayer.preventTrigger)
        jQuery(YTPlayer).trigger(YTPEvent);

      return this;
    },

    /* FILTERS ---------------------------------------------------------------------------------------------------------*/

    /**
     * applyFilter
     * @param filter
     * @param value
     * @returns {jQuery.mbYTPlayer}
     */
    applyFilter(filter, value) {
      const $YTPlayer = this;
      const YTPlayer = $YTPlayer.get(0);
      YTPlayer.filters[filter].value = value;
      if (YTPlayer.filtersEnabled)
        $YTPlayer.YTPEnableFilters();
    },

    /**
     * applyFilters
     * @param filters
     * @returns {jQuery.mbYTPlayer}
     */
    applyFilters(filters) {
      const $YTPlayer = this;
      const YTPlayer = $YTPlayer.get(0);

      if (!YTPlayer.isReady) {
        jQuery(YTPlayer).on("YTPReady", () => {
          $YTPlayer.YTPApplyFilters(filters);
        });
        return this;
      }

      for (const key in filters) {
        $YTPlayer.YTPApplyFilter(key, filters[key]);
      }

      $YTPlayer.trigger("YTPFiltersApplied");
    },

    /**
     * toggleFilter
     * @param filter
     * @param value
     * @returns {jQuery.mbYTPlayer}
     */
    toggleFilter(filter, value) {
      const $YTPlayer = this;
      const YTPlayer = $YTPlayer.get(0);

      if (!YTPlayer.filters[filter].value)
        YTPlayer.filters[filter].value = value;
      else
        YTPlayer.filters[filter].value = 0;

      if (YTPlayer.filtersEnabled)
        jQuery(YTPlayer).YTPEnableFilters();

      return this;
    },

    /**
     * toggleFilters
     * @param callback
     * @returns {jQuery.mbYTPlayer}
     */
    toggleFilters(callback) {
      const $YTPlayer = this;
      const YTPlayer = $YTPlayer.get(0);
      if (YTPlayer.filtersEnabled) {
        jQuery(YTPlayer).trigger("YTPDisableFilters");
        jQuery(YTPlayer).YTPDisableFilters();
      } else {
        jQuery(YTPlayer).YTPEnableFilters();
        jQuery(YTPlayer).trigger("YTPEnableFilters");
      }
      if (typeof callback == "function")
        callback(YTPlayer.filtersEnabled);

      return this;
    },

    /**
     * disableFilters
     * @returns {jQuery.mbYTPlayer}
     */
    disableFilters() {
      const $YTPlayer = this;
      const YTPlayer = $YTPlayer.get(0);
      const iframe = jQuery(YTPlayer.playerEl);
      iframe.css("-webkit-filter", "");
      iframe.css("filter", "");
      YTPlayer.filtersEnabled = false;

      return this;
    },

    /**
     * enableFilters
     * @returns {jQuery.mbYTPlayer}
     */
    enableFilters() {
      const $YTPlayer = this;
      const YTPlayer = $YTPlayer.get(0);

      const iframe = jQuery(YTPlayer.playerEl);
      let filterStyle = "";
      for (const key in YTPlayer.filters) {
        if (YTPlayer.filters[key].value)
          filterStyle += `${key.replace("_", "-")}(${YTPlayer.filters[key].value}${YTPlayer.filters[key].unit}) `;
      }
      iframe.css("-webkit-filter", filterStyle);
      iframe.css("filter", filterStyle);
      YTPlayer.filtersEnabled = true;

      return this;
    },

    /**
     * removeFilter
     * @param filter
     * @param callback
     * @returns {jQuery.mbYTPlayer}
     */
    removeFilter(filter, callback) {
      const $YTPlayer = this;
      const YTPlayer = $YTPlayer.get(0);

      if (typeof filter == "function") {
        callback = filter;
        filter = null;
      }

      if (!filter) {
        for (var key in YTPlayer.filters) {
          $YTPlayer.YTPApplyFilter(key, 0);
        }

        if (typeof callback == "function")
          callback(key);

        YTPlayer.filters = jQuery.extend(true, {}, jQuery.mbYTPlayer.defaultFilters);

      } else {
        $YTPlayer.YTPApplyFilter(filter, 0);
        if (typeof callback == "function") callback(filter);
      }

      const YTPEvent = jQuery.Event("YTPFiltersApplied");
      $YTPlayer.trigger(YTPEvent);

      return this;
    },

    /**
     * getFilters
     * @returns {filters}
     */
    getFilters() {
      const YTPlayer = this.get(0);
      return YTPlayer.filters;
    },

    /* MASK ---------------------------------------------------------------------------------------------------------*/

    /**
     * addMask
     * @param mask
     * @returns {jQuery.mbYTPlayer}
     */
    addMask(mask) {
      const YTPlayer = this.get(0);

      if (!mask)
        mask = YTPlayer.actualMask;

      const tempImg = jQuery("<img/>").attr("src", mask).on("load", () => {
        YTPlayer.overlay.CSSAnimate({
          opacity: 0
        }, YTPlayer.opt.fadeOnStartTime, () => {
          YTPlayer.hasMask = true;
          tempImg.remove();
          YTPlayer.overlay.css({
            backgroundImage: `url(${mask})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover"
          });
          YTPlayer.overlay.CSSAnimate({
            opacity: 1
          }, YTPlayer.opt.fadeOnStartTime);
        });
      });

      return this;
    },

    /**
     * removeMask
     * @returns {jQuery.mbYTPlayer}
     */
    removeMask() {
      const YTPlayer = this.get(0);
      YTPlayer.overlay.CSSAnimate({
        opacity: 0
      }, YTPlayer.opt.fadeOnStartTime, () => {
        YTPlayer.hasMask = false;
        YTPlayer.overlay.css({
          backgroundImage: "",
          backgroundRepeat: "",
          backgroundPosition: "",
          backgroundSize: ""
        });
        YTPlayer.overlay.CSSAnimate({
          opacity: 1
        }, YTPlayer.opt.fadeOnStartTime);
      });

      return this;
    },

    /**
     * Apply mask
     * @param YTPlayer
     */
    applyMask(YTPlayer) {
      const $YTPlayer = jQuery(YTPlayer);
      $YTPlayer.off("YTPTime.mask");

      if (YTPlayer.opt.mask) {
        if (typeof YTPlayer.opt.mask == "string") {
          $YTPlayer.YTPAddMask(YTPlayer.opt.mask);
          YTPlayer.actualMask = YTPlayer.opt.mask;
        } else if (typeof YTPlayer.opt.mask == "object") {

          let img = null;
          for (const time in YTPlayer.opt.mask) {
            if (YTPlayer.opt.mask[time])
              img = jQuery("<img/>").attr("src", YTPlayer.opt.mask[time]);
          }

          if (YTPlayer.opt.mask[0])
            $YTPlayer.YTPAddMask(YTPlayer.opt.mask[0]);

          $YTPlayer.on("YTPTime.mask", e => {
            for (const time in YTPlayer.opt.mask) {
              if (e.time == time)
                if (!YTPlayer.opt.mask[time]) {
                  $YTPlayer.YTPRemoveMask();
                } else {
                  $YTPlayer.YTPAddMask(YTPlayer.opt.mask[time]);
                  YTPlayer.actualMask = YTPlayer.opt.mask[time];
                }
            }
          });
        }
      }
    },

    /**
     * toggleMask
     * @returns {jQuery.mbYTPlayer}
     */
    toggleMask() {
      const YTPlayer = this.get(0);
      const $YTPlayer = jQuery(YTPlayer);
      if (YTPlayer.hasMask)
        $YTPlayer.YTPRemoveMask();
      else
        $YTPlayer.YTPAddMask();
      return this;
    },

    /** CONTROLS --------------------------------------------------------------------------------------------------------*/

    /**
     * manageProgress
     * @returns {{totalTime: number, currentTime: number}}
     */
    manageProgress() {
      const YTPlayer = this.get(0);
      const controls = jQuery(`#controlBar_${YTPlayer.id}`);
      const progressBar = controls.find(".mb_YTPProgress");
      const loadedBar = controls.find(".mb_YTPLoaded");
      const timeBar = controls.find(".mb_YTPseekbar");
      const totW = progressBar.outerWidth();
      const currentTime = Math.floor(YTPlayer.player.getCurrentTime());
      const totalTime = Math.floor(YTPlayer.player.getDuration());
      const timeW = (currentTime * totW) / totalTime;
      const startLeft = 0;
      const loadedW = YTPlayer.player.getVideoLoadedFraction() * 100;
      loadedBar.css({
        left: startLeft,
        width: `${loadedW}%`
      });
      timeBar.css({
        left: 0,
        width: timeW
      });
      return {
        totalTime,
        currentTime
      };
    },

    /**
     * buildControls
     * @param YTPlayer
     */
    buildControls(YTPlayer) {

      jQuery(`#controlBar_${YTPlayer.id}`).remove();
      if (!YTPlayer.opt.showControls) {
        YTPlayer.controlBar = false;
        return;
      }

      // @YTPlayer.opt.printUrl: is deprecated; use YTPlayer.opt.showYTLogo
      YTPlayer.opt.showYTLogo = YTPlayer.opt.showYTLogo || YTPlayer.opt.printUrl;
      if (jQuery(`#controlBar_${YTPlayer.id}`).length)
        return;
      YTPlayer.controlBar = jQuery("<span/>").attr("id", `controlBar_${YTPlayer.id}`).addClass("mb_YTPBar").css({
        whiteSpace: "noWrap",
        position: YTPlayer.isBackground ? "fixed" : "absolute",
        zIndex: YTPlayer.isBackground ? 10000 : 1000
      }).hide();
      const buttonBar = jQuery("<div/>").addClass("buttonBar");
      /* play/pause button*/
      const playpause = jQuery(`<span>${jQuery.mbYTPlayer.controls.play}</span>`).addClass("mb_YTPPlaypause ytpicon").click(() => {
        if (YTPlayer.player.getPlayerState() == 1) jQuery(YTPlayer).YTPPause();
        else jQuery(YTPlayer).YTPPlay();
      });
      /* mute/unmute button*/
      const MuteUnmute = jQuery(`<span>${jQuery.mbYTPlayer.controls.mute}</span>`).addClass("mb_YTPMuteUnmute ytpicon").click(() => {
        if (YTPlayer.player.getVolume() == 0) {
          jQuery(YTPlayer).YTPUnmute();
        } else {
          jQuery(YTPlayer).YTPMute();
        }
      });
      /* volume bar*/
      const volumeBar = jQuery("<div/>").addClass("mb_YTPVolumeBar").css({
        display: "inline-block"
      });
      YTPlayer.volumeBar = volumeBar;
      /* time elapsed */
      const idx = jQuery("<span/>").addClass("mb_YTPTime");
      let vURL = YTPlayer.opt.videoURL ? YTPlayer.opt.videoURL : "";
      if (!vURL.includes("http")) vURL = `${jQuery.mbYTPlayer.locationProtocol}//www.youtube.com/watch?v=${YTPlayer.opt.videoURL}`;
      const movieUrl = jQuery("<span/>").html(jQuery.mbYTPlayer.controls.ytLogo).addClass("mb_YTPUrl ytpicon").attr("title", "view on YouTube").on("click", () => {
        window.open(vURL, "viewOnYT")
      });
      const onlyVideo = jQuery("<span/>").html(jQuery.mbYTPlayer.controls.onlyYT).addClass("mb_OnlyYT ytpicon").on("click", () => {
        jQuery(YTPlayer).YTPFullscreen(YTPlayer.opt.realfullscreen);
      });
      const progressBar = jQuery("<div/>").addClass("mb_YTPProgress").css("position", "absolute").click(({clientX}) => {
        timeBar.css({
          width: (clientX - timeBar.offset().left)
        });
        YTPlayer.timeW = clientX - timeBar.offset().left;
        YTPlayer.controlBar.find(".mb_YTPLoaded").css({
          width: 0
        });
        const totalTime = Math.floor(YTPlayer.player.getDuration());
        YTPlayer.goto = (timeBar.outerWidth() * totalTime) / progressBar.outerWidth();
        YTPlayer.player.seekTo(parseFloat(YTPlayer.goto), true);
        YTPlayer.controlBar.find(".mb_YTPLoaded").css({
          width: 0
        });
      });
      const loadedBar = jQuery("<div/>").addClass("mb_YTPLoaded").css("position", "absolute");
      var timeBar = jQuery("<div/>").addClass("mb_YTPseekbar").css("position", "absolute");
      progressBar.append(loadedBar).append(timeBar);
      buttonBar.append(playpause).append(MuteUnmute).append(volumeBar).append(idx);
      if (YTPlayer.opt.showYTLogo) {
        buttonBar.append(movieUrl);
      }
      if (YTPlayer.isBackground || (eval(YTPlayer.opt.realfullscreen) && !YTPlayer.isBackground)) buttonBar.append(onlyVideo);
      YTPlayer.controlBar.append(buttonBar).append(progressBar);
      if (!YTPlayer.isBackground) {
        YTPlayer.controlBar.addClass("inlinePlayer");
        YTPlayer.wrapper.before(YTPlayer.controlBar);
      } else {
        jQuery("body").after(YTPlayer.controlBar);
      }
      volumeBar.simpleSlider({
        initialval: YTPlayer.opt.vol,
        scale: 100,
        orientation: "h",
        callback({value}) {
          if (value == 0) {
            jQuery(YTPlayer).YTPMute();
          } else {
            jQuery(YTPlayer).YTPUnmute();
          }
          YTPlayer.player.setVolume(value);
          if (!YTPlayer.isMute) YTPlayer.opt.vol = value;
        }
      });
    },

    /* MANAGE PLAYER STATE ------------------------------------------------------------------------------------------*/

    /**
     * checkForState
     */
    checkForState() {
      const YTPlayer = this.get(0);
      const $YTPlayer = jQuery(YTPlayer);

      clearInterval(YTPlayer.getState);
      const interval = 100;
      //Checking if player has been removed from scene
      if (!jQuery.contains(document, YTPlayer)) {
        $YTPlayer.YTPPlayerDestroy();
        clearInterval(YTPlayer.getState);
        clearInterval(YTPlayer.checkForStartAt);
        return;
      }

      jQuery.mbYTPlayer.checkForStart(YTPlayer);

      YTPlayer.getState = setInterval(() => {
        const $YTPlayer = jQuery(YTPlayer);

        if (!YTPlayer.isReady)
          return;

        const prog = jQuery(YTPlayer).YTPManageProgress();

        let stopAt = YTPlayer.opt.stopAt > YTPlayer.opt.startAt ? YTPlayer.opt.stopAt : 0;
        stopAt = stopAt < YTPlayer.player.getDuration() ? stopAt : 0;
        if (YTPlayer.currentTime != prog.currentTime) {
          const YTPEvent = jQuery.Event("YTPTime");
          YTPEvent.time = YTPlayer.currentTime;
          jQuery(YTPlayer).trigger(YTPEvent);
        }
        YTPlayer.currentTime = prog.currentTime;
        YTPlayer.totalTime = YTPlayer.player.getDuration();
        if (YTPlayer.player.getVolume() == 0) $YTPlayer.addClass("isMuted");
        else $YTPlayer.removeClass("isMuted");

        if (YTPlayer.opt.showControls)
          if (prog.totalTime) {
            YTPlayer.controlBar.find(".mb_YTPTime").html(`${jQuery.mbYTPlayer.formatTime(prog.currentTime)} / ${jQuery.mbYTPlayer.formatTime(prog.totalTime)}`);
          } else {
            YTPlayer.controlBar.find(".mb_YTPTime").html("-- : -- / -- : --");
          }

        if (eval(YTPlayer.opt.stopMovieOnBlur)) {
          if (!document.hasFocus()) {
            if (YTPlayer.state == 1) {
              YTPlayer.hasFocus = false;
              $YTPlayer.YTPPause();
            }
          } else if (document.hasFocus() && !YTPlayer.hasFocus && !(YTPlayer.state == -1 || YTPlayer.state == 0)) {
            YTPlayer.hasFocus = true;
            YTPlayer.player.playVideo();
          }
        }

        if (YTPlayer.opt.playOnlyIfVisible) {
          const isOnScreen = jQuery.mbYTPlayer.isOnScreen(YTPlayer);
          if (!isOnScreen && YTPlayer.state == 1) {
            YTPlayer.isOnScreen = false;
            $YTPlayer.YTPPause();
          } else if (isOnScreen && !YTPlayer.isOnScreen) {
            YTPlayer.isOnScreen = true;
            YTPlayer.player.playVideo();
          }
        }

        if (YTPlayer.controlBar.length && YTPlayer.controlBar.outerWidth() <= 400 && !YTPlayer.isCompact) {
          YTPlayer.controlBar.addClass("compact");
          YTPlayer.isCompact = true;
          if (!YTPlayer.isMute && YTPlayer.volumeBar) YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol);
        } else if (YTPlayer.controlBar.length && YTPlayer.controlBar.outerWidth() > 400 && YTPlayer.isCompact) {
          YTPlayer.controlBar.removeClass("compact");
          YTPlayer.isCompact = false;

          if (!YTPlayer.isMute && YTPlayer.volumeBar)
            YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol);
        }
        // the video is ended
        if (YTPlayer.player.getPlayerState() > 0 && ((parseFloat(YTPlayer.player.getDuration() - .5) < YTPlayer.player.getCurrentTime()) || (stopAt > 0 && parseFloat(YTPlayer.player.getCurrentTime()) > stopAt))) {

          if (YTPlayer.isEnded)
            return;

          YTPlayer.isEnded = true;
          setTimeout(() => {
            YTPlayer.isEnded = false
          }, 1000);

          if (YTPlayer.isList) {
            if (!YTPlayer.opt.loop || (YTPlayer.opt.loop > 0 && YTPlayer.player.loopTime === YTPlayer.opt.loop - 1)) {
              YTPlayer.player.loopTime = undefined;
              clearInterval(YTPlayer.getState);
              const YTPEnd = jQuery.Event("YTPEnd");
              YTPEnd.time = YTPlayer.currentTime;
              jQuery(YTPlayer).trigger(YTPEnd);
              //YTPlayer.state = 0;
              return;
            }
          } else if (!YTPlayer.opt.loop || (YTPlayer.opt.loop > 0 && YTPlayer.player.loopTime === YTPlayer.opt.loop - 1)) {
            YTPlayer.player.loopTime = undefined;
            YTPlayer.preventTrigger = true;
            YTPlayer.state = 2;
            jQuery(YTPlayer).YTPPause();
            YTPlayer.wrapper.CSSAnimate({
              opacity: 0
            }, YTPlayer.opt.fadeOnStartTime, () => {
              if (YTPlayer.controlBar.length)
                YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
              const YTPEnd = jQuery.Event("YTPEnd");
              YTPEnd.time = YTPlayer.currentTime;
              jQuery(YTPlayer).trigger(YTPEnd);
              YTPlayer.player.seekTo(YTPlayer.opt.startAt, true);

              if (!YTPlayer.isBackground) {
                if (YTPlayer.opt.coverImage && YTPlayer.isPlayer) {
                  YTPlayer.opt.coverImage = YTPlayer.opt.coverImage || YTPlayer.orig_background;
                  YTPlayer.opt.containment.css({
                    background: `url(${YTPlayer.opt.coverImage}) center center`,
                    backgroundSize: "cover"
                  });
                }
              } else if (YTPlayer.orig_background) {
                jQuery(YTPlayer).css("background-image", YTPlayer.orig_background);
              }
            });
            return;
          }

          YTPlayer.player.loopTime = YTPlayer.player.loopTime ? ++YTPlayer.player.loopTime : 1;

          //console.debug("loop", YTPlayer.opt.loop, YTPlayer.player.loopTime);

          YTPlayer.opt.startAt = YTPlayer.opt.startAt || 1;

          YTPlayer.preventTrigger = true;
          YTPlayer.state = 2;
          //jQuery( YTPlayer ).YTPPause();
          YTPlayer.player.pauseVideo()
          YTPlayer.player.seekTo(YTPlayer.opt.startAt, true);

          YTPlayer.player.playVideo();
        }
      }, interval);
    },

    /**
     * checkForStart
     * @param YTPlayer
     */
    checkForStart(YTPlayer) {
      const $YTPlayer = jQuery(YTPlayer);

      /* If the player has been removed from scene destroy it */
      if (!jQuery.contains(document, YTPlayer)) {
        $YTPlayer.YTPPlayerDestroy();
        return;
      }

      /* CREATE CONTROL BAR */
      jQuery.mbYTPlayer.buildControls(YTPlayer);

      if (YTPlayer.overlay)
        if (YTPlayer.opt.addRaster) {
          const classN = YTPlayer.opt.addRaster == "dot" ? "raster-dot" : "raster";
          YTPlayer.overlay.addClass(YTPlayer.isRetina ? `${classN} retina` : classN);
        } else {
          YTPlayer.overlay.removeClass((index, classNames) => {
            // change the list into an array
            const current_classes = classNames.split(" ");

            const // array of classes which are to be removed
                classes_to_remove = [];

            jQuery.each(current_classes, (index, class_name) => {
              // if the classname begins with bg add it to the classes_to_remove array
              if (/raster.*/.test(class_name)) {
                classes_to_remove.push(class_name);
              }
            });
            classes_to_remove.push("retina");
            // turn the array back into a string
            return classes_to_remove.join(" ");
          })
        }

      YTPlayer.preventTrigger = true;
      YTPlayer.state = 2;
      $YTPlayer.YTPPause();
      $YTPlayer.YTPMute();

      const startAt = YTPlayer.start_from_last ? YTPlayer.start_from_last : YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;
      YTPlayer.player.playVideo();
      $YTPlayer.YTPMute();

      //if (YTPlayer.start_from_last)
      YTPlayer.player.seekTo(startAt, true);

      YTPlayer.checkForStartAt = setInterval(() => {
        const canPlayVideo = YTPlayer.player.getVideoLoadedFraction() >= startAt / YTPlayer.player.getDuration();

        if (YTPlayer.player.getDuration() > 0 && YTPlayer.player.getCurrentTime() >= startAt && canPlayVideo) {
          YTPlayer.start_from_last = null;

          clearInterval(YTPlayer.checkForStartAt);
          if (typeof YTPlayer.opt.onReady == "function")
            YTPlayer.opt.onReady(YTPlayer);

          YTPlayer.isReady = true;

          $YTPlayer.YTPRemoveFilter();

          if (YTPlayer.opt.addFilters) {
            $YTPlayer.YTPApplyFilters(YTPlayer.opt.addFilters);
          } else {
            $YTPlayer.YTPApplyFilters({});
          }
          $YTPlayer.YTPEnableFilters();

          const YTPready = jQuery.Event("YTPReady");
          YTPready.time = YTPlayer.currentTime;
          jQuery(YTPlayer).trigger(YTPready);

          YTPlayer.preventTrigger = true;
          YTPlayer.state = 2;

          jQuery(YTPlayer).YTPPause();

          if (!YTPlayer.opt.mute)
            jQuery(YTPlayer).YTPUnmute();

          YTPlayer.preventTrigger = false;

          if (typeof _gaq != "undefined" && eval(YTPlayer.opt.gaTrack))
            _gaq.push(['_trackEvent', 'YTPlayer', 'Play', (YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString())]);
          else if (typeof ga != "undefined" && eval(YTPlayer.opt.gaTrack))
            ga('send', 'event', 'YTPlayer', 'play', (YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString()));

          if (YTPlayer.opt.autoPlay) {
            const YTPStart = jQuery.Event("YTPStart");
            YTPStart.time = YTPlayer.currentTime;
            jQuery(YTPlayer).trigger(YTPStart);

            $YTPlayer.YTPPlay();

            /* Fix for Safari freeze */
            if (jQuery.mbBrowser.os.name == "mac" && jQuery.mbBrowser.safari && jQuery.mbBrowser.versionCompare(jQuery.mbBrowser.fullVersion, "10.1") < 0) { //jQuery.mbBrowser.os.minor_version < 11
              YTPlayer.safariPlay = setInterval(() => {
                if (YTPlayer.state != 1)
                  $YTPlayer.YTPPlay();
                else
                  clearInterval(YTPlayer.safariPlay)
              }, 10)
            }

          } else {
            setTimeout(() => {
              YTPlayer.player.pauseVideo();

              if (YTPlayer.start_from_last)
                YTPlayer.player.seekTo(startAt, true);

              if (!YTPlayer.isPlayer) {
                if (!YTPlayer.opt.coverImage) {
                  jQuery(YTPlayer.playerEl).CSSAnimate({
                    opacity: 1
                  }, YTPlayer.opt.fadeOnStartTime);
                  YTPlayer.wrapper.CSSAnimate({
                    opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
                  }, YTPlayer.opt.fadeOnStartTime);

                } else {
                  YTPlayer.wrapper.css({opacity: 0});
                  setTimeout(() => {

                    YTPlayer.wrapper.css({
                      background: `rgba(0,0,0,0.5) url(${YTPlayer.opt.coverImage}) center center`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat"
                    }).CSSAnimate({
                      opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
                    }, YTPlayer.opt.fadeOnStartTime);
                  }, YTPlayer.opt.fadeOnStartTime)
                }
              }
            }, 150);
            if (YTPlayer.controlBar.length)
              YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
          }

          if (YTPlayer.isPlayer && !YTPlayer.opt.autoPlay && (YTPlayer.loading && YTPlayer.loading.length)) {
            YTPlayer.loading.html("Ready");
            setTimeout(() => {
              YTPlayer.loading.fadeOut();
            }, 100)
          }

          if (YTPlayer.controlBar && YTPlayer.controlBar.length)
            YTPlayer.controlBar.slideDown(1000);
        }

        else if (jQuery.mbBrowser.os.name == "mac" && jQuery.mbBrowser.safari && jQuery.mbBrowser.fullVersion && jQuery.mbBrowser.versionCompare(jQuery.mbBrowser.fullVersion, "10.1") < 0) { //jQuery.mbBrowser.os.minor_version < 11
          YTPlayer.player.playVideo();
          if (startAt >= 0)
            YTPlayer.player.seekTo(startAt, true);
        }

      }, 500);

      return $YTPlayer;
    },

    /* TIME METHODS -------------------------------------------------------------------------------------------*/

    /**
     * getTime
     * @returns {string} time
     */
    getTime() {
      const YTPlayer = this.get(0);
      return jQuery.mbYTPlayer.formatTime(YTPlayer.currentTime);
    },

    /**
     * getTotalTime
     * @returns {string} total time
     */
    getTotalTime(format) {
      const YTPlayer = this.get(0);
      return jQuery.mbYTPlayer.formatTime(YTPlayer.totalTime);
    },

    /**
     * formatTime
     * @param s
     * @returns {string}
     */
    formatTime(s) {
      const min = Math.floor(s / 60);
      const sec = Math.floor(s - (60 * min));
      return `${min <= 9 ? `0${min}` : min} : ${sec <= 9 ? `0${sec}` : sec}`;
    },

    /* PLAYER POSITION AND SIZE OPTIMIZATION-------------------------------------------------------------------------------------------*/

    /**
     * setAnchor
     * @param anchor
     */
    setAnchor(anchor) {
      const $YTplayer = this;
      $YTplayer.optimizeDisplay(anchor);
    },

    /**
     * getAnchor
     * @param anchor
     */
    getAnchor() {
      const YTPlayer = this.get(0);
      return YTPlayer.opt.anchor;
    }
  };

  /**
   * optimizeDisplay
   * @param anchor
   * can be center, top, bottom, right, left; (default is center,center)
   */
  jQuery.fn.optimizeDisplay = function (anchor) {
    const YTPlayer = this.get(0);
    const vid = {};

    YTPlayer.opt.anchor = anchor || YTPlayer.opt.anchor;
    YTPlayer.opt.anchor = typeof YTPlayer.opt.anchor != "undefined " ? YTPlayer.opt.anchor : "center,center";
    const YTPAlign = YTPlayer.opt.anchor.split(",");
    const el = YTPlayer.wrapper;
    const iframe = jQuery(YTPlayer.playerEl);

    if (YTPlayer.opt.optimizeDisplay) {
      const abundance = iframe.height() * YTPlayer.opt.abundance;
      const win = {};
      win.width = el.outerWidth();
      win.height = el.outerHeight() + abundance;
      // TODO why do we need to check for ratio == auto in every method, shouldn't this be handled in buildPlayer()?
      YTPlayer.opt.ratio = YTPlayer.opt.ratio === "auto" ? 16 / 9 : YTPlayer.opt.ratio;
      YTPlayer.opt.ratio = eval(YTPlayer.opt.ratio);
      vid.width = win.width;
      vid.height = Math.ceil(vid.width / YTPlayer.opt.ratio);
      vid.marginTop = Math.ceil(-((vid.height - win.height) / 2));
      vid.marginLeft = 0;
      const lowest = vid.height < win.height;

      if (lowest) {
        vid.height = win.height;
        vid.width = Math.ceil(vid.height * YTPlayer.opt.ratio);
        vid.marginTop = 0;
        vid.marginLeft = Math.ceil(-((vid.width - win.width) / 2));
      }

      for (const a in YTPAlign) {
        if (YTPAlign.hasOwnProperty(a)) {
          const al = YTPAlign[a].replace(/ /g, "");
          switch (al) {
            case "top":
              vid.marginTop = lowest ? -((vid.height - win.height) / 2) : 0;
              break;
            case "bottom":
              vid.marginTop = lowest ? 0 : -(vid.height - (win.height));
              break;
            case "left":
              vid.marginLeft = 0;
              break;
            case "right":
              vid.marginLeft = lowest ? -(vid.width - win.width) : 0;
              break;
            default:
              if (vid.width > win.width)
                vid.marginLeft = -((vid.width - win.width) / 2);
              break;
          }
        }
      }

    } else {
      vid.width = "100%";
      vid.height = "100%";
      vid.marginTop = 0;
      vid.marginLeft = 0;
    }

    iframe.css({
      width: vid.width,
      height: vid.height,
      marginTop: vid.marginTop,
      marginLeft: vid.marginLeft,
      maxWidth: "initial"
    });
  };

  /* UTILITIES -----------------------------------------------------------------------------------------------------------------------*/

  /**
   * shuffle
   * @param arr
   * @returns {Array|string|Blob|*}
   *
   */
  jQuery.shuffle = arr => {
    const newArray = arr.slice();
    const len = newArray.length;
    let i = len;
    while (i--) {
      const p = parseInt(Math.random() * len);
      const t = newArray[i];
      newArray[i] = newArray[p];
      newArray[p] = t;
    }
    return newArray;
  };

  /**
   * Unselectable
   * @returns {*}
   */
  jQuery.fn.unselectable = function () {
    return this.each(function () {
      jQuery(this).css({
        "-moz-user-select": "none",
        "-webkit-user-select": "none",
        "user-select": "none"
      }).attr("unselectable", "on");
    });
  };

  /* EXTERNAL METHODS -----------------------------------------------------------------------------------------------------------------------*/

  jQuery.fn.YTPlayer = jQuery.mbYTPlayer.buildPlayer;
  jQuery.fn.mb_YTPlayer = jQuery.mbYTPlayer.buildPlayer;

  jQuery.fn.YTPCheckForState = jQuery.mbYTPlayer.checkForState;

  jQuery.fn.YTPGetPlayer = jQuery.mbYTPlayer.getPlayer;
  jQuery.fn.YTPGetVideoID = jQuery.mbYTPlayer.getVideoID;
  jQuery.fn.YTPGetPlaylistID = jQuery.mbYTPlayer.getPlaylistID;
  jQuery.fn.YTPChangeVideo = jQuery.fn.YTPChangeMovie = jQuery.mbYTPlayer.changeVideo;
  jQuery.fn.YTPPlayerDestroy = jQuery.mbYTPlayer.playerDestroy;

  jQuery.fn.YTPPlay = jQuery.mbYTPlayer.play;
  jQuery.fn.YTPTogglePlay = jQuery.mbYTPlayer.togglePlay;
  jQuery.fn.YTPStop = jQuery.mbYTPlayer.stop;
  jQuery.fn.YTPPause = jQuery.mbYTPlayer.pause;
  jQuery.fn.YTPSeekTo = jQuery.mbYTPlayer.seekTo;

  jQuery.fn.YTPlaylist = jQuery.mbYTPlayer.playlist;
  jQuery.fn.YTPPlayNext = jQuery.mbYTPlayer.playNext;
  jQuery.fn.YTPPlayPrev = jQuery.mbYTPlayer.playPrev;
  jQuery.fn.YTPPlayIndex = jQuery.mbYTPlayer.playIndex;

  jQuery.fn.YTPMute = jQuery.mbYTPlayer.mute;
  jQuery.fn.YTPUnmute = jQuery.mbYTPlayer.unmute;
  jQuery.fn.YTPToggleVolume = jQuery.mbYTPlayer.toggleVolume;
  jQuery.fn.YTPSetVolume = jQuery.mbYTPlayer.setVolume;
  jQuery.fn.YTPGetVolume = jQuery.mbYTPlayer.getVolume;

  jQuery.fn.YTPGetVideoData = jQuery.mbYTPlayer.getVideoData;
  jQuery.fn.YTPFullscreen = jQuery.mbYTPlayer.fullscreen;
  jQuery.fn.YTPToggleLoops = jQuery.mbYTPlayer.toggleLoops;
  jQuery.fn.YTPSetVideoQuality = jQuery.mbYTPlayer.setVideoQuality;
  jQuery.fn.YTPManageProgress = jQuery.mbYTPlayer.manageProgress;

  jQuery.fn.YTPApplyFilter = jQuery.mbYTPlayer.applyFilter;
  jQuery.fn.YTPApplyFilters = jQuery.mbYTPlayer.applyFilters;
  jQuery.fn.YTPToggleFilter = jQuery.mbYTPlayer.toggleFilter;
  jQuery.fn.YTPToggleFilters = jQuery.mbYTPlayer.toggleFilters;
  jQuery.fn.YTPRemoveFilter = jQuery.mbYTPlayer.removeFilter;
  jQuery.fn.YTPDisableFilters = jQuery.mbYTPlayer.disableFilters;
  jQuery.fn.YTPEnableFilters = jQuery.mbYTPlayer.enableFilters;
  jQuery.fn.YTPGetFilters = jQuery.mbYTPlayer.getFilters;

  jQuery.fn.YTPGetTime = jQuery.mbYTPlayer.getTime;
  jQuery.fn.YTPGetTotalTime = jQuery.mbYTPlayer.getTotalTime;

  jQuery.fn.YTPAddMask = jQuery.mbYTPlayer.addMask;
  jQuery.fn.YTPRemoveMask = jQuery.mbYTPlayer.removeMask;
  jQuery.fn.YTPToggleMask = jQuery.mbYTPlayer.toggleMask;

  jQuery.fn.YTPSetAnchor = jQuery.mbYTPlayer.setAnchor;
  jQuery.fn.YTPGetAnchor = jQuery.mbYTPlayer.getAnchor;

}))(jQuery, ytp);
