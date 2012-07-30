Falldown.ObstacleSpriteHandle = function(ref, free) {
	this.sprite = ref;
	this.free = free;
}

Falldown.ObstacleSpritePool = function(initialSize, scene) {
	var map = THREE.ImageUtils.loadTexture("/img/block.png");
	
	var pool = new Array(initialSize);
	var avail = [];
	for(var i=0; i<initialSize; i++){
		pool[i] = makeNewSprite();
		avail.push(i);
	}
	
	function makeNewSprite() {
		var sprite = new THREE.Sprite( {map: map, useScreenCoordinates: true, color: 0xffffff} );
		sprite.visible = false;
		scene.add(sprite);
		return sprite;
	}
	
	function deallocateSprite(sprite) {
		sprite.visible = false;
	}
	/*
	this.obtain = function() {
		if(!avail.length){
			var pushedToIndex = pool.push(makeNewSprite());
			avail.push(pushedToIndex - 1);
//			avail.push( pool.push(makeNewSprite() ));
		}
		var index = avail.shift();
		var ref = pool[index];
		
		if(!ref){
			console.log('no ref @ index ' + index + ' of pool w/ ' + pool.length + ' nodes');
		}
		ref.z = index;
		
		function free() {
			avail.push(index);
			ref.visible = false;
		}
		
		return new Falldown.ObstacleSpriteHandle(ref, free);
	}
	
	this.debugPrint = function() {
		console.log("pool availability: ", avail);
		console.log("pool contents: ", pool);
	}
	
	this.status = function() {
		return {
			poolSize: pool.length,
			numFree: avail.length
		};
	}
	*/
}