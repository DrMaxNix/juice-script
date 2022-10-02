Juicescript.command_define({
	name: "cst",
	alias: ["cast"],
	
	validate: function(runner){
		// count
		runner.argument_validate_count(2);
		if(runner.has_error) return;
		
		// types
		runner.argument_validate_type(1, Juicescript.argument_type.VARIABLE);
		runner.argument_validate_type(2, Juicescript.argument_type.VALUE);
	},
	
	execute: function(runner){
		// GET VARIABLE //
		// resolve first argument to absolute variable object
		let variable = runner.argument_variable(1);
		
		// get its value
		let value = runner.variable_get(variable);
		
		
		// GET WANTED NEW DATA TYPE //
		// read argument value
		let data_type_input = runner.argument_value(2);
		
		// validate data type
		let data_type_of_data_type_input = runner.data_type(data_type_input);
		if(data_type_of_data_type_input !== Juicescript.data_type.STR){
			// ignore with warning
			runner.warning_argument(2, "expected data type STR, but got " + Juicescript.data_type.name(data_type_of_data_type_input));
			return;
		}
		
		// try to find enum by name
		let data_type = Juicescript.data_type.find(data_type_input);
		if(data_type === null){
			// ignore with warning
			runner.warning_argument(2, "invalid data type '" + data_type_input + "'");
			return;
		}
		
		
		// CAST TO NULL //
		if(data_type === Juicescript.data_type.NULL){
			// change value to 'null'
			runner.variable_set(variable, null);
			return;
		}
		
		
		// CAST TO BOOLEAN //
		if(data_type === Juicescript.data_type.BOOL){
			// will always be false
			runner.variable_set(variable, false);
			return;
		}
		
		
		// CAST TO NUMBER //
		if(data_type === Juicescript.data_type.NUM){
			// hardcoded cases
			if(value === null){ runner.variable_set(variable, 0); return; }
			if(value === true){ runner.variable_set(variable, 1); return; }
			if(value === false){ runner.variable_set(variable, 0); return; }
			
			// try to convert using javascript's Number method
			let number = Number(value);
			
			// fallback if it didn't work
			if(typeof number !== "number" || Number.isNaN(number)) number = 0;
			
			// store to variable
			runner.variable_set(variable, number);
			return;
		}
		
		
		// CAST TO STRING //
		if(data_type === Juicescript.data_type.STR){
			// use own stringify method
			runner.variable_set(variable, runner.stringify(value));
			return;
		}
	}
});
