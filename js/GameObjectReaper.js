Falldown.GameObjectReaper = function(reap){
	this.reap = reap;
}

Falldown.ObstacleReaper = function(sound) {
	Falldown.GameObjectReaper.call(this, reap);
	
	function reap(obstacles){ 
		obstacles.forEach(function(obs){
			if(obs.state == Falldown.ObstacleState.CAUGHT){
				var pitch = Math.random() * 1 + 1;
				sound.play({pitch: pitch});
			}
			obs.dispose();
		});
	}
}

Falldown.PowerupReaper = function(sound, player) {
	Falldown.GameObjectReaper.call(this, reap);
	
	function reap(powerups){ 
		powerups.forEach(function(obj){
			if(obj.state == Falldown.ObstacleState.CAUGHT){
				if(obj.onCatch){
					obj.onCatch(player);
				}
				sound.play();
			}
			obj.dispose();
		});
	}
}