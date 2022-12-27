const fs = require('fs');
const { CompletionInfoFlags } = require('typescript');

fs.readdir('.', function(err, files) {
    if (err) {
        console.error('Could not list files in directory.', err)
    } else {
        const poemFiles = getAllTextFiles(files);
        const resultJSON = getJSONofPoems(poemFiles);
        updateRawPoemsJSON(resultJSON);
    }
})


function getAllTextFiles(files) {
    const poemFiles = []
    files.forEach((file) => {
        if (file.match(/.txt$/)) {
            poemFiles.push(file);
        }
    });
    return poemFiles;
}

function getJSONofPoems(poemFiles) {
    const resultJSON = {};
    poemFiles.forEach((poem) => addPoemToJSON(poem, resultJSON));
    return resultJSON
}

function addPoemToJSON(file, jsonFile) {
    const poemName = file.replace('.txt', '');
    const content = fs.readFileSync(file, {encoding: 'utf8'});
    jsonFile[poemName] = content
}

function updateRawPoemsJSON(jsonObj) {
    fs.writeFile('./rawPoems.json', JSON.stringify(jsonObj), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('rawPoems.json updated');
        }
    })
}