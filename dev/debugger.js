"use strict";
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
