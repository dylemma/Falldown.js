withNamespace('falldown.particle', function(particle){

	/* Return an "easing" function that starts at 0,
	 * then goes up to 1 and then back down to 0, following
	 * a cosine wave shape.
	 */
	function trigUpDown(amplitude){
		var twoPi = 2 * Math.PI,
			amp = (amplitude || 1) * -0.5
		return function(t){
			return amp * (Math.cos(twoPi*t) -1)
		}
	}

	/* Create a function that will set the position (or create a new position)
	 * along a "wave-front".
	 */
	function waveFrontPosition(startPos, endPos, width){
		var scrap = new geom.Vector(),
			dist = scrap.set(endPos).subSelf(startPos).length(),
			direction = new geom.Vector().set(scrap.normalize()),
			normal = new geom.Vector(direction.y, -direction.x)
		
		//vec is optional:
		//if omitted, this function creates a new vector for the result
		//if specified, this function simply modifies vec in place
		return function(t, vec){
			var u = dist * t,
				v = Random.next(width * -0.5, width * 0.5)
			return (vec || new geom.Vector())
				.set(startPos)
				.addSelf(scrap.set(direction).scaleSelf(u))
				.addSelf(scrap.set(normal).scaleSelf(v))
		}
	}

	particle.wave = function(startPos, endPos, width, duration, numParticles, opts){
		opts = opts || {}
		
		var pickPos = waveFrontPosition(startPos, endPos, width),
			period = opts.period || 30,
			amplitude = opts.amplitude || 3,
			pickSize = trigUpDown(amplitude),
			pickColor = (function(){
				if(typeof opts.color == 'function') return opts.color
				else if(typeof opts.color == 'string') return function(){ return opts.color }
				else return function(){ return 'black' }
			})()
		
		function initParticle(p){
			pickPos(this.age / duration, p.position)
			p.size = pickSize(0)
			p.metadata.timeAlive = 0
			p.color = pickColor()
		}
		
		function updateParticle(p){
			var t = (p.metadata.timeAlive++) / period
			p.size = pickSize(t)
		}
		
		function killParticle(p){
			return p.metadata.timeAlive > period
		}
		
		function spawnCount(){
			return 2
		}
		
		var behavior = new particle.ParticleSystemBehavior(numParticles, duration + period)
		behavior.initParticle = initParticle
		behavior.updateParticle = updateParticle
		behavior.killParticle = killParticle
		behavior.spawnCount = spawnCount
		
		return behavior
	}
	
}) // end 'falldown.render' namespace