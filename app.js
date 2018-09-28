(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
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
},{"./lib/Block":3,"./lib/BlockSystem":4,"./lib/Cursor":6,"./lib/Display":7,"./lib/Life":9,"./lib/Mathx":10,"./lib/Menu":11,"./lib/Player":13,"./lib/PowerupSystem":15,"./lib/Rectangle":17,"./lib/letterbox":19,"./lib/particle/PlayerPropulsion":22,"victor":"victor"}],3:[function(require,module,exports){
var Vec = require('victor')
var Mathx = require('./Mathx')

function Block(){
	this.position = new Vec(0, 0)
	this.velocity = new Vec(0, 0)
	this.rotation = 0
	this.rotationalVelocity = 0
	this.color = '#666'
	this.radius = 1.5
}

Block.prototype.update = function(){
	this.position.add(this.velocity)
	this.rotation += this.rotationalVelocity
	if(this.rotation > Mathx.TAU) this.rotation -= Mathx.TAU
	if(this.rotation < 0) this.rotation += Mathx.TAU
}

Block.prototype.draw = function(context, invScale){
	context.save()
	context.translate(this.position.x, this.position.y)
	context.rotate(this.rotation)

	context.beginPath()
	context.fillStyle = this.color
	context.strokeStyle = '#000'
	context.lineWidth = invScale
	var r = this.radius
	var s = r + r
	context.rect(-r, -r, s, s)
	context.fill()
	context.stroke()

	context.restore()
}

module.exports = Block
},{"./Mathx":10,"victor":"victor"}],4:[function(require,module,exports){
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
},{"./Block":3,"./GameSettings":8,"./Mathx":10,"./ObjectPool":12,"./Random":16,"./SpawnTicker":18}],5:[function(require,module,exports){
/*
Take a css color string (e.g. 'blue', '#fff', etc)
and compute the RGB value of that color, passing
the R, G, and B values back as arguments to the
`rgbCallback` function.
*/
function computeRgb(cssColor, rgbCallback){
	colorDiv.style.color = cssColor
	var computedColor = colorDivStyle.color
	var rgbMatch = rgbRegex.exec(computedColor)
	if(rgbMatch){
		// rgbMatch = [computedColor, 'rr', 'gg', 'bb']
		rgbCallback(+rgbMatch[1], +rgbMatch[2], +rgbMatch[3])
	} else {
		console.error('Failed to parse computed color:', computedColor)
		rgbCallback(0, 0, 0)
	}
}
exports.computeRgb = computeRgb

/*
Utilities for `computeRgb`.
The `colorDiv` goes in the DOM invisibly,
and whenever its `.style.color` is changed,
the corresponding `colorDivStyle` will be
updated. The `rgbRegex` can be used to parse
out the computed RGB values.
*/
var colorDiv = document.createElement('div')
colorDiv.style.display = 'none'
document.body.appendChild(colorDiv)
var colorDivStyle = getComputedStyle(colorDiv)
var rgbRegex = /rgb\((\d+), (\d+), (\d+)\)/

/*
Converts an RGB color to HSL.
Assumes r, g, and b are in [0, 255].
Passes the h, s, and l values (which are in [0, 1]) to the hslCallback.
Adapted from http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
*/
function rgbToHsl(r, g, b, hslCallback){
	r /= 255, g /= 255, b /= 255
	var max = Math.max(r, g, b), min = Math.min(r, g, b)
	var h, s, l = (max + min) / 2

	if(max == min){
		h = s = 0 // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
		switch(max){
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}
		h /= 6
	}

	hslCallback(h, s, l)
}
exports.rgbToHsl = rgbToHsl

/*
Converts an HSL color to RGB.
Assumes h, s, and l are in [0, 1].
Passes the r, g, and b values (which are in [0, 255]) to the rgbCallback.
Adapted from http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
*/
function hslToRgb(h, s, l, rgbCallback){
	var r, g, b
	if(s == 0){
		r = g = b = 1 // achromatic
	} else {
		function hueToRgb(p, q, t){
			if(t < 0) t += 1
			if(t > 1) t -= 1
			if(t < 1/6) return p + (q - p) * 6 * t
			if(t < 1/2) return q
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6
			return p
		}
		var q = l < 0.5 ? l * (1 + s) : l + s - l * s
		var p = 2 * l - q
		r = hueToRgb(p, q, h + 1/3)
		g = hueToRgb(p, q, h)
		b = hueToRgb(p, q, h - 1/3)
	}
	rgbCallback(r * 255, g * 255, b * 255)
}
exports.hslToRgb = hslToRgb
},{}],6:[function(require,module,exports){
function Cursor(targetVec, bounds){
	this.targetVec = targetVec
	this.bounds = bounds
}

Cursor.prototype.draw = function(context, invScale){
	var bounds = this.bounds
	var x = this.targetVec.x
	var y = this.targetVec.y

	context.save()

	context.beginPath()

	// horizontal line
	context.moveTo(bounds.minX, y)
	context.lineTo(bounds.maxX, y)

	// vertical line
	context.moveTo(x, bounds.minY)
	context.lineTo(x, bounds.maxY)

	context.globalAlpha = 0.4
	context.strokeStyle = '#ccc'
	context.lineWidth = invScale * 2
	context.stroke()

	context.restore()
}

module.exports = Cursor
},{}],7:[function(require,module,exports){
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
},{"./Rectangle":17,"./letterbox":19}],8:[function(require,module,exports){
exports.colorPallatte = [
	'limegreen',
	'deepskyblue',
	'sandybrown',
	'darkorchid',
	'crimson'
]
},{}],9:[function(require,module,exports){
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
		gb.minY,
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
		gb.minY + 1,
		(gb.width - 2) * lifeRatio,
		2)

	context.restore()

	// draw a blank outline of the full life bar
	context.strokeStyle = '#000'
	context.lineWidth = invScale
	context.strokeRect(
		gb.minX + 1,
		gb.minY + 1,
		gb.width - 2,
		2)
}

module.exports = Life
},{"./Mathx":10,"./Random":16,"victor":"victor"}],10:[function(require,module,exports){
var tau = Math.PI * 2
exports.TAU = tau

var radsPerDeg = Math.PI / 180
exports.RADS_PER_DEG = radsPerDeg

var degsPerRad = 180 / Math.PI
exports.DEGS_PER_RAD = degsPerRad

function degs2rads(degs){ return degs * radsPerDeg }
exports.degs2rads = degs2rads

function rads2degs(rads){ return rads * degsPerRad }
exports.rads2degs = rads2degs

/**
 * Calculates a point along a cubic bezier curve.
 *
 * @param {Vec} a - The starting point
 * @param {Vec} c1 - The first control point
 * @param {Vec} c2 - The second control point
 * @param {Vec} b - The end point
 * @param {Number} t - The ratio of time along the curve, in [0, 1]
 * @param {Vec} out - The x and y results will be stored to this vector
 */
function cubicBezier(a, c1, c2, b, t, out){
	var b1 = (1-t)*(1-t)*(1-t)
	var b2 = 3*t*(1-t)*(1-t)
	var b3 = 3*t*t*(1-t)
	var b4 = t*t*t

	out.x = a.x*b1 + c1.x*b2 + c2.x*b3 + b.x*b4
	out.y = a.y*b1 + c1.y*b2 + c2.y*b3 + b.y*b4
}
exports.cubicBezier = cubicBezier
},{}],11:[function(require,module,exports){
var async = require('async')
var EventEmitter = require('events').EventEmitter

var gameLogo = document.getElementById('gameLogo')
var menu = document.getElementById('menu')
var menuEvents = exports.events = new EventEmitter()

var transitionEvent = (function(){
	var el = document.createElement('dummy')
	var transitions = {
		'transition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'MozTransition': 'transitionend',
		'WebkitTransition': 'webkitTransitionEnd'
	}
	for(var t in transitions){
		if(el.style[t] !== undefined) return transitions[t]
	}
})()

function awaitTransitionEnd(el, callback){
	if(transitionEvent){
		var listener = function(e){
			el.removeEventListener(transitionEvent, listener)
			callback(null, e)
		}
		el.addEventListener(transitionEvent, listener)
	} else {
		callback('transition events unavailable')
	}
}

// Menu State enum
var TRANSITIONING = exports.TRANSITIONING = 0
var OPEN = exports.OPEN = 1
var CLOSED = exports.CLOSED = 2

var menuState = OPEN
Object.defineProperty(exports, 'state', {
	'get': function(){ return menuState }
})

function openMenu(callback){
	callback = callback || function(){}

	if(menuState != CLOSED){
		callback('Invalid menuState: ' + menuState)
		return
	}

	menuState = TRANSITIONING
	menuEvents.emit('preopen')

	async.series([
		function(cb){
			async.parallel([
				function(innerCb){ awaitTransitionEnd(gameLogo, innerCb) },
				function(innerCb){ awaitTransitionEnd(menu, innerCb) }
			], cb)
		},
		function(cb){
			menuState = OPEN
			cb(null, true)
			menuEvents.emit('open')
		}
	], callback)

	gameLogo.classList.remove('leaving')
	gameLogo.classList.add('entering')
	menu.classList.remove('leaving')
	menu.classList.add('entering')
}
exports.open = openMenu

function closeMenu(callback){
	callback = callback || function(){}

	if(menuState != OPEN){
		callback('Invalid menuState: ' + menuState)
		return
	}

	menuState = TRANSITIONING
	menuEvents.emit('preclose')

	async.series([
		function(cb){
			async.parallel([
				function(innerCb){ awaitTransitionEnd(gameLogo, innerCb) },
				function(innerCb){ awaitTransitionEnd(menu, innerCb) }
			], cb)
		},
		function(cb){
			menuState = CLOSED
			cb(null, true)
			menuEvents.emit('close')
		}
	], callback)

	gameLogo.classList.remove('entering')
	gameLogo.classList.add('leaving')
	menu.classList.remove('entering')
	menu.classList.add('leaving')
}
exports.close = closeMenu

// obtain a list of slides in the menu
var menuSlides = menu.getElementsByClassName('menuSlide')

// Pick the first non-gone slide as the active one
var activeSlide = (function(){
	for(var i=0; i<menuSlides.length; ++i){
		var slide = menuSlides[i]
		var classes = slide.classList
		if(!classes.contains('gone') && !classes.contains('leaving')){
			return slide
		}
	}
})()

/**
 * Transition to the given `slide` with an animation
 * @param slide - a DomElement that should have the "menuSlide" class
 * @param callback - a node-style callback function that will be called
 *                   when the transition is finished
 */
function gotoSlide(slide, callback){
	callback = callback || function(){}
	if(slide === activeSlide) callback(null, true)
	else {
		var outSlide = activeSlide
		activeSlide = slide
		menuEvents.emit('preswitch', slide)
		async.parallel([
			// transition the 'out' slide away
			function(cb){
				async.series([
					function(innerCb){ awaitTransitionEnd(outSlide, innerCb) },
					function(innerCb){
						outSlide.classList.remove('leaving')
						outSlide.classList.add('gone')
						innerCb(null, true)
					}
				], cb)
				outSlide.classList.remove('entering')
				outSlide.classList.add('leaving')
			},

			// transition the 'slide' in
			function(cb){
				async.series([
					function(innerCb){ awaitTransitionEnd(slide, innerCb) },
					function(innerCb){
						slide.classList.remove('entering')
						innerCb(null, true)
						menuEvents.emit('switch', slide)
					}
				], cb)
				slide.classList.add('entering')
				slide.classList.remove('gone')
			}
		], callback)
	}
}

;(function(){
	var navItems = Array.prototype.slice.call(
		menu.querySelectorAll('.menuItem')
	)
	navItems.forEach(function(item){
		var href = item.getAttribute('slide-href')
		var target = menu.querySelector(href)
		item.addEventListener('click', function(e){
			menuEvents.emit('select', item, e)
			if(target) gotoSlide(target)
		})
	})
})()

},{"async":"async","events":1}],12:[function(require,module,exports){
/*
Object Pool that uses an array-backed linked list
*/

/**
 * This function will be used to generate object instances in a pool.
 * May not return a primitive, as the pool will need to assign special
 * fields on the returned object for pool list management.
 *
 * @callback Pool~create
 * @returns {Object}
 */

/**
 * Creates a new object pool
 *
 * @class
 * @param {Pool~create} create - A function that will be called to
 *   instantiate objects in the pool
 * @param {Number} [sizeHint=50] - The initial pool size
 */
function Pool(create, sizeHint){
	var size = sizeHint || 50
	var array = new Array(size)

	for(var i=0; i<size; i++){
		var obj = create()
		array[i] = obj

		obj.__poolPrev = i-1
		obj.__poolIndex = i
		obj.__poolNext = i+1
	}

	this._create = create
	this._array = array

	// head is where to start traversal
	this._head = array[0]

	// tail is the very end of the chain
	this._tail = array[size-1]

	// last taken is the last 'taken' node
	this._lastTaken = null
}

Pool.prototype._getObj = function(index){
	if(index < 0) return null
	if(index >= this._array.length) return null
	return this._array[index]
}

/**
 * Given an object in the pool, return the next object.
 *
 * @param {Object} obj - An object from the pool
 * @returns {?Object} - The next object in the pool, or null if `obj`
 *   was the last object
 */
Pool.prototype.getNext = function(obj){
	return this._getObj(obj.__poolNext)
}

/**
 * Given an object in the pool, return the previous object.
 *
 * @param {Object} obj - An object from the pool
 * @return {?Object} - The previous object in the pool, or null
 *   if `obj` was the first object.
 */
Pool.prototype.getPrev = function(obj){
	return this._getObj(obj.__poolPrev)
}

/**
 * Take an object from the pool.
 * Objects taken from the pool should eventually be [freed]{@link Pool#free} to
 * avoid instantiating more objects under the hood.
 *
 * @return {Object} - One of the currently-free objects in the pool.
 *   Once taken, the object is no longer considered 'free'.
 */
Pool.prototype.take = function(){
	if(this._lastTaken){
		// try to take the next object
		var nextToTake = this.getNext(this._lastTaken)
		if(nextToTake){
			// everything is ok
			this._lastTaken = nextToTake
			return nextToTake
		} else {
			// out of objects, so add one and take it
			var obj = this._create()
			var i = this._array.length
			this._array.push(obj)

			obj.__poolIndex = i
			obj.__poolNext = i+1
			obj.__poolPrev = this._lastTaken.__poolIndex

			this._lastTaken = this._tail = obj
			return obj
		}
	} else {
		// take the head element
		this._lastTaken = this._head
		return this._lastTaken
	}
}

/**
 * Return an object to the pool.
 * Objects returned in this way should have been obtained by calling
 *   [take]{@linkcode Pool#take}, or else this method may throw errors.
 */
Pool.prototype.free = function(obj){
	if(obj == this._lastTaken){
		// just rewind the lastTaken pointer
		this._lastTaken = this.getPrev(obj)
	} else if(obj == this._head) {
		// advance the current head
		this._head = this.getNext(obj)
		this._head.__poolPrev = -1

		// move obj to the back of the list
		obj.__poolNext = this._tail.__poolNext
		this._tail.__poolNext = obj.__poolIndex
		obj.__poolPrev = this._tail.__poolIndex
		this._tail = obj

		// if it was also the lastTaken, that was the *only* taken
		if(obj == this._lastTaken) this._lastTaken = null
	} else {
		var prev = this.getPrev(obj)
		var next = this.getNext(obj)

		// if it was the lastTaken, rewind the lastTaken to the previous
		if(obj == this._lastTaken) this._lastTaken = prev

		// change from `prev -> obj -> next`
		// to `prev -> next`
		prev.__poolNext = next.__poolIndex
		next.__poolPrev = prev.__poolIndex

		// put the object at the tail
		var tail = this._tail
		obj.__poolNext = tail.__poolNext
		tail.__poolNext = obj.__poolIndex
		obj.__poolPrev = tail.__poolIndex
		this._tail = obj
	}
}

/**
 * Return the first [taken]{@link Pool#take} object from the pool.
 * This is effectively the start of an iterator over the pool's taken objects.
 *
 * @returns {?Object} - the first taken object, or null if no objects have been taken
 */
Pool.prototype.firstTaken = function(){
	if(this._lastTaken) return this._head
	else return null
}

/**
 * Given a reference to a [taken]{@link Pool#take} object from the pool,
 * return a reference to the next taken object.
 *
 * @returns {?Object} - the next taken object after `obj`, or `null` if
 *   `obj` was the last taken object
 */
Pool.prototype.nextTaken = function(obj){
	if(this._lastTaken){
		if(obj == this._lastTaken) return null
		else return this.getNext(obj)
	} else {
		return null
	}
}

Pool.prototype.iterator = function(){
	return new PoolIterator(this)
}

/**
 * Creates an iterator for objects that have been taken from the given {@link Pool}.
 *
 * @class
 * @param {Pool} pool - The pool whose taken objects will be iterated
 */
function PoolIterator(pool) {
	this._pool = pool
	this._current = null
	this._next = pool.firstTaken()
}

/**
 * Return the next taken object from the pool, advancing the iterator.
 *
 * @returns {?Object} - The next taken object, or null if there are no more
 */
PoolIterator.prototype.next = function(){
	this._current = this._next
	if(this._next){
		this._next = this._pool.nextTaken(this._next)
		return this._current
	} else {
		return null
	}
}

/**
 * Property that tells if there is a [next]{@linkcode PoolIterator#next} object available.
 *
 * @instance
 * @name hasNext
 * @type {Boolean}
 * @memberof! PoolIterator
 */
Object.defineProperty(PoolIterator.prototype, 'hasNext', {
	'get': function(){ return !!this._next }
})

/**
 * Free the current object back to the pool.
 */
PoolIterator.prototype.freeCurrent = function(){
	this._current && this._pool.free(this._current)
	this._current = null
}

module.exports = Pool

},{}],13:[function(require,module,exports){
var Vec = require('victor')
var Random = require('./Random')
var Mathx = require('./Mathx')

var playerScale = 1.4
var playerHalfWidth = playerScale * 1
var playerHeight = playerScale * 10 / 3

var defaultPlayerY = 110

var tipToTailVec = new Vec(0, playerHeight * 0.8)
var scratchVec = new Vec(0, 0)

var drawHitBox = false

// lose 300 life for collecting the wrong color block
var wrongBlockDegen = 20
var wrongBlockDegenLength = 15

// gain 300 life for collecting a powerup
var powerupRegen = 5
var powerupRegenLength = 60

// gain 50 life for collecting the right color block
var rightBlockRegen = 10
var rightBlockRegenLength = 5

var passiveLifeDegen = function(timeSincePowerup){
	// Starting at 0.1 life per frame, the rate
	// goes up by another 0.1 every 300 frames.
	return 0.1 * (1 + timeSincePowerup / 300)
}

/*
Information to transition the Y position
*/
var introTransitionDuration = 180
//var introTransitionCurve = [new Vec(0, 0), new Vec(0, 1), new Vec(.5, 1), new Vec(1, 1)]
var introTransitionCurve = [new Vec(0, 0), new Vec(0.25, 1), new Vec(0.25, 1), new Vec(1, 1)]
function introTransitionProgress(t){
	Mathx.cubicBezier(
		introTransitionCurve[0],
		introTransitionCurve[1],
		introTransitionCurve[2],
		introTransitionCurve[3],
		t,
		scratchVec
	)
	return scratchVec.y
}

/*
@param target {Vec}
@param bounds {Rectangle}
@param blockSystem {BlockSystem}
*/
function Player(target, bounds, blockSystem){
	this.target = target
	this.bounds = bounds
	this.blockSystem = blockSystem
	this.position = target.clone()
	this.tailPosition = target.clone().add(tipToTailVec)
	this.rotation = 0
	this.height = playerHeight
	this.color = Random.fromArray(blockSystem.pallatte)
	this._life = 1000
	this.maxLife = 1000
	this.timeSincePowerup = 0

	// circular buffer containing the last 3 'dx' values
	this._recentDx = [0, 0, 0]
	this._recentDxIndex = 0

	this._introTransitionTimer = 0

	this._shakeCounter = 0
	this._wrongBlockDegenTimer = 0
	this._powerupRegenTimer = 0
	this._rightBlockRegenTimer = 0
}

Object.defineProperty(Player.prototype, 'life', {
	'get': function(){ return this._life },
	'set': function(life){
		this._life = Math.max(0, Math.min(life, this.maxLife))
	}
})

Object.defineProperty(Player.prototype, 'isDead', {
	'get': function(){ return this._life == 0 }
})

Object.defineProperty(Player.prototype, 'isShaky', {
	'get': function(){ return !!this._shakeCounter }
})

Player.prototype.update = function(){
	this.runIntroTransition()

	this.followTarget()

	this.collectBlocks()

	// apply base degen
	this.life -= passiveLifeDegen(++this.timeSincePowerup)

	// apply powerup regen
	if(this._powerupRegenTimer > 0){
		--this._powerupRegenTimer
		this.life += powerupRegen
	}

	// apply wrong block degen
	if(this._wrongBlockDegenTimer > 0){
		--this._wrongBlockDegenTimer
		this.life -= wrongBlockDegen
	}

	// apply right block regen
	if(this._rightBlockRegenTimer > 0){
		--this._rightBlockRegenTimer
		this.life += rightBlockRegen
	}
}

Player.prototype.followTarget = function(){
	// Move 90% of the way to the target's X pos,
	// But don't move out of bounds
	var dx = this.target.x - this.position.x
	var oldX = this.position.x
	var x = this.position.x + (dx * 0.8)
	x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, x))
	var movedX = x - oldX
	this.position.x = x

	// insert the movement value into the _recentDx array
	this._recentDx[this._recentDxIndex++] = movedX
	this._recentDxIndex = this._recentDxIndex % 3

	// sum the _recentDx values
	var rdx = this._recentDx // assume length of 3
	var recentMovement = rdx[0] + rdx[1] + rdx[2]

	// pick an angle based on the recent movement
	var angle = (Math.abs(recentMovement) > 0.1) ? recentMovement * 2 : 0
	angle = Math.max(-45, Math.min(45, angle))
	this.rotation = Mathx.degs2rads(angle)

	// update the tail pos based on the angle
	scratchVec.copy(tipToTailVec).rotate(this.rotation)
	this.tailPosition.copy(this.position).add(scratchVec)
}

Player.prototype.collectBlocks = function(){
	if(this._shakeCounter) --this._shakeCounter

	var itr = this.blockSystem.blocksPool.iterator()
	var block = null
	while(block = itr.next()){
		if(this.hitTestCircular(block)){
			itr.freeCurrent()
			if(block.color != this.color){
				this._shakeCounter = 30
				this._wrongBlockDegenTimer = wrongBlockDegenLength
			} else {
				// note the use of += instead of =
				// so that quick successive collections don't overlap
				this._rightBlockRegenTimer += rightBlockRegenLength
			}
		}
	}
}

Player.prototype.startIntroTransition = function(){
	this._introTransitionTimer = introTransitionDuration
}

Player.prototype.runIntroTransition = function(){
	if(this._introTransitionTimer){
		var t = (introTransitionDuration - (--this._introTransitionTimer)) / introTransitionDuration
		var start = this.bounds.maxY + 5
		var end = defaultPlayerY
		var ratio = introTransitionProgress(t)
		this.position.y = start + (end - start) * ratio
	} else {
		this.position.y = defaultPlayerY
	}
}

Player.prototype.onCollectPowerup = function(powerup){
	this.color = powerup.color
	this._powerupRegenTimer = powerupRegenLength
	this.timeSincePowerup = 0
}

Player.prototype.hitTestCircular = function(circle){
	var circleX = circle.position.x
	var circleY = circle.position.y

	// rectangular model
	var xThreshold = playerHalfWidth + circle.radius
	var xDist = Math.abs(this.position.x - circleX)
	if(xDist > xThreshold) return false

	var yMin = this.position.y - circle.radius
	var yMax = this.position.y + playerHeight
	return (circleY >= yMin) && (circleY <= yMax)
}

Player.prototype.draw = function(context, invScale){
	context.save()
	context.translate(this.position.x, this.position.y)

	if(this._shakeCounter){
		scratchVec.x = 0.5
		scratchVec.y = 0
		scratchVec.rotate(Math.random() * Mathx.TAU)
		context.translate(scratchVec.x, scratchVec.y)
	}

	context.rotate(this.rotation)

	context.beginPath()
	context.moveTo(0, 0)
	context.lineTo(playerHalfWidth, playerHeight)
	context.quadraticCurveTo(0, playerHeight * 0.8, -playerHalfWidth, playerHeight)
	context.closePath()

	context.fillStyle = '#fff'
	context.strokeStyle = '#000'
	context.lineWidth = invScale
	context.fill()
	context.stroke()

	context.restore()

	// debug drawing for the hitbox
	if(drawHitBox){
		context.save()
		context.strokeStyle = '#000'
		context.lineWidth = invScale

		context.beginPath()
		context.rect(
			this.position.x - playerHalfWidth - 1.5,
			this.position.y - 1.5,
			(playerHalfWidth + 1.5) * 2,
			playerHeight + 1.5
			)
		context.stroke()

		context.restore()
	}
}

module.exports = Player
},{"./Mathx":10,"./Random":16,"victor":"victor"}],14:[function(require,module,exports){
var Vec = require('victor')
var Mathx = require('./Mathx')

function Powerup(){
	this.position = new Vec(0, 0)
	this.velocity = new Vec(0, 0)
	this.rotation = 0
	this.rotationalVelocity = 0
	this.color = '#666'
	this.radius = 2
}

Powerup.prototype.update = function(){
	this.position.add(this.velocity)
	this.rotation += this.rotationalVelocity
	if(this.rotation > Mathx.TAU) this.rotation -= Mathx.TAU
	if(this.rotation < 0) this.rotation += Mathx.TAU
}

Powerup.prototype.draw = function(context, invScale){
	context.save()
	context.translate(this.position.x, this.position.y)
	context.rotate(this.rotation)

	context.beginPath()
	context.fillStyle = this.color
	context.strokeStyle = '#000'
	context.lineWidth = invScale
	var r = this.radius
	var d = Mathx.TAU / 18
	context.moveTo(r, 0)
	for(var i=1; i<18; i++){
		var a = i % 2 ? 0.7 : 1
		var x = Math.cos(i * d) * r * a
		var y = Math.sin(i * d) * r * a
		context.lineTo(x, y)
	}
	context.closePath()
	context.fill()
	context.stroke()

	context.restore()
}

module.exports = Powerup
},{"./Mathx":10,"victor":"victor"}],15:[function(require,module,exports){
var Powerup = require('./Powerup')
var Particle = require('./particle/Particle')
var Mathx = require('./Mathx')
var Random = require('./Random')
var ObjectPool = require('./ObjectPool')
var GameSettings = require('./GameSettings')
var SpawnTicker = require('./SpawnTicker')
var PowerupParticles = require('./particle/PowerupParticles')

var oobThreshold = 5
var nextPowerupId = 0

function PowerupSystem(gameBounds, player){
	this.gameBounds = gameBounds
	this.player = player

	// make a copy of GameSettings.colorPallatte
	var p = this.pallatte = []
	GameSettings.colorPallatte.forEach(function(c){
		p.push(c)
	})

	this.powerupPool = new ObjectPool(function(){ return new Powerup() }, 3)
	this.powerupTicker = new SpawnTicker(300)

	this.particles = new PowerupParticles(this)
}

PowerupSystem.prototype.spawn = function(){
	var p = this.powerupPool.take()
	p.position.y = this.gameBounds.minY - oobThreshold
	p.position.x = Random.inRange(this.gameBounds.minX, this.gameBounds.maxX)
	p.color = this.pickColor()
	p.velocity.y = .5
	p.rotationalVelocity = Mathx.degs2rads(Random.inRange(.5, 2) * Random.negate())

	// id for associating powerup particles to this powerup
	p._powerupId = nextPowerupId++
}

PowerupSystem.prototype.pickColor = function(){
	// pick a random color that isn't the same as the player
	var i = this.pallatte.indexOf(this.player.color)
	var len = this.pallatte.length
	if(i > 0){
		// swap the color at `i` to the last index
		var c = this.pallatte[i]
		this.pallatte[i] = this.pallatte[len - 1]
		this.pallatte[len - 1] = c
		// decrement the len so it doesn't come up in randomization
		--len
	}
	var r = Math.floor(Math.random() * len)
	return this.pallatte[r]
}

PowerupSystem.prototype.update = function(){
	if(this.powerupTicker.tick()){
		this.spawn()
	}
	this.particles.update()

	var p = null
	var itr = this.powerupPool.iterator()
	var maxY = this.gameBounds.maxY + oobThreshold
	while(p = itr.next()){
		p.update()
		if(p.position.y > maxY){
			itr.freeCurrent()
		} else {
			if(this.player.hitTestCircular(p)){
				this.player.onCollectPowerup(p)
				this.particles.setCollected(p._powerupId, this.player.position)
				itr.freeCurrent()
			}
		}
	}
}

PowerupSystem.prototype.draw = function(context, invScale){
	this.particles.draw(context, invScale)

	var p = null
	var itr = this.powerupPool.iterator()
	while(p = itr.next()){
		p.draw(context, invScale)
	}
}

module.exports = PowerupSystem
},{"./GameSettings":8,"./Mathx":10,"./ObjectPool":12,"./Powerup":14,"./Random":16,"./SpawnTicker":18,"./particle/Particle":21,"./particle/PowerupParticles":23}],16:[function(require,module,exports){
function fromArray(arr){
	return arr[Math.floor(Math.random() * arr.length)]
}
exports.fromArray = fromArray

function inRange(min, max){
	return Math.random() * (max - min) + min
}
exports.inRange = inRange

function negate(){
	return Math.random() > .5 ? 1 : -1
}
exports.negate = negate
},{}],17:[function(require,module,exports){
var Vec = require('victor')

function Rectangle(x, y, width, height){
	this.x = x || 0
	this.y = y || 0
	this.width = width || 0
	this.height = height || 0

}
function makeProp(name, get){
	Object.defineProperty(Rectangle.prototype, name, { 'get': get })
}

makeProp('minX', function(){ return this.x })
makeProp('minY', function(){ return this.y })
makeProp('maxX', function(){ return this.x + this.width })
makeProp('maxY', function(){ return this.y + this.height })

module.exports = Rectangle
},{"victor":"victor"}],18:[function(require,module,exports){
function SpawnTicker(interval){
	this.interval = interval
	this._ticker = 0
}

SpawnTicker.prototype.tick = function(){
	if(++this._ticker >= this.interval){
		this._ticker = 0
		return true
	} else {
		return false
	}
}

module.exports = SpawnTicker
},{}],19:[function(require,module,exports){
/** Calculates a rectangle with the specified `aspectRatio`
  * That fits within the given `bounds` rectangle. Both the
  * `bounds` and return value will be an object in the form
  * {x, y, width, height}
  */
module.exports = function(bounds, aspectRatio){
	var targetW = Math.min(bounds.width, bounds.height * aspectRatio)
	var targetH = Math.min(bounds.height, bounds.width / aspectRatio)

	if(targetW < bounds.width){
		// extra space on the sides
		var sideWidth = (bounds.width - targetW) / 2
		return {
			x: bounds.x + sideWidth,
			y: bounds.y,
			width: targetW,
			height: bounds.height
		}
	} else {
		// extra space above and below
		var topHeight = (bounds.height - targetH) / 2
		return {
			x: bounds.x,
			y: bounds.y + topHeight,
			width: bounds.width,
			height: targetH
		}
	}
}
},{}],20:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"async":"async","dup":11,"events":1}],21:[function(require,module,exports){
var Vec = require('victor')
var Mathx = require('../Mathx')
var particleId = 0

function Particle(){
	this.id = particleId++
	this.position = new Vec(0, 0)
	this.velocity = new Vec(0, 0)
	this.rotation = 0
	this.color = 'red'
	this.scale = 1
	this.opacity = 0.5
	this.uptime = 0
}

Particle.prototype.reset = function(){
	this.position.x = this.position.y = 0
	this.velocity.x = this.velocity.y = 0
	this.rotation = 0
	this.color = 'red'
	this.scale = 1
	this.opacity = 0.5
	this.uptime = 0
}

Particle.defaultRenderer = function(context, particle, invScale){
	context.save()
	context.translate(particle.position.x, particle.position.y)
	context.rotate(particle.rotation)
	context.globalAlpha = particle.opacity
	context.fillStyle = particle.color

	context.beginPath()
	context.arc(0, 0, particle.scale, 0, Mathx.TAU)
	context.fill()

	context.restore()
}

Particle.lineRenderer = function(lineWidth){
	return function(context, particle, invScale){
		context.save()
		context.translate(particle.position.x, particle.position.y)
		context.rotate(particle.rotation)
		context.globalAlpha = particle.opacity
		context.strokeStyle = particle.color
		context.lineWidth = invScale * lineWidth

		context.beginPath()
		// context.arc(0, 0, particle.scale, 0, Mathx.TAU)
		context.moveTo(0, 0)
		context.lineTo(2, 0)
		context.stroke()

		context.restore()
	}
}

module.exports = Particle
},{"../Mathx":10,"victor":"victor"}],22:[function(require,module,exports){
var Particle = require('./Particle')
var Random = require('../Random')
var Color = require('../Color')
var ObjectPool = require('../ObjectPool')
var Vec = require('victor')
var Mathx = require('../Mathx')

var scratchVec = new Vec(0,0)
var spreadRadians = Mathx.degs2rads(10)

function PlayerPropulsion(player){
	this.player = player

	// initial spawn info
	this.spawnPoint = new Vec(0, 0)
	this.spawnDir = new Vec(0, 1)

	// initialize the base color/hsl values
	this.baseColor = undefined
	this.baseHSL = {}

	this.particlePool = new ObjectPool(function(){
		return new Particle()
	}, 61 /* 1 spawn per frame, 60 frame lifetime */)

	this.spawnTimer = 0
}

PlayerPropulsion.prototype.update = function(){
	if(this.baseColor != this.player.color){
		this.setBaseColor(this.player.color)
	}

	var spawnInterval = this.player.isShaky ? 4 : 0
	if(++this.spawnTimer > spawnInterval){
		this.spawnTimer = 0
		if(!this.player.isDead) this.spawnParticle()
	}
	var itr = this.particlePool.iterator()
	var p = null
	while(p = itr.next()){
		p.position.add(p.velocity)
		if(++p.uptime > 60) itr.freeCurrent()
		else {
			// linear ease opacity from 0.5 to 0
			// over the lifetime of 60 frames
			p.opacity = 0.5 * (60 - p.uptime) / 60
		}
	}
}

PlayerPropulsion.prototype.draw = function(context){
	var draw = Particle.defaultRenderer
	var itr = this.particlePool.iterator()
	var p = null
	var count = 0
	while(p = itr.next()){
		++count
		draw(context, p)
	}
}

PlayerPropulsion.prototype.spawnParticle = function(){
	this.updateSpawnInfo()
	var p = this.particlePool.take()
	p.reset()
	p.color = this.pickColor()
	p.position.copy(this.spawnPoint)
	var spread = Random.inRange(-spreadRadians, spreadRadians)
	p.velocity.copy(this.spawnDir).rotate(spread)
}

PlayerPropulsion.prototype.setBaseColor = function(cssColor){
	this.baseColor = cssColor
	var c = this.baseHSL
	Color.computeRgb(cssColor, function(r,g,b){
		Color.rgbToHsl(r,g,b, function(h,s,l){
			c.h = Math.round(h * 360)
			c.s = Math.round(s * 100)
			c.l = Math.round(l * 100)
		})
	})
}

PlayerPropulsion.prototype.pickColor = function(){
	var hueShift = Random.inRange(-10, 10)
	var hue = Math.round(this.baseHSL.h + hueShift)
	var sat = this.baseHSL.s
	var lit = this.baseHSL.l
	return 'hsl(' + hue + ', ' + sat + '%, ' + lit + '%)'
}

PlayerPropulsion.prototype.updateSpawnInfo = function(){
	// put the spawn point at the player's tail
	this.spawnPoint.copy(this.player.tailPosition)

	// point the spawn direction the same way as the player
	this.spawnDir.x = 0
	this.spawnDir.y = 0.5
	this.spawnDir.rotate(this.player.rotation)
}

module.exports = PlayerPropulsion

},{"../Color":5,"../Mathx":10,"../ObjectPool":12,"../Random":16,"./Particle":21,"victor":"victor"}],23:[function(require,module,exports){
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
},{"../Color":5,"../Mathx":10,"../ObjectPool":12,"../Random":16,"../SpawnTicker":18,"./Particle":21,"victor":"victor"}]},{},[2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,22,23]);
