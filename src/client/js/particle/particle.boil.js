withNamespace('falldown.particle', function(particle){

	var pickSize = falldown.ease('sin-in-out').mirrored().to(5)
		
	particle.boil = function(position, opts){
		opts = opts || {}
		var color = opts.color || 'skyblue',
			pickColor = falldown.util.color.randomHueShift('skyblue'),
			radius = +opts.radius || 5,
			particleLife = +opts.particleLife || 30,
			centerPos = new geom.Vector().set(position)
	
		function randomizePos(pos){
			pos = pos || new geom.Vector()
			var angle = Random.next(Math.PI * 2),
				dist = Random.next(radius)
			pos.set(Math.cos(angle),Math.sin(angle)).scale(dist)
			
			return pos
		}
	
		function initParticle(p){
			//use p.velocity to store the position offset of the particle
			randomizePos(p.velocity)
			p.color = pickColor()
			p.position.set(centerPos).add(p.velocity)
			p.metadata.timeAlive = 0
			p.size = pickSize(0)
		}
		
		function updateParticle(p){
			p.position.set(centerPos).add(p.velocity)
			var t = (p.metadata.timeAlive++) / particleLife
			p.size = pickSize(t)
		}
		
		function killParticle(p){
			return p.metadata.timeAlive > particleLife
		}
		
		var spawnCount = (function(){
			var period = 2,
				counter = 0
			return function(){
				if(counter == period){
					counter = 0
					return 1
				} else {
					counter++
					return 0
				}
			}
		})()
		
		var numParticles = particleLife
		
		var behavior = new particle.ParticleSystemBehavior(numParticles, -1)
		behavior.initParticle = initParticle
		behavior.updateParticle = updateParticle
		behavior.killParticle = killParticle
		behavior.spawnCount = spawnCount
		
		Object.defineProperty(behavior, 'color', {
			get: function(){ return color },
			set: function(c){ 
				color = c
				pickColor = falldown.util.color.randomHueShift(color)
			}
		})
		
		Object.defineProperty( behavior,'centerPos', {
			get: function(){ return centerPos }
		})
		
		return behavior
	}
	
})