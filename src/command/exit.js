Juicescript.command_define({
	name: "exit",
	alias: ["return"],
	
	validate: function(runner){
		// count
		runner.argument_validate_count(0);
	},
	
	execute: function(runner){
		// MOVE COMMAND COUNTER TO END OF CURRENT SCOPE //
		runner.counter = runner.scope_tree.command.length;
	}
});
