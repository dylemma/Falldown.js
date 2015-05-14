var Vec = require('victor')
var Mathx = require('./Mathx')
var Random = require('./Random')
var scratch = new Vec(0, 0)

function Life(player, gameBounds){
	this.player = player
	this.gameBounds = gameBounds
}



Life.prototype.draw = function(context, invScale){

	var player = this.player
	var gb = this.gameBounds

	// draw a white BG behind the life bar
	context.fillStyle = '#fff'
	context.fillRect(
		gb.minX,
		gb.maxY - 4,
		gb.width,
		4)

	// draw the life fill (maybe shaky)
	context.save()
	if(player.isShaky){
		scratch.x = 0.5
		scratch.y = 0
		scratch.rotate(Math.random() * Mathx.TAU)
		context.translate(scratch.x, scratch.y)
	}
	var lifeRatio = player.life / player.maxLife
	context.fillStyle = player.color
	context.fillRect(
		gb.minX + 1,
		gb.maxY - 3,
		(gb.width - 2) * lifeRatio,
		2)

	context.restore()

	// draw a blank outline of the full life bar
	context.strokeStyle = '#000'
	context.lineWidth = invScale
	context.strokeRect(
		gb.minX + 1,
		gb.maxY - 3,
		gb.width - 2,
		2)
}

module.exports = Life