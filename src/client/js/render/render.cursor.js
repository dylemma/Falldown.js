(function(falldown){
	var render = falldown.render || (falldown.render = {})
	
	var renderCursor = function(svgLayer, world){
		var worldPos = {
			x: world.xScale.invert(world.input.cursor.screen.x),
			y: world.yScale.invert(world.input.cursor.screen.y)
		}
		var inBounds = world.bounds.contains(worldPos)
		//console.log(inBounds)
		
		var vLine = svgLayer.selectAll('line.cursor-v').data([worldPos]),
			hLine = svgLayer.selectAll('line.cursor-h').data([worldPos]),
			xScale = world.xScale,
			yScale = world.yScale
		
		vLine.enter().append('svg:line')
			.attr('class', 'cursor-v')
			.style('stroke', 'grey')
			.style('stroke-opacity', 0.1)
			.style('stroke-width', 1)
			
		hLine.enter().append('svg:line')
			.attr('class', 'cursor-h')
			.style('stroke', 'grey')
			.style('stroke-opacity', 0.1)
			.style('stroke-width', 1)
		
		vLine
			.style('visibility', inBounds ? 'visible' : 'hidden')
			.attr('x1', xScale(worldPos.x))
			.attr('x2', xScale(worldPos.x))
			.attr('y1', yScale(world.bounds.minY))
			.attr('y2', yScale(world.bounds.maxY))
			
		hLine
			.style('visibility', inBounds ? 'visible' : 'hidden')
			.attr('y1', xScale(worldPos.y))
			.attr('y2', xScale(worldPos.y))
			.attr('x1', yScale(world.bounds.minX))
			.attr('x2', yScale(world.bounds.maxX))
	}
	
	render.cursor = function(){
		return new falldown.RendererPlugin('cursors', undefined, renderCursor)
	}

})(window.falldown || (window.falldown = {}))