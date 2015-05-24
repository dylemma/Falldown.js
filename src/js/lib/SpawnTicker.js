function SpawnTicker(interval){
	this.interval = interval
	this._ticker = 0
}

SpawnTicker.prototype.tick = function(){
	if(++this._ticker >= this.interval){
		this._ticker = 0
		return true
	} else {
		return false
	}
}

module.exports = SpawnTicker