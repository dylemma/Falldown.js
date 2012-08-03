//Falldown.Powerup = function(spritePool, onCatch) {
//
//	this.onCatch = onCatch; // function(player){...}
//	
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
//	this.state = Falldown.ObstacleState.FALLING;
//
//	/* GET access to the position vector, which has methods for mutating itself */
//	this.__defineGetter__("position", function(){ return this.sprite.position; });
//
//	/* GET access to the color vector, which has methods for mutating itself */
//	this.__defineGetter__("color", function(){ return this.sprite.color; });
//}

var powerupCount = 0;

Falldown.Powerup = function(spritePool) {
	var self = this;
	powerupCount ++;
	this.id = powerupCount;
	console.log("spawned powerup no. " + powerupCount);
	
	Falldown.SpriteObject.call(this, spritePool);
	
	Falldown.GameObjectDynamics.call(this, {
		getPosition: function(){ return this.sprite.position; }
		,getRotation: function(){ return this.sprite.rotation; }
		,setRotation: function(r) { this.sprite.rotation = r; }
	});
	
	Falldown.GameObject.call(this, {
		init: function(){ 
			self.state = Falldown.GameObjectState.ACTIVE;
		}
	});
	
//	this.state = Falldown.ObstacleState.FALLING;
}

Falldown.PowerupPool = function(spritePool) {
	var self = this;
	Falldown.ResourcePool.call(self, makeNewPowerup, deallocatePowerup, 5, 1);
	
	function makeNewPowerup() {
		var powerup = new Falldown.Powerup(spritePool);
		Falldown.GameObject.call(powerup, {
			dispose: function(){ self.free(powerup); }
		});
		return powerup;
	}
	
	function deallocatePowerup(powerup) {
		// no-op, I guess.
	}
}
