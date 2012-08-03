Falldown.Game = function(scene, renderer) {
	var game = this;
	
	this.player = new Falldown.Player(550, scene, renderer.domElement);
	
	this.audio = new Falldown.GameAudio();
	
	this.obstacleSystem = (function(){
		
		/*Initialize a spawner*/
		var spawnBounds = new THREE.Rectangle();
		spawnBounds.set(0, -40, 400, -40);
		var spritePool = new Falldown.SpritePool("img/block.png", scene);
		var colors = Falldown.GameObjectSpawner.DefaultColors;
		var spawner = new Falldown.GameObjectSpawner.ObstacleSpawner(4, spritePool, colors, spawnBounds);
		
		/*Initialize a killer. Part A is for things that fall off the bottom. Part B is for things that the player catches*/
		var killerA = new Falldown.ObstacleKiller(640);
		var killerB = new Falldown.CatchingKiller(game.player.sprite.position);
		var killer = killerA.or(killerB);
		
		/*Initialize an updater*/
		var updater = new Falldown.ObstacleUpdater();
		
		/*Initialize a reaper*/
		var reaper = new Falldown.ObstacleReaper(game.audio.pop);
		
		return new Falldown.GameObjectSystem(spawner, updater, killer, reaper);
	})();
	
	this.update = function(){
		this.player.update();
		this.obstacleSystem.update();
	}
}