// IMPORTANT
// The server must be run from inside the notesAndKeyQuotes directory as doesn't use full filepath.

const http = require('http');
const url = require('url');
const fs = require('fs');

function getFilename(req) {
    const query = url.parse(req.url, true);
    if (query.pathname === '/convertedPoems.json') {
        return '../convertedPoems.json';
    } else {
        return '.' + query.pathname;
    }
}

function errorOccurred(err) {
    console.log(err);
    res.writeHead(404, {'Content-Type': 'text/html'});
    return res.end('404 Not Found');
}

function getFileType(path) {
    const fileNameSplit = path.split('.');
    return fileNameSplit[fileNameSplit.length - 1];
}

function getContentTypeAndData(fileType, data) {
    let dataToWrite = data;
    let contentType = `text/${fileType}`;
    if (fileType === 'json') {
        contentType = 'application/json';
        data = JSON.parse(data)
    } else if (fileType === 'js') {
        contentType = 'text/javascript';
    }
    return { dataToWrite, contentType,}
}

function handleGet(req, res) {
    const filename = getFilename(req);
    console.log('Request for resource: ', filename);
    fs.readFile(filename, (err, data) => {
        if (err) {
            errorOccurred(err);
        }
        const fileType = getFileType(filename);
        const { dataToWrite, contentType } = getContentTypeAndData(fileType, data);
        res.writeHead(200, {'Content-Type': contentType});
        res.write(dataToWrite);
        return res.end();
    })
}

function deleteNoteOrQuote(poemName, noteOrQuote, identifier) {
    const convertedPoemsJSON = fs.readFileSync('../convertedPoems.json', {encoding: 'utf-8'});
    const convertedPoems = JSON.parse(convertedPoemsJSON);
    if (noteOrQuote === 'Note') {
        const existingNotes = convertedPoems[poemName].notes;
        const remainingNotes = {}
        Object.keys(existingNotes).forEach(noteText => {
            if (noteText !== identifier) {
                remainingNotes[noteText] = existingNotes[noteText];
            }
        });
        convertedPoems[poemName].notes = remainingNotes;
    } else {
        const existingQuotes = convertedPoems[poemName].quotes;
        const listToRemove = identifier.split(' ');
        const remainingQuotes = existingQuotes.filter((quote) => {
            const matches = quote.map((word, index) => word === listToRemove[index]);
            return matches.includes(false);
        });
        convertedPoems[poemName].quotes = remainingQuotes;
    }
    fs.writeFile('../convertedPoems.json', JSON.stringify(convertedPoems), (err) => {if (err) {throw err;} else {console.log('\nDeletion complete')}});
}

function handleDelete(req, res) {
    console.log('DELETE request:');
    let body = '';
    req.on('data', (data) => {
        body += data;
        console.log('Partial data ->', body);
    });
    req.on('end', () => {
        body = JSON.parse(body);
        console.log('Body ->', body);
        deleteNoteOrQuote(body.poemName, body.identifierFor, body.identifier)
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('deleted successfuly');
    });
}

function insertionSortIntoOrderInPoem(poem, words) {
    for (let i = 1; i < words.length; i++) {
        let currentWordIndex = i;
        let comparingWordIndex = i - 1;
        while (poem.indexOf(words[currentWordIndex]) < poem.indexOf(words[comparingWordIndex])) {
            [words[comparingWordIndex], words[currentWordIndex]] = [words[currentWordIndex], words[comparingWordIndex]];
            currentWordIndex--;
            comparingWordIndex--;
            if (currentWordIndex === 0) {
                break;
            }
        }
    }
    return words;
}

function editNoteOrQuote(noteType, oldIdentifier, newVersion, poemName) {
    // Gets the converted Poems object from file
    const convertedPoemsJSON = fs.readFileSync('../convertedPoems.json', {encoding: 'utf-8'});
    const convertedPoems = JSON.parse(convertedPoemsJSON);

    // Only if the type is a note
    if (noteType === 'Note') {
        // Setup
        const existingNotes = convertedPoems[poemName].notes;
        const remainingNotes = {}

        // Keep all notes that are not the note in question
        Object.keys(existingNotes).forEach(noteText => {
            if (noteText !== oldIdentifier) {
                remainingNotes[noteText] = existingNotes[noteText];
            }
        });

        // Add the changed note in its new form
        remainingNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoems[poemName].convertedPoem, newVersion.value);
        convertedPoems[poemName].notes = remainingNotes;

    } else if (noteType === 'Quote') {
        const existingQuotes = convertedPoems[poemName].quotes;
        const remainingQuotes = existingQuotes.filter(existingQuote => {
            return existingQuote.join(' ') !== oldIdentifier
        });
        remainingQuotes.push(newVersion);
        console.log(remainingQuotes)
        convertedPoems[poemName].quotes = remainingQuotes;
    }
    // Write the converted poems object back to file
    fs.writeFile('../convertedPoems.json', JSON.stringify(convertedPoems), (err) => {if (err) {throw err;} else {console.log('\nUpdate complete')}})
}

function handlePost(req, res) {
    console.log('POST request:');
    let body = '';
    req.on('data', (data) => {
        body += data;
        console.log('Partial data ->', body);
    });
    req.on('end', () => {
        body = JSON.parse(body);
        console.log('Body ->', body);
        editNoteOrQuote(body.noteType, body.oldIdentifier, body.newVersion, body.poemName)
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post recivied');
    });
}

http.createServer((req, res) => {
    if (req.method === 'DELETE') {
        handleDelete(req, res);
    } else if (req.method === 'POST'){
        handlePost(req, res)
    } else {
        handleGet(req, res);
    }
}).listen(8080);