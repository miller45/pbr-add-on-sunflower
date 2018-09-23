const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const CircularJSON = require('circular-json');


const argStruct = {
    // extraFiles: {},
    screenshotsSubfolder: '',
    jsonsSubfolder: '',
    baseDirectory: null,
    docTitle: 'Test Results',
    docName: 'report.html'
};

function processCombinedJson(inFile, outFile) {
    const serialized = fs.readFileSync(inFile, 'utf-8');
    const unSerialized = CircularJSON.parse(serialized); // the original is now unescaped
    const data = JSON.parse(unSerialized); //convert to real object for processing
    for (let i = 0; i < data.length; i++) {
        if (data[i].screenShotFile) {
            data[i].screenShotFile = data[i].screenShotFile.replace(/\\/g, '/');
            console.log(data[i].screenShotFile);
        }
    }
    fs.writeFileSync(outFile, JSON.stringify(data), 'utf-8');
}

function copyAndProcessBrowserAssets(srcBrowserDir, reportDir, options) {

    const clientDefaults={
        docTitle:options.docTitle
    };
    Object.assign(clientDefaults,options.clientDefaults);
    if (options.searchSettings || options.columnSettings) {
        clientDefaults.searchSettings = options.searchSettings;
        clientDefaults.columnSettings = options.columnSettings;
    }
    console.log(clientDefaults);

    fs.copyFileSync(path.join(srcBrowserDir, "app.js"), path.join(reportDir, "sunflower-app.js"));
    fs.writeFileSync(path.join(reportDir, "app_defaultoptions.js"),
        "var appClientDefaults =" + JSON.stringify(clientDefaults) + ";"
        , "utf-8");
    // fs.copyFileSync(path.join(srcBrowserDir, "app_defaultoptions.js"), path.join(reportDir, "app_defaultoptions.js"));
    fs.copyFileSync(path.join(srcBrowserDir, "app_sortfunction.js"), path.join(reportDir, "app_sortfunction.js"));
    fs.copyFileSync(path.join(srcBrowserDir, "assets", "main.css"), path.join(reportDir, "assets", "sunflower-main.css"));
    fs.copyFileSync(path.join(srcBrowserDir, "assets", "main.js"), path.join(reportDir, "assets", "sunflower-main.js"));
}

function copyAndProcessMainHtml(htmlInFile, htmlOutFile,options) {
    const htmlOutFileBak = htmlOutFile + ".bak";
    if (!fs.existsSync(htmlOutFileBak)) {
        fs.renameSync(htmlOutFile, htmlOutFileBak);
    }
    const streamHtml = fs.createWriteStream(htmlOutFile);

    streamHtml.write(
        fs.readFileSync(htmlInFile)
            .toString()
            .replace('<script src="app.js"></script>', '<script src="sunflower-app.js"></script>')
            .replace('<script src="assets/main.js"></script>', '<script src="assets/sunflower-main.js"></script>')
            .replace('<link rel="stylesheet" href="assets/main.css">', '<link rel="stylesheet" href="assets/sunflower-main.css">')
    );

    streamHtml.end();

}

function spiceUp(protractorDir, orgOptions) {
    if (!orgOptions.baseDirectory || orgOptions.baseDirectory.length === 0) {
        throw new Error('Missing option "baseDirectory". Please pass a valid base directory where the report is placed');
    }
    const options = Object.assign({}, argStruct, orgOptions);

    //console.log(options);
    // if (!options.docName) {
    //     options.docName = "report.html";
    // }
    const srcDir = __dirname.replace(/\\/g, "/").replace("src/node", "src");
    const reportDir = path.join(protractorDir, options.baseDirectory);

    processCombinedJson(path.join(reportDir, "combined.json"), path.join(reportDir, "combined-clean.json"));

    //copy extra scrips and styles
    copyAndProcessBrowserAssets(path.join(srcDir, "browser"), reportDir,options);
    const htmlInFile = path.join(srcDir, "browser", "index.html");
    const htmlOutFile = path.join(reportDir, options.docName);
    copyAndProcessMainHtml(htmlInFile, htmlOutFile, options);


    // // use you actual output dir you have configuration for the HtmlReporter
    // const e2eOutputDir = 'dist/e2e/screenshots';
    //
    // fs.copyFileSync('e2e/your-custom-style.css', path.join(e2eOutputDir, 'assets', 'your-custom-style.css'));
    // fs.copyFileSync('e2e/your-super-logo.png', path.join(e2eOutputDir, 'assets', 'your-super-logo.png'));

}


module.exports = spiceUp;
