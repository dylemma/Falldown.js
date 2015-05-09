var Block = require('./Block')
var Mathx = require('./Mathx')
var Random = require('./Random')
var ObjectPool = require('./ObjectPool')
var GameSettings = require('./GameSettings')
var SpawnTicker = require('./SpawnTicker')

function BlockSystem(gameBounds){
	this.gameBounds = gameBounds
	this.pallatte = GameSettings.colorPallatte
	this.oobThreshold = 5

	this.blockTicker = new SpawnTicker(30)
	this.blocksPool = new ObjectPool(function(){
		return new Block()
	}, 30)
}

BlockSystem.prototype.spawnBlock = function(){
	var b = this.blocksPool.take()
	b.position.y = -this.oobThreshold + 1
	b.position.x = Random.inRange(this.gameBounds.minX, this.gameBounds.maxX)
	b.color = Random.fromArray(this.pallatte)
	b.velocity.y = Random.inRange(.3, 1)
	b.rotationalVelocity = Mathx.degs2rads(Random.inRange(.5, 2)) * Random.negate()
}

BlockSystem.prototype.update = function(){
	// occasionally spawn blocks
	this.blockTicker.tick() && this.spawnBlock()

	// move the blocks downward
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