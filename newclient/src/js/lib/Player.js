var Vec = require('victor')
var Random = require('./Random')

var playerScale = 1.4
var playerHalfWidth = playerScale * 1
var playerHeight = playerScale * 10 / 3

var tipToTailVec = new Vec(0, playerHeight * 0.8)
var scratchVec = new Vec(0, 0)

var drawHitBox = false

/*
@param target {Vec}
@param bounds {Rectangle}
@param blockSystem {BlockSystem}
*/
function Player(target, bounds, blockSystem){
	this.target = target
	this.bounds = bounds
	this.blockSystem = blockSystem
	this.position = target.clone()
	this.tailPosition = target.clone().add(tipToTailVec)
	this.rotation = 0
	this.height = playerHeight
	this.color = Random.fromArray(blockSystem.pallatte)

	// circular buffer containing the last 3 'dx' values
	this._recentDx = [0, 0, 0]
	this._recentDxIndex = 0

	this._shakeCounter = 0
}

Object.defineProperty(Player.prototype, 'isShaky', {
	'get': function(){ return !!this._shakeCounter }
})

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
	angle = Math.max(-45, Math.min(45, angle))
	this.rotation = angle * Math.PI / 180

	// update the tail pos based on the angle
	scratchVec.copy(tipToTailVec).rotate(this.rotation)
	this.tailPosition.copy(this.position).add(scratchVec)
}

Player.prototype.collectBlocks = function(){
	if(this._shakeCounter) --this._shakeCounter

	var itr = this.blockSystem.blocksPool.iterator()
	var block = null
	while(block = itr.next()){
		if(this.hitTest(block)){
			itr.freeCurrent()
			if(block.color != this.color){
				this._shakeCounter = 30
			}
		}
	}
}

Player.prototype.hitTest = function(block){
	var blockX = block.position.x
	var blockY = block.position.y

	// rectangular model
	var xThreshold = playerHalfWidth + block.radius
	var xDist = Math.abs(this.position.x - blockX)
	if(xDist > xThreshold) return false

	var yMin = this.position.y - block.radius
	var yMax = this.position.y + playerHeight
	return (blockY >= yMin) && (blockY <= yMax)
}

Player.prototype.draw = function(context, invScale){
	context.save()
	context.translate(this.position.x, this.position.y)

	if(this._shakeCounter){
		scratchVec.x = 0.5
		scratchVec.y = 0
		scratchVec.rotate(Math.random() * 2 * Math.PI)
		context.translate(scratchVec.x, scratchVec.y)
	}

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

	// debug drawing for the hitbox
	if(drawHitBox){
		context.save()
		context.strokeStyle = '#000'
		context.lineWidth = invScale

		context.beginPath()
		context.rect(
			this.position.x - playerHalfWidth - 1.5,
			this.position.y - 1.5,
			(playerHalfWidth + 1.5) * 2,
			playerHeight + 1.5
			)
		context.stroke()

		context.restore()
	}
}

module.exports = Player