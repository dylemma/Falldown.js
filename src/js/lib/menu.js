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
