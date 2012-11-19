withNamespace('falldown.render', function(render){
	
	render.blocks = function(blockSize){
		var blockSize = blockSize || 8
		
		var renderBlocks = function(svgLayer, world, blocks){
			
			var rects = svgLayer.selectAll('g.block').data(blocks, function(d){ return d ? d.id : undefined })
			
			var newRects = rects.enter()
			
			rects.enter().append('svg:g')
				.attr('class', 'block')
			.append('svg:rect')
				.attr('x', -blockSize)
				.attr('y', -blockSize)
				.attr('width', blockSize * 2)
				.attr('height', blockSize * 2)
			
			rects.exit().remove();
			
			rects
				.attr('transform', function(d){
					var x = world.xScale(d.position.x),
						y = world.yScale(d.position.y)
					return 'translate(' + x + ',' + y + ')rotate(' + (d.angle + 30) + ')'
				})
			.selectAll('rect')
				.style('fill', function(d){ return d.color })
				.style('stroke', 'black')
		}
		
		var getBlocks = function(world){ return world.blocks || [] }
		
		return new falldown.RendererPlugin('blocks', getBlocks, renderBlocks)
	}
})