class Juicescript {
	// TOKEN TYPES //
	static token_type = new Enum(
		// keywords
		"FUN", "GLOBAL",
		
		// literals
		"IDENTIFIER", "VARIABLE", "STRING", "NUMBER",
		
		// language constants
		"TRUE", "FALSE",
		"NULL",
		
		// operators
		"NOT",
		"EQUAL", "NOT_EQUAL",
		"STRICT_EQUAL", "STRICT_NOT_EQUAL",
		"GREATER", "GREATER_EQUAL",
		"LESS", "LESS_EQUAL"
		
		// meta stuff
		"EOF"
	);
	
	
	
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
		// DO SCANNING //
		// get lexer
		var lexer = new Juicescript_lexer(program_string, {
			io: this.io
		});
		
		// run lexical analysis
		var token_list = lexer.scan();
		/**/console.log(token_list);
	}
}