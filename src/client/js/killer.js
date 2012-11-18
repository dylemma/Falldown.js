(function(falldown){
	var killerId = 0

	var Killer = function(){
		this.id = killerId++
		
		/* Start: any optional setup steps */
		this.start = function(subjects, system, killerData){}
		
		/* Decide: return a string if the subject should be dead. The string is the reason for death. */
		this.decide = function(subject, system, killerData){ return undefined }
		
		/* Stop: any optional teardown steps */
		this.stop = function(subjects, system, killerData){}
	}
	
	function killerData(system, id){		
		var key = 'killerData' + id
		system.sysData[key] = system.sysData[key] || {}
		return system.sysData[key]
	}
	
	var killer = falldown.killer = function(){
		var k = new Killer(),
			behavior = function(subjects, system){
				var kdata = killerData(system, k.id),
					deaths = {}
				k.start(subjects, system, kdata)
				subjects.forEach(function(s,i){
					var d = k.decide(s, system, kdata)
					if(d) deaths[i] = d
				})
				k.stop(subjects, system, kdata)
				return deaths
			},
			api = function(subjects, system){ return behavior(subjects, system) }
		api.startWith = function(s){ 
			k.start = s 
			return this
		}
		api.decideWith = function(d){ 
			k.decide = d 
			return this
		}
		api.stopWith = function(s){ 
			k.stop = s 
			return this
		}
			
		return api
	}
	
	killer.outOfBounds = function(){		
		return killer()
			.startWith(function(blocks, system, kdata){
				(kdata.bounds = kdata.bounds || new geom.Rectangle())
					.copyValues(system.world.bounds).expand(0, 15)
			})
			.decideWith(function(block, system, kdata){
				if(!kdata.bounds.contains(block.position)) return 'outOfBounds'
				else return undefined
			})
	}
	
	killer.playerHit = function(distThreshold){
		var scrap = new geom.Vector()
		var maxDist = distThreshold * distThreshold
		return killer()
			.decideWith(function(block){
				var dist2 = scrap
					.set(block.position)
					.subSelf(system.world.player.position)
					.length2()
				if(dist2 < maxDist) return 'hitPlayer'
				return undefined
			})
	}
	
	killer.multi = function(killers){
		return function(subjects, system){
			var deaths = {}
			killers.forEach(function(kill){
				var d = kill(subjects, system)
				for(i in d) deaths[i] = d
			})
			return deaths
		}
	}

})(window.falldown || (window.falldown = {}))