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
			if(this.error_count > 0) break;
			
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
			// execute function
			Juicescript.command[this.command.name].function(this);
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
			throw "unknown scope " + this.scope;
		}
		
		// return scope
		return this.tree.scope[this.scope];
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
