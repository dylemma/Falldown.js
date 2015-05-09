var Powerup = require('./Powerup')
var Particle = require('./particle/Particle')
var Mathx = require('./Mathx')
var Random = require('./Random')
var ObjectPool = require('./ObjectPool')
var GameSettings = require('./GameSettings')
var SpawnTicker = require('./SpawnTicker')

var oobThreshold = 5
var spawnInterval = 300

function PowerupSystem(gameBounds, player){
	this.gameBounds = gameBounds
	this.player = player

	// make a copy of GameSettings.colorPallatte
	var p = this.pallatte = []
	GameSettings.colorPallatte.forEach(function(c){
		p.push(c)
	})

	this.powerupPool = new ObjectPool(function(){ return new Powerup() }, 3)
	this.powerupTicker = new SpawnTicker(100)

	this.particlePool = new ObjectPool(function(){ return new Particle() }, 100)
	this.particleTicker = new SpawnTicker(1)
}

PowerupSystem.prototype.spawn = function(){
	var p = this.powerupPool.take()
	p.position.y = this.gameBounds.minY - oobThreshold
	p.position.x = Random.inRange(this.gameBounds.minX, this.gameBounds.maxX)
	p.color = this.pickColor()
	p.velocity.y = .5
	p.rotationalVelocity = Mathx.degs2rads(Random.inRange(.5, 2) * Random.negate())
}

PowerupSystem.prototype.pickColor = function(){
	// pick a random color that isn't the same as the player
	var i = this.pallatte.indexOf(this.player.color)
	var len = this.pallatte.length
	if(i > 0){
		// swap the color at `i` to the last index
		var c = this.pallatte[i]
		this.pallatte[i] = this.pallatte[len - 1]
		this.pallatte[len - 1] = c
		// decrement the len so it doesn't come up in randomization
		--len
	}
	var r = Math.floor(Math.random() * len)
	return this.pallatte[r]
}

PowerupSystem.prototype.update = function(){
	if(this.powerupTicker.tick()){
		this.spawn()
	}

	var p = null
	var itr = this.powerupPool.iterator()
	var maxY = this.gameBounds.maxY + oobThreshold
	while(p = itr.next()){
		p.update()
		if(p.position.y > maxY){
			itr.freeCurrent()
		} else {
			if(this.player.hitTestCircular(p)){
				console.log('player collect', p.color)
				this.player.color = p.color
				itr.freeCurrent()
			}
		}
	}
}

PowerupSystem.prototype.draw = function(context, invScale){
	var p = null
	var itr = this.powerupPool.iterator()
	while(p = itr.next()){
		p.draw(context, invScale)
	}
}

module.exports = PowerupSystem