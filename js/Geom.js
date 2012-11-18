define(function(){
	
	/**
	 * Vec2 stands for Vector2D. It has an `x` and `y` property
	 */
	
	function Vec2(_x, _y){
		this.x = _x || 0
		this.y = _y || 0
	}
	
	Vec2.prototype.length = function(){
		return Math.sqrt(this.length2())
	}
	
	Vec2.prototype.length2 = function(){
		return this.x*this.x + this.y*this.y
	}
	
	Vec2.prototype.set = function(x,y){
		if(x instanceof Vec2){
			this.x = x.x
			this.y = y.y
		} else {
			this.x = x
			this.y = y
		}
	}
	
	Vec2.prototype.addSelf = function(x,y){
		if(x instanceof Vec2){
			this.x += x.x
			this.y += x.y
		} else {
			this.x += x
			this.y += y
		}
		return this
	}
	
	Vec2.prototype.subSelf = function(x,y){
		if(x instanceof Vec2){
			this.x -= x.x
			this.y -= x.y
		} else {
			this.x -= x
			this.y -= y
		}
	}
	
	Vec2.prototype.negateSelf = function(){
		this.x = -this.x
		this.y = -this.y
		return this
	}
	
	Vec2.prototype.scaleSelf = function(s){
		this.x *= s
		this.y *= s
		return this
	}
	
	Vec2.prototype.divideSelf = function(s){
		return this.scaleSelf(1/s)
	}
	
	
	function Rectangle(x,y,width,height){
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		
		this.__defineGetter__('maxX', function(){ return this.x + this.width })
		this.__defineGetter__('maxY', function(){ return this.y + this.height })
		this.__defineGetter__('minX', function(){ return this.x })
		this.__defineGetter__('minY', function(){ return this.y })
	}
	
	/** Check if this Rectangle intersects with `that` Rectangle */
	Rectangle.prototype.intersects = function(that){
		var noHit = (this.minX > that.maxX) ||
			(this.maxX < that.minX) ||
			(this.minY > that.maxY) ||
			(this.maxY < that.minY)
		return !noHit
	}
	
	/** Check if this Rectangle contains a `point` */
	Rectangle.prototype.contains = function(point){
		return (point.x >= this.minX) &&
			(point.x <= this.maxX) &&
			(point.y >= this.minY) &&
			(point.y <= this.maxY)
	}
	
	Rectangle.prototype.expand = function(left, top, right, bottom){
		//expand(amt) => expand equally on all sides
		//expand(horiz, vert) => expand x by horiz, y by vert
		//expand(l,t,r,b) => expand all sides individually
		if(isNaN(top)){
			top = right = bottom = left
		} else if(isNaN(right)){
			right = left
			bottom = top
		}
		
		this.x -= left
		this.width += left + right
		this.y -= top
		this.height += top + bottom
	}
	
	
	/**
	 * Dynamics represents an object in 2D space that has
	 * a `position`, `velocity`, `acceleration`, along with
	 * a `mass` and `forces` that affect the previous things.
	 */
	
	function Dynamics(_mass){
		this.mass = _mass || 1
		this.position = new Vec2()
		this.velocity = new Vec2()
		this.acceleration = new Vec2()
		this.forces = new Vec2()
	}
	
	Dynamics.prototype.reset = function(){
		this.position.set(0, 0)
		this.velocity.set(0, 0)
		this.acceleration.set(0, 0)
		this.forces.set(0, 0)
	}
	
	Dynamics.prototype.push = function(force){
		this.forces.addSelf(force)
		return this
	}
	
	Dynamics.prototype.step = function(){
		//F = m*a, so a = F/m
		this.forces.divideSelf(this.mass)
		this.acceleration.addSelf(this.forces)
		this.forces.set(0,0)
		
		this.velocity.addSelf(this.acceleration)
		this.position.addSelf(this.velocity)
		
		return this
	}
	
	
	
	// return the module definition
	return {
		'Vec2': Vec2,
		'Rectangle': Rectangle,
		'Dynamics': Dynamics
	}
	
})