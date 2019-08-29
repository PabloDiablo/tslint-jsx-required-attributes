// Adapted from tslint-microsoft-contrib
// https://github.com/microsoft/tslint-microsoft-contrib/blob/master/build-tasks/generate-package-json-for-npm.js
// https://github.com/microsoft/tslint-microsoft-contrib/blob/master/build-tasks/common/files.js

const fs = require('fs');

function readFile(fileName) {
    try {
        return fs.readFileSync(fileName, {encoding: 'utf8'});
    } catch (e) {
        console.log(`Unable to read file: ${fileName}. Error code: ${e.code}`);
        process.exit(1);
    }
}

function writeFile(fileName, data) {
    try {
        return fs.writeFileSync(fileName, data, {encoding: 'utf8'});
    } catch (e) {
        console.log(`Unable to write file: ${fileName}. Error code: ${e.code}`);
        process.exit(1);
    }
}

function readJSON(fileName) {
    try {
        return JSON.parse(readFile(fileName));
    } catch (e) {
        console.log(`Unable to parse JSON file: ${fileName}. \n ${e}`);
        process.exit(1);
    }
}

const basePackageJson = readJSON('package.json');
delete basePackageJson.scripts;
delete basePackageJson.husky;
delete basePackageJson['lint-staged'];
delete basePackageJson.devDependencies;
delete basePackageJson.jest;

writeFile('dist/package.json', JSON.stringify(basePackageJson, undefined, 4));
