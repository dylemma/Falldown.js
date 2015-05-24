var async = require('async')

var gameLogo = document.getElementById('gameLogo')
var menu = document.getElementById('menu')

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
var TRANSITIONING = 0
var OPEN = 1
var CLOSED = 2

var menuState = OPEN

function openMenu(callback){
	callback = callback || function(){}

	if(menuState != CLOSED){
		callback('Invalid menuState: ' + menuState)
		return
	}

	menuState = TRANSITIONING

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
		}
	], callback)

	gameLogo.classList.remove('leaving')
	gameLogo.classList.add('entering')
	menu.classList.remove('leaving')
	menu.classList.add('entering')
}

function closeMenu(callback){
	callback = callback || function(){}

	if(menuState != OPEN){
		callback('Invalid menuState: ' + menuState)
		return
	}

	menuState = TRANSITIONING

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
		}
	], callback)

	gameLogo.classList.remove('entering')
	gameLogo.classList.add('leaving')
	menu.classList.remove('entering')
	menu.classList.add('leaving')
}

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
					}
				], cb)
				slide.classList.add('entering')
				slide.classList.remove('gone')
			}
		], callback)
	}
}

// Auto-wire any '.menuItem[slide-href]'
;(function(){
	var navItems = Array.prototype.slice.call(
		menu.querySelectorAll('.menuItem[slide-href]')
	)
	navItems.forEach(function(item){
		var href = item.getAttribute('slide-href')
		var target = menu.querySelector(href)
		if(target) item.addEventListener('click', function(){
			gotoSlide(target)
		})
	})
})()

// Wire the 'menuClose' button
var menuClose = document.getElementById('menuClose')
menuClose && menuClose.addEventListener('click', function(){
	closeMenu()
})

// Open the menu by pressing Space
window.addEventListener('keydown', function(e){
	if(menuState == CLOSED && e.keyCode == 32) openMenu()
})