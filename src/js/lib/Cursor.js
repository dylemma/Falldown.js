function Cursor(targetVec, bounds){
	this.targetVec = targetVec
	this.bounds = bounds
}

Cursor.prototype.draw = function(context, invScale){
	var bounds = this.bounds
	var x = this.targetVec.x
	var y = this.targetVec.y

	context.save()

	context.beginPath()

	// horizontal line
	context.moveTo(bounds.minX, y)
	context.lineTo(bounds.maxX, y)

	// vertical line
	context.moveTo(x, bounds.minY)
	context.lineTo(x, bounds.maxY)

	context.globalAlpha = 0.4
	context.strokeStyle = '#ccc'
	context.lineWidth = invScale * 2
	context.stroke()

	context.restore()
}

module.exports = Cursor