withNamespace('falldown.particle', function(particle){

	//linear easing from 0.5 to 1
	var pickSize = (function(){
		var e = d3.ease('linear')
		return function(t){ return (1 + e(t)) * 0.5 }
	})()
	
	//linear easing from 1 to 0
	var pickOpacity = (function(){
		var e = d3.ease('linear')
		return function(t){ return 1 - e(t) }
	})()

	//creates a color picker function that will randomly shift the hue by 15 degrees
	var colorPicker = function(initialColor){
		var colorFunc = function(){ return initialColor || 'orange' }
		var setColor = function(colorOrFunc){
			if(typeof colorOrFunc === 'function') colorFunc = colorOrFunc
			colorFunc = function(){ return colorOrFunc }
		}
		var picker = function(){
			var color = d3.hsl(colorFunc())
			var r = Random.nextInt(3) // = 0, 1, or 2
			if(r == 2) color.h += 15
			if(r == 1) color.h -= 15
			return color.toString()
		}
		
		picker.setColor = setColor
		return picker
	}
	
	var particleEmitter = function(emitFrom, direction, particleLife){
		var emitPos = (function(){
			if(typeof emitFrom == 'function') return emitFrom
			else return function(){ return emitFrom }
		})()
		
		var emitDirection = (function(){
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
		
		var pickColor = colorPicker()
		
		function initParticle(p){
			p.color = pickColor()
			p.position.set(emitPos())
			p.metadata.direction = emitDirection(new geom.Vector())
			p.metadata.timeAlive = 0
			p.size = pickSize(0)
			p.opacity = pickOpacity(0)
		}
		
		function updateParticle(p){
			var t = (p.metadata.timeAlive++) / particleLife
			p.size = pickSize(t)
			p.opacity = pickOpacity(t)
			p.position.addSelf(p.metadata.direction)
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
		behavior.changeColor = pickColor.setColor
		
		return behavior
	}
	
	particle.emitter = particleEmitter

})