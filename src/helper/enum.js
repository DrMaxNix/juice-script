class Juicescript_helper_enum {
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