/*! Juicescript.js v1.0.0-a | (c) DrMaxNix 2022 | juice.drmaxnix.de */

/////////////////////////
// M A I N   C L A S S //
/////////////////////////

class Juicescript {
	/*
		CONSTRUCTOR: Return new juicescript parser with OPTIONS
	*/
	constructor(options){
		// STORE CALLBACKS //
		// save
		if(options.callback !== undefined){
			this.callback = options.callback;
		}
		
		// check if all have been set
		if(!(this.callback.stdout instanceof Function)){
			throw "invalid stdout callback";
		}
		if(!(this.callback.stderr instanceof Function)){
			throw "invalid stderr callback";
		}
		
		
		// GET IO ADAPTER //
		this.io = new Juicescript_io(this.callback);
	}
	
	/*
		Parse given PROGRAM-STRING and store syntax tree
	*/
	parse(program_string){
		
	}
	
	
	
	
	
	// DEBUG STUFFS //
	run(){
		this.io.stdout("stdout text");
		this.io.stderr.debug("This debug is a test");
		this.io.stderr.info("This info is a test");
		this.io.stderr.warning("This warning is a test");
		this.io.stderr.error("This error is a test");
	}
}





/////////////////////////////////
// I N P U T   /   O U T P U T //
/////////////////////////////////

class Juicescript_io {
	/*
		CONSTRUCTOR: Return new juicescript io adapter with CALLBACKs
	*/
	constructor(callback){
		// store callbacks
		this.callback = callback;
	}
	
	/*
		HELPER: Stdout method
	*/
	stdout(text){
		this.callback.stdout(text);
	}
	
	/*
		GETTER: Return stderr method collection
	*/
	get stderr(){
		return {
			debug: (text) => {
				this.callback.stderr("[DEBUG] " + text, "debug");
			},
			info: (text) => {
				this.callback.stderr("[INFO ] " + text, "info");
			},
			warning: (text) => {
				this.callback.stderr("[WARN ] " + text, "warning");
			},
			error: (text) => {
				this.callback.stderr("[ERROR] " + text, "error");
			}
		}
	}
}
