"use strict";
class Juicescript {
	// TOKEN TYPES //
	static token_type = new Juicescript_helper_enum(
		// keywords
		"DEF", "GLOBAL", "END",
		
		// literals
		"IDENTIFIER", "VARIABLE", "FLAG", "STRING", "NUMBER",
		
		// language constants
		"TRUE", "FALSE",
		"NULL",
		
		// operators
		"NOT",
		"EQUAL", "NOT_EQUAL",
		"GREATER", "GREATER_EQUAL",
		"LESS", "LESS_EQUAL",
		
		// brackets
		"BRACKET_SQUARE_OPEN", "BRACKET_SQUARE_CLOSE",
		"BRACKET_CURLY_OPEN", "BRACKET_CURLY_CLOSE",
		
		// special chars
		"AMPERSAND",
		
		// delimiters
		"DELIMITER",
		
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
		// CLEAR OLD PROGRAM TREE //
		this.program_tree = null;
		
		
		// DO SCANNING //
		// get lexer
		let lexer = new Juicescript_lexer(program_string, {
			io: this.io
		});
		
		// run lexical analysis
		let token_list = lexer.scan();
		
		// stop here if unsuccessful
		if(lexer.error_count > 0) return false;
		
		
		// GET PROGRAM TREE FROM TOKENS //
		// get parser
		let parser = new Juicescript_parser(token_list, {
			io: this.io
		});
		
		// do parsing
		let program_tree = parser.parse();
		
		// store program tree
		this.program_tree = program_tree;
		
		// stop here if unsuccessful
		if(parser.error_count > 0) return false;
		
		
		// RETURN SUCCESS //
		return true;
	}
	
	/*
		Run previously parsed program
	*/
	run(){
		//*/ TODO
	}
}
