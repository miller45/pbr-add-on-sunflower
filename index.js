const fs = require('fs');

const CircularJSON = require('circular-json');
const serialized = fs.readFileSync('./src/browser/data/combined.json', 'utf-8');
const unserialized = CircularJSON.parse(serialized);
const data = JSON.parse(unserialized);

for (let i = 0; i < data.length; i++) {
    if (data[i].screenShotFile) {
        data[i].screenShotFile = data[i].screenShotFile.replace(/\\/g, '/').replace('images/', 'data/images/');
        console.log(data[i].screenShotFile);
    }

}


fs.writeFileSync('./src/browser/data/combined-clean.json', JSON.stringify(data,null,4), 'utf-8');
fs.writeFileSync('./src/browser/data/combined-clean.js', 'var loadedResults = ' + JSON.stringify(data,null,4) + ';', 'utf-8');

