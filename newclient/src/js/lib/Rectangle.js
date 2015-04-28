var Vec = require('victor')

function Rectangle(x, y, width, height){
	this.x = x || 0
	this.y = y || 0
	this.width = width || 0
	this.height = height || 0

}
function makeProp(name, get){
	Object.defineProperty(Rectangle.prototype, name, { 'get': get })
}

makeProp('minX', function(){ return this.x })
makeProp('minY', function(){ return this.y })
makeProp('maxX', function(){ return this.x + this.width })
makeProp('maxY', function(){ return this.y + this.height })

module.exports = Rectangle