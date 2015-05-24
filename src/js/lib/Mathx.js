var tau = Math.PI * 2
exports.TAU = tau

var radsPerDeg = Math.PI / 180
exports.RADS_PER_DEG = radsPerDeg

var degsPerRad = 180 / Math.PI
exports.DEGS_PER_RAD = degsPerRad

function degs2rads(degs){ return degs * radsPerDeg }
exports.degs2rads = degs2rads

function rads2degs(rads){ return rads * degsPerRad }
exports.rads2degs = rads2degs

/**
 * Calculates a point along a cubic bezier curve.
 *
 * @param {Vec} a - The starting point
 * @param {Vec} c1 - The first control point
 * @param {Vec} c2 - The second control point
 * @param {Vec} b - The end point
 * @param {Number} t - The ratio of time along the curve, in [0, 1]
 * @param {Vec} out - The x and y results will be stored to this vector
 */
function cubicBezier(a, c1, c2, b, t, out){
	var b1 = (1-t)*(1-t)*(1-t)
	var b2 = 3*t*(1-t)*(1-t)
	var b3 = 3*t*t*(1-t)
	var b4 = t*t*t

	out.x = a.x*b1 + c1.x*b2 + c2.x*b3 + b.x*b4
	out.y = a.y*b1 + c1.y*b2 + c2.y*b3 + b.y*b4
}
exports.cubicBezier = cubicBezier