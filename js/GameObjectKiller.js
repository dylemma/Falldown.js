Falldown.GameObjectKiller = function(kill){
	this.kill = kill;
	
	this.or = function(that){
		return new Falldown.GameObjectKiller(function(obstacle){
			return this.kill(obstacle) || that.kill(obstacle);
		});
	}
	
	this.and = function(that){ return new Falldown.AndKiller(this, that); }
	this.or = function(that) { return new Falldown.OrKiller(this, that); }
}

Falldown.AndKiller = function(a, b){
	Falldown.GameObjectKiller.call(this, kill);
	function kill(obstacle) {
		return a.kill(obstacle) && b.kill(obstacle);
	}
}

Falldown.OrKiller = function(a, b){
	Falldown.GameObjectKiller.call(this, kill);
	function kill(obstacle) {
		return a.kill(obstacle) || b.kill(obstacle);
	}
}

Falldown.OutOfBoundsKiller = function(bounds) {
	Falldown.GameObjectKiller.call(this, kill);
	
	function kill(obstacle) {
		var pos = obstacle.position;
		if(
			pos.x < bounds.getLeft() ||
			pos.x > bounds.getRight() || 
			pos.y < bounds.getTop() ||
			pos.y > bounds.getBottom()
		){
			// TODO: obstacle.state = Falldown.GameObjectState.OUT_OF_BOUNDS
			return true;
		}
		return false;
	}
}

Falldown.ObstacleKiller = function(yMax) {
	Falldown.GameObjectKiller.call(this, kill);
	
	function kill(obstacle) {
		var p = obstacle.position;
		if(p.y > yMax){
			obstacle.state = Falldown.ObstacleState.DESTROYED;
			return true;
		} else {
			return false;
		}
	}
}

Falldown.CatchingKiller = function(positionVec) {
	Falldown.GameObjectKiller.call(this, kill);
	
	var minDistSquared = Math.pow(20, 2);
	
	function kill(obstacle) {
		var p = obstacle.position;
		if(p.distanceToSquared(positionVec) < minDistSquared){
			obstacle.state = Falldown.ObstacleState.CAUGHT;
			return true;
		} else {
			return false;
		}
	}
}