Juicescript.command_add({
	name: "drw",
	alias: ["draw", "echo"],
	function: function(runner){
		/**/runner.io.stdout(runner.command.argument[0].value);
	}
});
