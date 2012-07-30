Falldown.Player = function(playerY, scene, domElement) {
	var self = this;
	var _sprite = (function(){
		var map = THREE.ImageUtils.loadTexture("/img/player.png");
		
		var sprite = new THREE.Sprite( {map: map, useScreenCoordinates: true, color: 0xffffff} );
		sprite.position.y = playerY;
		scene.add(sprite);
		return sprite;
	})();
	
	this.__defineGetter__( "sprite", function(){ return _sprite; } );
	
	domElement.addEventListener("mousemove", handleMouseMove, this);
	
	function handleMouseMove(e){
		var dx = (e.offsetX - self.sprite.position.x) * 0.7;
		self.sprite.position.x += dx;
	}
}