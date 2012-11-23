withNamespace('falldown.util.color', function(colorUtil){

	var randomHueShift = colorUtil.randomHueShift = function(baseColor, opts){
		opts = opts || {}
		var base = d3.hsl(baseColor),
			scrap = d3.hsl(),
			hueStep = +opts.hueStep || 15,
			maxStep = +opts.maxStep || 1,
			minStep = +opts.minStep || -1
		return function(){
			var step = Random.nextInt(minStep, maxStep+1) * hueStep
			scrap.h = base.h + step
			scrap.s = base.s
			scrap.l = base.l
			return scrap.toString()
		}
	}
	
})