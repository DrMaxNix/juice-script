Juicescript.command_define({
	name: "ifl",
	alias: ["if"],
	
	validate: function(runner){
		// COUNT //
		runner.argument_validate_count({min: 1, max: 3});
		if(runner.has_error) return;
		
		
		// TYPES //
		// single value
		if(runner.command.argument.length === 1){
			runner.argument_validate_type(1, Juicescript.argument_type.VALUE);
			return;
		}
		
		// single value negated
		if(runner.command.argument.length === 2){
			runner.argument_validate_type(1, Juicescript.argument_type.OPERATOR);
			runner.argument_validate_type(2, Juicescript.argument_type.VALUE);
			return;
		}
		
		// two values compared
		runner.argument_validate_type(1, Juicescript.argument_type.VALUE);
		runner.argument_validate_type(2, Juicescript.argument_type.OPERATOR);
		runner.argument_validate_type(3, Juicescript.argument_type.VALUE);
	},
	
	execute: function(runner){
		// EVALUATE CONDITION //
		let is_true = this.evaluate(runner);
		
		
		// MAYBE JUMP OVER NEXT COMMAND //
		if(!is_true){
			// increase command counter by one
			runner.counter++;
		}
	},
	
	evaluate: function(runner){
		// SINGLE VALUE //
		if(runner.command.argument.length === 1){
			// get value
			let value = runner.argument_value(1);
			
			// compare to true
			return (value === true);
		}
		
		
		// SINGLE VALUE NEGATED //
		if(runner.command.argument.length === 2){
			// make sure first argument is an exclamation mark
			if(runner.command.argument[0].operator !== Juicescript.token_type.NOT){
				// ignore with error
				runner.error("expected NOT, but got " + Juicescript.token_type.name(runner.command.argument[0].operator));
				return false;
			}
			
			// get value
			let value = runner.argument_value(2);
			
			// compare to true and negate
			return !(value === true);
		}
		
		
		// TWO VALUES COMPARED //
		// get operator
		let operator = runner.command.argument[1].operator;
		
		// get two values
		let a = runner.argument_value(1);
		let b = runner.argument_value(3);
		
		// do compare
		if(operator === Juicescript.token_type.EQUAL_EQUAL) return (a === b);
		if(operator === Juicescript.token_type.NOT_EQUAL) return (a !== b);
		if(operator === Juicescript.token_type.GREATER) return (a > b);
		if(operator === Juicescript.token_type.GREATER_EQUAL) return (a >= b);
		if(operator === Juicescript.token_type.LESS) return (a < b);
		if(operator === Juicescript.token_type.LESS_EQUAL) return (a <= b);
		
		// if we reach this, the operator is invalid
		runner.error("expected COMPARE OPERATOR, but got " + Juicescript.token_type.name(operator));
		return false;
	}
});
