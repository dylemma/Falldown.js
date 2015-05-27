var Vec = require('victor')
var letterbox = require('./lib/letterbox')
var Rectangle = require('./lib/Rectangle')
var Block = require('./lib/Block')
var BlockSystem = require('./lib/BlockSystem')
var PowerupSystem = require('./lib/PowerupSystem')
var Player = require('./lib/Player')
var Cursor = require('./lib/Cursor')
var Life = require('./lib/Life')
var Display = require('./lib/Display')
var Menu = require('./lib/Menu')
var Mathx = require('./lib/Mathx')
var PlayerPropulsion = require('./lib/particle/PlayerPropulsion')

var gameBounds = Display.gameBounds
var gamePointer = new Vec(50, 110)
var blockSystem = new BlockSystem(gameBounds)

var player = new Player(gamePointer, gameBounds, blockSystem)
var cursor = new Cursor(gamePointer, gameBounds)
var life = new Life(player, gameBounds)

var powerupSystem = new PowerupSystem(gameBounds, player)

var playerPropulsion = new PlayerPropulsion(player)

var context = Display.context

// Update the `gamePointer` vector as the mouse moves
window.addEventListener('mousemove', function(e){
	Display.screenToGameCoords(e.clientX, e.clientY, gamePointer)
})

// Game State Tracking
var gameStarted = false
var gamePaused = false

// Open the menu by pressing Space
window.addEventListener('keydown', function(e){
	if(Menu.state == Menu.CLOSED && e.keyCode == 32) Menu.open()
})

var menuStart = document.getElementById('menuStart')
var menuContinue = document.getElementById('menuContinue')

Menu.events.on('open', function(){ gamePaused = true })
Menu.events.on('close', function(){ gamePaused = false })
Menu.events.on('select', function(item){
	var id = item.id
	if(id == 'menuClose') Menu.close()

	// start a new game
	if(item == menuStart){
		gameStarted = true
		player.startIntroTransition()
		Menu.close(function(){
			menuContinue.style.display = 'block'
			menuStart.style.display = 'none'
		})
	}

	// unpause
	if(item == menuContinue){
		Menu.close()
	}
})

function gameLoop(){

	// clear the game area
	Display.clearCanvas()

	context.save()
	// scale the context so that the gameBounds dimensions match the canvasBounds
	Display.scaleCanvasToGameSize()
	var invScale = Display.inverseScale()

	if(gameStarted) {
		if(!gamePaused){
			player.update()
			blockSystem.update()
			powerupSystem.update()
			playerPropulsion.update()
		}

		cursor.draw(context, invScale)
		blockSystem.draw(context, invScale)
		powerupSystem.draw(context, invScale)
		playerPropulsion.draw(context, invScale)
		player.draw(context, invScale)
		life.draw(context, invScale)
	}

	if(player.isDead){
		// for testing's sake, just revive the player
		player.life = player.maxLife
	}


	context.restore()


	requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)