function generateAudio(source) {
    return "<audio controls><source src=\"" + source + "\"></audio>";
}

function generateVideo(source, loop = false) {
    let attributes = loop ? "autoplay loop" : "controls";
    return "<video " + attributes + "><source src=\"./afs/video/" + source + "\" type=\"video/mp4\">Verdraaid! Deze browser kan geen video afspelen.</video>";
}

function generateWikiLink(reference) {
    let filename = [];
    let section = [];
    let friendlyName = [];
    let currentPointer = filename;

    for (let character of reference) {
        if (character === "#") {
            currentPointer = section;
            continue;
        } else if (character === "|") {
            currentPointer = friendlyName;
            continue;
        } else {
            currentPointer.push(character);
        }
    }

    const filenameStr = filename.join("");
    const sectionStr = section.join("");
    const friendlyNameStr = friendlyName.join("");

    if (filenameStr.length === 0) {
        throw new Error(`Filename cannot be empty. Detected text: ${text}`);
    }

    let markdownLink = ""
    if (friendlyNameStr.length > 0) {
        markdownLink = `[${friendlyNameStr}](vscode://ballekes})`; 
    } else {
        markdownLink = `[${filenameStr}#${sectionStr}](vscode://ballekes})`; 
    }

    return markdownLink;
}

/* https://stackoverflow.com/a/3561711 */
function escapeRegExp(str)
{
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports = { escapeRegExp, generateAudio, generateVideo, generateWikiLink };