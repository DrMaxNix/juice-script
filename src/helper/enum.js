"use strict";
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
	
	/*
		HELPER: Check if ELEMENT is member of this enum
	*/
	has(element){
		return Object.values(this).includes(element);
	}
	
	/*
		GETTER: Return name of enum with VALUE
	*/
	name(value){
		return Object.keys(this).find(key => this[key] === value);
	}
}
