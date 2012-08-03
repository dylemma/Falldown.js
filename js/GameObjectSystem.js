Falldown.GameObjectSystem = function(spawner, updater, killer, reaper){ 
	var self = this;
	
	this.gameObjects = [];
	
	this.spawnSprite = function(){
		this.gameObjects.push.apply(this.gameObjects, spawner.spawn());
	}
	
	this.update = function(dTime){
		this.spawnSprite();
		var spritesCopy = [];
		var deadObstacles = [];

//		console.log("update: dTime = " + dTime);
		updater.update(this.gameObjects, dTime);
		this.gameObjects.forEach(function(obstacle, i){
			(killer.kill(obstacle) ? deadObstacles : spritesCopy).push(obstacle);
		});
		reaper.reap(deadObstacles);
		this.gameObjects = spritesCopy;
	}
}