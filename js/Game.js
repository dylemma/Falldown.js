Falldown.Game = function(scene, renderer) {
	var game = this;
	
	this.player = new Falldown.Player(550, scene, renderer.domElement);
	
//	this.obstacles = new Falldown.ObstacleSystem(scene, player);
	
	this.audio = new Falldown.GameAudio();
	
	this.obstacleSystem = (function(){
		
		/*Initialize a spawner*/
		var spawnBounds = new THREE.Rectangle();
		spawnBounds.set(0, -40, 400, -40);
		var spritePool = Falldown.ObstacleSpawner.SpritePool(scene);
		var colors = Falldown.ObstacleSpawner.DefaultColors;
		var spawner = new Falldown.ObstacleSpawner.DefaultSpawner(4, spritePool, colors, spawnBounds);
		
		/*Initialize a killer. Part A is for things that fall off the bottom. Part B is for things that the player catches*/
		var killerA = new Falldown.DefaultObstacleKiller(640);
		var killerB = new Falldown.CatchingKiller(game.player.sprite.position);
		var killer = killerA.or(killerB);
		
		/*Initialize an updater*/
		var updater = new Falldown.DefaultObstacleUpdater();
		
		/*Initialize a reaper*/
		var reaper = new Falldown.DefaultObstacleReaper(game.audio.pop);
		
		return new Falldown.ObstacleSystem(spawner, updater, killer, reaper);
	})();
	
	this.update = function(){
		this.obstacleSystem.update();
	}
}