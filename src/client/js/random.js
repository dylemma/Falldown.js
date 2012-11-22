withNamespace('Random', function(Random){
	var rand = Math.random,
		floor = Math.floor
	
	/** Usage:
	 * next() = random decimal in range [0, 1)
	 * next(range) = random decimal in range [0, range)
	 * next(min, max) = random decimal in range [min, max)
	 */
	Random.next = function(a, b){
		if(arguments.length == 0) return rand()
		if(arguments.length == 1) return rand() * a
		if(arguments.length == 2) return a + rand() * (b-a)
	}
	
	/** Usage:
	 * nextInt(range) = random int in range [0, range)
	 * nextInt(min, max) = random int in range [min, max)
	 */
	Random.nextInt = function(a, b){
		if(arguments.length == 1) return floor(rand() * a)
		if(arguments.length >= 2) return a + floor(rand() * (b-a))
	}
	
	/** Usage:
	 * pick(array) = return an element at random from the array
	 */
	Random.pick = function(array){
		if(array && array.length){
			return array[Random.nextInt(array.length)]
		} else {
			return undefined
		}
	}


})