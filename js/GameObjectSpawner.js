Falldown.GameObjectSpawner = {};

Falldown.GameObjectSpawner.DefaultColors = [0xff0000, 0xff9900, 0xffff00, 0x009900, 0x00ff99, 0x0000ff];

Falldown.GameObjectSpawner.ObstacleSpawner = function(interval, spritePool, colorSet, spawnBounds) {
	
	var count = 0;
	
	this.spawn = function() {
		count += Math.random();
		if(count >= interval){
			count = 0;
			
			//spawn stuff
			var obstacle = new Falldown.Obstacle(spritePool);
			obstacle.sprite.position.setX( THREE.Math.randFloat(spawnBounds.getLeft(), spawnBounds.getRight()) );
			obstacle.sprite.position.setY( THREE.Math.randFloat(spawnBounds.getBottom(), spawnBounds.getTop()) );
			
			obstacle.sprite.color.setHex( colorSet[Math.floor(Math.random() * colorSet.length)]);
			
			obstacle.speed = Math.random()*4 + 2;
			obstacle.rspeed = Math.random();
			return [obstacle];
		} else {
			return [];
		}
	}
	
}