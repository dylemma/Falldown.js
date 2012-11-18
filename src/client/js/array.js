Array.fill = function(count, generator){
	var a = new Array(count)
	for(var i=0; i<count; i++){
		a[i] = generator(i)
	}
}

function isDefined(a){
	return (a !== null) && (a !== undefined)
}

Array.prototype.flattenInPlace = function(){
	var readIndex = 0,
		writeIndex = 0
	
	while(readIndex < this.length){
		var value = this[readIndex]
		
		if(isDefined(value)){
			this[writeIndex++] = this[readIndex++]
		} else {
			readIndex++
		}
	}

	this.length = writeIndex
}