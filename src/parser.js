class Juicescript_parser {
	/*
		CONSTRUCTOR: Return new juicescript parser for TOKEN-LIST with OPTIONS
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
		
		// program tree
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
			
			
			// `END` //
			case Juicescript.token_type.END:
				this.parse_end();
				break;
			
			
			// COMMAND //
			case Juicescript.token_type.IDENTIFIER:
				this.parse_command();
				break;
			
			
			// FLAG //
			case Juicescript.token_type.FLAG:
				this.parse_flag();
				break;
			
			
			// `GLOBAL` //
			case Juicescript.token_type.GLOBAL:
				this.parse_global();
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
		// GET COMMAND NAME //
		// consume name
		this.next();
		
		// make sure token has valid type
		let name = null;
		if(this.token.type === Juicescript.token_type.IDENTIFIER){
			// get from identifier value
			name = this.token.value;
			
		} else {
			// ignore with error
			this.error_token("expected IDENTIFIER, but got");
		}
		
		
		// GET LIST OF PARAMETERS //
		let parameter_list = this.parse_parameter_list();
		
		
		// CAN ONLY BE USED IN ROOT SCOPE //
		if(this.scope !== null){
			// ignore with error
			this.error("'def' can not be used inside a command definition");
		}
		
		
		// COMMAND NAME MUST BE UNIQUE //
		// check against built-in commands
		if(Object.keys(Juicescript.command).includes(name)){
			// ignore with error
			this.error("connot redefine built-in command '" + name + "'");
			name = null;
		}
		
		// check against user-defined commands
		if(Object.keys(this.tree.scope).includes(name)){
			// ignore with error
			this.error("connot redefine user-defined command '" + name + "'");
			name = null;
		}
		
		
		// INITIALIZE SCOPE //
		// ignore if name is invalid
		if(name === null) return;
		
		// enter this command's scope
		this.scope = name;
		
		// create empty scope from template
		this.scope_tree = this.scope_tree_template();
		
		// store parameter list
		this.scope_tree.parameter = parameter_list;
	}
	
	/*
		PARSER: Handle `end` command
	*/
	parse_end(){
		// ARE WE IN ROOT SCOPE? //
		if(this.scope === null){
			// unexpected (ignore with error)
			this.error_token("unexpected token");
			return;
		}
		
		
		// EXIT FROM SCOPE //
		this.scope = null;
	}
	
	/*
		PARSER: Handle command
	*/
	parse_command(){
		// GET COMMAND NAME //
		let command = this.token.value;
		
		
		// GET LIST OF ARGUMENTS //
		let argument_list = this.parse_argument_list();
		
		
		// ADD TO LIST OF COMMANDS //
		this.command_add({name: command, argument: argument_list});
	}
	
	/*
		PARSER: Handle flag
	*/
	parse_flag(){
		// GET FLAG NAME //
		let flag = this.token.value;
		
		
		// MAKE SURE THE FLAG NAME IS UNIQUE //
		if(Object.keys(this.scope_tree.flag).includes(flag)){
			// ignore with error
			this.error("can not redefine flag '" + flag + "'");
		}
		
		
		// ADD TO LIST //
		// get current scope's command counter
		let scope_command_count = this.scope_tree.command.length;
		
		// store in list
		this.scope_tree.flag[flag] = {line: this.token.line, command_next: scope_command_count};
	}
	
	/*
		PARSER: Handle `global` command
	*/
	parse_global(){
		// GET LIST OF PARAMETERS //
		let parameter_list = this.parse_parameter_list({strict: true});
		
		
		// MAKE SURE WE ARE INSIDE OF A SCOPE //
		if(this.scope === null){
			// ignore with error
			this.error("'global' can only be used inside a command definition");
			return;
		}
		
		
		// MAKE SURE THEY ARE DEFINED BEFORE ANY COMMANDS //
		if(this.scope_tree.command.length > 0){
			// ignore with error
			this.error("'global' must come before any other command");
			return;
		}
		
		
		// ADD TO LIST OF GLOBAL VARIABLES //
		for(var one_parameter of parameter_list){
			// get variable name from parameter
			let name = one_parameter.name;
			
			// check if already in the list
			if(this.scope_tree.global.includes(name)){
				// ignore with warning
				this.warning("variable '" + name + "' is already global");
				continue;
			};
			
			// add to list
			this.scope_tree.global.push(name);
		}
	}
	
	/*
		PARSER: Handle argument list at current position and return resulting list of objects
	*/
	parse_argument_list(){
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
			
			// make sure next has valid type for an argument (also allow operators)
			if(!this.is_argument(this.token, {operator: true, identifier: true})){
				// ignore with error
				this.error_token("expected ARGUMENT, but got");
				continue;
			}
			
			
			// PARSE ARGUMENT //
			// get parsed object
			let argument = this.parse_argument();
			
			// add to list
			argument_list.push(argument);
		}
		
		
		// RETURN //
		return argument_list;
	}
	
	/*
		PARSER: Handle argument at current position and return resulting object
	*/
	parse_argument(){
		// VARIABLE? //
		if(this.is_variable(this.token)){
			// return object
			return {type: Juicescript.argument_type.VARIABLE, variable: this.parse_variable()};
		}
		
		
		// OPERATOR? //
		if(this.is_operator(this.token)){
			// return object
			return {type: Juicescript.argument_type.OPERATOR, operator: this.token.type};
		}
		
		
		// LITERAL? //
		if(this.is_literal(this.token)){
			// return object
			return {type: Juicescript.argument_type.LITERAL, value: this.token.value};
		}
		
		
		// IDENTIFIER? //
		if(this.is_identifier(this.token)){
			// return object
			return {type: Juicescript.argument_type.IDENTIFIER, identifier: this.token.value};
		}
		
		
		// UNKNOWN //
		throw "called parse_argument() on non-argument token";
	}
	
	/*
		PARSER: Handle parameter list at current position with OPTIONS and return resulting list of objects
	*/
	parse_parameter_list(options = {}){
		// SET DEFAULTS FOR OPTIONS //
		options.strict ??= false;
		
		
		let parameter_list = [];
		while(!this.is_at_end()){
			// IS NEXT TOKEN A DELIMITER? //
			if(this.match_type(Juicescript.token_type.DELIMITER)){
				// end of parameter list
				break;
			}
			
			
			// GET NEXT PARAMETER //
			// clear stuff
			let reference = false;
			let optional = false;
			
			// consume next token
			this.next();
			
			
			// CHECK FOR AMPERSAND PREFIX //
			if(this.token.type === Juicescript.token_type.AMPERSAND){
				// if not allowed, ignore with error
				if(options.strict) this.error_token("modifier not allowed:");
				
				// remember
				reference = true;
				
				// consume
				this.next();
			}
			
			
			// MAKE SURE TOKEN HAS VALID TYPE FOR A PARAMETER //
			if(!this.is_variable(this.token)){
				// ignore with error
				this.error_token("expected PARAMETER, but got");
				continue;
			}
			
			
			// GET PARAMETER NAME //
			let parameter_name = this.parse_parameter();
			
			
			// CHECK FOR QUESTION MARK SUFFIX //
			if(this.match_type(Juicescript.token_type.QUESTION_MARK)){
				// if not allowed, ignore with error
				if(options.strict) this.error_token("modifier not allowed:");
				
				// remember
				optional = true;
			}
			
			
			// ADD TO LIST //
			// ignore if parsing of name was unsuccessful
			if(parameter_name === null) continue;
			
			// build object
			let parameter = {name: parameter_name, reference: reference, optional: optional};
			
			// add
			parameter_list.push(parameter);
		}
		
		
		// RETURN //
		return parameter_list;
	}
	
	/*
		PARSER: Handle parameter at current position and return its name
	*/
	parse_parameter(){
		// MAKE SURE VARIABLE HAS A DIRECT NAME //
		if(this.token.value.length <= 0){
			// ignore with error
			this.error_token("expected PARAMETER NAME, but got", this.peek());
			return null;
		}
		
		
		// RETURN NAME //
		// get name
		let name = this.token.value;
		
		// return
		return name;
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
		if(this.token.value.length > 0){
			// literal
			variable.name = {type: Juicescript.argument_type.LITERAL, value: this.token.value};
			
		} else if(this.match_type(Juicescript.token_type.BRACKET_CURLY_OPEN)){
			// consume argument
			this.next();
			
			// make sure token has valid type for variable name
			if(this.is_argument(this.token)){
				// value of another variable
				let argument = this.parse_argument();
				variable.name = argument;
				
			} else {
				// ignore with error
				this.error_token("expected VARIABLE NAME, but got");
			}
			
			// consume curly closing bracket
			if(!this.match_type(Juicescript.token_type.BRACKET_CURLY_CLOSE)){
				// ignore with error
				this.error_token("expected '}', but got", this.peek());
			}
			
		} else {
			// ignore with error
			this.error("variable without name");
		}
		
		
		// HANDLE OPTIONAL LIST KEYS //
		while(this.match_type(Juicescript.token_type.BRACKET_SQUARE_OPEN)){
			// consume argument
			this.next();
			
			// make sure token has valid type for list index
			if(this.is_argument(this.token)){
				// parse argument
				let argument = this.parse_argument();
				
				// add index to list
				variable.index.push(argument);
				
			} else {
				// ignore with error
				this.error_token("expected LIST INDEX, but got");
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
		GETTER / SETTER: Return tree of current scope
	*/
	get scope_tree(){
		// are we in root scope?
		if(this.scope === null){
			// return root scope
			return this.tree.root;
		}
		
		// make sure this scope exists
		if(!Object.keys(this.tree.scope).includes(this.scope)){
			throw "unknown scope " + this.scope;
		}
		
		// return scope
		return this.tree.scope[this.scope];
	}
	set scope_tree(value){
		// are we in root scope?
		if(this.scope === null){
			// set root scope
			this.tree.root = value;
			return;
		}
		
		// set scope
		this.tree.scope[this.scope] = value;
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
	is_argument(token, options = {}){
		// SET DEFAULTS FOR OPTIONS //
		options.operator ??= false;
		options.identifier ??= false;
		
		
		// CHECK //
		return	this.is_variable(token) ||
				(options.operator && this.is_operator(token)) ||
				this.is_literal(token) ||
				(options.identifier && this.is_identifier(token));
	}
	
	/*
		HELPER: Check if TOKEN is a variable
	*/
	is_variable(token){
		return (token.type === Juicescript.token_type.VARIABLE);
	}
	
	/*
		HELPER: Check if TOKEN is an operator
	*/
	is_operator(token){
		// check lookup table
		return ([
			Juicescript.token_type.NOT,
			Juicescript.token_type.EQUAL_EQUAL,
			Juicescript.token_type.NOT_EQUAL,
			Juicescript.token_type.GREATER,
			Juicescript.token_type.GREATER_EQUAL,
			Juicescript.token_type.LESS,
			Juicescript.token_type.LESS_EQUAL
		]).includes(token.type);
	}
	
	/*
		HELPER: Check if TOKEN is a literal
	*/
	is_literal(token){
		// check lookup table
		return ([
			Juicescript.token_type.STRING,
			Juicescript.token_type.NUMBER,
			Juicescript.token_type.TRUE,
			Juicescript.token_type.FALSE,
			Juicescript.token_type.NULL
		]).includes(token.type);
	}
	
	/*
		HELPER: Check if TOKEN is an identifier
	*/
	is_identifier(token){
		return (token.type === Juicescript.token_type.IDENTIFIER);
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
		// get scope command list
		let scope_command_list = this.scope_tree.command;
		
		// add command object
		scope_command_list.push(command);
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
			parameter: [],
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
		let type_name = Juicescript.token_type.name(token.type);
		
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
