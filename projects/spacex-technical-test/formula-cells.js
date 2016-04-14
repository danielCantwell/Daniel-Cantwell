
// Formula Cells

var formulaMode = false;
var targetCell;  // when formula mode is on, this is the cell whose input will be edited by clicking on other cells

function deactivateFormulaMode() {
	formulaMode = false;
	$('*').css('cursor', 'default');
}

function activateFormulaMode() {
	formulaMode = true;
	$('*').css('cursor', 'pointer');
}

/* Keypress events formula-cell handling */
$('#spreadsheet').on('keydown', function(e) {

	if (formulaMode && (e.keyCode == 9 || e.keyCode == 13)) {
		// Formula mode is active and the key is a tab or enter
		deactivateFormulaMode();

	} else if (e.keyCode == 187) {
		// key is "="
		// grab the input whose formula we are potentially creating
		var activeInput = $('input:focus');
		// check if the "=" is the first letter of the input
		if (activeInput.val() != null && activeInput.val().length == 0) {
			activateFormulaMode();
			targetCell = activeInput.parent();
		}
	}
});

/* Click event on the table for formula-cell handling */
$('#spreadsheet').on('click', function(e) {

	if (formulaMode) {
		// focus the cell which we are adding to our formula
		var active = $('input:focus').parent();

		// determine the row number and column name
		var col = active.index();
		var row = active.closest('tr').index();
		var colName = headers[col-1];

		// determine new value of target field
		var targetInput = targetCell.children(":first");

		var newVal = (targetInput.val() + colName + row);
		// update the value and put back in focus
		targetInput.val(newVal);
		targetInput.focus();
	

	} else {
		var input = $('input:focus');
		// check if the cell we are clicking on is showing an evaluated expression
		if (input.data("formula") != undefined) {
			input.val(input.data("formula"));

			// if it is, activate formula mode and allow editing of this expression
			activateFormulaMode();
			targetCell = $('input:focus').parent();
		}
	}
});

/* Checks if the input matches the syntax of a formula */
function isFormula(val) {
	if (val != "" && val[0] == "=") {
		return true;
	} else {
		return false;
	}
}

/* Recursive function to evaluate the formula by finding the result of each
sub-equation, and reducing the formula until only a number is left */
function calculateCellValue(data, formula) {

	console.log("Reducing Formula: " + formula);

	// As per order of operations, first check for and evaluate the power operator
	var index = formula.search(/\^/);
	if (index >= 0) {
		return calculateCellValue(data, reduceFormula(data, formula, index, "^"));
	}

	// Then check for and evaluate multiplication
	index = formula.search(/\*/);
	if (index >= 0) {
		return calculateCellValue(data, reduceFormula(data, formula, index, "*"));
	}

	// Then check for and evaluate division
	index = formula.search(/\//);
	if (index >= 0) {
		return calculateCellValue(data, reduceFormula(data, formula, index, "/"));
	}

	// Then check for and evaluate addition
	index = formula.search(/\+/);
	if (index >= 0) {
		return calculateCellValue(data, reduceFormula(data, formula, index, "+"));
	}

	// Then check for and evaluate subtraction
	index = formula.search(/\-/);
	if (index > 1) { // index > 1 for this one, because if index is one, then it is just a negative value
		return calculateCellValue(data, reduceFormula(data, formula, index, "-"));
	}

	// If no operators remain, return the remaining value and the "="
	return formula.substring(1);
}

/* This is the reduction function for the recursive function, which evaluates a single sub-equation
and returns the formula with the sub-equation replaced by the result
*/
function reduceFormula(data, formula, index, operator) {
	// Divide the formula at the operator
	var firstPart = formula.substring(0, index);
	var secondPart = formula.substring(index + 1);

	// Find the left element to operate on, whether it be the value pointed to by a cell, or a number
	var leftValue;
	var left = findLeftElement(firstPart);
	// left[0] is the type, "cell" or "number"
	// left[1] is the value of the cell / number
	if (left[0] == "cell") {
		// Find the value in the cell
		// left[1].substring(0,1) is the letter corresponding to a header
		// left[1].substring(1) is the number corresponding to a cell
		var col = headers.indexOf(left[1].substring(0, 1));
		var row = left[1].substring(1);
		leftValue = data[row-1][col];
		// If the left value is itself a formula, evaluate that formula and return that value
		if (isFormula(leftValue)) {
			leftValue = calculateCellValue(data, leftValue);
		}
	} else if (left[0] == "number") {
		// Get the number
		leftValue = left[1];
	}

	// Find the right element to operate on, whether it be the value pointed to by a cell, or a number
	var rightValue;
	var right = findRightElement(secondPart);
	// right[0] is the type, "cell" or "number"
	// right[1] is the value of the cell / number
	if (right[0] == "cell") {
		// Find the value in the cell
		// right[1].substring(0,1) is the letter corresponding to a header
		// right[1].substring(1) is the number corresponding to a cell
		var col = headers.indexOf(right[1].substring(0, 1));
		var row = right[1].substring(1);
		rightValue = data[row-1][col];
		// If the right value is itself a formula, evaluate that formula and return that value
		if (isFormula(rightValue)) {
			rightValue = calculateCellValue(data, rightValue);
		}
	} else if (right[0] == "number") {
		// Get the number
		rightValue = right[1];
	}

	// Operations can only be done on numbers
	// If there is a non number, the evaluated formula will show NaN
	leftValue = Number(leftValue);
	rightValue = Number(rightValue);

	// Calculate the new with with the correct operator
	var calculatedValue;
	if (operator == "^") { // power
		calculatedValue = Math.pow(leftValue, rightValue);
	} else if (operator == "*") { // multiplications
		calculatedValue = leftValue * rightValue;
	} else if (operator == "/") { // division
		calculatedValue = leftValue / rightValue;
	} else if (operator == "+") { // addition
		calculatedValue = leftValue + rightValue;
	} else if (operator == "-") { // subtraction
		calculatedValue = leftValue - rightValue;
	}

	// Replace the left operand with the newly calculated value
	var newLeft = firstPart.replace(left[1], calculatedValue);
	// Delete the right operand
	var newRight = secondPart.replace(right[1], '');

	var newFormula = newLeft + newRight;

	return newFormula;
}

// The left operand is the rightmost element of the left string
function findLeftElement(str) {
	// this pattern searches for the last occurence of an operator
	var operatorPattern = /[=\^\*\/\+\-](?!.*[=\^\*\/\+\-])/;
	var cellPattern = /[A-Z]\d/;
	var operatorIndex = str.search(operatorPattern);

	var val = str;

	// If a last operator is found, then we only need to look at the substring after it
	// Otherwise there is only a single operand left and that's all we need to look at
	if (operatorIndex >= 0) {
		val = str.substring(operatorIndex + 1);
	}

	// Check whether the remaining string is a cell pointer or a number
	var cellIndex = val.search(cellPattern);
	if (cellIndex >= 0) {
		return ["cell", val];
	} else {
		return ["number", val];
	}
}

// Get the leftmost element of the right string
function findRightElement(str) {
	// this pattern searches for the first occurrence of an operator
	var operatorPattern = /[\=\^\*\/\+\-]/;
	var cellPattern = /[A-Z]\d/;
	var operatorIndex = str.search(operatorPattern);

	var val = str;

	// If an operator is found, then we only need to look at the substring up to that point
	// Otherwise there is only a single operand left and that's all we need to look at
	if (operatorIndex >= 0) {
		val = str.substring(0, operatorIndex);
	}

	// Check whether the remaining string is a cell pointer or a number
	var cellIndex = val.search(cellPattern);
	if (cellIndex >= 0) {
		return ["cell", val];
	} else {
		return ["number", val];
	}
}