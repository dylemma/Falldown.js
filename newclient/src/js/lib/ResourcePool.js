function ResourcePool(make){
	this._make = make
	this._resources = []
	this._spawnIndex = 0
}

ResourcePool.prototype.spawn = function(){
	if(this._spawnIndex < this._resources.length){
		// activate the first available resource
		// by incrementing the _spawnIndex
		return this._resources[this._spawnIndex++]
	} else {
		// not enough resources; make a new one
		var res = this._make()
		this._resources.push(res)
		this._spawnIndex = this._resources.length
		return res
	}
}

/** Iterate over the active resources in this pool.
  * @param onResource A function that takes a resource
  * as its first argument. If the `onResource` function
  * returns `true`, the corresponding resource will be
  * reclaimed so that it can be reused in a future
  * `spawn` operation.
  */
ResourcePool.prototype.iterate = function(onResource){
	var index = 0
	while(index < this._spawnIndex){
		var res = this._resources[index]
		var shouldReclaim = !!onResource(res)
		if(shouldReclaim){
			// swap the current resource with the one
			// just before the _spawnIndex,
			// the decrement the _spawnIndex
			var toSwap = this._resources[this._spawnIndex -1]
			this._resources[this._spawnIndex - 1] = res
			this._resources[index] = toSwap
			--this._spawnIndex
			// next iteration will operate on the resource
			// that was just swapped in, so we don't increment the index
		} else {
			index++
		}
	}
}

module.exports = ResourcePool