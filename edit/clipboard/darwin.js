const spawn = require("child_process").spawn;
const vscode = require("vscode");

let CMD = "";

class ClipboardDarwin {
    constructor() {
        CMD = this.checkDarwin();
    }
    checkDarwin() {
        const command = "osascript";
        return command
    }
    // 由于执行速度的问题, 将脚本压缩为命令行形式
    async isImage() {
        const script = spawn(CMD, [
            "-e",
            '((clipboard info) as string) contains "«class PNGf»"',
        ]);
        const result = await getResult(script);
        return isFalse(result) ? false : true;

        async function getResult(task) {
            let data = "";
            for await (const chunk of task.stdout) {
                data += chunk;
            }
            return data;
        }
        function isFalse(taskOut) {
            return taskOut[0] == "false";
        }
    }
    async saveImage(filePath) {
        spawn('osascript', ['-e',
            `try
                set the clipboardObject to the clipboard as «class PNGf»
                set destinationPath to "${filePath}"
                set openedFile to open for access destinationPath with write permission
                write clipboardObject to openedFile
            end try`
        ])
            .on("error", (e) => vscode.window.showInformationMessage(e.message));
    }
}

module.exports = ClipboardDarwin;
