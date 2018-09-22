//this has to be run before the first karma run...even if it does the patching itself
const appPatcher = require('./spec/app-patcher');
appPatcher(__dirname,'./lib/app.js', './tests/app/test_data.js', './tmp/tests/lib/app.js');
