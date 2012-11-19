withNamespace('falldown', function(falldown){

	var nextId = 0
	
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
		this.color = opts.color || Random.pick(Block.colorPalette)
	}
	
	Block.colorPalette = ['limegreen', 'deepskyblue', 'sandybrown', 'darkorchid', 'crimson']
	
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
		
		this.emitter = falldown.particle.emitter(this.position, new geom.Vector(0, 1), 30)
		
		var _color = opts.color || 'white'
		this.color = function(c){
			if(arguments.length){
				_color = c
				//side effect: update the emitter's color
				this.emitter.changeColor(c)
				return this
			} else {
				return _color
			}
		}
		this.angle = opts.angle || 0
	}

})