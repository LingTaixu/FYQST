class Actor {
	constructor(actorType, id){
		this.actorType = actorType;
		this.id = id;
		this.maxHp = 0;
		this.hp = 0; 
	}
	getId(){
		return this.id;
	}
	getActorType(){
		return this.actorType;
	}
	getMaxHp(){
		return this.maxHp;
	}
	setMaxHp(hp){
		this.maxHp = hp;
	} 	
	getHp(){
		return this.hp;
	}
	setHp(hp){ 
		this.hp = hp;
	}   
}

class Target {
	constructor(type, id, heroId){
		this.type = type;	// 标识
		this.id = id;	
		this.heroId = heroId;	
	}
}

module.exports.Actor = Actor;
module.exports.Target = Target;
