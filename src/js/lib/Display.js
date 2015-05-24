var letterbox = require('./letterbox')
var Rectangle = require('./Rectangle')

var canvas = document.getElementById('game-canvas')
var context = canvas.getContext('2d')

var menuDiv = document.getElementById('menu-container')

// aspectRatio = height / width
var aspectRatio = 2 / 3

// bounds rectangles for the full window and the canvas
var screenBounds = new Rectangle(0, 0, window.innerWidth, window.innerHeight)
var canvasBounds = letterbox(screenBounds, aspectRatio)

// update the bounds rects now, and whenever the window is resized
function updateCanvasPos(){
	screenBounds = new Rectangle(0, 0, window.innerWidth, window.innerHeight)
	canvasBounds = letterbox(screenBounds, aspectRatio)

	canvas.style.left = Math.floor(canvasBounds.x) + 'px'
	canvas.style.top = Math.floor(canvasBounds.y) + 'px'
	canvas.setAttribute('width', canvasBounds.width)
	canvas.setAttribute('height', canvasBounds.height)

	menuDiv.style.left = Math.floor(canvasBounds.x) + 'px'
	menuDiv.style.top = Math.floor(canvasBounds.y) + 'px'
	menuDiv.style.width = Math.floor(canvasBounds.width) + 'px'
	menuDiv.style.height = Math.floor(canvasBounds.height) + 'px'

	// fonts inside the container are 'em'-based, so we set the
	// base font-size in pixels so that they scale relatively
	// to the height of the full area
	menuDiv.style.fontSize = (canvasBounds.height / 50) + 'px'
}
updateCanvasPos()
window.addEventListener('resize', updateCanvasPos)

// bounds rectangle for the virtual space of the game
var gameBounds = new Rectangle(0, 0, 100, 150)

/**
 * Transform a screen position (x, y, as pixel coordinates)
 * to a game position, relative to the gameBounds.
 */
function screenToGameCoords(x, y, out){
	// transform x and y to pixel-relative positions to the canvas
	var relX = x - canvasBounds.x
	var relY = y - canvasBounds.y

	// relate the relative screen position to a game position
	var gameX = gameBounds.minX + relX * gameBounds.width / canvasBounds.width
	var gameY = gameBounds.minY + relY * gameBounds.height / canvasBounds.height

	out.x = gameX
	out.y = gameY
}

/**
 * Transform a 'distance' (x, y, as pixel values) to
 * a game distance, scaled relative to the gameBounds.
 */
function pixelToGameDistance(x, y, out){
	out.x = x * gameBounds.width / canvasBounds.width
	out.y = y * gameBounds.height / canvasBounds.height
}

function clearCanvas(){
	// context.fillStyle = '#fff'
	// context.fillRect(0, 0, canvas.width, canvas.height)
	context.clearRect(0, 0, canvas.width, canvas.height)
}

function scaleCanvasToGameSize(){
	var sx = canvasBounds.width / gameBounds.width
	var sy = canvasBounds.height / gameBounds.height
	context.scale(sx, sy)
}

/**
 * Returns the inverted scale factor.
 * Useful for picking line widths so that they
 * come out looking like 1 even under game scale.
 */
function inverseScale(){
	return gameBounds.width / canvasBounds.width
}

module.exports = {
	'canvas': canvas,
	'context': context,
	'screenBounds': screenBounds,
	'canvasBounds': canvasBounds,
	'gameBounds': gameBounds,

	'screenToGameCoords': screenToGameCoords,
	'pixelToGameDistance': pixelToGameDistance,
	'clearCanvas': clearCanvas,
	'scaleCanvasToGameSize': scaleCanvasToGameSize,
	'inverseScale': inverseScale
}