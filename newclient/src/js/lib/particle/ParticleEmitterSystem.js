var Particle = require('./Particle')
var ParticleSystem = require('./ParticleSystem')
var Random = require('../Random')

function ParticleEmitterSystem(spawnPoint, baseDirection, spread, particleLife){
	this.spawnPoint = spawnPoint
	this.baseDirection = baseDirection
	this.spread = spread
	this.particleLife = particleLife
	this._system = new ParticleSystem()
	this._counter = 0
}

ParticleEmitterSystem.prototype.initParticle = function(particle){
	particle.color = 'orange' // TODO: random hue shift
	particle.position.copy(this.spawnPoint)

	var spread = Random.inRange(-this.spread, this.spread)
	particle.velocity.copy(this.baseDirection).rotate(spread)
}

ParticleEmitterSystem.prototype.update = function(){
	var _this = this
	if(++this._counter % 3 == 0){
		this.initParticle(this._system.spawn())
	}
	var toRelease = []
	var seen = {}
	this._system.particles.forEach(function(p){
		p.position.add(p.velocity)
		if(++p.uptime > _this.particleLife) toRelease.push(p)
		if(p.id in seen){
			console.log('already updated ', p.id)
		} else {
			seen[p.id] = 1
		}
	})
	toRelease.forEach(function(p){
		_this._system.release(p)
	})
}

ParticleEmitterSystem.prototype.draw = function(context){
	var drawParticle = Particle.defaultRenderer
	this._system.particles.forEach(function(p){
		drawParticle(context, p)
	})
}

module.exports = ParticleEmitterSystem