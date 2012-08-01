Falldown.GameAudio = function() {
	var self = this;
	
	this.context = new webkitAudioContext();
	
	this.pop = undefined;
	
	this.popGain = this.context.createGainNode();
		this.popGain.gain.value = 0.25;
		this.popGain.connect(this.context.destination);
	
	var loader = new BufferLoader(this.context, ['audio/pop.wav'], onload);
	
	var ready = false;
	function onload(bufferList){
		console.log("got sound buffers: ", bufferList);
		if(bufferList[0]){
			ready = true;
			self.pop = new Falldown.SoundHandler(self.context, bufferList[0], self.popGain);
		}
	}
	
	loader.load();
}

Falldown.SoundHandler = function(context, buffer, defaultTarget){
	if(!context){
		throw "Illegal Argument: context must be an AudioContext instance";
	}
	if(!buffer){
		throw "Illegal Argument: buffer must be an AudioBuffer instance";
	}
	
	this.readySound = function(targetNode) {
		var sound = context.createBufferSource();
		sound.buffer = buffer;
		sound.connect(targetNode);
		return sound;
	}
	
	this.play = function(options){
		var target = options.target || options.targetNode || defaultTarget;
		if(!target) throw "Illegal Argument: options.target needs to be a destination node";
		
		var playbackRate = options.pitch || 1;
		var startTime = options.startTime || 0;
		
		var sound = this.readySound(target);
		sound.playbackRate.value = playbackRate;
		sound.noteOn(startTime);
	}
}