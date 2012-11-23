withNamespace('falldown.particle', function(particle){

	/* Create a function that will set the position (or create a new position)
	 * along a "wave-front".
	 */
	function waveFrontPosition(startPos, endPos, width){
		var scrap = geom.Vector.scrap,
			dist = scrap.set(endPos).sub(startPos).length(),
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
				.add(scrap.set(direction).scale(u))
				.add(scrap.set(normal).scale(v))
		}
	}

	particle.wave = function(startPos, endPos, width, duration, numParticles, opts){
		opts = opts || {}
		
		var pickPos = waveFrontPosition(startPos, endPos, width),
			period = opts.period || 30,
			amplitude = opts.amplitude || 3,
			pickSize = falldown.ease('sin-in-out').to(amplitude).mirrored(),
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