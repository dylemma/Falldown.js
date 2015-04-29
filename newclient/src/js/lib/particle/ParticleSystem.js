var Particle = require('./Particle')

function ParticleSystem(){
	this._freeParticles = []
	this._activeParticles = []
}

ParticleSystem.prototype.spawn = function(){
	var p = this._freeParticles.length ?
		this._freeParticles.pop() :
		new Particle()
	this._activeParticles.push(p)
	return p
}

ParticleSystem.prototype.release = function(particle){
	var i = this._activeParticles.indexOf(particle)
	if(i >= 0){
		this._activeParticles.splice(i, 1)
		particle.reset()
		this._freeParticles.push(particle)
	}
}

Object.defineProperty(ParticleSystem.prototype, 'particles', {
	get: function(){ return this._activeParticles }
})

module.exports = ParticleSystem