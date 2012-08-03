Falldown.GameObjectSpawner = {};

Falldown.GameObjectSpawner.DefaultColors = [0xff0000, 0xff9900, 0xffff00, 0x009900, 0x00ff99, 0x0000ff];

Falldown.ObstacleSpawner = function(interval, spritePool, colorSet, spawnBounds) {
	
	var count = 0;
	
	this.spawn = function() {
		count += Math.random();
		if(count >= interval){
			count = 0;
			
			//spawn stuff
			var obstacle = new Falldown.Obstacle(spritePool);
			obstacle.position.setX( THREE.Math.randFloat(spawnBounds.getLeft(), spawnBounds.getRight()) );
			obstacle.position.setY( THREE.Math.randFloat(spawnBounds.getBottom(), spawnBounds.getTop()) );
			obstacle.position.setZ(Math.random());
			
			obstacle.color.setHex( colorSet[Math.floor(Math.random() * colorSet.length)]);
			
			obstacle.velocity.setY( Math.random()*4 + 2 );
			obstacle.angularVelocity = Math.random() * Math.PI * 0.01;
			return [obstacle];
		} else {
			return [];
		}
	}
	
}