Juicescript.command_define({
	name: "mov",
	alias: ["move", "set"],
	
	validate: function(runner){
		// count
		runner.argument_validate_count(2);
		if(runner.has_error) return;
		
		// types
		runner.argument_validate_type(1, Juicescript.argument_type.VARIABLE);
		runner.argument_validate_type(2, Juicescript.argument_type.VALUE);
	},
	
	execute: function(runner){
		// ASSIGN VALUE //
		// get value to assign
		let value = runner.argument_value(2);
		/**/runner.debug(value);
	}
});
