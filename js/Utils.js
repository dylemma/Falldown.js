Function.prototype.andThen = function(that){
	var self = this;
	return function(){ 
		self.apply(this, arguments);
		that.apply(this, arguments);
	}
}