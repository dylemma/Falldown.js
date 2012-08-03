Falldown.GameObjectSystem = function(spawner, updater, killer, reaper){ 
	var self = this;
	
	this.gameObjects = [];
	
	this.spawnSprite = function(){
		this.gameObjects.push.apply(this.gameObjects, spawner.spawn());
	}
	
	this.update = function(){
		this.spawnSprite();
		var spritesCopy = [];
		var deadObstacles = [];

		updater.update(this.gameObjects);
		this.gameObjects.forEach(function(obstacle, i){
			(killer.kill(obstacle) ? deadObstacles : spritesCopy).push(obstacle);
		});
		reaper.reap(deadObstacles);
		this.gameObjects = spritesCopy;
	}
}