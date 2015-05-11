var Random = require('../Random')
var ObjectPool = require('../ObjectPool')
var Particle = require('./Particle')
var Mathx = require('../Mathx')
var Vec = require('victor')
var SpawnTicker = require('../SpawnTicker')
var Color = require('../Color')

var scratchVec = new Vec(0, 0)
var scratch2 = new Vec(0, 0)
var renderParticle = Particle.defaultRenderer //Particle.lineRenderer(6)

function PowerupParticles(powerupSystem){
	this.powerupSystem = powerupSystem
	this.particlePool = new ObjectPool(function(){ return new Particle() }, 60)
	this.spawnTicker = new SpawnTicker(1)
}

PowerupParticles.prototype.draw = function(context, invScale){
	var p = null
	var itr = this.particlePool.iterator()
	while(p = itr.next()){
		renderParticle(context, p, invScale)
	}
}

PowerupParticles.prototype.spawn = function(powerup){
	var p = this.particlePool.take()
	p.reset()
	p.position.copy(powerup.position)
	var angle = Math.random() * Mathx.TAU
	p.velocity.x = .4
	p.velocity.y = 0
	p.velocity.rotate(angle)
	p.velocity.y += 0.4
	p.rotation = angle
	p.color = pickColor(powerup)
	p.opacity = 0.1
	p.scale = 2

	// store some info that helps determine
	// how to behave when the powerup gets collected
	p._powerupId = powerup._powerupId
	p._followingTarget = null // eventually a Vec
	p._followingTargetTimer = 0

}

var hslCache = {}
function pickColor(powerup){
	var hsl = hslCache[powerup.color]
	if(!hsl){
		Color.computeRgb(powerup.color, function(r,g,b){
			Color.rgbToHsl(r,g,b, function(h,s,l){
				hsl = {
					'h': Math.round(h * 360),
					's': Math.round(s * 100),
					'l': Math.round(l * 100)
				}
				hslCache[powerup.color] = hsl
			})
		})
	}
	var hueShift = Random.inRange(-20, 20)
	var hue = Math.round(hsl.h + hueShift)
	return 'hsl(' + hue + ', ' + hsl.s + '%, ' + hsl.l + '%)'
}

PowerupParticles.prototype.setCollected = function(powerupId, collectorPos){
	var p = null
	var itr = this.particlePool.iterator()
	while(p = itr.next()){
		if(p._powerupId == powerupId){
			p._followingTarget = collectorPos
			p._followingTargetTimer = 0
			p._startFollowingTime = Math.floor(Random.inRange(10, 20))
		}
	}
}

PowerupParticles.prototype.update = function(){
	var itr = null

	if(this.spawnTicker.tick()){
		var powerup = null
		itr = this.powerupSystem.powerupPool.iterator()
		while(powerup = itr.next()){
			this.spawn(powerup); this.spawn(powerup); this.spawn(powerup); this.spawn(powerup)
		}
	}

	var p = null
	itr = this.particlePool.iterator()
	while(p = itr.next()){
		if(p._followingTarget){
			// move the particle towards its target


			// scale scratchVec by an amount that increases as the timer goes up
			// var vAngle = p.velocity.horizontalAngle()
			// var tAngle = scratchVec.horizontalAngle()

			// var angle1 = tAngle - vAngle
			// var angle2 = tAngle + Mathx.TAU - vAngle
			// var angle = Math.abs(angle1) < Math.PI ? angle1 : angle2
			// var turnAmt = Mathx.degs2rads(1)
			// var turnAngle = Math.abs(angle) < turnAmt ? angle : angle < 0 ? -turnAmt : turnAmt

			var t = ++p._followingTargetTimer
			if(t > p._startFollowingTime){
				var dt = t - p._startFollowingTime

				// scratchVec = particle to target
				scratchVec.copy(p._followingTarget).subtract(p.position)
				var s = dt / 20
				var sInv = 1 / s
				
				scratchVec.x *= s
				scratchVec.y *= s
				p.position.add(scratchVec)

				p.velocity.x *= .8
				p.velocity.y *= .8
				p.opacity *= .9

				if(dt > 20) itr.freeCurrent()
			}
			// var d = p.position.distance(p._followingTarget)
			p.position.add(p.velocity)

			if(p.position.distance(p._followingTarget) < 1.5){
				itr.freeCurrent()
			}
			
		} else {
			// move the particle along its velocity
			p.position.add(p.velocity)
			if(++p.uptime > 60) itr.freeCurrent()
		}
	}
}

module.exports = PowerupParticles