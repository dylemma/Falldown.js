Falldown.GameObjectUpdater = function(update) {
	this.update = update;

	this.andThen = function(next) {
		return new Falldown.CompositeUpdater(this, next);
	}
}

Falldown.CompositeUpdater = function(first, second){
	Falldown.GameObjectUpdater.call(this, update);
	
	function update(obstacles) {
		first.update(obstacles);
		second.update(obstacles);
	}
}

Falldown.DynamicsUpdater = function() {
	Falldown.GameObjectUpdater.call(this, updateAll);
	
	var vector = new THREE.Vector3();
	
	function updateAll(objects, dTime) {
		var rft = Falldown.relativeFrameTime(dTime);
		objects.forEach(function(object){
			updateObject(object, rft);
		});
	}
	
	function updateObject(object, rft){
		vector.copy(object.velocity).multiplyScalar(rft);
		object.position.addSelf( object.velocity );
		object.rotation = object.rotation + (object.angularVelocity * rft);
	}
}
