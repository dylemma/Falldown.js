(function(sound){

	sound.Context = function(){
		var self = this
		var ContextClass = webkitAudioContext //or other browser-specific implementations
		var sounds = {}
		
		this.context = new ContextClass
		
		this.loadSound = function(name, url, callback){
			var req = new XMLHttpRequest
			var cb = (typeof callback === 'function') ? callback : function(){}
			req.open('GET', url, true)
			req.responseType = 'arraybuffer'
			
			req.onload = function(){
				self.context.decodeAudioData(req.response, function(buffer){
					sounds[name] = buffer
					cb(name)
				})
			}
			
			req.send()
		}
		
		this.playSound = function(name, time, dest){
			if(sounds.hasOwnProperty(name)){
				time = time || 0
				dest = dest || this.context.destination
				
				var source = this.context.createBufferSource()
				source.buffer = sounds[name]
				source.connect(dest)
				source.noteOn(time)
				return true
			} else {
				return false
			}
		}
		
		this.__defineGetter__('soundNames', function(){
			var r = []
			for(k in sounds) r.push(k)
			return r
		})
		
		this.getSound = function(name){
			return sounds[name]
		}
	}
	
})(window.sound || (window.sound = {}))