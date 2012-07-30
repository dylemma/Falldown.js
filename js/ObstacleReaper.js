Falldown.ObstacleReaper = function(reap){
	this.reap = reap;
}

Falldown.DefaultObstacleReaper = function() {
	Falldown.ObstacleReaper.call(this, reap);
	
	function reap(obstacles){ 
		obstacles.forEach(function(obs){
			if(obs.state == Falldown.ObstacleState.CAUGHT)
				console.log("pretend I'm playing a happy 'caught' sound");
			obs.dispose();
		});
	}
}