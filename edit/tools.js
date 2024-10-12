
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function fixLinks(context, document, webView, basePath, keepDirName=false) {
	return document.replace(
		new RegExp('((?:src|href)=[\'\"])(.*?)([\'\"])', 'gmi'),
		(subString, p1, p2, p3) => {
			const lower = p2.toLowerCase();
			if (p2.startsWith('#') || lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) {
				return subString;
			}
			const index = p2.indexOf('?');
			if (index > - 1) {
				p2 = p2.substr(0, index);
			}
			const joinedPath = keepDirName ? basePath : path.dirname(basePath);
			const newPath = vscode.Uri.file(path.join(joinedPath, p2));
			const newUrl = [
				p1,
				webView.asWebviewUri(newPath),
				p3,
			].join('');
			return newUrl;
		},
	);
}

function findCourseMetaInfo(filePath) {
	// Get the directory of the file path.
	let currentDir = path.dirname(filePath);

	// Continue searching until we reach the root directory.
	while (currentDir !== path.parse(currentDir).root) {
	  const resourcesPath = path.join(currentDir, '.resources/');
	  const metaPath = path.join(currentDir, 'meta.json');
  
	  // Check if .resource directory exists and if meta.json file exists.
	  if (fs.existsSync(resourcesPath) && fs.existsSync(metaPath)) {
		return [ metaPath, resourcesPath ];
	  }
  
	  // Move one level up in the directory.
	  currentDir = path.dirname(currentDir);
	}
  
	// Return null if .resource directory is not found.
	return null;
}

function generateUID(existingUIDs) {
	while (true) {
		var uid = ("0000" + ((Math.random() * Math.pow(36, 4)) | 0).toString(36)).slice(-4);
		if (!existingUIDs.includes(uid)) {
			return uid;
		}
	}
}

module.exports = { fixLinks, findCourseMetaInfo, generateUID };