(function(falldown){

	var Spawner = function(factory){
		this.factory = factory
		this.condition = function(system){ return true }
	}
	
	/** Usage:
	 * Assume `factory` is a 0-arity function that returns some object.
	 *     var spawn = falldown.spawner(factory)
	 *         .when(function(system){ return ... })
	 *         .andThen(factory2)
	 *         .when(function(system){ return ... })
	 */
	var spawner = falldown.spawner = function(factory){
		var spawner = new Spawner(factory)
		
		var spawn = function(system, items){
			if(spawner.condition(system)) items.push(spawner.factory())
		}
		var resultFunc = function(system, items){ spawn(system, items) }
		
		resultFunc.when = function(condition){ 
			spawner.condition = condition 
			return this
		}
		
		return resultFunc
	}
	
	/** Creates a spawner that picks its current functionality based on its 'mode'.
	 * The `modes` object must be in the form of
	 *   {
	 *     modeName: spawnerFunc
	 *   }
	 * where `spawnerFunc` is another `spawner` instance, for any number of mode names.
	 */
	spawner.switcher = function(modes, defaultMode){
		defaultMode = defaultMode || Object.getOwnPropertyNames(modes)[0]
		var currentMode = defaultMode
		
		var behavior = function(system, items){
			modes[currentMode](system, items)
		}
		
		behavior.mode = function(mode){
			if(arguments.length){
				currentMode = mode
				return this
			} else {
				return currentMode
			}
		}
		
		behavior.addMode = function(mode, spawn){
			modes[mode] = spawn
			return this
		}
		
		return behavior
	}
	
	/** Creates a function that returns `true` after every `interval`
	 * times being called. The function requires a `falldown.System`
	 * instance as an argument, and will use the `sysData` to maintain
	 * a counter.
	 */
	var intervalId = 0
	spawner.interval = function(interval){
		var field = "spawnCounter" + (intervalId++)
		return function(system){
			var sysData = system.sysData
			sysData[field] = sysData[field] || 0
			sysData[field]++
			
			if(sysData[field] >= interval){
				sysData[field] = 0
				return true
			} else {
				return false
			}
		}
	}

})(window.falldown || (window.falldown = {}))