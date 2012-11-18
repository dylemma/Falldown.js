$(document).ready(function(){

	var world = window.world = new falldown.World('svg')
	var renderer = window.renderer = new falldown.Renderer()
	var system = window.system = new falldown.System(world)
	var controller = new falldown.Controller(world)
	
	var player = world.player = new falldown.Player({
		x: 50,
		y: 90
	})
	
	var factory = falldown.Block.factory()
	window.spawner = falldown.spawner(factory).when(falldown.spawner.interval(5))
	
	world.particleSystems = []
	window.psys = world.particleSystems[0] = new falldown.ParticleSystem(500) 
	
	psys.addBehavior(falldown.particleWave(
		new geom.Vector(50, -10), //start
		new geom.Vector(50, 110), //end
		100, //width
		90, //duration
		100 //numParticles
	))
	
	psys.addBehavior(falldown.particleWave(
		new geom.Vector(50, 110), //end
		new geom.Vector(50, -10), //start
		100,
		90,
		100
	))
	
	function loop(){
		webkitRequestAnimationFrame(loop)
		system.step()
		renderer.render(world)
	}
	
	loop()
})