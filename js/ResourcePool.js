Falldown.ResourcePool = function(createNew, deallocate, initialCount, blockSize) {
	initialCount = initialCount || 100;
	blockSize = blockSize || 10;
	deallocate = deallocate || function(r){};
	
	var resources = new Array(initialCount || 100);
	for(var i=0; i<resources.length; ++i){
		resources[i] = createNew();
	}
	
	this.obtain = function(){
		if(!resources.length){
			for(var i=0; i<blockSize; i++){
				resources.push(createNew());
			}
		}
		return resources.pop();
	}
	
	this.free = function(resource) {
		resources.push(resource);
		deallocate(resource);
	}
}