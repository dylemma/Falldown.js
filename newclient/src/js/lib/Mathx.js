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
