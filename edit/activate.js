const vscode = require('vscode');
const path = require('path');

const rendering = require("../edit/rendering");
const manipulate = require("../edit/manipulate");
const Tools = require("../edit/tools");
const Paste = require("../edit/paste");
const Clam = require("../edit/clam");

const RENDER_TIMEOUT_DURATION = 500 /* in ms */
let renderTimeout = false;

function sidePreview(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "summarine" is now active!');

	let sidePreviewCommand = vscode.commands.registerCommand('summarine.sidePreview', function () {
		// Create a new webview panel
		const panel = vscode.window.createWebviewPanel(
			'markdownPreview', // Identifies the type of the webview panel
			'Markdown Preview', // Title of the panel
			vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				enableFindWidget: true,
				// localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'summarine'),
				// vscode.Uri.joinPath(context.extensionUri, 'summarine', 'static'),
				// ]
			} // Options to control the webview panel
		);

		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		const colorTheme = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Light ? "light" : "dark";

		if (editor) {
			const doc = editor.document;

			const filePath = doc.uri.fsPath; // e.g. /summarine/Elastic Net/glmnet intrduction.md

			let orange = vscode.window.createOutputChannel("Orange");
			orange.appendLine(filePath);

			const metaInfo = Tools.findCourseMetaInfo(filePath);

			if (metaInfo != null) {
				const [metaPath, resourcesPath] = metaInfo;
				let markdownText = editor.document.getText();

				// Set the initial HTML content
				rendering.setWebviewContent(context, panel, markdownText, filePath, metaPath, resourcesPath, colorTheme);

				// Update content when the document changes
				const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(event => {
					if (event.document.uri.toString() === doc.uri.toString()) {
						/* Reset the rendering timeout to prevent rendering from happening for now */
						clearTimeout(renderTimeout);

						renderTimeout = setTimeout(() => {
							let markdownText = editor.document.getText();
							rendering.setWebviewContent(context, panel, markdownText, filePath, metaPath, resourcesPath, colorTheme, true);
						}, RENDER_TIMEOUT_DURATION);
					}
				});

				// Dispose event listener when the panel is closed
				panel.onDidDispose(() => {
					changeDocumentSubscription.dispose();
				});
			} else {
				vscode.window.showInformationMessage("meta.json or .resources not found!");
			}
		}
	});
	context.subscriptions.push(sidePreviewCommand);
}

function wrappers(context) {
	const wrappers = {
		'summarine.wrapWarn': { tag: 'warn', type: 'box' },
		'summarine.wrapInfo': { tag: 'info', type: 'box' },
		'summarine.wrapAccolade': { tag: 'acco', type: 'box' },
		'summarine.wrapAttributeValueStructure': { tag: 'avs', type: 'box' },
		'summarine.wrapBigTex': { tag: 'bigtex', type: 'box' },
		'summarine.wrapColumns': { tag: 'columns', type: 'box' },
		'summarine.wrapDefList': { tag: 'deflist', type: 'box' },
		'summarine.wrapEquation': { tag: 'eq', type: 'box' },
		'summarine.wrapExample': { tag: 'example', type: 'box' },
		'summarine.wrapExercise': { tag: 'exercise', type: 'box' },
		'summarine.wrapGallery': { tag: 'gallery', type: 'box' },
		'summarine.wrapGalleryPort': { tag: 'gallery port', type: 'box' },
		'summarine.wrapNetwork': { tag: 'network', type: 'box' },
		'summarine.wrapNoPrint': { tag: 'noprint', type: 'box' },
		'summarine.wrapReader': { tag: 'reader', type: 'box' },
		'summarine.wrapReaderWide': { tag: 'reader wide', type: 'box' },
		'summarine.wrapRewrite': { tag: 'rewrite', type: 'box' },
		'summarine.wrapSyntax': { tag: 'syntax', type: 'box' },
		'summarine.wrapWide': { tag: 'wide', type: 'box' },
		'summarine.wrapRelaxed': { tag: 'relaxed', type: 'box' },
		'summarine.wrapWideCenter': { tag: 'widec', type: 'box' },
		'summarine.wrapWideJustified': { tag: 'widej', type: 'box' },
		'summarine.wrapTilde': { tag: '~', type: 'inline' },
		'summarine.wrapMark': { tag: '==', type: 'inline' },
	};

	// Register commands dynamically based on the `wrappers` object
	for (const command in wrappers) {
		const tag = wrappers[command]['tag'];
		const type = wrappers[command]['type'];

		const disposable = vscode.commands.registerCommand(command, () => {
			if (type == 'box') {
				manipulate.wrapWithTags(`$${tag}$`, `$/${tag}$`);
			} else if (type == 'inline') {
				manipulate.wrapWithTags(tag, tag, true);
			}
		});

		context.subscriptions.push(disposable);
	}
}

function paste(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('summarine.pasteImage', Paste.handleImagePaste));
}

function insertFromDisk(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('summarine.insertFromDisk', Paste.insertFromDisk));
}

function activateClam(context) {
	vscode.commands.registerCommand('summarine.activateClam', async () => {
       Clam.activateClam();
    });
}

function applyClam(context) {
	vscode.commands.registerCommand('summarine.applyClam', async () => {
		Clam.applyClam();
	 });
}

module.exports = { sidePreview, wrappers, paste, insertFromDisk, activateClam, applyClam };