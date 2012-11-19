withNamespace('falldown.render', function(render){
	
	render.particles = function(layer, getParticles){
	
		var renderParticleSystem = function(svgLayer, world, psys){
			var xScale = world.xScale,
				yScale = world.yScale
			var container = svgLayer.selectAll('g.' + psys.className).data([psys])
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
	
		return new falldown.RendererPlugin(layer, getParticles, renderParticleSystem)
	}

}) // end 'falldown.render' namespace