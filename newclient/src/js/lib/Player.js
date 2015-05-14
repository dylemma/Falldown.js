var Vec = require('victor')
var Random = require('./Random')
var Mathx = require('./Mathx')

var playerScale = 1.4
var playerHalfWidth = playerScale * 1
var playerHeight = playerScale * 10 / 3

var tipToTailVec = new Vec(0, playerHeight * 0.8)
var scratchVec = new Vec(0, 0)

var drawHitBox = false

// lose 300 life for collecting the wrong color block
var wrongBlockDegen = 20
var wrongBlockDegenLength = 15

// gain 300 life for collecting a powerup
var powerupRegen = 5
var powerupRegenLength = 60

// gain 50 life for collecting the right color block
var rightBlockRegen = 10
var rightBlockRegenLength = 5

var passiveLifeDegen = function(timeSincePowerup){
	// Starting at 0.1 life per frame, the rate
	// goes up by another 0.1 every 300 frames.
	return 0.1 * (1 + timeSincePowerup / 300)
}

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
	this._life = 1000
	this.maxLife = 1000
	this.timeSincePowerup = 0

	// circular buffer containing the last 3 'dx' values
	this._recentDx = [0, 0, 0]
	this._recentDxIndex = 0

	this._shakeCounter = 0
	this._wrongBlockDegenTimer = 0
	this._powerupRegenTimer = 0
	this._rightBlockRegenTimer = 0
}

Object.defineProperty(Player.prototype, 'life', {
	'get': function(){ return this._life },
	'set': function(life){
		this._life = Math.max(0, Math.min(life, this.maxLife))
	}
})

Object.defineProperty(Player.prototype, 'isDead', {
	'get': function(){ return this._life == 0 }
})

Object.defineProperty(Player.prototype, 'isShaky', {
	'get': function(){ return !!this._shakeCounter }
})

Player.prototype.update = function(){
	this.followTarget()

	this.collectBlocks()

	// apply base degen
	this.life -= passiveLifeDegen(++this.timeSincePowerup)

	// apply powerup regen
	if(this._powerupRegenTimer > 0){
		--this._powerupRegenTimer
		this.life += powerupRegen
	}

	// apply wrong block degen
	if(this._wrongBlockDegenTimer > 0){
		--this._wrongBlockDegenTimer
		this.life -= wrongBlockDegen
	}

	// apply right block regen
	if(this._rightBlockRegenTimer > 0){
		--this._rightBlockRegenTimer
		this.life += rightBlockRegen
	}
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
	var rdx = this._recentDx // assume length of 3
	var recentMovement = rdx[0] + rdx[1] + rdx[2]

	// pick an angle based on the recent movement
	var angle = (Math.abs(recentMovement) > 0.1) ? recentMovement * 2 : 0
	angle = Math.max(-45, Math.min(45, angle))
	this.rotation = Mathx.degs2rads(angle)

	// update the tail pos based on the angle
	scratchVec.copy(tipToTailVec).rotate(this.rotation)
	this.tailPosition.copy(this.position).add(scratchVec)
}

Player.prototype.collectBlocks = function(){
	if(this._shakeCounter) --this._shakeCounter

	var itr = this.blockSystem.blocksPool.iterator()
	var block = null
	while(block = itr.next()){
		if(this.hitTestCircular(block)){
			itr.freeCurrent()
			if(block.color != this.color){
				this._shakeCounter = 30
				this._wrongBlockDegenTimer = wrongBlockDegenLength
			} else {
				this._rightBlockRegenTimer = rightBlockRegenLength
			}
		}
	}
}

Player.prototype.onCollectPowerup = function(powerup){
	this.color = powerup.color
	this._powerupRegenTimer = powerupRegenLength
	this.timeSincePowerup = 0
}

Player.prototype.hitTestCircular = function(circle){
	var circleX = circle.position.x
	var circleY = circle.position.y

	// rectangular model
	var xThreshold = playerHalfWidth + circle.radius
	var xDist = Math.abs(this.position.x - circleX)
	if(xDist > xThreshold) return false

	var yMin = this.position.y - circle.radius
	var yMax = this.position.y + playerHeight
	return (circleY >= yMin) && (circleY <= yMax)
}

Player.prototype.draw = function(context, invScale){
	context.save()
	context.translate(this.position.x, this.position.y)

	if(this._shakeCounter){
		scratchVec.x = 0.5
		scratchVec.y = 0
		scratchVec.rotate(Math.random() * Mathx.TAU)
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