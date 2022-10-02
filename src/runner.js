class Juicescript_runner {
	/*
		CONSTRUCTOR: Return new juicescript runner for PROGRAM-TREE with OPTIONS
	*/
	constructor(program_tree, options){
		// STORE ARGUMENTS //
		// program tree
		this.tree = program_tree;
		
		// io adapter
		this.io = options.io;
	}
	
	/*
		MAIN: Do running
	*/
	run(){
		// RESET //
		// stack for command counter, scope and variable list
		this.stack = [{
			scope: null,
			counter: 0,
			variable: {}
		}];
		
		// warning and error counter
		this.warning_count = 0;
		this.error_count = 0;
		
		
		// RUN FULL PROGRAM //
		while(true){
			// end execution on error
			if(this.has_error) break;
			
			// handle end of command list
			if(this.handle_command_list_end()) break;
			
			// load next command
			this.command_load();
			
			// set new default command counter
			this.counter++;
			
			// run
			this.run_one();
		}
	}
	
	/*
		HELPER: Run one command at current position
	*/
	run_one(){
		// TRY AS BUILT-IN COMMAND //
		if(Object.keys(Juicescript.command).includes(this.command.name)){
			// run validate function
			Juicescript.command[this.command.name].validate(this);
			
			// maybe run execute function
			if(!this.has_error){
				Juicescript.command[this.command.name].execute(this);
			}
			
			// done
			return;
		}
		
		
		// TRY AS USER-DEFINED COMMAND //
		if(Object.keys(this.tree.scope).includes(this.command.name)){
			this.scope_enter();
			return;
		}
		
		
		// UNKNOWN COMMAND //
		// stop with error
		this.error("unknown command '" + this.command.name + "'");
	}
	
	/*
		HELPER: Handle possible end of command list
	*/
	handle_command_list_end(){
		// CHECK IF AT END OF COMMAND LIST //
		if(this.counter < this.scope_tree.command.length){
			// not at end, continue
			return false;
		}
		
		
		// IN USER-DEFINED SCOPE //
		if(this.scope !== null){
			// return from scope
			this.scope_return();
			
			// check again for new scope
			return this.handle_command_list_end();
		}
		
		
		// HALT PROGRAM //
		return true;
	}
	
	/*
		HELPER: Load next command from current scope at current command counter
	*/
	command_load(){
		this.command = this.scope_tree.command[this.counter];
	}
	
	/*
		HELPER: Handle entering another scope by user command
	*/
	scope_enter(){
		// VALIDATE ARGUMENTS //
		// argument count
		this.argument_validate_count(this.tree.scope[this.command.name].parameter_count);
		
		// they must all be of type 'value'
		for(var q = 1; q <= this.command.argument.length; q++){
			this.argument_validate_type(q, Juicescript.argument_type.VALUE);
		}
		
		
		// RESOLVE ARGUMENTS //
		// resolve to value
		let argument_value_list = [];
		for(var q = 1; q <= this.command.argument.length; q++){
			argument_value_list.push(this.argument_value(q));
		}
		
		// resolve to absolute variable
		let argument_variable_list = [];
		for(var q = 0; q < this.command.argument.length; q++){
			if(this.command.argument[q].type === Juicescript.argument_type.VARIABLE){
				// variable, add absolute variable
				argument_variable_list.push(this.argument_variable(q + 1));
				
			} else {
				// literal, add null
				argument_variable_list.push(null);
			}
		}
		
		
		// PUSH NEW LAYER TO STACK //
		this.stack.push({
			scope: this.command.name,
			counter: 0,
			variable: {},
			argument_variable: argument_variable_list
		});
		
		
		// FILL IN PARAMETER VARIABLES //
		for(var q = 0; q < this.scope_tree.parameter.length; q++){
			// get parameter name
			let parameter_name = this.scope_tree.parameter[q].name;
			
			// get argument value
			let argument_value = argument_value_list[q];
			
			// store as variable in current scope
			this.variable_set({
				name: parameter_name,
				index: []
			}, argument_value);
		}
	}
	
	/*
		HELPER: Handle returning back to previous scope
	*/
	scope_return(){
		// REMEMBER VALUES TO TAKE OVER //
		let take_over_list = [];
		for(var q = 0; q < this.scope_tree.parameter.length; q++){
			// make sure argument was set when called
			if(q >= this.stack_top.argument_variable.length) continue;
			
			// make sure parameter is read-write
			if(!this.scope_tree.parameter[q].reference) continue;
			
			// make sure the argument was a variable
			if(this.stack_top.argument_variable[q] === null) continue;
			
			// get parameter name
			let parameter_name = this.scope_tree.parameter[q].name;
			
			// get variable's final value
			let variable_value = this.variable_get({
				name: parameter_name,
				index: []
			});
			
			// add to list
			take_over_list.push({variable: this.stack_top.argument_variable[q], value: variable_value});
		}
		
		
		// POP LAYER FROM STACK //
		this.stack.pop();
		
		
		// TAKE OVER READ-WRITE PARAMETERS //
		for(var one_reference of take_over_list){
			// set variable's new value
			this.variable_set(one_reference.variable, one_reference.value);
		}
	}
	
	/*
		GETTER: Return top/bottom of stack
	*/
	get stack_top(){
		return this.stack[this.stack.length - 1];
	}
	get stack_bottom(){
		return this.stack[0];
	}
	
	/*
		GETTER: Return name of current scope
	*/
	get scope(){
		return this.stack_top.scope;
	}
	
	/*
		GETTER: Return tree of current scope
	*/
	get scope_tree(){
		// are we in root scope?
		if(this.scope === null){
			// return root scope
			return this.tree.root;
		}
		
		// make sure this scope exists
		if(!Object.keys(this.tree.scope).includes(this.scope)){
			throw "unknown scope '" + this.scope + "'";
		}
		
		// return scope
		return this.tree.scope[this.scope];
	}
	
	/*
		GETTER / SETTER: Return current command counter
	*/
	get counter(){
		return this.stack_top.counter;
	}
	set counter(value){
		this.stack_top.counter = value;
	}
	
	/*
		COMMAND HELPER: Validate number of command arguments
	*/
	argument_validate_count(count){
		// CONVERT SIMPLE FORM TO MIN / MAX //
		if(Number.isInteger(count)){
			count = {min: count, max: count};
		}
		
		
		// CHECK //
		// get actual argument count
		let actual_count = this.command.argument.length;
		
		// maybe compare against list
		if(Array.isArray(count)){
			if(!count.includes(actual_count)){
				this.error(this.command.name + ": invalid argument count (" + count.join(" or ") + " expected)");
			}
			return;
		}
		
		// build range string
		let range_string;
		if(count.min === count.max){
			range_string = count.min;
			
		} else if(count.max === null){
			range_string = "at least " + count.min;
			
		} else {
			range_string = count.min + " to " + count.max;
		}
		
		// too few arguments
		if(actual_count < count.min){
			this.error(this.command.name + ": too few arguments (" + range_string + " expected)");
		}
		
		// too many arguments
		if(count.max !== null && actual_count > count.max){
			this.error(this.command.name + ": too many arguments (" + range_string + " expected)");
		}
	}
	
	/*
		COMMAND HELPER: Validate type of one command argument
	*/
	argument_validate_type(number, type){
		// GET WANTED ARGUMENT'S ACTUAL TYPE //
		// make sure this argument number exists
		if(this.command.argument.length < number){
			throw "unable to validate type of argument " + number + ", command " + this.command.name;
		}
		
		// load
		let actual_type = this.command.argument[(number - 1)].type;
		
		
		// COMPARE AGAINST META TYPES //
		// value
		if(type === Juicescript.argument_type.VALUE){
			if(![Juicescript.argument_type.VARIABLE, Juicescript.argument_type.LITERAL].includes(actual_type)){
				this.error_argument(number, "expected " + Juicescript.argument_type.name(type) + ", but got " + Juicescript.argument_type.name(actual_type));
			}
			return;
		}
		
		
		// COMPARE AGAINST PARSABLE TYPES //
		if(actual_type !== type){
			this.error_argument(number, "expected " + Juicescript.argument_type.name(type) + ", but got " + Juicescript.argument_type.name(actual_type));
		}
	}
	
	/*
		COMMAND HELPER: Get one command argument with NUMBER
	*/
	argument(number){
		// GET WANTED ARGUMENT //
		// fallback for argument not existing
		if(this.command.argument.length < number){
			return {type: Juicescript.argument_type.LITERAL, value: null};
		}
		
		// get argument object
		let argument = this.command.argument[(number - 1)];
		
		
		// RETURN //
		return argument;
	}
	
	/*
		COMMAND HELPER: Get raw value of one command argument
	*/
	argument_value(number){
		// GET WANTED ARGUMENT //
		let argument = this.argument(number);
		
		
		// RESOLVE VALUE //
		return this.argument_resolve(argument);
	}
	
	/*
		COMMAND HELPER: Get absolute variable object of one command argument
	*/
	argument_variable(number){
		// GET WANTED ARGUMENT //
		// get by number
		let argument = this.argument(number);
		
		// validate type
		if(argument.type !== Juicescript.argument_type.VARIABLE){
			throw "called `argument_variable()` on non-variable argument";
		}
		
		
		// RESOLVE VARIABLE //
		return this.variable_resolve(argument.variable);
	}
	
	/*
		HELPER: Resolve the value of a nested argument object
	*/
	argument_resolve(argument){
		// LITERAL //
		if(argument.type == Juicescript.argument_type.LITERAL){
			// return its value
			return argument.value;
		}
		
		
		// VARIABLE //
		if(argument.type == Juicescript.argument_type.VARIABLE){
			// resolve variable
			let variable = this.variable_resolve(argument.variable);
			
			// get this variable's value
			let value = this.variable_get(variable);
			
			// return the value
			return value;
		}
		
		
		// THROW ERROR ON EVERYTHING ELSE //
		throw "unable to extract value of argument " + number + ", command " + this.command.name + " (unexpected type)";
	}
	
	/*
		VARIABLE HELPER: Resolve variable to absolute name and index list
	*/
	variable_resolve(relative_variable){
		// RESOLVE //
		// get variable's absolute name
		let name = this.argument_resolve(relative_variable.name);
		
		// get variable's absolute index list
		let index = [];
		for(var one_index of relative_variable.index){
			index.push(this.argument_resolve(one_index));
		}
		
		
		// RETURN ABSOLUTE VARIABLE OBJECT //
		// build object
		let variable = {name: name, index: index};
		
		// return
		return variable;
	}
	
	/*
		VARIABLE HELPER: Get a variable's value
	*/
	variable_get(variable){
		// FIND VARIABLE IN STACK //
		// get its scope's full variable list
		let variable_list;
		if(this.variable_is_global(variable)){
			variable_list = this.stack_bottom.variable;
		} else {
			variable_list = this.stack_top.variable;
		}
		
		// try to load value from list
		let value = null;
		if(Object.keys(variable_list).includes(variable.name)){
			value = variable_list[variable.name];
		}
		
		
		// APPLY INDEXES //
		//*/ TODO: apply indexes
		/**/if(variable.index.length > 0) this.warning("yet to be implemented");
		/**/if(value === undefined) value = null;
		
		
		// RETURN VALUE //
		return value;
	}
	
	/*
		VARIABLE HELPER: Get a variable's data type
	*/
	variable_type(variable){
		// LOAD VALUE //
		let value = this.variable_get(variable);
		
		
		// RETURN TYPE //
		// get type
		let type = this.data_type(value);
		
		// return
		return type;
	}
	
	/*
		VARIABLE HELPER: Set a variable's value
	*/
	variable_set(variable, value){
		// FIND VARIABLE IN STACK //
		// get its scope's full variable list
		let variable_list;
		if(this.variable_is_global(variable)){
			variable_list = this.stack_bottom.variable;
		} else {
			variable_list = this.stack_top.variable;
		}
		
		// set value on list
		//*/ TODO: apply indexes
		variable_list[variable.name] = value;
	}
	
	/*
		VARIABLE HELPER: Check if variable is global
	*/
	variable_is_global(variable){
		// CHECK IF IN ROOT SCOPE //
		if(this.scope === null){
			// can't be global in here
			return false;
		}
		
		
		// CHECK IF IN LIST OF GLOBAL VARIABLE NAMES //
		// get list
		let global_list = this.scope_tree.global;
		
		// check
		return global_list.includes(variable.name);
	}
	
	/*
		GETTER: Check if there was a warning/error so far
	*/
	get has_warning(){
		return (this.warning_count > 0);
	}
	get has_error(){
		return (this.error_count > 0);
	}
	
	/*
		HELPER: Get data type of VALUE
	*/
	data_type(value){
		// CHECK SPECIAL CASES //
		// null
		if(value === null){
			return Juicescript.data_type.NULL;
		}
		
		
		// CONVERT TO ENUM FROM JAVASCRIPT TYPE //
		// get javascript's type
		let js_type = typeof value;
		
		// try to convert to enum
		let type = ({
			"number": Juicescript.data_type.NUM,
			"boolean": Juicescript.data_type.BOOL,
			"string": Juicescript.data_type.STR,
		})[js_type] ?? null;
		
		// lookup error?
		if(type === null){
			throw "unable to convert javascript type '" + js_type + "'";
		}
		
		
		// RETURN //
		return type
	}
	
	/*
		HELPER: Express VALUE as a string
	*/
	stringify(value){
		// NULL //
		if(value === null){
			return "null";
		}
		
		
		// TRY JAVASCRIPT'S `toString()` //
		return value.toString();
	}
	
	/*
		HELPER: Automagically produce error messages
	*/
	warning_argument(number, text){
		// construct warning message
		this.warning(this.command.name + ", argument " + number + ": " + text);
	}
	error_argument(number, text){
		// construct error message
		this.error(this.command.name + ", argument " + number + ": " + text);
	}
	
	/*
		HELPER: Automagically keep track of problems and add additional info to stderr
	*/
	debug(text, additional){
		// add defaults
		additional ??= {};
		additional.line ??= (this.command === undefined ? null : this.command.line);
		
		// forward
		this.io.stderr.debug(text, additional);
	}
	info(text, additional){
		// add defaults
		additional ??= {};
		additional.line ??= (this.command === undefined ? null : this.command.line);
		
		// forward
		this.io.stderr.info(text, additional);
	}
	warning(text, additional){
		// KEEP TRACK OF PROBLEM //
		this.warning_count++;
		
		
		// PRINT MESSAGE //
		// add defaults
		additional ??= {};
		additional.line ??= (this.command === undefined ? null : this.command.line);
		
		// forward
		this.io.stderr.warning(text, additional);
	}
	error(text, additional){
		// KEEP TRACK OF PROBLEM //
		this.error_count++;
		
		
		// PRINT MESSAGE //
		// add defaults
		additional ??= {};
		additional.line ??= (this.command === undefined ? null : this.command.line);
		
		// forward
		this.io.stderr.error(text, additional);
	}
}
