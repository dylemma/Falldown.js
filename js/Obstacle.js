Falldown.Obstacle = function(spritePool) {

	var _sprite = spritePool.obtain();
	_sprite.visible = true;
	this.__defineGetter__("sprite", function(){ return _sprite; });
	
	/* Free the spriteHandle for use elsewhere */
	this.dispose = function(){
		if(_sprite) spritePool.free(_sprite);
		_sprite = undefined;
	}
	
	this.state = Falldown.ObstacleState.FALLING;
//	
	/* GET access to the position vector, which has methods for mutating itself */
	this.__defineGetter__("position", function(){ return this.sprite.position; });
//	
	/* GET access to the color vector, which has methods for mutating itself */
	this.__defineGetter__("color", function(){ return this.sprite.color; });
//	
//	/* GET/SET proxy to the spriteHandle's rotation */
//	this.__defineGetter__("rotation", function(){ return this.sprite.rotation; });
//	this.__defineSetter__("rotation", function(r){ this.rotation = r; });
//	
}

Falldown.ObstacleState = {
	FALLING: 1,
	DESTROYED: 2,
	CAUGHT: 3
}