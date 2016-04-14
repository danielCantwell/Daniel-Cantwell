
// // Mouse Drag Select

var isMouseDown = false;
var leftCol, rightCol, topRow, bottomRow;
var multiSelection = false;
var clickDownTarget;
var clickCol, clickRow;

$('#spreadsheet')
	.on('mousedown', function(e) {
		isMouseDown = true;
		multiSelection = false;

		// Remove any previously highlighted rows (restart the selection)
		for (var i = topRow; i <= bottomRow; i++) {
			for (var j = leftCol; j <= rightCol; j++) {
				var cell = $('tr').eq(i).find('td').eq(j-1);
				var inputField = cell.children(':first');
				inputField.removeClass('multi-selected');
			}
		}
		
		// Get the cell and location of the click
		clickDownTarget = $(e.target);
		var cell = clickDownTarget.parent();
		var col = cell.index();
		var row = cell.closest('tr').index();

		// Remember cell location of initial click
		clickCol = col;
		clickRow = row;

		// Start keeping track of the rest of the selected cells
		leftCol = col;
		rightCol = col;
		topRow = row;
		bottomRow = row;
	})
	.on('mouseover', function(e) {

		// We only want to act on mouse drag, so the mouse must be down during mouseover
		if (isMouseDown) {
			// Get the cell location of the mouseover
			var cell = $(e.target).parent();
			var col = cell.index();
			var row = cell.closest('tr').index();

			clickDownTarget.addClass('multi-selected');

			// Iterate through the previously selected rows and remove the highlight
			// because they might not be selected in the rectangle anymore
			for (var i = topRow; i <= bottomRow; i++) {
				for (var j = leftCol; j <= rightCol; j++) {
					var cell = $('tr').eq(i).find('td').eq(j-1);
					var inputField = cell.children(':first');
					inputField.removeClass('multi-selected');
				}
			}

			// Update left and right column positions
			if (col > clickCol) {
				rightCol = col;
				multiSelection = true;
			} else if (col < clickCol) {
				leftCol = col;
				multiSelection = true;
			} else {
				leftCol = col;
				rightCol = col;
			}

			// Update top and bottom row positions
			if (row > clickRow) {
				bottomRow = row;
				multiSelection = true;
			} else if (row < clickRow) {
				multiSelection = true;
				topRow = row;
			} else {
				topRow = row;
				bottomRow = row;
			}

			// Iterate through the currently selected rows  and add highlight
			for (var i = topRow; i <= bottomRow; i++) {
				for (var j = leftCol; j <= rightCol; j++) {
					var cell = $('tr').eq(i).find('td').eq(j-1);
					var inputField = cell.children(':first');
					if (!(i == 0 || j == 0)) {
						inputField.addClass('multi-selected');
					}
				}
			}
		}
	})
	.on('mouseup', function(e) {
		// When we release the mouse, we only have to tell the program that we not longer have the mouse down
		isMouseDown = false;
	});

$('#spreadsheet').on('keydown', function(e) {
	// if multiple cells were selected, and then backspace or delete was pressed
	if (multiSelection == true && (e.keyCode == 8 || e.keyCode == 46)) {

		// iterate through each cell in the selected rectangle
		for (var i = topRow; i <= bottomRow; i++) {
			for (var j = leftCol; j <= rightCol; j++) {
				var cell = $('tr').eq(i).find('td').eq(j-1);
				var inputField = cell.children(':first');
				inputField.val(""); // delete the cell value
				inputField.removeClass('multi-selected'); // remove the highlight
			}
		}

		// remove the selection
		multiSelection = false;
	}
});