Juicescript.command_add({
	name: "mov",
	alias: ["move", "set"],
	function: function(runner){
		// VALIDATE ARGUMENTS //
		// count
		runner.argument_validate_count(2);
		
		// types
		runner.argument_validate_type(1, Juicescript.argument_type.VARIABLE);
		runner.argument_validate_type(2, Juicescript.argument_type.VALUE);
	}
});
