/*! Juicescript.js v1.0.0-a | (c) DrMaxNix 2022 | juice.drmaxnix.de */

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
	}
	
	
	
	
	
	// DEBUG STUFFS //
	parse(program_string){
		this.program_string = program_string;
	}
	
	run(){
		this.io_stdout(this.program_string);
		this.io_stderr_debug("This debug is a test");
		this.io_stderr_info("This info is a test");
		this.io_stderr_warning("This warning is a test");
		this.io_stderr_error("This error is a test");
	}
	
	
	
	
	
	io_stdout(text){
		this.callback.stdout(text);
	}
	io_stderr_debug(text){
		this.callback.stderr("[DEBUG] " + text, "debug");
	}
	io_stderr_info(text){
		this.callback.stderr("[INFO ] " + text, "info");
	}
	io_stderr_warning(text){
		this.callback.stderr("[WARN ] " + text, "warning");
	}
	io_stderr_error(text){
		this.callback.stderr("[ERROR] " + text, "error");
	}
}
