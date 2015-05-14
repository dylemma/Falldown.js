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

var screenBounds = new Rectangle(0, 0, window.innerWidth, window.innerHeight)
var canvasBounds = letterbox(screenBounds, 2/3)

var gameBounds = new Rectangle(0, 0, 100, 150)
var gamePointer = new Vec(50, 110)
var blockSystem = new BlockSystem(gameBounds)

var player = new Player(gamePointer, gameBounds, blockSystem)
var cursor = new Cursor(gamePointer, gameBounds)
var life = new Life(player, gameBounds)

var powerupSystem = new PowerupSystem(gameBounds, player)

var PlayerPropulsion = require('./lib/particle/PlayerPropulsion')
var playerPropulsion = new PlayerPropulsion(player)

var canvas = document.getElementById('game-canvas')
var context = canvas.getContext('2d')

function updateCanvasPos(){
	screenBounds = new Rectangle(0, 0, window.innerWidth, window.innerHeight)
	canvasBounds = letterbox(screenBounds, 2/3)

	canvas.style.left = Math.floor(canvasBounds.x) + 'px'
	canvas.style.top = Math.floor(canvasBounds.y) + 'px'
	canvas.setAttribute('width', canvasBounds.width)
	canvas.setAttribute('height', canvasBounds.height)
}
updateCanvasPos()
window.addEventListener('resize', updateCanvasPos)

// Update the `gamePointer` vector as the mouse moves
window.addEventListener('mousemove', function(e){
	// pixel position relative to the canvas origin
	var gamePixelX = e.clientX - canvasBounds.x
	var gamePixelY = e.clientY - canvasBounds.y

	// transform relative position from screen scale to game scale
	var gameX = gameBounds.minX + gamePixelX * gameBounds.width / canvasBounds.width
	var gameY = gameBounds.minY + gamePixelY * gameBounds.height / canvasBounds.height

	gamePointer.x = gameX
	gamePointer.y = gameY
})

function gameLoop(){

	// clear the game area
	context.fillStyle = '#fff'
	context.fillRect(0, 0, canvas.width, canvas.height)

	context.save()
	// scale the context so that the gameBounds dimensions match the canvasBounds
	context.scale(
		canvasBounds.width / gameBounds.width,
		canvasBounds.height / gameBounds.height
	)
	var invScale = gameBounds.width / canvasBounds.width

	cursor.draw(context)

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