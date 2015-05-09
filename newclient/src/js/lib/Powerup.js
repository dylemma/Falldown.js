var Vec = require('victor')
var Mathx = require('./Mathx')

function Powerup(){
	this.position = new Vec(0, 0)
	this.velocity = new Vec(0, 0)
	this.rotation = 0
	this.rotationalVelocity = 0
	this.color = '#666'
	this.radius = 2
}

Powerup.prototype.update = function(){
	this.position.add(this.velocity)
	this.rotation += this.rotationalVelocity
	if(this.rotation > Mathx.TAU) this.rotation -= Mathx.TAU
	if(this.rotation < 0) this.rotation += Mathx.TAU
}

Powerup.prototype.draw = function(context, invScale){
	context.save()
	context.translate(this.position.x, this.position.y)
	context.rotate(this.rotation)

	context.beginPath()
	context.fillStyle = this.color
	context.strokeStyle = '#000'
	context.lineWidth = invScale
	var r = this.radius
	var d = Mathx.TAU / 18
	context.moveTo(r, 0)
	for(var i=1; i<18; i++){
		var a = i % 2 ? 0.7 : 1
		var x = Math.cos(i * d) * r * a
		var y = Math.sin(i * d) * r * a
		context.lineTo(x, y)
	}
	context.closePath()
	context.fill()
	context.stroke()

	context.restore()
}

module.exports = Powerup