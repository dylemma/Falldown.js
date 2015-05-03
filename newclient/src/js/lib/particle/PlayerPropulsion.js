var Particle = require('./Particle')
var Random = require('../Random')
var Color = require('../Color')
var ObjectPool = require('../ObjectPool')
var Vec = require('victor')

var scratchVec = new Vec(0,0)
var spreadRadians = 10 * Math.PI / 180

function PlayerPropulsion(player){
	this.player = player

	// initial spawn info
	this.spawnPoint = new Vec(0, 0)
	this.spawnDir = new Vec(0, 1)

	// initialize the base color/hsl values
	this.baseColor = undefined
	this.baseHSL = {}
	this.setBaseColor('orange')
	this._colorRotation = 0

	this.particlePool = new ObjectPool(function(){
		return new Particle()
	}, 61 /* 1 spawn per frame, 60 frame lifetime */)

	this.spawnTimer = 0
}

PlayerPropulsion.prototype.update = function(){
	if(++this.spawnTimer > 0){
		this.spawnTimer = 0
		this.spawnParticle()
	}
	var itr = this.particlePool.iterator()
	var p = null
	while(p = itr.next()){
		p.position.add(p.velocity)
		if(++p.uptime > 60) itr.freeCurrent()
	}
}

PlayerPropulsion.prototype.draw = function(context){
	var draw = Particle.defaultRenderer
	var itr = this.particlePool.iterator()
	var p = null
	var count = 0
	while(p = itr.next()){
		++count
		draw(context, p)
	}
}

PlayerPropulsion.prototype.spawnParticle = function(){
	this.updateSpawnInfo()
	var p = this.particlePool.take()
	p.reset()
	p.color = this.pickColor()
	p.position.copy(this.spawnPoint)
	var spread = Random.inRange(-spreadRadians, spreadRadians)
	p.velocity.copy(this.spawnDir).rotate(spread)
}

PlayerPropulsion.prototype.setBaseColor = function(cssColor){
	this.baseColor = cssColor
	var c = this.baseHSL
	Color.computeRgb(cssColor, function(r,g,b){
		Color.rgbToHsl(r,g,b, function(h,s,l){
			c.h = Math.round(h * 360)
			c.s = Math.round(s * 100)
			c.l = Math.round(l * 100)
		})
	})
	console.log('baseColor:', JSON.stringify(c))
}

PlayerPropulsion.prototype.pickColor = function(){
	var hueShift = Random.inRange(-10, 10)
	var hue = Math.round(this.baseHSL.h + hueShift)
	var sat = this.baseHSL.s
	var lit = this.baseHSL.l
	return 'hsl(' + hue + ', ' + sat + '%, ' + lit + '%)'
}

PlayerPropulsion.prototype.updateSpawnInfo = function(){
	// put the spawn point at the middle of the player's curved base
	scratchVec.x = 0
	scratchVec.y = this.player.height * 0.8
	scratchVec.rotate(this.player.rotation)
	this.spawnPoint.copy(this.player.position).add(scratchVec)

	// point the spawn direction the same way as the player
	this.spawnDir.x = 0
	this.spawnDir.y = 0.5
	this.spawnDir.rotate(this.player.rotation)
}

module.exports = PlayerPropulsion
