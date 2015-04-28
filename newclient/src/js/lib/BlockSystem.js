var Block = require('./Block')
var Random = require('./Random')
var ResourcePool = require('./ResourcePool')

var degToRad = Math.PI / 180

function BlockSystem(gameBounds){
	this.gameBounds = gameBounds
	this.pallatte = ['limegreen', 'deepskyblue', 'sandybrown', 'darkorchid', 'crimson']
	this.spawnInterval = 30
	this.oobThreshold = 5

	this._spawnTicker = 0

	this._blocksPool = new ResourcePool(function(){
		return new Block()
	})
}

BlockSystem.prototype.initBlock = function(block){
	block.position.y = -this.oobThreshold + 1
	block.position.x = Random.inRange(this.gameBounds.minX, this.gameBounds.maxX)
	block.color = Random.fromArray(this.pallatte)
	block.velocity.y = Random.inRange(.3, 1)

	var r = Random.inRange(.5 * degToRad, 2 * degToRad) * Random.negate()
	block.rotationalVelocity = r
}

BlockSystem.prototype.update = function(){
	if(++this._spawnTicker >= this.spawnInterval){
		this._spawnTicker = 0
		var newBlock = this._blocksPool.spawn()
		this.initBlock(newBlock)
	}

	var maxY = this.gameBounds.maxY + this.oobThreshold
	var _this = this
	this._blocksPool.iterate(function(block){
		block.update()
		if(block.position.y > maxY){
			return true
		}
	})
}

BlockSystem.prototype.draw = function(context, invScale){
	this._blocksPool.iterate(function(block){
		block.draw(context, invScale)
	})
}

module.exports = BlockSystem