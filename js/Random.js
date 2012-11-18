define(function(){

	var rand = Math.random,
		floor = Math.floor
	
	function nextInt(max){
		return floor(rand() * max)
	}
	
	function nextInRange(min,max){
		return rand() * (max-min) + min
	}
	
	function pick(array){
		//guard against bad inputs
		if(!array || !array.length) return undefined
		
		var idx = nextInt(array.length)
		return array[idx]
	}
	
	
	// module definition
	return {
		'next': rand,
		'nextInt': nextInt,
		'nextInRange': nextInRange,
		'pick': pick
	}
	
})
