/*
Object Pool that uses an array-backed linked list
*/

/**
 * This function will be used to generate object instances in a pool.
 * May not return a primitive, as the pool will need to assign special
 * fields on the returned object for pool list management.
 *
 * @callback Pool~create
 * @returns {Object}
 */

/**
 * Creates a new object pool
 *
 * @class
 * @param {Pool~create} create - A function that will be called to
 *   instantiate objects in the pool
 * @param {Number} [sizeHint=50] - The initial pool size
 */
function Pool(create, sizeHint){
	var size = sizeHint || 50
	var array = new Array(size)

	for(var i=0; i<size; i++){
		var obj = create()
		array[i] = obj

		obj.__poolPrev = i-1
		obj.__poolIndex = i
		obj.__poolNext = i+1
	}

	this._create = create
	this._array = array

	// head is where to start traversal
	this._head = array[0]

	// tail is the very end of the chain
	this._tail = array[size-1]

	// last taken is the last 'taken' node
	this._lastTaken = null
}

Pool.prototype._getObj = function(index){
	if(index < 0) return null
	if(index >= this._array.length) return null
	return this._array[index]
}

/**
 * Given an object in the pool, return the next object.
 *
 * @param {Object} obj - An object from the pool
 * @returns {?Object} - The next object in the pool, or null if `obj`
 *   was the last object
 */
Pool.prototype.getNext = function(obj){
	return this._getObj(obj.__poolNext)
}

/**
 * Given an object in the pool, return the previous object.
 *
 * @param {Object} obj - An object from the pool
 * @return {?Object} - The previous object in the pool, or null
 *   if `obj` was the first object.
 */
Pool.prototype.getPrev = function(obj){
	return this._getObj(obj.__poolPrev)
}

/**
 * Take an object from the pool.
 * Objects taken from the pool should eventually be [freed]{@link Pool#free} to
 * avoid instantiating more objects under the hood.
 *
 * @return {Object} - One of the currently-free objects in the pool.
 *   Once taken, the object is no longer considered 'free'.
 */
Pool.prototype.take = function(){
	if(this._lastTaken){
		// try to take the next object
		var nextToTake = this.getNext(this._lastTaken)
		if(nextToTake){
			// everything is ok
			this._lastTaken = nextToTake
			return nextToTake
		} else {
			// out of objects, so add one and take it
			var obj = this._create()
			var i = this._array.length
			this._array.push(obj)

			obj.__poolIndex = i
			obj.__poolNext = i+1
			obj.__poolPrev = this._lastTaken.__poolIndex

			this._lastTaken = this._tail = obj
			return obj
		}
	} else {
		// take the head element
		this._lastTaken = this._head
		return this._lastTaken
	}
}

/**
 * Return an object to the pool.
 * Objects returned in this way should have been obtained by calling
 *   [take]{@linkcode Pool#take}, or else this method may throw errors.
 */
Pool.prototype.free = function(obj){
	if(obj == this._lastTaken){
		// just rewind the lastTaken pointer
		this._lastTaken = this.getPrev(obj)
	} else if(obj == this._head) {
		// advance the current head
		this._head = this.getNext(obj)
		this._head.__poolPrev = -1

		// move obj to the back of the list
		obj.__poolNext = this._tail.__poolNext
		this._tail.__poolNext = obj.__poolIndex
		obj.__poolPrev = this._tail.__poolIndex
		this._tail = obj

		// if it was also the lastTaken, that was the *only* taken
		if(obj == this._lastTaken) this._lastTaken = null
	} else {
		var prev = this.getPrev(obj)
		var next = this.getNext(obj)

		// if it was the lastTaken, rewind the lastTaken to the previous
		if(obj == this._lastTaken) this._lastTaken = prev

		// change from `prev -> obj -> next`
		// to `prev -> next`
		prev.__poolNext = next.__poolIndex
		next.__poolPrev = prev.__poolIndex

		// put the object at the tail
		var tail = this._tail
		obj.__poolNext = tail.__poolNext
		tail.__poolNext = obj.__poolIndex
		obj.__poolPrev = tail.__poolIndex
		this._tail = obj
	}
}

/**
 * Return the first [taken]{@link Pool#take} object from the pool.
 * This is effectively the start of an iterator over the pool's taken objects.
 *
 * @returns {?Object} - the first taken object, or null if no objects have been taken
 */
Pool.prototype.firstTaken = function(){
	if(this._lastTaken) return this._head
	else return null
}

/**
 * Given a reference to a [taken]{@link Pool#take} object from the pool,
 * return a reference to the next taken object.
 *
 * @returns {?Object} - the next taken object after `obj`, or `null` if
 *   `obj` was the last taken object
 */
Pool.prototype.nextTaken = function(obj){
	if(this._lastTaken){
		if(obj == this._lastTaken) return null
		else return this.getNext(obj)
	} else {
		return null
	}
}

Pool.prototype.iterator = function(){
	return new PoolIterator(this)
}

/**
 * Creates an iterator for objects that have been taken from the given {@link Pool}.
 *
 * @class
 * @param {Pool} pool - The pool whose taken objects will be iterated
 */
function PoolIterator(pool) {
	this._pool = pool
	this._current = null
	this._next = pool.firstTaken()
}

/**
 * Return the next taken object from the pool, advancing the iterator.
 *
 * @returns {?Object} - The next taken object, or null if there are no more
 */
PoolIterator.prototype.next = function(){
	this._current = this._next
	if(this._next){
		this._next = this._pool.nextTaken(this._next)
		return this._current
	} else {
		return null
	}
}

/**
 * Property that tells if there is a [next]{@linkcode PoolIterator#next} object available.
 *
 * @instance
 * @name hasNext
 * @type {Boolean}
 * @memberof! PoolIterator
 */
Object.defineProperty(PoolIterator.prototype, 'hasNext', {
	'get': function(){ return !!this._next }
})

/**
 * Free the current object back to the pool.
 */
PoolIterator.prototype.freeCurrent = function(){
	this._current && this._pool.free(this._current)
	this._current = null
}

module.exports = Pool
