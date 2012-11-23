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
	
	function importNsTo(ns, to){
		for(key in ns){ to[key] = ns[key] }
		return to
	}
	
	window.withNamespace = function(nsPath, callback){
		return callback(namespacify(nsPath, this))
	}

	window.importNamespace = function(nsPath, target){
		return importNsTo(namespacify(nsPath, this), target || {})
	}
	
})()