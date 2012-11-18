$(document).ready(function(){

	var world = window.world = new falldown.World('svg')
	var renderer = window.renderer = new falldown.Renderer()
	var system = window.system = new falldown.System(world)
	var controller = new falldown.Controller(world)
	
	var player = world.player = new falldown.Player({
		x: 50,
		y: 70
	})
	
	var factory = falldown.Block.factory()
	window.spawner = falldown.spawner(factory).when(falldown.spawner.interval(5))
	
	world.particleSystems = []
	window.psys = world.particleSystems[0] = new falldown.particle.ParticleSystem({numParticles: 200}) 
	
	
	psys.addBehavior(falldown.particle.wave(
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
	
	psys.addBehavior(falldown.particle.emitter(
		player.position,
		new geom.Vector(0, 1),
		30
	))
	
	function loop(){
		webkitRequestAnimationFrame(loop)
		system.step()
		renderer.render(world)
	}
	
	loop()
})