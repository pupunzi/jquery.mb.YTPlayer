import flash.external.*;

ExternalInterface.addCallback( "loadVideoByUrl", this, loadVideoByUrl );
function loadVideoByUrl(url,go) {
	ns.play(url);
	videoUrl=url;
	playing=true;
    if(!go){
		stopVideo();
	}
}

ExternalInterface.addCallback( "playVideo", this, playVideo );
function playVideo(){
	if (playing) return;
    ns.pause(false);
	bufferClip._visible = false;	
	controls.playButton.gotoAndStop("stop");
	playing=true;
}

ExternalInterface.addCallback( "pauseVideo", this, pauseVideo );
function pauseVideo(){
	if (!playing) return;
    ns.pause(true);
	controls.playButton.gotoAndStop("play");
	playing=false;
}

ExternalInterface.addCallback( "stopVideo", this, stopVideo );
function stopVideo(rew) {
	ns.pause(true);
	playing=false;
	bufferClip._visible = true;
	controls.playButton.gotoAndStop("play");
	if (rew) ns.seek(0);
}

ExternalInterface.addCallback( "seekTo", this, seekTo);
function seekTo(val) {
	ns.seek(val);
}

//AUDIO
ExternalInterface.addCallback( "setVoume", this, setVoume);
function setVoume(val){
	so.setVolume(val);
	if(val>0)
		controls.mute.gotoAndStop("on");
	else 
		controls.mute.gotoAndStop("mute");
}


//VIDEOSTREAM
var nc:NetConnection = new NetConnection();
nc.connect(null);
var ns:NetStream = new NetStream(nc);
theVideo.attachVideo(ns);
ns.setBufferTime(10);

var infoCode="";
ns.onStatus = function(info) {
	//trace (info.code);
	if(info.code == "NetStream.Play.Start") {
		infoCode= info.code;
		bufferClip._visible = true;
		if(showFlashControls!="false")
			controls._visible = true;
		//if(autoplay!="true")
			//pauseVideo();

	}
	
	if(info.code == "NetStream.Buffer.Full") {
		infoCode= info.code;
		bufferClip._visible = false;	
	}
	
	if(info.code == "NetStream.Buffer.Empty") {
		infoCode= info.code;
		bufferClip._visible = true;
	}
	
	if(info.code == "NetStream.Play.Stop") {
		infoCode= info.code;
		bufferClip._visible = true;
		ns.seek(0);
		if(loop=="false"){
		    ns.pause(true);
			playing=false;
		}
	}
	
	if(info.code == "NetStream.Buffer.Flush") {
		infoCode= info.code;
	}
	
	if(info.code == "NetStream.Play.StreamNotFound") {
		infoCode= info.code;
		ExternalInterface.call("alert","video not found");
	}
}

ns.onMetaData = function(infoObject:Object) {
	var t="";
    for (var propName:String in infoObject) {
        t+=propName + " = " + infoObject[propName]+"   ---   ";
    }
	duration = infoObject.duration;
	//ExternalInterface.call("alert",t)
};

var playing=true;
controls.playButton.gotoAndStop("stop")
controls.playButton.onRelease = function() {
	ns.pause();
	if (playing){
		this.gotoAndStop("play")	
		playing=false;
	}else{
		this.gotoAndStop("stop")	
		playing=true;
	}
}

controls.rewindButton.onRelease = function() {
	ns.seek(0);
	playing=false;
}

function fadeOut() {
	this._alpha -= 5;
	if (this._alpha<=0) {
		this._alpha = 0;
		this.onEnterFrame = null;
	}
}

function fadeIn() {
	this.onEnterFrame = fadeIn;
	this._alpha += 5;
	if (this._alpha>=80) {
		this._alpha = 80;
		this.onEnterFrame = null;
	}
}


_root.onEnterFrame = function(){
	if(!seeking)
	  videoStatus();
	ExternalInterface.call("updateMovieState",ID,videoUrl,ns.time,duration, ns.bytesLoaded, ns.bytesTotal, so.getVolume(), playing, infoCode);
	if(showFlashControls!="false"){
		if (_root._ymouse>bufferClip._height-5)
			//controls._visible=false;
			controls.onEnterFrame=fadeOut;
		else
			//controls._visible=true;
			controls.onEnterFrame=fadeIn;
	}
}

var amountLoaded:Number;
var duration:Number;
var origH=theVideo._height;


function videoStatus() {
	amountLoaded = ns.bytesLoaded / ns.bytesTotal;
	controls.loader.loadbar._width = amountLoaded * 208.9;
	controls.loader.scrub._x = ns.time / duration * 208.9;
}

controls.loader.scrub.onPress = function() {
	seeking=true;
	this.startDrag(false,0,this._y,208,this._y);
}

controls.loader.scrub.onRelease = controls.loader.scrub.onReleaseOutside = function() {
	this.stopDrag();
	scrubit();
	seeking=false;
}

controls.loader.scrubBar.onEnterFrame= function() {
	this._width= _root.controls.loader.scrub._x;
	this._x=0;
}

function scrubit() {
	var t=Math.floor((controls.loader.scrub._x/208)*duration);
	//ExternalInterface.call("alert",duration);
	//ns.play(videoUrl,t);
	ns.seek(t);
}



//SOUND

_root.createEmptyMovieClip("vSound",_root.getNextHighestDepth());
vSound.attachAudio(ns);

var so:Sound = new Sound(vSound);

so.setVolume(100);

controls.mute.onRollOver = function() {
	if (so.getVolume() == 100) {
		this.gotoAndStop("onOver");
	}
	else {
		this.gotoAndStop("muteOver");
	}
}

controls.mute.onRollOut = function() {
	if(so.getVolume()== 100) {
		this.gotoAndStop("on");
	}
	else {
		this.gotoAndStop("mute");
	}
}

controls.mute.onRelease = function() {
	if(so.getVolume() == 100) {
		so.setVolume(0);
		this.gotoAndStop("muteOver");
	}
	else {
		so.setVolume(100);
		this.gotoAndStop("onOver");
	}
}

if(videoUrl){
	playing=true;
	ns.play(videoUrl);
	    if(!autoPlay){
		stopVideo();
	}

}
ExternalInterface.call("onMbPlayerReady", ID);


