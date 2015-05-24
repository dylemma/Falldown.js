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
	this.particlePool = new ObjectPool(function(){
		var p = new Particle()
		// control points for a cubic bezier curve upon collection
		p._collected = false
		p._collectionTick = 0
		p._collectionStartPos = new Vec(0, 0)
		p._collectionControl1 = new Vec(0, 0)
		p._collectionControl2 = new Vec(0, 0)
		p._collectionTarget = null
		return p
	}, 241)
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
	p.velocity.y += 0.25
	p.color = pickColor(powerup)
	p.opacity = 0.15
	p.scale = 1.5

	p._powerupId = powerup._powerupId

	p._collected = false
	p._collectionTick = 0
	p._collectionTarget = null

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
			setParticleCollected(p, collectorPos)
		}
	}
}

function setParticleCollected(particle, target){
	particle._collected = true
	particle._collectionTick = 0
	particle._collectionDuration = Random.inRange(40, 60)
	particle._collectionTarget = target
	particle._collectionStartPos.copy(particle.position)

	// determine if the velocity is pointing away or towards the target
	scratchVec.copy(target).subtract(particle.position)
	var dot = scratchVec.dot(particle.velocity)
	var cross = scratchVec.cross(particle.velocity)

	// scratchVec = velocity * 30
	scratchVec.copy(particle.velocity)
	scratchVec.x *= 30
	scratchVec.y *= 30

	if(dot < 0){
		// facing away: add a slight perpendicular offset on control point 2
		particle._collectionControl1.copy(particle.position).add(scratchVec)
		scratchVec.rotateByDeg(cross < 0 ? -90 : 90)
		scratchVec.x *= 2
		scratchVec.y *= 2
		particle._collectionControl2.copy(particle._collectionControl1).add(scratchVec)
	} else {
		// facing target: both control points are the same
		particle._collectionControl1.copy(particle.position).add(scratchVec)
		particle._collectionControl2.copy(particle._collectionControl1)
	}
}

PowerupParticles.prototype.update = function(){
	var itr = null

	// spawn 4 particles every tick
	if(this.spawnTicker.tick()){
		var powerup = null
		itr = this.powerupSystem.powerupPool.iterator()
		while(powerup = itr.next()){
			for(var i=0; i<4; ++i) this.spawn(powerup)
		}
	}

	var p = null
	itr = this.particlePool.iterator()
	var first = true
	while(p = itr.next()){
		if(p._collected){
			// follow a cubic bezier curve to the 'target',
			// using control points that were set up when
			// the particle was collected
			var t = ++p._collectionTick / p._collectionDuration
			if(t > 1){
				itr.freeCurrent()
			} else {
				Mathx.cubicBezier(
					p._collectionStartPos,
					p._collectionControl1,
					p._collectionControl2,
					p._collectionTarget,
					t,
					p.position)
				if(first){
					first = false
				}
			}

		} else {
			// move the particle along its velocity
			p.position.add(p.velocity)
			if(++p.uptime > 60) itr.freeCurrent()
			p.opacity = 0.15 * Math.cos(Math.PI * p.uptime / 120)
		}
	}
}

module.exports = PowerupParticles