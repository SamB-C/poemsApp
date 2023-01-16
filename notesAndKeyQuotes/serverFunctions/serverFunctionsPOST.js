const fs = require('fs');

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

function isNew(oldIdentifier) {
    return oldIdentifier === '__NEW__';
}

function editNote(existingNotes, oldIdentifier, newVersion, convertedPoem) {
    // Setup
    const alteredNotes = {}
    
    if (existingNotes) {
        // Keep all notes that are not the note in question
        Object.keys(existingNotes).forEach(identifier => {
            if (identifier !== oldIdentifier) {
                alteredNotes[identifier] = existingNotes[identifier];
            } else {
                // Add the changed note in its new form
                alteredNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoem, newVersion.value);
            }
        });
    }

    if (isNew(oldIdentifier)) {
        alteredNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoem, newVersion.value);
    }

    return alteredNotes;
}

function editQuote(existingQuotes, oldIdentifier, newVersion) {
    if (existingQuotes) {
        const alteredQuotes = existingQuotes.map(existingQuote => {
            const identifier = existingQuote.join(' ');
            if (identifier === oldIdentifier) {
                return newVersion;
            }
            return existingQuote;
        });

        if (isNew(oldIdentifier)) {
            alteredQuotes.push(newVersion);
        }

        return alteredQuotes;
    }
    return [newVersion]
}

function editNoteOrQuote(noteType, oldIdentifier, newVersion, poemName) {
    // Gets the converted Poems object from file
    const convertedPoemsJSON = fs.readFileSync('./convertedPoems.json', {encoding: 'utf-8'});
    const convertedPoems = JSON.parse(convertedPoemsJSON);

    // Edit notes or quotes accordingly
    if (noteType === 'Note') {
        const existingNotes = convertedPoems[poemName].notes;
        const poemContent = convertedPoems[poemName].convertedPoem
        const alteredNotes = editNote(existingNotes, oldIdentifier, newVersion, poemContent);
        convertedPoems[poemName].notes = alteredNotes
    } else if (noteType === 'Quote') {
        const existingQuotes = convertedPoems[poemName].quotes;
        const alteredQuotes = editQuote(existingQuotes, oldIdentifier, newVersion);
        convertedPoems[poemName].quotes = alteredQuotes;
    }

    // Write the converted poems object back to file
    fs.writeFile('./convertedPoems.json', JSON.stringify(convertedPoems), (err) => {if (err) {throw err;} else {console.log('\nUpdate complete')}})
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

module.exports = handlePost;