withNamespace('falldown.particle', function(particle){

	var pickSize = falldown.ease('linear').from(.5).to(1)
	var pickOpacity = falldown.ease('linear').from(1).to(0)
	
	var particleEmitter = function(emitFrom, direction, particleLife){
		var emitPos = (function(){
			if(typeof emitFrom == 'function') return emitFrom
			else return function(){ return emitFrom }
		})()
		
		var emitDirection = (function(){
			var scrap = geom.Vector.scrap
			var spread = 0.2
			
			return function(v){
				scrap.set(direction).normalize()
				v.set(scrap)
				scrap.set(scrap.y, -scrap.x).scale(Random.next(-spread, spread))
				v.add(scrap)
				return v
			}
		})()
		
		var pickColor = falldown.util.color.randomHueShift('orange')
		
		function initParticle(p){
			p.color = pickColor()
			p.position.set(emitPos())
			emitDirection(p.velocity)
			p.metadata.timeAlive = 0
			p.size = pickSize(0)
			p.opacity = pickOpacity(0)
		}
		
		function updateParticle(p){
			var t = (p.metadata.timeAlive++) / particleLife
			p.size = pickSize(t)
			p.opacity = pickOpacity(t)
			p.position.add(p.velocity)
		}
		
		function killParticle(p){
			return p.metadata.timeAlive > particleLife
		}
		
		function spawnCount(){ return 1 }
		
		var numParticles = (particleLife * 1) + 1
		
		var behavior = new particle.ParticleSystemBehavior(numParticles, -1)
		behavior.initParticle = initParticle
		behavior.updateParticle = updateParticle
		behavior.killParticle = killParticle
		behavior.spawnCount = spawnCount
		behavior.setColor = function(c){
			pickColor = falldown.util.color.randomHueShift(c)
		}
		
		return behavior
	}
	
	particle.emitter = particleEmitter

})