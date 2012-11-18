(function(falldown){

	var scrapVec = new geom.Vector()

	var Renderer = falldown.Renderer = function(){}

	Renderer.prototype.render = function(world){
		world = world || {}
		
		renderCursor(this, world)
		
		if(world.blocks && world.blocks.length)
			renderBlocks(this, world)
			
		if(world.player)
			renderPlayer(this, world)
			
		if(world.particleSystems && world.particleSystems.forEach){
			world.particleSystems.forEach(function(psys){
				renderParticleSystem(this, world, psys)
			})
		}
	}
	
	var blockRadius = 8
	var renderBlocks = function(renderer, world){
		var blocks = world.blocks
		if(!blocks || !blocks.length) return
		
		var container = world.svg.selectAll('g.block-container').data([1])
		container.enter().append('svg:g').attr('class', 'block-container')
		
		var rects = container.selectAll('g.block').data(blocks, function(d){ return d ? d.id : undefined })
		
		var newRects = rects.enter()
		
		rects.enter().append('svg:g')
			.attr('class', 'block')
		.append('svg:rect')
			.attr('x', -blockRadius)
			.attr('y', -blockRadius)
			.attr('width', blockRadius * 2)
			.attr('height', blockRadius * 2)
		
		rects.exit().remove();
		
		rects
			.attr('transform', function(d){
				var x = world.xScale(d.position.x),
					y = world.yScale(d.position.y)
				return 'translate(' + x + ',' + y + ')rotate(' + d.angle + ')'
			})
		.selectAll('rect')
			.style('fill', function(d){ return d.color })
			.style('stroke', 'black')
	}
	
	var renderCursor = function(renderer, world){
		var worldPos = {
			x: world.xScale.invert(world.input.cursor.screen.x),
			y: world.yScale.invert(world.input.cursor.screen.y)
		}
		var inBounds = world.bounds.contains(worldPos)
		//console.log(inBounds)
		
		var vLine = world.svg.selectAll('line.cursor-v').data([worldPos]),
			hLine = world.svg.selectAll('line.cursor-h').data([worldPos]),
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
	
	function playerShapePath(rx, ry){
		return 'M' + [0, -ry].join(',') +
			'L' + [rx, ry].join(',') +
			'Q' + [0, ry*0.4, -rx, ry].join(',') +
			'L' + [0, -ry]
	}
	
	var renderPlayer = function(renderer, world){
		var g = world.svg.selectAll('g.player').data([world.player])
		
		g.enter().append('g').attr('class', 'player').append('svg:path')
			.attr('d', playerShapePath(6, 10))
			.style('stroke', 'black')
			.style('stroke-width', 1)
		
		g
			.attr('fill', function(d){ return d.color })
			.attr('transform', function(d){
				var t = 'translate(' + world.xScale(d.position.x) + ',' + world.yScale(d.position.y) + ')'
				var r = 'rotate(' + d.angle + ')'
				return t + r
			})
	}
	
	var renderParticleSystem = function(renderer, world, psys){
		var xScale = world.xScale,
			yScale = world.yScale
		var container = world.svg.selectAll('g.' + psys.className).data([psys])
		container.enter().append('svg:g').attr('class', psys.className)
		
		var particles = container.selectAll('circle').data(psys.particles)
		particles.enter().append('svg:circle')
		
		particles
			.attr('cx', function(d){ return xScale(d.position.x) })
			.attr('cy', function(d){ return yScale(d.position.y) })
			.attr('r', function(d){ return xScale(d.size) })
			.style('visibility', function(d){ return d.active ? 'visible' : 'hidden' })
			.style('fill', function(d){ return d.color })
			.style('opacity', function(d){ return d.opacity })
			
	}

})(window.falldown || (window.falldown = {}))