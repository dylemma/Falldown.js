withNamespace('Random', function(Random){
	var rand = Math.random,
		floor = Math.floor
	
	Random.next = function(a, b){
		if(arguments.length == 0) return rand()
		if(arguments.length == 1) return rand() * a
		if(arguments.length == 2) return a + rand() * (b-a)
	}
	
	Random.nextInt = function(range){
		return floor(rand() * range)
	}
	
	Random.pick = function(array){
		if(array && array.length){
			return array[Random.nextInt(array.length)]
		} else {
			return undefined
		}
	}


})