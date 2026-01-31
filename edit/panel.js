const vscode = require('vscode');
const path = require('path');

function getActiveEditorGroupIndex() {
    const activeGroup = vscode.window.tabGroups.activeTabGroup;
    const groups = vscode.window.tabGroups.all;
    const activeEditorGroupIndex = groups.indexOf(activeGroup);

    // console.log("Index:");
    // console.log(activeEditorGroupIndex);

    return activeEditorGroupIndex;
}

function activeEditorReliable() {
    const tabGroupPath = path.parse(vscode.window.tabGroups.activeTabGroup.activeTab.input.uri.path).name;
    const editorPath = path.parse(vscode.window.activeTextEditor.document.fileName).name;

    return tabGroupPath == editorPath;
}

module.exports = { getActiveEditorGroupIndex, activeEditorReliable };