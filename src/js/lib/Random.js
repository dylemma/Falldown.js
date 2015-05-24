function fromArray(arr){
	return arr[Math.floor(Math.random() * arr.length)]
}
exports.fromArray = fromArray

function inRange(min, max){
	return Math.random() * (max - min) + min
}
exports.inRange = inRange

function negate(){
	return Math.random() > .5 ? 1 : -1
}
exports.negate = negate