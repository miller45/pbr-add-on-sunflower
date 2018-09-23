const spiceUp = require('../index.js');
spiceUp(__dirname.replace(/\\/g, '/'), {
    preserveDirectory: false,
    takeScreenShotsOnlyForFailedSpecs: true,
    screenshotsSubfolder: 'images',
    jsonsSubfolder: 'jsons',
    baseDirectory: 'reports-tmp',
    clientDefaults: {
        searchSettings: {
            allselected: false,
            passed: false,
            failed: true,
            pending: true,
            withLog: true
        }
    }

});
