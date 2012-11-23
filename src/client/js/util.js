withNamespace('falldown.util', function(util){

	/** A function that returns its first formal argument */
	util.identityFunc = function(x){ return x }
	
	/** A function that does nothing */
	util.emptyFunc = function(){}
	
	/** Creates an "accessor" function that acts as both a getter and a setter.
	 * Arguments:
	 *  `initialValue` the initial value of the field, which will be returned by the "getter"
	 *  `opts` an optional config object
	 *  `opts.onChange` a function that will be called when the "accessor"  is used in "setter" mode
	 *
	 * Usage of returned function:
	 *    var x = {}
	 *    x.stuff = accessorFunc(1)
	 *
	 *    x.stuff() // returns 1
	 *    x.stuff(2) // returns x
	 *    x.stuff() // returns 2
	 */
	util.accessorFunc = function(initialValue, opts){
		opts = opts || {}
		var value = initialValue,
			onChange = (typeof opts.onChange == 'function') ? opts.onChange : util.emptyFunc
		return function(v){
			if(arguments.length){
				value = v
				onChange(value)
				return this
			} else {
				return value
			}
		}
	}

})