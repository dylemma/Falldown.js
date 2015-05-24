/*
Take a css color string (e.g. 'blue', '#fff', etc)
and compute the RGB value of that color, passing
the R, G, and B values back as arguments to the
`rgbCallback` function.
*/
function computeRgb(cssColor, rgbCallback){
	colorDiv.style.color = cssColor
	var computedColor = colorDivStyle.color
	var rgbMatch = rgbRegex.exec(computedColor)
	if(rgbMatch){
		// rgbMatch = [computedColor, 'rr', 'gg', 'bb']
		rgbCallback(+rgbMatch[1], +rgbMatch[2], +rgbMatch[3])
	} else {
		console.error('Failed to parse computed color:', computedColor)
		rgbCallback(0, 0, 0)
	}
}
exports.computeRgb = computeRgb

/*
Utilities for `computeRgb`.
The `colorDiv` goes in the DOM invisibly,
and whenever its `.style.color` is changed,
the corresponding `colorDivStyle` will be
updated. The `rgbRegex` can be used to parse
out the computed RGB values.
*/
var colorDiv = document.createElement('div')
colorDiv.style.display = 'none'
document.body.appendChild(colorDiv)
var colorDivStyle = getComputedStyle(colorDiv)
var rgbRegex = /rgb\((\d+), (\d+), (\d+)\)/

/*
Converts an RGB color to HSL.
Assumes r, g, and b are in [0, 255].
Passes the h, s, and l values (which are in [0, 1]) to the hslCallback.
Adapted from http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
*/
function rgbToHsl(r, g, b, hslCallback){
	r /= 255, g /= 255, b /= 255
	var max = Math.max(r, g, b), min = Math.min(r, g, b)
	var h, s, l = (max + min) / 2

	if(max == min){
		h = s = 0 // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
		switch(max){
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}
		h /= 6
	}

	hslCallback(h, s, l)
}
exports.rgbToHsl = rgbToHsl

/*
Converts an HSL color to RGB.
Assumes h, s, and l are in [0, 1].
Passes the r, g, and b values (which are in [0, 255]) to the rgbCallback.
Adapted from http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
*/
function hslToRgb(h, s, l, rgbCallback){
	var r, g, b
	if(s == 0){
		r = g = b = 1 // achromatic
	} else {
		function hueToRgb(p, q, t){
			if(t < 0) t += 1
			if(t > 1) t -= 1
			if(t < 1/6) return p + (q - p) * 6 * t
			if(t < 1/2) return q
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6
			return p
		}
		var q = l < 0.5 ? l * (1 + s) : l + s - l * s
		var p = 2 * l - q
		r = hueToRgb(p, q, h + 1/3)
		g = hueToRgb(p, q, h)
		b = hueToRgb(p, q, h - 1/3)
	}
	rgbCallback(r * 255, g * 255, b * 255)
}
exports.hslToRgb = hslToRgb