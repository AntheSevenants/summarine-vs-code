const path = require('path');

const filePath = "/summarine/phd/elastic net/content.md";
const directoryName = path.dirname(filePath);
const courseDir = path.dirname(directoryName);
const fileName = path.basename(directoryName);

console.log(directoryName, courseDir, fileName)