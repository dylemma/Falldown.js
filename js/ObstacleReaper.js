Falldown.ObstacleReaper = function(reap){
	this.reap = reap;
}

Falldown.DefaultObstacleReaper = function(sound) {
	Falldown.ObstacleReaper.call(this, reap);
	
	function reap(obstacles){ 
		obstacles.forEach(function(obs){
			if(obs.state == Falldown.ObstacleState.CAUGHT){
				var pitch = Math.random() * 1.5 + 0.5;
				sound.play({pitch: pitch});
				console.log("pretend I'm playing a happy 'caught' sound");
			}
			obs.dispose();
		});
	}
}