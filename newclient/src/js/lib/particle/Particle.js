var Vec = require('victor')
var Mathx = require('../Mathx')
var particleId = 0

function Particle(){
	this.id = particleId++
	this.position = new Vec(0, 0)
	this.velocity = new Vec(0, 0)
	this.rotation = 0
	this.color = 'red'
	this.scale = 1
	this.opacity = 0.5
	this.uptime = 0
}

Particle.prototype.reset = function(){
	this.position.x = this.position.y = 0
	this.velocity.x = this.velocity.y = 0
	this.rotation = 0
	this.color = 'red'
	this.scale = 1
	this.opacity = 0.5
	this.uptime = 0
}

Particle.defaultRenderer = function(context, particle){
	context.save()
	context.translate(particle.position.x, particle.position.y)
	context.rotate(particle.rotation)
	context.globalAlpha = particle.opacity
	context.fillStyle = particle.color

	context.beginPath()
	context.arc(0, 0, particle.scale, 0, Mathx.TAU)
	context.fill()

	context.restore()
}

module.exports = Particle