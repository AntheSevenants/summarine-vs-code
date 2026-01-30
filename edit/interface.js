const vscode = require('vscode');
const path = require('path');

const Tools = require("../edit/tools");
const rendering = require("../edit/rendering");

const webviewMap = new Map();

const RENDER_TIMEOUT_DURATION = 500 /* in ms */
let renderTimeout = false;

function createWebview() {
    return vscode.window.createWebviewPanel(
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
}

function updateWebview(context, panel, editor, filePath, metaPath, resourcesPath, colorTheme, updateOnly=false, filename=null) {
    // console.log("hier geraken we nog");
    let markdownText = editor.document.getText();
    rendering.setWebviewContent(context, panel, markdownText, filePath, metaPath, resourcesPath, colorTheme, true, updateOnly, filename);
}

function doRender(context, panelID = null, passive = true) {   
    let panel;
    let updateOnly = false;
    let fixedPane = panelID != null;

    // console.log("We gaan rendereee");

    if (fixedPane && webviewMap.get(panelID) === undefined && !passive) {
        // console.log("a");
        panel = createWebview();
        webviewMap.set(panelID, panel);
    } else if (fixedPane && webviewMap.get(panelID) !== undefined) {
        // console.log("b");
        panel = webviewMap.get(panelID);
        updateOnly = true;
    } else if (!fixedPane) {
        // console.log("c");
        panel = createWebview();
    } else {
        // console.log("d");
        // no open panel for this group
        return;
    }

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    const colorTheme = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Light ? "light" : "dark";

    // console.log(panelID);

    if (editor) {
        const doc = editor.document;

        let filePath = doc.uri.fsPath; // e.g. /summarine/Elastic Net/glmnet intrduction.md

        let orange = vscode.window.createOutputChannel("Orange");
        orange.appendLine(filePath);

        const metaInfo = Tools.findCourseMetaInfo(filePath);

        if (metaInfo != null) {
            const [metaPath, resourcesPath] = metaInfo;
            let markdownText = editor.document.getText();

            if (updateOnly) {
                updateWebview(context, panel, editor, filePath, metaPath, resourcesPath, colorTheme, true);
                return;
            }

            // Set the initial HTML content
            rendering.setWebviewContent(context, panel, markdownText, filePath, metaPath, resourcesPath, colorTheme, false, fixedPane);

            // Update content when the document changes
            const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(event => {
                if (event.document.uri.toString() === doc.uri.toString() || fixedPane) {
                    /* Reset the rendering timeout to prevent rendering from happening for now */
                    clearTimeout(renderTimeout);

                    renderTimeout = setTimeout(() => {
                        filePath = vscode.window.activeTextEditor.document.uri.fsPath;
                        // console.log(filePath);
                        // console.log(vscode.window.activeTextEditor.document);
                        updateWebview(context, panel, vscode.window.activeTextEditor, filePath, metaPath, resourcesPath, colorTheme, true);
                    }, RENDER_TIMEOUT_DURATION);
                }
            });

            // Dispose event listener when the panel is closed
            panel.onDidDispose(() => {
                changeDocumentSubscription.dispose();
                if (panelID != null) {
                    webviewMap.delete(panelID);
                }
            });
        } else {
            vscode.window.showInformationMessage("meta.json or .resources not found!");
        }
    }
}

module.exports = { doRender };