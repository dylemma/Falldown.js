Falldown = {};

Falldown.targetFPS = 60;

Falldown.relativeFrameTime = function(dTime) {
	var normalFrameTime = 1000 / Falldown.targetFPS;
	return dTime / normalFrameTime;
}