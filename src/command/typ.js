Juicescript.command_define({
	name: "typ",
	alias: ["type"],
	
	validate: function(runner){
		// count
		runner.argument_validate_count(1);
		if(runner.has_error) return;
		
		// types
		runner.argument_validate_type(1, Juicescript.argument_type.VARIABLE);
	},
	
	execute: function(runner){
		// GET VARIABLE //
		// resolve argument to absolute variable object
		let variable = runner.argument_variable(1);
		
		
		// GET TYPE STRING //
		// get variable's type
		let type = runner.variable_type(variable);
		
		// convert to string
		let type_string = Juicescript.variable_type.name(type).toLowerCase();
		
		
		// STORE BACK INTO VARIABLE //
		runner.variable_set(variable, type_string);
	}
});
