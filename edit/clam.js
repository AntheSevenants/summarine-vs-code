const vscode = require('vscode');
const Manipulate = require('./manipulate');

let leftString;
let rightString;
let clamActivated = false;

async function activateClam() {
    // Prompt for left string
    leftString = await vscode.window.showInputBox({
        prompt: 'Enter the left string'
    }) || '';

    // Prompt for right string
    rightString = await vscode.window.showInputBox({
        prompt: 'Enter the right string'
    }) || '';

    clamActivated = true;

    vscode.window.showInformationMessage(`Clam set: '${leftString}' and '${rightString}'`);
}

function applyClam() {
    if (!clamActivated) {
        vscode.window.showErrorMessage("No clam set yet");
    }

    Manipulate.wrapWithTags(leftString, rightString, true);
}

module.exports = { activateClam, applyClam };