Juicescript.command_define({
	name: "mul",
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
		
		// get its value and data_type
		let value = runner.variable_get(variable);
		let data_type = runner.data_type(value);
		
		
		// MULTIPLY ALL OTHER FACTORS //
		let main_factor = 1;
		for(var q = 2; q <= runner.command.argument.length; q++){
			// get factor
			let factor = runner.argument_value(q);
			
			// validate data type
			let factor_data_type = runner.data_type(factor);
			if(factor_data_type !== Juicescript.data_type.NUM){
				// ignore with warning
				runner.warning_argument(q, "invalid data type " + Juicescript.data_type.name(factor_data_type));
				continue;
			}
			
			// factor into main factor
			main_factor *= factor;
		}
		
		
		// NUMBER MULTIPLICATION //
		if(data_type === Juicescript.data_type.NUM){
			// multiply by main factor
			value *= main_factor
			
			// store back to variable
			runner.variable_set(variable, value);
			return;
		}
		
		
		// STRING MULTIPLICATION //
		if(data_type === Juicescript.data_type.STR){
			// repeat string factor-times
			value = value.repeat(main_factor);
			
			// store back to variable
			runner.variable_set(variable, value);
			return;
		}
		
		
		// INVALID DATA TYPE //
		// ignore with warning
		runner.warning_argument(1, "invalid data type " + Juicescript.data_type.name(data_type));
	}
});
