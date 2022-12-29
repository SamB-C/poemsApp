const fs = require('fs');

fs.readdir('./poems/', function(err, files) {
    if (err) {
        console.error('Could not list files in directory.', err)
    } else {
        const poemFiles = getAllTextFiles(files);
        const resultJSON = getJSONofPoems(poemFiles);
        const order = getPoemOrder();
        const poemsInOrderJSON = orderPoems(order, resultJSON)
        updateRawPoemsJSON(poemsInOrderJSON);
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
    const content = fs.readFileSync(`./poems/${file}`, {encoding: 'utf8'});
    jsonFile[poemName] = content;
    const poemNameInFile = content.split('\n')[0];
    if (poemNameInFile !== poemName) {
        throw new Error(`Poem file name doesn't equal poem name in file:\n${poemName} !== ${poemNameInFile}\n`)
    }
}

function getPoemOrder() {
    const orderJSON = fs.readFileSync('./poems/poemSettings.json', {encoding: 'utf8'});
    return JSON.parse(orderJSON)['order'];
}

function orderPoems(order, poems) {
    const poemsInOrder = {};
    order.forEach(poem => {
        poemsInOrder[poem] = poems[poem];
    })
    return poemsInOrder;
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