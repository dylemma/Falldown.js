withNamespace('falldown.particle', function(particle){

	var Particle = function(){
		this.position = new geom.Vector()
		this.velocity = new geom.Vector()
		this.acceleration = new geom.Vector()
		this.color = 'red'
		this.size = 1
		this.opacity = 0.5
		this.active = false
		this.metadata = {}
	}
	
	Particle.prototype.reset = function(){
		this.position.set(0,0)
		this.velocity.set(0,0)
		this.acceleration.set(0,0)
		this.color = 'red'
		this.size = 1
		this.opacity = 0.5
		this.active = false
		this.metadata = {}
	}
	
	Particle.prototype.stepMovement = function(){
		this.velocity.add(this.acceleration)
		this.position.add(this.velocity)
	}
	
	var psid = 0
	
	/* Pick a number of particles that is an integer multiple of the bucketSize */
	function pickNumParticles(rawNumParticles, bucketSize){
		var numBuckets = Math.ceil(rawNumParticles/bucketSize)
		return numBuckets * bucketSize
	}
	
	var ParticleSystem = function(opts){
		this.id = psid++
		
		opts = opts || {}
		this.className = opts.className || ('particle-system-' + this.id)
		this.bucketSize = +opts.bucketSize || 10
		
		setupParticles(this, +opts.numParticles || 500, this.bucketSize)
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
	
	particle.Particle = Particle
	particle.ParticleSystem = ParticleSystem,
	particle.ParticleSystemBehavior = ParticleSystemBehavior
	

})