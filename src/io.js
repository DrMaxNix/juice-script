"use strict";
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
				// PRETTY PRINT INCOMMING DATA? //
				// object
				if(typeof text === "object"){
					text = "Object" + "\n" + JSON.stringify(text, null, 4) + "\n";
				}
				
				
				// OUTPUT //
				// add defaults
				additional ??= {};
				additional.line ??= null;
				
				// set constant values
				additional.prefix = "DEBUG";
				
				// build and print
				this.callback.stderr(this.stderr_build(text, additional), "debug");
			},
			
			info: (text, additional) => {
				// add defaults
				additional ??= {};
				additional.line ??= null;
				
				// set constant values
				additional.prefix = "INFO ";
				
				// build and print
				this.callback.stderr(this.stderr_build(text, additional), "info");
			},
			
			warning: (text, additional) => {
				// add defaults
				additional ??= {};
				additional.line ??= null;
				
				// set constant values
				additional.prefix = "WARN ";
				
				// build and print
				this.callback.stderr(this.stderr_build(text, additional), "warning");
			},
			
			error: (text, additional) => {
				// add defaults
				additional ??= {};
				additional.line ??= null;
				
				// set constant values
				additional.prefix = "ERROR";
				
				// build and print
				this.callback.stderr(this.stderr_build(text, additional), "error");
			}
		}
	}
	
	/*
		HELPER: Build stderr string from TEXT and ADDITIONAL data
	*/
	stderr_build(text, additional){
		// START WITH EMPTY STRING //
		let string = "";
		
		
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
