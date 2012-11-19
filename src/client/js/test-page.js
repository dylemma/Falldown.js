$(document).ready(function(){

	var world = window.world = new falldown.World('svg')
	var renderer = window.renderer = new falldown.Renderer([
		'frontParticles',
		'blocks',
		'midParticles',
		'player',
		'backParticles',
		'cursors'
	].reverse())
	var system = window.system = new falldown.System(world)
	var controller = new falldown.Controller(world)
	
	var player = world.player = new falldown.Player({
		x: 50,
		y: 70
	})
	
	renderer.plugins.push(falldown.render.player(6, 10))
	
	var factory = falldown.Block.factory()
	window.spawner = falldown.spawner(factory).when(falldown.spawner.interval(5))
	
	world.particleSystems = {
		'back': new falldown.particle.ParticleSystem({ numParticles: 100 }),
		'mid': new falldown.particle.ParticleSystem({ numParticles: 200 }),
		'front': new falldown.particle.ParticleSystem({ numParticles: 50 })
	}
	
	new Array('back', 'mid', 'front').forEach(function(s){
		var key = s
		var plugin = falldown.render.particles(
			s + 'Particles',
			function(world){ return world.particleSystems[key] }
		)
		renderer.plugins.push(plugin)
	})
	
	world.particleSystems['mid'].addBehavior(falldown.particle.wave(
		new geom.Vector(50, -10), //start
		new geom.Vector(50, 110), //end
		100, //width
		180, //duration
		100, //numParticles
		{
			amplitude: 5,
			color: function(){ return Random.pick(falldown.Block.colorPalette) }
		}
	))
	
	world.particleSystems['back'].addBehavior(falldown.particle.emitter(
		player.position,
		new geom.Vector(0, 1),
		30
	))
	
	renderer.plugins.push(falldown.render.blocks(8))
	renderer.plugins.push(falldown.render.cursor())
	
	function loop(){
		webkitRequestAnimationFrame(loop)
		system.step()
		renderer.render(world)
	}
	
	loop()
})