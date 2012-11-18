(function(falldown){

	var Particle = function(){
		this.position = new geom.Vector()
		this.color = 'red'
		this.size = 1
		this.opacity = 0.5
		this.active = false
		this.metadata = {}
	}
	
	Particle.prototype.reset = function(){
		this.position.set(0,0)
		this.color = 'red'
		this.size = 1
		this.opacity = 0.5
		this.active = false
		this.metadata = {}
	}
	
	var psid = 0
	
	/* Pick a number of particles that is an integer multiple of the bucketSize */
	function pickNumParticles(rawNumParticles, bucketSize){
		var numBuckets = Math.ceil(rawNumParticles/bucketSize)
		return numBuckets * bucketSize
	}
	
	var ParticleSystem = falldown.ParticleSystem = function(opts){
		this.id = psid++
		
		opts = opts || {}
		this.className = opts.className || ('particle-system-' + this.id)
		this.bucketSize = +opts.bucketSize || 10
		
		setupParticles(this, +opts.numParticles || 500, this.bucketSize)
		
		
		this.age = 0 //useless?
	}
	
	function setupParticles(psys, numParticles, bucketSize){
		var numBuckets = Math.ceil(numParticles / bucketSize)
		numParticles = numBuckets * bucketSize
		
		var particles = new Array(numParticles)
		for(var i=0; i<numParticles; i++) particles[i] = new Particle()
		
		var freeBuckets = new Array(numBuckets)
		for(var i=0; i<numBuckets; i++) freeBuckets[i] = i
		
		psys.particles = particles
		psys.particleAllocation = { 'free': freeBuckets }
		psys.behaviors = {}
	}
	
	ParticleSystem.prototype.__defineGetter__('numFreeParticles', function(){
		return this.particleAllocation['free'].length * this.bucketSize
	})
	
	/* Check if the `behavior` will fit in this particleSystem based on its
	 * requested number of particles.
	 */
	ParticleSystem.prototype.canAddBehavior = function(behavior){
		var numBuckets = Math.ceil(behavior.numParticles / this.bucketSize),
			freeBuckets = this.particleAllocation['free']
		return freeBuckets.length >= numBuckets
	}
	
	ParticleSystem.prototype.addBehavior = function(behavior){
		if(!this.canAddBehavior(behavior))
			throw 'Not enough particles in the system to support the behavior'
	
		var numBuckets = Math.ceil(behavior.numParticles / this.bucketSize),
			freeBuckets = this.particleAllocation['free'],
			bid = behavior.id,
			buckets = this.particleAllocation[bid] = []
			
		for(var i=0; i<numBuckets; i++){
			buckets.push(freeBuckets.shift())
		}
		
		this.behaviors[bid] = behavior
	}
	
	function removeBehavior(psys, behaviorId){
		var freeBuckets = psys.particleAllocation['free'],
			buckets = psys.particleAllocation[behaviorId]
		while(buckets.length){
			freeBuckets.push(buckets.shift())
		}
		delete psys.particleAllocation[behaviorId]
		delete psys.behaviors[behaviorId]
	}
	
	function iterateParticles(psys, behavior, iterator){
		var bid = behavior.id,
			buckets = psys.particleAllocation[bid],
			numParticles = behavior.numParticles,
			bucketSize = psys.bucketSize,
			particles = psys.particles,
			idx = 0
			
		buckets.forEach(function(b){
			for(var i=0; i<bucketSize; i++){
				if(idx<numParticles){
					var p = particles[b*bucketSize + i]
					iterator(p, idx)
				}
				idx++
			}
		})
	}
	
	ParticleSystem.prototype.step = function(){
		
		for(var bid in this.behaviors){
			var behavior = this.behaviors[bid]
			
			var numSpawned = 0,
				toSpawn = behavior.spawnCount(),
				age = behavior.age++
			
			iterateParticles(this, behavior, function(p){
				if(numSpawned < toSpawn && !p.active){
					p.active = true
					behavior.initParticle(p)
					numSpawned++
				} else if(p.active){
					behavior.updateParticle(p)
					if(behavior.killParticle(p)) p.reset()
				}
			})
			
			if(age > behavior.duration && behavior.duration >=0){
				//behavior finished
				removeBehavior(this, bid)
			}
		}

	}
	
	var behaviorId = 0
	
	var ParticleSystemBehavior = function(numParticles, duration){
		this.numParticles = numParticles
		this.duration = duration
		this.age = 0
	
		var id = behaviorId++
		this.__defineGetter__('id', function(){ return id })
	
		this.initParticle = function initParticle(p){}
		this.updateParticle = function updateParticle(p){}
		this.killParticle = function killParticle(p){ return false }
		this.spawnCount = function spawnCount(){ return 0 }
	}
	
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
	
	var particleWave = function(startPos, endPos, width, duration, numParticles, opts){
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
		
		var behavior = new ParticleSystemBehavior(numParticles, duration + period)
		behavior.initParticle = initParticle
		behavior.updateParticle = updateParticle
		behavior.killParticle = killParticle
		behavior.spawnCount = spawnCount
		
		return behavior
	}
	
	var particleEmitter = function(emitFrom, direction, particleLife){
		var emitPos = (function(){
			if(typeof emitFrom == 'function') return emitFrom
			else return function(){ return emitFrom }
		})()
		
		var emitDirection = (function(){
			//var dir = new geom.Vector().set(direction).normalize()
			//var normal = new geom.Vector(dir.y, -dir.x)
			var scrap = new geom.Vector()
			var spread = 0.2
			
			return function(v){
				scrap.set(direction).normalize()
				v.set(scrap)
				scrap.set(scrap.y, -scrap.x).scaleSelf(Random.next(-spread, spread))
				v.addSelf(scrap)
				return v
			}
		})()
		
		var pickSize = (function(){
			var e = d3.ease('linear')
			return function(t){ return 1 - e(t) }
		})()
		
		var pickColor = function(){
			return Random.pick(['red', 'orange'])
		}
		
		function initParticle(p){
			p.color = pickColor()
			p.position.set(emitPos())
			p.metadata.direction = emitDirection(new geom.Vector())
			p.metadata.timeAlive = 0
			p.size = pickSize(0)
		}
		
		function updateParticle(p){
			var t = (p.metadata.timeAlive++) / particleLife
			p.size = pickSize(t)
			p.position.addSelf(p.metadata.direction)
		}
		
		function killParticle(p){
			return p.metadata.timeAlive > particleLife
		}
		
		function spawnCount(){ return 1 }
		
		var numParticles = (particleLife * 1) + 1
		
		var behavior = new ParticleSystemBehavior(numParticles, -1)
		behavior.initParticle = initParticle
		behavior.updateParticle = updateParticle
		behavior.killParticle = killParticle
		behavior.spawnCount = spawnCount
		
		return behavior
	}
	
	falldown.particle = {
		'Particle': Particle,
		'ParticleSystem': ParticleSystem,
		'ParticleSystemBehavior': ParticleSystemBehavior,
		'wave': particleWave,
		'emitter': particleEmitter
	}

})(window.falldown || (window.falldown = {}))