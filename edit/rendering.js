const path = require('path');
const fs = require('fs');
const summarine = require("../summarine/render");
const tools = require("../edit/tools");
const manipulate = require("../edit/manipulate");

/**
 * Returns HTML content for the webview.
 * @param {vscode.ExtensionContext} context - The context provided by VS Code
 * @param {string} coursePath The Markdown text to convert.
 * @param {string} fileName The Markdown text to convert.
 */
function setWebviewContent(context, panel, markdownText, filePath, metaPath, resourcesPath, colorTheme, update = false) {
	// Construct the full path to the "settings.json" file inside the "summarine" folder in the extension directory
	const extensionPath = context.extensionPath;
	const settingsPath = path.join(extensionPath, '/summarine', 'settings.json');

	fs.readFile(settingsPath, 'utf8', (err, settings) => {
		if (err) {
			console.error(err);
			return;
		}

		const friendlyName = path.parse(filePath).name;
		const directoryName = path.basename(path.dirname(filePath));
		panel.title = friendlyName;

		settings = JSON.parse(settings);
		summarine.render(markdownText, filePath, settings).then(htmlContent => {
			htmlContent = tools.fixLinks(context, htmlContent, panel.webview, resourcesPath, true);

			if (!update) {
				summarine.wrapTemplate(htmlContent, metaPath, colorTheme).then(htmlContent => {
					const documentPath = path.join(extensionPath, 'summarine', 'static');
					htmlContent = tools.fixLinks(context, htmlContent, panel.webview, documentPath);
					panel.webview.html = htmlContent;
				});
			} else {
				panel.webview.postMessage({ "command": "update", "content": htmlContent });
			}
		});

		panel.webview.onDidReceiveMessage(message => {
			if (message.command === 'insertHeading') {
				let toInsert = `${friendlyName}#${message.text}`;

				if (/^[\d]+-(.*)/.test(friendlyName)) {
					toInsert = `${directoryName}/${toInsert}`;
				}

				toInsert = `[[${toInsert}]]`;

				manipulate.insertTextAtCursor(toInsert);
			}
		});
	});
}

module.exports = { setWebviewContent };