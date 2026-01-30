const vscode = require('vscode');
const path = require('path');

const rendering = require("../edit/rendering");
const manipulate = require("../edit/manipulate");
const Tools = require("../edit/tools");
const Paste = require("../edit/paste");
const Clam = require("../edit/clam");
const Interface = require("../edit/interface");

const lastMarkdownEditors = new Map();

function getActiveEditorGroupIndex() {
	const activeGroup = vscode.window.tabGroups.activeTabGroup;
	const groups = vscode.window.tabGroups.all;
	const activeEditorGroupIndex = groups.indexOf(activeGroup);

	// console.log("Index:");
	// console.log(activeEditorGroupIndex);

	return activeEditorGroupIndex;
}

function activeEditorReliable() {
	return vscode.window.tabGroups.activeTabGroup.activeTab.input.uri.path == vscode.window.activeTextEditor.document.fileName;
}

function sidePreview(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "summarine" is now active!');

	let sidePreviewCommand = vscode.commands.registerCommand('summarine.sidePreview', function () {
		Interface.doRender(context);
	});

	let fixedSidePreviewCommand = vscode.commands.registerCommand('summarine.fixedSidePreview', function () {
		const activeEditorGroupIndex = getActiveEditorGroupIndex();
		if (!activeEditorReliable()) {
			// If the active editor is unreliable when spawning the side preview, tab changes in the wrong window will respond and change the webview contents
			vscode.window.showErrorMessage("VS Code reported an unreliable tab group index due to a bug. Switch tabs in your active window and try again.");
			return;
		}

		Interface.doRender(context, activeEditorGroupIndex, false);
	});

	let onChangeEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor) {
			const fileName = editor.document.fileName;
			const isMarkdown = editor.document.languageId === 'markdown';

			// Check if it's a different Markdown file
			if (isMarkdown) {
				const activeEditorGroupIndex = getActiveEditorGroupIndex();
				// Check if tab group has associated window yet
				const lastEditorForWindow = lastMarkdownEditors.get(activeEditorGroupIndex);
				// console.log(lastEditorForWindow);
				// console.log(fileName);

				// A bug in VS Code makes it so, when changing focus across windows, the tab group does not change (even if it does!)
				// I solve this by checking whether the supposed active tab equals the path returned by the active editor
				// If those two match, the data is trustworthy
				// It's not a perfect solution, but it's better than nothing!
				// const trueChange = vscode.window.tabGroups.activeTabGroup.activeTab.input.uri.path == editor.document.fileName;
				const trueChange = activeEditorReliable();

				// console.log(vscode.window.tabGroups.activeTabGroup.activeTab.input.uri.path);
				// console.log(editor.document.fileName);

				if (!trueChange) {
					return;
				}

				if (fileName !== lastEditorForWindow) {
					// Update current Markdown editor
					lastMarkdownEditors.set(activeEditorGroupIndex, fileName);

					Interface.doRender(context, activeEditorGroupIndex, true);
				}
			}
		}
	});

	// let onChangeTabGroup = vscode.window.tabGroups.onDidChangeTabGroups(() => {
	// 	const index = vscode.window.tabGroups.all.indexOf(
	// 		vscode.window.tabGroups.activeTabGroup
	// 	);
	// 	console.log("Tab group:");
	// 	console.log(index);
	// });

	context.subscriptions.push(sidePreviewCommand);
	context.subscriptions.push(fixedSidePreviewCommand);
	context.subscriptions.push(onChangeEditor);
	// context.subscriptions.push(onChangeTabGroup);
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