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
		// resolve first argument to absolute variable object
		let variable = runner.argument_variable(1);
		
		// get value to assign from second argument
		let value = runner.argument_value(2);
		
		// assign value to variable
		runner.variable_set(variable, value);
	}
});
