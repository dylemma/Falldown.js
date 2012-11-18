require(['jquery', 'lib/d3.v2', 'Geom', 'Obstacle', 'Random'], function($, __, Geom, O, Random){

	$(document).ready(function(){

		var Vec2 = Geom.Vec2,
			Obstacle = O.Obstacle,
			ObstacleState = O.ObstacleState

		var area = {
			width: 500,
			height: 500
		}
		var obstacles = []
		for(var i=0; i<50; i++){
			var o = new Obstacle
			obstacles[i] = o
			
			var pos = o.dynamics.position
			pos.x = Random.nextInRange(0, area.width)
			pos.y = Random.nextInRange(0, area.height)
		}
		
		var view = d3.select('body').append('svg')
			.attr('height', area.height)
			.attr('width', area.width)
			.attr('class', 'game-svg')
			
		var blocks = view.selectAll('.block').data(obstacles)
		var newBlocks = blocks.enter().append('rect')
			.attr('x', function(d){ return d.dynamics.position.x })
			.attr('y', function(d){ return d.dynamics.position.y })
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('height', 15)
			.attr('width', 15)
			.attr('color', function(d){ return Random.pick(O.ObstacleColors) })
			.attr('class', 'obstacle')
	})

})