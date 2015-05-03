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

	this.particlePool = new ObjectPool(function(){
		return new Particle()
	}, 61 /* 1 spawn per frame, 60 frame lifetime */)

	this.spawnTimer = 0
}

PlayerPropulsion.prototype.update = function(){
	if(this.baseColor != this.player.color){
		this.setBaseColor(this.player.color)
	}

	var spawnInterval = this.player.isShaky ? 4 : 0
	if(++this.spawnTimer > spawnInterval){
		this.spawnTimer = 0
		this.spawnParticle()
	}
	var itr = this.particlePool.iterator()
	var p = null
	while(p = itr.next()){
		p.position.add(p.velocity)
		if(++p.uptime > 60) itr.freeCurrent()
		else {
			// linear ease opacity from 0.5 to 0
			// over the lifetime of 60 frames
			p.opacity = 0.5 * (60 - p.uptime) / 60
		}
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
}

PlayerPropulsion.prototype.pickColor = function(){
	var hueShift = Random.inRange(-10, 10)
	var hue = Math.round(this.baseHSL.h + hueShift)
	var sat = this.baseHSL.s
	var lit = this.baseHSL.l
	return 'hsl(' + hue + ', ' + sat + '%, ' + lit + '%)'
}

PlayerPropulsion.prototype.updateSpawnInfo = function(){
	// put the spawn point at the player's tail
	this.spawnPoint.copy(this.player.tailPosition)

	// point the spawn direction the same way as the player
	this.spawnDir.x = 0
	this.spawnDir.y = 0.5
	this.spawnDir.rotate(this.player.rotation)
}

module.exports = PlayerPropulsion
