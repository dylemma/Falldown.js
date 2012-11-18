(function(falldown){
	
	var World = falldown.World = function(svg){
		//size-related attributes
		this.bounds = new geom.Rectangle(0, 0, 100, 100)
		this.screenBounds = new geom.Rectangle(0, 0, 500, 500)
		this.xScale = d3.scale.linear()
		this.yScale = d3.scale.linear()
		this.resized()
		
		//display-related attributes
		this.$svg = $(svg)
		this.svgElement = this.$svg[0]
		this.svg = d3.select(svg)
			.attr('height', this.screenBounds.height)
			.attr('width', this.screenBounds.width)
		
		//input-related attributes
		this.input = {
			cursor: {
				screen: new geom.Vector()
			}
		}
		
		//content-related attributes
		this.blocks = []
	}
	
	World.prototype.resized = function(){
		this.xScale
			.domain([this.bounds.minX, this.bounds.maxX])
			.range([this.screenBounds.minX, this.screenBounds.maxX])
		this.yScale
			.domain([this.bounds.minY, this.bounds.maxY])
			.range([this.screenBounds.minY, this.screenBounds.maxY])
	}

})(window.falldown || (window.falldown = {}))