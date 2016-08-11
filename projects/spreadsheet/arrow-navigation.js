
// Arrow Key Navigation

$('#spreadsheet').on('keydown', function(e) {

	if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
		// The key is one of the arrows
		e.preventDefault();

		// grab the cell containing the inputField in focus
		var active = $('input:focus').parent();
		// determine the cell's row and column
		var col = active.index();
		var row = active.closest('tr').index();

		if (e.keyCode == 37) {
			col--; // left row
		} else if (e.keyCode == 38) {
			row--; // up arrow
		} else if (e.keyCode == 39) {
			col++; // right arrow
		} else if (e.keyCode == 40) {
			row++;  // down arrow
		}

		// make sure we are still in the table bounds before we try to move cells
		if (col >= 1 && col <= tableSize && row >= 1 && row <= tableSize) {
			// Grab the cell pointed to by the new row/col value
			var cell = $('tr').eq(row).find('td').eq(col - 1);
			// Set focus on its input field
			cell.children(':first').focus();
			// If we use arrows during formula mode, we want do deactivate formula mode and actually move to the next cell
			if (formulaMode) {
				deactivateFormulaMode();
			}
		}
	}
});