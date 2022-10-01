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
		// command counter
		this.counter = 0;
		
		// current scope
		this.scope = null;
		
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
			//*/ TODO: enter scope
			/**/this.error("user-defined: " + this.command.name);
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
			//*/ TODO: return from scope
			/**/this.error("return from scope");
			return false;
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
				this.error(this.command.name + ", argument " + number + ": expected " + Juicescript.argument_type.name(type) + ", but got " + Juicescript.argument_type.name(actual_type));
			}
			return;
		}
		
		
		// COMPARE AGAINST PARSABLE TYPES //
		if(actual_type !== type){
			this.error(this.command.name + ", argument " + number + ": expected " + Juicescript.argument_type.name(type) + ", but got " + Juicescript.argument_type.name(actual_type));
		}
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
