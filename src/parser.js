class Juicescript_parser {
	/*
		CONSTRUCTOR: Return new juicescript lexer for SOURCE with OPTIONS
	*/
	constructor(token_list, options){
		// STORE ARGUMENTS //
		// list of tokens
		this.token_list = token_list;
		
		// io adapter
		this.io = options.io;
	}
	
	/*
		MAIN: Do parsing
	*/
	parse(){
		// RESET //
		// counters
		this.position = 0;
		
		// current scope
		this.scope = null;
		
		// token list
		this.tree = this.program_tree_template();
		
		// warning and error counter
		this.warning_count = 0;
		this.error_count = 0;
		
		
		// PARSE ALL TOKENS //
		while(!this.is_at_end()){
			// consume next token
			this.next();
			
			// parse
			this.parse_one();
		}
		
		
		// RETURN PROGRAM TREE //
		return this.tree;
	}
	
	/*
		HELPER: Parse one token at current position
	*/
	parse_one(){
		switch(this.token.type){
			// DELIMITER //
			case Juicescript.token_type.DELIMITER:
				// ignore
				break;
			
			
			// OWN COMMAND DEFINITION //
			case Juicescript.token_type.DEF:
				this.parse_def();
				break;
			
			
			// END //
			case Juicescript.token_type.END:
				this.parse_end();
				break;
			
			
			// COMMAND //
			case Juicescript.token_type.IDENTIFIER:
				this.parse_command();
				break;
			
			
			// EVERYTHING ELSE //
			default:
				// unexpected (ignore with error)
				this.error_token("unexpected token");
				break;
		}
	}
	
	/*
		PARSER: Handle own command definition
	*/
	parse_def(){
		let parameter_list = [];
		while(!this.is_at_end()){
			// IS NEXT TOKEN A DELIMITER? //
			if(this.match_type(Juicescript.token_type.DELIMITER)){
				// end of parameter list
				break;
			}
			
			
			// GET NEXT PARAMETER //
			// consume next token
			this.next();
			/**/continue;
			
			// make sure next has valid type for parameter
			if(!this.is_parameter(this.token)){
				// ignore with error
				this.error_token("invalid parameter");
				continue;
			}
			
			
			// PARSE PARAMETER //
			// get parsed object
			let parameter = this.parse_parameter();
			
			// add to list
			parameter_list.push(parameter);
		}
		/**/console.log(parameter_list);
		
		
		
		
		
		
		
		/**/this.debug("enter scope " + this.peek().value);
		/**/this.scope = this.peek().value;
		/**/this.tree.scope[this.scope] = this.scope_tree_template();
	}
	
	/*
		PARSER: Handle `end` command
	*/
	parse_end(){
		/**/this.debug("enter scope root");
		/**/this.scope = null;
	}
	
	/*
		PARSER: Handle command
	*/
	parse_command(){
		let argument_list = [];
		while(!this.is_at_end()){
			// IS NEXT TOKEN A DELIMITER? //
			if(this.match_type(Juicescript.token_type.DELIMITER)){
				// end of argument list
				break;
			}
			
			
			// GET NEXT ARGUMENT //
			// consume next token
			this.next();
			
			// make sure next has valid type for an argument
			if(!this.is_argument(this.token)){
				// ignore with error
				this.error_token("invalid argument");
				continue;
			}
			
			
			// PARSE ARGUMENT //
			// get parsed object
			let argument = this.parse_argument();
			
			// add to list
			argument_list.push(argument);
		}
		/**/console.log(argument_list);
		
		
		///**/this.command_add({name: this.token.value});
	}
	
	/*
		PARSER: Handle argument at current position and return resulting object
	*/
	parse_argument(){
		// NEW OJECT //
		let argument = {};
		
		
		// VARIABLE OR LITERAL? //
		if(this.is_variable(this.token)){
			// parse variable
			let variable = this.parse_variable();
			
			// add to list
			argument = {type: Juicescript.argument_type.VARIABLE, variable: variable};
			
		} else {
			// add literal
			argument = {type: Juicescript.argument_type.LITERAL, value: this.token.value};
		}
		
		
		// RETURN //
		return argument;
	}
	
	/*
		PARSER: Handle variable at current position and return resulting object
	*/
	parse_variable(){
		// NEW OJECT //
		let variable = {};
		
		// clear index list
		variable.index = [];
		
		
		// GET VARIABLE NAME //
		if(this.token.value !== null){
			// literal
			variable.name = {type: Juicescript.argument_type.LITERAL, value: this.token.value};
			
		} else if(this.match_type(Juicescript.token_type.BRACKET_CURLY_OPEN)){
			// consume argument
			this.next();
			
			// make sure token has valid type for an argument
			if(this.is_argument(this.token)){
				// value of another variable
				let argument = this.parse_argument();
				variable.name = argument;
				
			} else {
				// ignore with error
				this.error_token("expected variable name, but got");
			}
			
			// consume curly closing bracket
			if(!this.match_type(Juicescript.token_type.BRACKET_CURLY_CLOSE)){
				// ignore with error
				this.error_token("expected '}', but got", this.peek());
			}
			
		} else {
			// ignore with error
			this.error("unable to determine variable name");
		}
		
		
		// HANDLE OPTIONAL LIST KEYS //
		while(this.match_type(Juicescript.token_type.BRACKET_SQUARE_OPEN)){
			// consume argument
			this.next();
			
			// make sure token has valid type for an argument
			if(this.is_argument(this.token)){
				// parse argument
				let argument = this.parse_argument();
				
				// add index to list
				variable.index.push(argument);
				
			} else {
				// ignore with error
				this.error_token("expected list index, but got");
			}
			
			// consume square closing bracket
			if(!this.match_type(Juicescript.token_type.BRACKET_SQUARE_CLOSE)){
				// ignore with error
				this.error_token("expected ']', but got", this.peek());
			}
		}
		
		
		// RETURN //
		return variable;
	}
	
	/*
		HELPER: Consume next token from list
	*/
	next(){
		this.token = this.token_list[this.position++];
		return this.token;
	}
	
	/*
		HELPER: Return OFFSET next token from list
	*/
	peek(offset = 0){
		return this.token_list[(this.position + offset)];
	}
	
	/*
		HELPER: Consume (and return true) if OFFSET next token's type matches TYPE
	*/
	match_type(type, offset = 0){
		// ignore if it doesn't match
		if(this.peek(offset).type != type) return false;
		
		// consume if it matches
		this.position += offset;
		this.next();
		return true;
	}
	match_type_list(type_list, offset = 0){
		// check all types
		for(var one_type of type_list){
			// check this type
			if(this.match_type(one_type, offset)) return true;
		}
		
		// nothing found
		return false;
	}
	
	/*
		HELPER: Return if we are at end of token list
	*/
	is_at_end(){
		// check if next token is of type eof
		let eof = (this.peek().type === Juicescript.token_type.EOF);
		
		// check if next token exists
		let out_of_tokens = (this.token_list.length <= this.position);
		
		// if one of those is true, we are at the end
		return (eof || out_of_tokens);
	}
	
	/*
		HELPER: Check if type of TOKEN is valid for arguments
	*/
	is_argument(token){
		// check lookup table
		return ([
			Juicescript.token_type.VARIABLE,
			Juicescript.token_type.STRING,
			Juicescript.token_type.NUMBER,
			Juicescript.token_type.TRUE,
			Juicescript.token_type.FALSE,
			Juicescript.token_type.NULL
		]).includes(token.type);
	}
	
	/*
		HELPER: Check if TOKEN is a variable
	*/
	is_variable(token){
		return (token.type === Juicescript.token_type.VARIABLE);
	}
	
	/*
		HELPER: Add new command object with OPTIONS to current scope
	*/
	command_add(options){
		// NEW OJECT //
		let command = {};
		
		
		// COLLECT REQUIRED ATTRIBUTES //
		// name
		command.name = options.name ?? null;
		if(command.name === null){
			throw "missing command name";
		}
		
		
		// COLLECT ATTRIBUTES WITH POSSIBLE FALLBACK VALUES //
		// line
		command.line = options.line ?? this.token.line;
		
		
		// OPTIONAL ATTRIBUTES //
		command.argument = options.argument ?? [];
		
		
		// ADD TO SCOPE'S COMMAND LIST //
		/**/this.debug("add command " + command.name + " to scope " + (this.scope ?? "root"));
		/**/console.log(this.scope, command);
		/**/let scope_command_list = (this.scope === null ? this.tree.root.command : this.tree.scope[this.scope].command);
		/**/scope_command_list ??= [];
		/**/scope_command_list.push(command);
		//*/ TODO
	}
	
	/*
		HELPER: Return empty program tree structure
	*/
	program_tree_template(){
		return {
			root: {
				command: [],
				flag: {}
			},
			
			scope: {}
		};
	}
	
	/*
		HELPER: Return empty scope tree structure
	*/
	scope_tree_template(){
		return {
			command: [],
			flag: {},
			global: []
		};
	}
	
	/*
		HELPER: Automagically produce error messages
	*/
	error_token(text, token = null){
		// GET TOKEN //
		token ??= this.token;
		
		
		// HANDLE TOKEN //
		// get token type name
		let type_name = Juicescript.token_type.name(token.type).toLowerCase();
		
		// try to get lexeme
		let lexeme = null;
		if(token.lexeme.trim().length > 0){
			lexeme = token.lexeme.trim();
		}
		
		// construct error message
		this.error(text + " " + (lexeme === null ? type_name : ("'" + lexeme + "'")));
	}
	
	/*
		HELPER: Automagically keep track of problems and add additional info to stderr
	*/
	debug(text, additional){
		// add defaults
		additional ??= {};
		additional.line ??= this.token.line;
		
		// forward
		this.io.stderr.debug(text, additional);
	}
	info(text, additional){
		// add defaults
		additional ??= {};
		additional.line ??= this.token.line;
		
		// forward
		this.io.stderr.info(text, additional);
	}
	warning(text, additional){
		// KEEP TRACK OF PROBLEM //
		this.warning_count++;
		
		
		// PRINT MESSAGE //
		// add defaults
		additional ??= {};
		additional.line ??= this.token.line;
		
		// forward
		this.io.stderr.warning(text, additional);
	}
	error(text, additional){
		// KEEP TRACK OF PROBLEM //
		this.error_count++;
		
		
		// PRINT MESSAGE //
		// add defaults
		additional ??= {};
		additional.line ??= this.token.line;
		
		// forward
		this.io.stderr.error(text, additional);
	}
}
