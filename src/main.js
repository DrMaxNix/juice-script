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