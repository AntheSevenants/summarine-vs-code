//import { wrap } from 'module';

const fs = require('fs');
const path = require('path');
const Tools = require("./tools");
const Templating = require("./templating");
const Typographer = require("./typographer");

const MarkdownIt = require('markdown-it');
const MarkdownItSub = require('markdown-it-sub');
const MarkdownItSup = require('markdown-it-sup');
const MarkdownItDeflist = require('markdown-it-deflist');
const MarkdownItEmoji = require('markdown-it-emoji');
const MarkdownItAbbr = require('markdown-it-abbr');
const MarkdownItMultiMdTable = require('markdown-it-multimd-table');
const MarkdownItMark = require('markdown-it-mark');
const tm = require('markdown-it-texmath');

const settingsPath = path.join(__dirname, 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
}).disable(["lheading", "replacements"])
    .use(MarkdownItSub)
    .use(MarkdownItSup)
    .use(MarkdownItDeflist)
    .use(MarkdownItEmoji)
    .use(MarkdownItAbbr)
    .use(MarkdownItMultiMdTable, { multiline: true, rowspan: true })
    .use(MarkdownItMark)
    .use(tm, {
        engine: require('katex'),
        delimiters: 'dollars',
        katexOptions: { trust: true }
    });

// md.core.ruler.at('replacements', (state) => {
//     Typographer.replace(state, settings);
// })

const Regexes = {
    //"IMAGE": /\(img\$(.{4})\)/g,
    //"IMAGE_TEST": ["\\(img\\$", "\\)"],
    "AUDIO": /\$audio=.*?\$/g,
    "AUDIO_TEST": ["\\$audio=", "\\$"],
    "VIDEOLOOP": /\$videoloop=(.*)\$/g,
    "VIDEO": /\$video=(.*)\$/g,
    "TOOLTIP": /\$tt=(.*?)\$(.*?)\$\/tt\$/g,
    "LEGACY_TABLE": /^(\|[-]+\|)$/gm,
    "LEGACY_LAYOUT": /<\/div>\n([-]+)\n/g,
    "PAGE": /\$p=(.*?)\$/g,
}

const Colours = {
    "blue": ["#4852df", "#7e85e8"],
    "red": ["#ff5b5b", "#ff8c8c"],
    "green": ["#53cc71", "#5de57f"],
    "purple": ["#a346a3", "#b975b9"],
    "orange": ["#f47e37", "#ffaf95"],
    "grey": ["#bfbfbf", "#d2d2d2"],
    "yellow": ["#ffff7f", "#e5e572"],
    "pink": ["#ff7fff", "#e572e5"]
};

function readResource(resourcesFolderPath, resourceId) {
    const resourcePath = `${resourcesFolderPath}/${resourceId}`;
    return fs.readFileSync(resourcePath, { encoding: "utf8" });
}

async function render(markdownText, filePath, settings) {
    //let markdown = await fs.readFileSync(filePath, { encoding: "utf8" });
    let markdown = markdownText;

    for (let container in settings.containers) {
        markdown = markdown.replace(new RegExp("\\$" + container + "\\$", "g"), settings.containers[container][0] + "\n \n ");
        markdown = markdown.replace(new RegExp("\\$\\\/" + container + "\\$", "g"), (container == "avs" ? "" : " \n") + settings.containers[container][1] + "\n ");
    }

    /*
        Dynamic translations with regex
     */
    for (var i = 0; i < settings.regex.length; i++) {
        markdown = markdown.replace(new RegExp("(?!\\]\\(.?)" + settings.regex[i][0] + "(?!.?\\))", "g"),
            settings.regex[i][1]);
    }

    /*
        Resource replacements
     */
    // markdown = markdown.replace(Regexes.IMAGE,
    //     (match, captureGroup) => { return "(" + readResource(resourcesPath, captureGroup) + ")" });
    markdown = markdown.replace(Regexes.AUDIO,
        (match, captureGroup) => { return Tools.generateAudio(captureGroup); });
    markdown = markdown.replace(Regexes.VIDEOLOOP,
        (match, captureGroup) => { return Tools.generateVideo(captureGroup, true); });
    markdown = markdown.replace(Regexes.VIDEO,
        (match, captureGroup) => { return Tools.generateVideo(captureGroup); });
    markdown = markdown.replace(Regexes.TOOLTIP,
        (match, title, text) => { return "<abbr title=\"" + title + "\">" + text + "</abbr>" });

    let pageReplacementCount = 0;
    markdown = markdown.replace(Regexes.PAGE,
        (match, pageNumber) => {
            let prefix = "";
            if (pageReplacementCount != 0) {
                prefix = "</div></div>"
            }

            pageReplacementCount++;

            return `${prefix}<div class=\"page-container\"><div class=\"page-page\">p. ${pageNumber}</div><div class=\"page-content\">`
        });

    if (pageReplacementCount > 0) {
        markdown = markdown + "\n\n</div></div>";
    }

    /* Fix legacy tables by replacing single |---| with a flippin lot of them! - because that's valid markdown right? */
    markdown = markdown.replace(Regexes.LEGACY_TABLE,
        (match, captureGroup) => { return "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|" });

    /* Fix legacy layouts which combined divs and --- hrs */
    markdown = markdown.replace(Regexes.LEGACY_LAYOUT, "</div>\n\n$1\n\n");

    /*
        Highlights are always on a per-word basis. Else they mess with base64-encoded images, btw.
     */
    for (var i = 0; i < settings.highlights.length; i++) {
        markdown = markdown.replace(
            new RegExp("\\b" + Tools.escapeRegExp(settings.highlights[i]) + "\\b(?<!\\!\\[[Ii]mage\\]\\(.*)", "g"),
            "<span class=\"language\">" + settings.highlights[i] + "</span>");
    }

    /*
        Translations are like... really simple.
     */
    for (var i = 0; i < settings.translations.length; i++) {
        //console.log(Tools.escapeRegExp(this.settings.translations[i][0]));
        markdown = markdown.replace(new RegExp(Tools.escapeRegExp(settings.translations[i][0]), "g"),
            settings.translations[i][1]);
    }

    markdown = md.render(markdown);

    return markdown;
}

async function wrapTemplate(html, metaPath) {
    const courseMeta = JSON.parse(await fs.readFileSync(metaPath, { encoding: "utf8" }));
    const currentColour = courseMeta["colour"];
    const currentCourse = courseMeta["title"];
    /* 
        Dynamic translations
    */
    html = html.replace(/\$colour/g, Colours[currentColour][0]);

    html = await Templating.wrapTemplate(html, currentCourse, currentColour);

    return html;
}

module.exports = { render, wrapTemplate };