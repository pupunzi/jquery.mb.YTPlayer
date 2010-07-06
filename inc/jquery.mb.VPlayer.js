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
 * jQuery.mb.components: mb.chromelessPlayer
 * version: 1.0- 1-lug-2010 - 44
 * © 2001 - 2010 Matteo Bicocchi (pupunzi), Open Lab
 */

/**
 *
 * it needs: the mbVPlayer.swf
 * it uses swfobject.js
 * 
 * what video can it play?
 *
 * .mov --> H.264 web streaming optimized
 * .m4v
 * .flv
 * .f4v
 * 
 * */

(function($){

  $.mbVPlayer={
    name:"jquery.mb.chromelessPlayer",
    version:"1.0",
    author:"Matteo Bicocchi",
    mbCP: new Object(),
    defaults:{
      flashVars:{
        player:"chromeless_player.swf",//http://pupunzi.com/test/a/chromeless_player.swf
        videoUrl:false,
        showFlashControls:false,
        loop:false,
        autoplay:false
      },
      placeHolderUrl:"placeHolder.png",
      isBackground:false,
      controlsID:false,
      width:400,
      height:180
    },
    params:{
      allowScriptAccess: "always",
      wmode:"transparent",
      allowFullScreen:"true"
    },
    createMovie:function(opt){
      this.each(function(){
        var el=this;
        var $el=$(this);
        if(!el.id) el.id="mbVP_"+new Date().getMilliseconds();
        $.mbVPlayer.mbCP[el.id]=new Object();
        this.options = {};
        $.extend (this.options, $.mbVPlayer.defaults, opt);
        if ($.metadata){
          $.metadata.setType("class");
          if($(this).metadata())
            $.extend(this.options,$(this).metadata())
        }
        if(this.options.isBackground && !$.mbVPlayer.mbCP.backgroundPlayer){
          var videoWrapper=$("<div>").attr({id:"mbVW_"+el.id}).css({position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"#000",zIndex:0});
          $el.wrapAll(videoWrapper);
          $("body").css({position:"relative",zIndex:2}).after(videoWrapper);
          $.mbVPlayer.mbCP.backgroundPlayer=true;
        }
        swfobject.embedSWF(this.options.player,el.id,this.options.width,this.options.height,"9.0.0",null,this.options.flashVars,this.options.params);
        if(this.options.flashVars.controlsID)
          $.mbVPlayer.activateControls(this.options.flashVars.controlsID, el.id);
      })
    },
    init:function(opt){
      if(!$.mbVPlayer.isInit){
        $.getScript("http://ajax.googleapis.com/ajax/libs/swfobject/2/swfobject.js",function(){
          $(this).mb_createMovie(opt);
        });
        $.mbVPlayer.isInit=true;
      }else{
        $(this).mb_createMovie(opt);
      }
    },
    activateControls:function(controlsID,playerID){
      var control= $("#"+controlsID);
      var play= control.find(".play");
      var pause= control.find(".pause");
      var play_pause=control.find(".play_pause");
      var rew= control.find(".rew");
      var fwd= control.find(".fwd");
      var stop= control.find(".stop");
      var seekto= control.find(".seekto");
    }
  };

  $.fn.mb_initMoviePlayer=$.mbVPlayer.init;
  $.fn.mb_createMovie=$.mbVPlayer.createMovie;

  $.fn.getvideoUrl=function(){
    var player= $(this).get(0);
    return $.mbVPlayer.mbCP[player.id].videoUrl;
  };

  $.fn.getCurrentTime=function(format){
    var player= $(this).get(0);
    var time=$.mbVPlayer.mbCP[player.id].currentTime;
    if (format)
      time=formatTime(time);
    return time ;
  };

  $.fn.getDuration=function(format){
    var player= $(this).get(0);
    var duration=$.mbVPlayer.mbCP[player.id].duration;
    if (format)
      duration=formatTime(duration);
    return duration ;
  };

  $.fn.getbytesLoaded=function(){
    var player= $(this).get(0);
    return $.mbVPlayer.mbCP[player.id].bytesLoaded;
  };

  $.fn.getbytesTotal=function(){
    var player= $(this).get(0);
    return $.mbVPlayer.mbCP[player.id].bytesTotal;
  };

  $.fn.getPlayingState=function(){
    var player= $(this).get(0);
    return $.mbVPlayer.mbCP[player.id].isPlaying;
  };

  /*AUDIO*/
  $.fn.getVolume=function(){
    var player= $(this).get(0);
    return $.mbVPlayer.mbCP[player.id].volume;
  };

  $.fn.setVoume=function(val){
    var player= $(this).get(0);
    player.setVoume(val);
  };

  $.fn.getInfoCode=function(){
    var player= $(this).get(0);
    return $.mbVPlayer.mbCP[player.id].infoCode;
  };
  // video actions
  $.fn.stopVideo=function(){
    var player= $(this).get(0);
    player.stopVideo(true);
  };

  $.fn.playVideo=function(){
    var player= $(this).get(0);
    player.playVideo();
  };

  $.fn.pauseVideo=function(){
    var player= $(this).get(0);
    player.pauseVideo();
  };

  $.fn.seekTo=function(val){
    var player= $(this).get(0);
    player.seekTo(val);
  };

  // fullscreen needs a real click -- it doesn't work from a js call
  $.fn.fullScreenMovie=function(){
    var player= $(this).get(0);
    player.fullScreenMovie();
  };

  //load video
  $.fn.loadVideoByUrl=function(url,play){
    var player= $(this).get(0);
    player.loadVideoByUrl(url,play);
  };

  // Update time
  $.fn.setTimeInfo=function(where){
    var movie=$(this);
    setInterval(function(){
      var s=movie.getCurrentTime(true)+" of "+movie.getDuration(true);
      if(typeof movie.getDuration()=="number")
      $("#"+where).html(s);
      $("#"+where).slideDown("slow");
    },1000);

  };

  $.fn.traceState=function(){
    var player= $(this).get(0);
    console.debug(":::::::::::::::::::::::::::::::::::::::::::");
    console.debug("current URL:: ",$(this).getvideoUrl());
    console.debug("current time:: ",$(this).getCurrentTime(true));
    console.debug("duration:: ",$(this).getDuration(true));
    console.debug("bytes loaded:: ",$(this).getbytesLoaded());
    console.debug("total bytes:: ",$(this).getbytesTotal());
    console.debug("is playing:: ",$(this).getPlayingState());
    console.debug("volume:: ",$(this).getVolume());
    console.debug("code:: ",$(this).getInfoCode());
  };

})(jQuery);


function onMbPlayerReady(playerID){}

function updateMovieState(ID, videoUrl, currentTime, duration, bytesLoaded, bytesTotal, volume, isPlaying,infocode){
  if (typeof document.mbCP[ID]!="object") document.mbCP[ID]=new Object();
  document.mbCP[ID].videoUrl = videoUrl;
  document.mbCP[ID].currentTime = currentTime;
  document.mbCP[ID].duration = duration;
  document.mbCP[ID].bytesLoaded = bytesLoaded;
  document.mbCP[ID].bytesTotal = bytesTotal;
  document.mbCP[ID].volume = volume;
  document.mbCP[ID].isPlaying = eval(isPlaying);
  document.mbCP[ID].infoCode= infocode;
}

function formatTime(s){
  var min= Math.floor(s/60);
  var sec= Math.floor(s-(60*min));
  return (min<=9?"0"+min:min)+":"+(sec<=9?"0"+sec:sec);
}