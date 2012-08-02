Falldown.Player = function(playerY, scene, domElement) {
	var self = this;
	var _sprite = (function(){
		var map = THREE.ImageUtils.loadTexture("img/player.png");
		
		var sprite = new THREE.Sprite( {map: map, useScreenCoordinates: true, color: 0xffffff} );
		sprite.position.y = playerY;
		sprite.position.z = 10;
		
		scene.add(sprite);
		return sprite;
	})();
	
	var _color = 0xff9900;
	
	var numIndicators = 8;
	var _indicators = (function(){
		var discMap = THREE.ImageUtils.loadTexture("img/disc.png");
		var indicators = new Array(numIndicators);
		for(var i=0; i<numIndicators; i++){
			var disc = new THREE.Sprite({map: discMap, useScreenCoordinates: true, color: _color});
			var angle = Math.PI * 2 / numIndicators * i;
			disc.positionOffset = {
				x: Math.cos(angle) * 8,
				y: Math.sin(angle) * 8
			}
			disc.opacity = 0.5;
			disc.position.z = i;
			disc.scale.set(0.25, 0.25, 0.25);
			scene.add(disc);
			indicators[i] = disc;
		}
		return indicators;
	})();
	
	this.__defineGetter__( "sprite", function(){ return _sprite; } );
	this.__defineGetter__("indicators", function(){ return _indicators; });
	
	domElement.addEventListener("mousemove", handleMouseMove, this);
	
	function handleMouseMove(e){
		var dx = (e.offsetX - self.sprite.position.x) * 0.7;
		var pos = self.sprite.position;
		pos.x += dx;
		updateIndicatorPos(pos.x, pos.y);
	}
	
	function updateIndicatorPos(cx, cy){
		_indicators.forEach(function(ind){
			ind.position.x = ind.positionOffset.x + cx;
			ind.position.y = ind.positionOffset.y + cy;
		});
	}
	
	var spinAngle = 0;
	var spinStep = Math.PI * 5 / 180;
	var spinChunk = Math.PI * 2;
	this.update = function(){
		spinAngle += spinStep;
		if(spinAngle > spinChunk) spinAngle -= spinChunk;
		_sprite.rotation = spinAngle * -0.25;
		_indicators.forEach(function(ind, i){
			var myAngle = spinAngle + Math.PI * 2 * i * 2 / numIndicators;
			var scale = Math.sin(myAngle) * 0.125 + 0.25;
			ind.scale.set(scale, scale, scale);
		});
	}
	
	function setColor(color){
		_color = color;
		_indicators.forEach(function(ind){
			ind.color.setHex(color);
		});
	}
	
	this.__defineGetter__("color", function(){ return _color; });
	this.__defineSetter__("color", setColor);
}