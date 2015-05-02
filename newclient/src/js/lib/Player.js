var Vec = require('victor')

var playerScale = 1.4
var playerHalfWidth = playerScale * 1
var playerHeight = playerScale * 10 / 3

/*
@param target {Vec}
@param bounds {Rectangle}
*/
function Player(target, bounds){
	this.target = target
	this.bounds = bounds
	this.position = target.clone()
	this.rotation = 0

	// circular buffer containing the last 3 'dx' values
	this._recentDx = [0, 0, 0]
	this._recentDxIndex = 0
}

Player.prototype.followTarget = function(){
	// Move 90% of the way to the target's X pos,
	// But don't move out of bounds
	var dx = this.target.x - this.position.x
	var oldX = this.position.x
	var x = this.position.x + (dx * 0.8)
	x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, x))
	var movedX = x - oldX
	this.position.x = x

	// insert the movement value into the _recentDx array
	this._recentDx[this._recentDxIndex++] = movedX
	this._recentDxIndex = this._recentDxIndex % 3

	// sum the _recentDx values
	var recentMovement = this._recentDx.reduce(function(a,b){ return a + b })

	// pick an angle based on the recent movement
	var angle = (Math.abs(recentMovement) > 0.1) ? recentMovement * 2 : 0
	angle = Math.max(-90, Math.min(90, angle))
	this.rotation = angle * Math.PI / 180
}

Player.prototype.draw = function(context, invScale){
	context.save()
	context.translate(this.position.x, this.position.y)
	context.rotate(this.rotation)

	context.beginPath()
	context.moveTo(0, 0)
	context.lineTo(playerHalfWidth, playerHeight)
	context.quadraticCurveTo(0, playerHeight * 0.8, -playerHalfWidth, playerHeight)
	context.closePath()

	context.fillStyle = '#fff'
	context.strokeStyle = '#000'
	context.lineWidth = invScale
	context.fill()
	context.stroke()

	context.restore()
}

module.exports = Player