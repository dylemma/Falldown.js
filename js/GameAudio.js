Falldown.GameAudio = function() {
	var self = this;
	
	this.context = new webkitAudioContext();
	
	
	this.popGain = this.context.createGainNode();
		this.popGain.gain.value = 0.25;
		this.popGain.connect(this.context.destination);
	this.pop = new Falldown.SoundHandler(self.context, self.popGain);
	
	var loader = new BufferLoader(this.context, ['audio/pop.wav'], onload);
	
	var ready = false;
	function onload(bufferList){
//		console.log("got sound buffers: ", bufferList);
		if(bufferList[0]){
			ready = true;
			self.pop.buffer = bufferList[0];
		}
	}
	
	loader.load();
}

Falldown.SoundHandler = function(context, defaultTarget, buffer){
	if(!context){
		throw "Illegal Argument: context must be an AudioContext instance";
	}
	this.buffer = buffer;
	
	this.readySound = function(targetNode) {
		if(!this.buffer) return;
		var sound = context.createBufferSource();
		sound.buffer = this.buffer;
		sound.connect(targetNode);
		return sound;
	}
	
	this.play = function(options){
		if(!this.buffer) return;
		options = options || {};
		var target = options.target || options.targetNode || defaultTarget;
		if(!target) throw "Illegal Argument: options.target needs to be a destination node";
		
		var playbackRate = options.pitch || 1;
		var startTime = options.startTime || 0;
		
		
		var sound = this.readySound(target);
		sound.playbackRate.value = playbackRate;
		sound.noteOn(startTime);
	}
}