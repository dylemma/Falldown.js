(function(falldown){

	var Controller = falldown.Controller = function(world){
		this.world = world
		
		var self = this
		$(document).mousemove(function(e){
			world.input.cursor.screen.set(
				e.pageX - self.world.svgElement.offsetLeft,
				e.pageY - self.world.svgElement.offsetTop
			)
		})
	}
	
})(window.falldown || (window.falldown = {}))