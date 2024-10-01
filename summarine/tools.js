function generateAudio(source) {
    return "<audio controls><source src=\"" + source + "\"></audio>";
}

function generateVideo(source, loop = false) {
    let attributes = loop ? "autoplay loop" : "controls";
    return "<video " + attributes + "><source src=\"./afs/video/" + source + "\" type=\"video/mp4\">Verdraaid! Deze browser kan geen video afspelen.</video>";
}

/* https://stackoverflow.com/a/3561711 */
function escapeRegExp(str)
{
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports = { escapeRegExp };