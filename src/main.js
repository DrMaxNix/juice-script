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
		"EQUAL_EQUAL", "NOT_EQUAL",
		"GREATER", "GREATER_EQUAL",
		"LESS", "LESS_EQUAL",
		
		// brackets
		"BRACKET_SQUARE_OPEN", "BRACKET_SQUARE_CLOSE",
		"BRACKET_CURLY_OPEN", "BRACKET_CURLY_CLOSE",
		
		// special chars
		"AMPERSAND", "QUESTION_MARK",
		
		// delimiters
		"DELIMITER",
		
		// meta stuff
		"EOF"
	);
	
	
	// ARGUMENT TYPES //
	static argument_type = new Juicescript_helper_enum(
		// parsable types
		"VARIABLE", "LITERAL", "OPERATOR", "IDENTIFIER",
		
		// meta types
		"VALUE"
	);
	
	
	// VARIABLE TYPES //
	static data_type = new Juicescript_helper_enum(
		// null
		"NULL",
		
		// boolean
		"BOOL",
		
		// simple values
		"NUM", "STR"
	);
	
	
	
	// COMMAND FUNCTIONS //
	static command = {};
	
	
	
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
		
		// stop here if unsuccessful
		if(parser.error_count > 0) return false;
		
		
		// FINISH UP //
		// store program tree
		this.program_tree = program_tree;
		
		// return success
		return true;
	}
	
	/*
		Run previously parsed program
	*/
	run(){
		// RUN //
		// get runner
		let runner = new Juicescript_runner(this.program_tree, {
			io: this.io
		});
		
		// run the program
		runner.run();
	}
	
	/*
		HELPER: Add command with expanded command aliases to command function list
	*/
	static command_define(command){
		// CHECK IF ALL ATTRIBUTES HAVE BEEN SET //
		// name
		if(!Object.keys(command).includes("name")){
			throw "command definition missing its name";
		}
		
		// alias
		if(!Object.keys(command).includes("alias")){
			throw "command definition '" + command.name + "' missing its alias list";
		}
		
		// validate function
		if(!(command.validate instanceof Function)){
			throw "command definition '" + command.name + "' missing its validate function";
		}
		
		// execute function
		if(!(command.execute instanceof Function)){
			throw "command definition '" + command.name + "' missing its execute function";
		}
		
		
		for(var name_or_alias of command.alias.concat([command.name])){
			// MAKE SURE WE'RE NOT RE-DEFINING IT //
			if(Object.keys(Juicescript.command).includes(name_or_alias)){
				// throw error
				throw "cannot redefine command '" + name_or_alias + "'";
			}
			
			
			// ADD //
			Juicescript.command[name_or_alias] = command;
		}
	}
}
