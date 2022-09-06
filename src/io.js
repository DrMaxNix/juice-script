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
			debug: (text) => {
				this.callback.stderr("[DEBUG] " + text, "debug");
			},
			info: (text) => {
				this.callback.stderr("[INFO ] " + text, "info");
			},
			warning: (text) => {
				this.callback.stderr("[WARN ] " + text, "warning");
			},
			error: (text) => {
				this.callback.stderr("[ERROR] " + text, "error");
			}
		}
	}
}