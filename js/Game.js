Falldown.Game = function(scene, renderer) {
	var game = this;
	
	var gameBounds = new THREE.Rectangle();
	gameBounds.set(0, 0, 400, 600);
	
	this.player = new Falldown.Player(550, scene, renderer.domElement);
	
	this.audio = new Falldown.GameAudio();
	
	this.obstacleSystem = (function(){
		
		/*Initialize a spawner*/
		var spawnBounds = new THREE.Rectangle();
		spawnBounds.set(0, -40, 400, -40);
		var spritePool = new Falldown.SpritePool("img/block.png", scene);
		var colors = Falldown.GameObjectSpawner.DefaultColors;
		var spawner = new Falldown.ObstacleSpawner(4, spritePool, colors, spawnBounds);
		
		/*Initialize a killer. Part A is for things that fall off the bottom. Part B is for things that the player catches*/
		var dynamicsBounds = new THREE.Rectangle();
			dynamicsBounds.addRectangle(gameBounds);
			dynamicsBounds.inflate(45);
		var killer0 = new Falldown.OutOfBoundsKiller(dynamicsBounds);
		var killerA = new Falldown.ObstacleKiller(640);
		var killerB = new Falldown.CatchingKiller(game.player.sprite.position);
		var killer = killer0.or(killerB);
		
		/*Initialize an updater*/
		var updater = new Falldown.DynamicsUpdater();
		
		/*Initialize a reaper*/
		var reaper = new Falldown.ObstacleReaper(game.audio.pop);
		
		return new Falldown.GameObjectSystem(spawner, updater, killer, reaper);
	})();
	
	this.update = function(dTime){
		this.player.update(dTime);
		this.obstacleSystem.update(dTime);
	}
}