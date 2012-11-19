withNamespace('falldown.render', function(render){

	function playerShapePath(rx, ry){
		return 'M' + [0, -ry].join(',') +
			'L' + [rx, ry].join(',') +
			'Q' + [0, ry*0.4, -rx, ry].join(',') +
			'L' + [0, -ry]
	}
	
	
	//default player values = {rx: 6, ry: 10}
	render.player = function(rx, ry){
	
		var renderPlayer = function(layer, world, player){
			var g = layer.selectAll('g.player').data([world.player])
			
			g.enter().append('g').attr('class', 'player').append('svg:path')
				.attr('d', playerShapePath(rx, ry))
				.style('stroke', 'black')
				.style('stroke-width', 1)
			
			g
				.attr('fill', 'white')//function(d){ return d.color })
				.attr('transform', function(d){
					var coords = world.xScale(d.position.x) + ',' + world.yScale(d.position.y),
						t = 'translate(' + coords + ')',
						r = 'rotate(' + d.angle + ')'
					return t + r
				})
		}
		
		var getData = function(world){ return world.player }
		
		return new falldown.RendererPlugin('player', getData, renderPlayer)
	}
	
}) // end 'falldown.render' namespace