<!DOCTYPE html>
<html lang="en" dir="ltr">
	<head>
		<meta charset="utf-8">
		<link rel="shortcut icon" href="/icon.png">
		<title>Juicescript dev env</title>
		
		<link rel="stylesheet" href="/prism/prism-onedark.css">
		<link rel="stylesheet" href="/prism/prism-line-numbers.css">
		<link rel="stylesheet" href="/prism/prism-live.css">
		<link rel="stylesheet" href="/tabler-icons/tabler-icons.min.css">
		
		<link rel="stylesheet" href="/index.css">
		
		<script type="text/javascript">
			<?php
				require("debugger.js");
				echo("\n");
			?>
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
			<?php
				echo("debug_source_line_occupancy[\"index.js\"] = {start: new Error().lineNumber};");
				require("index.js");
				echo("\n");
				echo("debug_source_line_occupancy[\"index.js\"].end = new Error().lineNumber;");
			?>
		</script>
	</head>
	<body>
		<div class="collection">
			<div class="item editor">
				<textarea id="editor" class="prism-live line-numbers language-ruby fill"></textarea>
			</div>
			
			<div class="item console">
				<div class="button-list controls">
					<a onclick="button_run()" class="button one-line">
						<span class="icon ti ti-player-play"></span>
						<span class="text">Run</span>
					</a>
				</div>
				
				<pre id="console"></pre>
			</div>
		</div>
		
		<script src="/prism/bliss.shy.min.js"></script>
		<script src="/prism/prism-juicescript.js"></script> 
		<script src="/prism/prism-line-numbers.js"></script>
		<script src="/prism/prism-live.js"></script>
	</body>
</html>
