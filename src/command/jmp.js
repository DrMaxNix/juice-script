Juicescript.command_define({
	name: "jmp",
	alias: ["jump", "goto"],
	
	validate: function(runner){
		// count
		runner.argument_validate_count(1);
		if(runner.has_error) return;
		
		// types
		runner.argument_validate_type(1, Juicescript.argument_type.VALUE);
	},
	
	execute: function(runner){
		// GET FLAG DATA //
		// flag name
		let flag = runner.argument_value(1);
		
		// validate data type
		let data_type = runner.data_type(flag);
		if(data_type !== Juicescript.data_type.STR){
			// ignore with warning
			runner.warning_argument(1, "expected data type STR, but got " + Juicescript.data_type.name(data_type));
			return;
		}
		
		// load this scope's flag list
		let flag_list = runner.scope_tree.flag;
		
		// check if this flag exists
		if(!Object.keys(flag_list).includes(flag)){
			// ignore with warning
			runner.warning("unknown flag '" + flag + "'");
			return;
		}
		
		// get number of following command
		let following_command_number = flag_list[flag].command_next;
		
		
		// SET COMMAND COUNTER //
		runner.counter = following_command_number;
	}
});
