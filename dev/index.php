<!DOCTYPE html>
<html lang="en" dir="ltr">
	<head>
		<meta charset="utf-8">
		<link rel="shortcut icon" href="/icon.png">
		<title>Juicescript dev env</title>
		
		<meta name="viewport" content="width=device-width, initial-scale=0.8, user-scalable=0">
		
		<style media="screen">
			:root {
				<?php if(isset($_GET["light"])){ ?>
					--onedark-bg: #fafafa;
					--onedark-bg-light: #f0f0f0;
					--onedark-white: #2c313a;
					--onedark-gray: #686f7d;
					--onedark-gray-dark: #8f96a3;
					--onedark-gray-dark-dark: #abb1ba;
					--onedark-red: #e45649;
					--onedark-orange: #f79400;
					--onedark-yellow: #f3c03f;
					--onedark-green: #50a14f;
					--onedark-cyan: #01b1bc;
					--onedark-blue: #4078f2;
					--onedark-purple: #a626a4;
				<?php } else { ?>
					--onedark-bg: #21252b;
					--onedark-bg-light: #2c313a;
					--onedark-white: #c5cad3;
					--onedark-gray: #828997;
					--onedark-gray-dark: #5c6370;
					--onedark-gray-dark-dark: #454b54;
					--onedark-red: #e06c75;
					--onedark-orange: #d19a66;
					--onedark-yellow: #e5c07b;
					--onedark-green: #98c379;
					--onedark-cyan: #56b6c2;
					--onedark-blue: #61afef;
					--onedark-purple: #c678dd;
				<?php } ?>
			}
		</style>
		
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
				<textarea id="editor" class="prism-live line-numbers language-juice fill">set $q 0

loop:
	echo $q
	add $q 1
if $q < 10
	jump "loop"
</textarea>
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
