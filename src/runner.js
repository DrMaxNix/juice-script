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
		/**/this.command = this.tree.root.command[0];
		/**/this.debug(this.tree);
	}
	
	/*
		HELPER: Automagically keep track of problems and add additional info to stderr
	*/
	debug(text, additional){
		// add defaults
		additional ??= {};
		additional.line ??= this.command.line;
		
		// forward
		this.io.stderr.debug(text, additional);
	}
	info(text, additional){
		// add defaults
		additional ??= {};
		additional.line ??= this.command.line;
		
		// forward
		this.io.stderr.info(text, additional);
	}
	warning(text, additional){
		// KEEP TRACK OF PROBLEM //
		this.warning_count++;
		
		
		// PRINT MESSAGE //
		// add defaults
		additional ??= {};
		additional.line ??= this.command.line;
		
		// forward
		this.io.stderr.warning(text, additional);
	}
	error(text, additional){
		// KEEP TRACK OF PROBLEM //
		this.error_count++;
		
		
		// PRINT MESSAGE //
		// add defaults
		additional ??= {};
		additional.line ??= this.command.line;
		
		// forward
		this.io.stderr.error(text, additional);
	}
}
