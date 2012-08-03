Falldown.Obstacle = function(spritePool) {
	Falldown.SpriteObject.call(this, spritePool);
	
	Falldown.GameObjectDynamics.call(this, {
		getPosition: function(){ return this.sprite.position; }
		,getRotation: function(){ return this.sprite.rotation; }
		,setRotation: function(r) { this.sprite.rotation = r; }
	});
	
	this.state = Falldown.ObstacleState.FALLING;
	
//	var _sprite = spritePool.obtain();
//	_sprite.visible = true;
//	this.__defineGetter__("sprite", function(){ return _sprite; });
//	
//	/* Free the spriteHandle for use elsewhere */
//	this.dispose = function(){
//		if(_sprite) spritePool.free(_sprite);
//		_sprite = undefined;
//	}
//	
////	
//	/** GET access to the position vector, which has methods for mutating itself */
//	this.__defineGetter__("position", function(){ return this.sprite.position; });
////	
//	/** GET access to the color vector, which has methods for mutating itself */
//	this.__defineGetter__("color", function(){ return this.sprite.color; });
}

Falldown.ObstacleState = {
	FALLING: 1,
	DESTROYED: 2,
	CAUGHT: 3
}

