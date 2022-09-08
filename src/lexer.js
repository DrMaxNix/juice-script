"use strict";
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
		// RESET //
		// counters
		this.start = 0;
		this.end = 0;
		this.line = 1;
		
		// token list
		this.token_list = [];
		
		// warning and error counter
		this.warning_count = 0;
		this.error_count = 0;
		
		
		// SCAN WHOLE SOURCE //
		while(!this.is_at_end()){
			// start where last scan ended
			this.start = this.end;
			
			// consume next character
			this.next();
			
			// scan next token
			this.scan_one();
		}
		
		
		// ADD END-OF-FILE TOKEN //
		this.token_add({
			type: Juicescript.token_type.EOF,
			line: this.line
		});
		
		
		// RETURN LIST OF TOKENS //
		return this.token_list;
	}
	
	/*
		HELPER: Scan one token at current position
	*/
	scan_one(){
		switch(this.char){
			// WHITESPACE //
			case " ":
			case "\r":
			case "\t":
				break;
			
			
			// DELIMITER //
			case ";":
				this.token_add({type: Juicescript.token_type.DELIMITER});
				break;
			
			
			// NEWLINE //
			case "\n":
				this.token_add({type: Juicescript.token_type.DELIMITER});
				this.line++;
				break;
			
			
			// OPERATORS //
			case "!":
				if		(this.match("="))		this.token_add({type: Juicescript.token_type.NOT_EQUAL});
				else							this.token_add({type: Juicescript.token_type.NOT});
				break;
				
			case "=":
				if		(this.match("="))		this.token_add({type: Juicescript.token_type.EQUAL});
				else							this.error("unexpected character '" + this.char + "'");
				break;
				
			case "<":
				if		(this.match("="))		this.token_add({type: Juicescript.token_type.LESS_EQUAL});
				else							this.token_add({type: Juicescript.token_type.LESS});
				break;
				
			case ">":
				if		(this.match("="))		this.token_add({type: Juicescript.token_type.GREATER_EQUAL});
				else							this.token_add({type: Juicescript.token_type.GREATER});
				break;
			
			
			// BRACKETS //
			case "[":
				this.token_add({type: Juicescript.token_type.BRACKET_SQUARE_OPEN});
				break;
			
			case "]":
				this.token_add({type: Juicescript.token_type.BRACKET_SQUARE_CLOSE});
				break;
			
			case "{":
				this.token_add({type: Juicescript.token_type.BRACKET_CURLY_OPEN});
				break;
			
			case "}":
				this.token_add({type: Juicescript.token_type.BRACKET_CURLY_CLOSE});
				break;
			
			
			// COMMENTS //
			case "#":
			case "/":
				// block comment
				if(this.char === "/" && this.match("*")){
					this.scan_block_comment();
					break;
				}
				
				// single slash
				if(this.char === "/" && !this.match("/")){
					this.error("unexpected character '" + this.char + "'");
					break;
				}
				
				// normal comment
				while(this.peek() !== "\n" && !this.is_at_end()) this.next();
				break;
			
			
			// STRINGS //
			// handle escape sequences
			case "\"":
				this.scan_string(this.char, true);
				break;
			
			// ignore escape sequences
			case "'":
				this.scan_string(this.char, false);
				break;
			
			
			// VARIABLE //
			case "$":
				this.scan_variable();
				break;
			
			
			// PREFIXED FLAGS //
			case ":":
				this.scan_flag();
				break;
			
			
			// NEGATIVE NUMBERS //
			case "-":
				// only if there's a valid digit after it
				if(this.is_digit(this.peek())){
					// consume minus sign
					this.next();
					
					// scan like a normal number
					this.scan_number();
					break;
				}
				
				// ignore with error
				this.error("unexpected character '" + this.char + "'");
				break;
			
			
			// AMPERSAND //
			case "&":
				// only if there's a dollar sign after it
				if(this.peek() === "$"){
					// add token
					this.token_add({type: Juicescript.token_type.AMPERSAND});
					break;
				}
				
				// ignore with error
				this.error("unexpected character '" + this.char + "'");
				break;
			
			
			// EVERYTHING ELSE //
			default:
				// numbers
				if(this.is_digit(this.char)){
					this.scan_number();
					break;
				}
				
				// identifiers
				if(this.is_alpha(this.char)){
					this.scan_identifier();
					break;
				}
				
				// unexpected (ignore with error)
				this.error("unexpected character '" + this.char + "'");
				break;
		}
	}
	
	/*
		SCANNER: Handle string surrounded by MARKER and optionally convert ESCAPE-SEQUENCES
	*/
	scan_string(marker, escape_sequences){
		// TRY TO CONSUME UNTIL END OF SOURCE //
		while(!this.is_at_end()){
			// do we have a quote?
			if(this.peek() === marker){
				// count backslashes in front of quote
				let backslash_count = 0;
				while(this.peek(-(backslash_count + 1)) === "\\"){
					backslash_count++;
				};
				
				// terminate string if count of backslashes is correct
				if(backslash_count % 2 === 0) break;
			}
			
			// take note of passed lines
			if(this.peek() === "\n") this.line++;
			
			// consume next character
			this.next();
		}
		
		
		// DID WE REACH THE END OF SOURCE WITHOUT TERMINATION? //
		if(this.is_at_end()){
			// ignore with error
			this.error("unterminated string");
			return;
		}
		
		
		// GET STRING VALUE //
		// consume closing quote
		this.next();
		
		// get consumed string
		let string = this.source.substring(this.start + 1, this.end - 1);
		
		
		// RESOLVE ESCAPE SEQUENCES //
		// iterate over whole string
		let offset = 0;
		let pos = -1;
		while((pos = string.indexOf("\\", offset)) > -1){
			// defaults for escaping one character
			let char_escaped = string.substring(pos + 1, pos + 2);
			let replace = char_escaped;
			let remove_length = replace.length;
			
			// special escape sequences
			switch(char_escaped){
				// newline
				case "n":
					replace = "\n";
					break;
				
				// tab
				case "t":
					replace = "\t";
					break;
				
				// null
				case "0":
					replace = "\0";
					break;
				
				// unicode
				case "u":
					// get four-letter codepoint string
					let next_four_chars = string.substring(pos + 2, pos + 6);
					
					// check if this is valid hexadecimal
					if(/^[0-9a-fA-F]*$/.test(next_four_chars)){
						// convert codepoint to decimal number
						let codepoint = parseInt(next_four_chars, 16);
						
						// get corresponding unicode character
						replace = String.fromCharCode(codepoint);
						remove_length += 4;
					}
					break;
			}
			
			// if all aren't allowed, only replace essential escape sequences
			if(replace === "\\" || replace === "'" || escape_sequences){
				// replace in string
				string = string.substr(0, pos) + replace + string.substr(pos + 1 + remove_length);
			}
			
			// remember we resolved this one
			offset = pos + replace.length;
		}
		
		
		// ADD TOKEN //
		this.token_add({type: Juicescript.token_type.STRING, value: string});
	}
	
	/*
		SCANNER: Handle block comment
	*/
	scan_block_comment(){
		// TRY TO CONSUME UNTIL END OF SOURCE //
		while(!this.is_at_end()){
			// do we have a `*/`?
			if(this.char === "*" && this.peek() === "/"){
				// block comment ends here
				break;
			}
			
			// take note of passed lines
			if(this.peek() === "\n") this.line++;
			
			// consume next character
			this.next();
		}
		
		
		// DID WE REACH THE END OF SOURCE WITHOUT TERMINATION? //
		if(this.is_at_end()){
			// ignore with error
			this.error("unterminated block comment");
			return;
		}
		
		// consume (=ignore) closing slash
		this.next();
	}
	
	/*
		SCANNER: Handle variable
	*/
	scan_variable(){
		// GET VARIABLE NAME //
		// consume all valid characters
		while(this.is_alphanumeric(this.peek())) this.next();
		
		// get consumed string
		let variable = this.source.substring(this.start + 1, this.end);
		
		
		// CHECK IF THERE EVEN IS A NAME //
		if(variable.length <= 0){
			// has curly bracket after it?
			if(this.peek() === "{"){
				// add token without value
				this.token_add({type: Juicescript.token_type.VARIABLE});
				return;
			}
			
			// ignore with error
			this.error("unexpected character '" + this.source.charAt(this.start) + "'");
			return;
		}
		
		
		// ADD TOKEN //
		this.token_add({type: Juicescript.token_type.VARIABLE, value: variable});
	}
	
	/*
		SCANNER: Handle number
	*/
	scan_number(){
		// DEFAULT VALUES FOR POSITIVE BASE 10 NUMBER //
		let negative = false;
		let base = null;
		let is_valid_char = this.is_digit;
		let number_string_offset = 0;
		
		
		// HANDLE OTHER BASES //
		// check for '0' prefix
		if(this.char === "0"){
			// assume we have to cut off a prefix of length 2
			number_string_offset = 2;
			
			// check
			switch(this.peek().toLowerCase()){
				case "b":
					// binary (base 2)
					base = 2;
					is_valid_char = this.is_binary;
					break;
				
				case "o":
					// octal (base 8)
					base = 8;
					is_valid_char = this.is_octal;
					break;
				
				case "x":
					// hexadecimal (base 16)
					base = 16;
					is_valid_char = this.is_hexadecimal;
					break;
				
				default:
					// didn't find valid base-char, ignore prefix
					number_string_offset = 0;
			}
			
			// consume base-char if valid
			if(number_string_offset > 0) this.next();
		}
		
		
		// GET NUMBER'S VALUE AS STRING //
		// consume all valid chars
		while(is_valid_char(this.peek())) this.next();
		
		// allow decimal point on base 10 numbers
		if(base === null && this.peek() === "." && is_valid_char(this.peek(1))){
			// consume decimal point
			this.next();
			
			// consume all valid chars
			while(is_valid_char(this.peek())) this.next();
		}
		
		// get consumed string
		let number_string_full = this.source.substring(this.start, this.end);
		
		
		// HANDLE NEGATIVE NUMBERS //
		if(number_string_full.substring(0, 1) === "-"){
			// remember to negate later
			negative = true;
			
			// ignore minus sign
			number_string_offset++;
		}
		
		
		// STORE NUMBER IN TOKEN //
		// get number string
		let number_string = number_string_full.substring(number_string_offset);
		
		// parse number
		let number;
		if(base !== null){
			// custom base
			number = parseFloat(parseInt(number_string, base));
			
		} else {
			// base 10
			number = parseFloat(number_string);
		}
		
		// maybe negate
		if(negative) number *= -1;
		
		// add token
		this.token_add({type: Juicescript.token_type.NUMBER, value: number});
	}
	
	/*
		SCANNER: Handle identifier
	*/
	scan_identifier(){
		// GET IDENTIFIER NAME //
		// consume all valid chars
		while(this.is_alphanumeric(this.peek())) this.next();
		
		// get consumed string
		let identifier = this.source.substring(this.start, this.end);
		
		
		// CHEKC IF THIS IS A SUFFIXED FLAG //
		// has `:` after it?
		if(this.match(":")){
			// add token
			this.token_add({type: Juicescript.token_type.FLAG, value: identifier});
			
			// ignore the rest
			return;
		}
		
		
		// MAYBE CONVERT IDENTIFIER TO KEYWORD //
		// try to load from lookup table
		let keyword = ({
			"DEF": Juicescript.token_type.DEF,
			
			"GLOB": Juicescript.token_type.GLOBAL,
			"GLOBAL": Juicescript.token_type.GLOBAL,
			"PUB": Juicescript.token_type.GLOBAL,
			"PUBLIC": Juicescript.token_type.GLOBAL,
			
			"END": Juicescript.token_type.END,
			
			"TRUE": Juicescript.token_type.TRUE,
			"FALSE": Juicescript.token_type.FALSE,
			
			"NULL": Juicescript.token_type.NULL,
		})[identifier.toUpperCase()] ?? null;
		
		// found something?
		if(keyword !== null){
			// found entry: add keyword token
			this.token_add({type: keyword});
			
		} else {
			// didn't find entry: add as identifier
			this.token_add({type: Juicescript.token_type.IDENTIFIER, value: identifier});
		}
	}
	
	/*
		SCANNER: Handle flag
	*/
	scan_flag(){
		// GET FLAG NAME //
		// consume all valid characters
		while(this.is_alphanumeric(this.peek())) this.next();
		
		// get consumed string
		let flag = this.source.substring(this.start + 1, this.end);
		
		// consume (=ignore) optional `:` suffix
		this.match(":");
		
		
		// CHECK IF THERE EVEN IS A NAME //
		if(flag.length <= 0){
			// ignore with error
			this.error("unexpected character '" + this.source.charAt(this.start) + "'");
			return;
		}
		
		
		// ADD TOKEN //
		this.token_add({type: Juicescript.token_type.FLAG, value: flag});
	}
	
	/*
		HELPER: Consume next character from source
	*/
	next(){
		this.char = this.source.charAt(this.end++);
	}
	
	/*
		HELPER: Return OFFSET next character from source
	*/
	peek(offset = 0){
		return this.source.charAt(this.end + offset);
	}
	
	/*
		HELPER: Consume (and return true) if OFFSET next character from source matches NEEDLE
	*/
	match(needle, offset = 0){
		// ignore if it doesn't match
		if(this.peek(offset) != needle) return false;
		
		// consume if it matches
		this.end += offset + 1;
		return true;
	}
	
	/*
		HELPER: Return if we are at end of source
	*/
	is_at_end(){
		return this.end >= this.source.length;
	}
	
	/*
		HELPER: Is CHAR a digit?
	*/
	is_digit(char){
		return (char >= "0" && char <= "9");
	}
	
	/*
		HELPER: Is CHAR a binary digit?
	*/
	is_binary(char){
		return (char === "0" || char === "1");
	}
	
	/*
		HELPER: Is CHAR a octal digit?
	*/
	is_octal(char){
		return (char >= "0" && char <= "7");
	}
	
	/*
		HELPER: Is CHAR a hexadecimal digit?
	*/
	is_hexadecimal(char){
		return	(char >= "0" && char <= "9") ||
				(char >= "a" && char <= "f") ||
				(char >= "A" && char <= "F");
	}
	
	/*
		HELPER: Is CHAR a char from a-z?
	*/
	is_alpha(char){
		return	(char >= "a" && char <= "z") ||
				(char >= "A" && char <= "Z");
	}
	
	/*
		HELPER: Is CHAR a in a-z, A-Z, -, _?
	*/
	is_alphanumeric(char){
		return (this.is_alpha(char) || this.is_digit(char) || char === "-" || char === "_");
	}
	
	/*
		HELPER: Add new token object with OPTIONS
	*/
	token_add(options){
		// NEW OJECT //
		let token = {};
		
		
		// COLLECT REQUIRED ATTRIBUTES //
		// type
		token.type = options.type ?? null;
		if(!Juicescript.token_type.has(token.type)){
			throw "invalid token type '" + token.type + "'";
		}
		
		
		// COLLECT ATTRIBUTES WITH POSSIBLE FALLBACK VALUES //
		// line
		token.line = options.line ?? this.line;
		
		// lexeme
		token.lexeme = options.lexeme ?? this.source.substring(this.start, this.end);
		
		
		// OPTIONAL ATTRIBUTES //
		token.value = options.value ?? null;
		
		
		// ADD TO LIST //
		this.token_list.push(token);
	}
	
	/*
		HELPER: Automagically keep track of problems and add additional info to stderr
	*/
	debug(text, additional){
		// add defaults
		additional ??= {};
		additional.line ??= this.line;
		
		// forward
		this.io.stderr.debug(text, additional);
	}
	info(text, additional){
		// add defaults
		additional ??= {};
		additional.line ??= this.line;
		
		// forward
		this.io.stderr.info(text, additional);
	}
	warning(text, additional){
		// KEEP TRACK OF PROBLEM //
		this.warning_count++;
		
		
		// PRINT MESSAGE //
		// add defaults
		additional ??= {};
		additional.line ??= this.line;
		
		// forward
		this.io.stderr.warning(text, additional);
	}
	error(text, additional){
		// KEEP TRACK OF PROBLEM //
		this.error_count++;
		
		
		// PRINT MESSAGE //
		// add defaults
		additional ??= {};
		additional.line ??= this.line;
		
		// forward
		this.io.stderr.error(text, additional);
	}
}
