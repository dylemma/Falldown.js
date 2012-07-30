Falldown.ObstacleUpdater = function(update) {
	this.update = update;

	this.andThen = function(next) {
		return new Falldown.CompositeObstacleUpdater(this, next);
	}
}

Falldown.DefaultObstacleUpdater = function(){
	Falldown.ObstacleUpdater.call(this, updateAll);
	
	function updateAll(obstacles) {
		obstacles.forEach(updateObstacle);
	}
	
	function updateObstacle(obstacle, i) {
		var sprite = obstacle.sprite;
		sprite.position.z = i * 0.01;
		sprite.position.y += obstacle.speed;
		sprite.rotation += Math.PI * obstacle.rspeed * 0.01;
	}
}

Falldown.CompositeObstacleUpdater = function(first, second){
	Falldown.ObstacleUpdater.call(this, update);
	
	function update(obstacles) {
		first.update(obstacles);
		second.update(obstacles);
	}
}