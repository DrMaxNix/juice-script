Juicescript.command_define({
	name: "halt",
	alias: ["stop"],
	
	validate: function(runner){
		// count
		runner.argument_validate_count(0);
	},
	
	execute: function(runner){
		// MOVE COMMAND COUNTER TO END OF ROOT SCOPE //
		// move to root scope
		runner.stack = [{
			scope: null
		}];
		
		// set command counter to end
		runner.counter = runner.scope_tree.command.length;
	}
});
