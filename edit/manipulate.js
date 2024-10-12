
const vscode = require('vscode');

// Generalized wrapping function
function wrapWithTags(startTag, endTag, inline = false, offset = 0) {
	const editor = vscode.window.activeTextEditor;

	if (editor) {
		const { selection } = editor;
		const selectedText = editor.document.getText(selection);

		// If inline wrap, there don't need to be newlines
		let infix = "";
		if (!inline) {
			infix = "\n\n";
		}

		editor.edit(editBuilder => {
			if (selection.isEmpty) {
				// No selection, insert the tags at the cursor
				editBuilder.insert(selection.start, `${startTag}${infix}${endTag}`);
			} else {
				// Wrap the selected text
				editBuilder.replace(selection, `${startTag}${selectedText}${endTag}`);
			}
		}).then(() => {
			// Move the cursor between the new lines if there was no selection
			if (selection.isEmpty) {
				let startPos = !inline ? 1 : 0;
				startPos += offset;

				const newPosition = selection.start.translate(startPos, startTag.length);
				editor.selection = new vscode.Selection(newPosition, newPosition);
			}
		});
	}
}

// Shift line level from left to right
function lineShifter(direction) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}

	const { selection } = editor;

	editor.edit(editBuilder => {
		// Modify each line in the selection (or at the cursor)
		for (let i = selection.start.line; i <= selection.end.line; i++) {
			const line = editor.document.lineAt(i);

			if (direction == "right") {
				// From '- boing' to '\t- boing'
				if (line.text.trimspace().startsWith("-")) {
					editBuilder.replace(line.range, `\t${line.text}`);
				}
				// From '\t-boing' to '\t\t- boing'
				else if (line.text.trimspace().startsWith("\t")) {
					editBuilder.replace(line.range, `\t${line.text}`);
				}
				// From 'boing' to '- boing'
				else {
					editBuilder.replace(line.range, `- ${line.text}`);
				}
			} else if (direction == "left") {
				// From '- boing' to 'boing'
				if (line.text.trimspace().startsWith("-")) {
					editBuilder.replace(line.range, line.text.substring(2));
				}
				// From '\t- boing' to 'boing'
				else if (line.text.trimspace().startsWith("\t")) {
					editBuilder.replace(line.range, line.text.substring(1));
				}
				// In other cases, no action is necessary
			}
		}
	});
}

module.exports = { wrapWithTags, lineShifter };