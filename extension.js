// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const activator = require("./edit/activate");
const manipulate = require("./edit/manipulate");
const maths = require("./edit/maths");

if (!String.prototype.trimspace) {
	String.prototype.trimspace = function () {
		return this.replace(/^ +| +$/g, '');
	};
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	activator.sidePreview(context);
	activator.wrappers(context);
	activator.paste(context);
	activator.insertFromDisk(context);
	activator.applyClam(context);
	activator.activateClam(context);

	let shiftLeft = vscode.commands.registerCommand('summarine.shiftLeft', () => manipulate.lineShifter("left"));
	let shiftRight = vscode.commands.registerCommand('summarine.shiftRight', () => manipulate.lineShifter("right"));
	context.subscriptions.push(shiftLeft);
	context.subscriptions.push(shiftRight);

	let insertPage = vscode.commands.registerCommand('summarine.insertPage', () => manipulate.wrapWithTags("$p=", "$", true));
	context.subscriptions.push(insertPage);

	let mathLettersConverterCommand = vscode.commands.registerCommand('summarine.mathLettersConverter', maths.converter);
	context.subscriptions.push(mathLettersConverterCommand);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
