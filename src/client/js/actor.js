(function(falldown){

	var nextId = 0,
		blockColors = ['limegreen', 'deepskyblue', 'sandybrown', 'darkorchid', 'crimson']
	
	var Actor = falldown.Actor = function(opts){
		opts = opts || {}
		
		this.id = nextId++
		this.position = (opts.position instanceof geom.Vector) ? opts.position : new geom.Vector
		this.angle = opts.angle || 0
	}
	
	var Block = falldown.Block = function(opts){
		opts = opts || {}
		Actor.call(this, opts)
		
		this.velocity = (opts.velocity instanceof geom.Vector) ? opts.velocity : new geom.Vector(0, 1)
		this.rSpeed = (!isNaN(opts.rSpeed)) ? opts.rSpeed : 0
		this.color = opts.color || Random.pick(blockColors)
	}
	
	Block.factory = function(initialOpts){
		var opts = initialOpts || {}
		var f = function(){
			var optsEval = {}
			for(key in opts){
				if(opts.hasOwnProperty(key)){
					var optValue = opts[key]
					if(typeof optValue === 'function'){
						optsEval[key] = optValue()
					} else if(optValue !== null){
						optsEval[key] = optValue
					}
				}
			}
			return new Block(optsEval) 
		}
		
		var factory = function(){ return f() }
		
		new Array('position', 'angle', 'velocity', 'rSpeed', 'color').forEach(function(field){
			factory[field] = configger.configFunc(opts, field)
		})
		
		return factory
	}
	
	var Player = falldown.Player = function(opts){
		opts = opts || {}
		
		this.position = new geom.Vector(
			opts.x || 0,
			opts.y || 0
		)
		this.color = opts.color || 'white'
		this.angle = opts.angle || 0
	}

})(window.falldown || (window.falldown = {}))