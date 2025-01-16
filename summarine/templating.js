const { TwingEnvironment, TwingLoaderFilesystem } = require('twing');
const path = require('path');

const templatesPath = path.join(__dirname, 'templates');
let loader = new TwingLoaderFilesystem(templatesPath);
let twing = new TwingEnvironment(loader);

async function wrapTemplate(htmlContent, currentCourse, currentColour, colorTheme, antheLayout) {
    return twing.render('view.html', {
        markdown: htmlContent,
        color: currentColour,
        course: currentCourse,
        colorTheme: colorTheme,
        anthe: antheLayout
    }).then((output) => {
        return output;
    });
}

async function renderOverview(groups, currentCourse, currentColour) {
    return twing.render("overview.html", {
        groups: groups,
        color: currentColour,
        course: currentCourse
    }).then((output) => { return output; });
}

module.exports = { wrapTemplate, renderOverview };