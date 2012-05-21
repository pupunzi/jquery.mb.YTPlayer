/*******************************************************************************
 jquery.mb.components
 Copyright (c) 2001-2010. Matteo Bicocchi (Pupunzi); Open lab srl, Firenze - Italy
 email: mbicocchi@open-lab.com
 site: http://pupunzi.com

 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 ******************************************************************************/

/*
 * $.mb.components: jquery.mb.YTPlayer
 * version: 1.3.9
 * © 2001 - 2012 Matteo Bicocchi (pupunzi), Open Lab
 *
 * YT API:
 *
 */

/* todo: add playerlist:
 *
 *
 *
 var playListURL = 'http://gdata.youtube.com/feeds/api/playlists/B2A4E1367126848D?v=2&alt=json&callback=?';
 var videoURL= 'http://www.youtube.com/watch?v=';
 $.getJSON(playListURL, function(data) {
 var list_data="";
 $.each(data.feed.entry, function(i, item) {
 var feedTitle = item.title.$t;
 var feedURL = item.link[1].href;
 var fragments = feedURL.split("/");
 var videoID = fragments[fragments.length - 2];
 var url = videoURL + videoID;
 var thumb = "http://img.youtube.com/vi/"+ videoID +"/default.jpg";
 list_data += '<li><a href="'+ url +'" title="'+ feedTitle +'"><img alt="'+ feedTitle+'" src="'+ thumb +'"</a></li>';
 });
 $(list_data).appendTo(".cont");
 });

 *
 * */

(function($){

  $.mbYTPlayer={
    name:"jquery.mb.YTPlayer",
    version:"1.3.9",
    author:"Matteo Bicocchi",
    width:450,
    controls:{
      play:"<img src='images/play.png'>",
      pause:"<img src='images/pause.png'>",
      mute:"<img src='images/mute.png'>",
      unmute:"<img src='images/unmute.png'>"
    },
    rasterImg:"images/raster.png",

    setYTPlayer:function(){
      var players=this;
      $.getScript("http://ajax.googleapis.com/ajax/libs/swfobject/2/swfobject.js",function(){
        players.each(function(){

          var player = $(this);
          if(!player.is("a")) return;

          if (!player.attr("id")) player.attr("id", "YTP_"+new Date().getTime());
          var ID=player.attr("id");

          var dataObj=$("<span/>");
          dataObj.attr("id",ID+"_data").hide();
          var data= dataObj.data();

          data.opacity=1;
          data.isBgndMovie=false;
          data.width=$.mbYTPlayer.width;
          data.quality="default";
          data.muteSound=false;
          data.hasControls=false;
          data.ratio="16/9";
          data.bufferImg=false;
          data.autoplay=true;

          var BGisInit = typeof document.YTPBG != "undefined";

          if ($.metadata){
            $.metadata.setType("class");
            if (player.metadata().quality) data.quality=player.metadata().quality;
            if (player.metadata().width) data.width=player.metadata().width;
            if (player.metadata().opacity) data.opacity = $.browser.msie ? 1 : player.metadata().opacity ? player.metadata().opacity: data.opacity;
            if (player.metadata().isBgndMovie && !BGisInit) {
              data.isBgndMovie=player.metadata().isBgndMovie;
              data.width=player.metadata().isBgndMovie.width? player.metadata().isBgndMovie.width:"window";
            }
            if (player.metadata().optimizeDisplay && data.isBgndMovie) {
              data.optimizeDisplay=player.metadata().optimizeDisplay;
            }

            if (player.metadata().muteSound) {data.muteSound=player.metadata().muteSound;}
            if (player.metadata().loop) {data.loop=player.metadata().loop;}
            if (player.metadata().hasControls) {data.hasControls=player.metadata().hasControls;}
            if (player.metadata().ratio) {data.ratio=player.metadata().ratio;}
            if (player.metadata().bufferImg) {data.bufferImg=player.metadata().bufferImg;}
            if (player.metadata().ID) {data.ID=player.metadata().ID;}
            if (player.metadata().autoplay!=undefined) {data.autoplay=player.metadata().autoplay;}
            if (player.metadata().showControls!=undefined) {data.showControls=player.metadata().showControls;}
            if (player.metadata().addRaster!=undefined) {data.addRaster=player.metadata().addRaster;}else{data.addRaster=false}
            if (player.metadata().lightCrop!=undefined) {data.lightCrop=player.metadata().lightCrop;}else{data.lightCrop=false}
          }

          var el= data.ID?$("#"+data.ID):$("body");
          if(data.ID){
            el.css({overflow:"hidden"});
          }
          if(data.width=="window") {
            data.height="100%";
            data.width= "100%";
          } else
            data.height= data.ratio=="16/9" ? Math.ceil((9*data.width)/16): Math.ceil((3*data.width)/4);

          var videoWrapper="";

          $(el).prepend(dataObj);

          if(data.isBgndMovie){
            if (data.ID){
              var bodyWrapper=$("<div/>").css({position:"relative",zIndex:0});
              var elPos = el.css("position") == "static" ? "relative" : el.css("position");
              el.css("position", elPos);

              $(el).wrapInner(bodyWrapper);
              $(el).prepend(player);
            }else{
              $(el).css({position:"relative",zIndex:1});
              $(el).before(player);
            }

            var pos= data.ID?"absolute":"fixed";

            videoWrapper=$("<div/>").attr("id","wrapper_"+ID).css({overflow:"hidden",position:pos,left:0,top:0, width:"100%", height:"100%", opacity:0});
            player.wrap(videoWrapper);
            if(!data.width.toString().indexOf("%")==-1) {
              var videoDiv=$("<div/>").css({position:pos,top: data.ratio=="4/3" && !data.ID?-(data.height/4):0,left:0, display:"block", width:data.width, height:data.height});
              player.wrap(videoDiv);
            }
          }else{
            videoWrapper=$("<span/>").attr("id","wrapper_"+ID).css({width:data.width, height:data.height, position:"relative", opacity:0}).addClass("mb_YTVPlayer");
            player.wrap(videoWrapper);
          }

          if(data.optimizeDisplay){
            $(window).resize(function(){
              $(player).optimizeDisplay();
            });
            $(document).bind("YTPStart", function(){
              $(player).optimizeDisplay();
              setTimeout(function(){videoWrapper.css({opacity:1});},2500);
            });
          }

          var params = { allowScriptAccess: "always", wmode:"transparent", allowFullScreen:"true" };
          var atts = { id: ID };
          data.movieURL=player.attr("href")?(player.attr("href").match( /[\\?&]v=([^&#]*)/))[1]:false;

          //swfobject.embedSWF(swfUrl, id, width, height, version, expressInstallSwfurl, flashvars, params, attributes, callbackFn)
          swfobject.embedSWF("http://www.youtube.com/apiplayer?enablejsapi=1&version=3&playerapiid="+ID,ID, data.width, data.height, "8", null, null, params, atts);

          var defData = {};
          dataObj.get(0).defaults=$.extend(defData,data);
        });
      });
    },

    setMovie: function(){

      var player = $(this).get(0);

      player.onVideoLoaded=undefined;

      var data = $("#"+player.id+"_data").data();
      var BGisInit = typeof document.YTPBG != "undefined";
      var movieID= data.movieURL;

      $(player).css({opacity:data.opacity});
      var pos= data.ID?"absolute":"fixed";

      var bufferImg=data.bufferImg?$("<div/>").addClass("mbYTP_bufferImg").css({position:pos,top:0,left:0,width:"100%",height:"100%",background:"url("+data.bufferImg+")"}).hide():false;
      var playerContainer=$(player).parents("div:first");
      var raster=$("<div/>").addClass("mbYTP_raster").css({opacity:0,position:pos,top:0,left:0,width:"100%",height:"100%",background:"url("+$.mbYTPlayer.rasterImg+")"});
      if (data.bufferImg) $(playerContainer).after(bufferImg);

      //if it is as background
      if(data.isBgndMovie && !BGisInit){
        if (data.addRaster && jQuery.mbYTPlayer.rasterImg && jQuery(".mbYTP_raster").length==0){
          $(playerContainer).append(raster);
        }

        //can't be more than one bgnd
        if(!data.ID)
          document.YTPBG=true;

        if(movieID)
          if(data.autoplay)
            player.loadVideoByUrl("http://www.youtube.com/v/"+movieID, 0);
          else
            player.cueVideoByUrl("http://www.youtube.com/v/"+movieID, 0);

        if (data.isBgndMovie.mute) player.mute();
        if(data.showControls) $(player).buildYTPControls();

      }else{
        $(playerContainer).after(bufferImg);
        player.cueVideoByUrl("http://www.youtube.com/v/"+movieID, 0);
        $(player).buildYTPControls();
      }

      player.setPlaybackQuality(data.quality);

      player.addEventListener("onStateChange", '(function(state) { return playerState(state, "' + player.id + '"); })');
    },

    changeMovie:function(url, opt){

      var player = $(this).get(0);
      var data = $("#"+player.id+"_data").data();

      if(opt){
        $.extend(data,opt);
      }else{
        var defData=$("#"+player.id+"_data").get(0).defaults;
        $.extend(data,defData);
      }

      data.movieURL=(url.match( /[\\?&]v=([^&#]*)/))[1];
      player.loadVideoByUrl("http://www.youtube.com/v/"+data.movieURL, 0);

      $(player).optimizeDisplay();

    },

    getPlayer:function(){
      return this.get(0);
    },

    playYTP: function(){
      var player= $(this).get(0);
      var data = $("#"+player.id+"_data").data();
      var controls = data.ID ?  $(player).parent().parent() : $(player).parent();

      var playBtn=controls.find(".mb_YTVPPlaypause");
      playBtn.html($.mbYTPlayer.controls.pause);
      player.playVideo();
    },

    stopYTP:function(){
      var player= $(this).get(0);
      var data = $("#"+player.id+"_data").data();
      var controls = data.ID ?  $(player).parent().parent() : $(player).parent();

      var playBtn=controls.find(".mb_YTVPPlaypause");
      playBtn.html($.mbYTPlayer.controls.play);
      player.pauseVideo();
    },

    pauseYTP:function(){
      var player= $(this).get(0);
      var data = $("#"+player.id+"_data").data();
      var controls = data.ID ?  $(player).parent().parent() : $(player).parent();

      var playBtn=controls.find(".mb_YTVPPlaypause");
      playBtn.html($.mbYTPlayer.controls.play);
      player.pauseVideo();
    },

    setYTPVolume:function(val){
      var player = $(this).get(0);
      var data = $("#"+player.id+"_data").data();
      if(!val && !data.vol && player.getVolume()==0)
        data.vol=100;
      else if((!val && player.getVolume()>0) || (val && player.getVolume()==val))
        data.vol=0;
      else
        data.vol=val;
      player.setVolume(data.vol);
    },

    muteYTPVolume:function(){
      var player= $(this).get(0);
      var data = $("#"+player.id+"_data").data();
      var controls = data.ID ?  $(player).parent().parent() : $(player).parent();
      var muteBtn= controls.find(".mb_YTVPMuteUnmute");
      muteBtn.html($.mbYTPlayer.controls.unmute);
      player.mute();
    },

    unmuteYTPVolume:function(){
      var player= $(this).get(0);
      var data = $("#"+player.id+"_data").data();
      var controls = data.ID ?  $(player).parent().parent() : $(player).parent();
      var muteBtn=controls.find(".mb_YTVPMuteUnmute");
      muteBtn.html($.mbYTPlayer.controls.mute);
      player.unMute();
    },

    manageYTPProgress:function(){
      var player= $(this).get(0);
      var data = $("#"+player.id+"_data").data();
      var YTPlayer = data.ID ?  $(player).parent().parent() : $(player).parent();

      var progressBar= YTPlayer.find(".mb_YTVPProgress");
      var loadedBar=YTPlayer.find(".mb_YTVPLoaded");
      var timeBar=YTPlayer.find(".mb_YTVTime");
      var totW= progressBar.outerWidth();

      var startBytes= player.getVideoStartBytes();
      var totalBytes= player.getVideoBytesTotal();
      var loadedByte= player.getVideoBytesLoaded();
      var currentTime=Math.floor(player.getCurrentTime());
      var totalTime= Math.floor(player.getDuration());
      var timeW= (currentTime*totW)/totalTime;
      var startLeft=0;

      if(startBytes) {
        startLeft=player.timeW;
      }

      var loadedW= (loadedByte*(totW-startLeft))/totalBytes;
      loadedBar.css({left:startLeft, width:loadedW});
      timeBar.css({left:0,width:timeW});
      return {totalTime:totalTime,currentTime: currentTime};
    },

    buildYTPControls:function(){
      var player= $(this).get(0);
      var data = $("#"+player.id+"_data").data();
      if (typeof player.isInit != "undefined") return;
      player.isInit=true;
      var YTPlayer= $(this).parent();
      var controlBar=$("<span/>").addClass("mb_YTVPBar").css({whiteSpace:"noWrap",position: data.isBgndMovie && !data.ID ? "fixed" : "absolute"}).hide();

      var buttonBar=$("<div/>").addClass("buttonBar");
      var playpause =$("<span>"+$.mbYTPlayer.controls.play+"</span>").addClass("mb_YTVPPlaypause").click(function(){
        if(player.getPlayerState()== 1){
          $(player).pauseYTP();
        }else{
          $(player).playYTP();
        }
      });
      var MuteUnmute=$("<span>"+$.mbYTPlayer.controls.mute+"</span>").addClass("mb_YTVPMuteUnmute").click(function(){
        if(player.isMuted()){
          $(player).unmuteYTPVolume();
        }else{
          $(player).muteYTPVolume();
        }
      });
      var idx=$("<span/>").addClass("mb_YTVPTime");
      var progressBar =$("<div/>").addClass("mb_YTVPProgress").css("position","absolute").click(function(e){
        timeBar.css({width:(e.clientX-timeBar.offset().left)});
        player.timeW=e.clientX-timeBar.offset().left;
        YTPlayer.find(".mb_YTVPLoaded").css({width:0});
        var totalTime= Math.floor(player.getDuration());
        player.goto=(timeBar.outerWidth()*totalTime)/progressBar.outerWidth();
        player.seekTo(player.goto, true);
        YTPlayer.find(".mb_YTVPLoaded").css({width:0});
      });
      var loadedBar = $("<div/>").addClass("mb_YTVPLoaded").css("position","absolute");
      var timeBar = $("<div/>").addClass("mb_YTVTime").css("position","absolute");

      progressBar.append(loadedBar).append(timeBar);
      buttonBar.append(playpause).append(MuteUnmute).append(idx);
      controlBar.append(buttonBar).append(progressBar);
      if (data.ID){
        YTPlayer.before(controlBar);
      }else{
        YTPlayer.append(controlBar);
      }

      if (!data.isBgndMovie){
        YTPlayer.css({opacity:data.opacity});

        YTPlayer.hover(function(){
          controlBar.fadeIn();
          clearInterval(player.getState);

          player.getState=setInterval(function(){

            //todo: check if audio is muted.

            if(player.isMuted()){
              YTPlayer.parent().find(".mb_YTVPMuteUnmute").html($.mbYTPlayer.controls.unmute);
            }

            var prog= $(player).manageYTPProgress();
            $(".mb_YTVPTime").html($.mbYTPlayer.formatTime(prog.currentTime)+" / "+ $.mbYTPlayer.formatTime(prog.totalTime));
            if(player.getPlayerState()== 1 && $(".mb_YTVPPlaypause").html()!=$.mbYTPlayer.controls.pause)
              YTPlayer.parent().find(".mb_YTVPPlaypause").html($.mbYTPlayer.controls.pause);
            if(player.getPlayerState()== 2)
              YTPlayer.parent().find(".mb_YTVPPlaypause").html($.mbYTPlayer.controls.play);
          },1000);
        },function(){
          controlBar.fadeOut();
          clearInterval(player.getState);
        });

      }else{
        controlBar.fadeIn();
        clearInterval(player.getState);
        player.getState=setInterval(function(){
          var prog= $(player).manageYTPProgress();

          if(player.isMuted()){
            YTPlayer.parent().find(".mb_YTVPMuteUnmute").html($.mbYTPlayer.controls.unmute);
          }

          YTPlayer.parent().find(".mb_YTVPTime").html($.mbYTPlayer.formatTime(prog.currentTime)+" / "+ $.mbYTPlayer.formatTime(prog.totalTime));

          if(player.getPlayerState()== 1 && $(".mb_YTVPPlaypause").html()!=$.mbYTPlayer.controls.pause)
            YTPlayer.parent().find(".mb_YTVPPlaypause").html($.mbYTPlayer.controls.pause);
          if(player.getPlayerState()== 2)
            YTPlayer.parent().find(".mb_YTVPPlaypause").html($.mbYTPlayer.controls.play);
        },1000);
      }
    },

    formatTime: function(s){
      var min= Math.floor(s/60);
      var sec= Math.floor(s-(60*min));
      return (min<9?"0"+min:min)+" : "+(sec<9?"0"+sec:sec);
    }
  };

  $.fn.mb_YTPlayer = $.mbYTPlayer.setYTPlayer;
  $.fn.mb_setMovie = $.mbYTPlayer.setMovie;
  $.fn.changeMovie = $.mbYTPlayer.changeMovie;

  $.fn.getPlayer = $.mbYTPlayer.getPlayer;
  $.fn.buildYTPControls = $.mbYTPlayer.buildYTPControls;
  $.fn.playYTP = $.mbYTPlayer.playYTP;
  $.fn.stopYTP = $.mbYTPlayer.stopYTP;
  $.fn.pauseYTP = $.mbYTPlayer.pauseYTP;
  $.fn.muteYTPVolume = $.mbYTPlayer.muteYTPVolume;
  $.fn.unmuteYTPVolume = $.mbYTPlayer.unmuteYTPVolume;
  $.fn.setYTPVolume = $.mbYTPlayer.setYTPVolume;
  $.fn.manageYTPProgress = $.mbYTPlayer.manageYTPProgress;

})($);

function onYouTubePlayerReady(playerId) {
  var player=$("#"+playerId);
  player.mb_setMovie();

  $(document).bind("mousedown",function(e){
    if(e.target.tagName.toLowerCase() == "a")
      player.pauseYTP();
  });
}

function playerState(state, el) {
  var player=$("#"+el).get(0);
  var data = $("#"+player.id+"_data").data();

  if (state==0 && data.isBgndMovie) {
    $(document).trigger("YTPEnd");
    if(data.loop)
      player.playVideo();
    else
      $(player).stopYTP();
  }

  if (state==0 && !data.isBgndMovie) {
    $(document).trigger("YTPEnd");
    $(player).stopYTP();
  }

  if ((state==-1 || state==3) && data.isBgndMovie) {
    $(document).trigger("YTPBuffering");
  }

  if (state==1 && data.isBgndMovie) {
    $(player).css({opacity:data.opacity});
    $(".mbYTP_raster").css({opacity:1,backgroundColor:"transparent"});
    $("#wrapper_"+player.id).animate({opacity:1},1000);
    $(document).trigger("YTPStart");
  }

  if(state==1 && !data.isBgndMovie){
    $(player).css({opacity:data.opacity});
    player.totalBytes=player.getVideoBytesTotal();
    $(document).trigger("YTPStart");
  }

  if(state==2)
    $(document).trigger("YTPPause");
}

$.fn.toggleVideoState=function(){
  var player=this.get(0);
  var isInit=player.isInit;
  if (isInit=="undefined")
    this.mb_YTPlayer();
  else if (player.getPlayerState()== 1)
    player.pauseVideo();
  else
    player.playVideo();
};

$.fn.optimizeDisplay=function(){
  var player=this.get(0);
  var data = $("#"+player.id+"_data").data();
  var wrapper = $("#wrapper_"+player.id);
  var lightCrop= data.lightCrop;

  var win={};
  var el= data.ID?$("#"+data.ID):$(window);

  win.width= el.width();
  win.height= el.height();

  var vid={};
  vid.width= win.width +( lightCrop ? (win.width*20/100): 0 );
  vid.height = data.ratio=="16/9" ? Math.ceil((9*win.width)/16): Math.ceil((3*win.width)/4);

  var marginTop= -((vid.height-win.height)/2);
  var marginLeft= -( lightCrop ? (win.width*10/100): 0 ) ;

  if(vid.height<win.height){
    vid.height = win.height +(  lightCrop ? (win.height*20/100) :0 );
    vid.width= data.ratio=="16/9" ? Math.ceil((16*win.height)/9): Math.ceil((4*win.height)/3);
    marginTop=-( lightCrop ? (win.height*10/100) : 0 );
    marginLeft= -((vid.width-win.width)/2);
  }

  wrapper.css({width:vid.width, height:vid.height, marginTop:marginTop, marginLeft:marginLeft});

};