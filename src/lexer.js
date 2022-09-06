class Juicescript_lexer {
	/*
		CONSTRUCTOR: Return new juicescript lexer for SOURCE with OPTIONS
	*/
	constructor(source, options){
		// STORE ARGUMENTS //
		// source
		this.source = source;
		
		// io adapter
		this.io = options.io;
	}
	
	/*
		MAIN: Run lexical analysis
	*/
	scan(){
		/**/this.io.stderr.debug(this.source);
	}
}