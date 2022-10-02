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
			// get value to add
			let add = runner.argument_value(q);
			
			// validate data type
			let data_type = runner.data_type(add);
			if(data_type !== Juicescript.data_type.NUM && data_type !== Juicescript.data_type.STR){
				// ignore with warning
				runner.warning_argument(q, "invalid data type " + Juicescript.data_type.name(data_type));
				continue;
			}
			
			// do calculation
			value += add;
		}
		
		
		// STORE BACK TO VARIABLE //
		runner.variable_set(variable, value);
	}
});
