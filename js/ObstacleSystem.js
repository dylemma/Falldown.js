Falldown.ObstacleSystem = function(scene, player){
	var self = this;
	
	this.obstacles = [];
	
	var spawnBounds = new THREE.Rectangle();
	spawnBounds.set(0, -40, 400, -40);
	console.log(Falldown.ObstacleSpawner);
	var spritePool = Falldown.ObstacleSpawner.SpritePool(scene);
	var colors = Falldown.ObstacleSpawner.DefaultColors;
	var spawner = new Falldown.ObstacleSpawner.DefaultSpawner(4, spritePool, colors, spawnBounds);
	
	var killerA = new Falldown.DefaultObstacleKiller(640);
	var killerB = new Falldown.CatchingKiller(player.sprite.position);
	var killer = killerA.or(killerB);
	
	var updater = new Falldown.DefaultObstacleUpdater();
	
	var reaper = new Falldown.DefaultObstacleReaper();
	
	this.spawnSprite = function(){
		this.obstacles.push.apply(this.obstacles, spawner.spawn());
	}
	
	this.update = function(){
		this.spawnSprite();
		var spritesCopy = [];
		var deadObstacles = [];

		updater.update(this.obstacles);
		this.obstacles.forEach(function(obstacle, i){
			(killer.kill(obstacle) ? deadObstacles : spritesCopy).push(obstacle);
		});
		reaper.reap(deadObstacles);
		this.obstacles = spritesCopy;
	}
}