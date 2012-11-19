(function(falldown){

	var scrapVec = new geom.Vector()

	var Renderer = falldown.Renderer = function(layers){
		this.layers = layers
		this.plugins = []
	}

	Renderer.prototype.render = function(world){
		world = world || {}
		
		var svgLayers = world.svg.selectAll('g.layer').data(this.layers)
		svgLayers.enter().append('svg:g')
			.attr('class', 'layer')
			.attr('id', function(d){ return d })
		
		var self = this
		this.plugins.forEach(function(plugin){
			var layer = self.getLayer(world, plugin.layer),
				data = plugin.getData(world)
			plugin.render(layer, world, data)
		})
	}
	
	Renderer.prototype.getLayer = function(world, layerId){
		return world.svg.selectAll('g.layer#' + layerId)
	}
	
	var RendererPlugin = falldown.RendererPlugin = function(layer, getData, render){
		this.layer = layer
		this.getData = getData || function(world){ return undefined }
		this.render = render || function(svgLayer, world, data){}
	}

})(window.falldown || (window.falldown = {}))