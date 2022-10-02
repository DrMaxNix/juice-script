Juicescript.command_define({
	name: "drw",
	alias: ["draw", "echo"],
	
	validate: function(runner){
		// count
		runner.argument_validate_count({min: 1, max: null});
		if(runner.has_error) return;
		
		// types
		for(var q = 1; q <= runner.command.argument.length; q++){
			runner.argument_validate_type(q, Juicescript.argument_type.VALUE);
		}
	},
	
	execute: function(runner){
		// CONCATENATE ALL ARGUMENTS //
		let string = "";
		for(var q = 1; q <= runner.command.argument.length; q++){
			// append to string
			string += runner.stringify(runner.argument_value(q));
		}
		
		
		// PRINT TO STDOUT //
		runner.io.stdout(string);
	}
});
