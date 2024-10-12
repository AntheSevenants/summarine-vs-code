const Tools = require("./tools");

function replace(state, settings) {
    var blkIdx;
    if (!state.md.options.typographer) {
        return;
    }
    for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
        if (state.tokens[blkIdx].type !== "inline") {
            continue;
        }

        replace_rare(state.tokens[blkIdx].children, settings);
    }
}

function do_replacements(str, replacements) {
    // Create a map of search terms for efficient matching
    const pattern = new RegExp(replacements.map(([find]) => Tools.escapeRegExp(find)).join('|'), 'g');

    return str.replace(pattern, match => {
        // For every match, find the corresponding replacement
        for (const [find, replaceWith] of replacements) {
            if (match === find) return replaceWith;
        }
    });
}

function replace_rare(inlineTokens, settings) {
    // Create a map of search terms for efficient matching
    var i, token, inside_autolink = 0;
    for (i = inlineTokens.length - 1; i >= 0; i--) {
        token = inlineTokens[i];
        if (token.type === "text" && !inside_autolink) {
            token.content = do_replacements(token.content, settings.translations);
        }
        if (token.type === "link_open" && token.info === "auto") {
            inside_autolink--;
        }
        if (token.type === "link_close" && token.info === "auto") {
            inside_autolink++;
        }
    }
}

module.exports = { replace };