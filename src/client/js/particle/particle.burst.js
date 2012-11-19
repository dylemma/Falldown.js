withNamespace('falldown.particle', function(particle){

	//function to assign a vector to a random direction unit vector
	var twoPi = 2 * Math.PI
	function randomDirection(v){
		var angle = Random.next(twoPi)
		return v.set(Math.cos(angle), Math.sin(angle))
	}
	
	//decide how far a particle should be at a given time `t`
	var linear = d3.ease('linear')
	var circOut = d3.ease('circ-out')
	var cubicIn = d3.ease('cubic-in')
	function distance(t){
		return circOut(t) * 5
	}
	
	//decide how opaque a particle should be at a given time `t`
	function opacity(t){
		return 1 - linear(t)
	}
	
	function size(t){
		return (cubicIn(t) + 1)
	}

	particle.burst = function(center, color, opts){
		var particleLife = +opts.particleLife || 40,
			velocity = opts.velocity || new geom.Vector(),
			scrap = new geom.Vector()
	
		function initParticle(p){
			p.color = color
			p.position.set(center)
			p.metadata.direction = randomDirection(new geom.Vector())
			p.metadata.timeAlive = 0
			p.metadata.dist = Math.random(0.25, 1)
			p.size = size(0)
			p.opacity = opacity(0)
		}
		
		function updateParticle(p){
			var t = (p.metadata.timeAlive++) / particleLife
			p.opacity = opacity(t)
			p.size = size(t)
			
			//compute the position = center + direction*distance
			p.position.set(center)
			scrap
				.set(p.metadata.direction)
				.scaleSelf(distance(t) * p.metadata.dist)
			p.position.addSelf(scrap)
			scrap.set(velocity).scaleSelf(p.metadata.timeAlive)
			p.position.addSelf(scrap)
		}
		
		function killParticle(p){
			return p.metadata.timeAlive > particleLife
		}
		
		var firstSpawn = true
		function spawnCount(){
			if(firstSpawn){
				firstSpawn = false
				return 10
			} else {
				return 0
			}
		}
		
		var b = new particle.ParticleSystemBehavior(10, particleLife + 1)
		b.initParticle = initParticle
		b.updateParticle = updateParticle
		b.killParticle = killParticle
		b.spawnCount = spawnCount
		
		return b
	}

})