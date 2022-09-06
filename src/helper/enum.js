class Enum {
	constructor(...keys){
		keys.forEach((key, i) => {
			this[key] = i;
		});
		Object.freeze(this);
	}
	
	*[Symbol.iterator](){
		for(let key of Object.keys(this)){
			yield key;
		}
	}
}