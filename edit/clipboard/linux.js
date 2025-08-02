const { spawn } = require("child_process");
const vscode = require("vscode");

class ClipboardLinux {
    constructor() {
        this.CMD = this.checkLinux();
    }

    checkLinux() {
        const command = "xclip";
        return command;
    }

    async isImage() {
        const script = spawn(this.CMD, ["-selection", "clipboard", "-t", "TARGETS", "-o"]);
        const result = await this.getResult(script);
        return result.includes("image/png");
    }

    async saveImage(filePath) {
        const script = spawn(this.CMD, ["-selection", "clipboard", "-t", "image/png", "-o"]);
        const result = await this.getResult(script);

        const fs = require('fs');
        fs.writeFile(filePath, result, 'binary', (err) => {
            if (err) {
                vscode.window.showInformationMessage(err.message);
            }
        });
    }

    async getResult(task) {
        return new Promise((resolve, reject) => {
            let data = "";
            task.stdout.on("data", (chunk) => {
                data += chunk;
            });
            task.on("close", () => {
                resolve(data);
            });
            task.on("error", (err) => {
                reject(err);
            });
        });
    }
}

module.exports = ClipboardLinux;
