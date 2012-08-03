Falldown.SpritePool = function(url, scene){
	var texture = THREE.ImageUtils.loadTexture(url);
	
	function makeNewSprite() {
		var sprite = new THREE.Sprite( {map: texture, useScreenCoordinates: true, color: 0xffffff} );
		sprite.visible = false;
		scene.add(sprite);
		return sprite;
	}
	
	function deallocateSprite(sprite) {
		sprite.visible = false;
	}
	
	Falldown.ResourcePool.call(this, makeNewSprite, deallocateSprite);
}