class Juicescript_io {
	/*
		CONSTRUCTOR: Return new juicescript io adapter with CALLBACKs
	*/
	constructor(callback){
		// store callbacks
		this.callback = callback;
	}
	
	/*
		HELPER: Stdout method
	*/
	stdout(text){
		this.callback.stdout(text);
	}
	
	/*
		GETTER: Return stderr method collection
	*/
	get stderr(){
		return {
			debug: (text, additional) => {
				// add defaults
				additional ??= {};
				additional.line ??= null;
				
				// set constant values
				additional.prefix = "DEBUG";
				
				// build and print
				this.callback.stderr(this.build_stderr(text, additional), "debug");
			},
			
			info: (text, additional) => {
				// add defaults
				additional ??= {};
				additional.line ??= null;
				
				// set constant values
				additional.prefix = "INFO ";
				
				// build and print
				this.callback.stderr(this.build_stderr(text, additional), "info");
			},
			
			warning: (text, additional) => {
				// add defaults
				additional ??= {};
				additional.line ??= null;
				
				// set constant values
				additional.prefix = "WARN ";
				
				// build and print
				this.callback.stderr(this.build_stderr(text, additional), "warning");
			},
			
			error: (text, additional) => {
				// add defaults
				additional ??= {};
				additional.line ??= null;
				
				// set constant values
				additional.prefix = "ERROR";
				
				// build and print
				this.callback.stderr(this.build_stderr(text, additional), "error");
			}
		}
	}
	
	/*
		HELPER: Build stderr string from TEXT and ADDITIONAL data
	*/
	build_stderr(text, additional){
		// START WITH EMPTY STRING //
		var string = "";
		
		
		// PREFIX //
		if(additional.prefix){
			string += "[" + additional.prefix + "] ";
		}
		
		
		// LINE NUMBER //
		if(additional.line){
			string += "(line " + additional.line + ") ";
		}
		
		
		// TEXT //
		string += text;
		
		
		// RETURN //
		return string;
	}
}