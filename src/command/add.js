Juicescript.command_define({
	name: "add",
	alias: [],
	
	validate: function(runner){
		// count
		runner.argument_validate_count({min: 2, max: null});
		if(runner.has_error) return;
		
		// types
		runner.argument_validate_type(1, Juicescript.argument_type.VARIABLE);
		
		for(var q = 2; q <= runner.command.argument.length; q++){
			runner.argument_validate_type(q, Juicescript.argument_type.VALUE);
		}
	},
	
	execute: function(runner){
		// GET VARIABLE //
		// variable object
		let variable = runner.argument_variable(1);
		
		// get its value
		let value = runner.variable_get(variable);
		
		
		// ADD OTHER VALUES //
		for(var q = 2; q <= runner.command.argument.length; q++){
			value += runner.argument_value(q);
		}
		
		
		// STORE BACK TO VARIABLE //
		runner.variable_set(variable, value);
	}
});
