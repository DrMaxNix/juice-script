<!DOCTYPE html>
<html lang="en" dir="ltr">
	<head>
		<meta charset="utf-8">
		<link rel="shortcut icon" href="/icon.png">
		<title>Juicescript dev env</title>
		
		<style>
			:root {
				--onedark-bg: #21252b;
				--onedark-bg-light: #2c313a;
				--onedark-white: #c5cad3;
				--onedark-gray: #828997;
				--onedark-gray-dark: #5c6370;
				--onedark-red: #e06c75;
				--onedark-orange: #d19a66;
				--onedark-yellow: #e5c07b;
				--onedark-green: #98c379;
				--onedark-cyan: #56b6c2;
				--onedark-blue: #61afef;
				--onedark-purple: #c678dd;
			}
			html, body {
				margin: 0px;
				padding: 0px;
			}
			body {
				background-color: var(--onedark-bg);
			}
			div.text-output-container {
				height: calc(100vh - 4rem - 4px);
				width: calc(100vw - 4rem - 4px);
				padding: 2rem;
			}
			#text-output-area {
				height: calc(100% - 2rem);
				width: calc(100% - 2rem);
				padding: 1rem;
				margin: 0px;
				
				overflow: auto;
				font-size: 1rem;
				
				background-color: var(--onedark-bg-light);
				border: none;
			}
			span.line {
				display: block;
				color: var(--onedark-white);
			}
			span.line.stderr-debug { color: var(--onedark-green); }
			span.line.stderr-info { color: var(--onedark-blue); }
			span.line.stderr-warning { color: var(--onedark-orange); }
			span.line.stderr-error { color: var(--onedark-red); }
			span.line.stderr-javascript { color: var(--onedark-purple); }
		</style>
		
		<script type="text/javascript">
			// CLEAR DEBUGGING FLAGS //
			// line occupancy in built js source
			let debug_source_line_occupancy = {};
			
			
			// EMPTY ERROR BUFFER FOR TIME UNTIL HTML IS AVAILABLE //
			let javascript_error_buffer = [];
			
			
			function debug_javascript_error_message(error_event){
				// TRANSLATE TO SOURCE FILE'S LINES //
				// find source file occupying this line
				let source_file = null;
				let source_line = 0;
				for(var one_source_file in debug_source_line_occupancy){
					let occupancy = debug_source_line_occupancy[one_source_file];
					if(error_event.lineno >= occupancy.start && (occupancy.end === undefined || error_event.lineno <= occupancy.end)){
						// remember source file name
						source_file = one_source_file;
						
						// translate compiled line to source file line
						source_line = error_event.lineno - debug_source_line_occupancy[source_file].start + 1;
						
						// stop searching
						break;
					}
				}
				
				
				// OUTPUT MESSAGE //
				// build line info
				let line_info_string;
				if(source_file !== null){
					line_info_string = source_file + " line " + source_line;
				} else {
					line_info_string = "raw source" + " line " + error_event.lineno;
				}
				
				// send to callback
				my_error_callback("(" + line_info_string + ") " + error_event.message, "javascript");
			}
			
			
			// EMPTY ERROR BUFFER WHEN HTML IS AVAILABLE //
			document.addEventListener("DOMContentLoaded", function(){
				// print messages
				for(var one_error_event of javascript_error_buffer){
					debug_javascript_error_message(one_error_event);
				}
				
				// disable buffer
				javascript_error_buffer = null;
			});
			
			window.addEventListener("error", function(error_event){
				// OUTPUT //
				if(javascript_error_buffer !== null){
					// add to buffer
					javascript_error_buffer.push(error_event);
					
				} else {
					// output directly
					debug_javascript_error_message(error_event);
				}
				
				
				// DON'T CANCEL EVENT //
				return false;
			});
		</script>
		
		<script type="text/javascript">
			"use strict";
			<?php
				foreach(scandir("../src/helper") as $one_file){
					if(is_file("../src/helper/" . $one_file)){
						echo("debug_source_line_occupancy[\"" . $one_file . "\"] = {start: new Error().lineNumber};");
						require("../src/helper/" . $one_file);
						echo("\n");
						echo("debug_source_line_occupancy[\"" . $one_file . "\"].end = new Error().lineNumber;");
					}
				}
				
				foreach(scandir("../src") as $one_file){
					if(is_file("../src/" . $one_file)){
						echo("debug_source_line_occupancy[\"" . $one_file . "\"] = {start: new Error().lineNumber};");
						require("../src/" . $one_file);
						echo("\n");
						echo("debug_source_line_occupancy[\"" . $one_file . "\"].end = new Error().lineNumber;");
					}
				}
				
				foreach(scandir("../src/command") as $one_file){
					if(is_file("../src/command/" . $one_file)){
						echo("debug_source_line_occupancy[\"" . $one_file . "\"] = {start: new Error().lineNumber};");
						require("../src/command/" . $one_file);
						echo("\n");
						echo("debug_source_line_occupancy[\"" . $one_file . "\"].end = new Error().lineNumber;");
					}
				}
			?>
		</script>
		
		<script type="text/javascript">
			let juice_program = <?php echo(json_encode(file_get_contents("juice-program.jce"))); ?>;
		</script>
		
		<script type="text/javascript">
			let my_output_callback = function(text){
				let line_list = text.split("\n");
				
				for(let one_line of line_list){
					let span_one_line = document.createElement("span");
					
					span_one_line.classList.add("line");
					span_one_line.textContent = one_line;
					
					document.getElementById("text-output-area").appendChild(span_one_line);
					document.getElementById("text-output-area").scrollTop = document.getElementById("text-output-area").scrollHeight;
				}
			}
			let my_error_callback = function(text, type){
				let span_one_line = document.createElement("span");
				
				span_one_line.classList.add("line", "stderr-" + type);
				span_one_line.textContent = text + "\n";
				
				document.getElementById("text-output-area").appendChild(span_one_line);
				document.getElementById("text-output-area").scrollTop = document.getElementById("text-output-area").scrollHeight;
			}
			
			let juicescript = new Juicescript({
				callback: {
					stdout: my_output_callback,
					stderr: my_error_callback
				}
			});
			
			document.addEventListener("DOMContentLoaded", function(){
				// handle missing source file
				if(juice_program === false){
					juicescript.io.stderr.error("No source file found! Add one at 'dev/juice-program.jce'");
					return;
				}
				
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
			});
		</script>
	</head>
	<body>
		<div class="text-output-container">
			<pre id="text-output-area"></pre>
		</div>
	</body>
</html>
