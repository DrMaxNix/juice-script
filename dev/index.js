"use strict";
let my_output_callback = function(text){
	let line_list = text.split("\n");
	
	for(let one_line of line_list){
		let span_one_line = document.createElement("span");
		
		span_one_line.classList.add("line");
		span_one_line.textContent = one_line;
		
		document.getElementById("console").appendChild(span_one_line);
		document.getElementById("console").scrollTop = document.getElementById("console").scrollHeight;
	}
}
let my_error_callback = function(text, type){
	let span_one_line = document.createElement("span");
	
	span_one_line.classList.add("line", "stderr-" + type);
	span_one_line.textContent = text + "\n";
	
	document.getElementById("console").appendChild(span_one_line);
	document.getElementById("console").scrollTop = document.getElementById("console").scrollHeight;
}

let juicescript = new Juicescript({
	callback: {
		stdout: my_output_callback,
		stderr: my_error_callback
	}
});

function button_run(){
	// clear console
	document.getElementById("console").innerHTML = "";
	
	// get source code from editor
	let juice_program = document.getElementById("editor").value;
	
	// parse source code
	/**/const parse_start = performance.now();
	let parse_success = juicescript.parse(juice_program);
	/**/const parse_end = performance.now();
	/**/juicescript.io.stderr.info("Parsing took " + (parse_end - parse_start) + "ms");
	
	// execute program
	if(parse_success){
		/**/const run_start = performance.now();
		juicescript.run();
		/**/const run_end = performance.now();
		/**/juicescript.io.stderr.info("Running took " + (run_end - run_start) + "ms");
		
	} else {
		juicescript.io.stderr.info("Not executing program due to parse error");
	}
}
