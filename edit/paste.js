const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Tools = require("./tools");
const clipboard = require("./clipboard");

function getCurrentResources(resourcesPath) {
	return fs.readdirSync(resourcesPath).map(file => path.basename(file));;
}

async function handleImagePaste() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) { return; };

	if (editor.document.languageId != "markdown") { vscode.commands.executeCommand("editor.action.clipboardPasteAction"); };

	const clipContent = await vscode.env.clipboard.readText();

	if (clipContent == "" && (await clipboard.isImage())) {
		try {
			const filePath = editor.document.uri.fsPath;
			const metaInfo = Tools.findCourseMetaInfo(filePath);

			if (metaInfo == null) {
				vscode.window.showInformationMessage(".resources not found!");
				return;
			}

			const resourcesPath = metaInfo[1];
			const resources = getCurrentResources(resourcesPath);

			// Generate a unique filename for the image
			const imageName = `${Tools.generateUID(resources)}.png`;
			const imagePath = path.join(resourcesPath, imageName);

			// Save the image to the `.resources` folder
			await clipboard.saveImage(imagePath);

			// Create a link to image
			const markdownImageLink = `![Image](${imageName})`;

			// Insert the link into the markdown file at the current cursor position
			editor.edit(editBuilder => {
				editBuilder.insert(editor.selection.active, markdownImageLink);
			});
		} catch (e) {
			vscode.window.showInformationMessage(e);
		}
	} else {
		vscode.commands.executeCommand("editor.action.clipboardPasteAction")
	}
}

async function insertFromDisk(context) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active text editor found!');
		return;
	}

	// Open file picker dialog
	const fileUri = await vscode.window.showOpenDialog({
		canSelectFiles: true,
		canSelectMany: false,
		openLabel: 'Select a file to insert',
	});

	if (!fileUri || fileUri.length === 0) {
		vscode.window.showErrorMessage('No file selected.');
		return;
	}

	// Get the selected file's path
	const selectedFilePath = fileUri[0].fsPath;
	const selectedFileExtension = path.extname(selectedFilePath);

	const filePath = editor.document.uri.fsPath;
	const metaInfo = Tools.findCourseMetaInfo(filePath);

	if (metaInfo == null) {
		vscode.window.showInformationMessage(".resources not found!");
		return;
	}

	const resourcesPath = metaInfo[1];
	const resources = getCurrentResources(resourcesPath);

	// Generate a unique filename for the image
	const resourceName = `${Tools.generateUID(resources)}${selectedFileExtension}`;
	const resourcePath = path.join(resourcesPath, resourceName);

	fs.copyFileSync(selectedFilePath, resourcePath);

	// Insert the file path into the markdown document at the current cursor position
	editor.edit(editBuilder => {
		const markdownLink = `![Image](${resourceName})`;
		editBuilder.insert(editor.selection.active, markdownLink);
	});
}

module.exports = { handleImagePaste, insertFromDisk };