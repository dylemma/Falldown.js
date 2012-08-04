Falldown.Game = function(scene, renderer) {
	var game = this;
	
	var gameBounds = new THREE.Rectangle();
	gameBounds.set(0, 0, 400, 600);
	
	this.player = new Falldown.Player(550, scene, renderer.domElement);
	
	this.audio = new Falldown.GameAudio();
	
		var spawnBounds = new THREE.Rectangle();
			spawnBounds.set(0, -40, 400, -40);
		var colorSet = Falldown.GameObjectSpawner.DefaultColors;
			
		function randomizePosition(obj){
			obj.position.setX( THREE.Math.randFloat(spawnBounds.getLeft(), spawnBounds.getRight()) );
			obj.position.setY( THREE.Math.randFloat(spawnBounds.getBottom(), spawnBounds.getTop()) );
			obj.position.setZ(Math.random());
		}
		
		function randomizeColor(obj){
			obj.color.setHex( colorSet[Math.floor(Math.random() * colorSet.length)]);
		}

		function randomizeVelocity(obj){
			obj.velocity.setY( Math.random()*4 + 2 );
			obj.angularVelocity = Math.random() * Math.PI * 0.01;
		}
		
		function setPowerupVelocity(obj) {
			obj.velocity.setY( 3 );
			obj.angularVelocity = Math.PI / 60;
		}
		
		function setPowerupScale(obj) {
			obj.sprite.scale.set(0.75, 0.75, 0.75);
		}
		
		function setPoweupColorChange(obj) {
			var color = obj.color.getHex();
			obj.powerupColor = color;
			
			obj.onCatch = function(player){
				player.color = obj.powerupColor;
			}
		}
		
		/*Initialize a spawner*/
		var blockSpritePool = new Falldown.SpritePool("img/block.png", scene);
		var colorchangeSpritePool = new Falldown.SpritePool("img/colorchange.png", scene);
		
		var obstaclePool = new Falldown.ObstaclePool(blockSpritePool);
		var powerupPool = new Falldown.PowerupPool(colorchangeSpritePool);
//		var spawner = new Falldown.ObstacleSpawner(4, obstaclePool, colors, spawnBounds);
		
		var obstacleSpawner = new Falldown.PooledSpawner(4, obstaclePool, randomizePosition.andThen(randomizeColor).andThen(randomizeVelocity));
		var powerupSpawner = new Falldown.PooledSpawner(100, powerupPool, 
			randomizePosition
				.andThen(randomizeColor)
				.andThen(setPowerupVelocity)
				.andThen(setPoweupColorChange)
		);
		
		/*Initialize a killer. Part A is for things that fall off the bottom. Part B is for things that the player catches*/
		var dynamicsBounds = new THREE.Rectangle();
			dynamicsBounds.addRectangle(gameBounds);
			dynamicsBounds.inflate(45);
		var boundsKiller = new Falldown.OutOfBoundsKiller(dynamicsBounds);
		var killerB = new Falldown.CatchingKiller(game.player.sprite.position);
		var killer = boundsKiller.or(killerB);
		
		/*Initialize an updater*/
		var updater = new Falldown.DynamicsUpdater();
		
		/*Initialize a reaper*/
		var reaper = new Falldown.ObstacleReaper(game.audio.pop);
		
		var powerupReaper = new Falldown.PowerupReaper(game.audio.powerup, game.player);
		
		this.powerupSystem = new Falldown.GameObjectSystem(powerupSpawner, updater, killer, powerupReaper);
		this.obstacleSystem = new Falldown.GameObjectSystem(obstacleSpawner, updater, killer, reaper);
	
	this.update = function(dTime){
		this.player.update(dTime);
		this.powerupSystem.update(dTime);
		this.obstacleSystem.update(dTime);
	}
}