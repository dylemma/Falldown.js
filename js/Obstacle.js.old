var obstacleCount = 0;

Falldown.Obstacle = function(spritePool) {
	var self = this;
	obstacleCount ++;
	this.id = obstacleCount;
	console.log("spawned obstacle no. " + obstacleCount);
	
	Falldown.SpriteObject.call(this, spritePool);
	
	Falldown.GameObjectDynamics.call(this, {
		getPosition: function(){ return this.sprite.position; }
		,getRotation: function(){ return this.sprite.rotation; }
		,setRotation: function(r) { this.sprite.rotation = r; }
	});
	
	Falldown.GameObject.call(this, {
		init: function(){ 
			self.state = Falldown.GameObjectState.ACTIVE;
		}
	});
	
//	this.state = Falldown.ObstacleState.FALLING;
}

Falldown.ObstacleState = {
	FALLING: 1,
	DESTROYED: 2,
	CAUGHT: 3
}

Falldown.ObstaclePool = function(spritePool) {
	var self = this;
	Falldown.ResourcePool.call(self, makeNewObstacle, deallocateObstacle);
	
	function makeNewObstacle() {
		var obstacle = new Falldown.Obstacle(spritePool);
		Falldown.GameObject.call(obstacle, {
			dispose: function(){ self.free(obstacle); }
		});
		return obstacle;
	}
	
	function deallocateObstacle(obstacle) {
		// no-op, I guess.
	}
}
