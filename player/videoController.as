import flash.external.*;

ExternalInterface.addCallback( "loadVideoByUrl", this, loadVideoByUrl );
function loadVideoByUrl(url,go) {
	ns.play(url,100);
	videoUrl=url;
	playing=true;
    if(!go){
		ns.pause();
    	playing=false;
	}
}

ExternalInterface.addCallback( "playVideo", this, playVideo );
function playVideo(){
	if (playing) return;
    ns.pause();
	controls.playButton.gotoAndStop("stop");
	playing=true;
}

ExternalInterface.addCallback( "pauseVideo", this, pauseVideo );
function pauseVideo(){
	if (!playing) return;
    ns.pause();
	controls.playButton.gotoAndStop("play");
	playing=false;
}

ExternalInterface.addCallback( "stopVideo", this, stopVideo );
function stopVideo() {
	ns.seek(0);
	if (playing){
		ns.pause();
		playing=false;
	}
	bufferClip._visible = true;
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

var nc:NetConnection = new NetConnection();
nc.connect(null);
var ns:NetStream = new NetStream(nc);
theVideo.attachVideo(ns);
ns.setBufferTime(10);

ns.onStatus = function(info) {
	//trace (info.code);
	if(info.code == "NetStream.Play.Start") {
	bufferClip._visible = true;
	}
	if(info.code == "NetStream.Buffer.Full") {
		bufferClip._visible = false;
	}
	if(info.code == "NetStream.Buffer.Empty") {
		bufferClip._visible = true;
	}
	
	if(info.code == "NetStream.Play.Stop") {
		bufferClip._visible = false;
		ns.seek(0);
		if(loop=="false")
		    ns.pause();
	}
	if(info.code == "NetStream.Buffer.Flush") {
	}
	if(info.code == "NetStream.Play.StreamNotFound") {
	}
}

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
}

this.createEmptyMovieClip("vFrame",this.getNextHighestDepth());
_root.onEnterFrame = function(){
	if(!seeking)
	  videoStatus();
	ExternalInterface.call("updateMovieState",ID,videoUrl,ns.time,duration, ns.bytesLoaded, ns.bytesTotal, so.getVolume(), playing);
}

var amountLoaded:Number;
var duration:Number;
var origH=theVideo._height;

ns["onMetaData"] = function(obj) {
    duration = obj.duration;
}

function videoStatus() {
	amountLoaded = ns.bytesLoaded / ns.bytesTotal;
	controls.loader.loadbar._width = amountLoaded * 208.9;
	controls.loader.scrub._x = ns.time / duration * 208.9;
}

controls.loader.scrub.onPress = function() {
	seeking=true;
	//_root.vFrame.onEnterFrame = scrubit;
	this.startDrag(false,0,this._y,208,this._y);
}

controls.loader.scrub.onRelease = controls.loader.scrub.onReleaseOutside = function() {
	//_root.vFrame.onEnterFrame = videoStatus;
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
	ExternalInterface.call("alert",t);
	ns.play(videoUrl,t);
}

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
	if(so.getVolume()== 100) {
		so.setVolume(0);
		this.gotoAndStop("muteOver");
	}
	else {
		so.setVolume(100);
		this.gotoAndStop("onOver");
	}
}

if(videoUrl)
ns.play(videoUrl);
playing=true;




	
	





	
	
	