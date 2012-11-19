withNamespace('falldown', function(falldown){

	var scrap = new geom.Vector()

	var System = falldown.System = function(world){
		this.world = world
		this.sysData = {
			deathBounds: new geom.Rectangle()
		}
	}
	
	function pickRandomSpawnPos(worldBounds){
		var x = Random.next(worldBounds.minX, worldBounds.maxX),
			y = worldBounds.minY - 10
		return new geom.Vector(x,y)
	}
	
	var blockFactory = falldown.Block.factory()
		.position(function(){ return pickRandomSpawnPos(system.world.bounds) })
		.velocity(function(){ return new geom.Vector(0, Random.next(0.5, 0.8)) })
		.angle(function(){ return Random.nextInt(360) })
		.rSpeed(function(){ return Random.next(-5, 5) })
		
	var intervalSpawn = falldown.spawner(blockFactory).when(falldown.spawner.interval(5))
	
	var killerFunc = falldown.killer.multi([
		falldown.killer.outOfBounds(),
		falldown.killer.playerHit(4)
	])
	
	System.prototype.step = function(){
		var world = this.world
		
		stepPlayer(this)
		stepParticles(this)
	
		var blocks = world.blocks
		
		intervalSpawn(this, blocks)
		
		var deadBlocks = {},
			reapedBlocks = []
		if(blocks && blocks.length){
			stepBlocks(this, blocks)//, deadBlocks)
			var deadBlocks = killerFunc(blocks, this)
			//TODO: handle deaths by removing items from the blocks list and "reaping" them later
			for(idx in deadBlocks){
				reapedBlocks.push({block: blocks[idx], reason: deadBlocks[idx]})
				blocks[idx] = undefined
			}
			blocks.flattenInPlace()
		}
		
		//TODO: this functionality should be inside an actual reaper instance
		reapedBlocks.forEach(function(reaped){
			if(reaped.reason === 'hitPlayer'){
				var block = reaped.block,
					burst = falldown.particle.burst(block.position, block.color, {
						velocity: block.velocity
					}),
					psys = world.particleSystems['front']
					
				if(psys.canAddBehavior(burst)){
					world.particleSystems['front'].addBehavior(burst)
				}
			}
		})
		
		
	}
	
	var stepPlayer = function(system){
		var recentDx = system.sysData.recentPlayerMovement || (system.sysData.recentPlayerMovement = [])
			world = system.world,
			bounds = world.bounds,
			player = world.player,
			targetX = world.xScale.invert(world.input.cursor.screen.x)
			
		if(!player) return
		
		var dx = targetX - player.position.x
		
		
		var oldX = player.position.x
		var x = (player.position.x += dx * 0.9)
		player.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, x))
		
		var actualDx = player.position.x - oldX
		//maintain the latest 5 dx values
		recentDx.push(actualDx)
		if(recentDx.length > 5) recentDx.shift()
		var recentMovement = recentDx.reduce(function(a,b){ return a+b })
		
		//set the player's angle based on its recent movement
		var angle = (Math.abs(recentMovement) > 1) ? recentMovement : 0
		player.angle = Math.max(-90, Math.min(90,angle))
	}
	
	var stepBlocks = function(system, blocks, deadBlocks){
		blocks.forEach(function(block, index){
			block.position.addSelf(block.velocity)
			block.angle += block.rSpeed
		})
	}
	
	var stepParticles = function(system){
		var ps = system.world.particleSystems
		for(key in ps){
			ps[key].step()
		}
	}

})