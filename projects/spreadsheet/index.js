
/* UI Widgets */
var clearTableButton = $('#clear-table-button');
var loadKeyText = $('#load-data-key');
var loadButton = $('#load-data-button');
var saveKeyText = $('#save-data-key');
var saveButton = $('#save-data-button');
var table = $('#spreadsheet');

var spreadsheets = {}; // JSON object for saving / loading table data

// Array of letters, used for populating table headers, and retrieving indices based on header values
var headers = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

var tableSize = 10; // size only used for constructing the table

// Create table of set size when window loads
$(document).ready(function() {
	resetTableStructure();
});

// Recreates an empty table
function resetTableStructure() {
	var tableStructure = "";

	// Add the row of column-headers first
	tableStructure += "<tr><th></th>";
	for (var h = 0; h < tableSize; h++) {
		if (headers[h] != null) {
			tableStructure += `<th>${headers[h]}</th>`;
		}
	}
	tableStructure += "</tr>";

	// Create a tableSize x tableSize grid
	for (var i = 0; i < tableSize; i++) {
		tableStructure += `<tr><th>${i + 1}</th>`; // Add a row-header at the beginning of each row
		for (var j = 0; j < tableSize; j++) {
			// For each cell, also add an 'input' element
			tableStructure += "<td align='center'><input type='text'></td>";
		}
		tableStructure += "</tr>";
	}

	// Set the table html
	table.html(tableStructure);
}

/*
On Click Handlers 
*/

clearTableButton.on('click', function() {
	resetTableStructure();
});


// Clicking the 'load' button takes the values stored at a certain key and loads them into the table
loadButton.on('click', function() {

	// If the user was in formula mode, turn it off
	if (formulaMode) {
		deactivateFormulaMode();
	}

	var key = loadKeyText.val(); // Get the value of the key from the textInput
	loadKeyText.val("");  // Empty the text field after grabbing the value
	if (key != "") {
		// we can only load the data from a specified key
		resetTableStructure(); // Before loading the new data, we want to clear out old data

		// load_data returns a string, which we then parse into a JSON object
		var stringData = load_data(key);
		var data = JSON.parse(stringData);
		console.log("Loaded Spreadsheet");
		console.log(data);

		// update the header value to the name of the spreadsheet
		$('#header').html(`Spreadsheet: ${key}`);

		for (var i = 0; i < data.length; i++) {
			// Loop through every row of data
			for (var j = 0; j < data[i].length; j++) {
				// Loop through every column of data for each row

				var dataValue = data[i][j];
				var cellInput = $('#spreadsheet tr').eq(i + 1).find('td').eq(j).children(":first");

				// Check if the value has the format of a formula
				if (isFormula(dataValue)) {
					cellInput.css('color', 'red'); // color evaluated fields red
					var formulaValue;
					// Make sure the formula only contains usable operators
					if (dataValue.search(/[^A-Z0-9\=\^\*\/\+\-\(\).]/) >= 0) {
						formulaValue = "Invalid Characters In Formula";
					} else {
						try {
							formulaValue = calculateCellValue(data, dataValue);
						} catch(err) {
							formulaValue = "error in formula";
						}
					}

					// Set the text of the inputField to the result of the formula evaluation
					cellInput.val(formulaValue);
					// Set the data of the inputField to the formula itself, so that the cell knows where the displayed value comes from
					cellInput.data("formula", dataValue);
				} else {
					// Otherwise, it's just a normal value, and we set the text of inputField to that value
					cellInput.val(dataValue);
				}
			}
		}
	} else {
		// if the key doesn't exist, prompt the user
		loadKeyText.attr('placeholder', 'Please enter a value');
	}
});

// Clicking the 'save' button takes the values in the table and saved them at a certain key
saveButton.on('click', function() {
	// if the user was in formula mode, turn it off
	if (formulaMode) {
		deactivateFormulaMode();
	}

	var key = saveKeyText.val(); // Get the value of the key from the textInput
	saveKeyText.val(""); // Empty to text field after grabbing the value
	if (key != "") {
		// we can only save the data if the key exists
		save_data(key, getJsonFromTable());
		console.log("Saved Spreadsheet");
		console.log(spreadsheets);

		// update the header value to the name of the spreadsheet
		$('#header').html(`Spreadsheet: ${key}`);
	} else {
		// if the key doesn't exist, prompt the user
		saveKeyText.attr('placeholder', 'Please enter a value');
	}
});



/* Format the data in the table as JSON */
function getJsonFromTable() {

	var data = "["; // Add the first opening brace to the 2d array

	// Loop through the rows of the table
	for (var i = 0; i < tableSize; i++) {
		data += "["; // Add the opening brace of an inner array

		var rowHasData = false;
		// Loop through the columns in the rows
		for (var j = 0; j < tableSize; j++) {

			// grab the input field for the cell at the row/column
			var inputField = $('#spreadsheet tr').eq(i + 1).find('td').eq(j).children(":first");

			var value;
			var formulaValue = inputField.data("formula");			
			if (formulaValue != undefined && !isFormula(inputField.val())) {
				// if the value is the result of evaluating a formula, save the formula
				value = formulaValue;
			} else {
				// otherwise, just save the value (which could be a formula, if not yet evaluated)
				value = inputField.val();
			}

			// only save the value if the cell is not empty
			if (value != "") {
				value = JSON.stringify(value);
				if (rowHasData) {
					data += ", " + value; // if the cell value is not the first in the row, add a comma first
				} else {
					data += value;
				}
				rowHasData = true;
			}
		}

		// Add the closing brace to an inner array
		if (i < tableSize - 1) {
			data += "], "; // If there are more inner arrays, add a comma
		} else {
			data += "]";
		}
	}
	data += "]"; // Add the final closing brace to the 2d array

	return data;
}



/* Return the JSON data corresponding the the key value */
function load_data(key) {
	return spreadsheets[key];
}

/* Save the json data to the specificed key value */
function save_data(key, data) {
	spreadsheets[key] = data;
}