/** Calculates a rectangle with the specified `aspectRatio`
  * That fits within the given `bounds` rectangle. Both the
  * `bounds` and return value will be an object in the form
  * {x, y, width, height}
  */
module.exports = function(bounds, aspectRatio){
	var targetW = Math.min(bounds.width, bounds.height * aspectRatio)
	var targetH = Math.min(bounds.height, bounds.width / aspectRatio)

	if(targetW < bounds.width){
		// extra space on the sides
		var sideWidth = (bounds.width - targetW) / 2
		return {
			x: bounds.x + sideWidth,
			y: bounds.y,
			width: targetW,
			height: bounds.height
		}
	} else {
		// extra space above and below
		var topHeight = (bounds.height - targetH) / 2
		return {
			x: bounds.x,
			y: bounds.y + topHeight,
			width: bounds.width,
			height: targetH
		}
	}
}