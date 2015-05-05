var Block = require('./Block')
var Mathx = require('./Mathx')
var Random = require('./Random')
var ResourcePool = require('./ResourcePool')
var ObjectPool = require('./ObjectPool')

function BlockSystem(gameBounds){
	this.gameBounds = gameBounds
	this.pallatte = ['limegreen', 'deepskyblue', 'sandybrown', 'darkorchid', 'crimson']
	this.spawnInterval = 30
	this.oobThreshold = 5

	this._spawnTicker = 0

	this.blocksPool = new ObjectPool(function(){
		return new Block()
	}, 30)
}

BlockSystem.prototype.spawn = function(){
	var b = this.blocksPool.take()
	b.position.y = -this.oobThreshold + 1
	b.position.x = Random.inRange(this.gameBounds.minX, this.gameBounds.maxX)
	b.color = Random.fromArray(this.pallatte)
	b.velocity.y = Random.inRange(.3, 1)
	b.rotationalVelocity = Mathx.degs2rads(Random.inRange(.5, 2)) * Random.negate()
}

BlockSystem.prototype.update = function(){
	if(++this._spawnTicker >= this.spawnInterval){
		this._spawnTicker = 0
		this.spawn()
	}

	var maxY = this.gameBounds.maxY + this.oobThreshold
	var itr = this.blocksPool.iterator()
	var block = null
	while(block = itr.next()){
		block.update()
		if(block.position.y > maxY){
			itr.freeCurrent()
		}
	}
}

BlockSystem.prototype.draw = function(context, invScale){
	var itr = this.blocksPool.iterator()
	var block = null
	while(block = itr.next()){
		block.draw(context, invScale)
	}
}

module.exports = BlockSystem