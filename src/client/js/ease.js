withNamespace('falldown', function(falldown){

	falldown.ease = function(nameOrFunc){
		var base = (function(){
			if(typeof nameOrFunc == 'function') return nameOrFunc
			if(typeof nameOrFunc == 'string') return d3.ease(nameOrFunc)
			throw 'TypeError: falldown.ease() requires a function or string as its first argument'
		})()
		
		var min = 0,
			max = 1,
			api = function(t){ return base(t) * (max-min) + min }

		api.from = function(m){
			min = m
			return this
		}
		
		api.to = function(m){
			max = m
			return this
		}
		
		api.mirrored = function(){
			base = mirror(base)
			return this
		}
		
		return api
	}

	function mirror(base){
		return function(t){
			if(t <= .5) return base(t*2)
			else return base(2 - t - t) //(1-t)*2)
		}
	}
	
})