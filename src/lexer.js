class Juicescript_lexer {
	/*
		CONSTRUCTOR: Return new juicescript lexer for SOURCE with OPTIONS
	*/
	constructor(source, options){
		// STORE SOURCE //
		this.source = source;
		
		
		// STORE IO ADAPTER //
		this.io = options.io;
	}
	
	/*
		MAIN: Run lexical analysis
	*/
	scan(){
		/**/this.io.stderr.debug(this.source);
	}
}