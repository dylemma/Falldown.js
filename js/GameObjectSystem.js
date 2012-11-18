define(function(require){
	
	function GameObjectSystem(spawn, update, kill, reap){
		
		//check arguments. they all need to be functions
		(function(){
			var allFuncs = [spawn, update, kill, reap].every(function(arg){ return typeof arg === 'function'})
			if(!allFuncs) throw "GameObjectSystem: Illegal Arguments. spawn, update, kill, and reap must all be functions"
			
			this.spawn = spawn
			this.update = update
			this.kill = kill
			this.reap = reap
		})()
		
		this.gameObjects = []
	}
	
	GameObjectSystem.prototype.spawnObjects = function(){
		var obs = this.gameObjects
		this.spawn().forEach(function(d){
			obs.push(d)
		})
	}
	
	GameObjectSystem.prototype.updateObjects = function(){
		this.update(this.gameObjects)
	}
	
	GameObjectSystem.prototype.handleGarbage = function(){
		var liveObs = [],
			deadObs = [],
			killer = this.kill
		
		this.gameObjects.forEach(function(obj){
			var deathReason = kill(obj)
			if(deathReason) deadObs.push({'object': obj, 'reason': deathReason})
			else liveObs.push(obj)
		})
		
		this.reap(deadObs)
		this.gameObjects = liveObs
	}
		
	GameObjectSystem.prototype.update = function(){
		this.spawnObjects()
		this.updateObjects()
		this.handleGarbage()
	}

	var ObjectDeathReason = {
		'OutOfBounds': 1,
		'Caught': 2
	}
	
	
	var Spawner = {}
	
	/**
	 * Creates a spawning function that will only generate entities
	 * once in a while.
	 */
	Spawner.randomIntervalSpawner = function(spawn, interval){
		interval = Math.abs( isNaN(interval) ? 1 : interval )
		var counter = 0
		return function(){
			counter += Math.random()
			if(counter > interval) {
				counter = 0
				return spawn()
			} else {
				return []
			}
		}
	}
	
	var Killer = {}
	
	/**
	 * Creates an object kill decider based on a `bounds` rectangle,
	 * and a `getPosition(object)` function.
	 */
	Killer.outOfBoundsKiller = function(bounds, getPosition){
		//TODO: validate types. (bounds: Rectangle, getPosition: Function)
		return function(object){
			var inBounds = bounds.contains( getPosition(object) ) 
			return inBounds ? 0 : ObjectDeathReason['OutOfBounds']
		}
	}
	
	Killer.playerCatchKiller = function(maxDist, getPlayerPos){
		var d2 = maxDist * maxDist
		//TODO: return a function that returns the 'Caught' state
		//when the object is within maxDist of the PlayerPos
	}
	
	
	return {
		'GameObjectSystem': GameObjectSystem,
		'ObjectDeathReason': ObjectDeathReason,
		'Spawner': Spawner,
		'Killer': Killer
	}
})