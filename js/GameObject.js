Falldown.GameObject = function(options) {
	options = options || {};
	
	this.init = this.init || function(){};
	if(typeof options.init == "function")
		this.init = this.init.andThen(options.init);

	this.dispose = this.dispose || function(){};
	if(typeof options.dispose == "function")
		this.dispose = this.dispose.andThen(options.dispose);
}

Falldown.SpriteObject = function(spritePool) {
	var _sprite = spritePool.obtain();
	_sprite.visible = true;
	this.__defineGetter__("sprite", function(){ return _sprite; });
	
	this.__defineGetter__("position", function(){ return _sprite.position; });
	this.__defineGetter__("color", function(){ return _sprite.color; });
	
	Falldown.GameObject.call(this, {
		dispose: function(){ 
			if(_sprite) spritePool.free(_sprite);
			_sprite = undefined;
		}
	});
}

Falldown.GameObjectDynamics = function(options) {
	options = options || {};
	
	/** Set up a getter for POSITION */
	var _position;
	if(options.getPosition){
		this.__defineGetter__("position", options.getPosition);
	} else {
		if(!this.__lookupGetter__("position") && !this.hasOwnProperty("position")){
			_position = new THREE.Vector3(0, 0, 0);
			this.__defineGetter__("position", function(){ return _position; });
		}
	}
	
	/** Set up a getter for VELOCITY */
	var _velocity;
	if(options.getVelocity){
		this.__defineGetter__("velocity", options.getVelocity);
	} else {
		if(!this.__lookupGetter__("velocity") && !this.hasOwnProperty("velocity")){
			_velocity = new THREE.Vector3(0, 0, 0);
			this.__defineGetter__("velocity", function(){ return _velocity; });
		}
	}
	
	if(options.getRotation){
		this.__defineGetter__("rotation", options.getRotation);
		if(options.setRotation){
			this.__defineSetter__("rotation", options.setRotation);
		}
	} else {
		if(!this.__lookupGetter__("rotation") && !this.__lookupSetter("rotation") && !this.hasOwnProperty("rotation")){
			this.rotation = 0;
		}
	}
	
	if(options.getAngularVelocity ){
		// if a getter is specified in options, use that as the getter
		this.__defineGetter__("angularVelocity", options.getAngularVelocity);
		// only use the options setter if there was also a getter
		if(options.setAngularVelocity)
			this.__defineSetter__("angularVelocity", options.setAngularVelocity);
	} else {
		if(!this.__lookupGetter__("angularVelocity") && !this.__lookupSetter__("angularVelocity") && !this.hasOwnProperty("angularVelocity")){
			this.angularVelocity = 0;
		}
	}
}