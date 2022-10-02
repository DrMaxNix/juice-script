Juicescript.command_define({
	name: "mod",
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
		
		
		// APPLY MODULO FROM OTHER ARGUMENTS //
		for(var q = 2; q <= runner.command.argument.length; q++){
			// get value to use with modulo operation
			let modulo = runner.argument_value(q);
			
			// validate data type
			let data_type = runner.data_type(modulo);
			if(data_type !== Juicescript.data_type.NUM){
				// ignore with warning
				runner.warning_argument(q, "expected data type NUM, but got " + Juicescript.data_type.name(data_type));
				continue;
			}
			
			// do calculation
			value %= modulo;
		}
		
		
		// STORE BACK TO VARIABLE //
		runner.variable_set(variable, value);
	}
});
