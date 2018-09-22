const fs = require('fs');
const path = require('path');

const argStruct={
    extraFiles:{},
    screenshotsSubfolder: '',
    jsonsSubfolder: '',
    baseDirectory: null,
    docTitle:'Test Results',
    docName:'report.html'
};

function spiceUp(options) {
    if(!options.baseDirectory || options.baseDirectory.length === 0) {
        throw new Error('Missing option "baseDirectory". Please pass a valid base directory where the report is placed');
    }

    // use you actual output dir you have configuration for the HtmlReporter
    const e2eOutputDir = 'dist/e2e/screenshots';

    fs.copyFileSync('e2e/your-custom-style.css', path.join(e2eOutputDir, 'assets', 'your-custom-style.css'));
    fs.copyFileSync('e2e/your-super-logo.png', path.join(e2eOutputDir, 'assets', 'your-super-logo.png'));

}


module.exports = spiceUp;