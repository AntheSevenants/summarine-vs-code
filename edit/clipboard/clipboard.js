const isWsl = require("is-wsl");
const ClipboardWin = require("./win32.js");
const ClipboardWSL = require("./wsl.js");
const ClipboardDarwin = require("./darwin.js")

function Clipboard() {
    const platform = process.platform;
    if (platform == "win32") {
        return new ClipboardWin();
    } else if (platform == "darwin") {
        return new ClipboardDarwin();
    } else if (isWsl) {
        return new ClipboardWSL();
    }
}

module.exports = Clipboard();
