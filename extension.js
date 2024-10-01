// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const summarine = require("./summarine/render");
const fs = require('fs');
const path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "summarine" is now active!');

	let disposable = vscode.commands.registerCommand('summarine.sidePreview', function () {
		// Create a new webview panel
		const panel = vscode.window.createWebviewPanel(
			'markdownPreview', // Identifies the type of the webview panel
			'Markdown Preview', // Title of the panel
			vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'summarine'),
				vscode.Uri.joinPath(context.extensionUri, 'summarine', 'static'),
				]
			} // Options to control the webview panel
		);

		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const doc = editor.document;

			const filePath = doc.uri.fsPath; // e.g. /summarine/Elastic Net/glmnet intrduction/content.md
			const directoryName = path.dirname(filePath); // e.g. /summarine/Elastic Net/glmnet intrduction/
			const coursePath = path.dirname(directoryName); // e.g. /summarine/Elastic Net/
			const fileName = path.basename(directoryName); // e.g. glmnet intrduction

			// Set the initial HTML content
			setWebviewContent(doc.getText(), context, panel, coursePath, fileName);

			// Update content when the document changes
			const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(event => {
				if (event.document.uri.toString() === doc.uri.toString()) {
					setWebviewContent(event.document.getText(), context, panel, coursePath, fileName);
				}
			});

			// Dispose event listener when the panel is closed
			panel.onDidDispose(() => {
				changeDocumentSubscription.dispose();
			});
		}
	});

	context.subscriptions.push(disposable);
}

/**
 * Returns HTML content for the webview.
 * @param {vscode.ExtensionContext} context - The context provided by VS Code
 * @param {string} coursePath The Markdown text to convert.
 * @param {string} fileName The Markdown text to convert.
 */
function setWebviewContent(markdown, context, panel, coursePath, fileName) {
	console.log(coursePath, fileName);
	// Get the absolute path to the extension's root directory
	const extensionRootPath = context.extensionPath;
	console.log(extensionRootPath);
	// Construct the full path to the "settings.json" file inside the "summarine" folder in the extension directory
	const settingsPath = path.join(__dirname, 'summarine', 'settings.json');

	fs.readFile(settingsPath, 'utf8', (err, settings) => {
		if (err) {
			console.error(err);
			return;
		}

		settings = JSON.parse(settings);

		summarine.render(coursePath, fileName, settings).then(htmlContent => {
			panel.webview.html = fixLinks(context, htmlContent, panel.webview);
		});
	});
}

function fixLinks(context, document, webView) {
	const documentPath = path.join(__dirname, 'summarine', 'static');

	return document.replace(
		new RegExp('((?:src|href)=[\'\"])(.*?)([\'\"])', 'gmi'),
		(subString, p1, p2, p3) => {
			const lower = p2.toLowerCase();
			if (p2.startsWith('#') || lower.startsWith('http://') || lower.startsWith('https://')|| lower.startsWith('data:')) {
				return subString;
			}
			const index = p2.indexOf('?');
			if (index > - 1) {
				p2 = p2.substr(0, index);
			}
			const newPath = vscode.Uri.file(path.join(path.dirname(documentPath), p2));
			const newUrl = [
				p1,
				webView.asWebviewUri(newPath),
				p3,
			].join('');
			return newUrl;
		},
	);
}


// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
