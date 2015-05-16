var Vec = require('victor')
var letterbox = require('./lib/letterbox')
var Rectangle = require('./lib/Rectangle')
var Block = require('./lib/Block')
var BlockSystem = require('./lib/BlockSystem')
var PowerupSystem = require('./lib/PowerupSystem')
var ResourcePool = window.ResourcePool = require('./lib/ResourcePool')
var Player = require('./lib/Player')
var Cursor = require('./lib/Cursor')
var Life = require('./lib/Life')
var Display = require('./lib/Display')

var gameBounds = Display.gameBounds
var gamePointer = new Vec(50, 110)
var blockSystem = new BlockSystem(gameBounds)

var player = new Player(gamePointer, gameBounds, blockSystem)
var cursor = new Cursor(gamePointer, gameBounds)
var life = new Life(player, gameBounds)

var powerupSystem = new PowerupSystem(gameBounds, player)

var PlayerPropulsion = require('./lib/particle/PlayerPropulsion')
var playerPropulsion = new PlayerPropulsion(player)

var context = Display.context

// Update the `gamePointer` vector as the mouse moves
window.addEventListener('mousemove', function(e){
	Display.screenToGameCoords(e.clientX, e.clientY, gamePointer)
})

function gameLoop(){

	// clear the game area
	Display.clearCanvas()

	context.save()
	// scale the context so that the gameBounds dimensions match the canvasBounds
	Display.scaleCanvasToGameSize()
	var invScale = Display.inverseScale()

	cursor.draw(context, invScale)

	player.update()

	blockSystem.update()
	blockSystem.draw(context, invScale)

	powerupSystem.update()
	powerupSystem.draw(context, invScale)

	playerPropulsion.update()
	playerPropulsion.draw(context, invScale)

	player.draw(context, invScale)

	if(player.isDead){
		// for testing's sake, just revive the player
		player.life = player.maxLife
	}
	life.draw(context, invScale)

	context.restore()


	requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)