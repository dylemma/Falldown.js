var canvas = document.getElementById('mainCanvas')
var context = canvas.getContext('2d')

var drawLetterbox = function(context){}

// this flag is monitored and cleared by the draw() function
var _windowResized = true
window.addEventListener('resize', function(){ _windowResized = true })

var angleToRads = Math.PI / 180
var angle = 0

var fpsTimer = new FPSTimer()
var frame = 0
var currentFps = 0

function draw() {

	var screenWidth = window.innerWidth,
		screenHeight = window.innerHeight

	// handle window resize
	if(_windowResized){
		canvas.setAttribute('width', screenWidth)
		canvas.setAttribute('height', screenHeight)
		drawLetterbox = makeLetterboxFunction(0.8, screenWidth, screenHeight)
		_windowResized = false
	}

	// clear the screen
	context.clearRect(0, 0, screenWidth, screenHeight)

	// draw the letterbox
	context.save()
	context.fillStyle = 'black'
	/*
	TODO: alternate letterbox strategy
	Instead of filling a large area in the canvas with black,
	make the page background black, and adjust the canvas size
	to match the game size. This should improve rendering
	performance by decreasing the overall size of the canvas
	*/
	drawLetterbox(context)
	context.restore()

	// draw a simple box just to check if things are working ok
	angle += 1
	if(angle > 360) angle -= 360

	// draw a green rectangle that rotates over time
	context.save()
	context.translate(screenWidth / 2, screenHeight / 2)
	context.rotate(angle * angleToRads)
	context.beginPath()
	context.rect(-50, -50, 100, 100)
	context.fillStyle = 'green'
	context.fill()
	context.stroke()
	context.restore()

	// update the FPS timer
	fpsTimer.tick(0)
	++frame
	if(frame % 10 == 0){
		currentFps = Math.round(fpsTimer.getTickRate())
	}

	context.save()
	context.font = '16px serif'
	context.fillStyle = 'green'
	context.fillText('FPS: ' + currentFps, 10, 22)
	context.restore()

}

function drawAndLoop(){
	draw()
	requestAnimationFrame(drawAndLoop)
}
requestAnimationFrame(drawAndLoop)


// utility function
function makeLetterboxFunction(gameAspectRatio, screenWidth, screenHeight){
	var gameWidth = Math.min(screenWidth, screenHeight * gameAspectRatio)
	var gameHeight = Math.min(screenHeight, screenWidth / gameAspectRatio)

	if(gameWidth < screenWidth){
		var boxWidth = (screenWidth - gameWidth) / 2
		return function(context){
			context.beginPath()
			context.rect(0, 0, boxWidth, gameHeight)
			context.rect(screenWidth - boxWidth, 0, boxWidth, gameHeight)
			context.fill()
		}
	} else {
		var boxHeight = (screenHeight - gameHeight) / 2
		return function(context){
			context.beginPath()
			context.rect(0, 0, screenWidth, boxHeight)
			context.rect(0, screenHeight - boxHeight, screenWidth, boxHeight)
			context.fill()
		}
	}
}

// utility class
function FPSTimer(){
	this.tickIntervals = new Array(120)
	this.tickIndex = -1
	this.lastTick = NaN
}
FPSTimer.prototype.tick = function(){
	// determine the duration since the last tick
	var now = Date.now()
	var duration = now - this.lastTick

	// pick the array index where the new frame value will be stored
	var tickIndex = this.tickIndex = (this.tickIndex + 1) % 120

	// store the interval in the tickIntervals array
	if(!isNaN(duration)){
		this.tickIntervals[tickIndex] = duration
	}

	// update the lastTick time
	this.lastTick = now
}
FPSTimer.prototype.getTickRate = function(){
	var count = 0,
		total = 0
	this.tickIntervals.forEach(function(interval){
		if(!isNaN(interval)){
			++count
			total += interval
		}
	})
	if(count == 0 || total == 0) return 0
	else {
		// we have the average time(ms) per frame:
		// invert it (frame per time(ms)) and multiply by 1000 to convert from ms to seconds
		return count * 1000 / total
	}
}