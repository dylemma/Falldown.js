(function(){

	function getOrCreate(subject, field){
		return subject[field] || (subject[field] = {})
	}
	
	function namespacify(nsPath, startObj){
		var segments = nsPath.split('.')
		var ns = startObj
		for(var i=0; i<segments.length; i++){
			ns = getOrCreate(ns, segments[i])
		}
		return ns
	}
	
	window.withNamespace = function(nsPath, callback){
		return callback(namespacify(nsPath, this))
	}

})()