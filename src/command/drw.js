Juicescript.command_add({
	name: "drw",
	alias: ["draw", "echo"],
	function: function(runner){
		// VALIDATE ARGUMENTS //
		// count
		runner.argument_validate_count({min: 1, max: null});
		
		// types
		for(var q = 1; q <= runner.command.argument.length; q++){
			runner.argument_validate_type(q, Juicescript.argument_type.VALUE);
		}
	}
});
