class Juicescript_parser {
	/*
		CONSTRUCTOR: Return new juicescript lexer for SOURCE with OPTIONS
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
		/**/for(let one_token of this.token_list){
			/**/one_token.type = Juicescript.token_type.name(one_token.type);
			/**/console.log(one_token);
		/**/}
	}
}
