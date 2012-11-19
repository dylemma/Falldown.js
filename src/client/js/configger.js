withNamespace('configger', function(configger){

	//TODO: evaluate how useful this really is - does it merit reuse in its own place?
	configger.configFunc = function(opts, field){
		return function(arg){
			if(arguments.length){
				opts[field] = arg
				return this
			} else {
				return opts[field]
			}
		}
	}

})