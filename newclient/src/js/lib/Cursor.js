function Cursor(targetVec, bounds){
	this.targetVec = targetVec
	this.bounds = bounds
}

Cursor.prototype.draw = function(context){
	var bounds = this.bounds
	var x = this.targetVec.x
	var y = this.targetVec.y

	context.save()
	// context.resetTransform()

	context.beginPath()

	// horizontal line
	context.moveTo(bounds.minX, y)
	context.lineTo(bounds.maxX, y)

	// vertical line
	context.moveTo(x, bounds.minY)
	context.lineTo(x, bounds.maxY)

	context.globalAlpha = 0.2
	context.lineStyle = '#ccc'
	context.lineWidth = 0.5
	context.stroke()

	context.restore()
}

module.exports = Cursor