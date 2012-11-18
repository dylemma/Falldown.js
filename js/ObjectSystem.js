define(function(require, exports, module){
	
	function ObjectSystem(opts){
		opts = opts || {}
		this.hardLimit = opts['limit'] || undefined
		
		this.objects = []
		this.count = 0
	}
	
	ObjectSystem.prototype.spawn = function(){
		if(isNan(this.hardLimit) || this.count >= this.hardLimit){
			/* Either want to reset an existing object, or generate a new one */
		}
	}
	
}