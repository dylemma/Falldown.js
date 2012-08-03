Function.prototype.andThen = function(that){
	var self = this;
	return function(){ self(); that(); }
}