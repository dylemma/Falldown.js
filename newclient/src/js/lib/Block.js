var Vec = require('victor')
var twoPi = Math.PI * 2

function Block(){
	this.position = new Vec(0, 0)
	this.velocity = new Vec(0, 0)
	this.rotation = 0
	this.rotationalVelocity = 0
	this.color = '#666'
	this.radius = 1.5
}

Block.prototype.update = function(){
	this.position.add(this.velocity)
	this.rotation += this.rotationalVelocity
	if(this.rotation > twoPi) this.rotation -= twoPi
	if(this.rotation < -twoPi) this.rotation += twoPi
}

Block.prototype.draw = function(context, invScale){
	context.save()
	context.translate(this.position.x, this.position.y)
	context.rotate(this.rotation)

	context.beginPath()
	context.fillStyle = this.color
	context.strokeStyle = '#000'
	context.lineWidth = invScale
	var r = this.radius
	var s = r + r
	context.rect(-r, -r, s, s)
	context.fill()
	context.stroke()

	context.restore()
}

module.exports = Block