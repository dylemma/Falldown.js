withNamespace('geom', function(geom){

	var Vector = geom.Vector = function(x, y){
		this.x = x || 0
		this.y = y || 0
	}
	
	Vector.scrap = new geom.Vector()
	
	Vector.prototype.length = function(){
		return Math.sqrt(this.length2())
	}
	
	Vector.prototype.length2 = function(){
		return this.x*this.x + this.y*this.y
	}
	
	Vector.prototype.normalize = function(){
		return this.divide(this.length())
	}
	
	Vector.prototype.set = function(x,y){
		if(x instanceof Vector){
			this.x = x.x
			this.y = x.y
		} else {
			this.x = x
			this.y = y
		}
		return this
	}
	
	Vector.prototype.add = function(x,y){
		if(x instanceof Vector){
			this.x += x.x
			this.y += x.y
		} else {
			this.x += x
			this.y += y
		}
		return this
	}
	
	Vector.prototype.sub = function(x,y){
		if(x instanceof Vector){
			this.x -= x.x
			this.y -= x.y
		} else {
			this.x -= x
			this.y -= y
		}
		return this
	}
	
	Vector.prototype.negate = function(){
		this.x = -this.x
		this.y = -this.y
		return this
	}
	
	Vector.prototype.scale = function(s){
		this.x *= s
		this.y *= s
		return this
	}
	
	Vector.prototype.divide = function(s){
		return this.scale(1/s)
	}
	
	var Rectangle = geom.Rectangle = function(x,y,width,height){
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}
	
	Object.defineProperty(Rectangle.prototype, 'maxX', { get: function(){ return this.x + this.width } })
	Object.defineProperty(Rectangle.prototype, 'maxY', { get: function(){ return this.y + this.height } })
	Object.defineProperty(Rectangle.prototype, 'minX', { get: function(){ return this.x } })
	Object.defineProperty(Rectangle.prototype, 'minY', { get: function(){ return this.y } })
	
	
	Rectangle.prototype.copyValues = function(rect){
		this.x = rect.x
		this.y = rect.y
		this.width = rect.width
		this.height = rect.height
		return this
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
		
		return this
	}

})